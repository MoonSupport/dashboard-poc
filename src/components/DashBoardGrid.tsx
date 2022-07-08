import { FunctionComponent, ReactNode } from "react";

interface IDashBoardPage {
  children: ReactNode;
}

const DashBoardGrid: FunctionComponent<IDashBoardPage> = ({ children }) => {
  return <div>{children}</div>;
};

export default DashBoardGrid;
