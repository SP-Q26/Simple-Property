/**
 * Google Workspace alignment · client-only (no OAuth on our servers).
 * Calendar: template URL + .ics import · Sheets: CSV download for File → Import.
 */

/** All-day Google Calendar event · end date is exclusive (next day). */
export function googleCalendarAddUrl({ title, startIso, details = "", location = "" }) {
  if (!startIso) return null;
  const start = startIso.replace(/-/g, "");
  const endDate = new Date(startIso + "T12:00:00");
  endDate.setDate(endDate.getDate() + 1);
  const end = endDate.toISOString().slice(0, 10).replace(/-/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${start}/${end}`,
    details: details.slice(0, 1500),
  });
  if (location) params.set("location", location.slice(0, 500));
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function openGoogleCalendar(url) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Reminder day links (7/3/1) as separate one-click adds. */
export function googleCalendarReminderUrls({ titleBase, deadlineIso, reminderDaysBefore = [7, 3, 1] }) {
  if (!deadlineIso) return [];
  const out = [];
  for (const days of reminderDaysBefore) {
    const d = new Date(deadlineIso + "T12:00:00");
    d.setDate(d.getDate() - days);
    const iso = d.toISOString().slice(0, 10);
    const url = googleCalendarAddUrl({
      title: `${titleBase}  ·  ${days} days out`,
      startIso: iso,
      details: `Reminder ${days} day(s) before deposit return/itemize deadline. Deposit Desk. Not legal advice.`,
    });
    if (url) out.push({ days, iso, url });
  }
  return out;
}

function csvCell(value) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** One row per packet for Google Sheets · File → Import → Upload. */
export function buildPacketSheetsCsv(draft, deadline) {
  const headers = [
    "Property",
    "City",
    "Chicago RLTO",
    "Tenant",
    "Surrender date",
    "Deadline date",
    "Jurisdiction",
    "Deposit amount",
    "Withhold total",
    "Updated",
  ];
  const withheld = (draft.deductions || []).reduce((a, d) => a + (parseFloat(d.amount) || 0), 0);
  const row = [
    draft.property?.street,
    draft.property?.city,
    draft.property?.inChicago ? "yes" : "no",
    draft.tenant?.name,
    draft.surrenderDate,
    deadline?.deadline,
    deadline?.jurisdiction,
    draft.deposit?.amount,
    withheld.toFixed(2),
    new Date().toISOString().slice(0, 10),
  ];
  return [headers.map(csvCell).join(","), row.map(csvCell).join(",")].join("\n");
}

export function downloadCsv(filename, body) {
  const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
