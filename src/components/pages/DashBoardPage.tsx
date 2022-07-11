import { Typography } from "antd";
import { FunctionComponent } from "react";
import api from "../../api";
import { mockDashboardConfig } from "../../fixtures";
import DashBoardProvider from "../DashBoard";
import DashBoardClient from "../DashBoardClient";
import MyDashBoard from "../MyDashBoard";

interface IDashBoardPage {}

const DashBoardPage: FunctionComponent<IDashBoardPage> = () => {
  const dashboardClient = new DashBoardClient(api, mockDashboardConfig);

  return (
    <DashBoardProvider dashboardClient={dashboardClient}>
      <Typography.Title>DashBoard 🥸</Typography.Title>
      <MyDashBoard />
    </DashBoardProvider>
  );
};

export default DashBoardPage;
