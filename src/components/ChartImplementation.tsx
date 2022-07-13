import { OPEN_API_RESULT } from "../api";
import { ALL_OPEN_API_KEY, ChartType, PromiseResultTable } from "../types";
import BarChartView from "./BarChartView";
import InfomaticsView from "./InfomaticsView";
import LineChartView from "./LineChartView";

export type ChartData = { [x: string]: string | number; value: number }[];

export type ChartComponent =
  | typeof BarChartView
  | typeof LineChartView
  | typeof InfomaticsView;

export interface IChartProps {
  datas: PromiseSettledResult<OPEN_API_RESULT<""> | OPEN_API_RESULT<"json">>[];
  seriseKey?: string;
}

const ChartImplementation: { [key in ChartType]: ChartComponent } = {
  infomatics: InfomaticsView,
  bar: BarChartView,
  line: LineChartView,
};

export default ChartImplementation;
