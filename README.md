# gstack

> "I don't think I've typed like a line of code probably since December, basically, which is an extremely large change." — [Andrej Karpathy](https://fortune.com/2026/03/21/andrej-karpathy-openai-cofounder-ai-agents-coding-state-of-psychosis-openclaw/), No Priors podcast, March 2026

When I heard Karpathy say this, I wanted to find out how. How does one person ship like a team of twenty? Peter Steinberger built [OpenClaw](https://github.com/openclaw/openclaw) — 247K GitHub stars — essentially solo with AI agents. The revolution is here. A single builder with the right tooling can move faster than a traditional team.

I'm [Garry Tan](https://x.com/garrytan), President & CEO of [Y Combinator](https://www.ycombinator.com/). I've worked with thousands of startups — Coinbase, Instacart, Rippling — when they were one or two people in a garage. Before YC, I was one of the first eng/PM/designers at Palantir, cofounded Posterous (sold to Twitter), and built Bookface, YC's internal social network.

**gstack is my answer.** I've been building products for twenty years, and right now I'm shipping more code than I ever have. In the last 60 days: **600,000+ lines of production code** (35% tests), **10,000-20,000 lines per day**, part-time, while running YC full-time. Here's my last sprint across 3 projects: **140,751 lines added, 362 commits, ~115k net LOC** in one week.

**2026 — 1,237 contributions and counting:**

![GitHub contributions 2026 — 1,237 contributions, massive acceleration in Jan-Mar](docs/images/github-2026.png)

**2013 — when I built Bookface at YC (772 contributions):**

![GitHub contributions 2013 — 772 contributions building Bookface at YC](docs/images/github-2013.png)

Same person. Different era. The difference is the tooling.

**gstack is how I do it.** Seven focused sprint agents that take you from problem validation to shipped, documented code. Think → Plan → Build → Audit → Break → Release → Archive. Every agent reads the previous one's output. Nothing falls through the cracks. All slash commands, all Markdown, all free, MIT license.

This is my open source software factory. I use it every day. I'm sharing it because these tools should be available to everyone.

Fork it. Improve it. Make it yours. And if you want to hate on free open source software — you're welcome to, but I'd rather you just try it first.

**Who this is for:**
- **Founders and CEOs** — especially technical ones who still want to ship
- **First-time Claude Code users** — structured roles instead of a blank prompt
- **Tech leads and staff engineers** — rigorous review, QA, and release automation on every PR

## Quick start

1. Install gstack (30 seconds — see below)
2. Run `/interrogator` — six forcing questions that validate the problem before you write code
3. Run `/architect` — lock the blueprint, then approve it
4. Run `/maker` — production-ready code from the blueprint, no stubs, no TODOs
5. Run `/auditor` — security + quality pass, auto-fixes mechanical issues
6. Run `/breaker` — root-cause debug + browser QA
7. Run `/releaser` — tests, version bump, PR in one command
8. Stop there. You'll know if this is for you.

## Install — 30 seconds

**Requirements:** [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Git](https://git-scm.com/), [Bun](https://bun.sh/) v1.0+, [Node.js](https://nodejs.org/) (Windows only)

### Step 1: Install on your machine

Open Claude Code and paste this. Claude does the rest.

> Install gstack: run **`git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup`** then add a "gstack" section to CLAUDE.md that says to use the /browse skill from gstack for all web browsing, never use mcp\_\_claude-in-chrome\_\_\* tools, and lists the available skills: /interrogator, /architect, /maker, /auditor, /breaker, /releaser, /archivist, /browse, /open-gstack-browser, /gstack-upgrade, /health, /setup-deploy. Then ask the user if they also want to add gstack to the current project so teammates get it.

### Step 2: Team mode — auto-update for shared repos (recommended)

Every developer installs globally, updates happen automatically:

```bash
cd ~/.claude/skills/gstack && ./setup --team
```

Then bootstrap your repo so teammates get it:

```bash
cd <your-repo>
~/.claude/skills/gstack/bin/gstack-team-init required  # or: optional
git add .claude/ CLAUDE.md && git commit -m "require gstack for AI-assisted work"
```

No vendored files in your repo, no version drift, no manual upgrades. Every Claude Code session starts with a fast auto-update check (throttled to once/hour, network-failure-safe, completely silent).

> **Contributing or need full history?** The commands above use `--depth 1` for a fast install. If you plan to contribute or need full git history, do a full clone instead:
> ```bash
> git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> ```

### OpenClaw

OpenClaw spawns Claude Code sessions via ACP, so every gstack skill just works
when Claude Code has gstack installed. Paste this to your OpenClaw agent:

> Install gstack: run `git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup` to install gstack for Claude Code. Then add a "Coding Tasks" section to AGENTS.md that says: when spawning Claude Code sessions for coding work, tell the session to use gstack skills. Include these examples — security + quality pass: "Load gstack. Run /auditor", debug a bug: "Load gstack. Run /breaker", browser QA: "Load gstack. Run /breaker (QA mode)", build a feature end-to-end: "Load gstack. Run /interrogator → /architect → /maker → /releaser", validate an idea before building: "Load gstack. Run /interrogator → /architect. Save the blueprint, don't implement."

**After setup, just talk to your OpenClaw agent naturally:**

| You say | What happens |
|---------|-------------|
| "Fix the typo in README" | Simple — Claude Code session, no gstack needed |
| "Run a security audit on this repo" | Spawns Claude Code with `Run /auditor` |
| "Build me a notifications feature" | Spawns Claude Code with /interrogator → /architect → /maker → /releaser |
| "Help me plan the v2 API redesign" | Spawns Claude Code with /interrogator → /architect, saves blueprint |

See [docs/OPENCLAW.md](docs/OPENCLAW.md) for advanced dispatch routing and
the gstack-lite/gstack-full prompt templates.

### Native OpenClaw Skills (via ClawHub)

Four methodology skills that work directly in your OpenClaw agent, no Claude Code
session needed. Install from ClawHub:

```
clawhub install gstack-openclaw-office-hours gstack-openclaw-ceo-review gstack-openclaw-investigate gstack-openclaw-retro
```

| Skill | What it does |
|-------|-------------|
| `gstack-openclaw-office-hours` | Product interrogation with 6 forcing questions |
| `gstack-openclaw-ceo-review` | Strategic challenge with 4 scope modes |
| `gstack-openclaw-investigate` | Root cause debugging methodology |
| `gstack-openclaw-retro` | Weekly engineering retrospective |

These are conversational skills. Your OpenClaw agent runs them directly via chat.

### Other AI Agents

gstack works on 8 AI coding agents, not just Claude. Setup auto-detects which
agents you have installed:

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack
cd ~/gstack && ./setup
```

Or target a specific agent with `./setup --host <name>`:

| Agent | Flag | Skills install to |
|-------|------|-------------------|
| OpenAI Codex CLI | `--host codex` | `~/.codex/skills/gstack-*/` |
| OpenCode | `--host opencode` | `~/.config/opencode/skills/gstack-*/` |
| Cursor | `--host cursor` | `~/.cursor/skills/gstack-*/` |
| Factory Droid | `--host factory` | `~/.factory/skills/gstack-*/` |
| Slate | `--host slate` | `~/.slate/skills/gstack-*/` |
| Kiro | `--host kiro` | `~/.kiro/skills/gstack-*/` |

**Want to add support for another agent?** See [docs/ADDING_A_HOST.md](docs/ADDING_A_HOST.md).
It's one TypeScript config file, zero code changes.

## See it work

```
You:    I want to add rate limiting to my API.
You:    /interrogator
Claude: Six forcing questions.
        Demand Reality: what endpoints are actually being abused? Show me
        the logs.
        [you share the numbers — /auth and /upload, 3x normal traffic]
        Narrowest Wedge: you don't need rate limiting everywhere. You
        need it on two endpoints.
        [writes framing doc → ~/.gstack/framing-rate-limit-2026-04-15.md]

You:    /architect
Claude: Surfaces hidden assumptions: Redis available? Token bucket or
        leaky bucket? Per-IP or per-user? SLA when Redis is down —
        hard fail or degrade gracefully?
        Blueprint: token bucket, per-user, Redis with in-memory fallback,
        429 with Retry-After header.
        → Approve this blueprint to proceed.

You:    Approve.

Claude: [/maker builds 847 lines across 7 files]
        Middleware, Redis client, in-memory fallback, tests, CLAUDE.md
        update. No stubs. No TODOs.

You:    /auditor
Claude: [AUTO-FIXED] X-Forwarded-For not forwarded past load balancer.
        [ASK] Race condition in Redis fallback during cold start →
        you approve fix.

You:    /breaker
Claude: [opens real browser, hammers the rate-limited endpoints 100x]
        All flows pass. Regression test written. Green.

You:    /releaser
        Tests: 38 → 47 (+9 new). Version: 1.4.2 → 1.4.3.
        PR: github.com/you/app/pull/87
```

Seven commands, end to end. Every agent knew what the previous one did. That is not a copilot. That is a process.

## The sprint

gstack is a process, not a collection of tools. Seven agents, run in order:

**Think → Plan → Build → Audit → Break → Release → Archive**

Each agent reads the previous one's output. `/interrogator` writes a framing doc that `/architect` reads. `/architect` writes a blueprint that `/maker` builds from. `/auditor` and `/breaker` run against what `/maker` shipped. `/releaser` ships it. `/archivist` keeps your docs honest after the fact.

| Agent | What they do |
|-------|--------------|
| `/interrogator` | **Validate the problem first.** Six forcing questions: Demand Reality, Status Quo, Desperate Specificity, Narrowest Wedge, Direct Observation, Future-Fit. Rips your premise apart before a line of code is written. Writes a framing doc to `~/.gstack/`. |
| `/architect` | **Lock the blueprint.** Surfaces every hidden assumption — data shape, auth boundary, scale, failure modes, external deps. Writes a concrete implementation plan with an explicit approval gate. Nothing gets built until you say go. |
| `/maker` | **Build production-ready code.** Reads the blueprint and implements it to match your existing conventions. No stubs, no TODOs. Max 5 refinement rounds before escalating. |
| `/auditor` | **Security + quality pass.** SQL injection, race conditions, LLM trust boundary violations, shell injection, enum completeness, auth bypass, N+1 queries. Auto-fixes mechanical issues. Batches all judgment calls into one question. |
| `/breaker` | **Two modes: debug or QA.** Root-cause investigation (Iron Law: no fixes without confirmed root cause, 3-strike escalation) and browser QA (real Chromium, walks critical paths, atomic fix commits). |
| `/releaser` | **Ship without ceremony.** Runs your test suite, auto-bumps PATCH version, writes the CHANGELOG entry, pushes, opens a PR. Pings canary URL if deploy config exists. |
| `/archivist` | **Keep the docs honest.** Reads the git diff, flags stale sections in README, ARCHITECTURE, CONTRIBUTING, and CLAUDE.md. Rewrites CHANGELOG entries into user-facing language. Runs a 3-question retro. |

### Power tools

| Skill | What it does |
|-------|-------------|
| `/browse` | **Real browser.** Persistent Chromium daemon, ~100-200ms per command after the first call. Real clicks, real screenshots, real cookies. |
| `/open-gstack-browser` | **GStack Browser.** Headed Chromium with sidebar agent, anti-bot stealth, auto model routing (Sonnet for actions, Opus for analysis), and one-click cookie import. |
| `/health` | **Code quality dashboard.** Skill validation, coverage, and repo health in one command. |
| `/setup-deploy` | **Deploy configurator.** One-time setup — detects your platform, production URL, and deploy commands. Used by `/releaser`. |
| `/gstack-upgrade` | **Self-updater.** Upgrade gstack to latest, shows what changed. |

## Parallel sprints

gstack works well with one sprint. It gets interesting with ten running at once.

**`/breaker` was the unlock.** Claude Code saying *"I SEE THE ISSUE"* and then actually fixing it in a real browser, generating a regression test, and verifying the fix — that changed how I work. The agent has eyes now.

**Test everything.** `/releaser` bootstraps test frameworks from scratch if your project doesn't have one. Every run produces a coverage audit. Every `/breaker` bug fix generates a regression test. 100% test coverage is the goal — tests make vibe coding safe instead of yolo coding.

**`/archivist` is the engineer you never had.** It reads every doc file in your project, cross-references the diff, and flags everything that drifted. README, ARCHITECTURE, CONTRIBUTING, CLAUDE.md — all kept honest. `/releaser` calls it automatically, so docs stay current without an extra command.

**Real browser mode.** `/open-gstack-browser` launches GStack Browser, an AI-controlled Chromium with anti-bot stealth, custom branding, and the sidebar extension baked in. Sites like Google and NYTimes work without captchas. The menu bar says "GStack Browser" instead of "Chrome for Testing." Your regular Chrome stays untouched. All existing browse commands work unchanged. `$B disconnect` returns to headless. The browser stays alive as long as the window is open — no idle timeout killing it while you're working.

**Sidebar agent — your AI browser assistant.** Type natural language in the Chrome side panel and a child Claude instance executes it. "Navigate to the settings page and screenshot it." "Fill out this form with test data." "Go through every item in this list and extract the prices." The sidebar auto-routes to the right model: Sonnet for fast actions (click, navigate, screenshot) and Opus for reading and analysis. Each task gets up to 5 minutes. The sidebar agent runs in an isolated session, so it won't interfere with your main Claude Code window. One-click cookie import right from the sidebar footer.

**Personal automation.** The sidebar agent isn't just for dev workflows. Example: "Browse my kid's school parent portal and add all the other parents' names, phone numbers, and photos to my Google Contacts." Two ways to get authenticated: (1) log in once in the headed browser, your session persists, or (2) click the "cookies" button in the sidebar footer to import cookies from your real Chrome. Once authenticated, Claude navigates the directory, extracts the data, and creates the contacts.

**Browser handoff when the AI gets stuck.** Hit a CAPTCHA, auth wall, or MFA prompt? `$B handoff` opens a visible Chrome at the exact same page with all your cookies and tabs intact. Solve the problem, tell Claude you're done, `$B resume` picks up right where it left off. The agent even suggests it automatically after 3 consecutive failures.

## 10-15 parallel sprints

gstack is powerful with one sprint. It is transformative with ten running at once.

[Conductor](https://conductor.build) runs multiple Claude Code sessions in parallel — each in its own isolated workspace. One session running `/interrogator` on a new idea, another running `/maker` on an approved blueprint, a third in `/breaker` debugging a bug, a fourth in `/releaser` opening a PR, and six more at different stages. All at the same time. I regularly run 10-15 parallel sprints — that's the practical max right now.

The sprint structure is what makes parallelism work. Without a process, ten agents is ten sources of chaos. With a process — think, plan, build, audit, break, release, archive — each agent knows exactly what to do and when to stop. You manage them the way a CEO manages a team: check in on the decisions that matter, let the rest run.

### Voice input (AquaVoice, Whisper, etc.)

gstack agents have voice-friendly trigger phrases. Say what you want naturally —
"validate this idea", "lock the blueprint", "do the security pass", "open a browser and test it", "ship it" — and the
right agent activates. You don't need to remember slash command names or acronyms.

## Uninstall

### Option 1: Run the uninstall script

If gstack is installed on your machine:

```bash
~/.claude/skills/gstack/bin/gstack-uninstall
```

This handles skills, symlinks, global state (`~/.gstack/`), project-local state, browse daemons, and temp files. Use `--keep-state` to preserve config and analytics. Use `--force` to skip confirmation.

### Option 2: Manual removal (no local repo)

If you don't have the repo cloned (e.g. you installed via a Claude Code paste and later deleted the clone):

```bash
# 1. Stop browse daemons
pkill -f "gstack.*browse" 2>/dev/null || true

# 2. Remove per-skill symlinks pointing into gstack/
find ~/.claude/skills -maxdepth 1 -type l 2>/dev/null | while read -r link; do
  case "$(readlink "$link" 2>/dev/null)" in gstack/*|*/gstack/*) rm -f "$link" ;; esac
done

# 3. Remove gstack
rm -rf ~/.claude/skills/gstack

# 4. Remove global state
rm -rf ~/.gstack

# 5. Remove integrations (skip any you never installed)
rm -rf ~/.codex/skills/gstack* 2>/dev/null
rm -rf ~/.factory/skills/gstack* 2>/dev/null
rm -rf ~/.kiro/skills/gstack* 2>/dev/null
rm -rf ~/.openclaw/skills/gstack* 2>/dev/null

# 6. Remove temp files
rm -f /tmp/gstack-* 2>/dev/null

# 7. Per-project cleanup (run from each project root)
rm -rf .gstack .gstack-worktrees .claude/skills/gstack 2>/dev/null
rm -rf .agents/skills/gstack* .factory/skills/gstack* 2>/dev/null
```

### Clean up CLAUDE.md

The uninstall script does not edit CLAUDE.md. In each project where gstack was added, remove the `## gstack` and `## Skill routing` sections.

### Playwright

`~/Library/Caches/ms-playwright/` (macOS) is left in place because other tools may share it. Remove it if nothing else needs it.

---

Free, MIT licensed, open source. No premium tier, no waitlist.

I open sourced how I build software. You can fork it and make it your own.

> **We're hiring.** Want to ship 10K+ LOC/day and help harden gstack?
> Come work at YC — [ycombinator.com/software](https://ycombinator.com/software)
> Extremely competitive salary and equity. San Francisco, Dogpatch District.

## Docs

| Doc | What it covers |
|-----|---------------|
| [Builder Ethos](ETHOS.md) | Builder philosophy: Boil the Lake, Search Before Building, three layers of knowledge |
| [Architecture](ARCHITECTURE.md) | Design decisions and system internals |
| [Browser Reference](BROWSER.md) | Full command reference for `/browse` |
| [Contributing](CONTRIBUTING.md) | Dev setup, testing, contributor mode, and dev mode |
| [Changelog](CHANGELOG.md) | What's new in every version |

## Privacy & Telemetry

gstack includes **opt-in** usage telemetry to help improve the project. Here's exactly what happens:

- **Default is off.** Nothing is sent anywhere unless you explicitly say yes.
- **On first run,** gstack asks if you want to share anonymous usage data. You can say no.
- **What's sent (if you opt in):** skill name, duration, success/fail, gstack version, OS. That's it.
- **What's never sent:** code, file paths, repo names, branch names, prompts, or any user-generated content.
- **Change anytime:** `gstack-config set telemetry off` disables everything instantly.

Data is stored in [Supabase](https://supabase.com) (open source Firebase alternative). The schema is in [`supabase/migrations/`](supabase/migrations/) — you can verify exactly what's collected. The Supabase publishable key in the repo is a public key (like a Firebase API key) — row-level security policies deny all direct access. Telemetry flows through validated edge functions that enforce schema checks, event type allowlists, and field length limits.

**Local analytics are always available.** Run `gstack-analytics` to see your personal usage dashboard from the local JSONL file — no remote data needed.

## Troubleshooting

**Skill not showing up?** `cd ~/.claude/skills/gstack && ./setup`

**`/browse` fails?** `cd ~/.claude/skills/gstack && bun install && bun run build`

**Stale install?** Run `/gstack-upgrade` — or set `auto_upgrade: true` in `~/.gstack/config.yaml`

**Want shorter commands?** `cd ~/.claude/skills/gstack && ./setup --no-prefix` — switches from `/gstack-breaker` to `/breaker`. Your choice is remembered for future upgrades.

**Want namespaced commands?** `cd ~/.claude/skills/gstack && ./setup --prefix` — switches from `/breaker` to `/gstack-breaker`. Useful if you run other skill packs alongside gstack.

**Codex says "Skipped loading skill(s) due to invalid SKILL.md"?** Your Codex skill descriptions are stale. Fix: `cd ~/.codex/skills/gstack && git pull && ./setup --host codex` — or for repo-local installs: `cd "$(readlink -f .agents/skills/gstack)" && git pull && ./setup --host codex`

**Windows users:** gstack works on Windows 11 via Git Bash or WSL. Node.js is required in addition to Bun — Bun has a known bug with Playwright's pipe transport on Windows ([bun#4253](https://github.com/oven-sh/bun/issues/4253)). The browse server automatically falls back to Node.js. Make sure both `bun` and `node` are on your PATH.

**Claude says it can't see the skills?** Make sure your project's `CLAUDE.md` has a gstack section. Add this:

```
## gstack
Use /browse from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.
Available skills: /interrogator, /architect, /maker, /auditor, /breaker, /releaser,
/archivist, /browse, /open-gstack-browser, /gstack-upgrade, /health, /setup-deploy.
```

## License

MIT. Free forever. Go build something.
