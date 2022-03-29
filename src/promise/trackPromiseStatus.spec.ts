import { makeTestPromise } from "../testUtility/makeTestPromise";
import { PromiseStatus } from "./PromiseStatus";
import { trackPromiseStatus } from "./trackPromiseStatus";

describe("trackPromiseStatus", () => {
  it("calls the change callback immediately with a pending status", async () => {
    // Arrange
    const { promise } = makeTestPromise<string, string>();
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
    const { promise } = makeTestPromise<string, string>();
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
    const { promise } = makeTestPromise<string, string>();
    const handleChange = jest.fn();
    const previous: PromiseStatus<string, string> = {
      isPending: false,
      hasError: false,
      source: makeTestPromise<string, string>().promise,
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
    const { promise, resolve } = makeTestPromise<string, string>();
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
    const { promise, reject } = makeTestPromise<string, string>();
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
