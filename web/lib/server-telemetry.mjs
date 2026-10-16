/**
 * Server-side funnel emit · console log + KV rollup (no PII in data).
 */
import { recordFunnelEvent } from "./funnel-rollups.mjs";

export async function recordServerFunnel(name, data = {}) {
  console.log(
    JSON.stringify({
      spt_telemetry: true,
      name,
      data,
      at: new Date().toISOString(),
    })
  );
  try {
    await recordFunnelEvent(name, data);
  } catch (e) {
    console.error("spt server funnel", name, e.message);
  }
}
