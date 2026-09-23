# Desktop landing audit · 2026-09-23

**URL:** https://simple-property.com/  
**Scope:** Desktop (≥820px) · typography · copy truth · on-page SEO  
**Gate:** `node scripts/audit-landing-desktop.mjs` (in `npm run audit`)

## Findings (fixed in v31)

| Area | Issue | Fix |
|------|--------|-----|
| **Copy / trust** | FAQ claimed only 6 states + “Wisconsin not in app” while wizard ships **18 + DC** | Replaced with “Which states are in the wizard?” + guides link |
| **Hero** | Clock gloss read Illinois-only while eyebrow is multistate | Surrender-first copy · 30/45 pattern · wizard CTA |
| **SEO title** | “Midwest” underplayed multistate intent | Title + meta description aligned to deposit + 18 states + DC |
| **Schema** | SoftwareApplication lacked `url` / free tier | Added WebSite + app URL + free offer in JSON-LD |
| **Typography** | Dense hero at wide widths | Desktop block: `text-wrap: balance`, measure-wide body, scaled H2 |
| **Microcopy** | Double spaces in pricing bullets | Normalized middot spacing |

## Fonts (canon)

| Role | Stack |
|------|--------|
| UI | Inter 400–700 |
| Display | Lora 500–600 (headings, hero mission) |
| Fallback | system-ui / Georgia |

Google Fonts link uses `display=swap`. Body `-webkit-font-smoothing: antialiased`.

## SEO checklist (home)

- [x] `index,follow` · canonical apex
- [x] OG + Twitter large image (`spt-share-door.png`)
- [x] FAQPage + Organization + WebSite + SoftwareApplication JSON-LD
- [x] Pain keywords (surrender, itemiz, deposit, RLTO, 765 ILCS) in body
- [x] Internal links: `/app`, `/pricing`, `/blog`, pain guides
- [x] Product proof + pathway deck

## Post-deploy

```bash
npm run audit
SPT_SMOKE_URL=https://simple-property.com npm run smoke:prod
```

Hard-refresh desktop home · confirm locale strip + hero door card + FAQ states answer.
