package com.devicemetrics

import android.util.Log
import androidx.lifecycle.Observer
import androidx.lifecycle.LiveData
import com.blinkit.droiddex.DroidDex
import com.blinkit.droiddex.models.*
import com.blinkit.droiddex.battery.models.*
import com.blinkit.droiddex.cpu.models.*
import com.blinkit.droiddex.memory.models.*
import com.blinkit.droiddex.network.models.*
import com.blinkit.droiddex.storage.models.*
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.UiThreadUtil
import org.json.JSONObject

class DeviceMetricsLegacyModule(
  reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    const val NAME = "DeviceMetrics"
  }

  // Raw collection state
  private var activeObserver: Observer<RawPerformanceDataResult>? = null
  private var activeLiveData: LiveData<RawPerformanceDataResult>? = null
  @Volatile private var latestRawData: RawPerformanceDataResult? = null

  // Detailed collection state (independent from raw)
  private var activeDetailedObserver: Observer<DetailedPerformanceDataResult>? = null
  private var activeDetailedLiveData: LiveData<DetailedPerformanceDataResult>? = null
  @Volatile private var latestDetailedData: DetailedPerformanceDataResult? = null

  override fun getName(): String = NAME

  // ---------- Init ----------

  @ReactMethod
  fun init(thresholds: String?, promise: Promise) {
    UiThreadUtil.runOnUiThread {
      try {
        val customThresholds = if (thresholds != null) {
          parseThresholdsFromJson(thresholds)
        } else {
          PerformanceThresholds()
        }

        // Clean up existing state to allow re-initialization with new thresholds
        removeActiveObserver()
        removeActiveDetailedObserver()
        DroidDex.shutdown()

        DroidDex.init(reactApplicationContext, customThresholds)
        promise.resolve(null)
      } catch (e: Exception) {
        Log.e("DeviceMetrics", "init() failed", e)
        promise.reject("INIT_ERROR", e.message, e)
      }
    }
  }

  // ---------- Raw collection ----------

  @ReactMethod
  fun startRawPerformanceDataCollection(
    classes: ReadableArray,
    delay: Double,
    promise: Promise
  ) {
    try {
      val perfClasses = IntArray(classes.size()) { classes.getInt(it) }

      UiThreadUtil.runOnUiThread {
        try {
          // Clean up any existing observer before starting
          removeActiveObserver()
          DroidDex.stopRawPerformanceDataCollection()

          val liveData = DroidDex.startRawPerformanceDataCollection(
            *perfClasses,
            delaySeconds = delay.toInt().coerceAtLeast(1)
          )

          val observer = Observer<RawPerformanceDataResult> { rawData ->
            val bridgeStartTime = System.currentTimeMillis()
            latestRawData = rawData

            try {
              if (!reactApplicationContext.hasActiveReactInstance()) return@Observer

              val params = Arguments.makeNativeMap(rawData.toMap())
              params.putDouble("bridgeStartMs", bridgeStartTime.toDouble())

              reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onRawPerformanceData", params)
            } catch (e: Exception) {
              Log.e("DeviceMetrics", "Failed to emit event", e)
            }
          }

          activeObserver = observer
          activeLiveData = liveData
          liveData.observeForever(observer)

          promise.resolve(null)
        } catch (e: Exception) {
          promise.reject("START_COLLECTION_ERROR", e.message, e)
        }
      }
    } catch (e: Exception) {
      promise.reject("START_COLLECTION_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun updateRawPerformanceDataCollection(
    delay: Double,
    promise: Promise
  ) {
    try {
      UiThreadUtil.runOnUiThread {
        try {
          val updated = DroidDex.updateRawPerformanceDataCollection(
            delaySeconds = delay.toInt().coerceAtLeast(1)
          )

          promise.resolve(updated)
        } catch (e: Exception) {
          promise.reject("UPDATE_COLLECTION_ERROR", e.message, e)
        }
      }
    } catch (e: Exception) {
      promise.reject("UPDATE_COLLECTION_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun stopRawPerformanceDataCollection(promise: Promise) {
    UiThreadUtil.runOnUiThread {
      try {
        removeActiveObserver()
        DroidDex.stopRawPerformanceDataCollection()
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("STOP_COLLECTION_ERROR", e.message, e)
      }
    }
  }

  // Bridge-level convenience: returns the last cached raw data snapshot on-demand.
  // In native Android, you can read LiveData.getValue() synchronously, but in RN
  // data only flows to JS via DeviceEventEmitter events. This method lets JS poll
  // the latest value at any time without waiting for the next event emission.
  @ReactMethod
  fun getLatestRawPerformanceData(promise: Promise) {
    try {
      val data = latestRawData
      if (data != null) {
        promise.resolve(convertRawDataToJson(data))
      } else {
        promise.resolve(null)
      }
    } catch (e: Exception) {
      promise.reject("GET_DATA_ERROR", e.message, e)
    }
  }

  // ---------- Detailed collection ----------

  @ReactMethod
  fun startDetailedPerformanceDataCollection(
    classes: ReadableArray,
    delay: Double,
    promise: Promise
  ) {
    try {
      val perfClasses = IntArray(classes.size()) { classes.getInt(it) }

      UiThreadUtil.runOnUiThread {
        try {
          // Clean up any existing observer before starting
          removeActiveDetailedObserver()
          DroidDex.stopDetailedPerformanceDataCollection()

          val liveData = DroidDex.startDetailedPerformanceDataCollection(
            *perfClasses,
            delaySeconds = delay.toInt().coerceAtLeast(1)
          )

          val observer = Observer<DetailedPerformanceDataResult> { detailedData ->
            val bridgeStartTime = System.currentTimeMillis()
            latestDetailedData = detailedData

            try {
              if (!reactApplicationContext.hasActiveReactInstance()) return@Observer

              val params = Arguments.makeNativeMap(detailedData.toMap())
              params.putDouble("bridgeStartMs", bridgeStartTime.toDouble())

              reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onDetailedPerformanceData", params)
            } catch (e: Exception) {
              Log.e("DeviceMetrics", "Failed to emit detailed event", e)
            }
          }

          activeDetailedObserver = observer
          activeDetailedLiveData = liveData
          liveData.observeForever(observer)

          promise.resolve(null)
        } catch (e: Exception) {
          promise.reject("START_DETAILED_COLLECTION_ERROR", e.message, e)
        }
      }
    } catch (e: Exception) {
      promise.reject("START_DETAILED_COLLECTION_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun updateDetailedPerformanceDataCollection(
    delay: Double,
    promise: Promise
  ) {
    try {
      UiThreadUtil.runOnUiThread {
        try {
          val updated = DroidDex.updateDetailedPerformanceDataCollection(
            delaySeconds = delay.toInt().coerceAtLeast(1)
          )

          promise.resolve(updated)
        } catch (e: Exception) {
          promise.reject("UPDATE_DETAILED_COLLECTION_ERROR", e.message, e)
        }
      }
    } catch (e: Exception) {
      promise.reject("UPDATE_DETAILED_COLLECTION_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun stopDetailedPerformanceDataCollection(promise: Promise) {
    UiThreadUtil.runOnUiThread {
      try {
        removeActiveDetailedObserver()
        DroidDex.stopDetailedPerformanceDataCollection()
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("STOP_DETAILED_COLLECTION_ERROR", e.message, e)
      }
    }
  }

  // Bridge-level convenience: returns the last cached detailed data snapshot on-demand.
  // In native Android, you can read LiveData.getValue() synchronously, but in RN
  // data only flows to JS via DeviceEventEmitter events. This method lets JS poll
  // the latest value at any time without waiting for the next event emission.
  @ReactMethod
  fun getLatestDetailedPerformanceData(promise: Promise) {
    try {
      val data = latestDetailedData
      if (data != null) {
        promise.resolve(convertDetailedDataToJson(data))
      } else {
        promise.resolve(null)
      }
    } catch (e: Exception) {
      promise.reject("GET_DETAILED_DATA_ERROR", e.message, e)
    }
  }

  // ---------- Performance levels ----------

  @ReactMethod
  fun getWeightedPerformanceLevels(
    classesWithWeights: ReadableArray,
    promise: Promise
  ) {
    try {
      val weightedClasses = Array(classesWithWeights.size()) { index ->
        val item = classesWithWeights.getMap(index)
          ?: throw IllegalArgumentException("react-native-device-metrics: Missing data at index $index")
        Pair(item.getInt("class"), item.getDouble("weight").toFloat())
      }

      val result = DroidDex.getWeightedPerformanceLevels(*weightedClasses)
      promise.resolve(JSONObject(result.toMap()).toString())
    } catch (e: Exception) {
      promise.reject("WEIGHTED_LEVELS_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun getPerformanceLevel(performanceClass: Double, promise: Promise) {
    try {
      val level = DroidDex.getPerformanceLevel(performanceClass.toInt())
      promise.resolve(level.level.toDouble())
    } catch (e: Exception) {
      promise.reject("PERFORMANCE_LEVEL_ERROR", e.message, e)
    }
  }

  // ---------- Event listener stubs (required by RN event emitter) ----------

  @ReactMethod
  fun addListener(eventName: String) {
    // No-op: required by RN DeviceEventEmitter to suppress warnings
  }

  @ReactMethod
  fun removeListeners(count: Double) {
    // No-op: required by RN DeviceEventEmitter to suppress warnings
  }

  // ---------- Shutdown ----------

  @ReactMethod
  fun shutdown(promise: Promise) {
    UiThreadUtil.runOnUiThread {
      try {
        removeActiveObserver()
        removeActiveDetailedObserver()
        DroidDex.shutdown()
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("SHUTDOWN_ERROR", e.message, e)
      }
    }
  }

  @Suppress("DEPRECATION")
  override fun onCatalystInstanceDestroy() {
    UiThreadUtil.runOnUiThread {
      removeActiveObserver()
      removeActiveDetailedObserver()
      DroidDex.shutdown()
    }
    super.onCatalystInstanceDestroy()
  }

  // ---------- Internal helpers ----------

  private fun removeActiveObserver() {
    activeObserver?.let { observer ->
      activeLiveData?.removeObserver(observer)
    }
    activeObserver = null
    activeLiveData = null
    latestRawData = null
  }

  private fun removeActiveDetailedObserver() {
    activeDetailedObserver?.let { observer ->
      activeDetailedLiveData?.removeObserver(observer)
    }
    activeDetailedObserver = null
    activeDetailedLiveData = null
    latestDetailedData = null
  }

  private fun convertRawDataToJson(raw: RawPerformanceDataResult): String =
    JSONObject(raw.toMap()).toString()

  private fun convertDetailedDataToJson(detailedData: DetailedPerformanceDataResult): String =
    JSONObject(detailedData.toMap()).toString()

  private fun parseThresholdsFromJson(thresholdsJson: String): PerformanceThresholds {
    val json = JSONObject(thresholdsJson)
    val defaults = PerformanceThresholds()

    return PerformanceThresholds(
      memory = json.optJSONObject("memory")?.let { parseMemoryThresholds(it) } ?: defaults.memory,
      battery = json.optJSONObject("battery")?.let { parseBatteryThresholds(it) } ?: defaults.battery,
      cpu = json.optJSONObject("cpu")?.let { parseCpuThresholds(it) } ?: defaults.cpu,
      network = json.optJSONObject("network")?.let { parseNetworkThresholds(it) } ?: defaults.network,
      storage = json.optJSONObject("storage")?.let { parseStorageThresholds(it) } ?: defaults.storage
    )
  }

  private fun parseMemoryThresholds(json: JSONObject): MemoryThresholds {
    val low = json.getJSONObject("low")
    val average = json.getJSONObject("average")
    val high = json.getJSONObject("high")

    return MemoryThresholds(
      low = MemoryLowThresholds(
        approxHeapRemainingInMBThreshold = low.getDouble("approxHeapRemainingInMBThreshold").toFloat(),
        approxHeapLimitInMBThreshold = low.getDouble("approxHeapLimitInMBThreshold").toFloat()
      ),
      average = MemoryAverageThresholds(
        approxHeapRemainingInMBThreshold = average.getDouble("approxHeapRemainingInMBThreshold").toFloat(),
        approxHeapLimitInMBThreshold = average.getDouble("approxHeapLimitInMBThreshold").toFloat(),
        availableRamGBThreshold = average.getDouble("availableRamGBThreshold").toFloat()
      ),
      high = MemoryHighThresholds(
        approxHeapRemainingInMBThreshold = high.getDouble("approxHeapRemainingInMBThreshold").toFloat(),
        availableRamGBThreshold = high.getDouble("availableRamGBThreshold").toFloat()
      )
    )
  }

  private fun parseBatteryThresholds(json: JSONObject): BatteryThresholds {
    val excellent = json.getJSONObject("excellent")
    val high = json.getJSONObject("high")
    val average = json.getJSONObject("average")

    return BatteryThresholds(
      excellent = BatteryExcellentThresholds(
        batteryPercentageThreshold = excellent.getDouble("batteryPercentageThreshold").toFloat(),
        isChargingBatteryPercentageThreshold = excellent.getDouble("isChargingBatteryPercentageThreshold").toFloat(),
        temperatureThreshold = excellent.getDouble("temperatureThreshold").toFloat()
      ),
      high = BatteryHighThresholds(
        batteryPercentageThreshold = high.getDouble("batteryPercentageThreshold").toFloat(),
        isChargingBatteryPercentageThreshold = high.getDouble("isChargingBatteryPercentageThreshold").toFloat(),
        temperatureThreshold = high.getDouble("temperatureThreshold").toFloat()
      ),
      average = BatteryAverageThresholds(
        batteryPercentageThreshold = average.getDouble("batteryPercentageThreshold").toFloat(),
        isChargingBatteryPercentageThreshold = average.getDouble("isChargingBatteryPercentageThreshold").toFloat(),
        temperatureThreshold = average.getDouble("temperatureThreshold").toFloat()
      )
    )
  }

  private fun parseCpuThresholds(json: JSONObject): CpuThresholds {
    val excellent = json.getJSONObject("excellent")
    val low = json.getJSONObject("low")
    val average = json.getJSONObject("average")

    return CpuThresholds(
      excellent = CpuExcellentThresholds(
        mediaPerformanceClassThreshold = excellent.getInt("mediaPerformanceClassThreshold"),
        totalRamGBThreshold = excellent.getDouble("totalRamGBThreshold").toFloat()
      ),
      low = CpuLowThresholds(
        androidVersionThreshold = low.getInt("androidVersionThreshold"),
        coreCountThreshold = low.getInt("coreCountThreshold"),
        heapLimitMBThreshold = low.getDouble("heapLimitMBThreshold").toFloat(),
        maxCpuFrequencyThreshold1 = low.getDouble("maxCpuFrequencyThreshold1").toFloat(),
        maxCpuFrequencyThreshold2 = low.getDouble("maxCpuFrequencyThreshold2").toFloat(),
        maxCpuFrequencyThreshold3 = low.getDouble("maxCpuFrequencyThreshold3").toFloat(),
        heapLimitMBThreshold2 = low.getDouble("heapLimitMBThreshold2").toFloat(),
        androidVersionThreshold2 = low.getInt("androidVersionThreshold2"),
        androidVersionThreshold3 = low.getInt("androidVersionThreshold3"),
        totalRamGBThreshold = low.getDouble("totalRamGBThreshold").toFloat()
      ),
      average = CpuAverageThresholds(
        coreCountThreshold = average.getInt("coreCountThreshold"),
        heapLimitMBThreshold = average.getDouble("heapLimitMBThreshold").toFloat(),
        maxCpuFrequencyThreshold = average.getDouble("maxCpuFrequencyThreshold").toFloat(),
        androidVersionThreshold = average.getInt("androidVersionThreshold"),
        totalRamGBThreshold = average.getDouble("totalRamGBThreshold").toFloat()
      )
    )
  }

  private fun parseNetworkThresholds(json: JSONObject): NetworkThresholds {
    val low = json.getJSONObject("low")
    val average = json.getJSONObject("average")
    val high = json.getJSONObject("high")
    val excellent = json.getJSONObject("excellent")

    return NetworkThresholds(
      low = NetworkLowThresholds(
        bandwidthAverageThreshold = low.getDouble("bandwidthAverageThreshold")
      ),
      average = NetworkAverageThresholds(
        bandwidthAverageThreshold = average.getDouble("bandwidthAverageThreshold"),
        downloadSpeedThreshold = average.getInt("downloadSpeedThreshold"),
        signalStrengthThreshold = average.getInt("signalStrengthThreshold")
      ),
      high = NetworkHighThresholds(
        bandwidthAverageThreshold = high.getDouble("bandwidthAverageThreshold"),
        downloadSpeedThreshold = high.getInt("downloadSpeedThreshold"),
        signalStrengthThreshold = high.getInt("signalStrengthThreshold")
      ),
      excellent = NetworkExcellentThresholds(
        downloadSpeedThreshold = excellent.getInt("downloadSpeedThreshold"),
        signalStrengthThreshold = excellent.getInt("signalStrengthThreshold")
      )
    )
  }

  private fun parseStorageThresholds(json: JSONObject): StorageThresholds {
    val excellent = json.getJSONObject("excellent")
    val high = json.getJSONObject("high")
    val average = json.getJSONObject("average")

    return StorageThresholds(
      excellent = StorageExcellentThresholds(
        availableStorageGBThreshold = excellent.getDouble("availableStorageGBThreshold").toFloat()
      ),
      high = StorageHighThresholds(
        availableStorageGBThreshold = high.getDouble("availableStorageGBThreshold").toFloat()
      ),
      average = StorageAverageThresholds(
        availableStorageGBThreshold = average.getDouble("availableStorageGBThreshold").toFloat()
      )
    )
  }
}
