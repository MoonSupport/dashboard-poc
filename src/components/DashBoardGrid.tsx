import { Row } from "antd";
import { FunctionComponent, ReactNode } from "react";

interface IDashBoardPage {
  children: ReactNode;
}

const DashBoardGrid: FunctionComponent<IDashBoardPage> = ({ children }) => {
  return <Row>{children}</Row>;
};

export default DashBoardGrid;
