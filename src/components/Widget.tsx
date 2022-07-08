import { Typography } from "antd";
import { FunctionComponent } from "react";
import { WidgetCofig } from "../types";
import ChartContainer from "./ChartContainer";

interface IWidgetProps {
  config: WidgetCofig;
}

const Widget: FunctionComponent<IWidgetProps> = ({ config }) => {
  return (
    <div>
      <Typography.Title level={2}>{config.name}</Typography.Title>
      <ChartContainer config={config.chart} />
    </div>
  );
};

export default Widget;
