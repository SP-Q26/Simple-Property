/**
 * Illinois deposit deadline helpers (alpha).
 * Not legal advice · confirm statutes for your property.
 */

export const IL_STATE_RETURN_DAYS = 30;
export const CHICAGO_RETURN_DAYS = 45;

export function returnDeadlineDays({ inChicago }) {
  return inChicago ? CHICAGO_RETURN_DAYS : IL_STATE_RETURN_DAYS;
}

/** @param {string} isoDate YYYY-MM-DD surrender date */
export function addCalendarDays(isoDate, days) {
  if (!isoDate) return null;
  const d = new Date(isoDate + "T12:00:00");
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function computeDeadline({ surrenderDate, inChicago }) {
  const days = returnDeadlineDays({ inChicago });
  const deadline = addCalendarDays(surrenderDate, days);
  const reminders = deadline
    ? [7, 3, 1].map((n) => addCalendarDays(deadline, -n)).filter(Boolean)
    : [];
  return { days, deadline, reminders, jurisdiction: inChicago ? "Chicago RLTO" : "Illinois (765 ILCS 715/)" };
}

export function formatUsDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
