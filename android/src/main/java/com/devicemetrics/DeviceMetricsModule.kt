package com.devicemetrics

import com.facebook.react.bridge.ReactApplicationContext

class DeviceMetricsModule(reactContext: ReactApplicationContext) :
  NativeDeviceMetricsSpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativeDeviceMetricsSpec.NAME
  }
}
