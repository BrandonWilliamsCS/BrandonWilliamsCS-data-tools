import {
  BehaviorSubject,
  mergeWith,
  NEVER,
  Observable,
  Subject,
  switchMap,
} from "rxjs";
import { AsyncStatus, initialStatus } from "./AsyncStatus";
import { AsyncStatusStream, TrackedPromise } from "./index";

export class AsyncValueModel<T> implements AsyncStatusStream<T> {
  private readonly firstStatusSubject = new Subject<AsyncStatus<T>>();
  // Keep the trackers in an observable so we can switchMap over their statuses.
  // It's a BehaviorSubject so that new subscribers can listen to the current
  // TrackedPromise when it hasn't completed yet.
  private readonly trackerSubject = new BehaviorSubject<
    TrackedPromise<T> | undefined
  >(undefined);

  public get currentStatus(): AsyncStatus<T> {
    return this.trackerSubject.value?.currentStatus ?? initialStatus;
  }

  public get statusChanges(): Observable<AsyncStatus<T>> {
    // The trackerSubject replays the latest tracker, but use the NON-replay
    // statusChanges from each new tracker because we don't want to replay
    // the latest status to new subscribers.
    return this.trackerSubject.pipe(
      switchMap((tracker) => (tracker ? tracker.statusChanges : NEVER)),
      // But the tracker has already emitted its pending status. We need to
      // merge each first/pending status back into the overall sequence.
      mergeWith(this.firstStatusSubject),
    );
  }

  constructor(private readonly getValue: () => Promise<T>) {
    // Make `reload` easy to use as a standalone function.
    this.reload = this.reload.bind(this);
  }

  public reload(): TrackedPromise<T> {
    const trackedPromise = new TrackedPromise(
      this.getValue(),
      this.currentStatus,
    );
    this.firstStatusSubject.next(trackedPromise.currentStatus);
    this.trackerSubject.next(trackedPromise);
    return trackedPromise;
  }

  public signalDemand() {
    if (this.currentStatus === initialStatus) {
      this.reload();
    }
  }
}
