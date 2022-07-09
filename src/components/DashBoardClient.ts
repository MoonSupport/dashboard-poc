import { OPEN_API, OPEN_API_KEY, OPEN_API_RESULT } from "../api";
import { FIVE_SECONDS, HOUR } from "../constants";
import { ALL_OPEN_API_KEY, ChartTable, DashBoardConfig } from "../types";

class DashBoardClient {
  private initTime;
  private api;
  private spotKeys: OPEN_API_KEY<"">[];
  private seriseKeys: OPEN_API_KEY<"json">[];
  private keys: ALL_OPEN_API_KEY[];
  private spotsToRequest;
  private seriseToRequest;
  private seriesInterval;
  private updateInterval;
  private lastFetchTime: number;
  private timeout: NodeJS.Timeout | null;

  private isIdle = true;

  public chartTable: ChartTable | null;

  constructor(api: OPEN_API, config: DashBoardConfig) {
    this.initTime = config.time;
    this.api = api;
    this.seriesInterval = config.seriesInterval || HOUR;
    this.updateInterval = config.updateInterval || FIVE_SECONDS;
    this.timeout = null;
    this.lastFetchTime = 0;
    this.spotsToRequest = config.widgets.reduce(
      (arr, widget) => arr.concat(widget.chart.spot),
      [] as OPEN_API_KEY<"">[]
    );
    this.seriseToRequest = config.widgets.reduce(
      (arr, widget) => {
        const request = widget.chart.serise.map((key) => ({
          key,
          param: {
            stime: this.initTime - this.seriesInterval,
            etime: this.initTime,
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
    this.spotKeys = [...this.spotsToRequest];
    this.seriseKeys = this.seriseToRequest.map((request) => request.key);
    this.keys = [...this.spotKeys, ...this.seriseKeys];
    this.chartTable = null;
  }

  public get requestedSpot() {
    return this.spotsToRequest;
  }

  public get requestedSerise() {
    return this.seriseToRequest;
  }

  public async fetch() {
    this.isIdle = false;

    const spotPromises = this.spotsToRequest.map((key) => this.api.spot(key));
    const serisePromises = this.seriseToRequest.map(({ key, param }) =>
      this.api.series(key, param)
    );
    const response = Promise.allSettled([...spotPromises, ...serisePromises]);
    const _this = this;
    return response.then((value) => {
      const chartTable = this.serializeChartTable(value);
      _this.chartTable = chartTable;
      _this.isIdle = true;
      _this.lastFetchTime = Date.now();
      return chartTable;
    });
  }

  public async refetch(stime: number, etime: number) {
    if (!this.isIdle) return;
    this.isIdle = false;
    const updateNow = Date.now();

    const spotPromises = this.spotsToRequest.map((key) => this.api.spot(key));
    const serisePromises = this.seriseToRequest.map(({ key }) =>
      this.api.series(key, {
        stime,
        etime,
      })
    );
    const response = Promise.allSettled([...spotPromises, ...serisePromises]);
    const _this = this;
    return response.then((res) => {
      const updatedChartTable = this.serializeChartTable(res);
      Object.entries(updatedChartTable).map(([key, newValue]) => {
        if (!_this.chartTable) throw new Error("업데이트 할 테이블이 없습니다.");

        if (newValue.value.type === "json") {
          const tableKey = key as OPEN_API_KEY<"json">;
          const oldChartTable = _this.chartTable[tableKey]
            .value as OPEN_API_RESULT<"json">;
          const shouldLeftOldRecord = oldChartTable.data.records.filter(
            (record) => record.time > stime
          );

          const updatedRecords = [
            ...shouldLeftOldRecord,
            ...newValue.value.data.records,
          ];
          // @ts-ignore
          _this.chartTable[tableKey].value.data.records = updatedRecords;
        } else {
          const tableKey = key as OPEN_API_KEY<"">;
          _this.chartTable[tableKey] = newValue;
        }
      });
      _this.isIdle = true;
      _this.lastFetchTime = Date.now();
      return _this.chartTable;
    });
  }

  public async continuousRetchByInterval() {
    this.timeout = setTimeout(() => {
      this.refetch(this.lastFetchTime, Date.now());
      this.continuousRetchByInterval();
    }, this.updateInterval);
  }

  public async stopRefetchByInterval() {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = null;
  }

  private serializeChartTable(
    datas: PromiseSettledResult<OPEN_API_RESULT<""> | OPEN_API_RESULT<"json">>[]
  ) {
    return this.keys.reduce((obj, key, index) => {
      const value = datas[index];
      return Object.assign(obj, {
        [key]: value,
      });
    }, {} as ChartTable);
  }
}

export default DashBoardClient;
