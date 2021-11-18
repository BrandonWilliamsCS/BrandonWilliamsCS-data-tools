import { Observer } from "./Observer";
import { ObserverBundle } from "./ObserverBundle";
import { Subscribable } from "./Subscribable";

export class BehaviorSubject<T> implements Observer<T>, Subscribable<T> {
  private isComplete = false;
  private value!: T;
  private readonly observers = new ObserverBundle<T>();

  public get currentValue() {
    return this.value;
  }

  public constructor(initialValue: T, initialObserver?: Partial<Observer<T>>) {
    // To behave as an observer, make sure `next`, `error`, and `complete`
    //  have a stable `this`.
    this.next = this.next.bind(this);
    this.error = this.error.bind(this);
    this.complete = this.complete.bind(this);
    if (initialObserver) {
      this.observers.add(initialObserver);
    }
    this.value = initialValue;
    this.next(initialValue);
  }

  public next(nextValue: T) {
    if (this.isComplete) {
      return;
    }
    this.value = nextValue;
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

  public subscribe(observer: Partial<Observer<T>>, emitCurrent = true) {
    if (emitCurrent) {
      observer.next?.(this.value);
    }

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
