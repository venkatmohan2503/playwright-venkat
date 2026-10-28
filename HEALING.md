# Auto-Heal for Broken Selectors

This framework heals broken selectors in two ways:

| | Where | How it runs | What it fixes |
|---|---|---|---|
| **1. Claude API heal script** | GitHub Actions (CI) | Automatically, when tests fail | CSS selectors in `pageObjects/` constructors |
| **2. Playwright Healer agent** | Your machine (VS Code + Copilot) | When you ask it to | Selectors, waits, changed texts, test steps |

Rule of thumb: let CI heal what it can and open a PR. Anything it can't heal is listed in that PR (or in the run summary), and you hand that to the Healer agent in VS Code.

---

## 1. Claude API heal script (CI)

### How it works
1. Every spec file has `test.afterEach(saveFailureSnapshot);`. When a test fails, this saves the page HTML and the error in `heal-data/`.
2. `npm run heal` (`utils/healer/healSelectors.js`) then handles each failure:
   - It only heals **"element not found"** errors. A wrong text or a wrong URL is a real bug, not a selector change.
   - It reads the failed selector from the error, e.g. `locator('#userEmail')`.
   - It finds that selector in a `pageObjects/` file.
   - It checks that the old selector **really matches nothing** in the saved HTML. If it still matches, the failure was timing or an app problem, so it's skipped.
   - It asks Claude for a new CSS selector for the same element.
   - It checks that the new selector **matches an element** in the saved HTML. If not, it's not applied.
   - It replaces the selector in the page object file.
3. The pipeline reruns the tests and opens a **pull request** with only the changed `pageObjects/*.js` files. The PR description lists old → new selectors, the reason for each, and the rerun result.

### One-time GitHub setup
1. Push this project to a GitHub repository.
2. **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key
3. **Settings → Actions → General → Workflow permissions**
   - Select **Read and write permissions**
   - Tick **Allow GitHub Actions to create and approve pull requests**
4. Optional: to run every weekday night, uncomment the `schedule:` lines in `.github/workflows/playwright.yml`.

### When it runs
- On every push to `main` and every manual run ("Run workflow" in the Actions tab).
- On pull requests the tests run, but healing is skipped, so the pipeline never opens a PR on top of a PR.

### Run it on your own machine
```bash
npm test                                          # some tests fail -> heal-data/ is created
export ANTHROPIC_API_KEY=your-key                 # Windows PowerShell: $env:ANTHROPIC_API_KEY="your-key"
npm run heal                                      # updates pageObjects/ + writes heal-report.json
git diff pageObjects/                             # review the changes
npm test                                          # check that they pass
```

### Settings: `utils/healer/healConfig.js`
| Setting | Default | Meaning |
|---|---|---|
| `model` | `claude-sonnet-5-5` (or env `HEAL_MODEL`) | Claude model used |
| `maxHtmlLength` | 100000 | Max HTML characters sent per heal (cost control) |
| `snapshotFolder` | `heal-data` | Where failed-test snapshots are saved |

### What it does NOT heal (goes to the Healer agent)
- `getByRole(...)`, `getByText(...)` and `getByPlaceholder(...)` locators. Only plain `page.locator('css')` selectors are healed.
- Locators built from a base selector plus a filter (e.g. `locator('a', { hasText: ... })`), when the base selector still exists.
- Changed texts, wrong URLs, timing problems, broken app behavior.

---

## 2. Playwright Healer agent (VS Code + GitHub Copilot)

Set up with `npx playwright init-agents --loop=vscode`. Files:
- `.github/agents/playwright-test-healer.agent.md`: the healer agent
- `.vscode/mcp.json`: starts the Playwright test server the agent uses
- `.github/copilot-instructions.md`: **our rules** (fix only `pageObjects/` constructors, never weaken assertions, etc.)

### Use it
1. Open this folder in VS Code (with GitHub Copilot signed in).
2. Open `.vscode/mcp.json` and click **Start** above `playwright-test` if it isn't running.
3. Open Copilot Chat, switch to **Agent** mode, and choose **playwright-test-healer** from the agent list.
4. Ask, for example: `Fix the failing tests in tests/cart.spec.js`. Or paste the "Not healed" list from the CI pull request.
5. The agent runs the tests, opens the browser, inspects the page, edits the page objects, and reruns until the tests pass. If the app itself is broken, it marks the test `test.fixme()` with a comment.
6. Review with `git diff`, then commit.

The model is set in the agent file (`model:` line). You can change it there or in the Copilot model picker.

> **Commit your work before running the agent**, so every change it makes shows up as a diff you can review or undo.

### After upgrading Playwright
Rerun `npx playwright init-agents --loop=vscode` to refresh the agent files. It also adds the planner and generator agents and a `tests/seed.spec.ts`; delete them if you only want the healer. Our rules in `.github/copilot-instructions.md` aren't affected.
