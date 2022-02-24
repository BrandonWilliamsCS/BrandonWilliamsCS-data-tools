import { TrackedPromise } from "./TrackedPromise";

describe("TrackedPromise", () => {
  it("emits a pending status initially", async () => {
    // Arrange
    const { promise } = makePromise<string, string>();
    const tracked = new TrackedPromise(promise);
    const next = jest.fn();
    // Act
    tracked.statuses.subscribe({ next });
    // Assert
    expect(next).toHaveBeenCalledWith({
      isPending: true,
      hasError: false,
      source: promise,
      hasValue: false,
    });
    expect(tracked.currentStatus).toEqual({
      isPending: true,
      hasError: false,
      source: promise,
      hasValue: false,
    });
  });
  it("emits a success status once promise resolves", async () => {
    // Arrange
    const { promise, resolve } = makePromise<string, string>();
    const tracked = new TrackedPromise(promise);
    const next = jest.fn();
    // Act
    tracked.statuses.subscribe({ next });
    resolve("value");
    await promise.then(
      () => {},
      () => {},
    );
    // Assert
    expect(next).toHaveBeenCalledWith({
      isPending: false,
      hasError: false,
      source: promise,
      hasValue: true,
      value: "value",
    });
    expect(tracked.currentStatus).toEqual({
      isPending: false,
      hasError: false,
      source: promise,
      hasValue: true,
      value: "value",
    });
  });
  it("emits complete once promise resolves", async () => {
    // Arrange
    const { promise, resolve } = makePromise<string, string>();
    const tracked = new TrackedPromise(promise);
    const complete = jest.fn();
    // Act
    tracked.statuses.subscribe({ complete });
    resolve("value");
    await promise.then(
      () => {},
      () => {},
    );
    // Assert
    expect(complete).toHaveBeenCalled();
  });
  it("emits an error status once promise rejects", async () => {
    // Arrange
    const { promise, reject } = makePromise<string, string>();
    const tracked = new TrackedPromise(promise);
    const next = jest.fn();
    // Act
    tracked.statuses.subscribe({ next });
    reject("error");
    await promise.then(
      () => {},
      () => {},
    );
    // Assert
    expect(next).toHaveBeenCalledWith({
      isPending: false,
      hasError: true,
      error: "error",
      source: promise,
      hasValue: false,
    });
    expect(tracked.currentStatus).toEqual({
      isPending: false,
      hasError: true,
      error: "error",
      source: promise,
      hasValue: false,
    });
  });
  it("emits complete once promise rejects", async () => {
    // Arrange
    const { promise, reject } = makePromise<string, string>();
    const tracked = new TrackedPromise(promise);
    const complete = jest.fn();
    // Act
    tracked.statuses.subscribe({ complete });
    reject("error");
    await promise.then(
      () => {},
      () => {},
    );
    // Assert
    expect(complete).toHaveBeenCalled();
  });
  it("maintains value from previous status", async () => {
    // Arrange
    const { promise } = makePromise<string, string>();
    const previousStatus = {
      isPending: false,
      hasError: false,
      source: new Promise<string>(() => {}),
      hasValue: true,
      value: "previousValue",
    } as const;
    const tracked = new TrackedPromise(promise, previousStatus);
    const next = jest.fn();
    // Act
    tracked.statuses.subscribe({ next });
    // Assert
    expect(next).toHaveBeenCalledWith({
      isPending: true,
      hasError: false,
      source: promise,
      hasValue: true,
      value: "previousValue",
    });
    expect(tracked.currentStatus).toEqual({
      isPending: true,
      hasError: false,
      source: promise,
      hasValue: true,
      value: "previousValue",
    });
  });
});

function makePromise<T, E>() {
  let resolve!: (t: T) => void;
  let reject!: (e: E) => void;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return {
    promise,
    resolve,
    reject,
  };
}
