import RequestMessageQueue, { RequestMessage } from "./RequestMessageQueue";

describe("RequestMessageQueue", () => {
  test("요청을 대기열에 추가한다.", () => {
    const queue = new RequestMessageQueue();
    queue.push("act_agent", "", "init");

    expect(JSON.stringify(queue.find("act_agent"))).toBe(
      JSON.stringify({
        type: "init",
        key: "act_agent",
        keyType: "",
        failCount: 0,
      })
    );
  });

  test("중복된 요청을 대기열에 추가할 시, 추가 되지 않는다.", () => {
    const queue = new RequestMessageQueue();
    queue.push("act_agent", "", "init");
    queue.push("act_agent", "", "update");

    expect(queue.find("act_agent")).toStrictEqual(
      new RequestMessage("act_agent", "", "init")
    );
  });

  test("대기열의 요청을 소비한다.", () => {
    const queue = new RequestMessageQueue();
    queue.push("act_agent", "", "init");
    queue.push("act_socket", "", "init");
    const requestMessage = queue.consume("act_agent");

    expect(requestMessage).toStrictEqual(
      new RequestMessage("act_agent", "", "init")
    );
    expect(queue.find("act_agent")).toBe(null);
    expect(queue.find("act_socket")).toStrictEqual(
      new RequestMessage("act_socket", "", "init")
    );
  });

  test("대기열의 요청이 실패하면 실패 횟수를 하나 증가한다.", () => {
    const queue = new RequestMessageQueue();
    queue.push("act_agent", "", "init");
    const result = queue.find("act_agent");

    queue.fail("act_agent");

    expect(result?.failCount).toBe(1);
  });
});
