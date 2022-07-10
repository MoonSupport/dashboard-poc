import { OPEN_API, OPEN_API_RESULT } from "../api";
import { FIVE_SECONDS, HOUR } from "../constants";
import { mockDashboardConfig, mockDashboardConfigSpotKeys } from "../fixtures";
import { ChartTable } from "../types";
import DashBoardClient from "./DashBoardClient";

describe("[DashBoardClient]", () => {
  const mockSpot = jest.fn();
  const mockSerise = jest.fn();
  const mockGetPath = jest.fn();

  const mockApi = {
    spot: mockSpot,
    series: mockSerise,
    getPath: mockGetPath,
  } as OPEN_API;

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
        key: "key",
        type: "",
        name: "test",
      })
    );
    mockSerise.mockImplementation(() =>
      Promise.resolve({
        key: "key",
        type: "json",
        name: "test",
      })
    );

    const mockApi = {
      spot: mockSpot,
      series: mockSerise,
      getPath: mockGetPath,
    } as OPEN_API;
    const now = Date.now();
    const dashboardClient = new DashBoardClient(
      mockApi,
      Object.assign(mockDashboardConfig, { time: now })
    );
    const DUPLICATED_COUNT = 1;

    await dashboardClient.fetch();
    // 첫번째 실행 인자  = act_dbc
    expect(mockSpot).toBeCalledWith("act_dbc");
    expect(mockSpot).toBeCalledTimes(
      mockDashboardConfigSpotKeys.length - DUPLICATED_COUNT
    );
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
    } as OPEN_API;
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
    } as OPEN_API;
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
    const initNow = Date.now();
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
      time: initNow + FIVE_SECONDS,
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
            time: initNow,
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
    } as OPEN_API;
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
            time: initNow + FIVE_SECONDS,
          },
        ],
        retrievedTotal: 1110,
        total: 1110,
      },
      type: "json",
      key: "exception/{stime}/{etime}",
      name: "Exception 발생",
    };
    mockApi.spot = (key: any) => Promise.resolve(updateSpotValue) as any;
    mockApi.series = (key: any) => Promise.resolve(updateSeriseValue) as any;

    const expectedSeriseValue = JSON.parse(JSON.stringify(updateSeriseValue));
    expectedSeriseValue.data.records = [
      shouldLeftRecord,
      ...updateSeriseValue.data.records,
    ];

    const updatedChartTable = (await dashboardClient.refetch(
      initNow + FIVE_SECONDS,
      initNow
    )) as ChartTable;

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
    const spotValue = {
      key: "act_agent",
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
              spot: ["act_agent"],
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
    mockApi.spot = (key: any) => Promise.reject(reason);
    const fail = await dashBoardClient.refetch(
      Date.now() + FIVE_SECONDS,
      Date.now() + FIVE_SECONDS * 2
    );

    expect(fail).toStrictEqual({
      act_agent: {
        status: "fulfilled",
        value: spotValue,
      },
    });
  });

  test("serise api에서 fetch/refetch가 성공 후에 refetch가 실패 시에, 기존 상태 데이터를 그대로 유지한다. {성공, 실패}", async () => {
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
      key: "exception/{stime}/{etime}",
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
              serise: ["exception/{stime}/{etime}"],
            },
          },
        ],
      })
    );
    const success = await dashBoardClient.fetch();
    expect(success).toStrictEqual({
      "exception/{stime}/{etime}": {
        status: "fulfilled",
        value: seriseValue,
      },
    });
    const reason = "Too many Request";
    mockApi.series = (key: any) => Promise.reject(reason);
    const fail = await dashBoardClient.refetch(
      Date.now() + FIVE_SECONDS,
      Date.now() + FIVE_SECONDS * 2
    );

    expect(fail).toStrictEqual({
      "exception/{stime}/{etime}": {
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
    } as OPEN_API;
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

    await dashboardClient.refetch(now, now);
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
    } as OPEN_API;
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

    await dashboardClient.refetch(now, now);
    expect(fetchResult["exception/{stime}/{etime}"]).toStrictEqual({
      status: "fulfilled",
      value: seriseValue,
    });
  });

  test("serise api에서 fetch가 실패한 후에 refetch가 성공할 시에, 적절하게 업데이트 된다. {첫 성공, 실패, 실패, 실패, 성공}", async () => {
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
            time: Date.now(),
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
    } as OPEN_API;
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
    mockApi.series = (key: any) => Promise.reject(reason);

    await dashboardClient.refetch(
      Date.now() + FIVE_SECONDS,
      Date.now() + FIVE_SECONDS * 2
    );
    await dashboardClient.refetch(
      Date.now() + FIVE_SECONDS * 2,
      Date.now() + FIVE_SECONDS * 3
    );
    await dashboardClient.refetch(
      Date.now() + FIVE_SECONDS * 3,
      Date.now() + FIVE_SECONDS * 4
    );

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
            time: Date.now() + FIVE_SECONDS * 2,
          },
        ],
        retrievedTotal: 1110,
        total: 1110,
      },
      type: "json",
      key: "exception/{stime}/{etime}",
      name: "Exception 발생",
    } as OPEN_API_RESULT<"json">;
    mockApi.series = (key: any) => Promise.resolve(seriseValue2);

    const result = await dashboardClient.refetch(
      Date.now() + FIVE_SECONDS * 4,
      Date.now() + FIVE_SECONDS * 5
    );
    expect(result).toStrictEqual({
      "exception/{stime}/{etime}": {
        status: "fulfilled",
        value: seriseValue2,
      },
    });
  });
});
