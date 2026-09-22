# Connect git · Simple-Property (5 minutes)

You are **not** broken. You have **two different git worlds**:

| Repo | What it is | Branch you see in SPQ Cursor |
|------|------------|------------------------------|
| **`~/SPQ`** | Signal Prime / WeWeb export | `weweb-export` |
| **`~/SPQ/simple-property`** | Deposit Desk · **this product** | `main` (its **own** `.git`) |

Cursor opened **SPQ** shows `?? simple-property/` — that folder is a **separate repo**, not “disconnected SPQ.”

**GitHub today:** [SP-Q26/Simple-Property](https://github.com/SP-Q26/Simple-Property) **`main`** is still the old **fork** (`cfdb248`). Your **real work** is local only (`f7c04db` + 3 commits) until you push once with **force-with-lease**.

---

## Option A · Clean reconnect (recommended)

Use one folder = one repo. Stop nesting inside SPQ for daily work.

```bash
cd ~
mv ~/SPQ/simple-property ~/simple-property-backup
git clone https://github.com/SP-Q26/Simple-Property.git ~/Simple-Property
cd ~/Simple-Property
```

If clone is still Innsegall junk on `main`, replace remote with your backup:

```bash
rm -rf ~/Simple-Property/.git
cp -R ~/simple-property-backup/.git ~/Simple-Property/.git
cd ~/Simple-Property
git status
npm run audit:git
npm run preflight
```

Then **open `~/Simple-Property` in Cursor** (File → Open Folder), not `~/SPQ`.

---

## Option B · Stay in `~/SPQ/simple-property` (SSH — no `gh` or `brew`)

Your Mac already has a GitHub SSH key (`~/.ssh/id_ed25519`). Use **SSH remote** — do not use HTTPS prompts.

**Run one line at a time.** If Git asks for `Username`/`Password`, press **Ctrl+C** — you pasted multiple commands or HTTPS is still configured.

```bash
cd ~/SPQ/simple-property
git remote set-url origin git@github.com:SP-Q26/Simple-Property.git
ssh -T git@github.com
```

Expect: `Hi SP-Q26! You've successfully authenticated...`

```bash
git push --force-with-lease origin main
npm run audit:git
```

Expect: **`ok: main matches origin/main`**

HTTPS + **`gh auth login`** only if you install [GitHub CLI](https://cli.github.com) later. Cursor’s GitHub connection does **not** wire into Terminal `git` by itself.

**Do not** enter `SP-Q26` as HTTPS username — use your GitHub login, or switch to SSH above.

```bash
git rev-parse main
git rev-parse origin/main
```

The two SHAs should **match**.

---

## After reconnect

```bash
npm run preflight
```

GitHub **Actions → audit** should run on Deposit Desk, not Innsegall.

Vercel: project **Simple-Property**, root directory **`web`**, production branch **`main`**.

---

## Commands to avoid

- Do **not** run lines that start with `#` (comments) as commands — causes `ambiguous argument '#'`.
- Do **not** commit Deposit Desk from **`~/SPQ`** root on `weweb-export` — use **`simple-property`** repo only.
- Do **not** expect `git push` to work without **`gh auth login`** or SSH keys.

---

## Quick health check

```bash
cd ~/SPQ/simple-property
npm run audit:git
```

**OK + warnings about orphan/push** = local fine, GitHub not updated yet.  
**OK + “main matches origin/main”** = fully reconnected.
