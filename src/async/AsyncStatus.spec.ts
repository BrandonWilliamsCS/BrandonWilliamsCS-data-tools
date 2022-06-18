import {
  process,
  succeed,
  fail,
  AsyncStatus,
  mapAsyncStatus,
} from "./AsyncStatus";

describe("process", () => {
  it("produces a pending status", () => {
    // Arrange
    // Act
    const status = process();
    // Assert
    expect(status.isPending).toBe(true);
  });
  it("produces a status with no errors", () => {
    // Arrange
    // Act
    const status = process();
    // Assert
    expect(status.hasError).toBe(false);
  });
  it("produces a status with no value when first", () => {
    // Arrange
    // Act
    const status = process();
    // Assert
    expect(status.hasValue).toBe(false);
  });
  it("produces a status with no value when following a status with no value", () => {
    // Arrange
    const previousStatus: AsyncStatus<number> = {
      isPending: false,
      hasValue: false,
      hasError: false,
    };
    // Act
    const status = process(previousStatus);
    // Assert
    expect(status.hasValue).toBe(false);
  });
  it("produces a status that maintains the previous value", () => {
    // Arrange
    const previousStatus: AsyncStatus<number> = {
      isPending: false,
      hasValue: true,
      value: 5,
      hasError: false,
    };
    // Act
    const status = process(previousStatus);
    // Assert
    expect(status.hasValue).toBe(true);
    if (!status.hasValue) return;
    expect(status.value).toBe(5);
  });
});

describe("succeed", () => {
  it("produces a non-pending status", () => {
    // Arrange
    // Act
    const status = succeed(5);
    // Assert
    expect(status.isPending).toBe(false);
  });
  it("produces a status with no errors", () => {
    // Arrange
    // Act
    const status = succeed(5);
    // Assert
    expect(status.hasError).toBe(false);
  });
  it("produces a status with the provided value", () => {
    // Arrange
    // Act
    const status = succeed(5);
    // Assert
    expect(status.hasValue).toBe(true);
    if (!status.hasValue) return;
    expect(status.value).toBe(5);
  });
});

describe("fail", () => {
  it("produces a non-pending status", () => {
    // Arrange
    const previousStatus: AsyncStatus<number, Error> = {
      isPending: true,
      hasValue: false,
      hasError: false,
    };
    const error = new Error("Oops!");
    // Act
    const status = fail(previousStatus, error);
    // Assert
    expect(status.isPending).toBe(false);
  });
  it("produces a status with the provided error", () => {
    // Arrange
    const previousStatus: AsyncStatus<number, Error> = {
      isPending: true,
      hasValue: false,
      hasError: false,
    };
    const error = new Error("Oops!");
    // Act
    const status = fail(previousStatus, error);
    // Assert
    expect(status.hasError).toBe(true);
    if (!status.hasError) return;
    expect(status.error).toBe(error);
  });
  it("produces a status with no value when following a status with no value", () => {
    // Arrange
    const previousStatus: AsyncStatus<number, Error> = {
      isPending: true,
      hasValue: false,
      hasError: false,
    };
    const error = new Error("Oops!");
    // Act
    const status = fail(previousStatus, error);
    // Assert
    expect(status.hasValue).toBe(false);
  });
  it("produces a status that maintains the previous value", () => {
    // Arrange
    const previousStatus: AsyncStatus<number, Error> = {
      isPending: true,
      hasValue: true,
      value: 5,
      hasError: false,
    };
    const error = new Error("Oops!");
    // Act
    const status = fail(previousStatus, error);
    // Assert
    expect(status.hasValue).toBe(true);
    if (!status.hasValue) return;
    expect(status.value).toBe(5);
  });
});

describe("mapAsyncStatus", () => {
  it("preserves pending and error state from the base status", () => {
    // Arrange
    const baseStatus: AsyncStatus<number> = {
      isPending: false,
      hasValue: false,
      hasError: true,
      error: new Error("Test Error"),
    };
    const mapper = (n: number) => n.toString();
    // Act
    const mappedStatus = mapAsyncStatus(baseStatus, mapper);
    // Assert
    expect(mappedStatus).toMatchObject({
      isPending: false,
      hasError: true,
      error: new Error("Test Error"),
    });
  });
  it("uses the provided source promise when given", () => {
    // Arrange
    const baseStatus: AsyncStatus<number> = {
      isPending: false,
      hasValue: false,
      hasError: false,
    };
    const mapper = (n: number) => n.toString();
    // Act
    const mappedStatus = mapAsyncStatus(baseStatus, mapper);
    // Assert
    expect(mappedStatus.hasValue).toBe(false);
  });
  it("maps values when present in base", () => {
    // Arrange
    const baseStatus: AsyncStatus<number> = {
      isPending: false,
      hasValue: true,
      value: 1,
      hasError: false,
    };
    const mapper = (n: number) => n.toString();
    // Act
    const mappedStatus = mapAsyncStatus(baseStatus, mapper);
    // Assert
    expect(mappedStatus.hasValue && mappedStatus.value).toBe("1");
  });
});
