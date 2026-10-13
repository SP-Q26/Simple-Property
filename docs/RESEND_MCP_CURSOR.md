# Resend · production stack + Cursor MCP

Deposit Desk sends mail through **Vercel** (`RESEND_API_KEY`). **Cursor MCP** is for operator/agent tooling (logs, domain check, test sends) — not required for the site.

## Production checklist (100% bar)

| Check | How |
|-------|-----|
| Domain verified | Resend → Domains → `simple-property.com` (or your from-domain) |
| `RESEND_API_KEY` | Vercel **simple-property** → Production + Preview → Sensitive |
| `SPT_EMAIL_FROM` | `Deposit Desk <hello@simple-property.com>` (must match verified domain) |
| `SPT_FEEDBACK_TO` | Optional · inbox for feedback notifications (default `hello@simple-property.com`) |
| Redeploy after env change | Env does not apply to old deployments |
| Health | `curl -s https://simple-property.com/api/health/services` → `resend: true`, `emailFrom: true`, `ready: true` |
| Automated | `npm run audit:resend` · `npm run smoke:health` · `npm run smoke:reminders` · `npm run smoke:feedback` |

**Routes using Resend:** magic link · deadline reminders (cron) · `/api/feedback` · Pro tenant packet email.

**Not required:** Resend **webhook** to Vercel (optional later for bounces). **Stripe** webhook is separate and required for billing.

## Cursor MCP (this repo)

**Canonical Cursor config (SPQ repo):** stdio `resend-mcp` + secrets in `~/.cursor/resend-mcp.env` — see **`SPQ/docs/RESEND_MCP_CURSOR.md`** (fixes `stateless; use POST` from remote OAuth/GET).

Hosted `https://mcp.resend.com/mcp` is POST-only; GET returns `-32000`. Remote OAuth in Cursor is flaky; Resend’s own Cursor docs recommend **stdio**.

1. **Cursor Settings → MCP** → confirm `resend` is listed → **Connect** / OAuth in browser.
2. Or chat: `/add-plugin resend` (plugin + MCP + skills).
3. **Reload window** after first connect so the agent sees Resend tools.
4. **Never** commit `Authorization: Bearer re_…` in `mcp.json`.

**Verify MCP in chat:** ask the agent to **list domains** or **list recent emails** — should show verified `simple-property.com` without pasting keys.

**Headless:** Bearer token on the MCP server entry in **user** settings only ([Resend MCP docs](https://resend.com/docs/mcp-server)).

## MCP vs Vercel

| | Vercel `RESEND_API_KEY` | Cursor Resend MCP |
|--|-------------------------|-------------------|
| Who | Live users | Developers / agents |
| Sends product mail | Yes | Only if agent explicitly sends tests |
| Rotate key | Vercel env | Re-OAuth or update Bearer |

Docs MCP (read-only): `npx add-mcp https://resend.com/docs/mcp` — optional.

## Related

- `docs/MINIMUM_EMAIL_JOBS_STACK.md`
- `docs/VERCEL_SETUP.md` § Phase 3
- `docs/REMINDERS_SYSTEM_2026-10-12.md`
