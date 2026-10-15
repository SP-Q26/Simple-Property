# Packet Bar Sweep · PBS v1

**Program:** Isles Collective · November 2026  
**Phase 1 ship:** Simple Property · Deposit Desk finalize (step 5) · Stripe green  
**Code:** `web/lib/packet-bar.mjs` · wired from `web/app.js`  
**Footer law:** Public **Web by AJ Nichols** unchanged on all marketing shells (no packet-bar edits to footer).

---

## Purpose

After finalize, the operator files a **dispute-ready packet** without opening AppFolio or a PM suite: copy a share link, paste one **receipt row** into a portfolio sheet, print/Save as PDF, and optionally drop the **deposit clock** into Google Calendar via `.ics`.

Blog promises (Google Calendar, Sheets handoff, CSV/print guides) stay satisfied via the deadline panel **and** PBS actions.

---

## Button order and labels (v1 · fixed)

| # | Control | `data-pbs` | Behavior |
|---|---------|------------|----------|
| 1 | **Copy link** | `copy-link` | Clipboard · `share_url` (packet return URL on step 5) |
| 2 | **Copy row (TSV)** | `copy-tsv` | Clipboard · one headerless TSV row (schema below) · paste into Google Sheets in ≤2 clicks |
| 3 | **Print / PDF** | `print` | Watermarked preview if locked · mail-ready print if entitled · `window.print()` |
| 4 | **Download .ics** (optional) | `ics` | Shown when statutory deadline exists · deposit clock file |

Secondary (not in the bar): **Add to Google Calendar** · **Export row for Google Sheets** (wide CSV) · **Copy for AI assistant** (`ai_paste_v1` markdown).

---

## TSV row schema (v1)

**Column order (tab-separated, no header row in clipboard):**

```text
receipt_id	brand	template_id	captured_at	verdict	share_url	verify_url	content_hash
```

| Column | Type | Deposit Desk source |
|--------|------|---------------------|
| `receipt_id` | string | `draft.id` (packet UUID) |
| `brand` | string | `deposit_desk` |
| `template_id` | string | `deposit_deduction_exhibit` |
| `captured_at` | ISO-8601 | Row build time (finalize/export moment) |
| `verdict` | enum | `CLEAR` · `FIX_LIST` · `FILE` (Receipt Rail spine) |
| `share_url` | URL | `/app?packet_id=…&step=5` absolute |
| `verify_url` | URL | P1: same as `share_url` · P2: `verify.simple-property.com/r/{token}` |
| `content_hash` | string | `sha256:` hex of stable packet snapshot (no photo bytes) |

**Sheets handoff:** Copy row → focus cell A1 → paste (one click after copy). Optional header row for new workbooks:

```text
receipt_id	brand	template_id	captured_at	verdict	share_url	verify_url	content_hash
```

---

## `ai_paste_v1` shape

Clipboard and agent exports use this JSON object (markdown body is what operators paste into LLMs):

```json
{
  "schema": "ai_paste_v1",
  "receipt_id": "uuid",
  "brand": "deposit_desk",
  "template_id": "deposit_deduction_exhibit",
  "captured_at": "ISO-8601",
  "verdict": "FILE",
  "share_url": "https://simple-property.com/app?packet_id=…&step=5",
  "verify_url": "https://simple-property.com/app?packet_id=…&step=5",
  "content_hash": "sha256:…",
  "exports": {
    "ai_paste_v1": "# Deposit Desk · packet summary…"
  }
}
```

`exports.ai_paste_v1` is the same markdown as **Copy for AI assistant** (`buildPacketAiReport` in `web/lib/packet-report.mjs`).

---

## Done when

- [x] Packet bar visible on Deposit Desk step 5  
- [x] TSV row matches eight columns  
- [x] `npm run smoke:packet-bar` green  
- [x] `npm run audit:receipt-rail` includes PBS doc gate  
- Operator can assemble mail + sheet proof **without** opening AppFolio  

---

## Telemetry

Client emits **`packet_bar_*`** events via `web/lib/spt-telemetry.mjs` (no PII). See [SIMPLE_PROPERTY_TELEMETRY_PBS_v1.md](./SIMPLE_PROPERTY_TELEMETRY_PBS_v1.md).

## Sister isles (later)

Copy `web/lib/packet-bar.mjs` once into FieldDrop / Berth static trees; swap `brand` · `template_id` · share URL builder. Do not fork button order without bumping to **PBS v2**.

*Internal · not legal advice.*
