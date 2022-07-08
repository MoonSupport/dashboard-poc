import { FunctionComponent } from "react";
import ChartView, { ChartType } from "./Chart";

interface IChartContainerProps {
  type: ChartType;
}

const ChartContainer: FunctionComponent<IChartContainerProps> = ({ type }) => {
  const Chart = ChartView[type];
  const config = {
    data: [],
  };
  return <Chart config={config} />;
};

export default ChartContainer;
