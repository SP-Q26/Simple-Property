# Brand + SEO sweep · 2026-10-08

**Repo:** `simple-property` · **Site:** https://simple-property.com  
**Gate:** `npm run audit` + `node scripts/audit-swarm.mjs`

## Swarm scores (all ≥ 95)

| Lane | Score |
|------|------:|
| Brand shell | 100 |
| Visual system | 100 |
| SEO (canonical · OG · Article) | 100 |
| Agent lane (llms · bus · gospel) | 100 |
| Product (wizard · Pro · reminders) | 100 |
| Backend (Stripe · KV · email) | 100 |
| Legal & trust | 100 |
| Ops & audit gates | 100 |
| Content cluster | 100 |
| Blog SEO | 95 |
| Discovery · lane · SEO | 100 |
| Launch stack · door tiers | 100 |

## Brand (current canon)

- **Lockup:** Simple Property Tools · Deposit Desk · `Never pay the fees.` · Founded in Chicago · 19 states + DC
- **Mark:** simplified greystone door `favicon.svg` (no micro-type; hinge + gold knob)
- **Hero:** mission H1 · color bar · **court record warning card** (semi-red rotate lines · docket patterns disclaimer)
- **Footer:** Isles Collective © 2026 · Web by AJ Nichols (no portfolio URL yet)
- **Lane:** turnover / deposit packets · complement PM suites (launch-stack · llms.txt)

## SEO (spot checks)

- Home: canonical apex · WebSite + SoftwareApplication + FAQPage JSON-LD
- Blog: manifest · RSS · per-post canonical · OG · Article schema · guide story warnings
- Sitemap + `llms.txt` + `spt-ai-bus.json` + `.well-known` discovery
- OG share card: no live landlord count on image; traction on landing via `public-traction.json`

## Warnings (non-blocking)

- `node_modules` present locally · keep gitignored
- Title length on home may exceed 70 chars · monitor in Search Console
- Blog SEO swarm at **95** (floor met; room for compare posts e.g. Innago/Avail turnover)

## UI change this sweep

- Home **court record card:** semi-red surface, left accent, rotating lines with slight rotate-in animation; respects `prefers-reduced-motion` (static first line, no interval).

## Re-run

```bash
npm run audit
node scripts/audit-swarm.mjs
npm run smoke:prod
```
