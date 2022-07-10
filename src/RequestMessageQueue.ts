import { OPEN_API_TYPE } from "./api";
import { ALL_OPEN_API_KEY } from "./types";

type RequestMessageType = "init" | "update";

export class RequestMessage {
  public type;
  public key;
  public keyType;
  public failCount;

  constructor(
    key: ALL_OPEN_API_KEY,
    keyType: OPEN_API_TYPE,
    type: RequestMessageType
  ) {
    this.key = key;
    this.keyType = keyType;
    this.type = type;
    this.failCount = 0;
  }
}

class RequestMessageQueue {
  container: RequestMessage[] = [];
  constructor() {}

  push(key: ALL_OPEN_API_KEY, keyType: OPEN_API_TYPE, type: RequestMessageType) {
    if (this.container.find((requestMessage) => requestMessage.key === key)) {
      return;
    }
    this.container.push(new RequestMessage(key, keyType, type));
  }

  find(key: ALL_OPEN_API_KEY) {
    if (
      this.container.findIndex((requestMessage) => requestMessage.key === key) == -1
    ) {
      return null;
    }

    return this.container[
      this.container.findIndex((requestMessage) => requestMessage.key === key)
    ];
  }

  remove(key: ALL_OPEN_API_KEY) {
    const index = this.container.findIndex(
      (requestMessage) => requestMessage.key === key
    );
    if (index === -1) return;
    this.container.splice(index, 1);
  }

  consume(key: ALL_OPEN_API_KEY) {
    const reuslt = this.find(key);
    this.remove(key);
    return reuslt;
  }

  fail(key: ALL_OPEN_API_KEY) {
    const target = this.find(key);
    if (target) target.failCount++;
  }
}

export default RequestMessageQueue;
