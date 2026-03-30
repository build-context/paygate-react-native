package com.paygate.reactnative

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.paygate.sdk.Paygate
import com.paygate.sdk.PaygateLaunchResult
import com.paygate.sdk.PaygateLaunchStatus
import com.paygate.sdk.PaygatePresentationStyle
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class PaygateReactNativeModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    override fun getName(): String = "PaygateReactNative"

    @ReactMethod
    fun initialize(apiKey: String, baseURL: String?, promise: Promise) {
        val ctx = reactApplicationContext.applicationContext
        scope.launch {
            try {
                Paygate.initialize(ctx, apiKey, baseURL)
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("INIT_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun launchFlow(
        flowId: String,
        bounces: Boolean,
        presentationStyle: String,
        promise: Promise
    ) {
        val act = reactApplicationContext.currentActivity
        if (act == null) {
            promise.reject("NO_ACTIVITY", "No Activity")
            return
        }
        scope.launch {
            try {
                val style = parsePresentationStyle(presentationStyle)
                val result = Paygate.launchFlow(act, flowId, bounces, style)
                promise.resolve(launchResultToMap(result))
            } catch (e: Exception) {
                promise.reject("LAUNCH_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun launchGate(
        gateId: String,
        bounces: Boolean,
        presentationStyle: String,
        promise: Promise
    ) {
        val act = reactApplicationContext.currentActivity
        if (act == null) {
            promise.reject("NO_ACTIVITY", "No Activity")
            return
        }
        scope.launch {
            try {
                val style = parsePresentationStyle(presentationStyle)
                val result = Paygate.launchGate(act, gateId, bounces, style)
                promise.resolve(launchResultToMap(result))
            } catch (e: Exception) {
                promise.reject("LAUNCH_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun purchase(productId: String, promise: Promise) {
        val act = reactApplicationContext.currentActivity
        if (act == null) {
            promise.reject("NO_ACTIVITY", "No Activity")
            return
        }
        scope.launch {
            try {
                val purchased = Paygate.purchase(act, productId)
                val active = Paygate.getActiveSubscriptionProductIds().toTypedArray()
                val map = Arguments.createMap()
                if (purchased != null) {
                    map.putString("action", "purchased")
                    map.putString("productId", purchased)
                } else {
                    map.putString("action", "cancelled")
                }
                map.putArray(
                    "activeSubscriptionProductIDs",
                    Arguments.fromList(active.toList())
                )
                promise.resolve(map)
            } catch (e: Exception) {
                promise.reject("PURCHASE_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun getActiveSubscriptionProductIDs(promise: Promise) {
        scope.launch {
            try {
                val ids = Paygate.getActiveSubscriptionProductIds()
                promise.resolve(Arguments.fromList(ids.toList()))
            } catch (e: Exception) {
                promise.reject("ERROR", e.message, e)
            }
        }
    }

    private fun parsePresentationStyle(s: String): PaygatePresentationStyle =
        if (s == "fullScreen") PaygatePresentationStyle.FULL_SCREEN
        else PaygatePresentationStyle.SHEET

    private fun launchResultToMap(r: PaygateLaunchResult): WritableMap {
        val m = Arguments.createMap()
        m.putString("status", statusToJs(r.status))
        r.productId?.let { m.putString("productId", it) }
        r.data?.let { d ->
            val dm = Arguments.createMap()
            d.forEach { (k, v) ->
                when (v) {
                    is String -> dm.putString(k, v)
                    is Int -> dm.putInt(k, v)
                    is Double -> dm.putDouble(k, v)
                    is Boolean -> dm.putBoolean(k, v)
                    else -> dm.putString(k, v.toString())
                }
            }
            m.putMap("data", dm)
        }
        return m
    }

    /** Matches Swift `PaygateLaunchStatus` string raw values (camelCase). */
    private fun statusToJs(s: PaygateLaunchStatus): String = when (s) {
        PaygateLaunchStatus.PURCHASED -> "purchased"
        PaygateLaunchStatus.ALREADY_SUBSCRIBED -> "alreadySubscribed"
        PaygateLaunchStatus.DISMISSED -> "dismissed"
        PaygateLaunchStatus.SKIPPED -> "skipped"
        PaygateLaunchStatus.CHANNEL_NOT_ENABLED -> "channelNotEnabled"
        PaygateLaunchStatus.PLAN_LIMIT_REACHED -> "planLimitReached"
    }
}
