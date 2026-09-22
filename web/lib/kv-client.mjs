/** Optional Vercel KV / Upstash  ·  no-op when env unset. */
let kvPromise;

export function kvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function getKv() {
  if (!kvConfigured()) return null;
  if (!kvPromise) {
    kvPromise = import("@vercel/kv").then((m) => m.kv);
  }
  return kvPromise;
}

export async function kvGet(key) {
  const kv = await getKv();
  if (!kv) return null;
  try {
    return await kv.get(key);
  } catch (e) {
    console.error("spt kv get", key, e.message);
    return null;
  }
}

export async function kvSet(key, value, opts) {
  const kv = await getKv();
  if (!kv) return false;
  try {
    await kv.set(key, value, opts);
    return true;
  } catch (e) {
    console.error("spt kv set", key, e.message);
    return false;
  }
}

export async function kvDel(key) {
  const kv = await getKv();
  if (!kv) return false;
  try {
    await kv.del(key);
    return true;
  } catch (e) {
    console.error("spt kv del", key, e.message);
    return false;
  }
}

export async function kvZadd(key, entry) {
  const kv = await getKv();
  if (!kv) return false;
  try {
    await kv.zadd(key, entry);
    return true;
  } catch (e) {
    console.error("spt kv zadd", key, e.message);
    return false;
  }
}

export async function kvZrangeByScore(key, min, max) {
  const kv = await getKv();
  if (!kv) return [];
  try {
    return await kv.zrange(key, min, max, { byScore: true });
  } catch (e) {
    console.error("spt kv zrange", key, e.message);
    return [];
  }
}

export async function kvZrem(key, member) {
  const kv = await getKv();
  if (!kv) return false;
  try {
    await kv.zrem(key, member);
    return true;
  } catch (e) {
    console.error("spt kv zrem", key, e.message);
    return false;
  }
}
