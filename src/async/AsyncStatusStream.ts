import { map, Observable } from "rxjs";
import { AsyncStatus, mapAsyncStatus } from "./AsyncStatus";

export interface AsyncStatusStream<T, E = any> {
  currentStatus: AsyncStatus<T, E>;
  statusChanges: Observable<AsyncStatus<T, E>>;
}

export function mapAsyncStatusStream<T, U = T, E = any>(
  baseStream: AsyncStatusStream<T, E>,
  mapper: (value: T) => U,
): AsyncStatusStream<U, E> {
  // Keep a reference to the base status used to generate the each mapped status.
  let referenceBaseStatus: AsyncStatus<T, E> | undefined;
  let latestMappedStatus: AsyncStatus<U, E> | undefined;
  function getMappedStatus(statusToMap: AsyncStatus<T, E>): AsyncStatus<U, E> {
    // If the base status hasn't changed, there's no need to re-compute.
    if (statusToMap === referenceBaseStatus) {
      return latestMappedStatus!;
    }
    // Similarly, only re-build the mapped source if the base source has changed.
    const mappedSource =
      statusToMap.source === referenceBaseStatus?.source
        ? latestMappedStatus!.source
        : statusToMap.source.then(mapper);
    latestMappedStatus = mapAsyncStatus(statusToMap, mapper, mappedSource);
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
