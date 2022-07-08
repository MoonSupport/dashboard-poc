import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import api, { OPEN_API_KEY, OPEN_API_RESULT } from "../api";
import { HOUR } from "../constants";
import {
  ALL_OPEN_API_KEY,
  ChartTable,
  ChartTableData,
  DashboardConfig,
} from "../types";

interface IDashBoardProps {
  children: ReactNode;
  config: DashboardConfig;
}

interface DashBoardValue {
  config: DashboardConfig;
  findByKey: (key: ALL_OPEN_API_KEY) => ChartTableData;
  bulkFindByKeys: (keys: ALL_OPEN_API_KEY[]) => ChartTableData[];
}

const DashBoardContext = createContext<DashBoardValue | null>(null);
export const useDashBoard = (): DashBoardValue => {
  const value = useContext(DashBoardContext);
  if (!value) throw new Error("not init");
  return value;
};

export const createModel = <Data,>(data: Data) => {
  const findByKey = (key: keyof Data) => {
    return data ? data[key] : {};
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

const DashBoard: FunctionComponent<IDashBoardProps> = ({ children, config }) => {
  const [data, setData] = useState<ChartTable | undefined>();

  const now = Date.now();

  const spotsToRequest = config.widgets.reduce(
    (arr, widget) => arr.concat(widget.chart.spot),
    [] as OPEN_API_KEY<"">[]
  );
  const seriseToRequest = config.widgets.reduce(
    (arr, widget) => {
      const request = widget.chart.serise.map((key) => ({
        key,
        param: {
          stime: now - HOUR,
          etime: now,
        },
      }));
      return arr.concat(request);
    },
    [] as {
      key: OPEN_API_KEY<"json">;
      param: {
        stime: number;
        etime: number;
      };
    }[]
  );

  useEffect(() => {
    const spotPromises = spotsToRequest.map((key) => api.spot(key));
    const serisePromises = seriseToRequest.map(({ key, param }) =>
      api.series(key, param)
    );
    const response = Promise.allSettled([...spotPromises, ...serisePromises]);
    response.then((value) => {
      const chartTable = serializeChartTable(
        [...spotsToRequest, ...seriseToRequest] as any,
        value
      );
      setData(chartTable);
    });
  }, []);

  const { findByKey, bulkFindByKeys } = createModel(data);

  const value = {
    config,
    findByKey,
    bulkFindByKeys,
  } as DashBoardValue;
  return (
    <DashBoardContext.Provider value={value}>{children}</DashBoardContext.Provider>
  );
};

export default DashBoard;
