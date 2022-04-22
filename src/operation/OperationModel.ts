import {
  BehaviorSubject,
  mergeWith,
  NEVER,
  Observable,
  Subject,
  switchMap,
} from "rxjs";
import {
  initialStatus,
  PromiseStatus,
  PromiseStatusStream,
  TrackedPromise,
} from "../promise";
import { Operation } from "./Operation";

export class OperationModel<Q, R, E = unknown>
  implements PromiseStatusStream<R, E>
{
  private readonly firstStatusSubject = new Subject<PromiseStatus<R, E>>();
  // Keep the trackers in an observable so we can switchMap over their statuses.
  // It's a BehaviorSubject so that new subscribers can listen to the current
  // TrackedPromise when it hasn't completed yet.
  private readonly trackerSubject = new BehaviorSubject<
    TrackedPromise<R, E> | undefined
  >(undefined);

  public get currentStatus(): PromiseStatus<R, E> {
    return this.trackerSubject.value?.currentStatus ?? initialStatus;
  }

  public get statusChanges(): Observable<PromiseStatus<R, E>> {
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

  public constructor(
    private readonly operation: Operation<Q, R>,
    private readonly preserveLatestValue?: boolean,
  ) {
    // Make `execute` easy to use as a standalone function.
    this.execute = this.execute.bind(this);
  }

  public execute(parameters: Q): TrackedPromise<R, E> {
    const trackedPromise = new TrackedPromise(
      this.operation(parameters),
      this.preserveLatestValue ? this.currentStatus : undefined,
    );
    this.firstStatusSubject.next(trackedPromise.currentStatus);
    this.trackerSubject.next(trackedPromise);
    return trackedPromise;
  }
}
