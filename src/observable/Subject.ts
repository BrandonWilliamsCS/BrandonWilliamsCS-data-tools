import { Observer } from "./Observer";
import { ObserverBundle } from "./ObserverBundle";
import { Subscribable } from "./Subscribable";

export class Subject<T> implements Observer<T>, Subscribable<T> {
  protected isComplete = false;
  protected readonly observers = new ObserverBundle<T>();

  public constructor() {
    // To behave as an observer, make sure `next`, `error`, and `complete`
    //  have a stable `this`.
    this.next = this.next.bind(this);
    this.error = this.error.bind(this);
    this.complete = this.complete.bind(this);
  }

  public next(nextValue: T) {
    if (this.isComplete) {
      return;
    }
    this.observers.next(nextValue);
  }

  public error(err: any) {
    if (this.isComplete) {
      return;
    }
    this.observers.error(err);
  }

  public complete() {
    this.isComplete = true;
    this.observers.complete();
    // There's nothing left to subscribe to. Help reduce memory leaks.
    this.observers.clear();
  }

  public subscribe(observer: Partial<Observer<T>>) {
    if (this.isComplete) {
      observer.complete?.();
      return { unsubscribe: () => {} };
    }

    this.observers.add(observer);
    return {
      unsubscribe: () => {
        this.observers.remove(observer);
      },
    };
  }
}
