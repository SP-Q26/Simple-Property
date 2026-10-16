# Elevation audit · Simple Property Tools

**Gate:** `npm run audit:elevation` (branding · lane · pricing · copy · blog · related reading).  
**Full ship:** `npm run audit` (includes elevation child gates + swarm).

## Lanes covered

| Lane | Scripts | What “good” means |
|------|---------|-------------------|
| **Branding** | `audit-branding-copy` · `audit-brand-tagline` · `audit-brand-shell` | Never pay the fees · no Homestead · Stripe/catalog aligned · Deposit Desk nav label |
| **Site nav** | `audit-site-nav` · `sync:site-nav` | Header: Deposit Desk · Logs · Pricing · Condition hub · Stack · Guides · Feedback |
| **Pricing** | `audit-pricing` | $29/$49 turn · Pro $22/$99 · 40 units · Keeper/Portfolio documented on `/pricing` |
| **Copy** | `audit-goal-copy` · `audit-pain-copy` · `audit-customer-voice` | Pain → fix → CTA · ROI · no roadmap leaks |
| **Blog** | `audit-blog-seo` · `audit-blog-goal-copy` · `apply:blog-goal-copy` · `elevate:blog-metro` | 268 guides · pillars incl. **metro** · pain · CTA · legal disclaimer |
| **Related / news** | `audit-blog-related` · `apply:blog-related` | `spt-related-guides` per state post · news cross-links |
| **Hub / Receipt Rail** | `audit-hub-copy` · `audit-hub-alpha` · `audit-receipt-rail-spec` | Condition hub customer voice · alpha spine |
| **Lane canon** | `SIMPLE_PROPERTY_LANE_MASTER.md` | Program A/B · routes · gates |

## Apply scripts (after generators or bulk HTML edits)

```bash
npm run sync:site-nav
node scripts/sync-site-footer.mjs
npm run apply:blog-goal-copy    # pain + CTA + related blocks
npm run audit:elevation
```

## Pricing dive (live vs documented)

| SKU | Status on `main` |
|-----|------------------|
| Free draft | Live |
| Turn $29 / $49 | Live Stripe |
| Pro $22/mo · $99/yr · 40 units | Live |
| Keeper $29 · Portfolio $79 (hub) | **Documented** on `/pricing` + `docs/receipt-rail/PRICING_40_UNITS.md` · billing at P1 |

Deep dive: `docs/PRICING_DIVE_PER_TURN.md` · compare: `docs/LANE_COMPARE.md`.

## Blog corpus

- **268** manifest posts · **metro** pillar (neighborhood + local-guide cluster) · state hub links on checklist/deadline guides.
- Related reading: primary pain guide + checklist/itemization/deadline siblings per state.

## Maintenance

When scores slip, fix the failing script first — do not weaken gates. Update this doc when new lanes ship (e.g. hub Stripe cutover).
