import type { PerformanceLevelName } from '../constants';

// --- Raw performance metric types ---
// These match the Kotlin data classes' toMap() serialization in the native SDK.

export type CpuRawPerformanceMetrics = {
  coreCount: number;
  maxCpuFrequency: number;
  currentCpuFrequency: number;
  currentCpuUsagePercent: number;
  androidVersion: number;
  mediaPerformanceClass: number;
};

export type MemoryRawPerformanceMetrics = {
  totalRamGB: number;
  availableRamGB: number;
  ramUsagePercent: number;
  heapLimitMB: number;
  heapUsedMB: number;
  heapRemainingMB: number;
  nativeHeapAllocatedMB: number;
  isLowMemory: boolean;
};

export type NetworkRawPerformanceMetrics = {
  bandwidthAverage: number;
  downloadSpeed: number;
  uploadSpeed: number;
  networkType: string;
  cellularType: string;
  carrierName: string;
  signalStrength: number;
  isConnected: boolean;
};

export type StorageRawPerformanceMetrics = {
  totalStorageGB: number;
  availableStorageGB: number;
};

export type BatteryRawPerformanceMetrics = {
  batteryPercentage: number;
  isCharging: boolean;
  batteryStatus: string;
  temperature: number;
  voltage: number;
};

export type RawPerformanceDataResult = {
  timestamp: number;
  deviceName: string;
  androidId: string;
  cpu: CpuRawPerformanceMetrics | null;
  memory: MemoryRawPerformanceMetrics | null;
  network: NetworkRawPerformanceMetrics | null;
  storage: StorageRawPerformanceMetrics | null;
  battery: BatteryRawPerformanceMetrics | null;
  nativeExecutionStartMs: number;
  nativeExecutionEndMs: number;
  nativeExecutionDurationMs: number;
};

export type WeightedPerformanceLevels = {
  overallPerformanceLevel: PerformanceLevelName;
  cpu: PerformanceLevelName | null;
  memory: PerformanceLevelName | null;
  network: PerformanceLevelName | null;
  storage: PerformanceLevelName | null;
  battery: PerformanceLevelName | null;
};

/**
 * Event data emitted by the native module via DeviceEventEmitter
 * on the 'onRawPerformanceData' channel. Extends RawPerformanceDataResult
 * with bridge-specific timing metadata.
 */
export interface RawPerformanceEvent extends RawPerformanceDataResult {
  bridgeStartMs: number;
}

// --- Detailed performance metric types ---
// Same fields as Raw + performanceLevel per class.

export interface CpuDetailedMetrics extends CpuRawPerformanceMetrics {
  performanceLevel: PerformanceLevelName;
}

export interface MemoryDetailedMetrics extends MemoryRawPerformanceMetrics {
  performanceLevel: PerformanceLevelName;
}

export interface NetworkDetailedMetrics extends NetworkRawPerformanceMetrics {
  performanceLevel: PerformanceLevelName;
}

export interface StorageDetailedMetrics extends StorageRawPerformanceMetrics {
  performanceLevel: PerformanceLevelName;
}

export interface BatteryDetailedMetrics extends BatteryRawPerformanceMetrics {
  performanceLevel: PerformanceLevelName;
}

export type DetailedPerformanceDataResult = {
  timestamp: number;
  deviceName: string;
  androidId: string;
  cpu: CpuDetailedMetrics | null;
  memory: MemoryDetailedMetrics | null;
  network: NetworkDetailedMetrics | null;
  storage: StorageDetailedMetrics | null;
  battery: BatteryDetailedMetrics | null;
  nativeExecutionStartMs: number;
  nativeExecutionEndMs: number;
  nativeExecutionDurationMs: number;
};

/**
 * Event data emitted by the native module via DeviceEventEmitter
 * on the 'onDetailedPerformanceData' channel. Extends DetailedPerformanceDataResult
 * with bridge-specific timing metadata.
 */
export interface DetailedPerformanceEvent
  extends DetailedPerformanceDataResult {
  bridgeStartMs: number;
}

/**
 * Specifies a performance class and its weight for weighted level calculation.
 *
 * Note: `class` is a reserved word in JS. When destructuring, use renaming:
 * `const { class: performanceClass, weight } = item;`
 */
export type ClassWithWeight = {
  class: number;
  weight: number;
};
