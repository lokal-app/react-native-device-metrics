import type { PerformanceThresholds } from './types';

// Default thresholds matching device-telemetry-toolkit defaults
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  memory: {
    low: {
      approxHeapRemainingInMBThreshold: 64,
      approxHeapLimitInMBThreshold: 128,
    },
    average: {
      approxHeapRemainingInMBThreshold: 128,
      approxHeapLimitInMBThreshold: 256,
      availableRamGBThreshold: 2,
    },
    high: {
      approxHeapRemainingInMBThreshold: 256,
      availableRamGBThreshold: 3,
    },
  },

  battery: {
    excellent: {
      batteryPercentageThreshold: 80,
      isChargingBatteryPercentageThreshold: 70,
      temperatureThreshold: 30, // Below this temp = EXCELLENT performance
    },
    high: {
      batteryPercentageThreshold: 55,
      isChargingBatteryPercentageThreshold: 50,
      temperatureThreshold: 34, // Below this temp = HIGH performance
    },
    average: {
      batteryPercentageThreshold: 40,
      isChargingBatteryPercentageThreshold: 35,
      temperatureThreshold: 38, // Below this temp = AVERAGE performance
    },
  },

  cpu: {
    excellent: {
      mediaPerformanceClassThreshold: 33, // Build.VERSION_CODES.TIRAMISU
      totalRamGBThreshold: 12,
    },
    low: {
      androidVersionThreshold: 21,
      coreCountThreshold: 2,
      heapLimitMBThreshold: 100,
      maxCpuFrequencyThreshold1: 1250,
      maxCpuFrequencyThreshold2: 1600,
      maxCpuFrequencyThreshold3: 1300,
      heapLimitMBThreshold2: 128,
      androidVersionThreshold2: 21,
      androidVersionThreshold3: 24,
      totalRamGBThreshold: 2,
    },
    average: {
      coreCountThreshold: 8,
      heapLimitMBThreshold: 160,
      maxCpuFrequencyThreshold: 2055,
      androidVersionThreshold: 23,
      totalRamGBThreshold: 6,
    },
  },

  network: {
    low: {
      bandwidthAverageThreshold: 150.0, // 0.15 Mbps
    },
    average: {
      bandwidthAverageThreshold: 550.0, // 0.55 Mbps
      downloadSpeedThreshold: 2000, // 2 Mbps
      signalStrengthThreshold: 2,
    },
    high: {
      bandwidthAverageThreshold: 2000.0, // 2 Mbps
      downloadSpeedThreshold: 5000, // 5 Mbps
      signalStrengthThreshold: 3,
    },
    excellent: {
      downloadSpeedThreshold: 10000, // 10 Mbps
      signalStrengthThreshold: 4,
    },
  },

  storage: {
    excellent: {
      availableStorageGBThreshold: 16,
    },
    high: {
      availableStorageGBThreshold: 8,
    },
    average: {
      availableStorageGBThreshold: 4,
    },
  },
};

/**
 * Returns a deep copy of the default performance thresholds.
 * Safe to mutate — each call returns a fresh independent copy.
 *
 * Uses JSON round-trip instead of structuredClone because TypeScript's
 * ESNext lib does not include structuredClone types (available at runtime
 * in Hermes since RN 0.73, but not in TS's type definitions).
 * Safe here since DEFAULT_THRESHOLDS contains only plain numbers.
 */
export const getDefaultThresholds = (): PerformanceThresholds =>
  JSON.parse(JSON.stringify(DEFAULT_THRESHOLDS));
