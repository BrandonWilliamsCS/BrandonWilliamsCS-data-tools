import { makeTestPromise } from "../testUtility/makeTestPromise";
import { AsyncStatus } from "./AsyncStatus";
import { trackPromise } from "./trackPromise";

describe("trackPromise", () => {
  it("calls the change callback immediately with a pending status", async () => {
    // Arrange
    const { promise } = makeTestPromise<string, string>();
    const handleChange = jest.fn();
    // Act
    trackPromise(promise, handleChange);
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
    const { promise } = makeTestPromise<string, string>();
    const handleChange = jest.fn();
    // Act
    const result = trackPromise(promise, handleChange);
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
    const { promise } = makeTestPromise<string, string>();
    const handleChange = jest.fn();
    const previous: AsyncStatus<string, string> = {
      isPending: false,
      hasError: false,
      source: makeTestPromise<string, string>().promise,
      hasValue: true,
      value: "prev-value",
    };
    // Act
    trackPromise(promise, handleChange, previous);
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
    const { promise, resolve } = makeTestPromise<string, string>();
    const handleChange = jest.fn();
    // Act
    trackPromise(promise, handleChange);
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
    const { promise, reject } = makeTestPromise<string, string>();
    const handleChange = jest.fn();
    // Act
    trackPromise(promise, handleChange);
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
