import { processPromise, succeed, fail, PromiseStatus } from "./PromiseStatus";

describe("processPromise", () => {
  it("maintains the promise as a source", () => {
    // Arrange
    const promise = new Promise(() => {});
    // Act
    const status = processPromise(promise);
    // Assert
    expect(status.source).toBe(promise);
  });

  it("produces a pending status", () => {
    // Arrange
    const promise = new Promise(() => {});
    // Act
    const status = processPromise(promise);
    // Assert
    expect(status.isPending).toBe(true);
  });
  it("produces a status with no errors", () => {
    // Arrange
    const promise = new Promise(() => {});
    // Act
    const status = processPromise(promise);
    // Assert
    expect(status.hasError).toBe(false);
  });
  it("produces a status with no value when first", () => {
    // Arrange
    const promise = new Promise(() => {});
    // Act
    const status = processPromise(promise);
    // Assert
    expect(status.hasValue).toBe(false);
  });
  it("produces a status with no value when following a status with no value", () => {
    // Arrange
    const promise = new Promise(() => {});
    const previousStatus: PromiseStatus<number> = {
      isPending: false,
      hasValue: false,
      hasError: false,
      source: new Promise(() => {}),
    };
    // Act
    const status = processPromise(promise, previousStatus);
    // Assert
    expect(status.hasValue).toBe(false);
  });
  it("produces a status that maintains the previous value", () => {
    // Arrange
    const promise = new Promise(() => {});
    const previousStatus: PromiseStatus<number> = {
      isPending: false,
      hasValue: true,
      value: 5,
      hasError: false,
      source: new Promise(() => {}),
    };
    // Act
    const status = processPromise(promise, previousStatus);
    // Assert
    expect(status.hasValue).toBe(true);
    if (!status.hasValue) return;
    expect(status.value).toBe(5);
  });
});

describe("succeed", () => {
  it("maintains the promise source", () => {
    // Arrange
    const source = new Promise<number>(() => {});
    const previousStatus: PromiseStatus<number> = {
      isPending: true,
      hasValue: false,
      hasError: false,
      source,
    };
    // Act
    const status = succeed(previousStatus, 5);
    // Assert
    expect(status.source).toBe(source);
  });
  it("produces a non-pending status", () => {
    // Arrange
    const source = new Promise<number>(() => {});
    const previousStatus: PromiseStatus<number> = {
      isPending: true,
      hasValue: false,
      hasError: false,
      source,
    };
    // Act
    const status = succeed(previousStatus, 5);
    // Assert
    expect(status.isPending).toBe(false);
  });
  it("produces a status with no errors", () => {
    // Arrange
    const source = new Promise<number>(() => {});
    const previousStatus: PromiseStatus<number> = {
      isPending: true,
      hasValue: false,
      hasError: false,
      source,
    };
    // Act
    const status = succeed(previousStatus, 5);
    // Assert
    expect(status.hasError).toBe(false);
  });
  it("produces a status with the provided value", () => {
    // Arrange
    const source = new Promise<number>(() => {});
    const previousStatus: PromiseStatus<number> = {
      isPending: true,
      hasValue: false,
      hasError: false,
      source,
    };
    // Act
    const status = succeed(previousStatus, 5);
    // Assert
    expect(status.hasValue).toBe(true);
    if (!status.hasValue) return;
    expect(status.value).toBe(5);
  });
});

describe("fail", () => {
  it("maintains the promise source", () => {
    // Arrange
    const source = new Promise<number>(() => {});
    const previousStatus: PromiseStatus<number, Error> = {
      isPending: true,
      hasValue: false,
      hasError: false,
      source,
    };
    const error = new Error("Oops!");
    // Act
    const status = fail(previousStatus, error);
    // Assert
    expect(status.source).toBe(source);
  });
  it("produces a non-pending status", () => {
    // Arrange
    const source = new Promise<number>(() => {});
    const previousStatus: PromiseStatus<number, Error> = {
      isPending: true,
      hasValue: false,
      hasError: false,
      source,
    };
    const error = new Error("Oops!");
    // Act
    const status = fail(previousStatus, error);
    // Assert
    expect(status.isPending).toBe(false);
  });
  it("produces a status with the provided error", () => {
    // Arrange
    const source = new Promise<number>(() => {});
    const previousStatus: PromiseStatus<number, Error> = {
      isPending: true,
      hasValue: false,
      hasError: false,
      source,
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
    const source = new Promise<number>(() => {});
    const previousStatus: PromiseStatus<number, Error> = {
      isPending: true,
      hasValue: false,
      hasError: false,
      source,
    };
    const error = new Error("Oops!");
    // Act
    const status = fail(previousStatus, error);
    // Assert
    expect(status.hasValue).toBe(false);
  });
  it("produces a status that maintains the previous value", () => {
    // Arrange
    const source = new Promise<number>(() => {});
    const previousStatus: PromiseStatus<number, Error> = {
      isPending: true,
      hasValue: true,
      value: 5,
      hasError: false,
      source,
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
