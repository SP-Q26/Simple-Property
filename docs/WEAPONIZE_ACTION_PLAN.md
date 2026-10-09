# Weaponize Simple Property Tools · action plan (Oct 2026)

**North star:** Own **turnover + multi-state deposit compliance + counsel-hour economics**. Be the specialist layer that **hands off cleanly** to Innago, Avail, Baselane, bank/Zelle, and counsel. Expand **lanes** (tenant + landlord + AI) without becoming a rent-collection PM suite.

**Audit baseline:** `npm run audit` green (swarm ≥ 95, SEO, performance, stack handoff gate after this doc).

---

## 1. Lane law (what we refuse)

| We own | We do not own |
|--------|----------------|
| Surrender date → statutory clock (30/45/FL two-step, Chicago RLTO) | Monthly rent rails, tenant autopay, screening pipelines |
| Itemization, withhold lines, photo **links**, mail proof fields | Tenant maintenance portal (photos to plumber) |
| Packet JSON + PDF + Calendar/Sheets export | Escrow banking, ACH deposit **refund** to tenant |
| Operator `/logs` (internal ledger) | Full accounting GL |
| Guides + story warnings (“this could happen”) | Legal advice, lease negotiation |

**Positioning sentence:** Avail/Innago run the lease · **Deposit Desk runs the week the keys come back.**

**Economics anchor:** ~**$350/hr** Chicago counsel for organize-the-packet work vs **$29–49/turn** unlock.

---

## 2. Moat walls (double down)

### Wall A · Multi-state clocks
- Wizard + locale bar + statute index stay canonical.
- Every new state: deadline guide + itemization + checklist + **pain story** + `refresh-guide-story-warnings.mjs`.
- **Chicago vs suburban** explicit on step 1 (8-unit persona).

### Wall B · Packet as portable truth
- **Packet `.json` import/export** = handoff primitive (device, bookkeeper, future cloud).
- Print/PDF = counsel-ready artifact; colophon + mail fields on export.
- Roadmap: versioned `packetSchema` in export + validation on import.

### Wall C · Content factory
- Pain / law-watch / city / competitor **compare** pages (Innago, Avail, spreadsheet).
- Story blocks on guides (shipped).
- P0 compares: `deposit-desk-vs-innago-avail-turnover` (factual).

### Wall D · Agent + AI (retention, not PM)
- `llms.txt` + `spt-ai-bus.json` + step 5 **Copy for AI assistant** (no token spend on us).
- Paid lane later: Pro-only `/api/ai/packet-review` (checklist, letter draft) per `AI_SHARE_MONETIZATION.md`.

### Wall E · Stack honesty
- `/launch-stack` names PM tools for rent · **Deposit Desk for turnover**.
- Handoff checklist: what to copy from Avail/Innago into packet (surrender, deposit amount, forwarding address).

---

## 3. Handoff architecture (any system)

```text
[PM / bank / spreadsheet]  →  surrender + amounts + addresses  →  Deposit Desk wizard
                                                                      ↓
                                                            packet.json + PDF + .ics + CSV
                                                                      ↓
                    [counsel · small claims · tenant email · PM notes · Drive archive]
```

**Product rules**
1. No OAuth required to get value (paste + import JSON).
2. Export always includes: `schemaVersion`, state, city, surrender, deadline, line items, photo URLs, mail fields.
3. Import never silently drops fields (show diff / status).
4. Tenant-facing features **optional** later (read-only packet link, upload photos to Drive URL) without rent collection.

---

## 4. Phased execution

### Phase 0 · Now (weaponize surface) — this sprint
- [x] Stack handoff section on `/launch-stack` (Innago, Avail, bank).
- [x] Counsel-hour line on `/pricing`.
- [x] `audit-stack-handoff.mjs` in `npm run audit`.
- [x] `llms.txt` handoff + FL in wizard list fix.
- [x] Homepage FAQ door: “Honest limits” (4 risks + stack).
- [ ] Blog: Innago vs Avail vs Deposit Desk (turnover only).

### Phase 1 · Turnover depth (4–6 weeks)
- Packet schema v2 + import validation UI.
- Step 5 **Handoff sheet** (print): “From your PM: tenant name, unit, deposit held, move-out date.”
- C5 certified mail + C4 letter merge (lane map C4/C5).
- `/logs` CSV columns aligned with packet export (unit id).

### Phase 2 · Tenant lane (light touch)
- **Tenant packet upload** (no account): landlord sends link; tenant adds forwarding address + optional photo URLs only.
- Or: email template “what we need from you” generated from wizard.
- No rent pay · no maintenance portal (stay complementary).

### Phase 3 · AI (margin)
- Pro metered packet review API.
- “Before you mail” checklist generated from state + withhold lines.
- Bus files updated each release.

### Phase 4 · Distribution
- FB/community scripts (stack + $350 hr).
- Comparison SEO cluster.
- Referral from accountants / RE attorneys (packet PDF as deliverable).

---

## 5. Audit matrix (run every release)

| Gate | Command / script |
|------|------------------|
| Full swarm | `npm run audit` |
| Stack handoff copy | `audit-stack-handoff.mjs` |
| Guide story warnings | `audit-blog-guide-warnings.mjs` |
| Wizard + packet IO | `audit-wizard-speed.mjs` + manual smoke `/app?turnover=1` |
| Agent bus drift | `audit-agent-snapshot.mjs` |
| Prod smoke | `npm run smoke:prod` |

---

## 6. Metrics (not vanity)

- Preview → paid export conversion.
- Packets with **import** used (handoff signal).
- Guides → app with `?state=` from locale bar.
- Pro retention across **turnover season**.
- Feedback tickets mentioning Innago/Avail (integrate vs compete).

---

## 7. Canon updates

- Umbrella: **Simple Property Tools** · product family: **Deposit Desk** (core) + future lanes in `SMALL_PM_LANE_MAP.md`.
- Customer promise: **Itemize it. Date it. Never pay the fees.** (plural fees: statutory + counsel + PM tenant fees).
