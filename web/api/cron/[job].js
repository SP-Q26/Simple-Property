import { dispatchCronJob } from "../../lib/cron-jobs.mjs";

/** Vercel cron · /api/cron/deadline-reminders · /api/cron/funnel-weekly-report */
export default async function handler(req, res) {
  const job = String(req.query?.job || "").trim();
  return dispatchCronJob(job, req, res);
}
