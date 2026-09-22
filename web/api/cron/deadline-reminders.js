import {
  completeReminderJob,
  dueReminderJobIds,
  getReminderJob,
} from "../../lib/reminder-store.mjs";
import { sendDeadlineReminderEmail, resendConfigured } from "../../lib/resend.mjs";

function authorized(req) {
  const secret = process.env.SPT_CRON_SECRET || process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.authorization || "";
  return auth === `Bearer ${secret}`;
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!authorized(req)) {
    return res.status(401).json({ error: "unauthorized" });
  }
  if (!resendConfigured()) {
    return res.status(503).json({ error: "email_not_configured" });
  }

  const jobIds = await dueReminderJobIds();
  let sent = 0;
  let failed = 0;

  for (const jobId of jobIds) {
    const job = await getReminderJob(jobId);
    if (!job) {
      await completeReminderJob(jobId);
      continue;
    }
    const result = await sendDeadlineReminderEmail({
      to: job.email,
      label: job.label,
      deadlineIso: job.deadlineIso,
      daysLeft: job.daysLeft,
    });
    if (result.ok) {
      sent += 1;
      await completeReminderJob(jobId);
    } else {
      failed += 1;
    }
  }

  return res.status(200).json({ ok: true, due: jobIds.length, sent, failed });
}
