import { Observer } from "./Observer";

export class ObserverBundle<T> implements Observer<T> {
  private readonly observers = new Set<Partial<Observer<T>>>();

  public next(nextValue: T) {
    this.observers.forEach((observers) => {
      observers.next?.(nextValue);
    });
  }

  public error(err: any) {
    this.observers.forEach((observers) => {
      observers.error?.(err);
    });
  }

  public complete() {
    this.observers.forEach((observers) => {
      observers?.complete?.();
    });
  }

  public add(observer: Partial<Observer<T>>) {
    this.observers.add(observer);
  }

  public remove(observer: Partial<Observer<T>>) {
    this.observers.delete(observer);
  }

  public clear() {
    this.observers.clear();
  }
}
