import { PromiseStatus, processPromise, succeed, fail } from "./PromiseStatus";

export function trackPromiseStatus<T, E = any>(
  promise: Promise<T>,
  onChange: (nextStatus: PromiseStatus<T, E>) => void,
  previous?: PromiseStatus<T, E>,
): PromiseStatus<T, E> {
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
