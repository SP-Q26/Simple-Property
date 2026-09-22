# Small PM lane map · mom-and-pop → full-time small operator

**Product:** Simple Property Tools (umbrella) · **Deposit Desk** remains the compliance core · expand by **lanes** (modules), not a monolith PM suite.

**Audience stretch:** 1 door → **~40 doors** (see `DOOR_TIERS_LAUNCH.md`) · same Homestead voice · **Illinois + Chicago RLTO first**.

**Law:** Every lane ships **documentation templates + deadline math + audit trail** — not legal advice. Operator confirms with counsel.

**Stack bias:** **Google Calendar · Sheets · Drive · Gmail** (`GOOGLE_TOOLS_AUDIT.md`) · localStorage → optional KV for Pro sync later.

---

## How to read this doc

| Tag | Meaning |
|-----|---------|
| **Easy** | Mostly HTML/JS + print/CSV/mailto · extends wizard or one new page · ≤1–2 weeks solo |
| **Medium** | API + KV/Resend · multi-unit UX · templates with versioning |
| **Hard** | OAuth, payments, e-sign API, court filing, multi-state rules engine |

**Compliance** column = what the lane helps **document** (not automate enforcement).

---

## Lifecycle map

```text
Vacancy → Showing → Application → Move-in → Tenancy → Maintenance → Notices → Move-out → Deposit → Archive
```

Deposit Desk today covers **Move-in (partial) · Move-out itemization · Deposit deadline · Export**.

---

## Lane catalog (every add-on)

### A · Turnover & vacancy

| Lane | Job | Compliance / IL hook | Effort | Easy first step |
|------|-----|------------------------|--------|-----------------|
| **A1 Listing launcher** | Post vacancy on free boards | Fair housing copy reminder in template | Easy | Prefill blurb + outbound links (`CHICAGO_IL_HYPERFOCUS` P4) |
| **A2 Showing log** | Who toured, when, follow-up | Fair housing: same info to all applicants | Easy | Unit + date + notes + Calendly URL on property card |
| **A3 Showing · Google Cal** | No double-book | — | Easy | Done: Calendar 1-click + `.ics` (`google-tools.mjs`) |
| **A4 Application checklist** | Screen before lease | FCRA: operator runs vendor; we checklist only | Easy | Printable PDF checklist + link placeholders (SmartMove, etc.) |
| **A5 Lease key handoff** | Surrender / key return record | Defines **surrender date** for 765 ILCS 715/ | Easy | Step 2 addendum: keys returned Y/N · witness line on print |

### B · Move-in (condition & deposits)

| Lane | Job | Compliance / IL hook | Effort | Easy first step |
|------|-----|------------------------|--------|-----------------|
| **B1 Move-in checklist** | Room condition + notes | RLTO: pre-existing damage record | **Shipped** | Extend photos + filenames |
| **B2 Move-in / move-out photo pairs** | Compare at turnover | Dispute defense | Easy | Tag photos `moveIn` / `moveOut` same room |
| **B3 Deposit receipt block** | Amount, date, where held | 765 ILCS receipt expectations | Easy | Print section on step 5 |
| **B4 Joint walkthrough sign-off** | Both parties acknowledge condition | Reduces “I never saw that” | Easy | Signature block (exists) + “tenant declined walkthrough” checkbox |
| **B5 Wear vs damage guide** | Operator education | Itemization must be reasonable | Easy | Blog + inline helper on step 4 |
| **B6 Chicago RLTO packet pointer** | City-specific disclosures | RLTO summary / city materials | Easy | Static links + “in Chicago?” callout on step 1 |

### C · Deposits & move-out money

| Lane | Job | Compliance / IL hook | Effort | Easy first step |
|------|-----|------------------------|--------|-----------------|
| **C1 Deadline calculator** | 30 / 45 from surrender | **Shipped** · `il-deposit-rules.mjs` | — | — |
| **C2 Itemization worksheet** | Line items + totals | Written statement when withholding | **Shipped** | Withhold letter preview (P1) |
| **C3 Damage report narrative** | Story + linked photos | Supports itemization | Easy | Step 4 tab “Damage report” |
| **C4 Return / withhold letter** | Mail-ready letter | Timing + itemization | Easy | Merge fields → print |
| **C5 Certified mail log** | Proof of mailing | Disputes | Easy | Date sent · tracking # field on packet |
| **C6 Deposit interest (Chicago)** | When applicable | City rules · operator confirms | Medium | Info panel + accountant note, not calculator |
| **C7 Multi-unit deposit tracker** | Sheet of all deadlines | Miss one unit = liability | Easy | **Shipped:** Sheets CSV · add master CSV template doc |

### D · Showings & calendar

| Lane | Job | Compliance / IL hook | Effort | Easy first step |
|------|-----|------------------------|--------|-----------------|
| **D1 Calendly on property** | Book tours | — | Easy | URL field + copy SMS template |
| **D2 Import Google Calendar busy** | See conflicts | — | Medium | Paste secret iCal URL |
| **D3 Open house block** | One event many attendees | — | Easy | Google Calendar template link |
| **D4 Lease-end showing prep** | Vacancy pipeline | — | Easy | Reminder T-30 lease end → listing launcher |

### E · Maintenance & damage logs

| Lane | Job | Compliance / IL hook | Effort | Easy first step |
|------|-----|------------------------|--------|-----------------|
| **E1 Maintenance ticket log** | Date, unit, issue, status | Habitability documentation | Easy | New `/log` or wizard “Maintenance” tab: localStorage list |
| **E2 Vendor / cost line** | 1099 prep helper | Tax · not legal | Easy | Vendor name + $ on ticket |
| **E3 Photo on ticket** | Before/after repair | Deduction vs habitability split | Easy | One photo per ticket (reuse photo cap pattern) |
| **E4 Chicago heat season checklist** | Oct–May heat rules awareness | RLTO heat · operator confirms | Easy | Seasonal banner + link to city guidance |
| **E5 Emergency log** | Burst pipe, no heat | Timeline for “reasonable time” disputes | Easy | Priority flag + timestamp export |
| **E6 Link ticket → deduction** | Turn repair into withhold line | Itemization | Medium | Pick ticket when adding deduction row |

### F · Tenant contact & notices

| Lane | Job | Compliance / IL hook | Effort | Easy first step |
|------|-----|------------------------|--------|-----------------|
| **F1 Contact log** | Call/text/email history | Proof of communication | Easy | Date · channel · summary · optional tenant name |
| **F2 Notice library (merge fields)** | Late rent, entry, non-renewal, deposit | **IL / Chicago notice periods vary** — template + counsel | Easy | Static templates with `{tenant}`, `{address}`, `{date}` → print |
| **F3 Entry notice tracker** | Planned access | 24h typical (lease/city may differ) | Easy | Log + Calendar 1-click for entry date |
| **F4 Rent due reminder** | Friendly before late notice | Lease terms | Easy | mailto/Gmail template · not rent collection |
| **F5 Document delivery log** | How notice was served | Eviction/deposit disputes | Easy | Hand deliver / mail / email checkbox + date |
| **F6 Tenant email (transactional)** | Send packet PDF link | CAN-SPAM minimal · consent | Medium | Resend · tenant opt-in on move-in |

### G · Reminders & compliance calendar

| Lane | Job | Compliance / IL hook | Effort | Easy first step |
|------|-----|------------------------|--------|-----------------|
| **G1 Deposit deadline email** | T-7 / T-1 | **Shipped** UI · needs env | Medium | Vercel Resend |
| **G2 Google Calendar deadline** | 1-click | **Shipped** | — | — |
| **G3 `.ics` bundle** | 7/3/1 days | **Shipped** | — | — |
| **G4 Lease-end reminder** | Start move-out prep | — | Easy | Calendar + email optional |
| **G5 RLTO / state deadline dashboard** | All units | — | Medium | Sheet sync or `/units` page |
| **G6 Compliance checklist per turn** | Ordered tasks | Reduces skipped steps | Easy | Printable turn checklist (move-in → deposit sent) |

### H · Records, units & scale (10–40 doors)

| Lane | Job | Compliance / IL hook | Effort | Easy first step |
|------|-----|------------------------|--------|-----------------|
| **H1 Saved packets (browser)** | **Shipped** | — | — | — |
| **H2 Unit registry** | Address, Chicago flag, tenant | — | Easy | Extend saved packets with unit list |
| **H3 Pro sync (KV)** | New device restore | **Partial** magic link | Medium | Expand KV beyond subscription |
| **H4 Drive folder convention** | `{Unit}/Move-in|Move-out|Notices` | — | Easy | Doc + print-to-PDF habit |
| **H5 Bulk Sheets export** | All units rows | — | Easy | Export all saved packets CSV |
| **H6 Team member (VA)** | Second login | — | Hard | Auth + roles |

### I · Explicitly not v2 (avoid PM suite trap)

| Lane | Why defer |
|------|-----------|
| Online rent collection | Stripe rent · accounting · trust accounts |
| Full general ledger | QuickBooks/Stessa lane |
| Eviction filing | Attorney + court |
| Chicago RLTO registration API | City portal · manual link OK |
| Multi-state | Breaks IL hyperfocus |
| Tenant portal app | Scope explosion |
| HOA / commercial | Different law |

---

## Recommended build waves (easy-first)

### Wave 1 · Same wizard, more print (4–6 easy lanes)

1. B3 Deposit receipt · C4 Return letter preview  
2. B2 Move-in/out photo tags · B5 wear guide  
3. E1 Maintenance log (localStorage)  
4. F1 Contact log · F2 Notice library (3 templates)  
5. A2 Showing log fields on property step  

**Gate:** extend `audit-swarm` product score · no new backend.

### Wave 2 · Google + Sheets as system of record

1. H5 bulk CSV · master Sheet template in docs  
2. A1 Listing launcher page  
3. G4 lease-end Calendar templates  
4. F3 entry notice + Calendar  

**Gate:** `audit-google-tools.mjs` + new `audit-notice-templates.mjs`.

### Wave 3 · Email + multi-unit (medium)

1. G1 Resend live on prod  
2. F6 tenant transactional email  
3. H2 unit registry UI  
4. G5 deadline dashboard  

**Gate:** KV schema · privacy policy update.

### Wave 4 · Import calendar · link maintenance to deductions

1. D2 iCal import  
2. E6 ticket → deduction  
3. C6 Chicago deposit interest info panel  

---

## Compliance lanes · IL / Chicago cheat sheet (product copy only)

| Topic | Use in app as |
|-------|----------------|
| 765 ILCS 715/ · 30-day return | Deadline math · fact strip |
| RLTO 45-day | Chicago toggle |
| Itemized withholding | Step 4 + letter |
| Surrender date | Step 2 · keys |
| Pre-existing condition | Move-in checklist + photos |
| Lead paint (pre-1978) | Listing + lease checklist line |
| Fair housing | Banner on listing/showing templates |
| Entry notice | F3 template + log |
| Late rent / termination | F2 templates · **verify with counsel** |
| Heat / habitability | E4 seasonal ops note |
| Security deposit receipt | B3 block |

---

## Brand & pricing implication

| Stage | Positioning | Pro cap idea |
|-------|-------------|--------------|
| Today | Deposit Desk · IL packets | 4 units (marketing) |
| Wave 1–2 | **Simple Property Tools** · compliance desk | 4 units · all lanes in browser |
| Wave 3+ | Small operator desk · IL | Tier: 4 / 10 / 20 units (Stripe SKUs later) |

Update `CANON.md` when umbrella name on marketing exceeds “Deposit Desk only.”

---

## Audit hooks (when lanes ship)

| Script | When |
|--------|------|
| `audit-google-tools.mjs` | Calendar/Sheets buttons |
| `audit-notice-templates.mjs` | (future) merge fields · no broken `{tokens}` |
| `audit-il-compliance-copy.mjs` | (future) disclaimers on every notice template |
| `audit-swarm.mjs` | Bump product lane weights |

---

## Cross-links

- `CHICAGO_IL_HYPERFOCUS.md` · six pillars (deposit-centric)  
- `GOOGLE_TOOLS_AUDIT.md` · Calendar/Sheets/Drive  
- `DOOR_TIERS_LAUNCH.md` · 1–10 / 10–20 / 20–40 tool philosophy  
- `SWARM_2026-09-20.md` · wedge vs inspection SaaS  

**Next single PR (if you pick one):** Wave 1 bundle — **Maintenance log + Contact log + 3 notice templates** on one `/operator` page sharing localStorage with packet IDs.
