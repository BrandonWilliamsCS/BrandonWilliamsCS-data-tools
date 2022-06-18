import { Observable } from "rxjs";
import { AsyncStatus } from "./AsyncStatus";

export interface AsyncValueModel<T, E = any> {
  get currentStatus(): AsyncStatus<T>;
  get statusChanges(): Observable<AsyncStatus<T>>;
  reload(): Promise<T>;
  signalDemand(): void;
  promiseNewestValue(): Promise<T>;
  map<U>(mapper: (value: T) => U): AsyncValueModel<U, E>;
}
