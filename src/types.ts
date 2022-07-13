import { OPEN_API_KEY, OPEN_API_RESULT } from "./api";

export type ChartType = "infomatics" | "bar" | "line";

export interface DashBoardConfig {
  id: number;
  name: string;
  widgets: WidgetCofig[];
  updateInterval?: number;
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

export type PromiseResultTable<T> = {
  [key in ALL_OPEN_API_KEY]: PromiseSettledResult<T>;
};

export interface IPromiseResultTableData {
  key: any;
}
