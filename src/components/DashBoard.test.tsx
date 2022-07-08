import { mockResDatas } from "../fixtures";
import { createModel, serializeChartTable } from "./DashBoard";

describe("[DashBoard]", () => {
  describe("serializeChartTable", () => {
    test("성공한 res에 대해서 ChartTable를 반환한다.", async () => {
      const mockRes = mockResDatas.map((data) => Promise.resolve(data));
      const promisedAllResult = await Promise.allSettled(mockRes);

      const result = serializeChartTable(
        ["act_agent", "act_dbc", "exception/{stime}/{etime}"],
        promisedAllResult
      );

      expect(result).toEqual({
        act_agent: {
          status: "fulfilled",
          value: {
            data: 12,
            key: "act_agent",
            name: "활성화 상태의 에이전트 수",
            type: "",
          },
        },
        act_dbc: {
          status: "fulfilled",
          value: {
            data: 12,
            key: "act_dbc",
            name: "액티브 DB Connection 수",
            type: "",
          },
        },
        "exception/{stime}/{etime}": {
          status: "fulfilled",
          value: {
            data: {
              record: [
                {
                  class: "java.sql.SQLException",
                  classHash: -52535353,
                  count: 5,
                  msg: "Sql Exception",
                  oids: [1135435, -2349324, -5386],
                  okindNames: ["g.demoAgent"],
                  okinds: [-2309329032],
                },
              ],
              retrievedTotal: 1110,
              time: 1657265100000,
              total: 1110,
            },
            key: "exception/{stime}/{etime}",
            name: "Exception 발생",
            type: "serise",
          },
        },
      });
    });

    test("일부 실패한 res에 대해서 reject을 포함한 ChartTable를 반환한다.", async () => {
      const mockRes = mockResDatas.map((data, index) =>
        index == 0 ? Promise.reject(`Error`) : Promise.resolve(data)
      );
      const promisedAllResult = await Promise.allSettled(mockRes);

      const result = serializeChartTable(
        ["act_agent", "act_dbc", "exception/{stime}/{etime}"],
        promisedAllResult
      );

      expect(result).toEqual({
        act_agent: {
          status: "rejected",
          reason: "Error",
        },
        act_dbc: {
          status: "fulfilled",
          value: {
            data: 12,
            key: "act_dbc",
            name: "액티브 DB Connection 수",
            type: "",
          },
        },
        "exception/{stime}/{etime}": {
          status: "fulfilled",
          value: {
            data: {
              record: [
                {
                  class: "java.sql.SQLException",
                  classHash: -52535353,
                  count: 5,
                  msg: "Sql Exception",
                  oids: [1135435, -2349324, -5386],
                  okindNames: ["g.demoAgent"],
                  okinds: [-2309329032],
                },
              ],
              retrievedTotal: 1110,
              time: 1657265100000,
              total: 1110,
            },
            key: "exception/{stime}/{etime}",
            name: "Exception 발생",
            type: "serise",
          },
        },
      });
    });
  });

  describe("model method", () => {
    test("findByKey로 원하는 키에 해당하는 값을 얻는다.", () => {
      const model = createModel({
        test: {
          id: 1,
          name: "test",
        },
        mock: {
          values: [1, 2, 3, 4],
        },
      });

      expect(model.findByKey("mock")).toEqual({ values: [1, 2, 3, 4] });
    });

    test("bulkFindByKeys로 원하는 여러 키에 해당하는 값을 얻는다.", () => {
      const model = createModel({
        test: {
          id: 1,
          name: "test",
        },
        mock: {
          values: [1, 2, 3, 4],
        },
        mock2: {
          values: [1, 2, 3, 4],
        },
      });

      expect(model.bulkFindByKeys(["test", "mock"])).toEqual([
        { id: 1, name: "test" },
        { values: [1, 2, 3, 4] },
      ]);
    });
  });
});
