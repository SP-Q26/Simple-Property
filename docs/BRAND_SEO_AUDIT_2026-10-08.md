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

- Home **court record card (v53):** muted danger tokens (`--court-warning-accent`), stronger left rail, kicker **signal dot** (`::before`), note line in warning ink; still greystone + sage palette (not alarm-red).
- Rotating lines + slight rotate-in; `prefers-reduced-motion` unchanged.

## Vercel logo + favicon (repo audit)

**Automated:** `node scripts/audit-vercel-favicon.mjs` (wired in `npm run audit`)

| Check | Status |
|-------|--------|
| `/favicon.svg` (32 viewBox, door mark) | OK |
| Every public HTML links `/favicon.svg` + manifest | OK |
| `site.webmanifest` coverage copy matches `brand-locale` | OK (`sync-site-webmanifest.mjs`) |
| JSON-LD `logo` → apex favicon | OK |
| OG `og/spt-share-door.png` + card svg | OK |
| Vercel Insights / Speed Insights `defer` | OK |

**Manual (Vercel dashboard):** Project **Settings → General → Project Icon** — upload `web/apple-touch-icon.png` from `npm run export:favicon` (repo cannot set dashboard icon via API). Deploy serves `/favicon.ico` + PNG companions for preview tabs and crawlers.

**Manifest fix:** `theme_color` aligned to greystone `#f4f0e6`; description no longer stale “18 states”.

## Trust · simple · problem/solution

**Automated:** `node scripts/audit-trust-voice.mjs`

| Lens | Verdict |
|------|---------|
| **Trust** | Documentation-only disclaimers, honest limits FAQ, no hype/scare copy, statute outbound gated |
| **Simple** | Tagline + ps-problem/ps-fix blocks, one product lane (Deposit Desk), door mark without micro-type |
| **Problem → solution** | Home + pricing pain leads; court card = *pattern* risk (dockets), CTA to packet not litigation |

**Blogs touched (court context cross-link, not legal advice):**

- `deposit-desk-vs-spreadsheet`
- `missed-deposit-deadline-small-landlord-multi-state`
- `landlord-tools-by-door-count`

## Re-run

```bash
npm run audit
node scripts/audit-swarm.mjs
npm run smoke:prod
```
