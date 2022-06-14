import { Subject } from "rxjs";
import { makeTestPromise } from "../testUtility/makeTestPromise";
import { AsyncStatus } from "./AsyncStatus";
import { AsyncStatusStream, mapAsyncStatusStream } from "./AsyncStatusStream";

describe("mapAsyncStatusStream", () => {
  describe("resultStream", () => {
    describe("currentStatus", () => {
      it("is mapped from base stream's currentStatus", async () => {
        // Arrange
        const { baseStream } = makeBaseStream<number>();
        // Act
        const resultStream = mapAsyncStatusStream(baseStream, (num) =>
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
        const nextBaseStatus: AsyncStatus<number> = {
          isPending: false,
          hasValue: true,
          value: 1,
          hasError: false,
          source: baseStream.currentStatus.source,
        };
        const changeListener = jest.fn();
        // Act
        const resultStream = mapAsyncStatusStream(baseStream, (num) =>
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
        const nextBaseStatus: AsyncStatus<number> = {
          isPending: false,
          hasValue: true,
          value: 1,
          hasError: false,
          source: baseStream.currentStatus.source,
        };
        const changeListener = jest.fn();
        // Act
        const resultStream = mapAsyncStatusStream(baseStream, (num) =>
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

function makeBaseStream<T>() {
  const { promise } = makeTestPromise<T>();
  const statusSubject = new Subject<AsyncStatus<T>>();
  let currentStatus: AsyncStatus<T> = {
    isPending: true,
    hasValue: false,
    hasError: false,
    source: promise,
  };
  const baseStream: AsyncStatusStream<T> = {
    get currentStatus() {
      return currentStatus;
    },
    statusChanges: statusSubject,
  };
  return {
    baseStream,
    emitBaseStatus: (nextStatus: AsyncStatus<T>) => {
      currentStatus = nextStatus;
      statusSubject.next(nextStatus);
    },
  };
}
