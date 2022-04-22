import { initialStatus, TrackedPromise } from "../promise";
import {
  makeTestPromise,
  TestPromiseSet,
} from "../testUtility/makeTestPromise";
import { Operation } from "./Operation";
import { OperationModel } from "./OperationModel";

describe("OperationModel", () => {
  describe("execute", () => {
    it("calls operation with params", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const operationModel = new OperationModel(operation);
      // Act
      operationModel.execute("parameter1");
      // Assert
      expect(operation).toHaveBeenLastCalledWith("parameter1");
    });
    it("returns the tracked promise from the operation", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const operationModel = new OperationModel(operation);
      // Act
      const result = operationModel.execute("parameter1");
      // Assert
      expect(result.promise).toBe(promiseSets[0].promise);
    });
  });
  describe("currentStatus", () => {
    it("is the initial status before executing", async () => {
      // Arrange
      const { operation } = makeTestOperation();
      const operationModel = new OperationModel(operation);
      // Act
      // Assert
      expect(operationModel.currentStatus).toBe(initialStatus);
    });
    it("is a pending status immediately after executing", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const operationModel = new OperationModel(operation);
      // Act
      operationModel.execute("parameter");
      // Assert
      expect(operationModel.currentStatus).toEqual({
        isPending: true,
        hasError: false,
        source: promiseSets[0].promise,
        hasValue: false,
      });
    });
    it("is a success status once execution resolves", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const operationModel = new OperationModel(operation);
      // Act
      operationModel.execute("parameter");
      promiseSets[0].resolve("result");
      await promiseSets[0].promise;
      // Assert
      expect(operationModel.currentStatus).toEqual({
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
      const operationModel = new OperationModel(operation);
      // Act
      operationModel.execute("parameter1");
      promiseSets[0].resolve("result1");
      await promiseSets[0].promise;
      operationModel.execute("parameter2");
      // Assert
      expect(operationModel.currentStatus).toEqual({
        isPending: true,
        hasError: false,
        source: promiseSets[1].promise,
        hasValue: false,
      });
    });
    it("maintains value from prior execution when instructed", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const operationModel = new OperationModel(operation, true);
      // Act
      operationModel.execute("parameter1");
      promiseSets[0].resolve("result1");
      await promiseSets[0].promise;
      operationModel.execute("parameter2");
      // Assert
      expect(operationModel.currentStatus).toEqual(
        expect.objectContaining({
          hasValue: true,
          value: "result1",
        }),
      );
    });
    it("is not a success status if second execution happens before the first resolves", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const operationModel = new OperationModel(operation);
      // Act
      operationModel.execute("parameter1");
      operationModel.execute("parameter2");
      promiseSets[0].resolve("result1");
      await promiseSets[0].promise;
      // Assert
      expect(operationModel.currentStatus).toEqual({
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
      const operationModel = new OperationModel(operation);
      const next = jest.fn();
      // Act
      operationModel.statusChanges.subscribe({ next });
      // Assert
      expect(next).not.toHaveBeenCalled();
    });
    it("does not emit upon subscribe even after execution", async () => {
      // Arrange
      const { operation } = makeTestOperation();
      const operationModel = new OperationModel(operation);
      operationModel.execute("parameter");
      const next = jest.fn();
      // Act
      operationModel.statusChanges.subscribe({ next });
      // Assert
      expect(next).not.toHaveBeenCalled();
    });
    it("emits a pending status immediately after execution", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const operationModel = new OperationModel(operation);
      const next = jest.fn();
      // Act
      operationModel.statusChanges.subscribe({ next });
      operationModel.execute("parameter");
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
      const operationModel = new OperationModel(operation);
      const next = jest.fn();
      // Act
      operationModel.execute("parameter");
      operationModel.statusChanges.subscribe({ next });
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
      const operationModel = new OperationModel(operation);
      const complete = jest.fn();
      // Act
      operationModel.statusChanges.subscribe({ complete });
      operationModel.execute("parameter");
      promiseSets[0].resolve("result");
      await promiseSets[0].promise;
      // Assert
      expect(complete).not.toHaveBeenCalled();
    });
    it("emits a pending status immediately after a second execution", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const operationModel = new OperationModel(operation);
      const { promise: promise2 } = makeTestPromise<string, string>();
      const next = jest.fn();
      // Act
      operationModel.statusChanges.subscribe({ next });
      operationModel.execute("parameter1");
      promiseSets[0].resolve("result1");
      await promiseSets[0].promise;
      operationModel.execute("parameter2");
      // Assert
      expect(next).toHaveBeenLastCalledWith({
        isPending: true,
        hasError: false,
        source: promiseSets[1].promise,
        hasValue: false,
      });
    });
    it("maintains value from prior execution when instructed", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const operationModel = new OperationModel(operation, true);
      const { promise: promise2 } = makeTestPromise<string, string>();
      const next = jest.fn();
      // Act
      operationModel.statusChanges.subscribe({ next });
      operationModel.execute("parameter1");
      promiseSets[0].resolve("result1");
      await promiseSets[0].promise;
      operationModel.execute("parameter2");
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
      const operationModel = new OperationModel(operation);
      const next = jest.fn();
      // Act
      operationModel.statusChanges.subscribe({ next });
      operationModel.execute("parameter1");
      operationModel.execute("parameter2");
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
  const operation: Operation<string, string> = jest
    .fn()
    .mockImplementation(() => {
      const promiseSet = makeTestPromise<string, string>();
      promiseSets.push(promiseSet);
      return promiseSet.promise;
    });
  return { operation, promiseSets };
}
