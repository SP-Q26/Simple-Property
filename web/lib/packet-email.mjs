import { formatUsDate } from "./deposit-rules.mjs";

function money(n) {
  const v = parseFloat(n);
  return Number.isFinite(v) ? v.toFixed(2) : "0.00";
}

function escHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Build tenant-facing deposit statement email (text + html). No photos.
 * @param {object} packet sanitized summary from client
 */
export function buildTenantPacketEmail(packet) {
  const addr = [packet.propertyStreet, packet.propertyCity, packet.propertyZip].filter(Boolean).join(", ");
  const subject = `Security deposit statement · ${packet.propertyStreet || "your rental"}`;

  const dedLines = (packet.deductions || [])
    .filter((d) => d.amount || d.description)
    .map(
      (d) =>
        `  · ${d.category || "Item"}: ${d.description || "n/a"} · $${money(d.amount)}`
    );
  const roomLines = (packet.rooms || []).map(
    (r) => `  · ${r.name || "Room"}: ${r.condition || "n/a"}`
  );

  const lines = [
    `Hello ${packet.tenantName || "tenant"},`,
    "",
    `${packet.landlordName || "Your landlord"} sent you a copy of your security deposit documentation for:`,
    addr || packet.propertyStreet || "Rental property",
    "",
    `Deposit held: $${money(packet.depositAmount)}`,
    `Total withheld: $${money(packet.withheldTotal)}`,
    `Balance returnable: $${money(packet.returnAmount)}`,
    "",
  ];

  if (packet.surrenderDate) {
    lines.push(`Surrender date (keys): ${formatUsDate(packet.surrenderDate)}`);
  }
  if (packet.deadline) {
    lines.push(
      `Statutory return / itemize reference: ${formatUsDate(packet.deadline)} · ${packet.jurisdiction || "state law"}`
    );
  }
  if (dedLines.length) {
    lines.push("", "Itemized withholdings:", ...dedLines);
  }
  if (roomLines.length) {
    lines.push("", "Move-in condition summary:", ...roomLines);
  }

  lines.push(
    "",
    "This message is a courtesy copy from Deposit Desk (Simple Property Tools). It is not legal advice.",
    "Questions about amounts or timing go to your landlord or a licensed attorney in your state.",
    "",
    `Document date: ${formatUsDate(packet.documentDate)}`
  );

  const text = lines.join("\n");

  const htmlDed = (packet.deductions || [])
    .filter((d) => d.amount || d.description)
    .map(
      (d) =>
        `<tr><td>${escHtml(d.category)}</td><td>${escHtml(d.description || "n/a")}</td><td>$${money(d.amount)}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;color:#1a1510;line-height:1.5">
      <p>Hello ${escHtml(packet.tenantName || "tenant")},</p>
      <p><strong>${escHtml(packet.landlordName || "Your landlord")}</strong> sent you a copy of your security deposit documentation for:</p>
      <p><strong>${escHtml(addr || packet.propertyStreet || "Rental property")}</strong></p>
      <table style="border-collapse:collapse;margin:1rem 0;font-size:14px">
        <tr><td>Deposit held</td><td><strong>$${money(packet.depositAmount)}</strong></td></tr>
        <tr><td>Total withheld</td><td><strong>$${money(packet.withheldTotal)}</strong></td></tr>
        <tr><td>Balance returnable</td><td><strong>$${money(packet.returnAmount)}</strong></td></tr>
        ${
          packet.deadline
            ? `<tr><td>Reference deadline</td><td>${escHtml(formatUsDate(packet.deadline))} · ${escHtml(packet.jurisdiction || "")}</td></tr>`
            : ""
        }
      </table>
      ${
        htmlDed
          ? `<p><strong>Itemized withholdings</strong></p><table style="border-collapse:collapse;width:100%;font-size:13px"><thead><tr><th align="left">Category</th><th align="left">Description</th><th align="left">Amount</th></tr></thead><tbody>${htmlDed}</tbody></table>`
          : ""
      }
      <p style="font-size:12px;color:#6b5c4a;margin-top:1.5rem">Courtesy copy · not legal advice · Simple Property Tools</p>
    </div>`;

  return { subject, text, html };
}
