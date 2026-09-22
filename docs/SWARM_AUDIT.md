# Swarm audit · Deposit Desk · 2026-09-22

**Gate:** `cd web && npm run audit` (includes `audit-brand-shell.mjs` + `audit-swarm.mjs`).  
**Swarm only:** `cd web && npm run audit:swarm`.

Target: **≥ 95 / 100** on every metric. Exit code **1** if any lane drops below 95.

## Current scores (automated)

| Metric | Score | What the gate checks |
|--------|------:|----------------------|
| Brand shell (mark · nav · v7) | 100 | `brand-mark`, Homestead, `simple-property.css?v=7` on index, pricing, app, all blog posts |
| Visual system (tokens · proof) | 100 | CSS tokens, radial wash, `product-proof` on home + stylesheet |
| SEO (canonical · OG · Article) | 100 | robots → sitemap; feed.rss; Article JSON-LD on all guides |
| Agent lane (llms · bus · gospel) | 100 | `llms.txt`, `spt-ai-bus.json`, `.well-known/spt-gospel.json`, home link to bus |
| Product (wizard · Pro · reminders) | 100 | 5-step wizard, `.ics`, saved packets, success entitlement refresh, step-5 reminders UI |
| Backend (Stripe · KV · email) | 100 | entitlement, webhook, portal, magic-link, reminders subscribe, cron |
| Legal & trust | 100 | privacy + terms line counts; substantive copy |
| Ops & audit gates | 100 | `audit-spt-web`, `audit-brand-shell`, `verify-stripe-catalog` |
| Content cluster depth | 100 | ≥ 14 guides |
| Blog SEO (manifest · RSS · pillars) | 100 | `audit-blog-seo.mjs` · four categories ≥ 2 each |
| Discovery · lane · SEO | 100 | `audit-discovery-seo.mjs` · pain keywords · RSS · ai-discovery v2 |
| Launch stack · door tiers | 100 | `/launch-stack` · llms + bus |

**Lowest lane:** all **≥ 95** after blog + discovery cycle (run `npm run audit:discovery` · `npm run audit:blog`).

## Before → after (this swarm cycle)

| Metric | Before (est.) | After | Work completed |
|--------|--------------:|------:|----------------|
| Brand shell | 88 | 100 | v7 cache bump; brand audit on all surfaces |
| Visual | 82 | 100 | `product-proof` section + CSS |
| SEO | 78 | 95 | 2 new guides; sitemap + vercel rewrites; `sync-blog-article-seo.mjs`; pricing OG |
| Agent lane | 55 | 100 | `spt-ai-bus.json`, gospel, llms.txt refresh |
| Product | 85 | 100 | Phase 3 reminders + entitlement paths (already shipped) |
| Backend | 70 | 100 | Phase 3 APIs verified present |
| Legal | 90 | 100 | Phase 2/3 privacy updates |
| Ops | 80 | 100 | Swarm script + chained into `npm run audit` |
| Content | 72 | 96 | 5 → 7 guides (+ surrender date, return by mail) |

## Tasks to hold ≥ 95 (maintenance)

| If score drops… | Do this |
|-----------------|---------|
| Brand shell | Paste from `web/brand/shell-*.html`; bump CSS `?v=` everywhere; run brand audit |
| Visual | Keep home `product-proof`; don’t strip CSS tokens |
| SEO | Add new posts to `sitemap.xml` + `vercel.json`; run `node scripts/sync-blog-article-seo.mjs` |
| Agent lane | Keep bus + gospel valid JSON; llms.txt cites IL statute + URLs |
| Product | Don’t regress wizard steps / Pro gates / reminder step |
| Backend | Don’t delete API routes without updating swarm list |
| Legal | Keep privacy/terms substantive when adding data flows |
| Ops | Keep scripts in repo; CI = `npm run audit` |
| Content | Ship guides via `blog-manifest.json` + `npm run sync-blog-seo` |
| Discovery | Keep home pain keywords, RSS links, `ai-discovery.json` blog paths |
| Blog SEO | Manifest ↔ HTML ↔ sitemap ↔ vercel rewrites in sync |

## Brand sweep (manual, post-build)

- [x] CSS **v7** on marketing, app, pricing, blog, legal
- [x] Homestead lockup + primary nav on all public HTML
- [x] Pricing canonical + OG + apple-touch-icon
- [x] Colophon footer pattern via shell templates
- [ ] Per-post OG art (still shared `og/spt-card.svg`) — optional
- [ ] Cross-device **packet** sync beyond Pro restore — product P1, not brand

## Related docs

- `docs/LANE_COMPARE.md` — vs Innsegall lane · brand/SEO/content growth
- `docs/DEPLOY.md` — git branch + Vercel redeploy
- `docs/AUDIT_BRAND_LANE.md` — shell canon
- `docs/PHASE2.md` · `docs/PHASE3.md` — product/backend
- `docs/AUDIT_PASS2.md` — proud-ship vs Luxe tier honesty
- `scripts/audit-swarm.mjs` — scoring source of truth
