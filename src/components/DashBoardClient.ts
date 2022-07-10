import { OPEN_API, OPEN_API_KEY, OPEN_API_RESULT, OPEN_API_TYPE } from "../api";
import { FIVE_SECONDS, HOUR } from "../constants";
import RequestMessageQueue, { RequestMessage } from "../RequestMessageQueue";
import { ALL_OPEN_API_KEY, ChartTable, DashBoardConfig } from "../types";

class DashBoardClient {
  private api;
  private spotKeys: OPEN_API_KEY<"">[];
  private seriseKeys: OPEN_API_KEY<"json">[];
  private keys: ALL_OPEN_API_KEY[];
  private seriesWidth: number;
  private updateInterval: number;

  private requestMessageQueue: RequestMessageQueue;

  public chartTable: ChartTable | null;

  constructor(api: OPEN_API, config: DashBoardConfig) {
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
    return response
      .then((value) => {
        const chartTable = this.serializeChartTable(value);
        Object.entries(chartTable).map(([key, value]) => {
          if (value.status === "fulfilled") {
            this.requestMessageQueue.consume(key as ALL_OPEN_API_KEY);
          } else {
            this.requestMessageQueue.fail(key as ALL_OPEN_API_KEY);
          }
        });

        this.chartTable = chartTable;
        return chartTable;
      })
      .finally(() => {});
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

    return response
      .then((res) => {
        const updatedChartTable = this.serializeChartTable(res);
        Object.entries(updatedChartTable).map(([key, newValue]) => {
          if (!this.chartTable) throw new Error("업데이트 할 테이블이 없습니다.");

          const tableKey = key as OPEN_API_KEY<"">;
          const oldChartTable = this.chartTable[tableKey];

          // 성공한 적 없음
          if (oldChartTable.status === "rejected" && oldChartTable.reason) {
            if (newValue.status === "fulfilled") {
              this.chartTable[tableKey] = newValue;
            }
            // 한 번이라도 성공 함
          } else {
            if (newValue.status === "rejected" && newValue.reason) {
              this.requestMessageQueue.fail(tableKey);
              return;
            }

            if (
              oldChartTable.value?.type === "json" &&
              newValue.value?.type === "json"
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
              if (newValue.status === "rejected" && newValue.reason) {
                this.requestMessageQueue.fail(tableKey);
                return;
              }

              this.chartTable[tableKey] = newValue;
              this.requestMessageQueue.consume(tableKey);
            }
          }
        });
        return this.chartTable;
      })
      .finally(() => {});
  }

  private serializeChartTable(
    datas: PromiseSettledResult<OPEN_API_RESULT<""> | OPEN_API_RESULT<"json">>[]
  ) {
    return this.keys.reduce((obj, key) => {
      const value =
        datas[
          datas.findIndex((data) => {
            if (data.status === "fulfilled") return data.value.key == key;
            else return data.reason.key == key;
          })
        ];
      return Object.assign(obj, {
        [key]: value,
      });
    }, {} as ChartTable);
  }
}

export default DashBoardClient;
