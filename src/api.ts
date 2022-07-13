import {
  IGetPath,
  ISeriseParam,
  IOPEN_API,
  OPEN_API_KEY,
  OPEN_API_RESULT,
  OPEN_API_TYPE,
} from "./types";

const DEMO_PROJECT_API_TOCKEN = "XGJHUSQZTI2AVIENWA27HI5V";
const DEMO_PROJECT_CODE = "5490";
const OPEN_API_HEADERS = Object.freeze({
  "x-whatap-pcode": DEMO_PROJECT_CODE,
  "x-whatap-token": DEMO_PROJECT_API_TOCKEN,
});

const OPEN_API_ROOT = "https://service.whatap.io/open/api";

export const OPEN_API = {
  "": {
    act_agent: "활성화 상태의 에이전트 수",
    inact_agent: "비활성화 상태의 에이전트 수",
    host: "호스트 수",
    cpucore: "호스트의 CPU 코어 합",
    txcount: "트랜잭션 수",
    tps: "초당 트랜잭션 수",
    user: "5분간 집계된 고유 사용자 수",
    actx: "액티브 트랜잭션 수",
    rtime: "평균 응답 시간",
    cpu: "CPU 사용률",
    threadpool_active: "쓰레드풀 활성 쓰레드 수",
    threadpool_queue: "쓰레드풀 큐잉 쓰레드 수",
    dbc_count: "전체 DB Connection 수",
    dbc_active: "활성(Active) DB Connection 수",
    dbc_idle: "비활성(Idle) DB Connection 수",
    act_method: "액티브 Method 수",
    act_sql: "액티브 SQL 수",
    act_httpc: "액티브 HTTP Call 수",
    act_dbc: "액티브 DB Connection 수",
    act_socket: "액티브 Socket 수",
  },
  json: {
    "exception/{stime}/{etime}": "Exception 발생 ",
    "transaction/{stime}/{etime}": "트랜잭션 발생",
    "visitor_5m/{stime}/{etime}": "활성화된 스레드풀",
  },
};

const getPath: IGetPath = (url, param = {}) => {
  let path = url;
  for (const key in param) {
    // https://github.com/microsoft/TypeScript/issues/13046
    // @ts-ignore
    path = path.replace(new RegExp("\\{" + key + "\\}", "g"), param[key]);
  }

  return path;
};

export interface SERIALIZED_OPEN_API<T extends OPEN_API_TYPE> {
  url: string;
  name: typeof OPEN_API[T][OPEN_API_KEY<T>];
}

export type SERIES_DATA = {
  records: any[];
  retrievedTotal: number;
  total: number;
};

const getOpenApi =
  <T extends OPEN_API_TYPE>(type: T) =>
  (key: OPEN_API_KEY<T>, param?: ISeriseParam) =>
    new Promise<SERIALIZED_OPEN_API<T>>((resolve, reject) => {
      if (key in OPEN_API[type]) {
        const subPath = type === "" ? [key] : [type, key];

        return resolve({
          url: [OPEN_API_ROOT, ...subPath].join("/"),
          name: OPEN_API[type][key],
        });
      } else {
        reject("잘못된 API 정보");
      }
    }).then(({ url, name }) =>
      fetch(getPath(url, param), {
        headers: OPEN_API_HEADERS,
      })
        .then((response) => response.json())
        .then<OPEN_API_RESULT<T>>((data) => ({
          key,
          type,
          name,
          data,
        }))
        .catch((reason) =>
          Promise.reject({
            key,
            reason,
          })
        )
    );

const spot = getOpenApi<"">("");
const series = getOpenApi<"json">("json");

export default { spot, series, getPath } as IOPEN_API;
