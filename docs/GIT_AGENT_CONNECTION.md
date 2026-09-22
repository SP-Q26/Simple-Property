# Git connection · Cursor agent + your Mac

## Current canonical setup (verified)

| Check | Expected |
|-------|----------|
| `origin` | `git@github.com:SP-Q26/Simple-Property.git` |
| `ssh -T git@github.com` | `Hi SP-Q26! You've successfully authenticated...` |
| `git rev-parse main` = `git rev-parse origin/main` | Same SHA after push |
| `npm run audit:git` | **ok: main matches origin/main** |

HTTPS (`https://github.com/...`) prompts for username/password and fails with **`SP-Q26`** or **`Invalid username`**. This machine has **no `gh` / `brew`** in default PATH — **SSH is the supported path**.

## Cursor agent (Composer)

- Pushes and fetches run in a **sandbox** unless the agent requests **`all`** permissions.
- **Cursor → Connect GitHub** helps PR/issue features; **Terminal `git`** still uses **SSH keys** in `~/.ssh/`.
- Repo rule: `.cursor/rules/git-connection.mdc`

Agent pre-push:

```bash
cd ~/SPQ/simple-property
npm run audit:git
git push origin main
```

## You (Terminal)

**One line at a time.** If Git asks for Username/Password mid-block, **Ctrl+C** and fix remote:

```bash
cd ~/SPQ/simple-property
git remote set-url origin git@github.com:SP-Q26/Simple-Property.git
ssh -T git@github.com
git push origin main
npm run audit:git
```

## CI (GitHub Actions)

Uses `actions/checkout` + HTTPS token — not SSH. `audit-git` skips SSH probe when `CI=true`.

## If connection breaks again

1. `git remote -v` — must be **git@**, not **https://**
2. `npm run audit:git` — read FAIL vs WARN
3. `docs/GIT_TROUBLESHOOTING.md` — paste trap, keychain erase
