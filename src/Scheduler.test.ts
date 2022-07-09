import Scheduler from "./Scheduler";

describe("[Scheduler]", () => {
  test("연속해서 callback을 실행하고 종료할 수 있다.", (done) => {
    const scheduler = new Scheduler({
      interval: 100,
    });
    let count = 1;
    const result = [] as any[];
    scheduler.continuousRetchByInterval(() => {
      const res = Promise.resolve(count++);
      res.then((v) => {
        result.push(v);
      });
    });

    setTimeout(() => {
      scheduler.stopRefetchByInterval();
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      done();
    }, 1000);
  });
});
