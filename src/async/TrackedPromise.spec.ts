import { makeTestPromise } from "../testUtility/makeTestPromise";
import { TrackedPromise } from "./TrackedPromise";

describe("TrackedPromise", () => {
  describe("currentStatus", () => {
    it("emits a pending status initially", async () => {
      // Arrange
      const { promise } = makeTestPromise<string, string>();
      // Act
      const tracked = new TrackedPromise(promise);
      // Assert
      expect(tracked.currentStatus).toEqual({
        isPending: true,
        hasError: false,
        source: promise,
        hasValue: false,
      });
    });
    it("is a success status when promise resolves", async () => {
      // Arrange
      const { promise, resolve } = makeTestPromise<string, string>();
      const tracked = new TrackedPromise(promise);
      // Act
      resolve("value");
      await promise.then(
        () => {},
        () => {},
      );
      // Assert
      expect(tracked.currentStatus).toEqual({
        isPending: false,
        hasError: false,
        source: promise,
        hasValue: true,
        value: "value",
      });
    });
    it("is an error status after promise rejects", async () => {
      // Arrange
      const { promise, reject } = makeTestPromise<string, string>();
      const tracked = new TrackedPromise(promise);
      // Act
      reject("error");
      await promise.then(
        () => {},
        () => {},
      );
      // Assert
      expect(tracked.currentStatus).toEqual({
        isPending: false,
        hasError: true,
        error: "error",
        source: promise,
        hasValue: false,
      });
    });
    it("maintains value from previous status", async () => {
      // Arrange
      const { promise } = makeTestPromise<string, string>();
      const previousStatus = {
        isPending: false,
        hasError: false,
        source: new Promise<string>(() => {}),
        hasValue: true,
        value: "previousValue",
      } as const;
      // Act
      const tracked = new TrackedPromise(promise, previousStatus);
      // Assert
      expect(tracked.currentStatus).toEqual({
        isPending: true,
        hasError: false,
        source: promise,
        hasValue: true,
        value: "previousValue",
      });
    });
  });
  describe("statusChanges", () => {
    it("does not emit upon subscribe", async () => {
      // Arrange
      const { promise } = makeTestPromise<string, string>();
      const tracked = new TrackedPromise(promise);
      const next = jest.fn();
      // Act
      tracked.statusChanges.subscribe({ next });
      // Assert
      expect(next).not.toHaveBeenCalled();
    });
    it("emits a success status when promise resolves", async () => {
      // Arrange
      const { promise, resolve } = makeTestPromise<string, string>();
      const tracked = new TrackedPromise(promise);
      const next = jest.fn();
      // Act
      tracked.statusChanges.subscribe({ next });
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
    });
    it("emits complete when promise resolves", async () => {
      // Arrange
      const { promise, resolve } = makeTestPromise<string, string>();
      const tracked = new TrackedPromise(promise);
      const complete = jest.fn();
      // Act
      tracked.statusChanges.subscribe({ complete });
      resolve("value");
      await promise.then(
        () => {},
        () => {},
      );
      // Assert
      expect(complete).toHaveBeenCalled();
    });
    it("emits an error status when promise rejects", async () => {
      // Arrange
      const { promise, reject } = makeTestPromise<string, string>();
      const tracked = new TrackedPromise(promise);
      const next = jest.fn();
      // Act
      tracked.statusChanges.subscribe({ next });
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
    });
    it("emits complete when promise rejects", async () => {
      // Arrange
      const { promise, reject } = makeTestPromise<string, string>();
      const tracked = new TrackedPromise(promise);
      const complete = jest.fn();
      // Act
      tracked.statusChanges.subscribe({ complete });
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
      const { promise, reject } = makeTestPromise<string, string>();
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
      tracked.statusChanges.subscribe({ next });
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
        hasValue: true,
        value: "previousValue",
      });
    });
  });
  describe("promise behavior", () => {
    it("is `await`able to the promised value", async () => {
      // Arrange
      const { promise, resolve } = makeTestPromise<string, string>();
      const tracked = new TrackedPromise(promise);
      // Act
      resolve("result");
      const result = await tracked;
      // Assert
      expect(result).toEqual("result");
    });
  });
});
