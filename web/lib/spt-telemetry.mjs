/**
 * Isles-shared telemetry helpers · Simple Property (deposit_desk).
 * Canon: docs/receipt-rail/SIMPLE_PROPERTY_TELEMETRY_PBS_v1.md
 */
export const SKIN_ID_SIMPLE_PROPERTY = "simple_property";
export const ISLES_BRAND = "deposit_desk";
export const DEPOSIT_DESK_TEMPLATE_ID = "deposit_deduction_exhibit";

const PII_KEY_RE =
  /(email|e_mail|address|street|tenant|landlord|phone|zip|name|mail|recipient|to_|from_)/i;

const EMAIL_RE = /@[\w.-]+\.\w+/;

export function telemetryEnv() {
  if (typeof location === "undefined") return "preview";
  const h = location.hostname;
  if (h === "simple-property.com" || h === "www.simple-property.com") return "production";
  return "preview";
}

export function doorBand(unitCount) {
  const n = Number.parseInt(String(unitCount ?? "1"), 10) || 1;
  if (n <= 4) return "1-4";
  if (n <= 15) return "5-15";
  if (n <= 40) return "16-40";
  return "41+";
}

export async function hashReceiptId(receiptId) {
  if (!receiptId || typeof crypto === "undefined" || !crypto.subtle) return "";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(receiptId)));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

/** Strip PII keys and email-like string values before any client emit. */
export function sanitizeTelemetry(props) {
  const out = {};
  for (const [key, value] of Object.entries(props || {})) {
    if (PII_KEY_RE.test(key)) continue;
    if (key === "receipt_id") continue;
    if (typeof value === "string" && EMAIL_RE.test(value)) continue;
    out[key] = value;
  }
  return out;
}

export function baseDims(extra = {}) {
  return sanitizeTelemetry({
    isles_brand: ISLES_BRAND,
    template_id: DEPOSIT_DESK_TEMPLATE_ID,
    skin_id: SKIN_ID_SIMPLE_PROPERTY,
    env: telemetryEnv(),
    ...extra,
  });
}

export function trackIsles(name, props = {}) {
  if (!name) return;
  const data = baseDims(props);
  if (typeof window !== "undefined" && typeof window.sptTrack === "function") {
    window.sptTrack(name, data);
  }
}

export function trackPacketBar(action, extra = {}) {
  const map = {
    copy_link: "packet_bar_copy_link",
    copy_tsv: "packet_bar_copy_tsv",
    pdf: "packet_bar_pdf",
    ics: "packet_bar_ics",
    email_tenant: "packet_bar_email_tenant",
  };
  const name = map[action];
  if (name) trackIsles(name, extra);
}
