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
import type { PaygateAppearance, PaygateLaunchResult, PaygatePresentationStyle } from "./types";

export { PaygateRoot } from "./PaygateRoot";
export type { PaygateAppearance, PaygateLaunchResult, PaygatePresentationStyle } from "./types";

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

  /**
   * `opts.appearance` pins the flow's color scheme. Flows carry no appearance
   * of their own — that setting lives on the gate — so this defaults to
   * `"system"`, which follows the device.
   */
  static async launchFlow(
    flowId: string,
    opts?: {
      bounces?: boolean;
      presentationStyle?: PaygatePresentationStyle;
      appearance?: PaygateAppearance;
    }
  ): Promise<PaygateLaunchResult> {
    const bounces = opts?.bounces ?? false;
    const presentationStyle = opts?.presentationStyle ?? "sheet";
    if (hasNativePaygate()) {
      return nativeLaunchFlow(
        flowId,
        bounces,
        styleName(presentationStyle),
        opts?.appearance ?? "system"
      );
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

  /**
   * `opts.appearance` overrides the appearance configured on the gate. Pass it
   * when your app has its own light/dark setting — a WebView follows the
   * device, not your app, so leaving it to the gate means the paywall can
   * disagree with the screen behind it. Omitted uses the gate's setting.
   */
  static async launchGate(
    gateId: string,
    opts?: {
      bounces?: boolean;
      presentationStyle?: PaygatePresentationStyle;
      appearance?: PaygateAppearance;
    }
  ): Promise<PaygateLaunchResult> {
    const bounces = opts?.bounces ?? false;
    const presentationStyle = opts?.presentationStyle ?? "sheet";
    if (hasNativePaygate()) {
      return nativeLaunchGate(
        gateId,
        bounces,
        styleName(presentationStyle),
        opts?.appearance ?? ""
      );
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
