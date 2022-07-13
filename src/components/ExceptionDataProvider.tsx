// serise는 불규칙한 응답을 반환합니다. 그에 비해서 LineChart는 인터페이스가 정해져 있습니다.

import { createContext, FunctionComponent, ReactNode, useContext } from "react";
import { format } from "date-fns";
import { SERIES_DATA } from "../api";
import { useDashBoard } from "./DashBoardProvider";
import { PromiseSettledOpenApiResult } from "../types";

const Context = createContext(null);

type ExceptionType =
  | "Internal RuntimeException"
  | "Sql Exception"
  | "Unknown Error!!";

type IOname = string;

type XYData = [number, Date];
type SeriseMap = Map<IOname, XYData[]>;

export interface ExceptionRecord {
  time: number;
  msg: ExceptionType;
  onames: [IOname];
  count: number;
}

interface MultiLineRecord {
  key: IOname;
  count: number;
  time: string;
}

interface LineChartDataTable {
  //[key: ExceptionType]
  [key: string]: MultiLineRecord[];
}

interface GroupedSeriseRecord {
  [key: IOname]: XYData[];
}

export const buildLineChartData = (
  res: PromiseSettledOpenApiResult,
  config: {
    interval: number;
  }
) => {
  if (res?.status === "rejected" || !res?.value) {
    return {};
  }

  const rawData = res.value.data as SERIES_DATA;

  const subject = new Map<ExceptionType, SeriseMap>();

  const rawRecords = (
    rawData?.records ? [...rawData.records] : []
  ) as ExceptionRecord[];

  // O(nlogn)
  const sortedRes = rawRecords.sort(function (a, b) {
    return a.time - b.time;
  });

  // 에러별, 인스턴스 별 그룹핑을 한다. O(n)
  for (let i = 0; i < sortedRes.length; i++) {
    const record = sortedRes[i];
    if (subject.has(record.msg)) {
      // 해당되는 에러가 있다면
      const serise = subject.get(record.msg) as SeriseMap;

      if (serise.has(record.onames[0])) {
        const target = serise.get(record.onames[0]) as XYData[];
        // 날짜로 정렬되었기 때문에 가장 최신 값만 비교해보면 된다.
        if (target[target.length - 1][1].getTime() === record.time) {
          target[target.length - 1][0] += record.count;
        } else {
          target.push([record.count, new Date(record.time)]);
        }
      } else {
        serise.set(record.onames[0], [[record.count, new Date(record.time)]]);
      }
    } else {
      // 해당하는 에러가 없다면
      subject.set(record.msg, new Map());
      const serise = subject.get(record.msg) as SeriseMap;

      serise.set(record.onames[0], [[record.count, new Date(record.time)]]);
    }
  }

  let graud = 0;
  const LIMIT = 3000;
  const data = {} as LineChartDataTable;
  for (const [subjectName, Exception] of subject) {
    const groupedSerise = {} as GroupedSeriseRecord;
    // 날짜 별로 새로운 레코드를 만든다. O(n^2)
    for (const [key, record] of Exception) {
      let cursor = 0;
      groupedSerise[key] = [];
      for (
        let i = sortedRes[0].time;
        i <= sortedRes[sortedRes.length - 1].time;
        i += config.interval
      ) {
        if (graud++ > LIMIT) {
          throw new Error("반복 횟수가 너무 많습니다.");
        }
        if (record[cursor] && record[cursor][1].getTime() == i) {
          groupedSerise[key].push(record[cursor]);
          cursor++;
        } else {
          groupedSerise[key].push([0, new Date(i)]);
        }
      }
    }

    const multilineRecords = [] as MultiLineRecord[];
    // 새로운 레코드를 데이터 단위로 묶는다. O(n^2)
    for (const [key, records] of Object.entries(groupedSerise)) {
      for (const record of records as any) {
        multilineRecords.push({
          key,
          count: record[0],
          time: format(record[1], "HH:mm"),
        });
      }
    }
    data[subjectName] = multilineRecords;
  }

  return data;
};

interface IExceptionDataProvider {
  config: {
    interval: number;
  };
  children: ReactNode;
}

const ExceptionDataProvider: FunctionComponent<IExceptionDataProvider> = ({
  children,
  config,
}) => {
  const { findByKey } = useDashBoard();
  const res = findByKey("exception/{stime}/{etime}");

  const data = buildLineChartData(res, config);

  const value = {
    data,
  };

  return <Context.Provider value={value as any}>{children}</Context.Provider>;
};

export const useExceptionData = () => {
  return useContext(Context);
};

export default ExceptionDataProvider;
