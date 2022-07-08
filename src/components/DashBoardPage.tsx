import { FunctionComponent } from "react";
import DashBoard from "./DashBoard";
import MyDashBoard from "./MyDashBoard";

interface IDashBoardPage {}

// 네트워크 레이어
const DashBoardPage: FunctionComponent<IDashBoardPage> = () => {
  return (
    <DashBoard>
      <MyDashBoard />
    </DashBoard>
  );
};

export default DashBoardPage;
