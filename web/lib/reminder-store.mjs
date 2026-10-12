import { kvGet, kvSet, kvZadd, kvZrangeByScore, kvZrem, kvDel } from "./kv-client.mjs";

const DUE_ZSET = "rem:due";
const REM_PREFIX = "rem:job:";
const FP_PREFIX = "rem:fp:";
const FP_TTL_SEC = 60 * 60 * 24; // idempotent re-subscribe same email+deadline within 24h

function fingerprintKey(email, deadlineIso) {
  return `${FP_PREFIX}${email}:${deadlineIso}`;
}

async function persistJob(jobId, job, sendAt) {
  const key = `${REM_PREFIX}${jobId}`;
  const okSet = await kvSet(key, job, { ex: 60 * 60 * 24 * 120 });
  if (!okSet) {
    const err = new Error("kv_set_failed");
    err.code = "kv_set_failed";
    throw err;
  }
  const okZ = await kvZadd(DUE_ZSET, { score: sendAt, member: jobId });
  if (!okZ) {
    await kvDel(key);
    const err = new Error("kv_zadd_failed");
    err.code = "kv_zadd_failed";
    throw err;
  }
}

export async function scheduleDeadlineReminders({ email, deadlineIso, label, jurisdiction, offsets = [7, 1] }) {
  const fpKey = fingerprintKey(email, deadlineIso);
  const prior = await kvGet(fpKey);
  if (prior?.jobIds?.length) {
    return prior.jobIds;
  }

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
      jurisdiction: jurisdiction || null,
      daysLeft: days,
      sendAt,
    };
    await persistJob(jobId, job, sendAt);
    jobs.push(jobId);
  }

  if (jobs.length) {
    await kvSet(fpKey, { jobIds: jobs, email, deadlineIso, at: Date.now() }, { ex: FP_TTL_SEC });
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
