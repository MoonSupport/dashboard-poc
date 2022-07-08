import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
} from "react";

interface IDashBoardProps {
  children: ReactNode;
}

const DashBoardContext = createContext<unknown | null>(null);
export const useDashBoard = () => {
  const value = useContext(DashBoardContext);
  return value;
};
const DashBoard: FunctionComponent<IDashBoardProps> = ({ children }) => {
  const update = () => {
    Promise.allSettled([]).then((v) => {
      console.log(v);
    });
    setTimeout(update, 5000);
  };

  useEffect(() => {
    update();
  }, []);

  const value = {
    data: [],
  };
  return (
    <DashBoardContext.Provider value={value}>{children}</DashBoardContext.Provider>
  );
};

export default DashBoard;
