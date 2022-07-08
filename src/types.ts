export interface DashBoardValue {}

interface WidgetValue {}

interface ChartValue {}

interface InfomaticsValue {
  label: string;
  data: number;
}

interface BarChartValue {
  label: string;
  data: number;
}

interface LineChartValue {
  xField: string;
  yField: string;
  x: number;
  y: number;
}
