import { createContext, FunctionComponent, ReactNode, useContext } from "react";

interface IDashBoardProps {
  children: ReactNode;
}

const DashBoardContext = createContext<{} | null>(null);
export const useDashBoard = () => {
  const value = useContext(DashBoardContext);
  return value;
};
const DashBoard: FunctionComponent<IDashBoardProps> = ({ children }) => {
  const value = {
    data: [],
  };
  return (
    <DashBoardContext.Provider value={value}>{children}</DashBoardContext.Provider>
  );
};

export default DashBoard;
