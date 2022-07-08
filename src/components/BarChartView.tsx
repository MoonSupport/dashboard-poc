import { FunctionComponent } from "react";
import { ChartProps } from "./Chart";

interface IBarChartProps extends ChartProps {}

const BarChart: FunctionComponent<IBarChartProps> = () => {
  return <div>BarChart</div>;
};

export default BarChart;
