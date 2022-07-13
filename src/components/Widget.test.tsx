import { getByTestId, render } from "@testing-library/react";
import Widget from "./Widget";

jest.mock("./DashBoardProvider", () => ({
  useDashBoard: () => ({ bulkFindByKeys: () => [] }),
}));

const MockChildComponent = jest.fn();
jest.mock("./LineChartView", () => (props: any) => {
  MockChildComponent(props);
  return <div data-testid="line">line</div>;
});

describe("[Widget]", () => {
  test("위젯의 타이틀을 그린다.", () => {
    const { container } = render(
      <Widget
        config={{
          id: 1,
          name: "test",
          chart: {
            type: "infomatics",
            spot: [],
            serise: [],
          },
        }}
      />
    );
    expect(container).toHaveTextContent("test");
  });
  test("타입에 맞는 차트를 그린다.", () => {
    const { container } = render(
      <Widget
        config={{
          id: 1,
          name: "test",
          chart: {
            type: "infomatics",
            spot: [],
            serise: [],
          },
        }}
      />
    );
    expect(getByTestId(container, "infomatics")).toBeTruthy();
  });
});
