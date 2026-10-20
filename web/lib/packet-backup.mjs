/**
 * Deposit Desk packet .json export/import · schema v2 with validation report.
 */
export const PACKET_BACKUP_SCHEMA = 2;
export const PACKET_BACKUP_SCHEMA_LEGACY = 1;

const DRAFT_KEYS = new Set([
  "id",
  "landlord",
  "property",
  "tenant",
  "lease",
  "deposit",
  "surrenderDate",
  "photoAlbumLink",
  "rooms",
  "deductions",
  "signatures",
  "mailProof",
  "reminders",
  "turnoverMode",
  "wizardMaxStep",
]);

const RECOMMENDED_PATHS = [
  ["property", "state"],
  ["property", "street"],
  ["surrenderDate"],
  ["deposit", "amount"],
  ["tenant", "name"],
];

function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function getPath(obj, parts) {
  let cur = obj;
  for (const p of parts) {
    if (!isPlainObject(cur)) return undefined;
    cur = cur[p];
  }
  return cur;
}

function unknownDataKeys(data) {
  if (!isPlainObject(data)) return [];
  return Object.keys(data).filter((k) => !DRAFT_KEYS.has(k));
}

/**
 * Normalize file JSON into { schema, data, exportedAt }.
 */
export function normalizePacketBackupRoot(parsed) {
  if (!parsed || typeof parsed !== "object") {
    return { ok: false, errors: ["File is not a JSON object."], warnings: [], data: null, schema: null };
  }

  if (parsed.schema === PACKET_BACKUP_SCHEMA || parsed.schema === PACKET_BACKUP_SCHEMA_LEGACY) {
    if (!isPlainObject(parsed.data)) {
      return { ok: false, errors: ["Missing packet data object."], warnings: [], data: null, schema: parsed.schema };
    }
    return {
      ok: true,
      errors: [],
      warnings: [],
      data: parsed.data,
      schema: parsed.schema,
      exportedAt: parsed.exportedAt || "",
      product: parsed.product || "",
    };
  }

  if (isPlainObject(parsed) && (parsed.id || parsed.property)) {
    return {
      ok: true,
      errors: [],
      warnings: ["Raw draft shape detected · wrapped as legacy import."],
      data: parsed,
      schema: PACKET_BACKUP_SCHEMA_LEGACY,
      exportedAt: "",
      product: "",
    };
  }

  return {
    ok: false,
    errors: ["Unknown packet file · export from Deposit Desk (Import packet file)."],
    warnings: [],
    data: null,
    schema: null,
  };
}

export function validatePacketImport(parsed) {
  const root = normalizePacketBackupRoot(parsed);
  if (!root.ok) {
    return { ok: false, errors: root.errors, warnings: root.warnings, data: null, schema: root.schema };
  }

  const warnings = [...root.warnings];
  const errors = [];
  const data = root.data;

  if (root.schema === PACKET_BACKUP_SCHEMA_LEGACY) {
    warnings.push("Schema v1 import · saving as v2 on next export.");
  }

  for (const key of unknownDataKeys(data)) {
    warnings.push(`Unknown field "${key}" kept · confirm before you mail.`);
  }

  for (const path of RECOMMENDED_PATHS) {
    const val = getPath(data, path);
    if (val === undefined || val === null || String(val).trim() === "") {
      warnings.push(`Missing ${path.join(".")} · fill in wizard after import.`);
    }
  }

  if (!Array.isArray(data.deductions) || !data.deductions.length) {
    warnings.push("No withhold lines · add itemization on step 3.");
  }
  if (!Array.isArray(data.rooms) || !data.rooms.length) {
    warnings.push("No move-in rooms · step 4 will use defaults.");
  }

  const photoBytes = JSON.stringify(data).length;
  if (photoBytes > 1_500_000) {
    warnings.push("Large embedded photos · import may be slow on older phones.");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    data,
    schema: root.schema,
    exportedAt: root.exportedAt,
  };
}

export function formatImportWarnings(warnings) {
  if (!warnings?.length) return "";
  return warnings.map((w, i) => `${i + 1}. ${w}`).join("\n");
}
