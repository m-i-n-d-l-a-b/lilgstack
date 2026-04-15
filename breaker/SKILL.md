# /breaker — Test

**Role:** Systematically break the app. Root-cause-first on bugs. Real browser QA. If it can't be fixed in 3 tries, escalate — don't guess.

---

## Mode Selection

AskUserQuestion:
> Which mode?
> **A)** Root-cause a specific bug or error
> **B)** QA the running app in a browser

---

## Mode A: Root Cause Investigation

**Iron Law: NO FIXES WITHOUT ROOT CAUSE.**

Fixing a symptom without understanding the cause creates a second bug. Every fix must start with a confirmed root cause statement.

### Phase 1: Collect Symptoms

Read the error message, stack trace, or reproduction steps. If unclear, AskUserQuestion for the exact error and the last known-good state.

### Phase 2: Trace the Code Path

```bash
# Find all callers and definitions
grep -rn "<function/type/variable from error>" --include="*.ts" --include="*.go" --include="*.rs" --include="*.py" . 2>/dev/null | head -20
```

Read the relevant files. Follow the data from entry point to failure point.

### Phase 3: Check Recent Changes

```bash
git log --oneline -20 -- <affected-file-1> <affected-file-2>
```

Was this working before a recent commit? Check the diff on the most suspicious commit.

### Phase 4: Reproduce Deterministically

Do NOT write a fix until you can reproduce the bug consistently. If you can't reproduce it, say so and ask for more context.

### Pattern Table

| Pattern | Signature |
|---------|-----------|
| Race condition | Intermittent, timing-dependent, disappears under debugger |
| Null propagation | `TypeError: cannot read property X of undefined/null` |
| State corruption | Partial updates, data appears inconsistent across reads |
| Integration failure | Timeout, unexpected status code from external service |
| Config drift | Works locally, breaks in staging or production |

### 3-Strike Rule

If 3 hypotheses fail without finding the root cause, stop guessing. AskUserQuestion:

> "3 hypotheses failed without a confirmed root cause. Options:
> **A)** Add logging/assertions at the suspected boundary and share the output
> **B)** Pair debug step-by-step — I'll guide the investigation
> **C)** Check the library's issue tracker — this may be a known bug"

### Fix Protocol

Once root cause is confirmed:
1. Fix the root cause, not the symptom
2. Minimal diff — don't refactor surrounding code
3. Add a regression test that would have caught this
4. Commit: `git commit -m "[fix] root cause: <summary>"`

---

## Mode B: Browser QA

### Setup

Find the browse binary:

```bash
_B=$(find ~/.claude -name browse -type f 2>/dev/null | sort | head -1)
[ -z "$_B" ] && echo "browse not found — run the gstack setup script first" && exit 1
echo "browse: $_B"
```

AskUserQuestion for the app URL if not known.

### QA Loop

```bash
$_B goto <url>
$_B snapshot
```

Walk critical paths in this order:
1. **Auth flow** — sign up, sign in, sign out, wrong password
2. **Core feature** — the primary action the app exists to do
3. **Error states** — what happens with invalid inputs, empty states, network errors
4. **Edge inputs** — long strings, special characters, zero/negative numbers, empty fields

For each bug found:
- Severity: P1 (broken flow), P2 (wrong behavior), P3 (cosmetic/minor)
- Screenshot: `$_B snapshot`
- Exact reproduction steps

### Fix Loop

For each P1 bug:
1. Find the source, apply the fix
2. `$_B goto <url> && $_B snapshot` — verify fixed in browser
3. If still broken after 3 attempts: stop fixing, escalate in report

For P2/P3: batch into one AskUserQuestion with all findings.

### QA Report

```
QA COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Critical paths:  N/M passing
P1 bugs fixed:   N
P1 escalated:    N  ← needs human review
P2/P3 open:      N
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Rules

- Never fix a symptom without a confirmed root cause
- One atomic commit per fix — never bundle multiple fixes
- Max 3 fix attempts per bug before escalating
- Never revert a fix and try the same approach again — change approach on strike 2
- If the app isn't running, say so immediately instead of guessing at browser output
