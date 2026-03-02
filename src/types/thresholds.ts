// --- Memory thresholds ---

export type MemoryLowThresholds = {
  approxHeapRemainingInMBThreshold: number;
  approxHeapLimitInMBThreshold: number;
};

export type MemoryAverageThresholds = {
  approxHeapRemainingInMBThreshold: number;
  approxHeapLimitInMBThreshold: number;
  availableRamGBThreshold: number;
};

export type MemoryHighThresholds = {
  approxHeapRemainingInMBThreshold: number;
  availableRamGBThreshold: number;
};

export type MemoryThresholds = {
  low: MemoryLowThresholds;
  average: MemoryAverageThresholds;
  high: MemoryHighThresholds;
};

// --- Battery thresholds ---

export type BatteryExcellentThresholds = {
  batteryPercentageThreshold: number;
  isChargingBatteryPercentageThreshold: number;
  temperatureThreshold: number;
};

export type BatteryHighThresholds = {
  batteryPercentageThreshold: number;
  isChargingBatteryPercentageThreshold: number;
  temperatureThreshold: number;
};

export type BatteryAverageThresholds = {
  batteryPercentageThreshold: number;
  isChargingBatteryPercentageThreshold: number;
  temperatureThreshold: number;
};

export type BatteryThresholds = {
  excellent: BatteryExcellentThresholds;
  high: BatteryHighThresholds;
  average: BatteryAverageThresholds;
};

// --- CPU thresholds ---

export type CpuExcellentThresholds = {
  mediaPerformanceClassThreshold: number;
  totalRamGBThreshold: number;
};

export type CpuLowThresholds = {
  androidVersionThreshold: number;
  coreCountThreshold: number;
  heapLimitMBThreshold: number;
  maxCpuFrequencyThreshold1: number;
  maxCpuFrequencyThreshold2: number;
  maxCpuFrequencyThreshold3: number;
  heapLimitMBThreshold2: number;
  androidVersionThreshold2: number;
  androidVersionThreshold3: number;
  totalRamGBThreshold: number;
};

export type CpuAverageThresholds = {
  coreCountThreshold: number;
  heapLimitMBThreshold: number;
  maxCpuFrequencyThreshold: number;
  androidVersionThreshold: number;
  totalRamGBThreshold: number;
};

export type CpuThresholds = {
  excellent: CpuExcellentThresholds;
  low: CpuLowThresholds;
  average: CpuAverageThresholds;
};

// --- Network thresholds ---

export type NetworkLowThresholds = {
  bandwidthAverageThreshold: number;
};

export type NetworkAverageThresholds = {
  bandwidthAverageThreshold: number;
  downloadSpeedThreshold: number;
  signalStrengthThreshold: number;
};

export type NetworkHighThresholds = {
  bandwidthAverageThreshold: number;
  downloadSpeedThreshold: number;
  signalStrengthThreshold: number;
};

export type NetworkExcellentThresholds = {
  downloadSpeedThreshold: number;
  signalStrengthThreshold: number;
};

export type NetworkThresholds = {
  low: NetworkLowThresholds;
  average: NetworkAverageThresholds;
  high: NetworkHighThresholds;
  excellent: NetworkExcellentThresholds;
};

// --- Storage thresholds ---

export type StorageExcellentThresholds = {
  availableStorageGBThreshold: number;
};

export type StorageHighThresholds = {
  availableStorageGBThreshold: number;
};

export type StorageAverageThresholds = {
  availableStorageGBThreshold: number;
};

export type StorageThresholds = {
  excellent: StorageExcellentThresholds;
  high: StorageHighThresholds;
  average: StorageAverageThresholds;
};

// --- Top-level thresholds ---

export type PerformanceThresholds = {
  memory: MemoryThresholds;
  battery: BatteryThresholds;
  cpu: CpuThresholds;
  network: NetworkThresholds;
  storage: StorageThresholds;
};
