/**
 * Shared deposit packet report bodies · print HTML + AI markdown (single source of truth).
 */
import { formatUsDate, normalizeStateCode, STATE_PACKS } from "./deposit-rules.mjs";
import { resolveCityOverlay, normalizeCityPresetId } from "./city-overlays.mjs";
import { STATUTE_URLS } from "./statute-urls.mjs";

const AI_BUS = "https://simple-property.com/spt-ai-bus.json";
const LLMS = "https://simple-property.com/llms.txt";

export function sumPacketDeductions(deductions) {
  return (deductions || []).reduce((a, d) => a + (parseFloat(d.amount) || 0), 0);
}

function line(label, value) {
  const v = String(value ?? "").trim();
  return v ? `- **${label}:** ${v}` : "";
}

export function packetStatuteLine(stateCode, cityPresetId) {
  const st = normalizeStateCode(stateCode);
  const pack = STATE_PACKS[st];
  if (!pack) return "";
  const overlay = resolveCityOverlay(st, normalizeCityPresetId(cityPresetId));
  const cite = overlay?.jurisdiction ? `${overlay.jurisdiction} · ${pack.cite}` : pack.cite;
  const url = STATUTE_URLS[st] || "";
  return url ? `${cite} · ${url}` : cite;
}

/**
 * @param {object} draft
 * @param {object|null} deadline from computeDeadline()
 * @param {(s: string) => string} esc
 */
export function buildPrintPacketInnerHtml(draft, deadline, esc) {
  const st = normalizeStateCode(draft.property?.state);
  const stLabel = STATE_PACKS[st]?.label || "deposit";
  const addr = [draft.property?.street, draft.property?.city, draft.property?.zip].filter(Boolean).join(", ");
  const dep = parseFloat(draft.deposit?.amount) || 0;
  const withheld = sumPacketDeductions(draft.deductions);
  const roomRows = (draft.rooms || [])
    .map((r) => {
      const noteParts = [r.notes || ""];
      if (r.photoFileName) noteParts.push(`File: ${r.photoFileName}`);
      if (r.photoCapturedAt) noteParts.push(`Captured: ${r.photoCapturedAt.slice(0, 10)}`);
      if (r.photoLink) noteParts.push(`Photo link: ${r.photoLink}`);
      const noteCell = noteParts.filter(Boolean).join(" · ") || "n/a";
      return `<tr><td>${esc(r.name)}</td><td>${esc(r.condition)}</td><td>${esc(noteCell)}</td></tr>`;
    })
    .join("");
  const photoBlock = (draft.rooms || [])
    .filter((r) => r.photo)
    .map(
      (r) =>
        `<figure class="print-photo"><figcaption>${esc(r.name)}${r.photoFileName ? ` · ${esc(r.photoFileName)}` : ""}</figcaption><img src="${r.photo}" alt="" /></figure>`
    )
    .join("");
  const dedRows = (draft.deductions || [])
    .filter((d) => d.amount || d.description)
    .map(
      (d) =>
        `<tr><td>${esc(d.category)}</td><td>${esc(d.description) || "n/a"}</td><td>$${esc(d.amount) || "0"}</td></tr>`
    )
    .join("");
  const cityPreset = normalizeCityPresetId(draft.property?.cityPreset);
  const metroNote = cityPreset ? resolveCityOverlay(st, cityPreset)?.hint || "" : "";

  return `
    <h2>Deposit Desk · ${esc(stLabel)} deposit packet</h2>
    <p style="font-size:10pt;color:#6b5c4a">Simple Property Tools · Deposit Desk · ${formatUsDate(draft.signatures?.date)} · 32 states + DC wizard</p>
    <p><strong>Property:</strong> ${esc(addr)}<br/>
    <strong>Tenant:</strong> ${esc(draft.tenant?.name)} · <strong>Lease:</strong> ${formatUsDate(draft.lease?.start)} – ${formatUsDate(draft.lease?.end)}<br/>
    <strong>Security deposit:</strong> $${dep.toFixed(2)} · <strong>Held:</strong> ${esc(draft.deposit?.heldAt) || "n/a"}</p>
    <p><strong>Landlord:</strong> ${esc(draft.landlord?.name)} · ${esc(draft.landlord?.email)}<br/>
    <strong>Mailing address:</strong> ${esc(draft.landlord?.address) || "n/a"}</p>
    ${
      deadline?.deadline
        ? `<p><strong>Return or itemize by (${esc(deadline.jurisdiction)}):</strong> ${formatUsDate(deadline.deadline)} · ${deadline.days} days from surrender</p>`
        : ""
    }
    ${metroNote ? `<p style="font-size:9pt;color:#6b5c4a"><strong>Metro note:</strong> ${esc(metroNote)}</p>` : ""}
    ${
      draft.mailProof?.mailedAt || draft.mailProof?.tracking || draft.mailProof?.method
        ? `<p><strong>Mailed to tenant:</strong> ${formatUsDate(draft.mailProof.mailedAt) || "n/a"} · ${esc(draft.mailProof.method) || "n/a"} · Tracking: ${esc(draft.mailProof.tracking) || "n/a"}</p>`
        : ""
    }
    ${draft.photoAlbumLink ? `<p><strong>Move-in photo folder:</strong> ${esc(draft.photoAlbumLink)}</p>` : ""}
    <h3>Move-in condition</h3>
    <table><thead><tr><th>Area</th><th>Condition</th><th>Notes / photo links</th></tr></thead><tbody>${roomRows || `<tr><td colspan="3">n/a</td></tr>`}</tbody></table>
    ${photoBlock ? `<h3>Move-in photos</h3><div class="print-photos print-photos--sensitive">${photoBlock}</div>` : ""}
    ${
      dedRows
        ? `<h3>Itemized deductions</h3><table><thead><tr><th>Category</th><th>Description</th><th>Amount</th></tr></thead><tbody>${dedRows}</tbody></table>
    <p><strong>Total withheld:</strong> $${withheld.toFixed(2)} · <strong>Return to tenant:</strong> $${Math.max(0, dep - withheld).toFixed(2)}</p>`
        : ""
    }
    <p style="font-size:9pt">Documentation only. Not legal advice. Verify ${esc(packetStatuteLine(st, cityPreset))} with counsel.</p>
    <p style="font-size:8pt;color:#6b5c4a;margin-top:0.75rem">Packet prepared with Deposit Desk · simple-property.com · Packet ${esc((draft.id || "").slice(0, 8))}</p>
    <div style="display:flex;gap:3rem;margin-top:2rem">
      <div><div class="signature-line">Landlord: ${esc(draft.signatures?.landlordPrinted || draft.landlord?.name)}</div></div>
      <div><div class="signature-line">Tenant: ${esc(draft.signatures?.tenantPrinted || draft.tenant?.name)}</div></div>
    </div>`;
}

export function buildPacketAiReport(draft, deadline) {
  const st = normalizeStateCode(draft.property?.state);
  const stLabel = STATE_PACKS[st]?.label || st;
  const addr = [draft.property?.street, draft.property?.city, draft.property?.zip].filter(Boolean).join(", ");
  const dep = parseFloat(draft.deposit?.amount) || 0;
  const withheld = sumPacketDeductions(draft.deductions);
  const cityPreset = normalizeCityPresetId(draft.property?.cityPreset);

  const roomLines = (draft.rooms || []).map((r) => {
    const bits = [`${r.name || "Area"} · ${r.condition || "n/a"}`];
    if (r.notes) bits.push(`notes: ${r.notes}`);
    if (r.photoLink) bits.push(`photo link: ${r.photoLink}`);
    if (r.photo) bits.push("(inline photo stored in browser · not included in this paste)");
    return `  - ${bits.join(" · ")}`;
  });

  const dedLines = (draft.deductions || [])
    .filter((d) => d.amount || d.description)
    .map((d) => `  - ${d.category || "Item"} · ${d.description || "n/a"} · $${d.amount || "0"}`);

  const prompt = [
    "You are helping a small landlord organize security deposit documentation (32 US states + DC supported in Deposit Desk).",
    "This is not legal advice. Do not invent statutes. Suggest they verify deadlines with current state/local law and counsel for disputes.",
    `Context files: ${LLMS} and ${AI_BUS}.`,
    "Tasks I may ask: sanity-check itemization clarity, suggest missing move-in proof, draft neutral tenant email outline, calendar checklist, mail-proof habits.",
  ].join(" ");

  const mail =
    draft.mailProof?.mailedAt || draft.mailProof?.tracking || draft.mailProof?.method
      ? line(
          "Mail proof",
          `${formatUsDate(draft.mailProof.mailedAt) || "n/a"} · ${draft.mailProof.method || "n/a"} · ${draft.mailProof.tracking || "n/a"}`
        )
      : "";

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
    line("City preset", cityPreset || "state default"),
    line("Statute index", packetStatuteLine(st, cityPreset)),
    line("Tenant", draft.tenant?.name),
    line("Lease", `${formatUsDate(draft.lease?.start)} – ${formatUsDate(draft.lease?.end)}`),
    line("Security deposit", dep ? `$${dep.toFixed(2)}` : ""),
    line("Held at", draft.deposit?.heldAt),
    line("Surrender date", formatUsDate(draft.surrenderDate)),
    line("Landlord", `${draft.landlord?.name || ""} ${draft.landlord?.email ? `<${draft.landlord.email}>` : ""}`.trim()),
    line("Landlord mailing", draft.landlord?.address),
    draft.photoAlbumLink ? line("Move-in photo folder", draft.photoAlbumLink) : "",
    mail,
    "",
    deadline?.deadline
      ? `## Statutory clock (computed in app)\n- **Return/itemize by:** ${formatUsDate(deadline.deadline)} · ${deadline.days} days · ${deadline.jurisdiction}\n`
      : "## Statutory clock\n- Add surrender date in Deposit Desk to compute deadline.\n",
    "## Move-in areas",
    roomLines.length ? roomLines.join("\n") : "  - (none logged)",
    "",
    dedLines.length
      ? "## Itemized deductions\n" + dedLines.join("\n") + `\n- **Total withheld:** $${withheld.toFixed(2)} · **Return:** $${Math.max(0, dep - withheld).toFixed(2)}\n`
      : "",
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
