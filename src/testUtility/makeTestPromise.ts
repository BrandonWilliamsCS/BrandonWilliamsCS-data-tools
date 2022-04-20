export function makeTestPromise<T, E = unknown>(): TestPromiseSet<T, E> {
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

export interface TestPromiseSet<T, E> {
  promise: Promise<T>;
  resolve: (t: T) => void;
  reject: (e: E) => void;
}
