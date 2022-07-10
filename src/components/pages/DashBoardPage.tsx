import { Typography } from "antd";
import { FunctionComponent } from "react";
import { mockDashboardConfig } from "../../fixtures";
import DashBoard from "../DashBoard";
import MyDashBoard from "../MyDashBoard";

interface IDashBoardPage {}

const DashBoardPage: FunctionComponent<IDashBoardPage> = () => {
  return (
    <DashBoard config={mockDashboardConfig}>
      <Typography.Title>DashBoard 🥸</Typography.Title>
      <MyDashBoard />
    </DashBoard>
  );
};

export default DashBoardPage;
