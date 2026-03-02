import { TurboModuleRegistry } from 'react-native';
import type { TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  init(thresholds?: string): Promise<void>;

  startRawPerformanceDataCollection(
    classes: number[],
    delaySeconds: number
  ): Promise<void>;

  updateRawPerformanceDataCollection(delaySeconds: number): Promise<boolean>;

  stopRawPerformanceDataCollection(): Promise<void>;

  getLatestRawPerformanceData(): Promise<string | null>; // JSON string

  startDetailedPerformanceDataCollection(
    classes: number[],
    delaySeconds: number
  ): Promise<void>;

  updateDetailedPerformanceDataCollection(
    delaySeconds: number
  ): Promise<boolean>;

  stopDetailedPerformanceDataCollection(): Promise<void>;

  getLatestDetailedPerformanceData(): Promise<string | null>; // JSON string

  getWeightedPerformanceLevels(
    classesWithWeights: Array<{ class: number; weight: number }>
  ): Promise<string>; // JSON string

  getPerformanceLevel(performanceClass: number): Promise<number>;

  shutdown(): Promise<void>;
}

// TurboModuleRegistry.get() handles both architectures via the interop layer (RN 0.73+).
// Returns null on iOS or when the native module is not linked.
export default TurboModuleRegistry.get<Spec>('DeviceMetrics');
