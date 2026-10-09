# CI gates · audit the audits

GitHub Actions for **SP-Q26/Simple-Property** · two workflows on every `main` push.

## Workflows

| Workflow | Job | What runs | Blocks deploy? |
|----------|-----|-----------|----------------|
| **audit** | `gate` | `npm run preflight` | No (signal only) |
| **smoke-prod** | `repo-audit` | same `preflight` | No |
| **smoke-prod** | `apex-smoke` | live HTTPS smokes vs apex | No |

Vercel deploy is separate; these workflows **do not wait for Vercel** unless you wire `deployment_status` later.

### `preflight` (repo truth)

```text
node scripts/audit-git.mjs
cd web && npm ci && npm run audit
```

- **audit-git** · in CI: checks **commit author emails** on `HEAD` history, not laptop `user.email` or SSH vs HTTPS remote.
- **npm run audit** · `scripts/audit-spt-web.mjs` then ~35 sub-audits (brand, SEO swarm, performance, SVG, stack handoff, …). Exit **1** on any P0 fail. Swarm floor **≥ 95** per lane.

### Live smoke (production contract)

Runs only after `repo-audit` passes in **smoke-prod**.

| Script | Hits | Hard fail |
|--------|------|-----------|
| `smoke-prod.mjs` | `/`, pricing, logs, blog, legal | Missing copy, em dash, CSS HEAD not 200 |
| `smoke-prod-states-blogs.mjs` | `/app.js`, `/blog` clusters, pain post per state | 404, missing locale anchor |
| `smoke-statute-urls.mjs` | GET each statute URL | **404/410 only** (403 often warn) |
| `smoke-prod-magic-link.mjs` | `POST /api/auth/magic-link` | Not **200 + ok:true** |

**CSS version:** prod HTML may lag repo `CSS_VERSION` by one deploy · **warn** unless `SPT_SMOKE_STRICT_CSS=1`.

## Why pushes looked “always red”

1. **`audit` workflow** · `audit-git.mjs` treated GitHub Actions like a laptop: required local `user.email` noreply and failed on HTTPS `origin` → **preflight died in ~1s** before `web/npm ci`.
2. **`smoke-prod`** · ran `npm run audit` at repo root **without** `web/npm ci` and **without** `xmllint` on some runners → audit could fail before live smoke; live step was **skipped**.
3. **Duplicate work** · same heavy audit twice per push (audit + smoke-prod).
4. **Deploy race** · push triggers CI immediately; apex may still serve **previous** commit (CSS v mismatch warnings, not usually hard fail).

## Local parity (before push)

```bash
npm run preflight          # same as CI repo gate
npm run smoke:prod         # apex smoke (needs network)
npm run smoke:full         # audit + all live smokes + checkout probe
```

From repo root with clean tree and noreply identity configured locally (see `docs/GIT_AGENT_CONNECTION.md`).

## Sub-audit index (inside `npm run audit`)

| Script | Lane |
|--------|------|
| `audit-brand-shell.mjs` | Header, mark, tagline |
| `audit-blog-seo.mjs` | Manifest, RSS, pillars |
| `audit-seo-sweep.mjs` | Canonical, meta, JSON-LD |
| `audit-performance.mjs` | CSS budget 78KB, defer scripts |
| `audit-svg-assets.mjs` | favicon, OG, Stripe SVG + **xmllint** |
| `audit-swarm.mjs` | Scorecard ≥ 95 |
| `audit-stack-handoff.mjs` | launch-stack, packet IO, llms |
| `audit-blog-guide-warnings.mjs` | Story blocks, traction JSON |
| … | See `audit-spt-web.mjs` spawn list |

## Hardening options (later)

- Vercel **deployment_status** → run `apex-smoke` only after Production ready.
- `SPT_SMOKE_STRICT_CSS=1` once deploy hook exists.
- Single workflow with `needs: [gate, deploy]` to avoid duplicate `preflight`.
