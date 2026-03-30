import { NativeModules, Platform } from "react-native";
import type { PaygateLaunchResult } from "./types";

type NativeShape = {
  initialize(
    apiKey: string,
    baseURL: string | null
  ): Promise<void>;
  launchFlow(
    flowId: string,
    bounces: boolean,
    presentationStyle: string
  ): Promise<Record<string, unknown>>;
  launchGate(
    gateId: string,
    bounces: boolean,
    presentationStyle: string
  ): Promise<Record<string, unknown>>;
  purchase(productId: string): Promise<Record<string, unknown> | null>;
  getActiveSubscriptionProductIDs(): Promise<string[]>;
};

const NativePaygate: NativeShape | undefined =
  NativeModules.PaygateReactNative as NativeShape | undefined;

export function hasNativePaygate(): boolean {
  return NativePaygate != null;
}

export function nativeInitialize(
  apiKey: string,
  baseURL: string | null
): Promise<void> {
  if (!NativePaygate) {
    return Promise.resolve();
  }
  return NativePaygate.initialize(apiKey, baseURL);
}

export function nativeLaunchFlow(
  flowId: string,
  bounces: boolean,
  presentationStyle: string
): Promise<PaygateLaunchResult> {
  if (!NativePaygate) throw new Error("Native Paygate not linked");
  return NativePaygate.launchFlow(flowId, bounces, presentationStyle).then(
    mapNativeLaunchResult
  );
}

export function nativeLaunchGate(
  gateId: string,
  bounces: boolean,
  presentationStyle: string
): Promise<PaygateLaunchResult> {
  if (!NativePaygate) throw new Error("Native Paygate not linked");
  return NativePaygate.launchGate(gateId, bounces, presentationStyle).then(
    mapNativeLaunchResult
  );
}

export async function nativePurchase(
  productId: string
): Promise<string | null> {
  if (!NativePaygate) return null;
  const r = await NativePaygate.purchase(productId);
  if (!r) return null;
  if (r.action === "purchased" && typeof r.productId === "string") {
    return r.productId;
  }
  return null;
}

export async function nativeGetActiveSubscriptionProductIDs(): Promise<
  Set<string>
> {
  if (!NativePaygate) return new Set();
  const list = await NativePaygate.getActiveSubscriptionProductIDs();
  return new Set(list ?? []);
}

function mapNativeLaunchResult(m: Record<string, unknown>): PaygateLaunchResult {
  const status = String(m.status ?? "dismissed") as PaygateLaunchResult["status"];
  return {
    status,
    productId: typeof m.productId === "string" ? m.productId : undefined,
    data:
      m.data != null && typeof m.data === "object"
        ? (m.data as Record<string, unknown>)
        : undefined,
  };
}

let warnedFallback = false;

export function warnFallbackOnce() {
  if (warnedFallback) return;
  warnedFallback = true;
  console.warn(
    "[Paygate] Native module not found (Expo Go?). Using WebView fallback — in-app purchases require an EAS/dev build with native Paygate linked."
  );
}
