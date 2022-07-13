import { OPEN_API } from "./api";

export type ChartType = "infomatics" | "bar" | "line";

export interface DashBoardConfig {
  id: number;
  name: string;
  widgets: WidgetCofig[];
  updateInterval: number;
  seriesWidth?: number;
}

export interface WidgetCofig {
  id: number;
  name: string;
  chart: ChartConfig;
}

export interface ChartConfig {
  type: ChartType;
  spot: OPEN_API_KEY<"">[];
  serise: OPEN_API_KEY<"json">[];
  seriseKey?: string;
}

export type ALL_OPEN_API_KEY = OPEN_API_KEY<""> | OPEN_API_KEY<"json">;

export type PromiseSettleResultTable<T> = {
  // not generic...
  [key in ALL_OPEN_API_KEY]: PromiseSettledResult<T>;
};

export type PromiseSettledOpenApiResult = PromiseSettledResult<
  OPEN_API_RESULT<""> | OPEN_API_RESULT<"json">
>;

export interface IPromiseSettleResultTableData {
  key: any;
}

export type OPEN_API_TYPE = keyof typeof OPEN_API;
export type OPEN_API_KEY<T extends OPEN_API_TYPE> = keyof typeof OPEN_API[T];

export interface OPEN_API_RESULT<T extends OPEN_API_TYPE> {
  key: OPEN_API_KEY<T>;
  type: T;
  name: typeof OPEN_API[T][OPEN_API_KEY<T>];
  data: T extends "json" ? ("json" extends T ? SERIES_DATA : SPOT_DATA) : SPOT_DATA;
}

type SPOT_DATA = number;

type SERIES_DATA = {
  records: any[];
  retrievedTotal: number;
  total: number;
};

export interface IOPEN_API {
  spot: (
    key: OPEN_API_KEY<"">
  ) => Promise<OPEN_API_RESULT<""> | PromiseRejectedResult>;
  series: (
    key: OPEN_API_KEY<"json">,
    param?: ISeriseParam | undefined
  ) => Promise<OPEN_API_RESULT<"json"> | PromiseRejectedResult>;
  getPath: IGetPath;
}

export type IGetPath = (url: string, param?: ISeriseParam | undefined) => string;

export interface ISeriseParam {
  stime?: number;
  etime?: number;
}
