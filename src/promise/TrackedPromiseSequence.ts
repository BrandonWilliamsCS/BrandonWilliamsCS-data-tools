import {
  BehaviorSubject,
  mergeWith,
  NEVER,
  Observable,
  of,
  Subject,
  switchMap,
} from "rxjs";
import { initialStatus, PromiseStatus, TrackedPromise } from "./index";
import { PromiseStatusStream } from "./PromiseStatusStream";

export class TrackedPromiseSequence<T, E = any>
  implements PromiseStatusStream<T, E>
{
  private readonly firstStatusSubject = new Subject<PromiseStatus<T, E>>();
  private readonly trackerSubject = new BehaviorSubject<
    TrackedPromise<T, E> | undefined
  >(undefined);

  public get currentStatus(): PromiseStatus<T, E> {
    return this.trackerSubject.value?.currentStatus ?? initialStatus;
  }

  public get statusChanges(): Observable<PromiseStatus<T, E>> {
    // Use the tracker BehaviorSubject so we can subscribe to already-started
    // streams, but subscribe to the non-Behavior statusChanges for each tracker
    // so that individual statuses don't emit on subscribe.
    return this.trackerSubject.pipe(
      switchMap((tracker) => (tracker ? tracker.statusChanges : NEVER)),
      // However, we do want to make sure that existing subscribers get the
      // initial status for all new tracked promises.
      mergeWith(this.firstStatusSubject),
    );
  }

  public get statuses(): Observable<PromiseStatus<T, E>> {
    return this.trackerSubject.pipe(
      switchMap((tracker) => (tracker ? tracker.statuses : of(initialStatus))),
    );
  }

  public next(promise: Promise<T>) {
    const trackedPromise = new TrackedPromise(promise, this.currentStatus);
    this.firstStatusSubject.next(trackedPromise.currentStatus);
    this.trackerSubject.next(trackedPromise);
  }
}
