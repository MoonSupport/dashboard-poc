import { OPEN_API, OPEN_API_KEY, OPEN_API_RESULT } from "../api";
import { FIVE_SECONDS, HOUR } from "../constants";
import RequestMessageQueue from "../RequestMessageQueue";
import {
  ALL_OPEN_API_KEY,
  DashBoardConfig,
  IPromiseResultTableData,
  PromiseResultTable,
} from "../types";

class DashBoardClient {
  private _config;
  private api;
  private spotKeys: OPEN_API_KEY<"">[];
  private seriseKeys: OPEN_API_KEY<"json">[];
  private keys: ALL_OPEN_API_KEY[];
  private seriesWidth: number;
  private updateInterval: number;

  private requestMessageQueue: RequestMessageQueue;

  public chartTable: PromiseResultTable<
    OPEN_API_RESULT<""> | OPEN_API_RESULT<"json">
  > | null;

  constructor(api: OPEN_API, config: DashBoardConfig) {
    this._config = config;
    this.api = api;
    this.seriesWidth = config.seriesWidth || HOUR;
    this.updateInterval = config.updateInterval || FIVE_SECONDS;
    this.requestMessageQueue = new RequestMessageQueue();
    this.spotKeys = config.widgets.reduce(
      (arr, widget) => arr.concat(widget.chart.spot),
      [] as OPEN_API_KEY<"">[]
    );
    this.seriseKeys = config.widgets.reduce(
      (arr, widget) => arr.concat(widget.chart.serise),
      [] as OPEN_API_KEY<"json">[]
    );

    this.keys = [...new Set(this.spotKeys), ...new Set(this.seriseKeys)];
    this.chartTable = null;
  }

  public async fetch() {
    this.spotKeys.map((key) => {
      this.requestMessageQueue.push(key, "", "init");
    });
    this.seriseKeys.map((key) => {
      this.requestMessageQueue.push(key, "json", "init");
    });

    const now = Date.now();
    const requestPromise = this.requestMessageQueue.map((message) => {
      if (message.keyType === "json") {
        return this.api.series(message.key as OPEN_API_KEY<"json">, {
          stime: now - this.seriesWidth,
          etime: now,
        });
      } else {
        return this.api.spot(message.key as OPEN_API_KEY<"">);
      }
    });

    const response = Promise.allSettled(requestPromise);
    return response.then((value) => {
      const promiseResultTable = this.nomalizePromiseResultTable<
        OPEN_API_RESULT<""> | OPEN_API_RESULT<"json">
      >(value);

      Object.entries(promiseResultTable).map(([key, value]) => {
        if (value.status === "fulfilled") {
          this.requestMessageQueue.consume(key as ALL_OPEN_API_KEY);
        } else {
          this.requestMessageQueue.fail(key as ALL_OPEN_API_KEY);
        }
      });

      this.chartTable = promiseResultTable;
      return promiseResultTable;
    });
  }

  public async refetch() {
    this.spotKeys.map((key) => {
      this.requestMessageQueue.push(key, "", "update");
    });
    this.seriseKeys.map((key) => {
      this.requestMessageQueue.push(key, "json", "update");
    });

    const now = Date.now();
    const requestPromise = this.requestMessageQueue.map((message) => {
      // 이전에 실패한 경우
      if (message.type === "init") {
        if (message.keyType === "json") {
          return this.api.series(message.key as OPEN_API_KEY<"json">, {
            stime: now - this.seriesWidth,
            etime: now,
          });
        } else {
          return this.api.spot(message.key as OPEN_API_KEY<"">);
        }
        // 업데이트 로직
      } else {
        if (message.keyType === "json") {
          return this.api.series(message.key as OPEN_API_KEY<"json">, {
            stime: now - this.updateInterval * (message.failCount + 1),
            etime: now,
          });
        } else {
          return this.api.spot(message.key as OPEN_API_KEY<"">);
        }
      }
    });

    const response = Promise.allSettled(requestPromise);

    return response.then((res) => {
      const updateedPromiseResultTable = this.nomalizePromiseResultTable<
        OPEN_API_RESULT<""> | OPEN_API_RESULT<"json">
      >(res);

      Object.entries(updateedPromiseResultTable).map(([key, newValue]) => {
        if (!this.chartTable) throw new Error("업데이트 할 테이블이 없습니다.");

        const tableKey = key as ALL_OPEN_API_KEY;
        const oldChartTable = this.chartTable[tableKey];
        // 성공한 적 없음
        if (oldChartTable.status === "rejected") {
          if (newValue.status === "fulfilled") {
            this.chartTable[tableKey] = newValue;
          }
          // 한 번이라도 성공 함
        } else {
          if (newValue.status === "rejected") {
            this.requestMessageQueue.fail(tableKey);
            return;
          }

          if (
            oldChartTable.value.type === "json" &&
            newValue.value.type === "json"
          ) {
            const shouldLeftOldRecord = oldChartTable.value.data.records.filter(
              (record) => {
                return record.time >= now - this.seriesWidth;
              }
            );

            const updatedRecords = [
              ...shouldLeftOldRecord,
              ...newValue.value.data.records,
            ];

            // @ts-ignore
            this.chartTable[tableKey].value.data.records = updatedRecords;
          } else {
            const tableKey = key as OPEN_API_KEY<"">;
            this.chartTable[tableKey] = newValue;
            this.requestMessageQueue.consume(tableKey);
          }
        }
      });

      return this.chartTable;
    });
  }

  private nomalizePromiseResultTable<T extends IPromiseResultTableData>(
    datas: PromiseSettledResult<T>[]
  ): PromiseResultTable<T> {
    return this.keys.reduce((obj, key) => {
      const value = datas.find((data) => {
        if (data.status === "fulfilled") return data.value.key == key;
        else if (data.status === "rejected") return data.reason.key == key;
        else throw new Error("Invalid Status");
      });
      return Object.assign(obj, {
        [key]: value,
      });
    }, {} as PromiseResultTable<T>);
  }

  public get config() {
    return this._config;
  }
}

export default DashBoardClient;
