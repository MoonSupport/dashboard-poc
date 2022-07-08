import { OPEN_API_KEY, OPEN_API_RESULT } from "./api";

export type ChartType = "infomatics" | "bar" | "line";

export interface DashboardConfig {
  id: number;
  name: string;
  widgets: WidgetCofig[];
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
}

export type ALL_OPEN_API_KEY = OPEN_API_KEY<""> | OPEN_API_KEY<"json">;

export type ChartTableData = {
  status: "fulfilled";
  value: OPEN_API_RESULT<""> | OPEN_API_RESULT<"json">;
};

export type ChartTable = {
  [key in ALL_OPEN_API_KEY]: ChartTableData;
};