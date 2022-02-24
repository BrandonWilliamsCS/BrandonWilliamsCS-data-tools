import { BehaviorSubject, Observable, of, switchMap } from "rxjs";
import { initialStatus, PromiseStatus, TrackedPromise } from "./index";

export class TrackedPromiseSequence<T, E = any> {
  private readonly trackerSubject = new BehaviorSubject<
    TrackedPromise<T, E> | undefined
  >(undefined);

  public get currentStatus(): PromiseStatus<T, E> {
    return this.trackerSubject.value?.currentStatus ?? initialStatus;
  }

  public get statuses(): Observable<PromiseStatus<T, E>> {
    return this.trackerSubject.pipe(
      switchMap((tracker) => (tracker ? tracker.statuses : of(initialStatus))),
    );
  }

  public next(promise: Promise<T>) {
    this.trackerSubject.next(new TrackedPromise(promise, this.currentStatus));
  }
}
