
/**
 * Consumes a sequence of push-based emissions, such as those from a Subscribable.
 */
export interface Observer<T> {
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}
