import { FIVE_MINIUTES } from "../constants";
import { buildLineChartData } from "./ExceptionDataProvider";

describe("[ExceptionDataProvider]", () => {
  describe("buildLineChartData", () => {
    test("값이 없을 때, 빈 객체를 리턴한다.", () => {
      const result = buildLineChartData(undefined as any, {
        interval: FIVE_MINIUTES,
      });

      expect(result).toEqual({});
    });
  });
});
