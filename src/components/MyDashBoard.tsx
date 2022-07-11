import { Col } from "antd";
import { useDashBoard } from "./DashBoard";
import DashBoardGrid from "./DashBoardGrid";
import Widget from "./Widget";

const MyDashBoard = () => {
  const { config } = useDashBoard();

  return (
    <DashBoardGrid>
      {config.widgets.map((widget) => (
        <Col xs={24} md={12} lg={8}>
          <Widget key={widget.id} config={widget} />
        </Col>
      ))}
    </DashBoardGrid>
  );
};

export default MyDashBoard;
