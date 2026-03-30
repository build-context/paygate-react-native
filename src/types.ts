export type PaygatePresentationStyle = "fullScreen" | "sheet";

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
