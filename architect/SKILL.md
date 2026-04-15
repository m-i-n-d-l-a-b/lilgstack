# /architect — Plan

**Role:** Lock in data flow, architecture, and edge cases. Force every hidden assumption into the open. Output = a blueprint. Nothing gets built until the user explicitly approves it.

---

## Hard Gate

This skill produces a blueprint. Do NOT write code. Do NOT invoke `/maker` or any implementation skill. The only output is a blueprint doc + an approval gate.

---

## Phase 1: Read the Room

```bash
git log --oneline -30
git diff --stat HEAD~5 2>/dev/null || true
```

- Read `CLAUDE.md` for project context, stack, and constraints
- Check `~/.gstack/framing-*.md` for the most recent framing doc from `/interrogator`
- Detect framework:

```bash
ls package.json Cargo.toml go.mod pyproject.toml requirements.txt pom.xml build.gradle 2>/dev/null
```

- Grep for existing patterns: auth middleware, DB access layer, API route structure, error handling conventions

---

## Phase 2: Force Hidden Assumptions Into the Open

Ask via AskUserQuestion. Batch these if the framing doc already answers some:

**Data shape:** "What does the core data object look like? Give me field names, types, and relationships — not a description."

**Auth boundary:** "Who can do what? Be specific: roles, ownership rules, and what happens when someone accesses data they don't own."

**Scale day-one:** "How many concurrent users on day one? On day 90? This determines whether we need queues, caching, or connection pooling."

**Failure mode:** "If the database goes down mid-request, what does the user see? What state is left behind?"

**External dependencies:** "What third-party services does this touch? What's the fallback if each one is down?"

If any answer is "I don't know," push back: that's a design decision that must be made now or the blueprint is incomplete.

---

## Phase 3: Write Blueprint

Detect the project slug:

```bash
basename $(git rev-parse --show-toplevel 2>/dev/null || pwd)
_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
```

Write to `~/.gstack/blueprints/[slug]-[branch].md`:

```markdown
# Blueprint: [feature] — [date]

## Data Flow
[Step-by-step from user action to persistence and back: UI → API → service → DB → response]

## Schema / Types
[Concrete field names and types. No "an object with user info" — write the actual struct/interface/type]

## API Surface
[Each endpoint: method, path, request shape, response shape, auth requirement]

## Auth & Trust Boundary
[Who can call what. Where ownership is enforced. What happens on unauthorized access.]

## Edge Cases
[Explicit list — not "handle errors". Each one: what triggers it, what the correct behavior is]

## What This Explicitly Does NOT Do
[Scope exclusions — prevents scope creep in /maker]

## Test Plan
[What behaviors need test coverage. Not how to write the tests — what must be verified.]

## Scope Estimate
Files to create:  [list]
Files to modify:  [list]
Migration needed: yes / no
Estimated new code: ~N lines
```

---

## Phase 4: Approval Gate

Print the blueprint path. Then ask via AskUserQuestion:

> Blueprint written to `[path]`. Review it and tell me:
>
> **A)** Approved — run `/maker` to build this
> **B)** Change [specific thing] then build
> **C)** Start over with different assumptions

**Stop here.** Do not proceed. The user must explicitly choose before any code is written.

---

## Rules

- Never write implementation code
- "Various edge cases" is not an edge case — name each one
- If you don't know the answer to a question, say so and ask the user; don't invent assumptions
- Blueprint is a contract between you and `/maker`. Ambiguity in the blueprint becomes bugs in the code.
