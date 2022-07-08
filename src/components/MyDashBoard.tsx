import DashBoardGrid from "./DashBoardGrid";
import Widget, { WidgetInfomation } from "./Widget";

interface DashBoardInformation {
  widgets: WidgetInfomation[];
}

const MyDashBoard = () => {
  const dashBoardInfomation = {
    widgets: [
      {
        id: 1,
        type: "bar",
        name: "액티브 스테이터스",
        actions: [],
      },
    ],
  } as DashBoardInformation;

  return (
    <DashBoardGrid>
      {dashBoardInfomation.widgets.map((widgetInfo) => (
        <Widget key={widgetInfo.id} data={widgetInfo} />
      ))}
    </DashBoardGrid>
  );
};

export default MyDashBoard;
