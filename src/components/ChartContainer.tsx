import { FunctionComponent } from "react";
import { ChartConfig } from "../types";
import ChartImplementation from "./ChartImplementation";
import Loading from "./common/Loading";
import { useDashBoard } from "./DashBoardProvider";

interface IChartContainerProps {
  config: ChartConfig;
}

const ChartContainer: FunctionComponent<IChartContainerProps> = ({ config }) => {
  const { bulkFindByKeys } = useDashBoard();
  const Chart = ChartImplementation[config.type];

  const datas = bulkFindByKeys([...config.spot, ...config.serise]);
  if (!datas) return <Loading />;
  return <Chart seriseKey={config.seriseKey} datas={datas} />;
};

export default ChartContainer;
