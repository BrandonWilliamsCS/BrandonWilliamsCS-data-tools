/**
 * Reflects the resolution/rejection status of a promise for a point in time.
 * A single promise may have resolved (to a value if not void), rejected, or
 *  the result may still be pending. However, when considering that one promise
 *  may virtually "replace" another, it's useful to maintain the "last good
 *  value" even when the current promise is still pending or has rejected.
 * Thus, a single status may be pending, in error, or neither; in any of those
 *  cases, it may also recprd the value of the latest successful resolution.
 * Note that this type definition utilizes a feature of TypeScript that allows
 *  the presence or absence of a value or error to be established without
 *  explicitly using undefined; if hasValue is true, there is a value field with
 *  type T. If it is false, there *is no value field* - attempting to access it
 *  is an error.
 */
export type PromiseStatus<T, E = any> = PromiseStatusBase<T> &
  PromiseStatusValue<T> &
  PromiseStatusError<E>;

export interface PromiseStatusBase<T> {
  readonly source: Promise<T>;
}

export type PromiseStatusValue<T> = Readonly<
  { hasValue: false } | { hasValue: true; value: T }
>;

export type PromiseStatusError<E> = Readonly<
  | { hasError: false; isPending: boolean }
  | { hasError: true; isPending: false; error: E }
>;

export const initialStatus: PromiseStatus<never> = Object.freeze({
  isPending: false,
  hasValue: false,
  hasError: false,
  source: new Promise<never>(() => {}),
});

export function processPromise<T, E = any>(
  promise: Promise<T>,
  previousStatus?: PromiseStatus<T, E>,
): PromiseStatus<T, E> {
  let next: PromiseStatus<T, E> = {
    isPending: true,
    hasError: false,
    source: promise,
    // First, assume no value.
    hasValue: false,
  };
  // Note the previous value if present.
  if (previousStatus?.hasValue) {
    next = {
      ...next,
      hasValue: true,
      value: previousStatus.value,
    };
  }
  return next;
}

export function succeed<T, E>(
  previous: PromiseStatus<T, E>,
  result: T,
): PromiseStatus<T, E> {
  return {
    hasValue: true,
    value: result,
    isPending: false,
    hasError: false,
    source: previous.source,
  };
}

export function fail<T, E>(
  previous: PromiseStatus<T, E>,
  error: E,
): PromiseStatus<T, E> {
  let next: PromiseStatus<T, E> = {
    hasError: true,
    error,
    isPending: false,
    source: previous.source,
    // First, assume no value.
    hasValue: false,
  };
  // Note the previous value if present.
  if (previous?.hasValue) {
    next = {
      ...next,
      hasValue: true,
      value: previous.value,
    };
  }
  return next;
}

export function mapPromiseStatus<T, U, E>(
  baseStatus: PromiseStatus<T, E>,
  mapper: (value: T) => U,
  mappedSource: Promise<U>,
): PromiseStatus<U, E> {
  return baseStatus.hasValue
    ? {
        ...baseStatus,
        value: mapper(baseStatus.value),
        source: mappedSource,
      }
    : {
        ...baseStatus,
        source: mappedSource,
      };
}
