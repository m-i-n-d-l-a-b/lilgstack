# /releaser — Ship

**Role:** One command from approved code to live PR. Non-interactive. Tests, bump, changelog, push, PR. Only stops for failures that require a human decision.

---

## Pre-flight

```bash
_BASE=$(gh pr view --json baseRefName --jq '.baseRefName' 2>/dev/null \
  || gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name' 2>/dev/null \
  || git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||' \
  || echo "main")
_BRANCH=$(git branch --show-current)
echo "Base: $_BASE | Current: $_BRANCH"
```

If `_BRANCH` equals `_BASE`: abort — "You're on the base branch. Switch to a feature branch first."

Show what's shipping:

```bash
git diff $_BASE...$_BRANCH --stat
```

If the working tree is dirty, include uncommitted changes — they're part of this release.

---

## Step 1: Run Tests

Read `CLAUDE.md` for the test command. Fallback detection:

```bash
# Detect test command
[ -f package.json ] && grep '"test"' package.json | head -1
[ -f Cargo.toml ] && echo "cargo test"
[ -f go.mod ] && echo "go test ./..."
[ -f pyproject.toml ] && echo "pytest"
```

Run the test command. If tests fail:

AskUserQuestion:
> "Tests are failing. How do you want to proceed?
> **A)** Fix the failures and re-run `/releaser`
> **B)** Ship anyway — I'll note the failures in the PR body"

Pre-existing failures (failures that also exist on `_BASE`) do not block.

---

## Step 2: PATCH Bump (auto)

```bash
_VERSION=$(cat VERSION 2>/dev/null || echo "")
```

If `VERSION` exists:
- Increment the third segment: `1.2.3` → `1.2.4`
- Write the new version back to `VERSION`
- If the diff contains a new public API, breaking change, or removal: AskUserQuestion before bumping

If no `VERSION` file, skip silently.

---

## Step 3: CHANGELOG

```bash
git log $_BASE..$_BRANCH --oneline
```

Prepend to `CHANGELOG.md` (create it if missing):

```markdown
## [vX.Y.Z] — YYYY-MM-DD

- [bullet per commit, written in user-facing language — what changed, not how]
```

Never clobber existing CHANGELOG entries. Always prepend, never overwrite.

---

## Step 4: Commit + Push + PR

```bash
git add -A
git commit -m "release: vX.Y.Z"
git push -u origin $_BRANCH
```

Create the PR:

```bash
gh pr create \
  --title "<branch summary in plain English>" \
  --body "$(cat <<'EOF'
## What changed
[bullet summary from CHANGELOG entry]

## Tests
[pass / fail with count — include fail list if any were skipped]

## Notes
[any ASSUMED comments from /maker, any P2/P3 from /auditor left open]
EOF
)"
```

Print the PR URL.

---

## Step 5: Canary (if configured)

```bash
_DEPLOY_CFG=~/.gstack/deploy-config.json
[ -f "$_DEPLOY_CFG" ] && _URL=$(cat "$_DEPLOY_CFG" | grep '"url"' | head -1 | sed 's/.*"\(https[^"]*\)".*/\1/') || _URL=""
```

If `_URL` is set:

```bash
sleep 15  # wait for deploy to start
_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$_URL" 2>/dev/null || echo "000")
echo "Canary: $_URL → HTTP $_STATUS"
```

- `2xx` → "Deploy healthy."
- `5xx` → "Deploy returning errors — check logs before merging."
- `000` → "Could not reach deploy URL — check network or URL in `~/.gstack/deploy-config.json`."

If no deploy config: skip silently.

---

## Rules

- Non-interactive means non-interactive: do not ask for confirmation on things already decided
- Auto-pick PATCH unless there's a clear reason for MINOR/MAJOR
- Never force-push
- Never skip tests without explicit user consent
- If `gh` CLI is not authenticated, fail with: "Run `gh auth login` first."
