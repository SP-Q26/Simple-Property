# Full audit · state expansion + blog coverage · 2026-09-22

Not legal advice. Operator and engineering audit after shipping **18 states + DC** (19 wizard codes) and regenerating blog clusters.

Companion: [STATE_EXPANSION_AUDIT_2026-09-22.md](./STATE_EXPANSION_AUDIT_2026-09-22.md) · [MULTISTATE_PACKS.md](./MULTISTATE_PACKS.md) · [SOCIAL_SHARE_SEO.md](./SOCIAL_SHARE_SEO.md)

## Executive summary

| Area | Status | Notes |
|------|--------|--------|
| Wizard state packs | **Shipped** | 19 codes in `web/lib/deposit-rules.mjs` · Chicago 45 overlay on IL |
| Brand locale / nav | **Synced** | `scripts/sync-brand-locale.mjs` · tagline **18 states + DC** |
| Blog per state | **Shipped** | ≥4 posts each (pain + deadline + itemization + checklist) on expansion states; legacy Midwest retains city + law depth |
| Pain-specific posts | **Shipped** | One dedicated `intent: "pain"` slug per wizard code (see matrix below) |
| Social / OG | **Shipped** | PNG share art · `npm run sync:seo` |
| Agent bus / llms | **Updated** | Multistate hook · **765 ILCS 715/** retained in llms for swarm Agent lane |
| Prod smoke | **Amber** | Magic-link email **503** (known) · FB scrape after deploy |
| Deferred rulesets | **Documented** | FL, AZ, WI, TX, KS, PA, SC, TN, NM, MT, WY, OK, MA |

## Wizard coverage (shipped)

**30-day from surrender:** GA, IA, IL, LA, MI, MO, NC, ND, NH, NJ, NV, OH, UT, WA  
**45-day from surrender:** DC, IN, MD, MS, VA  
**Overlay:** Chicago **45** on IL (RLTO)

**Not in wizard (defer):** forwarding-address gates, business-day engines, tenant-demand clocks, FL claim tracks, MA escrow/interest scope. Full defer table in state expansion audit doc.

## Blog coverage gate

Script: `node scripts/audit-state-blog-coverage.mjs` (wired into `npm run audit`).

Rules per wizard code:

- ≥ **3** manifest posts tagged with that state
- ≥ **1** post with `intent: "pain"` or `category: "pain"`
- `manifest.stateOrder.length === SUPPORTED_STATES.length`

**Generate / refresh:**

```bash
node scripts/generate-state-expansion-blogs.mjs
node scripts/build-blog-seo.mjs
node scripts/sync-social-meta.mjs
node scripts/audit-state-blog-coverage.mjs
```

Manifest total after this pass: **117** posts (52 expansion rows + 5 legacy Midwest pain + existing IL cluster).

## Pain post matrix (primary slug per state)

| Code | Pain slug | Pain theme |
|------|-----------|------------|
| DC | `dc-rhca-deposit-clock-rowhouse-investor` | RHCA rowhouse / ADU investor clock |
| GA | `georgia-cleaning-fee-lump-sum-deposit` | Lump “cleaning fee” vs itemized withhold |
| IA | `iowa-rural-turnover-surrender-date-gap` | Informal key handoff · no surrender date |
| IL | `missed-illinois-deposit-deadline-what-now` (+ 6 more IL pain guides) | Missed deadline · dispute · Excel · keys · photos |
| IN | `indiana-45-day-clock-forwarding-address-confusion` | Lease end vs surrender · address confusion |
| LA | `louisiana-withhold-without-itemized-accounting` | Withhold without itemized accounting |
| MD | `maryland-45-day-belt-investor-missed-clock` | Belt investor late mail / thin proof |
| MI | `michigan-detroit-normal-wear-deposit-fight` | Wear vs damage · missing move-in photos |
| MO | `missouri-stl-kc-deposit-clock-two-market` | STL/KC shared spreadsheet · wrong cells |
| MS | `mississippi-possession-still-occupied-deposit` | Possession vs “still occupied” clock |
| NC | `north-carolina-interim-30-final-60-deposit` | Interim vs final return confusion |
| ND | `north-dakota-pet-deposit-vs-security-deposit` | Pet deposit vs security deposit lines |
| NH | `new-hampshire-deposit-interest-itemization` | Interest / itemization operator gap |
| NJ | `new-jersey-disclosure-clock-vs-return-clock` | Disclosure timing vs return timing |
| NV | `nevada-return-and-itemization-same-mailing` | Return + itemization same mailing |
| OH | `ohio-cleveland-columbus-turnover-mail-delay` | Vendor delay · day-31 mail |
| UT | `utah-missed-deposit-deadline-penalty-track` | Penalty track after missed deadline |
| VA | `virginia-45-day-itemization-mail-proof` | Day-44 mail · no tracking |
| WA | `washington-deposit-invoices-substantiation` | Withhold without invoices / backup |

Each expansion state also has: `{state}-{N}-day-deposit-deadline`, `{state}-deposit-itemization`, `{state}-security-deposit-checklist`.

## Swarm / audit lanes (local · post blog regen)

| Lane | Target | Notes |
|------|--------|--------|
| Blog SEO | 100 | Manifest · RSS · Article JSON-LD |
| Discovery SEO | 100 | City clusters still Midwest-heavy in some posts; hub copy updated |
| Agent lane | **100** after llms **765 ILCS** line + bus hook update |
| Content depth | 100 | 117 posts |
| Legal pages | **Fix** | `build-blog-seo.mjs` must keep `/feedback` (and `/pricing`) in sitemap |

## Product / ops findings

1. **Deposit Desk** state selector matches `SUPPORTED_STATES`; verify script passes in audit chain.
2. **Pro** cap 40 units · 60-door story = same workflow · scale via hello@simple-property.com.
3. **Home hero** share art links to `/og/spt-share-door.png` for visible social proof.
4. **Miami / Phoenix marketing:** FL and AZ **not** in wizard; hashtags optional · do not imply those clocks in app.
5. **Chicago:** still the only city overlay; other cities remain blog local guides only.

## Recommended deploy sequence

1. Commit tree (states + blogs + llms + bus + sitemap fix).
2. Push `main` · Vercel production.
3. Facebook Sharing Debugger on `https://simple-property.com/app`.
4. Spot-check one new pain URL per region (DC, GA, MD, WA) in preview.

## Open items (non-blocking)

- Dedicated pain posts for **each IL suburb** not required; IL cluster is intentionally deep.
- Refresh `docs/SWARM_AUDIT.md` score table after next green `npm run audit`.
- NC “30 interim / 60 final” pain copy: wizard uses **30-day default**; counsel review before hard marketing on dual-phase returns.
