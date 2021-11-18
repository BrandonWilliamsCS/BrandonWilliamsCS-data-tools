import { PromiseStatus } from "./PromiseStatus";
import { trackPromiseStatus } from "./trackPromiseStatus";

describe("trackPromiseStatus", () => {
  it("calls the change callback immediately with a pending status", async () => {
    // Arrange
    const { promise } = makePromise<string, string>();
    const handleChange = jest.fn();
    // Act
    trackPromiseStatus(promise, handleChange);
    // Assert
    expect(handleChange).toHaveBeenCalledWith({
      isPending: true,
      hasError: false,
      source: promise,
      hasValue: false,
    });
  });
  it("syncronously returns the pending status", () => {
    // Arrange
    const { promise } = makePromise<string, string>();
    const handleChange = jest.fn();
    // Act
    const result = trackPromiseStatus(promise, handleChange);
    // Assert
    expect(result).toEqual({
      isPending: true,
      hasError: false,
      source: promise,
      hasValue: false,
    });
  });
  it("calls the change callback immediately with a pending status containing a previous value", async () => {
    // Arrange
    const { promise } = makePromise<string, string>();
    const handleChange = jest.fn();
    const previous: PromiseStatus<string, string> = {
      isPending: false,
      hasError: false,
      source: makePromise<string, string>().promise,
      hasValue: true,
      value: "prev-value",
    };
    // Act
    trackPromiseStatus(promise, handleChange, previous);
    // Assert
    expect(handleChange).toHaveBeenCalledWith({
      isPending: true,
      hasError: false,
      source: promise,
      hasValue: true,
      value: "prev-value",
    });
  });
  it("calls the change callback upon success with value status", async () => {
    // Arrange
    const { promise, resolve } = makePromise<string, string>();
    const handleChange = jest.fn();
    // Act
    trackPromiseStatus(promise, handleChange);
    resolve("success");
    await promise;
    // Assert
    expect(handleChange).toHaveBeenCalledWith({
      isPending: false,
      hasError: false,
      source: promise,
      hasValue: true,
      value: "success",
    });
  });
  it("calls the change callback upon failure with error status", async () => {
    // Arrange
    const { promise, reject } = makePromise<string, string>();
    const handleChange = jest.fn();
    // Act
    trackPromiseStatus(promise, handleChange);
    reject("error");
    await promise.catch(() => {});
    // Assert
    expect(handleChange).toHaveBeenCalledWith({
      isPending: false,
      source: promise,
      hasValue: false,
      hasError: true,
      error: "error",
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
