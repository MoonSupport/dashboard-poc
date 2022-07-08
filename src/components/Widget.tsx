import { FunctionComponent } from "react";
import { ChartType } from "./Chart";
import ChartContainer from "./ChartContainer";

export interface WidgetInfomation {
  id: number;
  type: ChartType;
  name: string;
  actions: unknown[];
}

interface IWidget {
  data: WidgetInfomation;
}

const Widget: FunctionComponent<IWidget> = ({ data }) => {
  return (
    <div>
      <ChartContainer type={data.type} />
    </div>
  );
};

export default Widget;
