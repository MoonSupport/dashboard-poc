import { FIVE_MINIUTES, FIVE_SECONDS, HOUR, SECOND } from "../constants";
import { mockDashboardConfig } from "../fixtures";
import { IOPEN_API, OPEN_API_RESULT, PromiseSettleResultTable } from "../types";
import DashBoardClient from "./DashBoardClient";

describe("[DashBoardClient]", () => {
  const mockSpot = jest.fn();
  const mockSerise = jest.fn();
  const mockGetPath = jest.fn();

  const mockApi = {
    spot: mockSpot,
    series: mockSerise,
    getPath: mockGetPath,
  } as IOPEN_API;

  const _now = Date.now;

  beforeEach(() => {
    const now = Date.now();
    Date.now = jest.fn(() => now);
  });

  afterEach(() => {
    Date.now = _now;
  });

  test("fetch시 요청한 타입의 api가 실행 된다. 이 떄, 중복된 키는 두 번 실행하지 않는다.", async () => {
    const mockSpot = jest.fn();
    const mockSerise = jest.fn();
    const mockGetPath = jest.fn();
    mockSpot.mockImplementation(() =>
      Promise.resolve({
        key: "act_agent",
        type: "",
        name: "test",
      })
    );
    mockSerise.mockImplementation(() =>
      Promise.resolve({
        key: "exception/{stime}/{etime}",
        type: "json",
        name: "test",
      })
    );

    const mockApi = {
      spot: mockSpot,
      series: mockSerise,
      getPath: mockGetPath,
    } as IOPEN_API;
    const now = Date.now();
    const dashboardClient = new DashBoardClient(
      mockApi,
      Object.assign(mockDashboardConfig, {
        widgets: [
          {
            id: 1,
            name: "자원 사용 여부",
            chart: {
              type: "bar",
              spot: ["act_agent", "act_agent"],
              serise: ["exception/{stime}/{etime}"],
            },
          },
        ],
      })
    );
    const DUPLICATED_COUNT = 1;

    await dashboardClient.fetch();
    // 첫번째 실행 인자  = act_agent
    expect(mockSpot).toBeCalledWith("act_agent");
    expect(mockSpot).toBeCalledTimes(2 - DUPLICATED_COUNT);
    expect(mockSerise).toBeCalledWith("exception/{stime}/{etime}", {
      stime: now - HOUR,
      etime: now,
    });
  });

  test("fetch시 Promise<ChartTable>의 결과가 반환 된다. {성공}", async () => {
    const spotValue = {
      key: "act_agent",
      type: "",
      name: "활성화 상태의 에이전트 수",
      data: 12,
    };
    const seriseValue = {
      data: {
        records: [
          {
            class: "java.sql.SQLException",
            classHash: -52535353,
            count: 5,
            msg: "Sql Exception",
            oids: [1135435, -2349324, -5386],
            okindNames: ["g.demoAgent"],
            okinds: [-2309329032],
            time: 1657265100000,
          },
        ],
        retrievedTotal: 1110,
        total: 1110,
      },
      type: "json",
      key: "exception/{stime}/{etime}",
      name: "Exception 발생",
    };
    const mockSpot = (key: any) => Promise.resolve(spotValue);
    const mockSerise = (key: any) => Promise.resolve(seriseValue);
    const mockApi = {
      spot: mockSpot as any,
      series: mockSerise as any,
      getPath: mockGetPath,
    } as IOPEN_API;
    const now = Date.now();
    const dashboardClient = new DashBoardClient(
      mockApi,
      Object.assign(mockDashboardConfig, {
        widgets: [
          {
            id: 1,
            name: "자원 사용 여부",
            chart: {
              type: "bar",
              spot: ["act_agent"],
              serise: ["exception/{stime}/{etime}"],
            },
          },
        ],
        time: now,
      })
    );

    const chartTable = await dashboardClient.fetch();

    expect(chartTable["act_agent"]).toEqual({
      status: "fulfilled",
      value: spotValue,
    });
    expect(chartTable["exception/{stime}/{etime}"]).toEqual({
      status: "fulfilled",
      value: seriseValue,
    });
  });

  test("fetch가 실패한다면 rejected상태와 에러의 이유를 반환한다. {실패}", async () => {
    const spotValue = {
      key: "act_agent",
      reason: "Too Many Request",
    };
    const seriseValue = {
      key: "exception/{stime}/{etime}",
      reason: "Too Many Request",
    };
    const mockSpot = (key: any) => Promise.reject(spotValue);
    const mockSerise = (key: any) => Promise.reject(seriseValue);
    const mockApi = {
      spot: mockSpot as any,
      series: mockSerise as any,
      getPath: mockGetPath,
    } as IOPEN_API;
    const now = Date.now();
    const dashboardClient = new DashBoardClient(
      mockApi,
      Object.assign(mockDashboardConfig, {
        widgets: [
          {
            id: 1,
            name: "자원 사용 여부",
            chart: {
              type: "bar",
              spot: ["act_agent"],
              serise: ["exception/{stime}/{etime}"],
            },
          },
        ],
        time: now,
      })
    );

    const chartTable = await dashboardClient.fetch();

    expect(chartTable["act_agent"]).toEqual({
      status: "rejected",
      reason: spotValue,
    });
    expect(chartTable["exception/{stime}/{etime}"]).toEqual({
      status: "rejected",
      reason: seriseValue,
    });
  });

  test("refetch시에 새로운 값이 record에 갱신된다. series라면 stime이하는 제거되고 새로운 값이 record에 추가 된다. {성공, 성공}", async () => {
    const now = Date.now();

    const spotValue = {
      key: "act_agent",
      type: "",
      name: "활성화 상태의 에이전트 수",
      data: 12,
    };
    const shouldLeftRecord = {
      class: "SHOULD LEFT DATA - 1",
      classHash: -52535353,
      count: 5,
      msg: "Sql Exception",
      oids: [1135435, -2349324, -5386],
      okindNames: ["g.demoAgent"],
      okinds: [-2309329032],
      time: now + FIVE_SECONDS - HOUR, // 1시간 전에서 5초 지남
    };
    const seriseValue = {
      data: {
        records: [
          {
            class: "OLD DATA - 1",
            classHash: -52535353,
            count: 5,
            msg: "Sql Exception",
            oids: [1135435, -2349324, -5386],
            okindNames: ["g.demoAgent"],
            okinds: [-2309329032],
            time: now - HOUR, // 1시간 전
          },
          shouldLeftRecord,
        ],
        retrievedTotal: 1110,
        total: 1110,
      },
      type: "json",
      key: "exception/{stime}/{etime}",
      name: "Exception 발생",
    };
    const mockSpot = (key: any) => Promise.resolve(spotValue);
    const mockSerise = (key: any) => Promise.resolve(seriseValue);
    const mockApi = {
      spot: mockSpot as any,
      series: mockSerise as any,
      getPath: mockGetPath,
    } as IOPEN_API;
    const dashboardClient = new DashBoardClient(
      mockApi,
      Object.assign(mockDashboardConfig, {
        widgets: [
          {
            id: 1,
            name: "자원 사용 여부",
            chart: {
              type: "bar",
              spot: ["act_agent"],
              serise: ["exception/{stime}/{etime}"],
            },
          },
        ],
        time: now,
      })
    );
    await dashboardClient.fetch();
    const updateSpotValue = {
      key: "act_agent",
      type: "",
      name: "활성화 상태의 에이전트 수",
      data: 15,
    };
    const updateSeriseValue = {
      data: {
        records: [
          {
            class: "new Serise Value",
            classHash: -52535353,
            count: 10,
            msg: "Sql Exception",
            oids: [1135435, -2349324, -5386],
            okindNames: ["g.demoAgent"],
            okinds: [-2309329032],
            time: now + FIVE_SECONDS, // 현재 시간에서 5초 지남
          },
        ],
        retrievedTotal: 1110,
        total: 1110,
      },
      type: "json",
      key: "exception/{stime}/{etime}",
      name: "Exception 발생",
    };
    mockApi.spot = (_: any) => Promise.resolve(updateSpotValue) as any;
    mockApi.series = (_: any) => Promise.resolve(updateSeriseValue) as any;

    const expectedSeriseValue = JSON.parse(JSON.stringify(updateSeriseValue));
    expectedSeriseValue.data.records = [
      shouldLeftRecord,
      ...updateSeriseValue.data.records,
    ];

    Date.now = jest.fn(() => now + FIVE_SECONDS); // 현재 시간에서 5초 지남

    const updatedChartTable =
      (await dashboardClient.refetch()) as PromiseSettleResultTable<
        OPEN_API_RESULT<""> | OPEN_API_RESULT<"json">
      >;

    expect(updatedChartTable["act_agent"]).toEqual({
      status: "fulfilled",
      value: updateSpotValue,
    });
    expect(updatedChartTable["exception/{stime}/{etime}"]).toEqual({
      status: "fulfilled",
      value: expectedSeriseValue,
    });
  });

  test("spot api에서 fetch/refetch가 성공 후에 refetch가 실패 시에, 기존 상태 데이터를 그대로 유지한다. {성공, 실패}", async () => {
    const spotKey = "act_agent";
    const spotValue = {
      key: spotKey,
      type: "",
      name: "활성화 상태의 에이전트 수",
      data: 12,
    } as OPEN_API_RESULT<"">;

    const mockApi = {
      spot: (key: any) => Promise.resolve(spotValue),
      series: mockSerise,
      getPath: mockGetPath,
    };
    const dashBoardClient = new DashBoardClient(
      mockApi,
      Object.assign(mockDashboardConfig, {
        widgets: [
          {
            id: 1,
            name: "자원 사용 여부",
            chart: {
              type: "bar",
              spot: [spotKey],
              serise: [],
            },
          },
        ],
      })
    );
    const success = await dashBoardClient.fetch();
    expect(success).toStrictEqual({
      act_agent: {
        status: "fulfilled",
        value: spotValue,
      },
    });
    const reason = "Too many Request";
    mockApi.spot = (key: any) =>
      Promise.reject({
        key: spotKey,
        reason,
      });
    const fail = await dashBoardClient.refetch();

    expect(fail).toStrictEqual({
      act_agent: {
        status: "fulfilled",
        value: spotValue,
      },
    });
  });

  test("serise api에서 fetch/refetch가 성공 후에 refetch가 실패 시에, 기존 상태 데이터를 그대로 유지한다. {성공, 실패}", async () => {
    const seriseKey = "exception/{stime}/{etime}";
    const seriseValue = {
      data: {
        records: [
          {
            class: "OLD DATA - 1",
            classHash: -52535353,
            count: 5,
            msg: "Sql Exception",
            oids: [1135435, -2349324, -5386],
            okindNames: ["g.demoAgent"],
            time: Date.now() + FIVE_SECONDS,
          },
        ],
        retrievedTotal: 1110,
        total: 1110,
      },
      type: "json",
      key: seriseKey,
      name: "Exception 발생",
    } as OPEN_API_RESULT<"json">;

    const mockApi = {
      spot: mockSpot,
      series: (key: any) => Promise.resolve(seriseValue),
      getPath: mockGetPath,
    };
    const dashBoardClient = new DashBoardClient(
      mockApi,
      Object.assign(mockDashboardConfig, {
        widgets: [
          {
            id: 1,
            name: "자원 사용 여부",
            chart: {
              type: "bar",
              spot: [],
              serise: [seriseKey],
            },
          },
        ],
      })
    );
    const success = await dashBoardClient.fetch();
    expect(success).toStrictEqual({
      [seriseKey]: {
        status: "fulfilled",
        value: seriseValue,
      },
    });
    const reason = "Too many Request";
    mockApi.series = (key: any) => Promise.reject({ key: seriseKey, reason });
    const fail = await dashBoardClient.refetch();

    expect(fail).toStrictEqual({
      [seriseKey]: {
        status: "fulfilled",
        value: seriseValue,
      },
    });
  });

  test("spot api에서 fetch가 실패한 후에 refetch가 성공할 시에, 적절하게 업데이트 된다. {실패, 성공}", async () => {
    const reason = "Too many Request";
    const mockRejectSpot = (key: any) =>
      Promise.reject({
        key,
        reason,
      });
    const mockApi = {
      spot: mockRejectSpot as any,
      series: mockSerise as any,
      getPath: mockGetPath,
    } as IOPEN_API;
    const now = Date.now();
    const dashboardClient = new DashBoardClient(
      mockApi,
      Object.assign(mockDashboardConfig, {
        widgets: [
          {
            id: 1,
            name: "자원 사용 여부",
            chart: {
              type: "bar",
              spot: ["act_agent"],
              serise: [],
            },
          },
        ],
      })
    );
    const fetchResult = await dashboardClient.fetch();
    expect(fetchResult.act_agent).toStrictEqual({
      reason: { key: "act_agent", reason: "Too many Request" },
      status: "rejected",
    });
    const spotValue = {
      key: "act_agent",
      type: "",
      name: "활성화 상태의 에이전트 수",
      data: 12,
    };
    const mockSpot = (key: any) => Promise.resolve(spotValue);
    mockApi.spot = mockSpot as any;

    await dashboardClient.refetch();
    expect(fetchResult.act_agent).toStrictEqual({
      status: "fulfilled",
      value: {
        data: 12,
        key: "act_agent",
        name: "활성화 상태의 에이전트 수",
        type: "",
      },
    });
  });

  test("serise api에서 fetch가 실패한 후에 refetch가 성공할 시에, 적절하게 업데이트 된다. {실패, 첫 성공}", async () => {
    const reason = "Too many Request";
    const mockRejectSerise = (key: any) =>
      Promise.reject({
        key,
        reason,
      });
    const mockApi = {
      spot: mockSpot as any,
      series: mockRejectSerise as any,
      getPath: mockGetPath,
    } as IOPEN_API;
    const now = Date.now();
    const dashboardClient = new DashBoardClient(
      mockApi,
      Object.assign(mockDashboardConfig, {
        widgets: [
          {
            id: 1,
            name: "자원 사용 여부",
            chart: {
              type: "bar",
              spot: [],
              serise: ["exception/{stime}/{etime}"],
            },
          },
        ],
      })
    );
    const fetchResult = await dashboardClient.fetch();
    expect(fetchResult["exception/{stime}/{etime}"]).toStrictEqual({
      reason: { key: "exception/{stime}/{etime}", reason: "Too many Request" },
      status: "rejected",
    });
    const seriseValue = {
      data: {
        records: [
          {
            class: "OLD DATA - 1",
            classHash: -52535353,
            count: 5,
            msg: "Sql Exception",
            oids: [1135435, -2349324, -5386],
            okindNames: ["g.demoAgent"],
            okinds: [-2309329032],
            time: now + FIVE_SECONDS,
          },
        ],
        retrievedTotal: 1110,
        total: 1110,
      },
      type: "json",
      key: "exception/{stime}/{etime}",
      name: "Exception 발생",
    };
    const mockSerise = (key: any) => Promise.resolve(seriseValue);
    mockApi.series = mockSerise as any;

    await dashboardClient.refetch();
    expect(fetchResult["exception/{stime}/{etime}"]).toStrictEqual({
      status: "fulfilled",
      value: seriseValue,
    });
  });

  test("serise api에서 fetch가 실패한 후에 refetch가 성공할 시에, 적절하게 업데이트 된다. {첫 성공, 실패, 실패, 실패, 성공}", async () => {
    const now = Date.now();
    const seriseValue = {
      data: {
        records: [
          {
            class: "OLD DATA - 1",
            classHash: -52535353,
            count: 5,
            msg: "Sql Exception",
            oids: [1135435, -2349324, -5386],
            okindNames: ["g.demoAgent"],
            time: now - HOUR,
          },
        ],
        retrievedTotal: 1110,
        total: 1110,
      },
      type: "json",
      key: "exception/{stime}/{etime}",
      name: "Exception 발생",
    } as OPEN_API_RESULT<"json">;
    const mockRejectSerise = (key: any) => Promise.resolve(seriseValue);
    const mockApi = {
      spot: mockSpot as any,
      series: mockRejectSerise as any,
      getPath: mockGetPath,
    } as IOPEN_API;
    const dashboardClient = new DashBoardClient(
      mockApi,
      Object.assign(mockDashboardConfig, {
        widgets: [
          {
            id: 1,
            name: "자원 사용 여부",
            chart: {
              type: "bar",
              spot: [],
              serise: ["exception/{stime}/{etime}"],
            },
          },
        ],
      })
    );
    const fetchResult = await dashboardClient.fetch();
    expect(fetchResult["exception/{stime}/{etime}"]).toStrictEqual({
      status: "fulfilled",
      value: seriseValue,
    });
    const reason = "Too Many Request";
    mockApi.series = (key: any) =>
      Promise.reject({
        key,
        reason,
      });
    Date.now = jest.fn(() => now + FIVE_SECONDS);
    await dashboardClient.refetch();
    Date.now = jest.fn(() => now + FIVE_SECONDS * 2);
    await dashboardClient.refetch();
    Date.now = jest.fn(() => now + FIVE_SECONDS * 3);
    await dashboardClient.refetch();
    const seriseValue2 = {
      data: {
        records: [
          {
            class: "NEXT_LEV - 1",
            classHash: -52535353,
            count: 5,
            msg: "Sql Exception",
            oids: [1135435, -2349324, -5386],
            okindNames: ["g.demoAgent"],
            time: now - HOUR + FIVE_SECONDS * 4,
          },
        ],
        retrievedTotal: 1110,
        total: 1110,
      },
      type: "json",
      key: "exception/{stime}/{etime}",
      name: "Exception 발생",
    } as OPEN_API_RESULT<"json">;
    const mockSerise = jest.fn();
    mockApi.series = mockSerise;
    mockSerise.mockImplementation((key: any) => Promise.resolve(seriseValue2));
    const nextTime = now + FIVE_SECONDS * 4;
    Date.now = jest.fn(() => nextTime);
    const FAIL_COUNT = 3;

    const result = await dashboardClient.refetch();

    expect(mockSerise).toBeCalledWith("exception/{stime}/{etime}", {
      stime: nextTime - FIVE_SECONDS * (FAIL_COUNT + 1),
      etime: nextTime,
    });
    expect(result).toStrictEqual({
      "exception/{stime}/{etime}": {
        status: "fulfilled",
        value: seriseValue2,
      },
    });
  });

  test("serise api refetch가 일어난 후에, 마지막 fetch시간을 기록해두고 refetch시에 이 시간을 적용하여 호출할 수 있다.", async () => {
    const now = Date.now();
    const seriseValue = {
      data: {
        records: [
          {
            class: "OLD DATA - 1",
            classHash: -52535353,
            count: 5,
            msg: "Sql Exception",
            oids: [1135435, -2349324, -5386],
            okindNames: ["g.demoAgent"],
            time: now - HOUR,
          },
        ],
        retrievedTotal: 1110,
        total: 1110,
      },
      type: "json",
      key: "exception/{stime}/{etime}",
      name: "Exception 발생",
    } as OPEN_API_RESULT<"json">;
    const mockRejectSerise = (key: any) => Promise.resolve(seriseValue);
    const mockApi = {
      spot: mockSpot as any,
      series: mockRejectSerise as any,
      getPath: mockGetPath,
    } as IOPEN_API;
    const dashboardClient = new DashBoardClient(
      mockApi,
      Object.assign(mockDashboardConfig, {
        widgets: [
          {
            id: 1,
            name: "자원 사용 여부",
            chart: {
              type: "bar",
              spot: [],
              serise: ["exception/{stime}/{etime}"],
            },
          },
        ],
      })
    );
    await dashboardClient.fetch();

    const seriseValue1 = {
      data: {
        records: [
          {
            class: "NEXT_LEV - 1",
            classHash: -52535353,
            count: 5,
            msg: "Sql Exception",
            oids: [1135435, -2349324, -5386],
            okindNames: ["g.demoAgent"],
            time: now - HOUR + FIVE_SECONDS,
          },
        ],
        retrievedTotal: 1110,
        total: 1110,
      },
      type: "json",
      key: "exception/{stime}/{etime}",
      name: "Exception 발생",
    } as OPEN_API_RESULT<"json">;
    const mockSerise = jest.fn();
    mockApi.series = mockSerise;
    mockSerise.mockImplementation((key: any) => Promise.resolve(seriseValue1));
    Date.now = jest.fn(() => now + FIVE_SECONDS);

    const result = await dashboardClient.refetch();

    expect(mockSerise).toBeCalledWith("exception/{stime}/{etime}", {
      stime: now,
      etime: now + FIVE_SECONDS,
    });
    expect(result).toStrictEqual({
      "exception/{stime}/{etime}": {
        status: "fulfilled",
        value: seriseValue1,
      },
    });

    // 업데이트 하고 1초 후
    Date.now = jest.fn(() => now + FIVE_SECONDS + SECOND);

    dashboardClient.saveNextFetchTime();
    // 업데이트 하고 5분 후
    Date.now = jest.fn(() => now + FIVE_SECONDS + FIVE_MINIUTES);

    const seriseValue2 = {
      data: {
        records: [
          {
            class: "NEXT_LEV - 1",
            classHash: -52535353,
            count: 5,
            msg: "Sql Exception",
            oids: [1135435, -2349324, -5386],
            okindNames: ["g.demoAgent"],
            time: now - HOUR + FIVE_SECONDS + FIVE_MINIUTES,
          },
        ],
        retrievedTotal: 1110,
        total: 1110,
      },
      type: "json",
      key: "exception/{stime}/{etime}",
      name: "Exception 발생",
    } as OPEN_API_RESULT<"json">;
    const mockSerise2 = jest.fn();
    mockApi.series = mockSerise2;
    mockSerise2.mockImplementation((key: any) => Promise.resolve(seriseValue2));
    await dashboardClient.refetch();

    expect(mockSerise2).toBeCalledWith("exception/{stime}/{etime}", {
      stime: now + FIVE_SECONDS + SECOND,
      etime: now + FIVE_SECONDS + FIVE_MINIUTES,
    });
  });
});
