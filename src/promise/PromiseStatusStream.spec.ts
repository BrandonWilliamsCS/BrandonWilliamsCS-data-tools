import { Subject } from "rxjs";
import { PromiseStatus } from "./PromiseStatus";
import {
  mapPromiseStatusStream,
  PromiseStatusStream,
} from "./PromiseStatusStream";

describe("mapPromiseStatusStream", () => {
  describe("resultStream", () => {
    describe("currentStatus", () => {
      it("is mapped from base stream's currentStatus", async () => {
        // Arrange
        const { baseStream } = makeBaseStream<number>();
        // Act
        const resultStream = mapPromiseStatusStream(baseStream, (num) =>
          num.toString(),
        );
        // Assert
        expect(resultStream.currentStatus).toMatchObject({
          isPending: true,
          hasValue: false,
          hasError: false,
        });
      });
      it("is reference equal to latest statusChanges value once emitted", async () => {
        // Arrange
        const { baseStream, emitBaseStatus } = makeBaseStream<number>();
        const nextBaseStatus: PromiseStatus<number> = {
          isPending: false,
          hasValue: true,
          value: 1,
          hasError: false,
          source: baseStream.currentStatus.source,
        };
        const changeListener = jest.fn();
        // Act
        const resultStream = mapPromiseStatusStream(baseStream, (num) =>
          num.toString(),
        );
        resultStream.statusChanges.subscribe(changeListener);
        emitBaseStatus(nextBaseStatus);
        // Assert
        const lastChange = changeListener.mock.calls[0][0];
        expect(resultStream.currentStatus).toBe(lastChange);
      });
    });
    describe("statusChanges", () => {
      it("emits values mapped from base stream's statusChanges", async () => {
        // Arrange
        const { baseStream, emitBaseStatus } = makeBaseStream<number>();
        const nextBaseStatus: PromiseStatus<number> = {
          isPending: false,
          hasValue: true,
          value: 1,
          hasError: false,
          source: baseStream.currentStatus.source,
        };
        const changeListener = jest.fn();
        // Act
        const resultStream = mapPromiseStatusStream(baseStream, (num) =>
          num.toString(),
        );
        resultStream.statusChanges.subscribe(changeListener);
        emitBaseStatus(nextBaseStatus);
        // Assert
        expect(changeListener).toHaveBeenLastCalledWith(
          expect.objectContaining({
            isPending: false,
            hasValue: true,
            value: "1",
            hasError: false,
          }),
        );
      });
    });
  });
});

function makePromise<T, E = any>() {
  let resolve!: (t: T) => void;
  let reject!: (e: E) => void;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return {
    promise,
    resolve,
    reject,
  };
}

function makeBaseStream<T>() {
  const { promise } = makePromise<T>();
  const statusSubject = new Subject<PromiseStatus<T>>();
  let currentStatus: PromiseStatus<T> = {
    isPending: true,
    hasValue: false,
    hasError: false,
    source: promise,
  };
  const baseStream: PromiseStatusStream<T> = {
    get currentStatus() {
      return currentStatus;
    },
    statusChanges: statusSubject,
  };
  return {
    baseStream,
    emitBaseStatus: (nextStatus: PromiseStatus<T>) => {
      currentStatus = nextStatus;
      statusSubject.next(nextStatus);
    },
  };
}
