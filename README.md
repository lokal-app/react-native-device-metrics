# React Native Device Metrics

[![npm version](https://badge.fury.io/js/@lokal-dev/react-native-device-metrics.svg)](https://badge.fury.io/js/@lokal-dev/react-native-device-metrics)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A React Native library for real-time device performance monitoring and telemetry collection. Monitor CPU, Memory, Network, Storage, and Battery metrics with configurable thresholds and event-driven data streaming.

## Key Features

- **Real-time Performance Monitoring**: Continuous background data collection with configurable intervals
- **Two Collection Flows**: Raw metrics only, or Detailed metrics (raw + performance levels in one object)
- **Comprehensive Metrics**: CPU, Memory, Network, Storage, and Battery telemetry
- **Dual Architecture Support**: Compatible with both old React Native bridge and new TurboModule architecture
- **Event-Driven Updates**: Native to JavaScript real-time data streaming via DeviceEventEmitter
- **TypeScript Ready**: Full type definitions with comprehensive interfaces
- **Configurable Thresholds**: Customize performance classification levels

## Requirements

| Platform             | Support                      |
| -------------------- | ---------------------------- |
| **React Native CLI** | 0.73+                        |
| **Expo Dev Client**  | SDK 50+                      |
| **Android**          | API 24+ (Android 7.0)        |
| **iOS**              | Not Supported (Android only) |

### Android Requirements

- **minSdkVersion**: 24
- **compileSdkVersion**: 35+
- **Kotlin**: Enabled

## Installation

```bash
npm install @lokal-dev/react-native-device-metrics
# or
yarn add @lokal-dev/react-native-device-metrics
```

### GitHub Packages Authentication

This library depends on a native Android SDK hosted on GitHub Packages. You need to set these environment variables for the Android build to resolve the dependency:

```bash
export GITHUB_USERNAME="your-github-username"
export GITHUB_TOKEN="your-github-personal-access-token"
```

The token needs the `read:packages` scope.

### React Native CLI

The library links automatically. Add the GitHub Packages Maven repo to your project-level `android/build.gradle`:

```groovy
allprojects {
    repositories {
        maven {
            url = uri("https://maven.pkg.github.com/lokal-app/device-telemetry-toolkit")
            credentials {
                username = System.getenv("GITHUB_USERNAME") ?: ""
                password = System.getenv("GITHUB_TOKEN") ?: ""
            }
        }
    }
}
```

### Expo

Add the config plugin to your `app.json` (this injects the Maven repo automatically):

```json
{
  "expo": {
    "plugins": ["@lokal-dev/react-native-device-metrics"]
  }
}
```

Then create a development build:

```bash
npx expo run:android
# This library requires a development build and cannot be used with Expo Go
```

## Performance Classes

```typescript
import { PerformanceClass } from '@lokal-dev/react-native-device-metrics';

PerformanceClass.CPU; // 0
PerformanceClass.MEMORY; // 1
PerformanceClass.STORAGE; // 2
PerformanceClass.NETWORK; // 3
PerformanceClass.BATTERY; // 4
```

## Performance Levels

Numeric values returned by `getPerformanceLevel()` and their string equivalents used in detailed data and weighted results:

```typescript
import { PerformanceLevel } from '@lokal-dev/react-native-device-metrics';

PerformanceLevel.UNKNOWN; // 0
PerformanceLevel.LOW; // 1
PerformanceLevel.AVERAGE; // 2
PerformanceLevel.HIGH; // 3
PerformanceLevel.EXCELLENT; // 4
```

## Collection Flows

The library provides two independent data collection flows that can run simultaneously:

|                  | Raw Data Collection                  | Detailed Data Collection                         |
| ---------------- | ------------------------------------ | ------------------------------------------------ |
| **What you get** | Sensor/system values only            | Raw data + computed `performanceLevel` per class |
| **Use case**     | Logging, custom classification logic | Ready-to-use performance assessment              |
| **Event name**   | `onRawPerformanceData`               | `onDetailedPerformanceData`                      |
| **Cost**         | Lighter (reads only)                 | Slightly heavier (reads + classification)        |

Both flows share the same start/update/stop lifecycle and are fully independent -- starting one does not affect the other. Only `shutdown()` stops both.

## Quick Start

### Initialize

```typescript
import * as DeviceMetrics from '@lokal-dev/react-native-device-metrics';

await DeviceMetrics.init();
// or with custom thresholds
await DeviceMetrics.init(customThresholds);
```

### Raw Data Collection

Collects raw sensor/system values at a configurable interval.

```typescript
import * as DeviceMetrics from '@lokal-dev/react-native-device-metrics';

// Start collecting CPU and Memory metrics every 15 seconds
await DeviceMetrics.startRawPerformanceDataCollection(
  [DeviceMetrics.PerformanceClass.CPU, DeviceMetrics.PerformanceClass.MEMORY],
  15
);

// Listen for real-time raw data events
const subscription = DeviceMetrics.addRawPerformanceDataListener((data) => {
  console.log('CPU cores:', data.cpu?.coreCount);
  console.log('Available RAM:', data.memory?.availableRamGB, 'GB');
});

// Update collection interval without losing the listener
await DeviceMetrics.updateRawPerformanceDataCollection(10);

// Stop raw collection (SDK stays alive for other flows)
await DeviceMetrics.stopRawPerformanceDataCollection();

// Cleanup listener
subscription.remove();
```

### Detailed Data Collection

Collects the same raw data as above, plus a computed `performanceLevel` per class (UNKNOWN, LOW, AVERAGE, HIGH, EXCELLENT).

```typescript
import * as DeviceMetrics from '@lokal-dev/react-native-device-metrics';

// Start collecting detailed metrics every 15 seconds
await DeviceMetrics.startDetailedPerformanceDataCollection(
  [DeviceMetrics.PerformanceClass.CPU, DeviceMetrics.PerformanceClass.MEMORY],
  15
);

// Listen for real-time detailed data events
const subscription = DeviceMetrics.addDetailedPerformanceDataListener(
  (data) => {
    console.log('CPU level:', data.cpu?.performanceLevel); // "HIGH"
    console.log('CPU cores:', data.cpu?.coreCount); // 8
    console.log('Memory level:', data.memory?.performanceLevel); // "AVERAGE"
    console.log('Available RAM:', data.memory?.availableRamGB); // 2.45
  }
);

// Update collection interval
await DeviceMetrics.updateDetailedPerformanceDataCollection(10);

// Stop detailed collection
await DeviceMetrics.stopDetailedPerformanceDataCollection();

// Cleanup listener
subscription.remove();
```

### Performance Classification (One-shot)

Get a weighted performance assessment without starting background collection.

```typescript
const results = await DeviceMetrics.getWeightedPerformanceLevelsParsed([
  { class: DeviceMetrics.PerformanceClass.CPU, weight: 2.0 },
  { class: DeviceMetrics.PerformanceClass.MEMORY, weight: 1.5 },
  { class: DeviceMetrics.PerformanceClass.NETWORK, weight: 1.0 },
]);

console.log('Overall:', results.overallPerformanceLevel); // "HIGH"
console.log('CPU:', results.cpu); // "EXCELLENT"
console.log('Memory:', results.memory); // "AVERAGE"
```

## API Reference

### Initialization & Lifecycle

| Method              | Description                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `init(thresholds?)` | Initialize the SDK. Must be called before any other method.                                   |
| `shutdown()`        | Stop all collection flows, destroy all managers, reset SDK. Requires `init()` again to reuse. |

### Raw Data Collection

| Method                                                     | Description                                                                                  |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `startRawPerformanceDataCollection(classes, delaySeconds)` | Start periodic raw data collection. Emits `onRawPerformanceData` events.                     |
| `updateRawPerformanceDataCollection(delaySeconds)`         | Update interval on an active raw collection. Returns `true` if updated.                      |
| `stopRawPerformanceDataCollection()`                       | Stop raw collection only. SDK stays alive for other flows.                                   |
| `getLatestRawPerformanceData()`                            | Get the last cached raw data snapshot as a JSON string (bridge-level cache, no SDK call).    |
| `getLatestRawPerformanceDataParsed()`                      | Same as above but returns a parsed `RawPerformanceDataResult` object.                        |
| `addRawPerformanceDataListener(callback)`                  | Register a typed listener for `onRawPerformanceData` events. Returns an `EventSubscription`. |

### Detailed Data Collection

| Method                                                          | Description                                                                                       |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `startDetailedPerformanceDataCollection(classes, delaySeconds)` | Start periodic detailed data collection. Emits `onDetailedPerformanceData` events.                |
| `updateDetailedPerformanceDataCollection(delaySeconds)`         | Update interval on an active detailed collection. Returns `true` if updated.                      |
| `stopDetailedPerformanceDataCollection()`                       | Stop detailed collection only. SDK stays alive for other flows.                                   |
| `getLatestDetailedPerformanceData()`                            | Get the last cached detailed data snapshot as a JSON string (bridge-level cache, no SDK call).    |
| `getLatestDetailedPerformanceDataParsed()`                      | Same as above but returns a parsed `DetailedPerformanceDataResult` object.                        |
| `addDetailedPerformanceDataListener(callback)`                  | Register a typed listener for `onDetailedPerformanceData` events. Returns an `EventSubscription`. |

### Performance Levels

| Method                                                   | Description                                                                                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `getWeightedPerformanceLevels(classesWithWeights)`       | One-shot weighted performance assessment. Returns JSON string.                                                                              |
| `getWeightedPerformanceLevelsParsed(classesWithWeights)` | Same as above but returns a parsed `WeightedPerformanceLevels` object.                                                                      |
| `getPerformanceLevel(performanceClass)`                  | Get the current performance level for a single class. Returns a `PerformanceLevel` value: 0=UNKNOWN, 1=LOW, 2=AVERAGE, 3=HIGH, 4=EXCELLENT. |

### Parameters

- **`classes`**: `number[]` — Array of `PerformanceClass` constants (CPU=0, MEMORY=1, STORAGE=2, NETWORK=3, BATTERY=4). Only the specified classes will be collected; others will be `null` in the result.
- **`delaySeconds`**: `number` — Collection interval in whole seconds (minimum 1). Fractional values are truncated.

### stop vs shutdown

| Method                                    | What it does                                             | When to use                                                  |
| ----------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| `stopRawPerformanceDataCollection()`      | Stops raw collection only. SDK remains initialized.      | Pause raw monitoring while keeping other flows running.      |
| `stopDetailedPerformanceDataCollection()` | Stops detailed collection only. SDK remains initialized. | Pause detailed monitoring while keeping other flows running. |
| `shutdown()`                              | Stops all flows, destroys all managers, resets SDK.      | App teardown, re-initialization with new thresholds.         |

## Custom Thresholds

```typescript
const customThresholds = {
  memory: {
    low: {
      approxHeapRemainingInMBThreshold: 32,
      approxHeapLimitInMBThreshold: 64,
    },
    average: {
      approxHeapRemainingInMBThreshold: 64,
      approxHeapLimitInMBThreshold: 128,
      availableRamGBThreshold: 1.5,
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
      temperatureThreshold: 30,
    },
    high: {
      batteryPercentageThreshold: 55,
      isChargingBatteryPercentageThreshold: 50,
      temperatureThreshold: 34,
    },
    average: {
      batteryPercentageThreshold: 40,
      isChargingBatteryPercentageThreshold: 35,
      temperatureThreshold: 38,
    },
  },
  // ... cpu, network, storage thresholds
};

await DeviceMetrics.init(customThresholds);
```

## Recommended Collection Intervals

| Use case                  | Interval      |
| ------------------------- | ------------- |
| Background monitoring     | 15-30 seconds |
| Active feature monitoring | 5-10 seconds  |
| Call/video monitoring     | 2-5 seconds   |

## Troubleshooting

### Build Errors

**AGP Version Conflicts**

```
Error: Could not determine the dependencies of task ':app:compileDebugJavaWithJavac'
```

Ensure consistent Android Gradle Plugin versions across all modules.

**Kotlin Version Mismatch**

```
Module was compiled with an incompatible version of Kotlin
```

Ensure Kotlin version compatibility. React Native 0.73+ typically uses Kotlin 1.8.0+.

### Runtime Issues

**Module Not Found**

```javascript
Cannot read property 'init' of undefined
```

1. Clean and rebuild: `cd android && ./gradlew clean && cd .. && npx react-native run-android`
2. Reset Metro cache: `npx react-native start --reset-cache`
3. Reinstall node_modules: `rm -rf node_modules && npm install`

**Data Collection Fails**

Ensure `init()` is called before starting any collection:

```typescript
await DeviceMetrics.init();
await DeviceMetrics.startRawPerformanceDataCollection([...], delaySeconds);
```

## Publishing

### Prerequisites

- npm account with access to the `@lokal-dev` scope
- Logged in via `npm login`

### Steps

1. Ensure all changes are committed and the working tree is clean.

2. Build the library:

   ```bash
   yarn prepare
   ```

3. Bump the version:

   ```bash
   npm version patch  # or minor / major
   ```

4. Publish to npm (scoped packages require `--access public`):

   ```bash
   npm publish --access public
   ```

5. Push the version commit and tag:
   ```bash
   git push && git push --tags
   ```

### Using release-it (recommended)

The library is configured with [release-it](https://github.com/release-it/release-it) for automated releases:

```bash
yarn release
```

This will bump the version, create a git tag, publish to npm, and create a GitHub release.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- **[device-telemetry-toolkit](https://github.com/lokal-app/device-telemetry-toolkit)** - Native Android performance monitoring library (droid-dex)

---

Built with love by the [Lokal](https://getlokalapp.com) team
