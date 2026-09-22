import { kvGet, kvSet } from "./kv-client.mjs";

const PREFIX = "turn:pkt:";

/** @typedef {{ packet_id: string, sku: string, session_id: string, customer_id?: string|null, paid_at: string }} TurnRecord */

/** @param {TurnRecord} record */
export async function upsertTurnUnlock(record) {
  if (!record?.packet_id) return false;
  return kvSet(`${PREFIX}${record.packet_id}`, record);
}

/** @returns {Promise<TurnRecord|null>} */
export async function getTurnUnlock(packetId) {
  if (!packetId) return null;
  return (await kvGet(`${PREFIX}${packetId}`)) || null;
}
