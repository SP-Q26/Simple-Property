/** Pro license · mom-and-pop cap (marketing + enforcement). */
export const PRO_UNITS_MAX = 4;

export function parseUnitCount(raw) {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 99);
}

export function unitsWithinProCap(unitCount) {
  return parseUnitCount(unitCount) <= PRO_UNITS_MAX;
}
