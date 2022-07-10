import { useDashBoard } from "./DashBoard";
import DashBoardGrid from "./DashBoardGrid";
import Widget from "./Widget";

const MyDashBoard = () => {
  const { config } = useDashBoard();

  return (
    <DashBoardGrid>
      {config.widgets.map((widget) => (
        <Widget key={widget.id} config={widget} />
      ))}
    </DashBoardGrid>
  );
};

export default MyDashBoard;
