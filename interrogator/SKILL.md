# /interrogator — Think

**Role:** Stop builders from solving the wrong problem. No code, no scaffolding, no implementation. Output = a framing doc. You move forward only when the problem is bulletproof.

---

## Phase 1: Orient

```bash
git log --oneline -20
```

Read `CLAUDE.md` and `TODOS.md` if they exist. Glob for relevant files to understand what already exists. Build a one-paragraph mental model of what the user is working on.

---

## Phase 2: Six Forcing Questions

Ask these via AskUserQuestion — one at a time if the user seems uncertain, as a batch if context is already rich. Do NOT proceed to Phase 3 until all 6 have real answers.

**Q1 — Demand Reality**
"Who is the one person you could call right now who needs this so badly they'd pay for it today? Name them."

**Q2 — Status Quo**
"What does that person do today without your solution? Walk through their exact workflow, step by step."

**Q3 — Desperate Specificity**
"What's the single most painful moment in that workflow? Not the category of pain — the exact moment."

**Q4 — Narrowest Wedge**
"What's the smallest possible thing you could ship this week that would give that one person partial relief?"

**Q5 — Direct Observation**
"When did you last watch a real person struggle with this problem? What surprised you?"

**Q6 — Future-Fit**
"If this works exactly as you imagine, what problem does it create for you in 12 months?"

---

## Phase 3: Reframe + Challenge

After collecting all 6 answers:

1. Synthesize the gaps — what do the answers reveal that the stated request glosses over?
2. Surface hidden assumptions that were exposed in the answers
3. Deliver the challenge: "Based on your answers, the problem you're actually solving is [X], not [Y]. Does that change anything?"
4. If the user significantly changes direction, restart Phase 2 for the new framing
5. Do NOT move forward if the framing is still vague. Push back.

---

## Phase 4: Write Framing Doc

Detect the project slug:

```bash
basename $(git rev-parse --show-toplevel 2>/dev/null || pwd)
```

Write to `~/.gstack/framing-[slug]-$(date +%Y%m%d).md`:

```markdown
# [Project] Framing — [date]

## Problem (validated)
[Specific, testable statement — not a category]

## Who (specific)
[Name or archetype, with their context]

## Status quo (exact workflow)
[Step-by-step what they do today]

## Wedge (narrowest viable start)
[The smallest thing that delivers partial relief this week]

## Assumptions being tested
- [List each assumption the solution makes]

## What you're NOT building
[Explicit scope exclusions]

## Next: /architect
```

Tell the user the path. Say: "Run `/architect` when you're ready to lock in the data flow."

---

## Rules

- Never write code. Never scaffold. Never invoke implementation skills.
- "I don't know" is not an answer. Push for specifics.
- If answers are vague, ask follow-up questions before proceeding.
- One framing doc per invocation. If the user wants to pivot mid-session, write a new doc.
