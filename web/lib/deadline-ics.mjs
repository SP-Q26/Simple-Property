/** Build .ics for deposit return deadline (client import). */
export function buildDeadlineIcs({ title, deadlineIso, reminderDaysBefore = [7, 3, 1] }) {
  if (!deadlineIso) return null;
  const uid = `spt-deadline-${deadlineIso}@simpleproperty.tools`;
  const dt = deadlineIso.replace(/-/g, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Simple Property Tools//Deposit Desk//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dt}T120000Z`,
    `DTSTART;VALUE=DATE:${dt}`,
    `SUMMARY:${title}`,
    "DESCRIPTION:Illinois deposit return / itemization deadline (Deposit Desk reminder). Not legal advice.",
    "END:VEVENT",
  ];
  for (const days of reminderDaysBefore) {
    const d = new Date(deadlineIso + "T12:00:00");
    d.setDate(d.getDate() - days);
    const r = d.toISOString().slice(0, 10).replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}-rem-${days}`,
      `DTSTAMP:${r}T120000Z`,
      `DTSTART;VALUE=DATE:${r}`,
      `SUMMARY:${title} — ${days} days out`,
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(filename, icsBody) {
  const blob = new Blob([icsBody], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
