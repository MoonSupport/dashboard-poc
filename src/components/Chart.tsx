import BarChartView from "./BarChartView";
import InfomaticsView from "./InfomaticsView";
import LineChartView from "./LineChartView";

export type ChartType = "infomatics" | "bar" | "line";

export type ChartData = { [x: string]: string | number; value: number }[];

export type ChartComponent = typeof BarChartView | typeof LineChartView;

export interface ChartProps {
  config: {
    data: ChartData;
    xField?: string;
    yField?: string;
    xAxis?: {
      tickCount: number;
    };
  };
}

const ChartView: { [key in ChartType]: ChartComponent } = {
  infomatics: InfomaticsView,
  bar: BarChartView,
  line: LineChartView,
};

export default ChartView;
