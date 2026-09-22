# Git & audit troubleshooting · Simple-Property

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
