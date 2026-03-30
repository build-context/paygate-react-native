import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  clearFallbackRequest,
  usePaygateFallbackRequest,
} from "./fallbackStore";
import { getPaygateConfig } from "./config";
import type { PaygateLaunchResult } from "./types";

type WebViewType = React.ComponentType<{
  source: { html: string; baseUrl?: string };
  style: object;
  onMessage: (e: { nativeEvent: { data: string } }) => void;
  originWhitelist?: string[];
  javaScriptEnabled?: boolean;
  domStorageEnabled?: boolean;
}>;

function tryLoadWebView(): WebViewType | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require("react-native-webview") as {
      WebView: WebViewType;
    };
    return m.WebView ?? null;
  } catch {
    return null;
  }
}

function tryLoadPaygateJs(): {
  paygateFetchJson: typeof import("@paygate/js/http").paygateFetchJson;
  PaygateHttpError: typeof import("@paygate/js/http").PaygateHttpError;
  parseFlowData: typeof import("@paygate/js/parse").parseFlowData;
  parseGateFlowResponse: typeof import("@paygate/js/parse").parseGateFlowResponse;
  buildFlowDocumentHtml: typeof import("@paygate/js/buildHtml").buildFlowDocumentHtml;
} {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return {
    paygateFetchJson: require("@paygate/js/http").paygateFetchJson,
    PaygateHttpError: require("@paygate/js/http").PaygateHttpError,
    parseFlowData: require("@paygate/js/parse").parseFlowData,
    parseGateFlowResponse: require("@paygate/js/parse").parseGateFlowResponse,
    buildFlowDocumentHtml: require("@paygate/js/buildHtml").buildFlowDocumentHtml,
  };
}

export function PaygateRoot(props: { children: React.ReactNode }) {
  const req = usePaygateFallbackRequest();
  const WebView = useMemo(() => tryLoadWebView(), []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>("");
  const resolveRef = useRef<((r: PaygateLaunchResult) => void) | null>(null);

  useEffect(() => {
    if (!req) {
      setHtml(null);
      setError(null);
      setLoading(false);
      resolveRef.current = null;
      return;
    }
    resolveRef.current = req.resolve;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setHtml(null);
    (async () => {
      try {
        const js = tryLoadPaygateJs();
        const cfg = getPaygateConfig();
        const base = (cfg.baseURL ?? "https://api-oh6xuuomca-uc.a.run.app").replace(
          /\/$/,
          ""
        );
        setBaseUrl(base);
        let raw: Record<string, unknown>;
        if (req.kind === "flow") {
          raw = await js.paygateFetchJson<Record<string, unknown>>(
            base,
            cfg.apiKey,
            `/sdk/flows/${encodeURIComponent(req.flowId)}`
          );
        } else {
          raw = await js.paygateFetchJson<Record<string, unknown>>(
            base,
            cfg.apiKey,
            `/sdk/gates/${encodeURIComponent(req.gateId)}`
          );
        }
        if (cancelled) return;
        if (req.kind === "gate") {
          const g = js.parseGateFlowResponse(raw);
          const channels = g.enabledChannels ?? [];
          if (channels.length > 0) {
            const ch = __DEV__ ? "debug" : "production";
            if (!channels.includes(ch)) {
              req.resolve({ status: "channelNotEnabled" });
              clearFallbackRequest();
              return;
            }
          }
        }
        const flow =
          req.kind === "flow"
            ? js.parseFlowData(raw)
            : (() => {
                const g = js.parseGateFlowResponse(raw);
                return {
                  id: g.id,
                  name: g.name,
                  pages: g.pages,
                  bridgeScript: g.bridgeScript,
                  productIds: g.productIds,
                  products: g.products,
                };
              })();
        const token = "rn-" + Math.random().toString(36).slice(2);
        const doc = js.buildFlowDocumentHtml(flow, token, "react-native-webview");
        setHtml(doc);
      } catch (e: unknown) {
        if (cancelled) return;
        if (
          typeof e === "object" &&
          e !== null &&
          (e as { code?: string }).code === "presentation_limit_exceeded"
        ) {
          const o = e as { used?: number; limit?: number };
            req.resolve({
              status: "planLimitReached",
              data: { used: o.used, limit: o.limit },
            });
          clearFallbackRequest();
          return;
        }
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [req]);

  const finish = (r: PaygateLaunchResult) => {
    resolveRef.current?.(r);
    clearFallbackRequest();
  };

  const onMessage = (data: string) => {
    if (!req) return;
    try {
      const msg = JSON.parse(data) as { action?: string; productId?: string; data?: Record<string, unknown> };
      const action = msg.action;
      if (action === "close") {
        finish({ status: "dismissed", data: msg.data });
        return;
      }
      if (action === "skip") {
        finish({
          status: req.kind === "gate" ? "skipped" : "dismissed",
          data: msg.data,
        });
        return;
      }
      if (action === "purchase") {
        finish({
          status: "dismissed",
          data: {
            ...msg.data,
            _paygateNote:
              "In-app purchases require a native build with Paygate linked (EAS Build).",
          },
        });
        return;
      }
      if (action === "restore") {
        finish({ status: "dismissed", data: msg.data });
      }
    } catch {
      /* ignore */
    }
  };

  const visible = req != null;

  return (
    <>
      {props.children}
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          {loading && (
            <View style={styles.center}>
              <ActivityIndicator size="large" />
            </View>
          )}
          {error && (
            <View style={styles.center}>
              <Text style={styles.error}>{error}</Text>
            </View>
          )}
          {html && WebView && !error && (
            <WebView
              source={{ html, baseUrl: baseUrl || undefined }}
              style={styles.webview}
              originWhitelist={["*"]}
              javaScriptEnabled
              domStorageEnabled
              onMessage={(e) => onMessage(e.nativeEvent.data)}
            />
          )}
          {html && !WebView && !error && (
            <View style={styles.center}>
              <Text style={styles.error}>
                Install react-native-webview for Expo Go preview.
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  webview: { flex: 1, backgroundColor: "transparent" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  error: { color: "#fff", textAlign: "center" },
});
