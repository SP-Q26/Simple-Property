# Lane isolation · Deposit Desk vs SPQ / WeWeb

**Simple Property Tools** is **not** a WeWeb export product. It does not use branch `weweb-export`, WeWeb MCP canvas, or the **SP-Q26/SPQ** monorepo deploy path.

| | **This repo** (`Simple-Property`) | **SPQ** (`SP-Q26/SPQ`) |
|--|-----------------------------------|-------------------------|
| Product | Deposit Desk · `simple-property.com` | Signal Prime terminal · `spquant.com` |
| Stack | Static `web/` + Vercel serverless `/api` | WeWeb export → Vercel |
| Git branch | **`main` only** (production) | `main` prod · `weweb-export` preview |
| Cursor workspace | Open **`simple-property`** folder | Open **`SPQ`** root only for terminal work |
| Agent work | Audits/smokes here · push **`origin main`** | Do not mix Deposit Desk commits into SPQ |

**Rule:** Agents working on **simple-property.com** stay in **this repository**. Do not checkout `weweb-export`, patch `public/data/*.json`, or leave dirty trees in SPQ “for convenience.”

**MCP:** Resend / Stripe plugins are **user-level** in Cursor (`~/.cursor/mcp.json` or Settings → MCP). Config snippets for Deposit Desk live in **`docs/RESEND_MCP_CURSOR.md`** in this repo — not `SPQ/docs/`.

**Full production send:** `docs/FULL_SEND_STRIPE.md` · `npm run full-send`
