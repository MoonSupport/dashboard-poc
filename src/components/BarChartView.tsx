import { FunctionComponent } from "react";
import { IChartProps } from "./ChartImplementation";
import { Bar } from "@ant-design/plots";

const BarChart: FunctionComponent<IChartProps> = ({ datas }) => {
  const data = datas?.map((data) => ({
    key: data?.value?.key,
    value: data?.value?.data,
  }));

  const config = {
    data,
    xField: "value",
    yField: "key",
    seriesField: "key",
    legend: {
      position: "top-left" as any,
    },
  };
  return <Bar {...config} />;
};

export default BarChart;
