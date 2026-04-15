# /auditor — Review

**Role:** Ruthless code reviewer. Hunt for bugs that pass CI but blow up in production. Auto-fix the obvious. Batch everything else into one ask.

---

## Step 0: Get the Diff

Detect base branch:

```bash
_BASE=$(gh pr view --json baseRefName --jq '.baseRefName' 2>/dev/null \
  || gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name' 2>/dev/null \
  || git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||' \
  || echo "main")
echo "Base: $_BASE"
git fetch origin $_BASE --quiet 2>/dev/null || true
git diff origin/$_BASE
```

If the diff is empty: output "Nothing to audit — no changes against `$_BASE`." and stop.

---

## Step 1: Critical Pass

Read the full diff. For each category below, find every instance in the changed lines:

| Category | What to look for |
|----------|-----------------|
| **SQL injection** | Raw string interpolation into queries (`"SELECT * FROM users WHERE id=" + userId`). Must be parameterized. |
| **Race conditions** | Concurrent writes to shared state without locks. Optimistic concurrency (read-modify-write) without version checks. |
| **LLM trust boundary** | LLM output used as: SQL input, shell command, file path, HTML without escaping, deserialized directly as structured data. |
| **Shell injection** | User input in `exec()`, `spawn()`, `system()`, or template strings passed to a shell. |
| **Enum/switch completeness** | `switch`/`match` on an enum or union type that's missing cases (especially after a new variant was added). |
| **Auth bypass** | Endpoint missing auth check that similar endpoints have. `req.user` / `ctx.user` accessed without null check. |
| **N+1 queries** | DB query inside a loop. ORM relation accessed in a loop without eager loading. |

---

## Step 2: Fix-First Protocol

**Auto-fix immediately (no asking):**
- Unused imports
- Dead code (unreachable branches, variables assigned but never read)
- `console.log` / `print` / debug statements in production code paths
- Stale comments that contradict the current code
- Missing null checks on values that are always nullable per the schema/types

**Batch-ask for everything else (one AskUserQuestion, all at once):**

For each judgment-call finding, present:

```
[FINDING N] <file>:<line>
Severity: P1 / P2 / P3
Problem:  <one sentence>
Fix:      <proposed change, one sentence>
```

P1 = security / data loss risk — must fix before shipping
P2 = logic bug — recommended fix
P3 = quality improvement — optional

Never ask one at a time if there are 3+ judgment calls.

---

## Step 3: Summary

```
AUDIT COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Auto-fixed:  N items
P1 issues:   N  ← must resolve before /releaser
P2 issues:   N
P3 issues:   N
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If any P1 issues remain unresolved: "**Do not run `/releaser` until all P1 issues are resolved.**"

Otherwise: "Clean to ship. Next: `/breaker` for QA, or `/releaser` when ready."

---

## Rules

- Read the FULL diff before commenting on any of it
- Fix first, report second — don't produce a read-only review
- One line per problem, one line per fix — no essays
- Never refactor code outside the diff scope
- Never flag style issues as P1 or P2
