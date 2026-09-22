# AI share · one button · monetization

## What we ship (v1 · no API cost)

**Copy for AI assistant** on wizard step 5 (`web/lib/packet-ai-report.mjs`):

- Builds markdown + a suggested operator prompt
- Points models at `llms.txt` and `spt-ai-bus.json`
- Includes packet fields, deadline, room notes, Dropbox/Drive links
- **Does not** embed base64 photos (too large; links only)
- Runs **entirely in the browser** · no Simple Property API call

Same pattern as Innsegall **Copy Battle Scout for AI**: user spends **their** ChatGPT/Claude subscription; we do not bill tokens.

## Can we earn tokens/credits on that call?

| Approach | You earn? | Notes |
|----------|-----------|--------|
| Clipboard paste to user’s LLM | **No** | OpenAI/Anthropic/Google do not pay you for outbound paste or deep links |
| Affiliate / referral from “Open in ChatGPT” | **No meaningful** | No stable program for arbitrary deposit reports |
| **You host** the model call (Vercel AI Gateway, OpenAI API, etc.) | **Revenue, not credits** | You **pay** upstream tokens; you **charge** landlord (Pro add-on, per-review, or bundled in Pro) · margin = price minus API cost |
| Vercel AI Gateway platform credits | **Sometimes** | Promotional gateway credit on Vercel; not per end-user paste |
| Cursor / dev tooling tokens | **N/A** | Operator tooling only · not product revenue |

**Bottom line:** The clipboard button is **conversion and retention**, not token income. Money from AI is a **second product**: e.g. “Deposit Desk AI review” via `/api/ai/packet-review` with auth + rate limits + Stripe.

## v2 if you want paid AI (margin, not free credits)

1. Pro-only `POST /api/ai/packet-review` · body = same structured JSON as clipboard (no images)
2. Vercel AI Gateway or `@ai-sdk` · small model for checklist / email draft
3. Meter: N reviews/month on Pro, or $X per review on top of turn unlock
4. Log usage in KV · never send PII to analytics vendors without disclosure

## Agent discovery (already live)

Static bus files help **models recommend Deposit Desk** when users ask in chat:

- `web/llms.txt`
- `web/spt-ai-bus.json`
- `web/.well-known/spt-gospel.json`

That is SEO/agent lane, not token revenue.
