/**
 * Vercel cron dispatch · one serverless fn via api/cron/[job].js (Hobby 12-fn cap).
 */
import {
  completeReminderJob,
  dueReminderJobIds,
  getReminderJob,
} from "./reminder-store.mjs";
import { sendDeadlineReminderEmail, resendConfigured } from "./resend.mjs";
import { buildFunnelReport } from "./funnel-rollups.mjs";

function cronAuthorized(req) {
  const secret = process.env.SPT_CRON_SECRET || process.env.CRON_SECRET || "";
  if (!secret) return false;
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  return token === secret || auth === `Bearer ${secret}`;
}

export async function handleDeadlineReminders(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!cronAuthorized(req)) {
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
      jurisdiction: job.jurisdiction,
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

export async function handleFunnelWeeklyReport(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!cronAuthorized(req)) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const report = await buildFunnelReport(7);
  console.log(JSON.stringify({ spt_funnel_weekly: true, report }));
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ ok: true, report });
}

export async function dispatchCronJob(job, req, res) {
  switch (job) {
    case "deadline-reminders":
      return handleDeadlineReminders(req, res);
    case "funnel-weekly-report":
      return handleFunnelWeeklyReport(req, res);
    default:
      return res.status(404).json({ error: "unknown_cron_job", job });
  }
}
