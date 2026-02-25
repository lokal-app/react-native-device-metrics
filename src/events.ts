import {
  Platform,
  DeviceEventEmitter,
  type EventSubscription,
} from 'react-native';
import {
  EVENT_RAW_PERFORMANCE_DATA,
  EVENT_DETAILED_PERFORMANCE_DATA,
} from './constants';
import type { RawPerformanceEvent, DetailedPerformanceEvent } from './types';

/**
 * Registers a typed listener for raw performance data events emitted
 * by the native module during active raw data collection.
 *
 * @param callback - Called with each raw performance data event
 * @returns An EventSubscription that should be removed when no longer needed
 *          (e.g., in a useEffect cleanup or componentWillUnmount)
 */
export const addRawPerformanceDataListener = (
  callback: (event: RawPerformanceEvent) => void
): EventSubscription => {
  if (Platform.OS !== 'android') {
    throw new Error(
      'react-native-device-metrics is Android-only and does not support iOS.'
    );
  }
  return DeviceEventEmitter.addListener(EVENT_RAW_PERFORMANCE_DATA, callback);
};

/**
 * Registers a typed listener for detailed performance data events emitted
 * by the native module during active detailed data collection.
 *
 * @param callback - Called with each detailed performance data event
 * @returns An EventSubscription that should be removed when no longer needed
 *          (e.g., in a useEffect cleanup or componentWillUnmount)
 */
export const addDetailedPerformanceDataListener = (
  callback: (event: DetailedPerformanceEvent) => void
): EventSubscription => {
  if (Platform.OS !== 'android') {
    throw new Error(
      'react-native-device-metrics is Android-only and does not support iOS.'
    );
  }
  return DeviceEventEmitter.addListener(
    EVENT_DETAILED_PERFORMANCE_DATA,
    callback
  );
};
