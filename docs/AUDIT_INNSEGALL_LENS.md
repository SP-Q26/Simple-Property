# Audit · Innsegall / SPQ lens · Deposit Desk

**Question:** What is missing, and what customer-facing surface does **not** help conversion, trust, or the IL deposit job?

**Gates:** `npm run preflight` now runs **links** + **customer lane** after swarm (Innsegall-style discipline).

## Innsegall has · SPT has

| Lane | Innsegall | SPT (now) |
|------|-----------|-----------|
| Multi-script swarm | 15+ audits | 10 swarm + links + customer |
| Internal link integrity | `audit-links.mjs` | `audit-links.mjs` |
| Customer-safe copy | brand-stack, no dev leaks | `audit-customer-lane.mjs` |
| llms + bus + gospel | yes | yes |
| ai-discovery.json | yes | **added** |
| OG PNG raster | yes | SVG only (P2) |
| Content factory / MD pipeline | yes | static HTML only |
| Issue spotlight / field reports | yes | not in lane (IL guides instead) |
| CLI / install product | yes | web wizard only |
| Parley / API for agents | yes | not needed for deposit SKU |

## Customer-facing fixes (this pass)

| Issue | Why it hurt | Fix |
|-------|-------------|-----|
| `?demo=pro` on **pricing** | Looked like a hack; trained bypass | Removed · link to free draft on `/app` |
| `demo=pro` on **production** | Free Pro on apex | **`spt-demo-gate.js`** — preview/localhost only |
| Checkout alert mentioned Vercel/dev | Operator noise | Customer message + support email |
| Billing alerts | Jargon | Plain subscribe-first copy |

## Still missing (prioritized)

### P0 · hurts money or trust if ignored

1. **Live Vercel env** — Stripe, KV, Resend, webhook URL (not a copy problem).
2. **GSC + sitemap submit** after apex deploy.
3. **Stripe live catalog** — `verify-stripe-catalog.mjs` with real keys before live mode.

### P1 · Innsegall parity that helps IL lane

4. **Guide #9** — normal wear vs damage (highest wizard friction).
5. **SEO 95 → 98** — HowTo on checklist post; BreadcrumbList on blog.
6. **OG PNG** — social previews beyond SVG (Innsegall `audit-social-preview`).
7. **Unified footer CTA** — every guide footer: App · Pricing · Stack (some still minimal).
8. **`?buy=annual` on marketing** — checkout deep link from home/pricing CTAs (script already supports).

### P2 · nice · not blocking

9. Content factory (MD → HTML like Innsegall `render-blog-post`).
10. Competitor absorption posts (TurboTenant, Hemlane) — see `LANE_COMPARE.md`.
11. Email templates with Homestead header (brand in deliverable).
12. CI on GitHub after push green.

## Nothing customer-facing should ship that…

- Explains **how we build** (demo query params, env var names, fork lineage).
- References **other SPQ products** (Terminal, Innsegall, Luxe).
- Promises **legal outcomes** beyond “documentation / not legal advice.”
- Lists **tools we do not integrate** without a job-to-be-done (launch stack is OK — tier checklist).

## Operator-only (keep out of HTML)

- `?demo=pro` on **localhost** or **\*.vercel.app** preview only.
- `README.md` / `docs/` smoke commands.
- `scripts/preview.sh` hints.

## Run

```bash
npm run preflight
node scripts/audit-links.mjs
node scripts/audit-customer-lane.mjs
```

See also: `docs/LANE_COMPARE.md` · `docs/SWARM_AUDIT.md` · `docs/DOOR_TIERS_LAUNCH.md`.
