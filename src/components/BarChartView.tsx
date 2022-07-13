import { FunctionComponent } from "react";
import { IChartProps } from "./ChartImplementation";
import { Bar } from "@ant-design/plots";

const BarChart: FunctionComponent<IChartProps> = ({ datas }) => {
  const data = datas?.map((data) => {
    // 여기까지 PromiseSettled를 알필요가 즈어어어언혀 없음
    if (data.status === "fulfilled") {
      return {
        key: data?.value?.key,
        value: data?.value?.data,
      };
    } else {
      return {
        key: data?.reason?.key,
        value: 0,
      };
    }
  });

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
