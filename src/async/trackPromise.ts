import { AsyncStatus, processPromise, succeed, fail } from "./AsyncStatus";

export function trackPromise<T, E = any>(
  promise: Promise<T>,
  onChange: (nextStatus: AsyncStatus<T, E>) => void,
  previous?: AsyncStatus<T, E>,
): AsyncStatus<T, E> {
  // Immediately record that the data is being processed.
  let currentStatus = processPromise(promise, previous);
  onChange(currentStatus);
  // And then update once a result is available.
  promise
    .then((result) => {
      currentStatus = succeed(currentStatus, result);
      onChange(currentStatus);
    })
    .catch((error) => {
      currentStatus = fail(currentStatus, error);
      onChange(currentStatus);
    });
  return currentStatus;
}
