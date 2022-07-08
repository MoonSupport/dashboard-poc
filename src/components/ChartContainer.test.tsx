import { getByTestId, render } from "@testing-library/react";
import ChartContainer from "./ChartContainer";

const mockBulkFindByKeys = jest.fn();

jest.mock("./DashBoard", () => ({
  useDashBoard: () => ({ bulkFindByKeys: mockBulkFindByKeys }),
}));

describe("[ChartContainer]", () => {
  test("차트가 요구하는 데이터를 context에 요청한다.", () => {
    render(
      <ChartContainer
        config={{
          type: "infomatics",
          spot: ["act_agent", "act_dbc"],
          serise: ["transaction/{stime}/{etime}"],
        }}
      />
    );
    render(
      <ChartContainer
        config={{
          type: "infomatics",
          spot: [],
          serise: ["exception/{stime}/{etime}"],
        }}
      />
    );

    expect(mockBulkFindByKeys).toHaveBeenCalledWith([
      "act_agent",
      "act_dbc",
      "transaction/{stime}/{etime}",
    ]);
    expect(mockBulkFindByKeys).toHaveBeenCalledWith(["exception/{stime}/{etime}"]);
  });

  test("타입에 맞는 차트를 그린다.", () => {
    const { container } = render(
      <ChartContainer
        config={{
          type: "line",
          spot: [],
          serise: [],
        }}
      />
    );
    expect(getByTestId(container, "line")).toBeTruthy();
  });
});
