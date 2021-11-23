import { Subscribable } from ".";

/**
 * Translate emissions from a base source based on arbitrary logic.
 * For example, this allows you to filter, map, or repeat emissions.
 * @remark async translation is not recommended when the base stream will complete.
 * @param base A source of base emmisions
 * @param translator Translates each base emission to abitrary translated emissions
 * @returns the translated subscribable
 */
export function translateSubscribable<T, U>(
  base: Subscribable<T>,
  translator: SubscribableTranslator<T, U>,
): Subscribable<U> {
  return {
    subscribe: (observer) => {
      return base.subscribe({
        next: (t: T) => {
          if (observer.next) {
            translator(t, observer.next);
          }
        },
        error: observer.error,
        complete: observer.complete,
      });
    },
  };
}

export type SubscribableTranslator<T, U> = (t: T, emit: (u: U) => void) => void;
