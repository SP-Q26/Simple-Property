/** Atomic counters on Vercel KV (optional). */
import { getKv, kvConfigured } from "./kv-client.mjs";

export { kvConfigured };

export async function kvIncr(key, by = 1) {
  const kv = await getKv();
  if (!kv) return null;
  try {
    if (typeof kv.incrby === "function") {
      return await kv.incrby(key, by);
    }
    const cur = Number(await kv.get(key)) || 0;
    const next = cur + by;
    await kv.set(key, next);
    return next;
  } catch (e) {
    console.error("spt kv incr", key, e.message);
    return null;
  }
}
