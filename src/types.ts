export type PaygatePresentationStyle = "fullScreen" | "sheet";

/**
 * Which color scheme a flow renders in.
 *
 * The paywall is HTML in a WebView, and a WebView's `prefers-color-scheme`
 * follows the device — not your app. An app whose users can pick light or dark
 * independently of the OS will show a paywall that disagrees with the screen
 * behind it unless it passes its own value.
 *
 * Set a default on the gate in the Paygate console; anything passed to
 * `launchGate` overrides it.
 */
export type PaygateAppearance = "system" | "light" | "dark";

/** Matches iOS `PaygateLaunchStatus` / Flutter `PaygateLaunchStatus.name`. */
export type PaygateLaunchStatus =
  | "purchased"
  | "alreadySubscribed"
  | "dismissed"
  | "skipped"
  | "channelNotEnabled"
  | "planLimitReached";

export interface PaygateLaunchResult {
  status: PaygateLaunchStatus;
  productId?: string;
  data?: Record<string, unknown>;
}
