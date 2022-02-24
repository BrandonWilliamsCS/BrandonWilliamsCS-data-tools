import { BehaviorSubject, Observable } from "rxjs";
import { PromiseStatus, trackPromiseStatus } from "./index";

export class TrackedPromise<T, E = any> {
  private readonly statusSubject!: BehaviorSubject<PromiseStatus<T, E>>;

  public get currentStatus(): PromiseStatus<T, E> {
    return this.statusSubject.value;
  }

  public get statuses(): Observable<PromiseStatus<T, E>> {
    return this.statusSubject;
  }

  public constructor(
    public readonly promise: Promise<T>,
    previousStatus?: PromiseStatus<T, E>,
  ) {
    this.statusSubject = new BehaviorSubject<PromiseStatus<T, E>>(
      trackPromiseStatus(
        promise,
        // Note: we can't pass this.statusSubject.next directly because
        //  it hasn't been constructed at this point.
        (nextStatus) => {
          // But inside the function, we'll always get the latest value.
          // Hacky: It will still be undefined on the first/immediate call,
          //  but the subject will still publish that status as it gets
          //  returned from `trackPromiseStatus` to the constructor.
          this.statusSubject?.next(nextStatus);
          if (!nextStatus.isPending) {
            this.statusSubject?.complete();
          }
        },
        previousStatus,
      ),
    );
  }
}
