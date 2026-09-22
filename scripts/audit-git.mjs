#!/usr/bin/env node
/**
 * Git audit · Simple-Property · identity, remote sync, orphan history, hygiene.
 * Safe to run in CI after checkout (warns if remote not pushed yet).
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: root, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], ...opts }).trim();
}

function tryRun(cmd) {
  try {
    return run(cmd);
  } catch {
    return null;
  }
}

let fail = 0;
let warn = 0;

function ok(msg) {
  console.log("ok:", msg);
}
function bad(msg) {
  console.error("GIT FAIL:", msg);
  fail++;
}
function note(msg) {
  console.warn("GIT WARN:", msg);
  warn++;
}

console.log("── Simple Property · git audit ──\n");

if (!existsSync(join(root, ".git"))) {
  bad("not a git repository — cd into simple-property clone");
  process.exit(1);
}

const name = tryRun("git config user.name");
const email = tryRun("git config user.email");
if (!email || !email.endsWith("@users.noreply.github.com")) {
  bad(`user.email must be GitHub noreply (got ${email || "unset"})`);
} else ok(`identity ${name} <${email}>`);

if (email && (email.includes(".lan") || email.includes(".local"))) {
  bad("machine-local email in git config");
}

for (const line of tryRun("git log -3 --format=%ae")?.split("\n").filter(Boolean) || []) {
  if (!line.endsWith("@users.noreply.github.com")) bad(`recent commit author email: ${line}`);
  if (/@gmail|@icloud|@me\.com|@hotmail|@proton/i.test(line)) bad(`personal email in history: ${line}`);
}
ok("recent commit authors use noreply");

const remote = tryRun("git remote get-url origin");
if (!remote || !remote.includes("SP-Q26/Simple-Property")) {
  bad(`origin should be SP-Q26/Simple-Property (got ${remote || "none"})`);
} else ok("origin → Simple-Property");

const canonicalSsh = "git@github.com:SP-Q26/Simple-Property.git";
if (remote === canonicalSsh) {
  ok("origin uses SSH (agent + terminal push)");
} else if (remote?.startsWith("https://")) {
  bad("origin is HTTPS — use SSH to avoid SP-Q26@ password prompts (see docs/GIT_AGENT_CONNECTION.md)");
  note(`git remote set-url origin ${canonicalSsh}`);
}

if (process.env.CI !== "true" && remote?.startsWith("git@")) {
  const sshProbe = tryRun("ssh -o BatchMode=yes -T git@github.com 2>&1");
  if (sshProbe?.includes("successfully authenticated")) ok("GitHub SSH auth");
  else note("SSH key not available in this shell — agent push needs full permissions");
}

tryRun("git fetch origin --quiet") || tryRun("git fetch origin");

const localSha = tryRun("git rev-parse main");
const remoteSha = tryRun("git rev-parse origin/main");
const counts = tryRun("git rev-list --left-right --count origin/main...main");
const [behind, ahead] = counts ? counts.split("\t").map(Number) : [0, 0];

if (localSha === remoteSha) {
  ok("main matches origin/main");
} else {
  const mergeBase = tryRun("git merge-base main origin/main");
  if (!mergeBase) {
    note(`orphan history — local Deposit Desk vs fork on GitHub (ahead ${ahead}, behind ${behind})`);
    note("push once: git push --force-with-lease origin main");
  } else if (ahead > 0) {
    note(`main is ${ahead} commit(s) ahead of origin/main — git push origin main`);
  }
  if (behind > 0 && !mergeBase) {
    note(`origin has ${behind} commit(s) not in local (fork root) — force-with-lease replaces them`);
  }
}

const upstream = tryRun("git rev-parse --abbrev-ref main@{upstream}");
if (!upstream || upstream === "main@{upstream}") {
  note("main has no upstream — after push: git branch -u origin/main main");
} else ok(`upstream ${upstream}`);

const porcelain = tryRun("git status --porcelain");
if (porcelain) {
  note("uncommitted changes (commit or stash before deploy)");
  console.log(porcelain.split("\n").slice(0, 8).join("\n"));
} else ok("working tree clean");

const staged = tryRun("git diff --cached --name-only");
if (staged) {
  if (/node_modules|(^|\/)\.env(?!\.example)/.test(staged)) bad("staged files include node_modules or .env");
  const diff = tryRun("git diff --cached");
  const files = staged.split("\n").filter((f) => f && !f.endsWith("scripts/audit-git.mjs"));
  const diffForSecrets = files
    .map((f) => tryRun(`git diff --cached -- ${JSON.stringify(f).slice(1, -1)}`))
    .join("\n");
  if (
    /@gmail|@icloud|sk_live/i.test(diffForSecrets) ||
    /whsec_[a-zA-Z0-9]{10,}/i.test(diffForSecrets)
  ) {
    bad("staged diff may contain secrets or personal email");
  }
}

if (existsSync(join(root, "../.git")) && tryRun("git -C .. rev-parse --show-toplevel") !== root) {
  note("nested inside SPQ repo — use simple-property as workspace root to avoid ?? noise");
}

console.log(fail ? `\n${fail} git gate failure(s)` : `\nGit audit ${warn ? `OK (${warn} warn)` : "OK"}`);
process.exit(fail ? 1 : 0);
