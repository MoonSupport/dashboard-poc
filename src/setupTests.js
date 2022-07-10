// did not need to import React to use JSX
// @ts-nocheck
import "@testing-library/jest-dom/extend-expect";

class Worker {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = () => {};
  }

  postMessage(msg) {
    this.onmessage(msg);
  }
}

class URL {
  static createObjectURL(obj) {
    return "";
  }
}

window.Worker = Worker;
window.URL = URL;
