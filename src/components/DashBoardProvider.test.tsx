import { createModel } from "./DashBoardProvider";

describe("[DashBoard]", () => {
  describe("model method", () => {
    test("findByKey로 원하는 키에 해당하는 값을 얻는다.", () => {
      const model = createModel({
        test: {
          id: 1,
          name: "test",
        },
        mock: {
          values: [1, 2, 3, 4],
        },
      });

      expect(model.findByKey("mock")).toEqual({ values: [1, 2, 3, 4] });
    });

    test("bulkFindByKeys로 원하는 여러 키에 해당하는 값을 얻는다.", () => {
      const model = createModel({
        test: {
          id: 1,
          name: "test",
        },
        mock: {
          values: [1, 2, 3, 4],
        },
        mock2: {
          values: [1, 2, 3, 4],
        },
      });

      expect(model.bulkFindByKeys(["test", "mock"])).toEqual([
        { id: 1, name: "test" },
        { values: [1, 2, 3, 4] },
      ]);
    });
  });
});
