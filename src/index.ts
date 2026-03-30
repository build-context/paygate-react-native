import { setPaygateConfig } from "./config";
import { pushFallbackRequest } from "./fallbackStore";
import {
  hasNativePaygate,
  nativeGetActiveSubscriptionProductIDs,
  nativeInitialize,
  nativeLaunchFlow,
  nativeLaunchGate,
  nativePurchase,
  warnFallbackOnce,
} from "./nativeBridge";
import type { PaygateLaunchResult, PaygatePresentationStyle } from "./types";

export { PaygateRoot } from "./PaygateRoot";
export type { PaygateLaunchResult, PaygatePresentationStyle } from "./types";

const API_VERSION = "2025-03-16";

function styleName(s: PaygatePresentationStyle): string {
  return s === "fullScreen" ? "fullScreen" : "sheet";
}

export class Paygate {
  static readonly apiVersion = API_VERSION;

  static async initialize(params: {
    apiKey: string;
    baseURL?: string;
  }): Promise<void> {
    setPaygateConfig({
      apiKey: params.apiKey,
      baseURL: params.baseURL,
    });
    await nativeInitialize(
      params.apiKey,
      params.baseURL != null ? params.baseURL : null
    );
  }

  static async getActiveSubscriptionProductIDs(): Promise<Set<string>> {
    if (!hasNativePaygate()) {
      warnFallbackOnce();
      return new Set();
    }
    return nativeGetActiveSubscriptionProductIDs();
  }

  static async purchase(productId: string): Promise<string | null> {
    if (!hasNativePaygate()) {
      warnFallbackOnce();
      console.warn(
        "[Paygate] purchase() is not available in WebView fallback; use an EAS build."
      );
      return null;
    }
    return nativePurchase(productId);
  }

  static async launchFlow(
    flowId: string,
    opts?: { bounces?: boolean; presentationStyle?: PaygatePresentationStyle }
  ): Promise<PaygateLaunchResult> {
    const bounces = opts?.bounces ?? false;
    const presentationStyle = opts?.presentationStyle ?? "sheet";
    if (hasNativePaygate()) {
      return nativeLaunchFlow(flowId, bounces, styleName(presentationStyle));
    }
    warnFallbackOnce();
    return new Promise((resolve) => {
      pushFallbackRequest({
        kind: "flow",
        flowId,
        bounces,
        resolve,
      });
    });
  }

  static async launchGate(
    gateId: string,
    opts?: { bounces?: boolean; presentationStyle?: PaygatePresentationStyle }
  ): Promise<PaygateLaunchResult> {
    const bounces = opts?.bounces ?? false;
    const presentationStyle = opts?.presentationStyle ?? "sheet";
    if (hasNativePaygate()) {
      return nativeLaunchGate(gateId, bounces, styleName(presentationStyle));
    }
    warnFallbackOnce();
    return new Promise((resolve) => {
      pushFallbackRequest({
        kind: "gate",
        gateId,
        bounces,
        resolve,
      });
    });
  }
}
