import { kvGet, kvSet, kvZadd, kvZrangeByScore, kvZrem } from "./kv-client.mjs";

const DUE_ZSET = "rem:due";
const REM_PREFIX = "rem:job:";

export async function scheduleDeadlineReminders({ email, deadlineIso, label, offsets = [7, 1] }) {
  const id = `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const jobs = [];
  const deadlineMs = new Date(`${deadlineIso}T12:00:00`).getTime();
  for (const days of offsets) {
    const sendAt = deadlineMs - days * 86400000;
    if (sendAt <= Date.now()) continue;
    const jobId = `${id}:${days}`;
    const job = {
      id: jobId,
      email,
      deadlineIso,
      label: label || "Rental",
      daysLeft: days,
      sendAt,
    };
    await kvSet(`${REM_PREFIX}${jobId}`, job, { ex: 60 * 60 * 24 * 120 });
    await kvZadd(DUE_ZSET, { score: sendAt, member: jobId });
    jobs.push(jobId);
  }
  return jobs;
}

export async function dueReminderJobIds(now = Date.now()) {
  return kvZrangeByScore(DUE_ZSET, 0, now);
}

export async function getReminderJob(jobId) {
  return kvGet(`${REM_PREFIX}${jobId}`);
}

export async function completeReminderJob(jobId) {
  await kvZrem(DUE_ZSET, jobId);
  return true;
}
