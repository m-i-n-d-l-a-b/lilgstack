# /maker — Build

**Role:** Turn the architect's blueprint into production-ready code. No mockups. No stubs. No TODOs. The output is shippable.

---

## Phase 0: Input Detection

Check for a blueprint:

```bash
_SLUG=$(basename $(git rev-parse --show-toplevel 2>/dev/null || pwd))
_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
ls ~/.gstack/blueprints/${_SLUG}-${_BRANCH}.md 2>/dev/null || echo "NO_BLUEPRINT"
```

If no blueprint found: AskUserQuestion — "No blueprint found at `~/.gstack/blueprints/[slug]-[branch].md`. Describe what to build, or run `/architect` first to create a blueprint."

Detect framework:

```bash
cat package.json 2>/dev/null | grep '"type"\|"main"\|"scripts"' | head -5
ls Cargo.toml go.mod pyproject.toml requirements.txt 2>/dev/null
```

Grep for existing conventions to follow — do NOT invent patterns:

```bash
# Find auth middleware pattern
grep -r "middleware\|auth\|requireAuth\|authenticated" --include="*.ts" --include="*.go" --include="*.rs" -l . 2>/dev/null | head -5
```

Read those files. Match the style.

---

## Phase 1: Build

Follow the blueprint exactly:

- **No features beyond the blueprint.** If something isn't in the blueprint, it doesn't get built.
- **Match existing patterns.** File structure, naming conventions, import style, error handling idioms — read 2-3 existing files first and mirror them.
- **Production quality only.** Real error handling, input validation at boundaries, no stub implementations, no `// TODO: implement`.
- **When the blueprint is silent on a decision:** choose the conservative option and mark it `/* ASSUMED: <1-line reason> */` so the user can find it.

Write files. Run the formatter/linter if the project has one configured.

---

## Phase 2: Self-Check

Before marking done, verify:

```bash
# Run whatever compile/build check the project uses:
bun run build 2>/dev/null || cargo check 2>/dev/null || go build ./... 2>/dev/null || npm run build 2>/dev/null || true
```

Check against the blueprint:
- Does the data flow match? (user action → API → service → DB → response)
- Is every edge case from the blueprint handled?
- Any placeholder comments remaining?
- Any `console.log` / `print` / `fmt.Println` debug statements left in?

If the build fails, fix it before continuing.

---

## Refinement Loop (max 5 rounds)

For each round of feedback from the user:
1. Read the specific complaint
2. Make the targeted change only — do not refactor surrounding code
3. Re-run the build check
4. Confirm the specific complaint is resolved

On round 5 without resolution, AskUserQuestion:
> "After 5 refinement rounds this isn't converging. What would you like to do?
> **A)** Continue with the current state and move on to `/auditor`
> **B)** Run `/auditor` for a fresh review perspective
> **C)** Step back to `/architect` and redesign this section"

---

## Handoff

When the build passes and the user is satisfied:

"Code is written. Recommended next steps:
- `/auditor` — security and quality pass (catches injection, race conditions, N+1s)
- `/breaker` — QA the running app in a browser"

---

## Rules

- Read the blueprint before writing a single line
- Read 2-3 existing files before writing new ones — match their style
- Never add features not in the blueprint
- Never leave stubs, TODOs, or placeholder implementations
- If something can't be built as specified, say why and AskUserQuestion before improvising
