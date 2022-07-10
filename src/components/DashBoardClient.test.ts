import { OPEN_API } from "../api";
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

  test("constructor는 설정에 맞는 Spot과 Serise 파라미터를 생성 한다.", () => {
    const now = Date.now();
    const dashboardClient = new DashBoardClient(
      mockApi,
      Object.assign(mockDashboardConfig, { time: now })
    );

    expect(dashboardClient.requestedSpot).toEqual(mockDashboardConfigSpotKeys);
    expect(dashboardClient.requestedSerise).toEqual([
      {
        key: "exception/{stime}/{etime}",
        param: {
          stime: now - HOUR,
          etime: now,
        },
      },
    ]);
  });

  test("fetch시 요청한 타입의 api가 실행 된다.", () => {
    const mockSpot = jest.fn();
    const mockSerise = jest.fn();
    const mockGetPath = jest.fn();

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

    dashboardClient.fetch();
    // 첫번째 실행 인자  = act_dbc
    expect(mockSpot).toBeCalledWith("act_dbc");
    expect(mockSpot).toBeCalledTimes(mockDashboardConfigSpotKeys.length);
    expect(mockSerise).toBeCalledWith("exception/{stime}/{etime}", {
      stime: now - HOUR,
      etime: now,
    });
  });

  test("fetch시 Promise<ChartTable>의 결과가 반환 된다.", async () => {
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

  test("update 시 업데이트 된 Promise<ChartTable>의 결과가 반환된다.", async () => {
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
      time: initNow + FIVE_SECONDS + 1,
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

  test("fetch에 reject된 spot에 대해서 다음 update시에 최신 값으로 반영된다.", async () => {
    const initNow = Date.now();
    const spotValue = "Too many Request";
    const seriseValue = {
      data: {
        records: [
          {
            classHash: -1811136020,
            msg: "Sql Exception",
            count: 4,
            time: initNow,
            okindNames: ["demo-okind-0"],
          },
        ],
        retrievedTotal: 1110,
        total: 1110,
      },
      type: "json",
      key: "exception/{stime}/{etime}",
      name: "Exception 발생",
    };
    const mockSpot = (key: any) => Promise.reject(spotValue);
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
    const fetchResult = await dashboardClient.fetch();
    expect(fetchResult.act_agent).toStrictEqual({
      reason: "Too many Request",
      status: "rejected",
    });
    expect(fetchResult["exception/{stime}/{etime}"]).toStrictEqual({
      status: "fulfilled",
      value: {
        data: {
          records: [
            {
              classHash: -1811136020,
              count: 4,
              msg: "Sql Exception",
              okindNames: ["demo-okind-0"],
              time: initNow,
            },
          ],
          retrievedTotal: 1110,
          total: 1110,
        },
        key: "exception/{stime}/{etime}",
        name: "Exception 발생",
        type: "json",
      },
    });

    // await dashboardClient.refetch()
  });
});
