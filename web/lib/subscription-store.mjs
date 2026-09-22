import { kvDel, kvGet, kvSet } from "./kv-client.mjs";

const CUSTOMER_PREFIX = "ent:cus:";
const EMAIL_PREFIX = "ent:email:";

export function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export function customerRecordKey(customerId) {
  return `${CUSTOMER_PREFIX}${customerId}`;
}

export function emailIndexKey(email) {
  return `${EMAIL_PREFIX}${normalizeEmail(email)}`;
}

/** @typedef {{ customer_id: string, email?: string|null, subscription_id?: string|null, status: string, valid_until?: string|null, sku?: string, updated_at: string }} SubRecord */

/** @param {SubRecord} record */
export async function upsertSubscriptionRecord(record) {
  if (!record?.customer_id) return false;
  const key = customerRecordKey(record.customer_id);
  const ok = await kvSet(key, record);
  if (ok && record.email) {
    await kvSet(emailIndexKey(record.email), record.customer_id);
  }
  return ok;
}

/** @returns {Promise<SubRecord|null>} */
export async function getSubscriptionByCustomer(customerId) {
  if (!customerId) return null;
  return (await kvGet(customerRecordKey(customerId))) || null;
}

export async function getCustomerIdByEmail(email) {
  const id = await kvGet(emailIndexKey(email));
  return typeof id === "string" ? id : null;
}

export async function clearSubscriptionRecord(customerId) {
  const existing = await getSubscriptionByCustomer(customerId);
  if (existing?.email) await kvDel(emailIndexKey(existing.email));
  await kvDel(customerRecordKey(customerId));
}

export function isProStatus(status) {
  return status === "active" || status === "trialing";
}
