# @lokal-dev/react-native-device-metrics

[![npm version](https://badge.fury.io/js/%40lokal-dev%2Freact-native-device-metrics.svg)](https://www.npmjs.com/package/@lokal-dev/react-native-device-metrics)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Real-time device performance monitoring and telemetry for React Native. Collect CPU, memory, network, storage, and battery metrics with configurable thresholds and event-driven streaming.

> **Android only.** This library does not support iOS.

---

## Features

- **Real-time monitoring** — Background collection at configurable intervals
- **Two collection modes** — Raw metrics only, or detailed (raw + performance levels per class)
- **Metrics** — CPU, memory, network, storage, battery
- **Dual architecture** — Old React Native bridge and TurboModule
- **Event-driven** — Real-time updates via `DeviceEventEmitter`
- **TypeScript** — Full type definitions
- **Configurable thresholds** — Tune performance classification (low / average / high / excellent)

---

## Requirements

| Platform             | Version / Notes                    |
| -------------------- | ---------------------------------- |
| **React Native CLI** | 0.73+                              |
| **Expo (dev client)**| SDK 50+ (not compatible with Expo Go) |
| **Android**          | API 24+ (Android 7.0)              |
| **iOS**              | Not supported                      |

### Android

- **minSdkVersion**: 24  
- **compileSdkVersion**: 36+

---

## Installation

```bash
npm install @lokal-dev/react-native-device-metrics
# or
yarn add @lokal-dev/react-native-device-metrics
```

### React Native CLI

No additional setup required.

### Expo

No additional setup required. Expo Go is not supported — use a development build.

---

## Performance Classes & Levels

**Classes** (what you collect):

```typescript
import { PerformanceClass } from '@lokal-dev/react-native-device-metrics';

PerformanceClass.CPU;     // 0
PerformanceClass.MEMORY;  // 1
PerformanceClass.STORAGE; // 2
PerformanceClass.NETWORK; // 3
PerformanceClass.BATTERY; // 4
```

**Levels** (classification result):

```typescript
import { PerformanceLevel } from '@lokal-dev/react-native-device-metrics';

PerformanceLevel.UNKNOWN;  // 0
PerformanceLevel.LOW;      // 1
PerformanceLevel.AVERAGE; // 2
PerformanceLevel.HIGH;     // 3
PerformanceLevel.EXCELLENT;// 4
```

---

## Collection Flows

Two independent flows; both can run at the same time. Only `shutdown()` stops everything.

|                         | Raw collection              | Detailed collection                    |
| ----------------------- | --------------------------- | -------------------------------------- |
| **Data**                | Sensor/system values only   | Raw + `performanceLevel` per class     |
| **Use case**            | Logging, custom logic       | Ready-made performance assessment      |
| **Event**               | `onRawPerformanceData`      | `onDetailedPerformanceData`           |
| **Overhead**            | Lower                       | Slightly higher (includes classification) |

---

## Quick Start

### 1. Initialize

```typescript
import * as DeviceMetrics from '@lokal-dev/react-native-device-metrics';

await DeviceMetrics.init();
// or with custom thresholds
await DeviceMetrics.init(customThresholds);
```

### 2. Raw data collection

```typescript
// Start CPU + memory every 15s
await DeviceMetrics.startRawPerformanceDataCollection(
  [DeviceMetrics.PerformanceClass.CPU, DeviceMetrics.PerformanceClass.MEMORY],
  15
);

const subscription = DeviceMetrics.addRawPerformanceDataListener((data) => {
  console.log('CPU cores:', data.cpu?.coreCount);
  console.log('Available RAM:', data.memory?.availableRamGB, 'GB');
});

await DeviceMetrics.updateRawPerformanceDataCollection(10); // change interval
await DeviceMetrics.stopRawPerformanceDataCollection();
subscription.remove();
```

### 3. Detailed data collection

```typescript
await DeviceMetrics.startDetailedPerformanceDataCollection(
  [DeviceMetrics.PerformanceClass.CPU, DeviceMetrics.PerformanceClass.MEMORY],
  15
);

const subscription = DeviceMetrics.addDetailedPerformanceDataListener((data) => {
  console.log('CPU level:', data.cpu?.performanceLevel);
  console.log('Memory level:', data.memory?.performanceLevel);
});

await DeviceMetrics.stopDetailedPerformanceDataCollection();
subscription.remove();
```

### 4. One-shot weighted assessment

```typescript
const results = await DeviceMetrics.getWeightedPerformanceLevels([
  { class: DeviceMetrics.PerformanceClass.CPU, weight: 2.0 },
  { class: DeviceMetrics.PerformanceClass.MEMORY, weight: 1.5 },
  { class: DeviceMetrics.PerformanceClass.NETWORK, weight: 1.0 },
]);
console.log('Overall:', results.overallPerformanceLevel);
console.log('CPU:', results.cpu, 'Memory:', results.memory);
```

---

## API Reference

### Initialization & lifecycle

| Method              | Description |
| ------------------- | ----------- |
| `init(thresholds?)` | Initialize the SDK. Call before any other API. |
| `shutdown()`        | Stop all flows and reset. Call `init()` again to reuse. |

### Raw collection

| Method | Description |
| ------ | ----------- |
| `startRawPerformanceDataCollection(classes, delaySeconds)` | Start periodic raw collection; emits `onRawPerformanceData`. |
| `updateRawPerformanceDataCollection(delaySeconds)` | Change interval; returns `true` if updated. |
| `stopRawPerformanceDataCollection()` | Stop raw collection only. |
| `getLatestRawPerformanceData()` | Last raw snapshot (parsed object, or `null` if none yet). |
| `addRawPerformanceDataListener(callback)` | Subscribe to raw events; returns `EventSubscription`. |

### Detailed collection

| Method | Description |
| ------ | ----------- |
| `startDetailedPerformanceDataCollection(classes, delaySeconds)` | Start detailed collection; emits `onDetailedPerformanceData`. |
| `updateDetailedPerformanceDataCollection(delaySeconds)` | Change interval; returns `true` if updated. |
| `stopDetailedPerformanceDataCollection()` | Stop detailed collection only. |
| `getLatestDetailedPerformanceData()` | Last detailed snapshot (parsed object, or `null` if none yet). |
| `addDetailedPerformanceDataListener(callback)` | Subscribe to detailed events; returns `EventSubscription`. |

### Performance levels

| Method | Description |
| ------ | ----------- |
| `getWeightedPerformanceLevels(classesWithWeights)` | One-shot weighted assessment. Returns a parsed `WeightedPerformanceLevels` object (overall + per-class levels as strings). |
| `getPerformanceLevel(performanceClass)` | Current performance level for one class. Returns a number: `0` (UNKNOWN), `1` (LOW), `2` (AVERAGE), `3` (HIGH), `4` (EXCELLENT). |

**Parameters**

- **`classes`**: `number[]` — `PerformanceClass` values (CPU=0, MEMORY=1, STORAGE=2, NETWORK=3, BATTERY=4). Only these are collected; others are `null` in the result.
- **`delaySeconds`**: `number` — Interval in whole seconds (min 1).

**Stop vs shutdown**

- `stopRawPerformanceDataCollection()` / `stopDetailedPerformanceDataCollection()` — Stop that flow only; SDK stays initialized.
- `shutdown()` — Stop all flows and tear down the SDK.

---

## Custom Thresholds

Pass a thresholds object into `init()` to customize how raw values map to performance levels (e.g. memory, battery, CPU). See the type definitions for the full shape; example for memory and battery:

```typescript
const customThresholds = {
  memory: {
    low: { approxHeapRemainingInMBThreshold: 32, approxHeapLimitInMBThreshold: 64 },
    average: { approxHeapRemainingInMBThreshold: 64, approxHeapLimitInMBThreshold: 128, availableRamGBThreshold: 1.5 },
    high: { approxHeapRemainingInMBThreshold: 256, availableRamGBThreshold: 3 },
  },
  battery: {
    excellent: { batteryPercentageThreshold: 80, isChargingBatteryPercentageThreshold: 70, temperatureThreshold: 30 },
    high: { batteryPercentageThreshold: 55, isChargingBatteryPercentageThreshold: 50, temperatureThreshold: 34 },
    average: { batteryPercentageThreshold: 40, isChargingBatteryPercentageThreshold: 35, temperatureThreshold: 38 },
  },
  // ... cpu, network, storage
};
await DeviceMetrics.init(customThresholds);
```

---

## Recommended Collection Intervals

| Use case                 | Interval (seconds) |
| ------------------------- | ------------------- |
| Background monitoring     | 15–30              |
| Active feature monitoring | 5–10               |
| Call/video monitoring     | 2–5                |

---

## Troubleshooting

### Runtime

- **`Cannot read property 'init' of undefined`** — Clean build and Metro cache:
  ```bash
  cd android && ./gradlew clean && cd ..
  npx react-native start --reset-cache
  ```
  Reinstall deps if needed: `rm -rf node_modules && npm install`.
- **Collection never fires** — Call `await DeviceMetrics.init()` before any `start*` method.

---

## Publishing

Publishing is automated via GitHub Actions. The `publish.yml` workflow triggers on any `v*` tag push, runs validation, and publishes to npm with provenance attestation.

### Stable release

```bash
git checkout main && git pull origin main
yarn release          # select the next stable version e.g. 1.0.1
```

release-it bumps `package.json`, generates `CHANGELOG.md`, commits, tags `v1.0.1`, and pushes. The tag push triggers the publish pipeline which publishes under the `latest` dist-tag.

### Beta / pre-release

```bash
yarn release --preRelease=beta   # produces 1.0.1-beta.0, 1.0.1-beta.1, etc.
```

Published under the `beta` dist-tag — `latest` is not affected.

---

## Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit (`git commit -m 'feat: your change'`)
4. Push (`git push origin feature/your-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

## License

MIT — see [LICENSE](LICENSE).

---

## Related

- [device-telemetry-toolkit](https://github.com/lokal-app/device-telemetry-toolkit) — Native Android performance SDK used by this library.

Built by [Lokal](https://getlokalapp.com).
