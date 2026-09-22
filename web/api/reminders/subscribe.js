import { scheduleDeadlineReminders } from "../../lib/reminder-store.mjs";
import { resendConfigured } from "../../lib/resend.mjs";
import { normalizeEmail } from "../../lib/subscription-store.mjs";

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

  const email = normalizeEmail(body?.email);
  const deadlineIso = String(body?.deadline || "").slice(0, 10);
  const label = String(body?.label || "Rental").slice(0, 120);

  if (!email.includes("@") || !/^\d{4}-\d{2}-\d{2}$/.test(deadlineIso)) {
    return res.status(400).json({ error: "invalid_email_or_deadline" });
  }

  const deadlineMs = new Date(`${deadlineIso}T12:00:00`).getTime();
  if (deadlineMs <= Date.now()) {
    return res.status(400).json({ error: "deadline_in_past" });
  }

  try {
    const jobs = await scheduleDeadlineReminders({
      email,
      deadlineIso,
      label,
      offsets: [7, 1],
    });
    if (!jobs.length) {
      return res.status(400).json({ error: "no_future_reminder_dates" });
    }
    return res.status(200).json({ ok: true, scheduled: jobs.length });
  } catch (e) {
    console.error("spt reminders subscribe", e);
    return res.status(500).json({ error: "subscribe_failed" });
  }
}
