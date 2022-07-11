import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { OPEN_API_RESULT } from "../api";
import { FIVE_SECONDS } from "../constants";
import Scheduler from "../Scheduler";
import {
  ALL_OPEN_API_KEY,
  ChartTable,
  ChartTableData,
  DashBoardConfig,
} from "../types";
import DashBoardClient from "./DashBoardClient";

interface IDashBoardProps {
  children: ReactNode;
  dashboardClient: DashBoardClient;
}

interface DashBoardValue {
  config: DashBoardConfig;
  findByKey: (key: ALL_OPEN_API_KEY) => ChartTableData;
  bulkFindByKeys: (keys: ALL_OPEN_API_KEY[]) => ChartTableData[];
}

const DashBoardContext = createContext<DashBoardValue | null>(null);
export const useDashBoard = (): DashBoardValue => {
  const value = useContext(DashBoardContext);
  if (!value) throw new Error("not init");
  return value;
};

export const createModel = <Data,>(data: Data | undefined) => {
  const findByKey = (key: keyof Data) => {
    return data ? data[key] : ({} as ChartTableData);
  };

  const bulkFindByKeys = (keys: (keyof Data)[]) => {
    return keys.map((key) => findByKey(key));
  };

  return { findByKey, bulkFindByKeys };
};

export const serializeChartTable = (
  keys: ALL_OPEN_API_KEY[],
  datas: PromiseSettledResult<OPEN_API_RESULT<""> | OPEN_API_RESULT<"json">>[]
) => {
  return keys.reduce((obj, key, index) => {
    const value = datas[index];
    return Object.assign(obj, {
      [key]: value,
    });
  }, {} as ChartTable);
};

const DashBoardProvider: FunctionComponent<IDashBoardProps> = ({
  children,
  dashboardClient,
}) => {
  const [data, setData] = useState<ChartTable | undefined>();

  const scheduler = new Scheduler({ interval: FIVE_SECONDS * 2 });

  useEffect(() => {
    const chartTablePromise = dashboardClient.fetch();
    chartTablePromise.then((chartTable) => {
      setData(chartTable);
      // scheduler.continuousRetchByInterval(() => {
      //   dashboardClient.refetch().then((v) => {
      //     if (v) {
      //       setData({ ...v });
      //     }
      //   });
      // });
    });
  }, []);

  const { findByKey, bulkFindByKeys } = createModel<ChartTable>(data);

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
