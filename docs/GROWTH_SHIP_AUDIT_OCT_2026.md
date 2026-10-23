# Growth ship audit · Oct 2026

Uncompromising gate record for FB/paid conversion work. Re-run after every growth deploy.

## Ship train

```bash
npm run train:growth   # content + chrome + all audits + smoke:prod
```

## Local gates (must be green before push)

| Gate | Command | Expect |
|------|---------|--------|
| Money path P1 | `npm run audit:money-path` | paywall economics · checkout · webhook |
| FB wiring | `npm run audit:fb-growth` | attribution · pathway · compare CTAs |
| Route series | `npm run audit:route-series` | ≥5 per hub incl. compare + deposit-statutes |
| Links | `npm run audit:links-full` | 299 routes · internal href parity |
| Blog hub | `npm run audit:blog-hub` | cluster-compare · cluster-statutes |
| MCP counts | `npm run sync:mcp` then `npm run audit:mcp` | `blog_post_count` = manifest length |
| Full swarm | `npm run audit` | all scripts in `audit-spt-web.mjs` chain |
| CSS comment | `simple-property.css` header | matches `CSS_VERSION` in `brand-locale.mjs` |

## Production smoke (after Vercel deploy)

```bash
npm run smoke:prod
```

Prod smoke checks **`paywall-economics` in `/app.js`** (rendered at step 5, not in static HTML). After deploy, `npm run smoke:prod` must be fully green.

Optional strict CSS: `SPT_SMOKE_STRICT_CSS=1 npm run smoke:prod`.

## What shipped in this train

- **275** blog posts in manifest · **5** new statute-route guides
- Compare cluster tagged · hub filters **Product** for compare + statutes
- **FB pathway** on home (`spt-fb-pathway.js`) · UTM → state preset + turnover deep link
- **Attribution** session (`spt_mkt_v1`) · `sp_landing_capture` · `sp_fb_landing` · `sp_app_open`
- **Paywall economics** line on step 5 ($350/hr vs $29–49)
- Compare blog CTAs → `/app?turnover=1&ref=compare`

## Route series fix (do not regress)

- **home** (5): includes `competitor-pm-software-deposit-gaps`
- **deposit-desk** (5): includes `deposit-desk-new-states-thanks-oct-2026` (not the competitor post)
- Enforced by `scripts/assign-compare-route-series.mjs`

## Cost / infra honesty

Static site + Vercel functions scale with **traffic and cron**, not blog count. If spend jumped ~400% without matching `sp_app_open` / `checkout_intent` / `paywall_view` lift:

1. Run `npm run report:funnel-weekly` and ops traction (`/api/ops` funnel) — **usage before resize**.
2. Right-size any **always-on droplet** only after confirming it is not idle cron, log drain, or duplicate workers.
3. Do not downsize before FB links use the playbook URLs; otherwise you optimize away capacity while conversion is still unmeasured.

## Operator checklist (48h after deploy)

- [ ] `smoke:prod` green including `paywall-economics`
- [ ] FB ads use `utm_source=facebook` + `turnover=1` app links (`docs/FB_GROWTH_PLAYBOOK.md`)
- [ ] Funnel report shows non-zero `sp_fb_landing` or `sp_landing_capture`
- [ ] At least one `sp_wizard_start` or `paywall_view` from paid session

If all four are empty after spend, **fix creative/links before cutting server budget**.
