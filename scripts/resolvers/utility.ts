import type { TemplateContext } from './types';

export function generateSlugEval(ctx: TemplateContext): string {
  return `eval "$(${ctx.paths.binDir}/gstack-slug 2>/dev/null)"`;
}

export function generateSlugSetup(ctx: TemplateContext): string {
  return `eval "$(${ctx.paths.binDir}/gstack-slug 2>/dev/null)" && mkdir -p ~/.gstack/projects/$SLUG`;
}

export function generateBaseBranchDetect(_ctx: TemplateContext): string {
  return `## Step 0: Detect platform and base branch

First, detect the git hosting platform from the remote URL:

\`\`\`bash
git remote get-url origin 2>/dev/null
\`\`\`

- If the URL contains "github.com" → platform is **GitHub**
- If the URL contains "gitlab" → platform is **GitLab**
- Otherwise, check CLI availability:
  - \`gh auth status 2>/dev/null\` succeeds → platform is **GitHub** (covers GitHub Enterprise)
  - \`glab auth status 2>/dev/null\` succeeds → platform is **GitLab** (covers self-hosted)
  - Neither → **unknown** (use git-native commands only)

Determine which branch this PR/MR targets, or the repo's default branch if no
PR/MR exists. Use the result as "the base branch" in all subsequent steps.

**If GitHub:**
1. \`gh pr view --json baseRefName -q .baseRefName\` — if succeeds, use it
2. \`gh repo view --json defaultBranchRef -q .defaultBranchRef.name\` — if succeeds, use it

**If GitLab:**
1. \`glab mr view -F json 2>/dev/null\` and extract the \`target_branch\` field — if succeeds, use it
2. \`glab repo view -F json 2>/dev/null\` and extract the \`default_branch\` field — if succeeds, use it

**Git-native fallback (if unknown platform, or CLI commands fail):**
1. \`git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||'\`
2. If that fails: \`git rev-parse --verify origin/main 2>/dev/null\` → use \`main\`
3. If that fails: \`git rev-parse --verify origin/master 2>/dev/null\` → use \`master\`

If all fail, fall back to \`main\`.

Print the detected base branch name. In every subsequent \`git diff\`, \`git log\`,
\`git fetch\`, \`git merge\`, and PR/MR creation command, substitute the detected
branch name wherever the instructions say "the base branch" or \`<default>\`.

---`;
}

export function generateDeployBootstrap(_ctx: TemplateContext): string {
  return `\`\`\`bash
# Check for persisted deploy config in CLAUDE.md
DEPLOY_CONFIG=$(grep -A 20 "## Deploy Configuration" CLAUDE.md 2>/dev/null || echo "NO_CONFIG")
echo "$DEPLOY_CONFIG"

# If config exists, parse it
if [ "$DEPLOY_CONFIG" != "NO_CONFIG" ]; then
  PROD_URL=$(echo "$DEPLOY_CONFIG" | grep -i "production.*url" | head -1 | sed 's/.*: *//')
  PLATFORM=$(echo "$DEPLOY_CONFIG" | grep -i "platform" | head -1 | sed 's/.*: *//')
  echo "PERSISTED_PLATFORM:$PLATFORM"
  echo "PERSISTED_URL:$PROD_URL"
fi

# Auto-detect platform from config files
[ -f fly.toml ] && echo "PLATFORM:fly"
[ -f render.yaml ] && echo "PLATFORM:render"
([ -f vercel.json ] || [ -d .vercel ]) && echo "PLATFORM:vercel"
[ -f netlify.toml ] && echo "PLATFORM:netlify"
[ -f Procfile ] && echo "PLATFORM:heroku"
([ -f railway.json ] || [ -f railway.toml ]) && echo "PLATFORM:railway"

# Detect deploy workflows
for f in $(find .github/workflows -maxdepth 1 \\( -name '*.yml' -o -name '*.yaml' \\) 2>/dev/null); do
  [ -f "$f" ] && grep -qiE "deploy|release|production|cd" "$f" 2>/dev/null && echo "DEPLOY_WORKFLOW:$f"
  [ -f "$f" ] && grep -qiE "staging" "$f" 2>/dev/null && echo "STAGING_WORKFLOW:$f"
done
\`\`\`

If \`PERSISTED_PLATFORM\` and \`PERSISTED_URL\` were found in CLAUDE.md, use them directly
and skip manual detection. If no persisted config exists, use the auto-detected platform
to guide deploy verification. If nothing is detected, ask the user via AskUserQuestion
in the decision tree below.

If you want to persist deploy settings for future runs, suggest the user run \`/setup-deploy\`.`;
}

export function generateQAMethodology(_ctx: TemplateContext): string {
  return `## Modes

### Diff-aware (automatic when on a feature branch with no URL)

This is the **primary mode** for developers verifying their work. When the user says \`/qa\` without a URL and the repo is on a feature branch, automatically:

1. **Analyze the branch diff** to understand what changed:
   \`\`\`bash
   git diff main...HEAD --name-only
   git log main..HEAD --oneline
   \`\`\`

2. **Identify affected areas** from the changed files:
   - Controller/route files → which URL paths they serve
   - View/template/component files → which pages render them
   - Model/service files → which pages use those models (check controllers that reference them)
   - API endpoints → test them with curl
   - Static pages (markdown, HTML) → check their source directly

3. **Run the existing test suite** for changed files:
   Read CLAUDE.md for the test command. If not found, auto-detect:
   \`\`\`bash
   [ -f package.json ] && grep -E '"test"' package.json | head -3
   [ -f Makefile ] && grep "^test" Makefile | head -3
   [ -f pyproject.toml ] && grep "pytest" pyproject.toml | head -3
   \`\`\`
   Run the test suite targeting changed files where possible.

4. **Test API endpoints with curl** (for backend/API changes):
   \`\`\`bash
   # Check endpoint status
   curl -s -o /dev/null -w "%{http_code}" http://localhost:<port>/api/<endpoint>
   # Check response body
   curl -s http://localhost:<port>/api/<endpoint> | head -20
   \`\`\`

5. **For UI/visual changes:** Ask the user to navigate to the affected page in their browser
   and share a screenshot if visual verification is needed. Use AskUserQuestion:
   "I can see the diff touches [component/page]. Can you open it in your browser and share a
   screenshot? Use the attachment button or paste an image directly."

6. **Cross-reference with commit messages and PR description** to understand *intent* — what
   should the change do? Verify it actually does that.

7. **Check TODOS.md** (if it exists) for known bugs or issues related to the changed files.
   If a TODO describes a bug that this branch should fix, add it to your test plan.

8. **Report findings** scoped to the branch changes:
   - "Changes tested: N endpoints/components affected by this branch"
   - For each: does it work? Test output or curl response as evidence.
   - Any regressions found by the test suite?

**If the user provides a URL with diff-aware mode:** Use curl to verify the endpoint responds
correctly, and ask the user for a screenshot for visual verification.

### Full (default when URL is provided)
Systematic API and test coverage check. Verify all reachable endpoints respond correctly.
Document issues with curl output as evidence. Produce health score.

### Quick (\`--quick\`)
Run the test suite only. No network or browser interaction needed.

### Regression (\`--regression <baseline>\`)
Run full mode, then load \`baseline.json\` from a previous run. Diff: which issues are fixed?
Which are new? What's the score delta? Append regression section to report.

---

## Workflow

### Phase 1: Initialize

1. Create output directories
2. Copy report template from \`qa/templates/qa-report-template.md\` to output dir
3. Start timer for duration tracking

### Phase 2: Test Suite

Run the project's test suite:
\`\`\`bash
# Read CLAUDE.md to find the test command, then run it
# Common: bun test, npm test, pytest, go test ./..., cargo test
\`\`\`

Note: pass/fail count, any failing tests, and relevant error output.

### Phase 3: API Verification

For each API endpoint affected by the diff:

\`\`\`bash
# Status check
curl -s -o /dev/null -w "HTTP %{http_code} (%{time_total}s)" <endpoint-url>
# Response check
curl -s <endpoint-url> | head -30
\`\`\`

**Detect framework** (note in report metadata):
- \`package.json\` has \`next\` → Next.js
- \`config/routes.rb\` exists → Rails
- \`wp-config.php\` exists → WordPress
- \`manage.py\` exists → Django

### Phase 4: Visual Verification (UI changes)

For changes to UI components, pages, or templates: ask the user to share a screenshot.

Use AskUserQuestion: "The diff touches [component/page/route]. Please open it in your browser
and share a screenshot so I can verify the visual change looks correct."

Document what the screenshot shows and whether it matches the intended change.

**Quick mode:** Skip visual verification. Run test suite only.

### Phase 5: Document

Document each issue **immediately when found** — don't batch them.

For each issue, include:
- **What failed:** test name, curl output, or screenshot description
- **Repro steps:** exact commands or user actions
- **Expected vs actual:** what should happen vs what happened

**Write each issue to the report immediately** using the template format from \`qa/templates/qa-report-template.md\`.

### Phase 6: Wrap Up

1. **Compute health score** using the rubric below
2. **Write "Top 3 Things to Fix"** — the 3 highest-severity issues
3. **Update severity counts** in the summary table
4. **Fill in report metadata** — date, duration, endpoints tested, tests run, framework
5. **Save baseline** — write \`baseline.json\` with:
   \`\`\`json
   {
     "date": "YYYY-MM-DD",
     "healthScore": N,
     "issues": [{ "id": "ISSUE-001", "title": "...", "severity": "...", "category": "..." }],
     "categoryScores": { "functional": N, "tests": N, "ux": N }
   }
   \`\`\`

**Regression mode:** After writing the report, load the baseline file. Compare:
- Health score delta
- Issues fixed (in baseline but not current)
- New issues (in current but not baseline)
- Append the regression section to the report

---

## Health Score Rubric

Compute each category score (0-100), then take the weighted average.

### Tests (weight: 30%)
- All pass → 100
- 1-3 failures → 60
- 4-10 failures → 30
- 10+ failures → 0

### API Endpoints (weight: 25%)
- All 2xx → 100
- Each 4xx/5xx → -20 (minimum 0)

### Per-Category Scoring (Visual, Functional, UX, Content)
Each category starts at 100. Deduct per finding:
- Critical issue → -25
- High issue → -15
- Medium issue → -8
- Low issue → -3
Minimum 0 per category.

### Weights
| Category | Weight |
|----------|--------|
| Tests | 30% |
| API Endpoints | 25% |
| Functional | 20% |
| UX | 15% |
| Content | 10% |

### Final Score
\`score = Σ (category_score × weight)\`

---

## Framework-Specific Guidance

### Next.js
- Check for build errors: \`npm run build 2>&1 | tail -20\`
- Test API routes: \`curl -s http://localhost:3000/api/<route>\`
- Check for TypeScript errors: \`npx tsc --noEmit 2>&1 | head -20\`

### Rails
- Run specs: \`bundle exec rspec\` or \`bundle exec rails test\`
- Check for migration issues: \`bundle exec rails db:migrate:status\`
- Test routes: \`bundle exec rails routes | grep <controller>\`

### Django
- Run tests: \`python manage.py test\`
- Check for migration issues: \`python manage.py showmigrations\`
- Test endpoints: \`curl -s http://localhost:8000/<path>\`

### General
- Run linter: check CLAUDE.md for lint command
- Check for type errors if TypeScript/mypy is configured
- Run any integration tests in the test suite

---

## Important Rules

1. **Repro is everything.** Every issue needs curl output, test output, or a user-provided screenshot.
2. **Verify before documenting.** Retry the issue once to confirm it's reproducible, not a fluke.
3. **Never include credentials.** Write \`[REDACTED]\` for passwords in repro steps.
4. **Write incrementally.** Append each issue to the report as you find it. Don't batch.
5. **Evidence over assertion.** "Test X fails with error Y" is evidence. "The login is broken" is not.
6. **Test like a user.** Use realistic data. Walk through complete workflows end-to-end.
7. **Depth over breadth.** 5-10 well-documented issues with evidence > 20 vague descriptions.
8. **Never delete output files.** Reports accumulate — that's intentional.
9. **Visual verification via user.** For UI changes, always ask for a screenshot rather than guessing.
10. **Test suite is authoritative.** A passing test suite with no new failures is strong evidence of correctness.`;
}

export function generateCoAuthorTrailer(ctx: TemplateContext): string {
  const { getHostConfig } = require('../../hosts/index');
  const hostConfig = getHostConfig(ctx.host);
  return hostConfig.coAuthorTrailer || 'Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>';
}

export function generateChangelogWorkflow(_ctx: TemplateContext): string {
  return `## CHANGELOG (auto-generate)

1. Read \`CHANGELOG.md\` header to know the format.

2. **First, enumerate every commit on the branch:**
   \`\`\`bash
   git log <base>..HEAD --oneline
   \`\`\`
   Copy the full list. Count the commits. You will use this as a checklist.

3. **Read the full diff** to understand what each commit actually changed:
   \`\`\`bash
   git diff <base>...HEAD
   \`\`\`

4. **Group commits by theme** before writing anything. Common themes:
   - New features / capabilities
   - Performance improvements
   - Bug fixes
   - Dead code removal / cleanup
   - Infrastructure / tooling / tests
   - Refactoring

5. **Write the CHANGELOG entry** covering ALL groups:
   - If existing CHANGELOG entries on the branch already cover some commits, replace them with one unified entry for the new version
   - Categorize changes into applicable sections:
     - \`### Added\` — new features
     - \`### Changed\` — changes to existing functionality
     - \`### Fixed\` — bug fixes
     - \`### Removed\` — removed features
   - Write concise, descriptive bullet points
   - Insert after the file header (line 5), dated today
   - Format: \`## [X.Y.Z.W] - YYYY-MM-DD\`
   - **Voice:** Lead with what the user can now **do** that they couldn't before. Use plain language, not implementation details. Never mention TODOS.md, internal tracking, or contributor-facing details.

6. **Cross-check:** Compare your CHANGELOG entry against the commit list from step 2.
   Every commit must map to at least one bullet point. If any commit is unrepresented,
   add it now. If the branch has N commits spanning K themes, the CHANGELOG must
   reflect all K themes.

**Do NOT ask the user to describe changes.** Infer from the diff and commit history.`;
}
