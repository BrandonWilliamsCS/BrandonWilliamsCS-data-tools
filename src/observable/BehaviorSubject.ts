import { Observer } from "./Observer";
import { Subject } from "./Subject";

export class BehaviorSubject<T> extends Subject<T> {
  protected value!: T;

  public get currentValue() {
    return this.value;
  }

  public constructor(initialValue: T, initialObserver?: Partial<Observer<T>>) {
    super();
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

  public subscribe(observer: Partial<Observer<T>>, emitCurrent = true) {
    if (emitCurrent) {
      observer.next?.(this.value);
    }
    return super.subscribe(observer);
  }
}
