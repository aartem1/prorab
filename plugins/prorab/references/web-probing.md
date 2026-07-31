# Web probing contract

Loaded only by a command whose scope actually has a **browser surface** — a screen, a route, a form,
a client-side interaction. A change with no such surface never pays for this file.

The default instrument for a web UI is a **headless run**, not a visual session. In a visual session
the model is the driver: look at a screenshot, decide, click, look again — every step a round-trip
carrying an image, so one consumer flow costs tens of them. In a headless run the model **authors**
the session once, executes it with a single command, and judges a structured result. It is faster for
the obvious reason, and it is a *stronger* check for a less obvious one: a screenshot taken after
clicking *Save* shows a toast, while a script reloads the page and re-reads the resource, which is
what actually proves the data was stored. Forcing a 500, a timeout or an offline state is a line of
code here and impractical by hand. Console errors, unhandled rejections and failed requests come out
for free, so the button that "works" while throwing stops passing.

## The ladder — pick the lowest level that yields consumer-equivalent evidence

- **L0 — no browser.** The behavior is observable over HTTP, the CLI, or the data it writes: verify
  it there with a plain client. A browser is required only when the behavior *lives* in the browser —
  client routing, client state, client validation, rendering.
- **L1 — headless run. The default for a web UI.** Assertions on role + accessible name, label,
  visible text, URL, response status, storage, console — **and on layout, measured rather than
  eyeballed**: clipping as `scrollWidth > clientWidth`, overlap as intersecting bounding boxes,
  off-screen as a box outside the viewport, plus computed font size and colour. Much of what is
  called "checking the layout" has a numeric oracle, and a number is better evidence than a glance.
- **L2 — pixels, clipped and pointwise.** One element-clipped screenshot, taken *inside* the same L1
  run and read only for the item that needs adjudication. Reserved for a requirement that is
  genuinely perceptual: visual regression, canvas/chart rendering, print, a deliberate aesthetic.
- **L3 — interactive visual session.** Escalation only, on a **named** trigger: an
  auth/2FA/captcha step a human must complete, a native dialog, an environment the runner cannot
  reach, or L1 failing twice to find a user-facing handle. Log the trigger with the escalation — an
  unlogged L3 is how this contract silently decays back into the slow default.

Record the level next to every verdict. `L0`/`L1` are unremarkable; `L2` and `L3` are choices that
have to justify themselves.

## What every run must capture

Miss these and the headless run really is weaker than looking at the screen:

- console errors and unhandled rejections raised during the flow;
- failed requests and any 4xx/5xx, with method, path and status;
- the **write request's own status** behind a save, not just the message the UI shows afterwards;
- **persistence proven by an independent re-read** — reload the page, or `GET` the resource, and
  compare. A success toast is not evidence that anything was stored;
- for a negative case, the **documented refusal**, with the failure *injected* (route interception
  → 500/timeout/offline, an empty or invalid submit) rather than waited for;
- the final URL.

## Locators are user-facing only

Role + accessible name, label, visible text, placeholder, heading — or a `data-testid` the project's
own consumer-facing conventions publish. **Never** a class hash, an internal id, an XPath, or a
selector lifted from the source.

This single rule does two jobs. Authoring a script is the one moment where a blind prober is tempted
to open the implementation "just for a selector", and that would destroy the independence the whole
check rests on. It is also simply how a user finds a control. A handle that cannot be found by its
user-facing name is therefore a **finding** — a labelling or accessibility gap — or an honest
`unverifiable`; it is never a reason to read the code. The blindness declaration lists the script's
locators alongside the files read and commands run.

## Determinism and isolation

- **Wait for state, never read after an action.** Reading text straight after a click races the
  request behind it and yields an empty string, which then looks like a defect. Wait for the status
  element, the expected response, or the URL to change, and only then read.
- **No fixed sleeps**, a per-step timeout, and a per-run timeout, so a hung page cannot consume the
  turn budget.
- **Name every entity the run creates uniquely** (a run id in the label). A probe that writes a
  fixed literal collides with its own previous run and reports a strict-mode violation instead of a
  verdict — and re-runnability by a sceptic is the standard the evidence is held to.
- **Prefer a state-independent oracle** where the requirement allows one: "the stored count is
  unchanged" survives leftover data from an earlier run; "nothing is stored" does not.
- **Retry a failed item once inside the same run.** This is what "confirm a defect once before
  reporting it" costs here: nothing.

## The runner — resolution order, and the one question

1. **The project's own e2e harness** (Playwright, Cypress, Puppeteer, Selenium in its manifest) — run
   it the project's way, in its style. Nothing to install, nothing to ask.
2. **An installed browser, driven by a runner already present** — launch with `channel: 'chrome'` and
   no engine is downloaded at all. This is the common case and the cheapest one that is not case 1.
3. **Anything that has to be fetched — ask first, always.** State what, how large, and where it
   lands, and say whether an installed Chrome could be driven instead. Note that cached engines are
   *not* proof no download is needed: a fresh runner pins a specific engine build and will reject an
   older cached one.
4. **Refused, unavailable, or offline** — drop to L0 for whatever HTTP can reach and mark the
   browser-only items `unverifiable` with the missing prerequisite named. Never a fabricated pass,
   and never an escalation to a visual session merely to avoid the question.

**Ask once per project, then record the answer** — in the stage artifact, and as a `verification`
memory entry (the type `project-knowledge.md` already defines for verified commands). A later stage
reads the recorded runner instead of asking again.

**Nothing is installed into the project.** Manifests and lockfiles are untouched, and the runner and
its scripts live in the run directory outside the working tree, where they cannot be committed.

**The provisioned runner produces evidence, never project coverage.** It is not a test level. Never
write it into the repository, never add it to a manifest, never count its script as the missing
regression test. Where the project has no level at which a behavior can be asserted, the owning
command's existing rule stands: report the gap and what closing it would take. Without this line the
next step is `npm i -D playwright` "to add the missing test", which is exactly the silent tooling the
framework forbids.

## The run directory and the result shape

Everything the run produces — the script, `result.json`, any screenshot, the raw log — goes to one
directory outside the working tree (`"${TMPDIR:-/tmp}/prorab-web-<slug>/"`), and is cited by path.
One object per charter item:

```json
{"item":"<charter id>","level":"L1","expected":"<from the charter>","observed":"<what happened>",
 "verdict":"works|broken|differs|unverifiable","final_url":"...",
 "writes":[{"method":"POST","path":"/api/notes","status":201}],
 "reread":{"via":"reload + GET /api/notes","matches":true},
 "console_errors":[],"failed_requests":[],"screenshot":null,"ms":812}
```

Run it under `Run output discipline`: raw output to a file, and read back only the one
tab-separated line per item plus the counters line the tail below prints — that *is* the digest.
`result.json` stays on disk as the evidence a sceptic re-runs.

## Skeleton

Fixed top and bottom; the charter items go in the middle. Expected values come from the charter, never
from the application.

```js
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'

const BASE = process.env.BASE_URL, OUT = process.env.OUT_DIR
const RUN = process.env.RUN_ID ?? String(Date.now())     // scopes every entity this run creates
const STEP_MS = 5000, RUN_MS = 120000
const results = [], consoleErrors = [], failedRequests = [], writes = []
const runTimer = setTimeout(() => { console.error('run timeout'); process.exit(2) }, RUN_MS)

let engine = 'chrome'                                    // installed Chrome first: no engine download
const browser = await chromium.launch({ channel: 'chrome' })
  .catch(() => ((engine = 'bundled'), chromium.launch()))
const page = await browser.newPage()
page.setDefaultTimeout(STEP_MS)
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`))
page.on('requestfailed', (r) => failedRequests.push(`${r.method()} ${r.url()} ${r.failure()?.errorText}`))
page.on('response', (r) => {
  const m = r.request().method(), p = new URL(r.url()).pathname
  if (m !== 'GET') writes.push({ method: m, path: p, status: r.status() })
  if (r.status() >= 400) failedRequests.push(`${m} ${p} ${r.status()}`)
})

async function item(id, expected, level, body) {         // a failed item retries once, in-run
  for (const attempt of [1, 2]) {
    const t0 = Date.now(), errs = consoleErrors.length, wrote = writes.length
    const record = (extra) => results.push({ item: id, level, expected, final_url: page.url(),
      writes: writes.slice(wrote), console_errors: consoleErrors.slice(errs),
      failed_requests: failedRequests.slice(-3), ms: Date.now() - t0,
      reread: null, screenshot: null, ...extra })
    try {
      const { observed, verdict = 'works', reread = null, screenshot = null } = await body()
      record({ observed, verdict, reread, screenshot })
      return
    } catch (e) {
      if (attempt === 2) record({ verdict: 'broken', observed: String(e.message).split('\n')[0] })
    }
  }
}

// ---- charter items ---------------------------------------------------------
const NOTE = `probe-${RUN}`                              // unique: a re-run cannot collide
await item('save-persists', 'a saved note survives a reload and is readable in the list', 'L1', async () => {
  await page.goto(BASE)
  await page.getByLabel('Title').fill(NOTE)
  await page.getByRole('button', { name: 'Save' }).click()
  await page.getByText('Saved').waitFor()
  await page.reload()                                    // the re-read, not the toast
  await page.getByRole('listitem').filter({ hasText: NOTE }).waitFor()
  const titles = (await (await page.request.get(`${BASE}/api/notes`)).json()).map((n) => n.title)
  return { observed: `after reload the list shows ${NOTE}`,
    reread: { via: 'reload + GET /api/notes', matches: titles.includes(NOTE) } }
})

await item('write-failure-surfaced', 'a failed save tells the user instead of looking saved', 'L1', async () => {
  await page.route('**/api/notes', (r) => r.request().method() === 'POST'
    ? r.fulfill({ status: 500, body: '{"error":"Server error"}' }) : r.continue())
  await page.goto(BASE)
  await page.getByLabel('Title').fill(`${NOTE}-doomed`)
  await page.getByRole('button', { name: 'Save' }).click()
  const status = page.getByRole('status')
  await status.waitFor()                                 // wait for state; never read after a click
  const shown = await status.textContent()
  await page.unroute('**/api/notes')
  return { observed: `message "${shown}"`, verdict: shown && shown !== 'Saved' ? 'works' : 'broken' }
})
// Layout, measured — no image needed:
//   const b = await page.locator('#banner').evaluate((el) => ({ s: el.scrollWidth, c: el.clientWidth }))
//   verdict: b.s <= b.c ? 'works' : 'differs'
// L2, only for a perceptual requirement:
//   await page.getByRole('figure').screenshot({ path: `${OUT}/chart.png` })
// ---- end charter items -----------------------------------------------------

await browser.close()
clearTimeout(runTimer)
writeFileSync(`${OUT}/result.json`, JSON.stringify(results, null, 1))
for (const r of results) console.log(`${r.verdict}\t${r.level}\t${r.item}\t${r.observed}`)
console.log(`engine=${engine} items=${results.length} works=${results.filter((r) => r.verdict === 'works').length} console_errors=${consoleErrors.length}`)
process.exit(results.every((r) => r.verdict === 'works') ? 0 : 1)
```

## Stage handoff — each stage pays once

The commands run in sequence, so the method lives here while each stage owns a different slice and
records what the next one would otherwise re-derive. This is the handoff pattern the framework
already uses for `refine → build` (`Code map`), `build/quick → verify` (coverage proofs) and
`audit → refactor` (provenance).

| stage | owns | records | reads |
|---|---|---|---|
| `refine` | the code-aware half — it is already reading code, and `verify` must not | `Web surfaces OBSERVED` in the IDEA's `Code map`: the documented start command and base URL, the routes/screens, the user-facing handles the requirement implies, and whether the project has its own e2e harness plus its exact invocation — **observed, not run**. It records only; it loads no contract, because it drives no browser | — |
| `build` | verification of what it just built | `Web probing` in the IMPL: the runner used and its exact invocation, the base URL that worked, the seeding path, the provisioning answer, and which behaviors were driven headless | `refine`'s block, re-hashed |
| `quick` | the one changed behavior and its negative | the same fields, one line, in the QUICK record | — |
| `verify` | the outside, blind half only | per behavior: the level, the script path, and any escalation with its trigger | the recorded runner and base URL from the IMPL/QUICK, fed into the charter |

Freshness works as everywhere else: `git hash-object` over what the record cites, and a logged
`web recon reused: <n> fresh, <m> stale`. The same two bounds apply — a matching hash proves a file
is unchanged, not that the recipe still works, and a reused recipe never upgrades a behavior's own
verdict.

Blindness survives the handoff because the **main loop** reads the recorded recipe and passes only a
base URL and user-facing handles into the charter. A URL and a button label are what a consumer sees;
no path, symbol or selector crosses over.

## Safety

Read-only by default, and a mutating probe only against a local/dev/test environment, on the uniquely
named test entity, removed afterwards or reported as left behind. Never production. **No credentials
in a script and none typed anywhere** — take a session/storage state the user chooses to hand over,
or use the project's own documented test-user seeding, and treat missing access as `unverifiable`.
Never commit the run directory, and never disable a check to make a probe pass.
