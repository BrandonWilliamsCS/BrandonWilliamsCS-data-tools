import { map, Observable } from "rxjs";
import { mapPromiseStatus, PromiseStatus } from "./PromiseStatus";

export interface PromiseStatusStream<T, E = any> {
  currentStatus: PromiseStatus<T, E>;
  statusChanges: Observable<PromiseStatus<T, E>>;
}

export function mapPromiseStatusStream<T, U = T, E = any>(
  baseStream: PromiseStatusStream<T, E>,
  mapper: (value: T) => U,
): PromiseStatusStream<U, E> {
  // Keep a reference to the base status used to generate the each mapped status.
  let referenceBaseStatus: PromiseStatus<T, E> | undefined;
  let latestMappedStatus: PromiseStatus<U, E> | undefined;
  function getMappedStatus(
    statusToMap: PromiseStatus<T, E>,
  ): PromiseStatus<U, E> {
    // If the base status hasn't changed, there's no need to re-compute.
    if (statusToMap === referenceBaseStatus) {
      return latestMappedStatus!;
    }
    // Similarly, only re-build the mapped source if the base source has changed.
    const mappedSource =
      statusToMap.source === referenceBaseStatus?.source
        ? latestMappedStatus!.source
        : statusToMap.source.then(mapper);
    latestMappedStatus = mapPromiseStatus(statusToMap, mapper, mappedSource);
    referenceBaseStatus = statusToMap;
    return latestMappedStatus;
  }

  return {
    get currentStatus() {
      return getMappedStatus(baseStream.currentStatus);
    },
    statusChanges: baseStream.statusChanges.pipe(map(getMappedStatus)),
  };
}
