import { Line, LineConfig } from "@ant-design/charts";
import { FunctionComponent } from "react";
import { IChartProps } from "./ChartImplementation";
import { useExceptionData } from "./ExceptionDataProvider";

const LineChart: FunctionComponent<IChartProps> = ({ seriseKey }) => {
  const { data: rawData } = useExceptionData() as any;
  const data = rawData[seriseKey as string] ?? [];

  const config = {
    data,
    xField: "time",
    yField: "count",
    seriesField: "key",
    color: ["red", "orange", "green", "blue", "purple", "brown"],
    legend: {
      position: "right",
      marker: {
        symbol: "square",
      },
      itemName: {
        formatter: (text: string) => {
          return text;
        },
      },
    },
  } as LineConfig;

  return (
    <div data-testid="line">
      <Line {...config} />
    </div>
  );
};

export default LineChart;
