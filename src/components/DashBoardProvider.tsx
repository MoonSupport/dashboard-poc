import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { FIVE_SECONDS } from "../constants";
import Scheduler from "../Scheduler";
import {
  ALL_OPEN_API_KEY,
  DashBoardConfig,
  OPEN_API_RESULT,
  PromiseSettledOpenApiResult,
  PromiseSettleResultTable,
} from "../types";
import DashBoardClient from "./DashBoardClient";

interface IDashBoardProps {
  children: ReactNode;
  dashboardClient: DashBoardClient;
}

interface DashBoardValue {
  config: DashBoardConfig;
  findByKey: (key: ALL_OPEN_API_KEY) => PromiseSettledOpenApiResult;
  bulkFindByKeys: (keys: ALL_OPEN_API_KEY[]) => PromiseSettledOpenApiResult[];
}

const DashBoardContext = createContext<DashBoardValue | null>(null);
export const useDashBoard = (): DashBoardValue => {
  const value = useContext(DashBoardContext);
  if (!value) throw new Error("not init");
  return value;
};

export const createModel = <T,>(table: T | undefined) => {
  const findByKey = (key: keyof T) => {
    return table ? table[key] : ({} as T[keyof T]);
  };

  const bulkFindByKeys = (keys: (keyof T)[]) => {
    return keys.map((key) => findByKey(key));
  };

  return { findByKey, bulkFindByKeys };
};

const DashBoardProvider: FunctionComponent<IDashBoardProps> = ({
  children,
  dashboardClient,
}) => {
  const [data, setData] = useState<
    | PromiseSettleResultTable<OPEN_API_RESULT<""> | OPEN_API_RESULT<"json">>
    | undefined
  >();

  const scheduler = new Scheduler({ interval: FIVE_SECONDS * 2 });

  useEffect(() => {
    const chartTablePromise = dashboardClient.fetch();
    chartTablePromise.then((chartTable) => {
      setData(chartTable);
      scheduler.continuousRetchByInterval(() => {
        dashboardClient.refetch().then((v) => {
          if (v) {
            setData({ ...v });
          }
        });
      });
    });
  }, []);

  const { findByKey, bulkFindByKeys } =
    createModel<
      PromiseSettleResultTable<OPEN_API_RESULT<""> | OPEN_API_RESULT<"json">>
    >(data);

  return (
    <DashBoardContext.Provider
      value={{
        config: dashboardClient.config,
        findByKey,
        bulkFindByKeys,
      }}
    >
      {children}
    </DashBoardContext.Provider>
  );
};

export default DashBoardProvider;
