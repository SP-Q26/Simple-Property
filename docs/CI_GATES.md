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
| `smoke:health` | `GET /api/health/services` | `ready: false` (Resend + KV on deploy) |
| `smoke:reminders` | health + `POST /api/reminders/subscribe` + cron gate | Not **200** enqueue after env live |

**CSS version:** prod HTML may lag repo `CSS_VERSION` by one deploy · **warn** unless `SPT_SMOKE_STRICT_CSS=1`.

## Why pushes looked “always red” (2026-10-12 audit)

**Symptom:** Two GitHub emails per `main` push — workflow **`audit`** (`gate`) and **`smoke-prod`** (`repo-audit` + `apex-smoke`) both fail; `apex-smoke` is **skipped** when `repo-audit` fails.

**Current root cause (Simple-Property):** `npm run preflight` → `web/npm run audit` → **`audit-performance.mjs` exit 1**:

| Check | Issue |
|-------|--------|
| `css v58 header` (old) | Looked for literal `v58` **inside** `simple-property.css` (only HTML query strings have `?v=58`) · false fail every run |
| `css size under 81KB` | Stylesheet ~**83.8KB** after v58 wizard/preview CSS · real over-cap |

**Not the blocker:** `audit-git` on CI (noreply authors OK) · live **`smoke-prod-magic-link`** returns `200 + ok:true` without Resend.

**Note:** There is **no** `launch-gate` workflow in this repo. **`launch-gate`** lives on **Innsegall** (`innsegall/.github/workflows/launch-gate.yml`) — separate emails if that repo is on the same org notifications.

**Historical (fixed in repo):**

1. **`audit-git`** CI mode · no longer fails on HTTPS `origin`.
2. **`smoke-prod`** · installs `xmllint` + runs full `preflight` (same as `audit`).
3. **Duplicate work** · still two workflows × same `preflight` → **two failure emails** until green or consolidated.
4. **Deploy race** · apex smoke can warn on CSS `?v=` lag one deploy (rare hard fail).

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
