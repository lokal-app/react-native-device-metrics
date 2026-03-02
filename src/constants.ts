// Performance class identifiers (matching Android SDK PerformanceClass.kt)
export const PerformanceClass = {
  CPU: 0,
  MEMORY: 1,
  STORAGE: 2,
  NETWORK: 3,
  BATTERY: 4,
} as const;

// Performance level identifiers (matching Android SDK)
export const PerformanceLevel = {
  UNKNOWN: 0,
  LOW: 1,
  AVERAGE: 2,
  HIGH: 3,
  EXCELLENT: 4,
} as const;

// Derived types for type-safe API parameters
export type PerformanceClassValue =
  (typeof PerformanceClass)[keyof typeof PerformanceClass];
export type PerformanceLevelValue =
  (typeof PerformanceLevel)[keyof typeof PerformanceLevel];

// String representation of performance levels as returned by the SDK
export type PerformanceLevelName =
  | 'UNKNOWN'
  | 'LOW'
  | 'AVERAGE'
  | 'HIGH'
  | 'EXCELLENT';

// Maps numeric performance levels to their string names as returned by the SDK
export const performanceLevelToName: Record<
  PerformanceLevelValue,
  PerformanceLevelName
> = {
  [PerformanceLevel.UNKNOWN]: 'UNKNOWN',
  [PerformanceLevel.LOW]: 'LOW',
  [PerformanceLevel.AVERAGE]: 'AVERAGE',
  [PerformanceLevel.HIGH]: 'HIGH',
  [PerformanceLevel.EXCELLENT]: 'EXCELLENT',
};

// Event channel names (must match native module emission strings in DeviceMetricsModule.kt)
export const EVENT_RAW_PERFORMANCE_DATA = 'onRawPerformanceData';
export const EVENT_DETAILED_PERFORMANCE_DATA = 'onDetailedPerformanceData';
