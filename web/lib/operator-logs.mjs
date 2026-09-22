/**
 * Browser-only operator logs · maintenance · tickets · inspections/complaints.
 * Not legal advice · documentation trail only.
 */

export const LOG_KEYS = {
  maintenance: "spt_log_maintenance",
  tickets: "spt_log_tickets",
  inspections: "spt_log_inspections",
};

export const MAX_ENTRIES = 500;

export function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function loadEntries(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveEntries(storageKey, entries) {
  localStorage.setItem(storageKey, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function upsertEntry(storageKey, entry) {
  const list = loadEntries(storageKey);
  const idx = list.findIndex((e) => e.id === entry.id);
  const row = { ...entry, updatedAt: new Date().toISOString() };
  if (idx >= 0) list[idx] = row;
  else list.unshift(row);
  saveEntries(storageKey, list);
  return row;
}

export function deleteEntry(storageKey, id) {
  const next = loadEntries(storageKey).filter((e) => e.id !== id);
  saveEntries(storageKey, next);
}

function csvCell(value) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadCsv(filename, headers, rows) {
  const body = [headers.map(csvCell).join(","), ...rows.map((r) => r.map(csvCell).join(","))].join("\n");
  const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const MAINTENANCE_STATUSES = ["Open", "Scheduled", "Done"];
export const MAINTENANCE_PRIORITIES = ["Normal", "Emergency"];
export const TICKET_STATUSES = ["New", "In progress", "Waiting on tenant", "Resolved", "Closed"];
export const TICKET_CHANNELS = ["Phone", "Email", "Text", "In person", "Portal", "Other"];
export const INSPECTION_KINDS = ["Inspection", "Complaint", "Entry notice", "City / 311", "Follow-up"];
export const INSPECTION_STATUSES = ["Logged", "Scheduled", "Completed", "Escalated"];
