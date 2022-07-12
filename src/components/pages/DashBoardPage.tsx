import { Typography } from "antd";
import { FunctionComponent } from "react";
import api from "../../api";
import { mockDashboardConfig } from "../../fixtures";
import DashBoardProvider from "../DashBoardProvider";
import DashBoardClient from "../DashBoardClient";
import ExceptionDataProvider from "../ExceptionDataProvider";
import MyDashBoard from "../MyDashBoard";
import { FIVE_MINIUTES } from "../../constants";

interface IDashBoardPage {}

const DashBoardPage: FunctionComponent<IDashBoardPage> = () => {
  const dashboardClient = new DashBoardClient(api, mockDashboardConfig);

  return (
    <DashBoardProvider dashboardClient={dashboardClient}>
      <ExceptionDataProvider
        config={{
          interval: FIVE_MINIUTES,
        }}
      >
        <Typography.Title>DashBoard 🥸</Typography.Title>
        <MyDashBoard />
      </ExceptionDataProvider>
    </DashBoardProvider>
  );
};

export default DashBoardPage;
