import { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
  ScrollView,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import {
  init,
  PerformanceClass,
  getDefaultThresholds,
  startDetailedPerformanceDataCollection,
  stopDetailedPerformanceDataCollection,
  updateDetailedPerformanceDataCollection,
  getWeightedPerformanceLevels,
} from '@lokal-dev/react-native-device-metrics';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [detailedData, setDetailedData] = useState<any>(null);
  const [weightedData, setWeightedData] = useState<any>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [isCallSimulating, setIsCallSimulating] = useState(false);
  const [callPhase, setCallPhase] = useState<string | null>(null);
  const [callTimerRef, setCallTimerRef] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [timingData, setTimingData] = useState<{
    collectionStartTime: number | null;
    lastEventTime: number | null;
    eventCount: number;
    delaySeconds: number;
    actualResponseTime: number | null;
    processingTime: number | null;
  }>({
    collectionStartTime: null,
    lastEventTime: null,
    eventCount: 0,
    delaySeconds: 10,
    actualResponseTime: null,
    processingTime: null,
  });

  // Set up event listener for real-time detailed data updates
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'onDetailedPerformanceData',
      (enhancedData) => {
        const jsReceiptTime = Date.now();
        const timeString = new Date(jsReceiptTime).toLocaleTimeString();

        console.log(
          'DETAILED DATA STRUCTURE:',
          JSON.stringify(enhancedData, null, 2)
        );

        const {
          bridgeStartMs,
          nativeExecutionStartMs,
          nativeExecutionDurationMs,
          ...rawData
        } = enhancedData;

        setTimingData((prev) => {
          const newEventCount = prev.eventCount + 1;

          if (bridgeStartMs && nativeExecutionDurationMs) {
            const timingAnalysis = {
              nativeExecutionMs: nativeExecutionDurationMs,
              bridgeTransferMs: jsReceiptTime - bridgeStartMs,
              totalLatencyMs: jsReceiptTime - nativeExecutionStartMs,
              accountedTimeMs:
                nativeExecutionDurationMs + (jsReceiptTime - bridgeStartMs),
            };

            const unaccountedTime = Math.round(
              timingAnalysis.totalLatencyMs - timingAnalysis.accountedTimeMs
            );

            console.log(`TIMING - Event #${newEventCount} at ${timeString}:
          Native execution: ${Math.round(timingAnalysis.nativeExecutionMs)}ms
          Bridge transfer: ${Math.round(timingAnalysis.bridgeTransferMs)}ms
          Total latency: ${Math.round(timingAnalysis.totalLatencyMs)}ms
          Unaccounted: ${unaccountedTime}ms`);

            return {
              ...prev,
              lastEventTime: jsReceiptTime,
              eventCount: newEventCount,
              actualResponseTime: timingAnalysis.nativeExecutionMs,
              processingTime: timingAnalysis.bridgeTransferMs,
            };
          } else {
            const actualResponseTime =
              (prev.lastEventTime ?? 0) > 0
                ? jsReceiptTime - (prev.lastEventTime ?? 0)
                : prev.collectionStartTime
                ? jsReceiptTime - prev.collectionStartTime
                : 0;

            const expectedDelayMs = prev.delaySeconds * 1000;
            const processingTime =
              actualResponseTime > expectedDelayMs
                ? actualResponseTime - expectedDelayMs
                : actualResponseTime;

            const timingInfo =
              newEventCount === 1
                ? `FALLBACK Event #${newEventCount} - First response time: ${actualResponseTime}ms (from collection start)`
                : `FALLBACK Event #${newEventCount} - Interval: ${actualResponseTime}ms | Expected: ${expectedDelayMs}ms | Processing: ${processingTime}ms`;

            console.log(`${timingInfo} at ${timeString}`);

            return {
              ...prev,
              lastEventTime: jsReceiptTime,
              eventCount: newEventCount,
              actualResponseTime,
              processingTime,
            };
          }
        });

        setDetailedData(rawData);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const initializeSDK = async () => {
    try {
      await init();
      setIsInitialized(true);
      Alert.alert('Success', 'Device Metrics SDK initialized successfully!');
    } catch (error) {
      Alert.alert('Error', `Failed to initialize SDK: ${error}`);
    }
  };

  const initializeSDKWithCustomThresholds = async () => {
    try {
      const customThresholds = getDefaultThresholds();

      customThresholds.memory.low.approxHeapRemainingInMBThreshold = 40;
      customThresholds.memory.average.approxHeapRemainingInMBThreshold = 128;
      customThresholds.memory.high.approxHeapRemainingInMBThreshold = 200;

      customThresholds.battery.excellent.temperatureThreshold = 28;
      customThresholds.battery.high.temperatureThreshold = 32;
      customThresholds.battery.average.temperatureThreshold = 36;

      await init(customThresholds);
      setIsInitialized(true);
      Alert.alert(
        'Success',
        'Device Metrics SDK initialized with custom thresholds!'
      );
    } catch (error) {
      Alert.alert('Error', `Failed to initialize SDK: ${error}`);
    }
  };

  const startDataCollection = async () => {
    try {
      const startTime = Date.now();
      console.log(
        `Starting detailed data collection at: ${new Date(
          startTime
        ).toLocaleTimeString()}`
      );

      await startDetailedPerformanceDataCollection(
        [
          PerformanceClass.CPU,
          PerformanceClass.MEMORY,
          PerformanceClass.NETWORK,
          PerformanceClass.BATTERY,
          PerformanceClass.STORAGE,
        ],
        10
      );

      setIsCollecting(true);
      setTimingData({
        collectionStartTime: startTime,
        lastEventTime: 0,
        eventCount: 0,
        delaySeconds: 10,
        actualResponseTime: null,
        processingTime: null,
      });

      Alert.alert('Success', 'Detailed data collection started!');
    } catch (error) {
      Alert.alert('Error', `Failed to start data collection: ${error}`);
    }
  };

  const stopDataCollection = async () => {
    try {
      if (callTimerRef) {
        clearTimeout(callTimerRef);
        setCallTimerRef(null);
      }
      setIsCallSimulating(false);
      setCallPhase(null);

      await stopDetailedPerformanceDataCollection();
      setIsCollecting(false);
      setTimingData({
        collectionStartTime: null,
        lastEventTime: null,
        eventCount: 0,
        delaySeconds: 10,
        actualResponseTime: null,
        processingTime: null,
      });
      Alert.alert('Success', 'Detailed data collection stopped!');
    } catch (error) {
      Alert.alert('Error', `Failed to stop data collection: ${error}`);
    }
  };

  const simulateCall = async () => {
    if (!isCollecting || isCallSimulating) return;

    const intensiveDelay = 3;
    const intensiveDurationMs = 20_000;
    const globalDelay = 10;

    try {
      setIsCallSimulating(true);
      setCallPhase(
        `Intensive (${intensiveDelay}s) for ${intensiveDurationMs / 1000}s`
      );

      const updated = await updateDetailedPerformanceDataCollection(
        intensiveDelay
      );

      if (!updated) {
        Alert.alert('Error', 'No active collection to update');
        setIsCallSimulating(false);
        setCallPhase(null);
        return;
      }

      setTimingData((prev) => ({ ...prev, delaySeconds: intensiveDelay }));
      console.log(
        `CALL SIMULATION: Phase 1 - ${intensiveDelay}s intervals for ${
          intensiveDurationMs / 1000
        }s`
      );

      const timer = setTimeout(async () => {
        try {
          await updateDetailedPerformanceDataCollection(globalDelay);
          setTimingData((prev) => ({ ...prev, delaySeconds: globalDelay }));
          console.log(
            `CALL SIMULATION: Phase 2 - resumed ${globalDelay}s intervals`
          );
        } catch (e) {
          console.error('Failed to resume global collection:', e);
        }
        setIsCallSimulating(false);
        setCallPhase(null);
        setCallTimerRef(null);
      }, intensiveDurationMs);

      setCallTimerRef(timer);
    } catch (error) {
      Alert.alert('Error', `Failed to simulate call: ${error}`);
      setIsCallSimulating(false);
      setCallPhase(null);
    }
  };

  const getWeightedLevels = async () => {
    try {
      const data = await getWeightedPerformanceLevels([
        { class: PerformanceClass.CPU, weight: 1.0 },
        { class: PerformanceClass.MEMORY, weight: 3.0 },
        { class: PerformanceClass.NETWORK, weight: 1.0 },
        { class: PerformanceClass.STORAGE, weight: 1.0 },
        { class: PerformanceClass.BATTERY, weight: 1.0 },
      ]);
      setWeightedData(data);
      Alert.alert('Success', 'Weighted performance levels retrieved!');
    } catch (error) {
      Alert.alert('Error', `Failed to get weighted levels: ${error}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Device Metrics Turbo Module Test</Text>

      <View style={styles.buttonContainer}>
        <Button
          title={isInitialized ? 'SDK Initialized' : 'Initialize SDK (Default)'}
          onPress={initializeSDK}
          disabled={isInitialized}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Initialize SDK (Custom Thresholds)"
          onPress={initializeSDKWithCustomThresholds}
          disabled={isInitialized}
        />
      </View>

      {isInitialized && (
        <>
          <View style={styles.buttonContainer}>
            <Button
              title={
                isCollecting
                  ? 'Stop Detailed Collection'
                  : 'Start Detailed Data Collection'
              }
              onPress={isCollecting ? stopDataCollection : startDataCollection}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={
                isCallSimulating
                  ? `Call Active - ${callPhase}`
                  : 'Simulate Call (3s for 20s, then 10s)'
              }
              onPress={simulateCall}
              disabled={!isCollecting || isCallSimulating}
              color="#FF5722"
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Get Weighted Performance Levels"
              onPress={getWeightedLevels}
            />
          </View>
        </>
      )}

      {timingData.actualResponseTime != null && (
        <View style={styles.dataContainer}>
          <Text style={styles.sectionTitle}>
            Timing (delay: {timingData.delaySeconds}s)
            {callPhase ? ` | ${callPhase}` : ''}
          </Text>
          <Text style={styles.responseTimeText}>
            Event #{timingData.eventCount} | Native:{' '}
            {Math.round(timingData.actualResponseTime)}ms | Bridge:{' '}
            {timingData.processingTime != null
              ? Math.round(timingData.processingTime)
              : '-'}
            ms
          </Text>
        </View>
      )}

      {detailedData && (
        <View style={styles.dataContainer}>
          <Text style={styles.sectionTitle}>Latest Detailed Data:</Text>
          <Text style={styles.dataText}>
            {JSON.stringify(detailedData, null, 2)}
          </Text>
        </View>
      )}

      {weightedData && (
        <View style={styles.dataContainer}>
          <Text style={styles.sectionTitle}>Weighted Performance Levels:</Text>
          <Text style={styles.dataText}>
            {JSON.stringify(weightedData, null, 2)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  buttonContainer: {
    marginVertical: 10,
  },
  dataContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  dataText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 4,
  },
  responseTimeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5722',
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
});
