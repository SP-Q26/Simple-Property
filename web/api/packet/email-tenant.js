import { assertProEntitlement } from "../../lib/entitlement-verify.mjs";
import { buildTenantPacketEmail } from "../../lib/packet-email.mjs";
import { normalizeEmail } from "../../lib/subscription-store.mjs";
import { resendConfigured, sendResendEmail } from "../../lib/resend.mjs";

function clip(str, max) {
  return String(str ?? "").slice(0, max);
}

function sanitizePacket(raw) {
  if (!raw || typeof raw !== "object") return null;
  const deductions = Array.isArray(raw.deductions)
    ? raw.deductions.slice(0, 30).map((d) => ({
        category: clip(d.category, 80),
        description: clip(d.description, 400),
        amount: clip(d.amount, 20),
      }))
    : [];
  const rooms = Array.isArray(raw.rooms)
    ? raw.rooms.slice(0, 40).map((r) => ({
        name: clip(r.name, 80),
        condition: clip(r.condition, 40),
      }))
    : [];
  return {
    propertyStreet: clip(raw.propertyStreet, 200),
    propertyCity: clip(raw.propertyCity, 80),
    propertyZip: clip(raw.propertyZip, 20),
    tenantName: clip(raw.tenantName, 120),
    landlordName: clip(raw.landlordName, 120),
    depositAmount: clip(raw.depositAmount, 20),
    withheldTotal: clip(raw.withheldTotal, 20),
    returnAmount: clip(raw.returnAmount, 20),
    surrenderDate: /^\d{4}-\d{2}-\d{2}$/.test(String(raw.surrenderDate || ""))
      ? String(raw.surrenderDate).slice(0, 10)
      : "",
    deadline: /^\d{4}-\d{2}-\d{2}$/.test(String(raw.deadline || ""))
      ? String(raw.deadline).slice(0, 10)
      : "",
    jurisdiction: clip(raw.jurisdiction, 160),
    documentDate: /^\d{4}-\d{2}-\d{2}$/.test(String(raw.documentDate || ""))
      ? String(raw.documentDate).slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    deductions,
    rooms,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!resendConfigured()) {
    return res.status(503).json({ error: "email_not_configured" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "invalid_json" });
    }
  }

  const pro = await assertProEntitlement(body?.entitlement);
  if (!pro.ok) {
    return res.status(pro.error === "subscription_inactive" ? 402 : 401).json({ error: pro.error });
  }

  const to = normalizeEmail(body?.to);
  if (!to.includes("@")) {
    return res.status(400).json({ error: "invalid_tenant_email" });
  }

  const packet = sanitizePacket(body?.packet);
  if (!packet) {
    return res.status(400).json({ error: "invalid_packet" });
  }

  const ccLandlord = Boolean(body?.ccLandlord);
  const landlordEmail = normalizeEmail(body?.landlordEmail);
  const { subject, text, html } = buildTenantPacketEmail(packet);

  const sendOpts = {
    to,
    subject,
    text,
    html,
  };

  if (ccLandlord && landlordEmail.includes("@")) {
    sendOpts.bcc = [landlordEmail];
  }

  const sent = await sendResendEmail(sendOpts);
  if (!sent.ok) {
    return res.status(502).json({ error: sent.error || "send_failed" });
  }

  return res.status(200).json({ ok: true });
}
