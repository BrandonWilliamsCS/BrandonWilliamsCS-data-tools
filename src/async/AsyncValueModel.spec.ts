import {
  makeTestPromise,
  TestPromiseSet,
} from "../testUtility/makeTestPromise";
import { initialStatus } from "./AsyncStatus";
import { AsyncValueModel } from "./AsyncValueModel";

describe("AsyncValueModel", () => {
  describe("reload", () => {
    it("returns the tracked promise from the operation", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const valueModel = new AsyncValueModel(operation);
      // Act
      const result = valueModel.reload();
      // Assert
      expect(result.promise).toBe(promiseSets[0].promise);
    });
  });
  describe("signalDemand", () => {
    it("triggers initial reload if not yet triggered", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const valueModel = new AsyncValueModel(operation);
      // Act
      valueModel.signalDemand();
      // Assert
      expect(operation).toHaveBeenCalledTimes(1);
    });
    it("does nothing if reload has previously been triggered", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const valueModel = new AsyncValueModel(operation);
      // Act
      valueModel.reload();
      valueModel.signalDemand();
      // Assert
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });
  describe("currentStatus", () => {
    it("is the initial status before executing", async () => {
      // Arrange
      const { operation } = makeTestOperation();
      const valueModel = new AsyncValueModel(operation);
      // Act
      // Assert
      expect(valueModel.currentStatus).toBe(initialStatus);
    });
    it("is a pending status immediately after executing", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const valueModel = new AsyncValueModel(operation);
      // Act
      valueModel.reload();
      // Assert
      expect(valueModel.currentStatus).toEqual({
        isPending: true,
        hasError: false,
        source: promiseSets[0].promise,
        hasValue: false,
      });
    });
    it("is a success status once execution resolves", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const valueModel = new AsyncValueModel(operation);
      // Act
      valueModel.reload();
      promiseSets[0].resolve("result");
      await promiseSets[0].promise;
      // Assert
      expect(valueModel.currentStatus).toEqual({
        isPending: false,
        hasError: false,
        source: promiseSets[0].promise,
        hasValue: true,
        value: "result",
      });
    });
    it("is a pending status immediately after a second execution", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const valueModel = new AsyncValueModel(operation);
      // Act
      valueModel.reload();
      promiseSets[0].resolve("result1");
      await promiseSets[0].promise;
      valueModel.reload();
      // Assert
      expect(valueModel.currentStatus).toEqual(
        expect.objectContaining({
          isPending: true,
          source: promiseSets[1].promise,
        }),
      );
    });
    it("maintains value from prior execution", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const valueModel = new AsyncValueModel(operation);
      // Act
      valueModel.reload();
      promiseSets[0].resolve("result1");
      await promiseSets[0].promise;
      valueModel.reload();
      // Assert
      expect(valueModel.currentStatus).toEqual(
        expect.objectContaining({
          hasValue: true,
          value: "result1",
        }),
      );
    });
    it("is not a success status if second execution happens before the first resolves", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const valueModel = new AsyncValueModel(operation);
      // Act
      valueModel.reload();
      valueModel.reload();
      promiseSets[0].resolve("result1");
      await promiseSets[0].promise;
      // Assert
      expect(valueModel.currentStatus).toEqual({
        isPending: true,
        hasError: false,
        source: promiseSets[1].promise,
        hasValue: false,
      });
    });
  });
  describe("statusChanges", () => {
    it("does not emit upon subscribe", async () => {
      // Arrange
      const { operation } = makeTestOperation();
      const valueModel = new AsyncValueModel(operation);
      const next = jest.fn();
      // Act
      valueModel.statusChanges.subscribe({ next });
      // Assert
      expect(next).not.toHaveBeenCalled();
    });
    it("does not emit upon subscribe even after execution", async () => {
      // Arrange
      const { operation } = makeTestOperation();
      const valueModel = new AsyncValueModel(operation);
      valueModel.reload();
      const next = jest.fn();
      // Act
      valueModel.statusChanges.subscribe({ next });
      // Assert
      expect(next).not.toHaveBeenCalled();
    });
    it("emits a pending status immediately after execution", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const valueModel = new AsyncValueModel(operation);
      const next = jest.fn();
      // Act
      valueModel.statusChanges.subscribe({ next });
      valueModel.reload();
      // Assert
      expect(next).toHaveBeenLastCalledWith({
        isPending: true,
        hasError: false,
        source: promiseSets[0].promise,
        hasValue: false,
      });
    });
    it("emits a success status when execution resolves (even when subscribing after execution starts)", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const valueModel = new AsyncValueModel(operation);
      const next = jest.fn();
      // Act
      valueModel.reload();
      valueModel.statusChanges.subscribe({ next });
      promiseSets[0].resolve("result");
      await promiseSets[0].promise;
      // Assert
      expect(next).toHaveBeenLastCalledWith({
        isPending: false,
        hasError: false,
        source: promiseSets[0].promise,
        hasValue: true,
        value: "result",
      });
    });
    it("does not complete when execution resolves", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const valueModel = new AsyncValueModel(operation);
      const complete = jest.fn();
      // Act
      valueModel.statusChanges.subscribe({ complete });
      valueModel.reload();
      promiseSets[0].resolve("result");
      await promiseSets[0].promise;
      // Assert
      expect(complete).not.toHaveBeenCalled();
    });
    it("emits a pending status immediately after a second execution", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const valueModel = new AsyncValueModel(operation);
      const next = jest.fn();
      // Act
      valueModel.statusChanges.subscribe({ next });
      valueModel.reload();
      promiseSets[0].resolve("result1");
      await promiseSets[0].promise;
      valueModel.reload();
      // Assert
      expect(next).toHaveBeenLastCalledWith(
        expect.objectContaining({
          isPending: true,
          source: promiseSets[1].promise,
        }),
      );
    });
    it("maintains value from prior execution", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const valueModel = new AsyncValueModel(operation);
      const { promise: promise2 } = makeTestPromise<string, string>();
      const next = jest.fn();
      // Act
      valueModel.statusChanges.subscribe({ next });
      valueModel.reload();
      promiseSets[0].resolve("result1");
      await promiseSets[0].promise;
      valueModel.reload();
      // Assert
      expect(next).toHaveBeenLastCalledWith(
        expect.objectContaining({
          hasValue: true,
          value: "result1",
        }),
      );
    });
    it("does not emit a success status if second execution happens before the first resolves", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const valueModel = new AsyncValueModel(operation);
      const next = jest.fn();
      // Act
      valueModel.statusChanges.subscribe({ next });
      valueModel.reload();
      valueModel.reload();
      promiseSets[0].resolve("result1");
      await promiseSets[0].promise;
      // Assert
      expect(next).not.toHaveBeenCalledWith({
        isPending: true,
        hasError: false,
        source: promiseSets[0].promise,
        hasValue: true,
        value: "result1",
      });
      expect(next).toHaveBeenLastCalledWith({
        isPending: true,
        hasError: false,
        source: promiseSets[1].promise,
        hasValue: false,
      });
    });
  });
});

function makeTestOperation() {
  const promiseSets: Array<TestPromiseSet<string, string>> = [];
  const operation: () => Promise<string> = jest.fn().mockImplementation(() => {
    const promiseSet = makeTestPromise<string, string>();
    promiseSets.push(promiseSet);
    return promiseSet.promise;
  });
  return { operation, promiseSets };
}
