import { FIVE_MINIUTES, FIVE_SECONDS } from "../constants";
import { OPEN_API_RESULT } from "../types";
import { buildLineChartData, ExceptionRecord } from "./ExceptionDataProvider";

describe("[ExceptionDataProvider]", () => {
  describe("buildLineChartData", () => {
    const _now = Date.now;
    beforeEach(() => {
      Date.now = jest.fn(() => new Date(2022, 1, 1, 3, 30, 0).getTime());
    });

    afterEach(() => {
      Date.now = _now;
    });
    test("값이 없을 때, 빈 객체를 리턴한다.", () => {
      const result = buildLineChartData(undefined as any, {
        interval: FIVE_MINIUTES,
      });

      expect(result).toEqual({});
    });

    test("api가 reject 일때, 빈 객체를 리턴한다.", () => {
      const result = buildLineChartData(
        {
          status: "rejected",
          reason: "rejected",
        } as PromiseRejectedResult,
        {
          interval: FIVE_MINIUTES,
        }
      );

      expect(result).toEqual({});
    });

    test("antd 차트에 사용할 데이터를 가공한다.", async () => {
      const openApiResult = {
        key: "exception/{stime}/{etime}",
        type: "json",
        name: "name",
        data: {
          records: [
            {
              time: Date.now(),
              msg: "Internal RuntimeException",
              onames: ["IOname"],
              count: 10,
            },
            {
              time: Date.now() + FIVE_MINIUTES,
              msg: "Internal RuntimeException",
              onames: ["IOname"],
              count: 15,
            },
            {
              time: Date.now() + FIVE_MINIUTES * 2,
              msg: "Internal RuntimeException",
              onames: ["IOname"],
              count: 20,
            },
          ] as ExceptionRecord[],
          retrievedTotal: 10,
          total: 10,
        },
      } as OPEN_API_RESULT<"json">;
      const promiseSettledResults = await Promise.allSettled([
        Promise.resolve(openApiResult),
      ]);
      const result = buildLineChartData(promiseSettledResults[0], {
        interval: FIVE_MINIUTES,
      });

      expect(result).toEqual({
        "Internal RuntimeException": [
          { key: "IOname", count: 10, time: "03:30" },
          { key: "IOname", count: 15, time: "03:35" },
          { key: "IOname", count: 20, time: "03:40" },
        ],
      });
    });

    test("records가 중복이라면 count를 합친 결과를 반한다.", async () => {
      const openApiResult = {
        key: "exception/{stime}/{etime}",
        type: "json",
        name: "name",
        data: {
          records: [
            {
              time: Date.now(),
              msg: "Internal RuntimeException",
              onames: ["IOname"],
              count: 10,
            },
            {
              time: Date.now() + FIVE_MINIUTES,
              msg: "Internal RuntimeException",
              onames: ["IOname"],
              count: 15,
            },
            {
              time: Date.now() + FIVE_MINIUTES,
              msg: "Internal RuntimeException",
              onames: ["IOname"],
              count: 20,
            },
          ] as ExceptionRecord[],
          retrievedTotal: 10,
          total: 10,
        },
      } as OPEN_API_RESULT<"json">;
      const promiseSettledResults = await Promise.allSettled([
        Promise.resolve(openApiResult),
      ]);
      const result = buildLineChartData(promiseSettledResults[0], {
        interval: FIVE_MINIUTES,
      });

      expect(result).toEqual({
        "Internal RuntimeException": [
          { key: "IOname", count: 10, time: "03:30" },
          { key: "IOname", count: 35, time: "03:35" },
        ],
      });
    });

    test("다른 타입의 에러를 구별하여 결과를 반환한다.", async () => {
      const openApiResult = {
        key: "exception/{stime}/{etime}",
        type: "json",
        name: "name",
        data: {
          records: [
            {
              time: Date.now(),
              msg: "Internal RuntimeException",
              onames: ["IOname"],
              count: 10,
            },
            {
              time: Date.now(),
              msg: "Sql Exception",
              onames: ["IOname"],
              count: 15,
            },
            {
              time: Date.now(),
              msg: "Unknown Error!!",
              onames: ["IOname"],
              count: 20,
            },
          ] as ExceptionRecord[],
          retrievedTotal: 10,
          total: 10,
        },
      } as OPEN_API_RESULT<"json">;
      const promiseSettledResults = await Promise.allSettled([
        Promise.resolve(openApiResult),
      ]);
      const result = buildLineChartData(promiseSettledResults[0], {
        interval: FIVE_MINIUTES,
      });

      expect(result).toEqual({
        "Internal RuntimeException": [{ key: "IOname", count: 10, time: "03:30" }],
        "Sql Exception": [{ key: "IOname", count: 15, time: "03:30" }],
        "Unknown Error!!": [{ key: "IOname", count: 20, time: "03:30" }],
      });
    });

    test("간격 내에 비어 있는 시간이 있을 경우에 count 0을 채워넣은 결과를 반환한다.", async () => {
      const openApiResult = {
        key: "exception/{stime}/{etime}",
        type: "json",
        name: "name",
        data: {
          records: [
            {
              time: Date.now(),
              msg: "Internal RuntimeException",
              onames: ["IOname"],
              count: 10,
            },
            {
              time: Date.now() + FIVE_MINIUTES,
              msg: "Sql Exception",
              onames: ["IOname"],
              count: 15,
            },
            {
              time: Date.now() + FIVE_MINIUTES * 2,
              msg: "Unknown Error!!",
              onames: ["IOname"],
              count: 20,
            },
          ] as ExceptionRecord[],
          retrievedTotal: 10,
          total: 10,
        },
      } as OPEN_API_RESULT<"json">;
      const promiseSettledResults = await Promise.allSettled([
        Promise.resolve(openApiResult),
      ]);
      const result = buildLineChartData(promiseSettledResults[0], {
        interval: FIVE_MINIUTES,
      });

      expect(result).toEqual({
        "Internal RuntimeException": [
          { count: 10, key: "IOname", time: "03:30" },
          { count: 0, key: "IOname", time: "03:35" },
          { count: 0, key: "IOname", time: "03:40" },
        ],
        "Sql Exception": [
          { count: 0, key: "IOname", time: "03:30" },
          { count: 15, key: "IOname", time: "03:35" },
          { count: 0, key: "IOname", time: "03:40" },
        ],
        "Unknown Error!!": [
          { count: 0, key: "IOname", time: "03:30" },
          { count: 0, key: "IOname", time: "03:35" },
          { count: 20, key: "IOname", time: "03:40" },
        ],
      });
    });

    test("잘못된 interval을 입력할 시에 일정 횟수 이상이면 중단 됨", async () => {
      const openApiResult = {
        key: "exception/{stime}/{etime}",
        type: "json",
        name: "name",
        data: {
          records: [
            {
              time: Date.now(),
              msg: "Internal RuntimeException",
              onames: ["IOname"],
              count: 10,
            },
            {
              time: Date.now() + FIVE_MINIUTES,
              msg: "Sql Exception",
              onames: ["IOname"],
              count: 15,
            },
            {
              time: Date.now() + FIVE_MINIUTES * 2,
              msg: "Unknown Error!!",
              onames: ["IOname"],
              count: 20,
            },
          ] as ExceptionRecord[],
          retrievedTotal: 10,
          total: 10,
        },
      } as OPEN_API_RESULT<"json">;
      const promiseSettledResults = await Promise.allSettled([
        Promise.resolve(openApiResult),
      ]);
      expect(() =>
        buildLineChartData(promiseSettledResults[0], {
          interval: 0,
        })
      ).toThrowError("반복 횟수가 너무 많습니다.");
    });
  });
});
