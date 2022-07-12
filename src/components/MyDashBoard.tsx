import { Col } from "antd";
import { useDashBoard } from "./DashBoardProvider";
import DashBoardGrid from "./DashBoardGrid";
import Widget from "./Widget";

const MyDashBoard = () => {
  const { config } = useDashBoard();

  return (
    <DashBoardGrid>
      {config.widgets.map((widget) => (
        <Col key={widget.id} xs={24} md={12} lg={12}>
          <Widget config={widget} />
        </Col>
      ))}
    </DashBoardGrid>
  );
};

export default MyDashBoard;
