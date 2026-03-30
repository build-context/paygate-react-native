import { useSyncExternalStore } from "react";
import type { PaygateLaunchResult } from "./types";

export type FallbackRequest =
  | {
      kind: "flow";
      flowId: string;
      bounces: boolean;
      resolve: (r: PaygateLaunchResult) => void;
    }
  | {
      kind: "gate";
      gateId: string;
      bounces: boolean;
      resolve: (r: PaygateLaunchResult) => void;
    };

type State = { request: FallbackRequest | null };

let state: State = { request: null };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getFallbackState(): State {
  return state;
}

export function subscribeFallback(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function pushFallbackRequest(req: FallbackRequest) {
  state = { request: req };
  emit();
}

export function clearFallbackRequest() {
  state = { request: null };
  emit();
}

export function usePaygateFallbackRequest(): FallbackRequest | null {
  return useSyncExternalStore(
    subscribeFallback,
    () => state.request,
    () => null
  );
}
