import {
  BehaviorSubject,
  Observer,
  Subscribable,
  Unsubscribable,
} from "../observable";
import { initialStatus, PromiseStatus, TrackedPromise } from "./index";

export class TrackedPromiseSequence<T, E = any>
  implements Subscribable<PromiseStatus<T, E>>, Observer<Promise<T>>
{
  private statusSubject = new BehaviorSubject<PromiseStatus<T, E>>(
    initialStatus,
  );
  private currentTrackedPromiseSubscription: Unsubscribable | undefined;

  public get currentStatus() {
    return this.statusSubject.currentValue;
  }

  public next(promise: Promise<T>) {
    if (this.currentTrackedPromiseSubscription) {
      this.currentTrackedPromiseSubscription.unsubscribe();
    }
    const nextTrackedPromise = new TrackedPromise(
      promise,
      this.statusSubject.currentValue,
    );
    this.currentTrackedPromiseSubscription = nextTrackedPromise.subscribe({
      next: this.statusSubject.next,
      error: this.statusSubject.error,
      // ignore completes; a new promise could arrive.
    });
  }

  public error(err: any) {
    this.statusSubject.error(err);
  }

  public complete() {
    this.statusSubject.complete();
  }

  public subscribe(observer: Partial<Observer<PromiseStatus<T, E>>>) {
    return this.statusSubject.subscribe(observer);
  }
}
