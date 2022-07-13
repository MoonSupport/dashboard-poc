import { FIVE_SECONDS } from "../constants";
import { DashBoardConfig, OPEN_API_RESULT } from "../types";

export const mockDashboardConfig: DashBoardConfig = {
  id: 1,
  name: "첫번째 대시보드",
  updateInterval: FIVE_SECONDS,
  widgets: [
    {
      id: 1,
      name: "자원 사용 여부",
      chart: {
        type: "bar",
        spot: ["act_dbc", "cpu", "act_sql", "tps"],
        serise: [],
      },
    },
    {
      id: 2,
      name: "활성 상태",
      chart: {
        type: "infomatics",
        spot: ["act_agent", "act_method", "cpu"],
        serise: [],
      },
    },
    {
      id: 3,
      name: "Sql Exception 발생 여부",
      chart: {
        type: "line",
        spot: [],
        serise: ["exception/{stime}/{etime}"],
        seriseKey: "Sql Exception",
      },
    },
    {
      id: 4,
      name: "Internal RuntimeException 발생 여부",
      chart: {
        type: "line",
        spot: [],
        serise: ["exception/{stime}/{etime}"],
        seriseKey: "Internal RuntimeException",
      },
    },
    {
      id: 5,
      name: "Unknown Error!! 발생 여부",
      chart: {
        type: "line",
        spot: [],
        serise: ["exception/{stime}/{etime}"],
        seriseKey: "Unknown Error!!",
      },
    },
  ],
};

export const mockDashboardConfigSpotKeys = [
  "act_dbc",
  "cpu",
  "act_sql",
  "tps",
  "act_agent",
  "act_method",
  "cpu",
];

export const mockDashboardConfigSeriseKeys = ["exception/{stime}/{etime}"];

export const mockDashboardConfigKeys = [
  "act_dbc",
  "cpu",
  "act_sql",
  "tps",
  "act_agent",
  "act_method",
  "cpu",
  "exception/{stime}/{etime}",
];

export const mockResDatas = [
  {
    key: "act_agent",
    type: "",
    name: "활성화 상태의 에이전트 수",
    data: 12,
  },
  {
    type: "",
    key: "act_dbc",
    name: "액티브 DB Connection 수",
    data: 12,
  },
  {
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
      total: 1110,
      time: 1657265100000,
    },
    type: "serise",
    key: "exception/{stime}/{etime}",
    name: "Exception 발생",
  },
] as (OPEN_API_RESULT<""> | OPEN_API_RESULT<"json">)[];
