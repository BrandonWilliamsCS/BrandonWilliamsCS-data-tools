import { BehaviorSubject, Observable, Subject } from "rxjs";
import { PromiseStatus, trackPromiseStatus } from "./index";
import { PromiseStatusStream } from "./PromiseStatusStream";

export class TrackedPromise<T, E = any>
  implements Promise<T>, PromiseStatusStream<T, E>
{
  // Maintain two subjects for API compatibility
  private readonly statusBehaviorSubject: BehaviorSubject<PromiseStatus<T, E>>;
  private readonly statusSubject = new Subject<PromiseStatus<T, E>>();

  public get currentStatus(): PromiseStatus<T, E> {
    return this.statusBehaviorSubject.value;
  }

  public get statusChanges(): Observable<PromiseStatus<T, E>> {
    return this.statusSubject;
  }

  public get statuses(): Observable<PromiseStatus<T, E>> {
    return this.statusBehaviorSubject;
  }

  public constructor(
    public readonly promise: Promise<T>,
    previousStatus?: PromiseStatus<T, E>,
  ) {
    this.statusBehaviorSubject = new BehaviorSubject<PromiseStatus<T, E>>(
      trackPromiseStatus(
        promise,
        // Note: we can't pass this.statusSubject.next directly because
        //  it hasn't been constructed at this point.
        (nextStatus) => {
          // But inside the function, we'll always get the latest value.
          // Hacky: It will still be undefined on the first/immediate call,
          //  but the subject will still publish that status as it gets
          //  returned from `trackPromiseStatus` to the constructor.
          this.statusBehaviorSubject?.next(nextStatus);
          this.statusSubject?.next(nextStatus);
          if (!nextStatus.isPending) {
            this.statusBehaviorSubject?.complete();
            this.statusSubject?.complete();
          }
        },
        previousStatus,
      ),
    );
  }

  /********* Pass-through implementation of Promise interface **********/
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }
  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
  ): Promise<T | TResult> {
    return this.promise.catch(onrejected);
  }
  finally(onfinally?: (() => void) | null): Promise<T> {
    return this.promise.finally(onfinally);
  }
  get [Symbol.toStringTag]() {
    return "TrackedPromise";
  }
}
