# Door tiers · launch stack · 2026-09-22

**Ship surfaces:** `/launch-stack` · `/blog/landlord-tools-by-door-count` · `llms.txt` · `spt-ai-bus.json` v2

## Tier model

| Doors | Phase | Operator reality |
|------:|-------|------------------|
| **1–10** | Rough | Memory, spreadsheets, personal bank commingling, missed deposit clocks |
| **10–20** | Systems | Need ledger, lease versioning, maintenance history, repeatable move-in/out |
| **20–40** | Automate | Autopay, bank feeds, tickets, screening pipeline — before full PM company staff |

Deposit Desk **Pro** caps at **4 units** on one subscription — aimed at rough-tier core; larger portfolios often pair PM software + Deposit Desk for IL itemization.

## 1–10 · deploy on launch

| Category | Tools (examples) | Notes |
|----------|-------------------|--------|
| Deposit IL | **Deposit Desk** | 765 ILCS 715/ · RLTO 45-day · .ics · Pro print |
| Banking | Business checking | Never mix rent/deposit with personal |
| Files | Drive/Dropbox per unit | Lease, receipts, move-in photos |
| Calendar | Phone + .ics from app | Surrender date anchors deadline |
| Screening | SmartMove, RentSpree, etc. | Per application · FCRA compliance |
| Insurance | Landlord policy | Liability · loss of rents where offered |
| Rent | Check/ACH/Zelle + simple log | OK at this scale |
| Maintenance | Notes/text + photos | Upgrade at 10+ |

## 10–20 · systems in place

| Category | Tools (examples) | Notes |
|----------|-------------------|--------|
| Deposits | Deposit Desk Pro + email reminders | More turns = more deadline risk |
| Ledger | Wave, QuickBooks Simple Start, Stessa | Monthly reconciliation habit |
| Light PM | RentRedi, TenantCloud, Baselane | Rent + maintenance without enterprise |
| eSign | Dropbox Sign, DocuSign | Addenda versioned |
| Maintenance | PM ticket or shared sheet | Vendor 1099 tags |
| SOP | One-page move-in/out/late rent | Train co-owner or VA |

## 20–40 · start automating

| Category | Tools (examples) | Notes |
|----------|-------------------|--------|
| Rent | Autopay via PM | DoorLoop, Buildium, Baselane, etc. |
| Accounting | Stessa/QB + bank feed | Bookkeeper-ready |
| Maintenance | PM native or Latchel, Property Meld | SLA + history |
| Screening | PM-integrated | Same criteria every lease |
| IL deposits | Deposit Desk if PM export weak | Statute timing ≠ generic PM defaults |
| People | Part-time bookkeeper / VA | Software does not replace roles |

## Research notes (not exhaustive)

- **Inspection SaaS** (RentCheck, etc.) ≠ deposit **return** workflow — see comparison guides.
- **Enterprise PM** (AppFolio) often starts above 40 doors; mid-market DoorLoop/Buildium common 20+.
- **Stessa** strong free tier for accounting; weak on IL-specific deposit itemization export.
- **Baselane** popular for banking + rent at small scale; verify IL deposit letter format.
- No affiliate relationships — operator picks vendors; update this doc when IL law or products shift.

## Ops

After edits: `node scripts/sync-blog-article-seo.mjs` · sitemap · `vercel.json` · `npm run preflight`.

Swarm metric: **Launch stack · door tiers** (see `scripts/audit-swarm.mjs`).
