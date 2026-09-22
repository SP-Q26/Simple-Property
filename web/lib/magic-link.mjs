import { createHmac, randomBytes } from "node:crypto";
import { kvDel, kvGet, kvSet } from "./kv-client.mjs";
import { getCustomerIdByEmail } from "./subscription-store.mjs";

const MAGIC_PREFIX = "magic:";
const TTL_SEC = 900;

function magicSecret() {
  return process.env.SPT_ENTITLEMENT_SECRET || "spt-magic-fallback-set-secret";
}

export function signMagicToken(token) {
  return createHmac("sha256", magicSecret()).update(token).digest("base64url");
}

export async function createMagicLinkForEmail(email) {
  const customerId = await getCustomerIdByEmail(email);
  if (!customerId) return null;
  const token = randomBytes(24).toString("base64url");
  const payload = {
    email: String(email).trim().toLowerCase(),
    customer_id: customerId,
    exp: Date.now() + TTL_SEC * 1000,
  };
  await kvSet(`${MAGIC_PREFIX}${token}`, payload, { ex: TTL_SEC });
  return { token, sig: signMagicToken(token) };
}

/** @returns {{ customer_id: string, email: string }|null} */
export async function consumeMagicToken(token, sig) {
  if (!token || !sig || signMagicToken(token) !== sig) return null;
  const payload = await kvGet(`${MAGIC_PREFIX}${token}`);
  if (!payload || payload.exp < Date.now()) return null;
  await kvDel(`${MAGIC_PREFIX}${token}`);
  return { customer_id: payload.customer_id, email: payload.email };
}
