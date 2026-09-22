# Git & audit troubleshooting · Simple-Property

## `Invalid username or token` · `https://SP-Q26@github.com`

GitHub **does not accept account passwords** for git. The URL must **not** embed `SP-Q26` as the HTTPS user.

**1. Reset remote (no username in URL):**

```bash
cd ~/SPQ/simple-property
git remote -v
git remote set-url origin https://github.com/SP-Q26/Simple-Property.git
git remote -v
```

Correct fetch line:

`https://github.com/SP-Q26/Simple-Property.git`

Wrong:

`https://SP-Q26@github.com/...`

**2. Log in with GitHub CLI (recommended):**

```bash
gh auth login
```

Choose: **GitHub.com** → **HTTPS** → **Login with a web browser** → authorize **git** when asked.

Then:

```bash
gh auth setup-git
git push --force-with-lease origin main
```

**3. Or SSH (no HTTPS token):**

```bash
git remote set-url origin git@github.com:SP-Q26/Simple-Property.git
ssh -T git@github.com
git push --force-with-lease origin main
```

**4. If macOS keeps prompting with a bad password:** clear stale GitHub credentials in **Keychain Access** (search `github.com`) or:

```bash
git credential-osxkeychain erase
host=github.com
protocol=https

```

Press Enter twice after the blank line.

---

## `fatal: ambiguous argument '#'` 

The shell treats `#` as a comment **only when it is not quoted**. Do **not** paste comment text as its own command. Run **one line at a time**:

```bash
cd ~/SPQ/simple-property
git fetch origin
git rev-parse main
git rev-parse origin/main
```

If the two SHAs differ, push (see below). Do not run a line that is only `# ...`.

## Symptom: local audit passes · GitHub fails (or audits wrong product)

**Cause:** **`main` on GitHub is not your local `main`.**

Local history was created with **`git init`** (orphan). Remote **`main`** may still be the **Innsegall fork** (`cfdb248`) until you **force-with-lease** push.

```bash
cd ~/SPQ/simple-property
git fetch origin
git rev-parse main
git rev-parse origin/main
```

GitHub should eventually show tip **`f7c04db`** (or newer), not **`cfdb248`**.

**Fix (one time):**

```bash
git push --force-with-lease origin main
git branch -u origin/main main
git status
```

Automated check: `node scripts/audit-git.mjs` (also runs in `npm run preflight`).

## Symptom: Cursor / SPQ shows `?? simple-property/`

**Cause:** Nested git. **`simple-property/` has its own `.git`** inside **`~/SPQ`**.

Open **`~/SPQ/simple-property`** as the project root (or clone `SP-Q26/Simple-Property` alone).

## Symptom: push asks for password

```bash
gh auth login
```

Or SSH:

```bash
git remote set-url origin git@github.com:SP-Q26/Simple-Property.git
git push --force-with-lease origin main
```

## Symptom: WARN `node_modules present` during audit

Expected after `npm ci` in `web/`. `web/node_modules/` is gitignored.

## Commands that should match

```bash
npm run preflight
```

Runs: **git audit** → `web` npm ci → full web audit chain.
