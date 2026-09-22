# Copy & SEO intent review · Deposit Desk · 2026-09-22

Goal: visitors landing from search get a **direct answer** in the first screen, then a path to the right guide or app state.

## Intent map (query → asset → gap status)

| Search intent | Primary URL | Answer in copy? | Notes |
|---------------|-------------|-----------------|-------|
| Illinois 30-day deposit return | `/blog/illinois-30-day-deposit-deadline` | Yes | Links Chicago 45-day split |
| Chicago 45-day RLTO | `/blog/chicago-45-day-deposit-deadline` | Yes | App toggle called out |
| Indiana 45-day return | `/blog/indiana-45-day-deposit-deadline` | Yes | Pain hub links Midwest roundup |
| Ohio/MI/IA/MO 30-day | `*-30-day-deposit-deadline` posts | Yes | Same surrender pattern |
| When does deposit clock start | `/blog/surrender-date-illinois-deposit` + state surrender posts | Yes | Keys-not-returned pain post |
| Missed deposit deadline | `/blog/missed-illinois-deposit-deadline-what-now` | Yes | Home pill + FAQ (after fix) |
| Tenant disputes withhold | `/blog/tenant-disputes-security-deposit-illinois` | Yes | Links wear vs damage, itemization |
| Normal wear vs damage | `/blog/normal-wear-vs-damage-illinois` | Yes | IL-only; Midwest wear post deferred |
| Deposit itemization / one-line cleaning | `/blog/illinois-deposit-itemization`, pain cleaning post | Yes | |
| Excel / spreadsheet deposit tracker | `/blog/deposit-desk-vs-spreadsheet`, excel mistakes pain | **Was thin** | Enriched comparison post |
| Move-in photos / no documentation | `/blog/forgot-move-in-photos-*`, move-in checklist | Yes | |
| Renter deposit rights / timeline | `*-renter-deposit-*` (6 states partial) | Partial | IL + OH + MI + MO; IN/IA renter posts P1 |
| Pass-through fee like screening | `/blog/pass-through-deposit-documentation-fee-illinois` | Yes | Counsel disclaimer present |
| Deposit Desk vs inspection apps | `/blog/deposit-desk-vs-inspection-apps` | Thin | P1: add same depth as spreadsheet |
| Product pricing per turn vs Pro | `/pricing`, home FAQ | **Was stale** | Removed “coming” language |

## Site shell

| Surface | Issue | Fix |
|---------|-------|-----|
| Home `<title>` / meta | IL-heavy vs 6-state wizard | Midwest + pain keywords in title/description |
| Home guides H2 | Said “Illinois law” only | Pain + Midwest framing |
| Home pricing bullet | “Per turn (coming)” | Live $29/$49 at step 5 |
| Step 5 workflow | “print (Pro)” only | Per turn or Pro |
| `llms.txt` | Claimed “not multi-state” | Corrected to IL–MO + pain hub |
| `pricing.html` meta | “coming” on per-turn | Live checkout copy |

## Pillar coverage (45 posts)

- **pain (8):** dispute, missed clock, spreadsheet, keys, cleaning line, photos, pass-through, Midwest roundup
- **law (17):** deadlines, itemization, surrender, Chicago
- **landlord (12):** checklists, mail return, comparisons, door count
- **renter (6):** IL, Chicago, OH, MI, MO, IA timeline
- **news (2):** law watch

## Recommended P1 (no blockers to launch)

1. Indiana + Iowa **renter timeline** posts (mirror OH/MI).
2. **Wear vs damage** fork for IN/OH (or one Midwest wear post).
3. Enrich **deposit-desk-vs-inspection-apps** like spreadsheet post.
4. Indiana cluster: link `indiana-surrender-date-deposit` instead of Illinois slug in lists where IN-specific exists (hub already mixes; acceptable if surrender post is generic).

## Sweep commands

```bash
npm run audit
npm run smoke:prod
```
