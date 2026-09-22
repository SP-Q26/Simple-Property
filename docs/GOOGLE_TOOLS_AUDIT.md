# Google tools audit · Deposit Desk · full lane

**Assumption:** Most mom-and-pop operators already live in **Google Calendar**, **Drive**, and **Sheets**. We align with that stack before building OAuth or paid integrations.

**Privacy:** One-click links open **Google in the user’s browser**. We do not store Google tokens on our servers in this lane.

---

## Scorecard (target ≥ 95 before apex)

| Lane | Weight | P0 requirement | Status |
|------|--------|----------------|--------|
| **Calendar · deadline** | 25 | One-click **Add to Google Calendar** for return/itemize date | Shipped · `googleCalendarAddUrl` |
| **Calendar · reminders** | 15 | `.ics` with T-7/T-3/T-1 **or** separate Google add links | Shipped · `.ics` + optional reminder URLs in lib |
| **Sheets · door tracker** | 20 | CSV export → **File → Import** in Google Sheets | Shipped · `buildPacketSheetsCsv` |
| **Drive · photos** | 15 | Print/PDF + user saves to Drive folder (manual) | Partial · print; auto-upload = P2 OAuth |
| **Gmail · reminders** | 10 | Resend email reminders (not Gmail API) | Env-dependent · `PHASE3.md` |
| **Docs / copy** | 10 | Home + launch-stack + this audit | Gate · `audit-google-tools.mjs` |
| **Import from Google** | 5 | Paste public Calendar iCal URL (showings) | Spec · `CHICAGO_IL_HYPERFOCUS.md` Pillar 6 |

Run gate:

```bash
node scripts/audit-google-tools.mjs
```

Chained from `npm run audit` / `preflight`.

---

## Product map · Google Workspace

### Google Calendar

| User job | Our surface | Mechanism |
|----------|-------------|-----------|
| Never miss 30/45-day deadline | Step 5 · **Add to Google Calendar** | `calendar.google.com/...&action=TEMPLATE` |
| Reminder days on phone | **Download .ics** → Google Calendar → Settings → Import | `deadline-ics.mjs` |
| Showings / Calendly | Property notes + Calendly URL (Pillar 6) | Link out · no API v1 |
| Busy week view | Paste **Secret iCal address** from Google Calendar settings | P2 · parse client-side |

**Not v1:** Google Calendar API OAuth, two-way sync, shared landlord/tenant calendars.

### Google Sheets

| User job | Our surface | Mechanism |
|----------|-------------|-----------|
| Track 2–4 doors without memory | **Export row for Google Sheets** | CSV one row per packet |
| Multi-unit dashboard | User keeps master sheet; import CSV after each turn | Document template columns in audit |

Suggested master columns (user sheet): Unit · Tenant · Surrender · Deadline · Chicago? · Deposit · Withhold · Packet updated.

**Not v1:** Google Sheets API write, live sync, Apps Script.

### Google Drive

| User job | Our surface | Mechanism |
|----------|-------------|-----------|
| Store move-in photos | Print packet or PDF from browser → **Save to Drive** | User action |
| Per-unit folder | Copy in launch-stack: `Drive/123 Oak/` lease + packet PDF | Ops habit |

**P2:** Drive Picker for photo attach (OAuth + privacy review).

### Gmail

| User job | Our surface | Mechanism |
|----------|-------------|-----------|
| Deadline email nudge | Step 5 · Schedule emails | Resend · not Gmail send API |
| Forward packet to self | Print → PDF → attach in Gmail | User action |

---

## One-click flows (operator)

### A · Add deadline to Google Calendar

1. Finish surrender date on step 2.
2. Step 5 → **Add to Google Calendar** → sign in if prompted → Save.
3. Optional: **Download .ics** for 7/3/1 reminder days in one import.

### B · Log unit in Google Sheets

1. Step 5 → **Export row for Google Sheets** → saves `deposit-desk-row.csv`.
2. Google Sheets → **File → Import** → Upload → Replace or append row.

### C · Photos in Drive (manual)

1. Pro print → browser **Print → Save as PDF**.
2. Drive → unit folder → upload PDF + any photo exports from packet.

---

## Import flows (later)

| Source | Import into Deposit Desk | Phase |
|--------|--------------------------|-------|
| Google Calendar iCal URL | Read-only busy blocks for showing planning | B |
| Uploaded `.ics` | Same | B |
| Google Sheets row | Prefill property/tenant fields | C |
| Drive folder | List PDFs only with OAuth | C |

---

## Risks if we ignore Google

- Operators keep **parallel spreadsheets** with wrong surrender dates.
- They **never import .ics** because the button says “.ics” not “Google Calendar”.
- **Photo evidence** stays on the phone camera roll, not Drive, when disputes hit.

Deposit Desk stays a **line item** only if it meets them where they already work.

---

## Code owners

| File | Role |
|------|------|
| `web/lib/google-tools.mjs` | Calendar URL · Sheets CSV |
| `web/lib/deadline-ics.mjs` | Multi-event .ics |
| `web/app.js` | Step 5 buttons |
| `scripts/audit-google-tools.mjs` | CI gate |

Cross-links: `CHICAGO_IL_HYPERFOCUS.md` · `DOOR_TIERS_LAUNCH.md` · `PHASE3.md`

---

## Maintenance

- After wizard step 5 UI changes: re-run `audit-google-tools.mjs`.
- If Google changes Calendar URL params: test template link on mobile + desktop.
- Before OAuth: update `privacy.html` · Google Cloud verification budget.
