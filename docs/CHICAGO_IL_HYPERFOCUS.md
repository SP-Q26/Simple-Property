# Chicago / Illinois hyperfocus · Deposit Desk lane

**Audience:** mom-and-pop · 1–4 doors (Pro cap) · Chicago RLTO + statewide 765 ILCS 715/  
**Voice:** plain dealing · receipts · timestamps · not legal advice  
**Live site:** [simple-property-spq.vercel.app](https://simple-property-spq.vercel.app) · apex later `simpleproperty.tools`

This doc is the **product spine** for the next builds: deposits stay core; everything else supports **provable condition**, **deadlines**, and **turnover** without becoming a PM suite.

---

## Six pillars · map

| Pillar | Job to be done | Shipped today | Gap |
|--------|----------------|---------------|-----|
| **Deposits** | Surrender → 30/45-day clock → itemized withhold → print/mail packet | 5-step wizard · Chicago toggle · deductions · `.ics` · Pro print | Interest/disclosure copy (Chicago); receipt at move-in template; wear-vs-damage helper text |
| **Photo + name logging** | Dispute-ready move-in record tied to **room + date + filename** | One photo/room · JPEG/PNG/WebP · caps in `app.js` | Auto filename · capture timestamp · multi-photo/room · move-out photo pairs · export ZIP for email |
| **Damage reports / write-ups** | Plain-language narrative + line items for withhold letter | Deduction rows (category, description, $) | **Damage report** mode: incident date, location, “normal wear vs damage” checklist, link photos to deduction lines |
| **One-click rental listings (free sites)** | Vacancy → paste-ready post on free boards | `/launch-stack` mentions tools only | **Listing launcher**: prefilled blurb + deep links (no scraping); save listing copy per unit |
| **Reminders** | Never miss return/itemize deadline | `.ics` (Pro) · email 7d/1d via Resend + cron (env) | SMS later; **Chicago-specific** copy in subject; reminder at surrender + 14d before lease end (optional) |
| **Showings · Calendly · Google Cal** | Book tours without double-booking | None | **Showing block**: import `.ics` / Google Calendar read-only URL · paste Calendly link · “open house” one-liner for listings |

---

## Illinois / Chicago · product law hooks (copy only)

Use in wizard footers and blog — **not legal advice**.

| Topic | Statewide | Chicago RLTO |
|-------|-----------|--------------|
| Return / itemize after surrender | **30 days** · 765 ILCS 715/ | **45 days** · MCC 5-12 (e.g. § 5-12-080) |
| Itemization | Written statement when withholding | Same discipline; stricter tenant awareness |
| Move-in condition | Best practice + dispute defense | RLTO tenants expect documented pre-existing damage |
| Wear vs damage | Fact-specific; itemization must be **actual cost** reasoning | Same; Chicago turnover volume → photo discipline matters |

**App rule (already coded):** `property.inChicago` → `computeDeadline()` in `web/lib/il-deposit-rules.mjs`.

---

## Pillar 1 · Deposits (deepen, don’t widen)

**Keep:** single wizard, localStorage-first, Stripe Pro for export.

**Next increments (order):**

1. **Move-in receipt block** — amount, date received, bank/escrow label (print section).
2. **Itemization preview** — step 5 shows withhold letter skeleton matching deduction rows.
3. **Guide:** `blog/normal-wear-vs-damage-illinois` (highest friction per `AUDIT_INNSEGALL_LENS.md`).
4. **Chicago footer string** on print: “45-day RLTO clock from surrender date you entered.”

**Out of scope v1:** escrow accounting, multi-building LLC charts, attorney workflow.

---

## Pillar 2 · Photo name logging

**Problem:** Courts and tenants care about **when** and **what** — not only that a blob exists in localStorage.

**Canon filename pattern (generate on upload):**

```text
{street-slug}_{room-slug}_{YYYYMMDD}_{seq}.{ext}
```

Example: `123-oak-2n_living-room_20260922_01.jpg`

**Data model (extend `draft.rooms[]`):**

```js
{
  name: "Living room",
  condition: "Good",
  notes: "",
  photos: [{
    dataUrl,           // existing pattern
    fileName: "...",   // generated
    capturedAt: "ISO", // client clock + optional EXIF if present
    label: "North wall scratch"
  }]
}
```

**UI:** show **filename + date** under thumb; “Add another photo” per room; print appendix lists filenames (Pro).

**Storage:** keep total cap (~1.2MB/packet); warn at 80%; suggest “export PDF then clear photos” for old packets.

---

## Pillar 3 · Damage reports / write-ups

**Not a separate app** — a **mode** on step 4 or a tab “Damage report” that feeds deductions.

**Sections:**

1. **Summary** — 2–3 sentences plain English (“Tenant vacated 2026-03-01; following damage beyond normal wear…”).
2. **Line items** — existing deduction table + **link** to move-in photo / move-out note per line.
3. **Wear checklist** (self-cert, not legal): paint scuffs vs holes, carpet wear vs burns, appliance life vs tenant abuse.
4. **Export** — same print packet + optional “Damage report only” PDF page for email attachment.

**Chicago angle:** RLTO itemization pressure → emphasize **dated photos at move-in** in copy.

---

## Pillar 4 · One-click rental listings (free sites)

**Principle:** **assistive paste**, not auto-post (ToS, captchas, account walls). “One click” = open site + clipboard ready.

**Listing draft fields (new `/listings` or wizard sidebar):**

- Address (from property step) · beds/baths · rent · available date · pet/smoking · IL disclosure one-liner (lead paint age if built pre-1978 — user checkbox)
- **Short** (Facebook / Craigslist) vs **long** (Zillow Rental Manager free listing)

**Free / low-cost targets (Chicago metro):**

| Site | Action in product |
|------|-------------------|
| **Facebook Marketplace** / local groups | Copy short post + “Open Facebook” |
| **Craigslist** (Chicago) | Copy + link to post form |
| **Zillow Rental Manager** (free tier) | Copy long description + link |
| **HotPads / Trulia** (syndication via Zillow) | Same blurb note |
| **Apartments.com** | Link + copy (often paid boost — label as optional) |

**Do not:** scrape login flows or imply MLS syndication.

**SEO page:** `blog/rent-your-chicago-unit-free-listing-sites` → internal link to Listing launcher.

---

## Pillar 5 · Reminders (extend what exists)

**Shipped:**

- `.ics` with deadline + 7/3/1-day offsets (`deadline-ics.mjs`)
- `POST /api/reminders/subscribe` + daily cron (`vercel.json`)

**Hyperfocus additions:**

| Reminder | Trigger | Channel |
|----------|---------|---------|
| Deposit return deadline | T-7, T-3, T-1 (already in UI copy) | Email + .ics |
| **Surrender recorded** | User sets surrender date | Optional “confirm clock started” email |
| **Lease end approaching** | T-30 before lease end | Email nudge: “schedule move-out walkthrough” |
| **Listing refresh** | Vacancy > 14 days | Email: “refresh Craigslist / Facebook post” |

**Chicago subject line example:** `Deposit deadline · 45 days RLTO · {street}`

**Requires:** Resend + KV on Vercel (see `PHASE3.md`).

---

## Pillar 6 · Showings · Calendly · Google Calendar

**Mom-and-pop reality:** showings live in **Google Calendar**; door counts live in **Google Sheets**; packets land in **Drive**.

**Shipped (step 5):**

- **Add to Google Calendar** · one-click template URL for return/itemize deadline
- **Download .ics** · import 7/3/1 reminders into Google Calendar in one step
- **Export row for Google Sheets** · CSV → File → Import

**Phase A (property step):** Calendly URL + showing copy block.

**Phase B:** paste Google Calendar **secret iCal** URL → read-only busy overlay.

**Phase C:** OAuth (Calendar read · Drive Picker) · privacy policy + Google verification.

Full scorecard: `docs/GOOGLE_TOOLS_AUDIT.md` · gate: `node scripts/audit-google-tools.mjs`

---

## Suggested build order (8 weeks · solo operator)

| Week | Ship | Pillar |
|------|------|--------|
| 1 | Wear-vs-damage guide + itemization print polish | Deposits |
| 2 | Photo filename + timestamp + multi-photo/room | Photo log |
| 3 | Damage report section + link photos to deductions | Write-ups |
| 4 | Listing launcher (copy + outbound links) + blog | Listings |
| 5 | Resend reminders live on prod + Chicago subject lines | Reminders |
| 6 | Calendly + showing copy block on property step | Showings |
| 7 | Google `.ics` import read-only (busy blocks) | Calendar |
| 8 | Swarm audit ≥95 · GSC · apex domain | Ops |

---

## What we will not build (lane guardrails)

- Full property management (maintenance tickets, accounting, autopay)
- Paid listing syndication as a product feature
- Tenant portal / e-sign (DocuSign link in copy is enough)
- Multi-state rules engine (IL-only until explicit expansion)

---

## Metrics (operator)

| Metric | Target |
|--------|--------|
| Wizard completion → print | ↑ week over week |
| Packets with ≥1 photo | ↑ (dispute readiness) |
| Email reminders scheduled | ↑ when Resend live |
| Listing launcher clicks | track outbound UTM `?ref=spt-listing` |
| Chicago toggle usage | % of IL zips in Cook County band (heuristic) |

---

## Doc cross-links

- `docs/CANON.md` · `docs/DOOR_TIERS_LAUNCH.md` · `docs/PHASE3.md`
- `web/lib/il-deposit-rules.mjs` · `web/app.js`
- Blog cluster: `/blog/chicago-45-day-deposit-deadline` · `/blog/illinois-deposit-itemization`

**Next code touch (when you say build):** photo schema migration in `app.js` + print template + one blog post — smallest vertical slice for “Chicago/IL dive.”
