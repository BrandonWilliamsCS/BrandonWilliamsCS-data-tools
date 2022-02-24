import { initialStatus } from "./PromiseStatus";
import { TrackedPromiseSequence } from "./TrackedPromiseSequence";

describe("TrackedPromiseSequence", () => {
  it("emits an initial status immediately", async () => {
    // Arrange
    const trackedSequence = new TrackedPromiseSequence();
    const next = jest.fn();
    // Act
    trackedSequence.statuses.subscribe({ next });
    // Assert
    expect(next).toHaveBeenCalledWith(initialStatus);
  });
  it("emits a pending status immediately after being given a promise", async () => {
    // Arrange
    const trackedSequence = new TrackedPromiseSequence();
    const { promise } = makePromise<string, string>();
    const next = jest.fn();
    // Act
    trackedSequence.statuses.subscribe({ next });
    trackedSequence.next(promise);
    // Assert
    expect(next).toHaveBeenCalledWith({
      isPending: true,
      hasError: false,
      source: promise,
      hasValue: false,
    });
    expect(trackedSequence.currentStatus).toEqual({
      isPending: true,
      hasError: false,
      source: promise,
      hasValue: false,
    });
  });
  it("emits a success status once promise resolves", async () => {
    // Arrange
    const trackedSequence = new TrackedPromiseSequence();
    const { promise, resolve } = makePromise<string, string>();
    const next = jest.fn();
    // Act
    trackedSequence.statuses.subscribe({ next });
    trackedSequence.next(promise);
    resolve("value");
    await promise;
    // Assert
    expect(next).toHaveBeenCalledWith({
      isPending: false,
      hasError: false,
      source: promise,
      hasValue: true,
      value: "value",
    });
    expect(trackedSequence.currentStatus).toEqual({
      isPending: false,
      hasError: false,
      source: promise,
      hasValue: true,
      value: "value",
    });
  });
  it("does not complete once promise resolves", async () => {
    // Arrange
    const trackedSequence = new TrackedPromiseSequence();
    const { promise, resolve } = makePromise<string, string>();
    const complete = jest.fn();
    // Act
    trackedSequence.statuses.subscribe({ complete });
    trackedSequence.next(promise);
    resolve("value");
    await promise;
    // Assert
    expect(complete).not.toHaveBeenCalled();
  });
  it("emits a pending status with prior value immediately after being given a second promise", async () => {
    // Arrange
    const trackedSequence = new TrackedPromiseSequence();
    const { promise: promise1, resolve: resolve1 } = makePromise<
      string,
      string
    >();
    const { promise: promise2 } = makePromise<string, string>();
    const next = jest.fn();
    // Act
    trackedSequence.statuses.subscribe({ next });
    trackedSequence.next(promise1);
    resolve1("value1");
    await promise1;
    trackedSequence.next(promise2);
    // Assert
    expect(next).toHaveBeenCalledWith({
      isPending: true,
      hasError: false,
      source: promise2,
      hasValue: true,
      value: "value1",
    });
    expect(trackedSequence.currentStatus).toEqual({
      isPending: true,
      hasError: false,
      source: promise2,
      hasValue: true,
      value: "value1",
    });
  });
  it("does not emit a success status if promise is switched before the first resolves", async () => {
    // Arrange
    const trackedSequence = new TrackedPromiseSequence();
    const { promise: promise1, resolve: resolve1 } = makePromise<
      string,
      string
    >();
    const { promise: promise2 } = makePromise<string, string>();
    const next = jest.fn();
    // Act
    trackedSequence.statuses.subscribe({ next });
    trackedSequence.next(promise1);
    trackedSequence.next(promise2);
    resolve1("value1");
    await promise1;
    // Assert
    expect(next).not.toHaveBeenCalledWith({
      isPending: true,
      hasError: false,
      source: promise1,
      hasValue: true,
      value: "value1",
    });
    expect(next).toHaveBeenCalledWith({
      isPending: true,
      hasError: false,
      source: promise2,
      hasValue: false,
    });
    expect(trackedSequence.currentStatus).toEqual({
      isPending: true,
      hasError: false,
      source: promise2,
      hasValue: false,
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
  return { promise, resolve, reject };
}
