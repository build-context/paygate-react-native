export interface PaygateRnConfig {
  apiKey: string;
  baseURL?: string;
}

let cfg: PaygateRnConfig | null = null;

export function setPaygateConfig(c: PaygateRnConfig) {
  cfg = c;
}

export function getPaygateConfig(): PaygateRnConfig {
  if (!cfg) throw new Error("Call Paygate.initialize() first.");
  return cfg;
}
