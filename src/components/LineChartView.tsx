import { FunctionComponent } from "react";
import { IChartProps } from "./ChartImplementation";

const LineChart: FunctionComponent<IChartProps> = ({ datas }) => {
  return <div data-testid="line">LineChart</div>;
};

export default LineChart;
