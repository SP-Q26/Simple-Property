# Vercel setup · Simple Property Tools

**Repo:** [SP-Q26/Simple-Property](https://github.com/SP-Q26/Simple-Property) · **Root directory:** `web` · **Production branch:** `main`

## 1. Create or link project

1. [vercel.com/new](https://vercel.com/new) → Import **SP-Q26/Simple-Property**
2. **Root Directory:** `web` (Edit → set before first deploy) — **required**. If unset, `https://…vercel.app/` returns **404** (repo root has no `index.html`).
3. Framework: **Other** (static + `/api` serverless)
4. Production branch: **`main`** · Preview: all other branches + PRs

**Dashboard:** [vercel.com/spq/simple-property](https://vercel.com/spq/simple-property)

## 1b. Deployment Protection (public alpha)

SPQ team defaults may enable **Vercel Authentication** on `*.vercel.app` URLs. Anonymous visitors then hit SSO instead of Deposit Desk.

| Goal | Action |
|------|--------|
| Public smoke on `*.vercel.app` | Project → **Settings** → **Deployment Protection** → disable Vercel Authentication for this project, or limit to preview-only |
| Public production on apex only | Add **`simple-property.com`** — team policy `all_except_custom_domains` bypasses SSO on custom domains |

Until fixed, only logged-in team members can open default deployment URLs.

## 2. Enable tracking (dashboard)

After first deploy:

| Product | Path | Dashboard |
|---------|------|-----------|
| **Web Analytics** | `/_vercel/insights/script.js` | Project → **Analytics** → Web Analytics → **Enable** |
| **Speed Insights** | `/_vercel/speed-insights/script.js` | Project → **Analytics** → Speed Insights → **Enable** |

Git already injects both scripts on every public HTML page (`npm run sync-chrome`). Until enabled in the dashboard, scripts load harmlessly on Vercel hosts only.

Privacy copy: `web/privacy.html` · **Usage analytics** section.

## 3. Environment variables

Copy from `web/.env.example`. Set per **Preview** and **Production** in Vercel → Settings → Environment Variables.

| Variable | Preview | Production | Notes |
|----------|---------|------------|--------|
| `STRIPE_SECRET_KEY` | `sk_test_…` | `sk_live_…` when live | Test mode for preview |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI or test endpoint | Live webhook secret | See below |
| `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL` | Optional test price IDs | Live price IDs | Inline `price_data` fallback if unset |
| `SPT_ENTITLEMENT_SECRET` | Random 32+ bytes | **Different** random value | HMAC for entitlement + magic links |
| `SPT_SITE_URL` | `https://<preview-host>.vercel.app` | `https://simple-property.com` | Checkout success/cancel URLs |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Upstash via Marketplace | Same or prod store | Pro restore index |
| `RESEND_API_KEY` | `re_…` | `re_…` | Magic link + reminders |
| `SPT_EMAIL_FROM` | `Deposit Desk <hello@simple-property.com>` | Same (domain verified) | |
| `SPT_CRON_SECRET` | Optional | Optional | Vercel sets `CRON_SECRET` for cron routes |

**Preview Stripe webhook:** Stripe Dashboard → Developers → Webhooks → Add endpoint:

`https://<your-preview>.vercel.app/api/stripe/webhook`

Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`.

**Production webhook:** `https://simple-property.com/api/stripe/webhook`

## 4. Preview deploy (recommended first)

**Option A — Git (best):**

```bash
cd ~/SPQ/simple-property
npm run preflight
git push origin main          # or push branch `preview` for preview-only smoke
```

Vercel builds automatically; open **Deployments** → latest **Preview** or **Production** URL.

**Option B — CLI (one-off):**

```bash
cd ~/SPQ/simple-property/web
npx vercel login
npx vercel link               # team + project name e.g. simple-property
npx vercel                    # preview URL (no --prod)
```

## 5. Post-deploy smoke

| Check | URL |
|-------|-----|
| Home + nav | `/` |
| Pricing | `/pricing` |
| Wizard demo Pro | `/app?demo=pro` (preview / localhost only) |
| Blog | `/blog/landlord-tools-by-door-count` |
| Launch stack | `/launch-stack` |
| Entitlement API | `/api/entitlement` (GET, expect JSON error without params — not 500) |

Cron (production): daily 14:00 UTC → `/api/cron/deadline-reminders` (`vercel.json`).

## 6. Production apex

When ready:

1. Vercel → Domains → add `simple-property.com` + `www` (www redirect already in `vercel.json`)
2. Namecheap DNS: `@` A `76.76.21.21` · `www` CNAME `cname.vercel-dns.com`
3. Flip Stripe to live keys + live webhook on apex
4. GSC sitemap: `https://simple-property.com/sitemap.xml`

## Repo scripts

```bash
npm run sync-chrome    # inject Vercel analytics scripts into HTML
npm run preflight      # git + web audits (includes tracking audit)
```

See also: `docs/DEPLOY.md` · `docs/PHASE3.md` · `docs/GIT_AGENT_CONNECTION.md`
