import { makeTestPromise } from "../testUtility/makeTestPromise";
import { initialStatus } from "./PromiseStatus";
import { TrackedPromiseSequence } from "./TrackedPromiseSequence";

describe("TrackedPromiseSequence", () => {
  describe("currentStatus", () => {
    it("is the initial status immediately", async () => {
      // Arrange
      const trackedSequence = new TrackedPromiseSequence();
      // Act
      // Assert
      expect(trackedSequence.currentStatus).toBe(initialStatus);
    });
    it("is a pending status immediately after being given a promise", async () => {
      // Arrange
      const trackedSequence = new TrackedPromiseSequence();
      const { promise } = makeTestPromise<string, string>();
      // Act
      trackedSequence.next(promise);
      // Assert
      expect(trackedSequence.currentStatus).toEqual({
        isPending: true,
        hasError: false,
        source: promise,
        hasValue: false,
      });
    });
    it("is a success status once promise resolves", async () => {
      // Arrange
      const trackedSequence = new TrackedPromiseSequence();
      const { promise, resolve } = makeTestPromise<string, string>();
      // Act
      trackedSequence.next(promise);
      resolve("value");
      await promise;
      // Assert
      expect(trackedSequence.currentStatus).toEqual({
        isPending: false,
        hasError: false,
        source: promise,
        hasValue: true,
        value: "value",
      });
    });
    it("is a pending status with prior value immediately after being given a second promise", async () => {
      // Arrange
      const trackedSequence = new TrackedPromiseSequence();
      const { promise: promise1, resolve: resolve1 } = makeTestPromise<
        string,
        string
      >();
      const { promise: promise2 } = makeTestPromise<string, string>();
      // Act
      trackedSequence.next(promise1);
      resolve1("value1");
      await promise1;
      trackedSequence.next(promise2);
      // Assert
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
      const { promise: promise1, resolve: resolve1 } = makeTestPromise<
        string,
        string
      >();
      const { promise: promise2 } = makeTestPromise<string, string>();
      // Act
      trackedSequence.next(promise1);
      trackedSequence.next(promise2);
      resolve1("value1");
      await promise1;
      // Assert
      expect(trackedSequence.currentStatus).toEqual({
        isPending: true,
        hasError: false,
        source: promise2,
        hasValue: false,
      });
    });
  });
  describe("statusChanges", () => {
    it("does not emit upon subscribe", async () => {
      // Arrange
      const trackedSequence = new TrackedPromiseSequence();
      const next = jest.fn();
      // Act
      trackedSequence.statusChanges.subscribe({ next });
      // Assert
      expect(next).not.toHaveBeenCalled();
    });
    it("does not emit upon subscribe even after new promise", async () => {
      // Arrange
      const trackedSequence = new TrackedPromiseSequence();
      const { promise } = makeTestPromise<string, string>();
      trackedSequence.next(promise);
      const next = jest.fn();
      // Act
      trackedSequence.statusChanges.subscribe({ next });
      // Assert
      expect(next).not.toHaveBeenCalled();
    });
    it("emits a pending status immediately after being given a promise", async () => {
      // Arrange
      const trackedSequence = new TrackedPromiseSequence();
      const { promise } = makeTestPromise<string, string>();
      const next = jest.fn();
      // Act
      trackedSequence.statusChanges.subscribe({ next });
      trackedSequence.next(promise);
      // Assert
      expect(next).toHaveBeenLastCalledWith({
        isPending: true,
        hasError: false,
        source: promise,
        hasValue: false,
      });
    });
    it("emits a success status when promise resolves (even when subscribing after setting promise)", async () => {
      // Arrange
      const trackedSequence = new TrackedPromiseSequence();
      const { promise, resolve } = makeTestPromise<string, string>();
      const next = jest.fn();
      // Act
      trackedSequence.next(promise);
      trackedSequence.statusChanges.subscribe({ next });
      resolve("value");
      await promise;
      // Assert
      expect(next).toHaveBeenLastCalledWith({
        isPending: false,
        hasError: false,
        source: promise,
        hasValue: true,
        value: "value",
      });
    });
    it("does not complete when promise resolves", async () => {
      // Arrange
      const trackedSequence = new TrackedPromiseSequence();
      const { promise, resolve } = makeTestPromise<string, string>();
      const complete = jest.fn();
      // Act
      trackedSequence.statusChanges.subscribe({ complete });
      trackedSequence.next(promise);
      resolve("value");
      await promise;
      // Assert
      expect(complete).not.toHaveBeenCalled();
    });
    it("emits a pending status with prior value immediately after being given a second promise", async () => {
      // Arrange
      const trackedSequence = new TrackedPromiseSequence();
      const { promise: promise1, resolve: resolve1 } = makeTestPromise<
        string,
        string
      >();
      const { promise: promise2 } = makeTestPromise<string, string>();
      const next = jest.fn();
      // Act
      trackedSequence.statusChanges.subscribe({ next });
      trackedSequence.next(promise1);
      resolve1("value1");
      await promise1;
      trackedSequence.next(promise2);
      // Assert
      expect(next).toHaveBeenLastCalledWith({
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
      const { promise: promise1, resolve: resolve1 } = makeTestPromise<
        string,
        string
      >();
      const { promise: promise2 } = makeTestPromise<string, string>();
      const next = jest.fn();
      // Act
      trackedSequence.statusChanges.subscribe({ next });
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
      expect(next).toHaveBeenLastCalledWith({
        isPending: true,
        hasError: false,
        source: promise2,
        hasValue: false,
      });
    });
  });
  describe("statuses", () => {
    it("emits an initial status immediately upon subscribe", async () => {
      // Arrange
      const trackedSequence = new TrackedPromiseSequence();
      const next = jest.fn();
      // Act
      trackedSequence.statuses.subscribe({ next });
      // Assert
      expect(next).toHaveBeenLastCalledWith(initialStatus);
    });
    it("emits a pending status immediately after being given a promise", async () => {
      // Arrange
      const trackedSequence = new TrackedPromiseSequence();
      const { promise } = makeTestPromise<string, string>();
      const next = jest.fn();
      // Act
      trackedSequence.statuses.subscribe({ next });
      trackedSequence.next(promise);
      // Assert
      expect(next).toHaveBeenLastCalledWith({
        isPending: true,
        hasError: false,
        source: promise,
        hasValue: false,
      });
    });
    it("emits a success status once promise resolves", async () => {
      // Arrange
      const trackedSequence = new TrackedPromiseSequence();
      const { promise, resolve } = makeTestPromise<string, string>();
      const next = jest.fn();
      // Act
      trackedSequence.statuses.subscribe({ next });
      trackedSequence.next(promise);
      resolve("value");
      await promise;
      // Assert
      expect(next).toHaveBeenLastCalledWith({
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
      const { promise, resolve } = makeTestPromise<string, string>();
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
      const { promise: promise1, resolve: resolve1 } = makeTestPromise<
        string,
        string
      >();
      const { promise: promise2 } = makeTestPromise<string, string>();
      const next = jest.fn();
      // Act
      trackedSequence.statuses.subscribe({ next });
      trackedSequence.next(promise1);
      resolve1("value1");
      await promise1;
      trackedSequence.next(promise2);
      // Assert
      expect(next).toHaveBeenLastCalledWith({
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
      const { promise: promise1, resolve: resolve1 } = makeTestPromise<
        string,
        string
      >();
      const { promise: promise2 } = makeTestPromise<string, string>();
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
      expect(next).toHaveBeenLastCalledWith({
        isPending: true,
        hasError: false,
        source: promise2,
        hasValue: false,
      });
    });
  });
});
