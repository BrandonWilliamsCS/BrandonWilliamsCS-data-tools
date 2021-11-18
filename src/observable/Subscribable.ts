import { Observer } from "./Observer";

/**
 * A source for a sequence of push-oriented emissions.
 * Subscribing allows observers to be notified of these emissions, and produces
 *  an object that allows for unsubscription.
 */
export interface Subscribable<T> {
  subscribe(observer: Partial<Observer<T>>): Unsubscribable;
}

export interface Unsubscribable {
  unsubscribe(): void;
}