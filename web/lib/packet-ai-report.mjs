/**
 * Client-only "Copy for AI" bundle · no API call · user pastes into ChatGPT/Claude/etc.
 * Omits inline photo bytes; keeps cloud links and notes.
 */
import { formatUsDate, normalizeStateCode, STATE_PACKS } from "./deposit-rules.mjs";

const AI_BUS = "https://simple-property.com/spt-ai-bus.json";
const LLMS = "https://simple-property.com/llms.txt";

function line(label, value) {
  const v = String(value ?? "").trim();
  return v ? `- **${label}:** ${v}` : "";
}

export function buildPacketAiReport(draft, deadline) {
  const st = normalizeStateCode(draft.property?.state);
  const stLabel = STATE_PACKS[st]?.label || st;
  const addr = [draft.property?.street, draft.property?.city, draft.property?.zip].filter(Boolean).join(", ");
  const dep = parseFloat(draft.deposit?.amount) || 0;
  const withheld = (draft.deductions || []).reduce((a, d) => a + (parseFloat(d.amount) || 0), 0);

  const roomLines = (draft.rooms || []).map((r) => {
    const bits = [`${r.name || "Room"} · ${r.condition || "n/a"}`];
    if (r.notes) bits.push(`notes: ${r.notes}`);
    if (r.photoLink) bits.push(`photo link: ${r.photoLink}`);
    if (r.photo) bits.push("(inline photo stored in browser · not included in this paste)");
    return `  - ${bits.join(" · ")}`;
  });

  const dedLines = (draft.deductions || [])
    .filter((d) => d.amount || d.description)
    .map((d) => `  - ${d.category || "Item"} · ${d.description || "n/a"} · $${d.amount || "0"}`);

  const prompt = [
    "You are helping a Midwest small landlord organize deposit documentation.",
    "This is not legal advice. Do not invent statutes. Suggest they verify deadlines with current state/local law and a lawyer for disputes.",
    `Context files: ${LLMS} and ${AI_BUS}.`,
    "Tasks I may ask: sanity-check itemization clarity, suggest missing move-in proof, draft neutral tenant email outline, calendar checklist.",
  ].join(" ");

  return [
    "# Deposit Desk · packet summary for AI assistant",
    "",
    "_Simple Property Tools · documentation only · not legal advice_",
    "",
    "## Operator prompt (paste above your question)",
    prompt,
    "",
    "## Packet",
    line("Property", addr),
    line("State pack", stLabel),
    line("Tenant", draft.tenant?.name),
    line("Lease", `${formatUsDate(draft.lease?.start)} – ${formatUsDate(draft.lease?.end)}`),
    line("Security deposit", dep ? `$${dep.toFixed(2)}` : ""),
    line("Held at", draft.deposit?.heldAt),
    line("Surrender date", formatUsDate(draft.surrenderDate)),
    line("Landlord", `${draft.landlord?.name || ""} ${draft.landlord?.email ? `<${draft.landlord.email}>` : ""}`.trim()),
    draft.photoAlbumLink ? line("Move-in photo folder", draft.photoAlbumLink) : "",
    "",
    deadline?.deadline
      ? `## Statutory clock (computed in app)\n- **Return/itemize by:** ${formatUsDate(deadline.deadline)} · ${deadline.days} days · ${deadline.jurisdiction}\n`
      : "## Statutory clock\n- Add surrender date in Deposit Desk to compute deadline.\n",
    "## Move-in rooms",
    roomLines.length ? roomLines.join("\n") : "  - (none logged)",
    "",
    dedLines.length ? "## Move-out withholdings\n" + dedLines.join("\n") + `\n- **Total withheld:** $${withheld.toFixed(2)} · **Return:** $${Math.max(0, dep - withheld).toFixed(2)}\n` : "",
    "## Signatures (draft)",
    line("Landlord printed", draft.signatures?.landlordPrinted),
    line("Tenant printed", draft.signatures?.tenantPrinted),
    line("Document date", formatUsDate(draft.signatures?.date)),
    "",
    "---",
    "Generated in browser · https://simple-property.com/app",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function copyTextForAi(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  return ok;
}
