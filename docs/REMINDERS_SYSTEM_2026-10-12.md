# Deadline reminders · system audit · 2026-10-12

## Fully functional when (production)

| Layer | Requirement | Verified by |
|-------|-------------|-------------|
| **UI** | Step 5 · surrender set · Schedule emails | `audit-wizard-forms.mjs` |
| **API** | `POST /api/reminders/subscribe` | `audit-reminders-system.mjs` |
| **Email send** | `RESEND_API_KEY` + verified `SPT_EMAIL_FROM` domain | `resendConfigured()` |
| **Job queue** | `KV_REST_API_URL` + `KV_REST_API_TOKEN` (Upstash) | `kvConfigured()` · jobs in `rem:due` zset |
| **Cron** | Vercel cron → `/api/cron/deadline-reminders` daily 14:00 UTC | `vercel.json` · `CRON_SECRET` or `SPT_CRON_SECRET` |
| **Pro positioning** | Listed on pricing; wizard does not hard-block free users from scheduling (host env gates delivery) | product choice |

If Resend or KV is missing, the wizard shows a clear error (`email_not_configured` or `reminders_storage_not_configured`).

## PM-managed property

On export step, **Property managed** checkbox reveals **PM email**. Reminders go to PM; landlord name/email on the packet are unchanged.

Draft field: `reminders: { usePmEmail, pmEmail }` · included in packet JSON export/import.

## Not in scope

- SMS reminders  
- Gmail API (Resend only)  
- Server-side Pro gate on subscribe (entitlement could be added later)

See `docs/VERCEL_SETUP.md` for env matrix and `docs/PHASE3.md` for operator smoke.
