import { Platform } from 'react-native';
import DeviceMetrics from './NativeDeviceMetrics';
import type { PerformanceClassValue, PerformanceLevelValue } from './constants';
import type {
  ClassWithWeight,
  WeightedPerformanceLevels,
  RawPerformanceDataResult,
  DetailedPerformanceDataResult,
  PerformanceThresholds,
} from './types';

let cachedModule: NonNullable<typeof DeviceMetrics> | null = null;

const getNativeModule = () => {
  if (cachedModule != null) return cachedModule;

  if (Platform.OS !== 'android') {
    throw new Error(
      'react-native-device-metrics is Android-only and does not support iOS.'
    );
  }

  if (DeviceMetrics == null) {
    throw new Error(
      'react-native-device-metrics: native module not found. Ensure the library is linked correctly. ' +
        'For Expo, use a development build (not Expo Go). For React Native CLI, run pod install and rebuild.'
    );
  }

  cachedModule = DeviceMetrics;
  return cachedModule;
};

/**
 * Initializes the device-telemetry-toolkit SDK.
 * Must be called once before using any other API.
 *
 * @param thresholds - Optional custom thresholds. If omitted, the SDK uses its built-in defaults.
 *                     Use `DEFAULT_THRESHOLDS` as a starting point and override specific values.
 */
export const init = async (
  thresholds?: PerformanceThresholds
): Promise<void> => {
  const thresholdsJson = thresholds ? JSON.stringify(thresholds) : undefined;
  return getNativeModule().init(thresholdsJson);
};

/**
 * Starts periodic raw performance data collection.
 * Data is emitted via `addRawPerformanceDataListener` at the specified interval.
 *
 * @param classes - Which performance classes to collect (e.g., `[PerformanceClass.CPU, PerformanceClass.MEMORY]`)
 * @param delaySeconds - Interval in seconds between data collection events
 */
export const startRawPerformanceDataCollection = async (
  classes: PerformanceClassValue[],
  delaySeconds: number
): Promise<void> => {
  return getNativeModule().startRawPerformanceDataCollection(
    classes,
    delaySeconds
  );
};

/**
 * Updates the collection interval of an active raw data collection.
 *
 * @param delaySeconds - New interval in seconds
 * @returns `true` if an active collection was updated, `false` if no collection is running
 */
export const updateRawPerformanceDataCollection = async (
  delaySeconds: number
): Promise<boolean> => {
  return getNativeModule().updateRawPerformanceDataCollection(delaySeconds);
};

/** Stops the active raw performance data collection. */
export const stopRawPerformanceDataCollection = async (): Promise<void> => {
  return getNativeModule().stopRawPerformanceDataCollection();
};

/**
 * Returns the most recent raw performance data snapshot as a parsed object.
 * Returns `null` if no data has been collected yet.
 *
 * Note: The returned object is cast from JSON.parse output. The shape is not
 * validated at runtime — it matches the native SDK's serialization contract.
 */
export const getLatestRawPerformanceData =
  async (): Promise<RawPerformanceDataResult | null> => {
    const jsonResult = await getNativeModule().getLatestRawPerformanceData();
    if (jsonResult == null) return null;
    try {
      return JSON.parse(jsonResult) as RawPerformanceDataResult;
    } catch {
      throw new Error(
        'react-native-device-metrics: Failed to parse raw performance data JSON from native module.'
      );
    }
  };

/**
 * Starts periodic detailed performance data collection (raw metrics + performance levels).
 * Data is emitted via `addDetailedPerformanceDataListener` at the specified interval.
 *
 * @param classes - Which performance classes to collect (e.g., `[PerformanceClass.CPU, PerformanceClass.MEMORY]`)
 * @param delaySeconds - Interval in seconds between data collection events
 */
export const startDetailedPerformanceDataCollection = async (
  classes: PerformanceClassValue[],
  delaySeconds: number
): Promise<void> => {
  return getNativeModule().startDetailedPerformanceDataCollection(
    classes,
    delaySeconds
  );
};

/**
 * Updates the collection interval of an active detailed data collection.
 *
 * @param delaySeconds - New interval in seconds
 * @returns `true` if an active collection was updated, `false` if no collection is running
 */
export const updateDetailedPerformanceDataCollection = async (
  delaySeconds: number
): Promise<boolean> => {
  return getNativeModule().updateDetailedPerformanceDataCollection(
    delaySeconds
  );
};

/** Stops the active detailed performance data collection. */
export const stopDetailedPerformanceDataCollection =
  async (): Promise<void> => {
    return getNativeModule().stopDetailedPerformanceDataCollection();
  };

/**
 * Returns the most recent detailed performance data snapshot as a parsed object.
 * Returns `null` if no data has been collected yet.
 *
 * Note: The returned object is cast from JSON.parse output. The shape is not
 * validated at runtime — it matches the native SDK's serialization contract.
 */
export const getLatestDetailedPerformanceData =
  async (): Promise<DetailedPerformanceDataResult | null> => {
    const jsonResult =
      await getNativeModule().getLatestDetailedPerformanceData();
    if (jsonResult == null) return null;
    try {
      return JSON.parse(jsonResult) as DetailedPerformanceDataResult;
    } catch {
      throw new Error(
        'react-native-device-metrics: Failed to parse detailed performance data JSON from native module.'
      );
    }
  };

/**
 * Calculates weighted performance levels across the specified classes.
 * Returns per-class levels and an overall weighted level.
 *
 * Note: The returned object is cast from JSON.parse output. The shape is not
 * validated at runtime — it matches the native SDK's serialization contract.
 *
 * @param classesWithWeights - Array of `{ class: PerformanceClass.*, weight: number }` entries
 */
export const getWeightedPerformanceLevels = async (
  classesWithWeights: ClassWithWeight[]
): Promise<WeightedPerformanceLevels> => {
  const jsonResult = await getNativeModule().getWeightedPerformanceLevels(
    classesWithWeights
  );
  try {
    return JSON.parse(jsonResult) as WeightedPerformanceLevels;
  } catch {
    throw new Error(
      'react-native-device-metrics: Failed to parse weighted performance levels JSON from native module.'
    );
  }
};

/**
 * Returns the current performance level for a single performance class.
 *
 * @param performanceClass - One of `PerformanceClass.CPU`, `MEMORY`, `STORAGE`, `NETWORK`, or `BATTERY`
 * @returns A numeric level: 0 (UNKNOWN), 1 (LOW), 2 (AVERAGE), 3 (HIGH), 4 (EXCELLENT)
 */
export const getPerformanceLevel = async (
  performanceClass: PerformanceClassValue
): Promise<PerformanceLevelValue> => {
  return getNativeModule().getPerformanceLevel(
    performanceClass
  ) as Promise<PerformanceLevelValue>;
};

/** Cancels all active monitoring and resets the SDK state. */
export const shutdown = async (): Promise<void> => {
  return getNativeModule().shutdown();
};
