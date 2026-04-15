# gstack — Sprint Stack

gstack is a set of focused agent skills for rapid shipping. Seven agents, one workflow: Think → Plan → Build → Review → Test → Ship → Reflect. Start with `/interrogator`. End with `/archivist`.

## The 7-Agent Workflow

| Skill | Role | When to use |
|-------|------|------------|
| `/interrogator` | **Think** — Six forcing questions before any code is written. Outputs a framing doc. | Start of every feature. Forces the actual problem to the surface. |
| `/architect` | **Plan** — Locks data flow, schema, auth boundary, edge cases. Requires approval. | After interrogator approves the framing. Before any code is written. |
| `/maker` | **Build** — Turns the blueprint into production-ready code. Max 5 refinement rounds. | After architect's blueprint is approved. |
| `/auditor` | **Review** — Critical security/quality pass. Auto-fixes mechanical issues. | After maker. Before shipping. |
| `/breaker` | **Test** — Root-cause debugging and real browser QA. 3-strike escalation. | After auditor. When something is broken or needs QA. |
| `/releaser` | **Ship** — Non-interactive: tests, PATCH bump, CHANGELOG, push, PR. | When the code is ready to land. |
| `/archivist` | **Reflect** — Updates stale docs, polishes CHANGELOG, runs retro. | After releaser. End of every sprint. |

## Utilities

| Skill | What it does |
|-------|-------------|
| `/browse` | Headless browser — real Chromium, real clicks, ~100ms/command. |
| `/gstack-upgrade` | Update gstack to the latest version. |
| `/setup-deploy` | Configure deployment — writes `~/.gstack/deploy-config.json`. |
| `/health` | Code quality dashboard. |
| `/open-gstack-browser` | Launch the GStack Browser with sidebar. |

## Build commands

```bash
bun install              # install dependencies
bun test                 # run tests (free, <5s)
bun run build            # generate docs + compile binaries
bun run gen:skill-docs   # regenerate browse/design SKILL.md from templates
bun run skill:check      # health dashboard for all skills
```

## Key conventions

- The 7 agent skills (`interrogator`, `architect`, `maker`, `auditor`, `breaker`, `releaser`, `archivist`) are hand-authored SKILL.md files — no `.tmpl` template needed.
- `browse/SKILL.md` and `design/SKILL.md` are still generated from `.tmpl` templates. Edit the template, not the output.
- The browse binary provides headless browser access. Use `$B <command>` in skills.
- Each agent hands off explicitly to the next: follow the workflow in order for best results.
