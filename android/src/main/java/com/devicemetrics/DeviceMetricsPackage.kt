package com.devicemetrics

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

// TurboReactPackage is deprecated in RN 0.77+ in favor of BaseReactPackage.
// Keeping it for backward compatibility with RN 0.73–0.76 consumers.
@Suppress("DEPRECATION")
class DeviceMetricsPackage : TurboReactPackage() {

  /**
   * Legacy architecture fallback.
   * On RN 0.73+ (our minimum), the interop layer routes TurboModuleRegistry.get()
   * to getModule(), so this is effectively not called. Kept as a safety net.
   */
  override fun createNativeModules(
    reactContext: ReactApplicationContext
  ): List<NativeModule> {
    return listOf(DeviceMetricsLegacyModule(reactContext))
  }

  /**
   * TurboModule entry point.
   * Primary registration path for both old arch (via interop layer) and new arch.
   */
  override fun getModule(
    name: String,
    reactContext: ReactApplicationContext
  ): NativeModule? {
    return when (name) {
      DeviceMetricsModule.NAME -> DeviceMetricsModule(reactContext)
      else -> null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      mapOf(
        DeviceMetricsModule.NAME to ReactModuleInfo(
          DeviceMetricsModule.NAME,
          DeviceMetricsModule.NAME,
          false, // canOverrideExistingModule
          false, // needsEagerInit
          false, // isCxxModule
          true   // isTurboModule
        )
      )
    }
  }

}
