import { FunctionComponent } from "react";
import { ChartConfig } from "../types";
import ChartImplementation from "./ChartImplementation";
import { useDashBoard } from "./DashBoard";

interface IChartContainerProps {
  config: ChartConfig;
}

const ChartContainer: FunctionComponent<IChartContainerProps> = ({ config }) => {
  const { bulkFindByKeys } = useDashBoard();
  const Chart = ChartImplementation[config.type];

  const data = bulkFindByKeys([...config.spot, ...config.serise]);
  return <Chart datas={data} />;
};

export default ChartContainer;
