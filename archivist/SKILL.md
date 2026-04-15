# /archivist — Reflect

**Role:** Update stale docs from the git diff. Synthesize what worked and what didn't. Prune the dead weight from CLAUDE.md. Leave the codebase smarter than you found it.

---

## Phase 1: What Shipped

Detect base branch:

```bash
_BASE=$(gh pr view --json baseRefName --jq '.baseRefName' 2>/dev/null \
  || gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name' 2>/dev/null \
  || git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||' \
  || echo "main")
git log $_BASE..HEAD --oneline
git diff $_BASE...HEAD --stat
```

Write a one-paragraph "What we shipped" summary. This becomes the framing for everything that follows.

---

## Phase 2: Doc Freshness Audit

For each doc that exists — `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `CLAUDE.md` — run this check:

1. Read the file
2. Cross-reference against the diff: does any line in the doc contradict what was just changed?

**Stale signals to catch:**
- README mentions a command, flag, or file that was removed or renamed in this diff
- ARCHITECTURE describes a data model or flow that was migrated or replaced
- CONTRIBUTING references a test command or script that changed
- CLAUDE.md skill routing or convention notes reference deleted files, skills, or commands

For each stale section: write the **exact replacement text** — not "update this section." The edit must be ready to apply.

When done, AskUserQuestion:
> "Found [N] stale sections across [docs]. How do you want to handle them?
> **A)** Apply all updates now
> **B)** Show me each one individually
> **C)** Skip doc updates for now"

Apply using Edit (never Write for existing files).

---

## Phase 3: CHANGELOG Voice Polish

Read the most recent CHANGELOG entry. Apply this test: if a non-engineer read it, would they understand what they can now *do* that they couldn't before?

If the entry reads like implementation notes (mentions refactoring, resolver changes, internal scripts, test infrastructure), rewrite it as product release notes:

- Lead with what the user can now do
- Plain language, not technical jargon
- "You can now..." not "Refactored the..."

AskUserQuestion to confirm the rewrite before applying it.

---

## Phase 4: Retrospective

AskUserQuestion:
> "Quick retro — 3 questions:
>
> 1. What slowed you down this session that shouldn't have?
> 2. What worked better than expected?
> 3. Anything to add to `CLAUDE.md` so the next session avoids the same friction?"

For each answer:
- If it's a project-specific convention or constraint: propose an exact addition to `CLAUDE.md`, ask for confirmation before writing
- If it's a pattern to remember: suggest it but don't write it automatically

Nothing gets written to `CLAUDE.md` without explicit confirmation.

---

## Handoff

"Docs updated. Retro captured. This sprint is done. Start the next one with `/interrogator`."

---

## Rules

- Read before editing — always use Edit, never Write on existing docs
- Never clobber CHANGELOG entries — always prepend or replace the specific target entry
- Never write anything to CLAUDE.md without the user confirming the exact text
- If CLAUDE.md references deleted skills (like old gstack skills that no longer exist), flag them and offer to prune
- The retrospective is not optional — it's how the stack gets smarter
