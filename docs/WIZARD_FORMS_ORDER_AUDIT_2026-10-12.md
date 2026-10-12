# Wizard & forms order audit · 2026-10-12

Not legal advice. Operator + product audit for **turnover time** (target: ~20 minutes saved vs spreadsheet + Word + calendar math).

## Verdict: step order is correct

The five-step sequence matches how landlords actually close a turn and how disputes get defended:

| Step | Label | Why this position |
|------|--------|-------------------|
| 1 | Property | State + address set **jurisdiction** (30 vs 45 vs FL two-step). Must be first. |
| 2 | Turnover | **Surrender** starts the statutory clock; deposit + tenant ID the packet. |
| 3 | Move-out | **Itemized withholds** before export (what you owe in writing). |
| 4 | Move-in proof | **Optional** defense evidence; after withhold math so you are not blocked on photos. |
| 5 | Export | **Landlord mailing identity**, signatures, print/mail, paywall. |

Deep link `/app?turnover=1` opens at **step 2** with turnover mode (3-room grid) but still expects property on step 1 when you tab back or use **Duplicate last**.

Automated gate: `node scripts/audit-wizard-forms.mjs` (also in `npm run audit`).

---

## Are users forced to repeat data?

| Data | Entered | Repeated? | Notes |
|------|---------|-----------|--------|
| Property address | Step 1 | No | `/logs` uses separate “unit/address” per log entry (different product). |
| City | Step 1 | Sometimes | City **preset** can auto-fill city; manual city field still available. |
| Tenant name | Step 2 | **Signature only** | Step 5 “tenant printed name” auto-fills from step 2; edit if mail name differs. |
| Tenant email | Step 2 | **Send copy (Pro)** | Step 5 email block pre-fills from step 2; one field, not re-typed. |
| Landlord name/email/address | Step 5 | **Signature** | Landlord printed name auto-fills from landlord name. **Reminders** default to landlord email; checkbox **Property managed** reveals **PM email** for reminder delivery only (packet still uses landlord block). |
| Deposit / deductions | Steps 2–3 | **Preview only** | Step 5 tables are read-only summaries, not re-entry. |
| Move-in photos | Step 4 | No | Optional album link OR room grid; not asked again on export. |

Nothing in the wizard **blocks Continue** on empty fields (speed over gatekeeping). Risk: users can reach export with missing surrender; deadline box tells them to fix step 2.

---

## Speed paths (minutes saved)

| Action | Saves |
|--------|--------|
| `/app?turnover=1&step=2` | Skips marketing; lands on surrender. |
| **Today** (surrender) | One click vs date picker. |
| **Full deposit return** | Clears withholds · **jumps to export** (step 5); tab 4 if you add proof later. |
| **Skip to export** (step 4) | Skips room grid when folder link empty. |
| **Duplicate last** | Reuses property + landlord; only new tenant/surrender/deductions. |
| **Deduction quick-add** | +Cleaning / +Damage / +Unpaid rent rows. |
| **Enter** in inputs | Advances steps 1–4; step 5 **Done** finishes. |
| Step tabs | Jump within `wizardMaxStep` (no re-walk). |
| **Copy for AI** | Paste structured packet into an LLM you already pay for. |
| Watermarked **Preview print** | Free layout check before unlock. |

**Repeat turn on same building:** Duplicate last → step 2 → surrender today → deductions → Done ≈ minimal path.

---

## Step 5 density (export)

Export is intentionally busy (deadline tools, mail route, paywall, previews, Pro email). Read order in UI:

1. One-line packet summary  
2. Landlord mail fields (first time landlord block appears)  
3. Deadline + Calendar / ICS / Sheets  
4. Mail-ready checklist + **mail proof** (date, method, tracking)  
5. Paywall or Pro tools  
6. Statement + full packet preview  
7. Signatures (auto-filled)  
8. Save + optional **Schedule emails** (uses landlord email above)

**Not forced:** mail proof, reminders, tenant email send, room photos, lease dates.

---

## Other site forms

### `/logs` (operator logs)

Three tabs, same pattern each: **unit → date → who/what → status → notes → photo links**. No cross-tab duplicate; not linked to wizard draft.

### `/feedback`

Order: category → optional state/city → optional email → message → honeypot. Correct for triage.

### `/pricing` magic link

Email-only; separate from packet wizard.

---

## Gaps & follow-ups (not shipped in this audit)

1. **Hard validation** optional mode (“cannot export without surrender”) for users who want guardrails.  
2. **Step 2 landlord return address** for states that require forwarding address on the statement (today: landlord address only on step 5).  
3. **Florida 15-day claim notice** as its own date field (today: copy + 30-day export discipline).  
4. **NC interim day 30** reminder as second calendar event.  
5. **Load saved packet** always opens step 1; `?packet_id=&step=5` deep link skips that for return visits.

---

## Manual smoke (5 min)

1. `/app?turnover=1&state=IL&city=chicago-il` → surrender **Today** → **Full deposit return** → lands step 5 → **Done** scrolls to preview.  
2. **Duplicate last** after saving a packet → step 2 with same street, blank tenant.  
3. Step 5: tenant signature matches step 2 name without retyping.  
4. `/logs` → add maintenance row → CSV export.
