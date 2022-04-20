import { PromiseStatus, TrackedPromise } from "../promise";

export type Operation<Q, R, E = unknown> = (
  params: Q,
  previousStatus?: PromiseStatus<R, E>,
) => TrackedPromise<R, E>;
