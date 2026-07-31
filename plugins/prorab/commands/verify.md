---
description: "Critical black-box check that shipped functionality really works for the user: a blind prober that never reads the implementation, requirement-derived oracles, evidence per behavior, then proof that a test fails when it breaks."
argument-hint: "what to verify — slug, IMPL/QUICK path, branch or base ref, commit range, `uncommitted`, or a free description; empty = derive the scope"
---

Input: **$ARGUMENTS**

You establish whether **implemented functionality actually works for the people who use it**, from **outside the code**, critically, on the smallest budget that still produces evidence. A "user" here is whoever meets the surface from outside: a person in a UI, an API client, someone running the CLI, a reader of a report or an export, an operator watching the output.

**Why this is not the verification inside `build`.** `build` proves the code satisfies a DoD, with tests written by the same author, with the implementation in full view. That is necessary and not sufficient: a check designed while looking at the code inherits the code's assumptions and then confirms them. Here the split is structural — **the context that drives the system has not read the implementation**, and every expected value comes from the requirement, never from what the system emits.

**Mandate.** You change **no product code and fix nothing**. You produce two things: a per-behavior verdict backed by evidence a sceptic could re-run, and — for what you verified — project tests that actually fail when that behavior breaks. **The only code you write is test code.** A confirmed defect is reported and routed to the command that owns fixes, with its reproduction recorded so that command starts red.

**Contracts.** Read `${CLAUDE_PLUGIN_ROOT}/references/project-knowledge.md` (language, source-of-truth order, bounded recall, delegated-return capsules, active-vs-archive lookup) and `${CLAUDE_PLUGIN_ROOT}/references/execution.md` (run output discipline, main-loop discipline, deterministic steps). You do **not** load the documentation-sync contract: you change no behavior, so nothing you do falsifies a document — and a document that contradicts what you observed is a **finding you report**, never a document you quietly rewrite. `tasks/verify/VERIFY-<slug>.md` is a project document a human reads, so it follows the task's language.

---

## Principles

- **Blind by construction.** The prober gets a charter — surfaces, preconditions, expected results — and never the diff, file paths, symbol names, or any hint of how it is built. Blindness cannot be self-imposed by a context that has already read the implementation, which is why probing is delegated at **every** tier, S included.
- **The oracle is the requirement, never the system's own output.** An expected value comes from the DoD/spec/product documentation/the user's words or from an independent recomputation. "It returned something and didn't error" is not a pass; a screenshot without the compared value is not evidence.
- **Cheapest instrument that gives consumer-equivalent evidence.** Drive the real surface if you can reach it; use the project's own harness if you can't; never accept reading code as a substitute for either.
- **Read-only by default; never a write against production.** Verification must not become a mutation of someone's real data.
- **Honest scope beats an invented scenario.** If the change has no user-visible surface, or no instrument can reach it, say exactly that and name what is missing. `unverifiable` is a legitimate, useful result; a fabricated "works" is not.
- **Findings are routed, not fixed.** You are the check, not the fix. One confirmation that a defect reproduces, then hand it over.
- **Coverage means a test that can fail.** A verified behavior no test would catch breaking is not covered — regardless of how many tests mention it.
- **Evidence is never paid for twice.** `build` and `quick` already prove their tests can fail — by a right-reason red before the code existed, or by a sabotage mutation — and they record it with the test file's hash. Re-hash and reuse; prove only what has no fresh recorded proof. Your budget belongs to the work nobody has done: driving the real surface from outside, and the behaviors no DoD ever stated.

---

## Phase 0 — Scope: what exactly are we verifying (deterministic first, then ask)

1. **If `$ARGUMENTS` names the scope, take it:** a slug or path to `tasks/IMPL-*.md` / `tasks/quick/QUICK-*.md` / `tasks/ideas/IDEA-*.md`; a branch or base ref; a commit range; `uncommitted`; or a free description of the functionality. Do not select `tasks/archive/**` by default — only when the user names an archived task explicitly.
2. **Otherwise derive the candidates with commands, not impressions** (`Deterministic steps`): `git status --porcelain` for the uncommitted set; the current branch and its base (`git rev-parse --abbrev-ref HEAD`, the default branch from `git symbolic-ref refs/remotes/origin/HEAD` or `main`/`master`, then `git diff --name-only <base>...HEAD` and `git log --oneline <base>..HEAD`); the most recent active IMPL/QUICK artifact. `git diff --stat` gives the change class.
3. **Adopt one scope and log it in a single line** — what it is, how many files, which surfaces it touches, and which artifact (if any) states its requirements.
4. **Ask the user when the scope is genuinely undetermined** — with `AskUserQuestion` and concrete, mutually exclusive candidates ("uncommitted changes: 3 files, the export endpoint", "branch `feat-x` vs `main`: 12 files, 4 commits", "the `csv-export` task from `tasks/IMPL-csv-export.md`"), never a vague "what should I check?". Ask when: the uncommitted set and the branch commits describe different work; HEAD is the default branch with no obvious feature boundary; the change set is empty; or several artifacts match equally. One round of this, then proceed with the answer.
5. **Reduce the scope to user-visible surfaces.** Identify entry points the way the project itself documents them — routes/endpoints, CLI commands and flags, screens and views, report/export columns and formats, published schemas, defaults and limits a consumer can observe. Internal-only files stay out of the charter.
6. **If nothing user-visible remains, stop and say so**, naming what the change does touch and the right instrument instead (a behavior-preservation differential belongs to `/prorab-tech:refactor`; a pure static/gate change to `/prorab-tech:lint-fix`). Offer that; do not manufacture a user scenario to have something to run.

## Phase 0.5 — Budget triage (solo, before delegating)

**Signals:** how many distinct user-visible surfaces; instrument cost (a documented CLI call versus a browser session versus an independent recomputation over real data); oracle strength (a stated DoD versus nothing but the code); environment reachability; blast radius (is an external contract observable here).

| | **S** | **M** | **L** |
|---|---|---|---|
| When | 1 surface, 1 instrument, oracle already stated | 2–4 surfaces, or two instruments, or a value needing independent recomputation | many surfaces/services, browser plus data recomputation, weak or absent oracle |
| Surface recon | main loop | main loop, or 1 delegated | 1–2 delegated |
| Blind probers | 1 | 1–2 | 2–3, surfaces grouped |
| Coverage work | main loop | main loop (+1 sceptic if a mutation was skipped) | +1 sceptic |
| Re-probe of a doubtful item | no | 1 | up to 2 |
| `max_turns` | 6 | 8 | 12 |

**Hard orchestration caps (cumulative for the whole command):** count every model context — the main agent, every direct `Agent`, every `Workflow` node; retries count again. **S = at most 2 contexts total** (main + one blind prober), so do not launch `Workflow`. **M = at most 6 total** (main + at most five delegated). **L = at most 12 total** by default, expandable to the absolute cap of **16** only on confirmed contract/security/business-critical risk or an explicit `--thorough`. An override never removes the 16-context ceiling. Before every delegation log `used/cap`, and reserve the contexts a re-probe of a doubtful item would need.

**Never one prober per assertion.** Group the charter into as few probes as a coherent consumer session allows: one prober can walk several surfaces of the same flow with one instrument. Fan out on instrument boundaries (browser / API / data), not on item boundaries.

**Context occupancy (a second axis).** The `Context hygiene` contract binds how full each context gets: raw run output goes to a file outside the working tree and comes back as a ~40-line digest; a delegated context returns a capsule of claims and pointers, never the material. Evidence files — response bodies, logs, screenshots, query results — are written to one run directory outside the working tree and cited by path, so they can neither bloat a context nor be committed. Above tier S the main loop holds the charter, the verdict table, the capsules and the ledger; at S it is the executor for the code-aware half (scope, surfaces, coverage) while the blind half is still delegated.

**Verification profile (orthogonal to the tier):** `economy` — no mutation, coverage judged from the test's own assertions and a targeted run; `balanced` (default) — at most one mutation per critical behavior cluster; `thorough` — a mutation per substantial verified behavior. `--fast`/`--thorough`/`--tier=S|M|L`/`--verification=economy|balanced|thorough` or a natural-language request pins the choice. Log the tier, the profile, `used/cap`, mutation `used/cap`, and anything consciously skipped.

## Phase 1 — Charter and instruments (solo, code-aware)

1. **Write the charter**, one entry per user-visible behavior in scope:
   - `surface` — how a consumer reaches it (URL and route, method and endpoint, exact CLI invocation, screen plus navigation, report plus filters, the produced file);
   - `precondition` — the state or data needed, obtained through the project's **own** seeding/fixture path;
   - `action` — what the consumer does;
   - `expected` — the result **and the requirement it comes from**, phrased as a rule a person could check;
   - at least one **negative** (empty/invalid → the documented refusal) and one **boundary** (0 / limit / off-by-one) case for every non-trivial behavior;
   - `instruments` allowed, and the safety limits below.

   The charter carries **no file path, symbol, diff, or implementation hint**. If an item can only be phrased in implementation terms, it is not a user-visible behavior: drop it and say so in the report.

2. **Fix the oracle before probing.** Take expected values from the DoD of the linked IDEA/IMPL/QUICK, the spec, product/API documentation, the user's own words, or an independent recomputation from source data that does not reuse the feature's code path. Where no literal value is derivable (ranking, aggregates, parsing, non-determinism), use a **metamorphic invariant** from the requirement — permuting the input leaves the total unchanged, parse∘serialize returns the original, a repeat is idempotent, more input never lowers the count — never an always-true relation. If the only available source for an expected value is the implementation itself, mark the item `oracle: none`, ask the user for the expected result in the same `AskUserQuestion` round as any scope question, and leave it `unverifiable` if it stays unanswered. **Never promote the implementation's behavior into the expectation.**

3. **Discover the instruments; assume none.** Derive from repository guidance, CI, task runners, package scripts and documented runbooks:
   - **HTTP/API** — the project's documented way to start or reach an instance (task runner, compose file, dev script, a staging URL the user names), driven with a plain client; the contract from its own API documentation or schema.
   - **UI** — the project's existing browser driver if it has one, otherwise a browser-automation tool available in the session, against a local or dev URL. Evidence is the compared value, with a screenshot as support.
   - **CLI/TUI** — run it as a user would, with documented flags; judge stdout/stderr and the exit code.
   - **Data and recomputation** — recompute the number independently through the project's own read-only query path or an analytics tool it already uses, then compare with what the feature reports.
   - **Files and exports** — open the artifact as its consumer does: parse the CSV, validate the JSON against the documented schema, open the produced document.
   - **Config/text products** — apply it the way its consumer applies it: a dry-run/plan/validate/render mode, a schema check — never a hand-read.
   - **Observability** — existing logs, metrics and traces are supporting evidence, never the primary oracle.

   Install nothing, invent no command, and do not silently add tooling. No reachable instrument for an item → it is `unverifiable` with the missing prerequisite named.

4. **Safety limits, non-negotiable.** Read-only probes by default. A mutating probe only against a local/dev/test environment, on a clearly marked scoped test entity, removed afterwards or reported as left behind — **never against production**, never real money, never a message to a real person, never another user's data. You do not type credentials, tokens, card or document numbers anywhere: if a probe needs authentication, ask the user to authenticate and hand back a session they choose to provide, and treat missing access as `unverifiable`. Bypass no protection and disable no check to make a probe pass. If the only reachable environment is production, ask before anything but observation.

## Phase 2 — Blind probing (delegated at every tier)

Launch the probers with the charter and nothing else. Each one gets `max_turns` from the tier and a model strong enough to judge evidence honestly — a re-probe of a single item may be cheap.

**The prober's brief states:** you are checking a system you have not built; do **not** open project source code, tests, or the diff — read only consumer-facing material (user/API documentation, UI text) and the output of the instruments you drive. For every item: state the expected result from the charter first, then act, then report what you actually observed. Compare the observation with the charter's expectation, never with a value you found in the system.

**Its `schema` return per item** (a capsule, ~1500 tokens for the whole return): the exact invocation or step sequence a reader could repeat; the minimal observed evidence (status code, the value, the visible text, the parsed field) plus the path of the evidence file; `verdict` ∈ `works` | `broken` (the expected result is not produced at all) | `differs` (it works, but not as the expectation states) | `unverifiable` (the surface, the data, the access or the oracle could not be obtained); `grade` ∈ `observed` (drove the real surface against the charter's oracle) | `proxy` (drove it through the project's own harness) | `unverified`; and for a defect, the shortest reproduction plus expected-versus-actual.

**Blindness declaration, mandatory:** every file it read and every command it ran. This is what makes blindness checkable rather than promised.

## Phase 3 — Verdicts (solo)

1. **Check the blindness declaration** against the change set — or, when the scope was given as a description rather than a diff, against the implementation files behind the charter's surfaces. An implementation file, test file or diff in it → the items it touches drop to `not independently verified`; re-probe them with a fresh prober within the cap, or report them at that grade. Never launder such a verdict into `works`.
2. **Downgrade weak passes, don't accept them.** A `works` resting on the system's own output, on "no error", on a screenshot with no compared value, or on `grade: unverified` becomes `unverifiable` with the reason stated.
3. **Confirm a defect once before reporting it** — re-run the same reproduction (a second time, same conditions) so a flake is not announced as a bug. Reproduces → `broken`, with the reproduction recorded. Doesn't → report it as intermittent, with both runs.
4. **`differs` is not automatically a defect.** Observed behavior that contradicts the requirement may mean stale code or a stale requirement: say which reading the evidence supports, and leave the product decision to the user. The same applies when observed behavior contradicts a current-state document — that is a finding with both readings named, not a document you edit.
5. **Route what you found:** `/prorab:quick` for a small local fix; `/prorab:refine` then `/prorab:build` for anything product-shaped or ambiguous; `/prorab-tech:refactor` when the fix must preserve behavior. Attach the reproduction to each. You fix nothing yourself.

## Phase 4 — Coverage: would a test catch this breaking? (solo, code-aware)

Runs only for behaviors you actually verified — this is coverage of what was checked, not a coverage project. The prober never becomes the test writer: it would lose the blindness the next run depends on.

1. **Derive the project's test recipe** — the exact supported commands for targeted tests, the full suite, and lint/typecheck — from repository guidance, CI, task runners and existing test conventions. Note the levels and locations the project already uses.
2. **Reuse the recorded proofs before proving anything.** If the scope has a linked IMPL or QUICK, read its DoD table's `item → closed by → proof` column and re-hash the recorded test files with `git hash-object`. For every charter item that maps onto such a row: `proof` ∈ {`red-first`, `mutation`} **and** the hash still matches → the test is already proven able to fail, so mark it `covered (reused)`, cite the artifact plus the proof kind, and **spend nothing** on it. A changed hash, a `none`, a missing column, or an item the DoD never stated → this phase does the work. Log `coverage evidence reused: <n> fresh, <m> stale or absent`. The saving is banked, not respent on extra mutations. Two bounds on trust, both the same ones `build` puts on a reused `Code map`: a matching hash proves the file is unchanged, not that the test asserts *your* charter item — if the mapping is not explicit in the artifact, verify the assertion before reusing it; and a reused proof never upgrades a behavior's own verdict, which comes from Phase 2 alone.
3. **Find the candidate test deterministically** for the items item 2 left open: grep the test tree for the surface's own names (route, command, column, format literal, documented flag), then read only the candidate assertions.
4. **Grade the coverage:** `covered` — a named test asserts this behavior against a requirement-derived value **and** was proven able to fail; `weak` — a test exists but asserts a snapshot taken from the code, checks only that a call succeeded, mocks the unit under test, or could not be made to fail; `absent` — nothing asserts it.
5. **Prove it, profile-bounded.** For each critical cluster still open (per the profile), create a temporary isolated worktree and **materialize the uncommitted parts of the scope there first** — the verified change and the test being proven both have to exist in that worktree, or the mutation lands on code the feature does not have and proves nothing. Then inject **one** plausible regression that would break the verified behavior (invert a condition, shift a boundary, flip a sign, delete a significant branch, return a constant), run the candidate test, and record the digest. Red → `covered`. Not red → `weak`, however convincing the test reads. Remove the worktree and confirm the working tree is untouched; never mutate the working tree and never use `git checkout --`, `git reset` or `git clean` to undo a probe. Skip an equivalent or unsafely-isolated mutation with a one-line reason and fall back to the assertion review.
6. **Write or update the missing coverage**, at the project's existing level and location, in its runner and style:
   - the expected value comes from the **charter item** — the same requirement-derived oracle the prober used — never from the current output; a test written by observing today's output is a golden snapshot, not a check;
   - include the negative/boundary case the requirement implies;
   - prefer the cheapest level that would actually fail on the regression; add no new test framework, install nothing, invent no harness. If the project has no level at which this behavior can be asserted, report the gap and what closing it would take, instead of inventing one.
   - **Red-first does not apply here, and its substitute is mandatory:** the behavior already works, so a new test starts green. What proves it is worth anything is the mutation from item 5 — write it, run it green, then prove it can fail. A test that cannot be proven by mutation is **not** counted as coverage, and the report says so.
   - No green-up workarounds, ever: `assert True`, a tautology, no assertion, `skip`/`xfail`, a commented-out case, `try/except` without re-raise, a hardcoded answer for the test input, or mocking the unit under test. Mocking external boundaries by name (network, DB, time, FS) is fine.
7. **Never leave the suite red.** A defect's reproduction lives in the record so the fixing command starts red immediately; add a pending/failing test only where the project already has that convention (a strict `xfail` with a tracking link), and say so.
8. **Run the checks, but not the ones already run on this exact tree.** Always run the targeted tests for every test you wrote or changed. Run the project's full suite and lint/typecheck when you changed tests, or when the linked artifact recorded no digest, or when `git rev-parse HEAD` plus `git status --porcelain` differ from the state that produced the recorded digest — otherwise cite the upstream digest instead of paying for an identical run, and say that is what you did. Judge a run by exit code **and** the collected/passed counters, never by an `OK` string; carry only the digest. Name any check you skipped.

## Phase 5 — Report and record

1. **Report, compactly**, in this order: the scope as adopted (one line); a verdict table — behavior → verdict → grade → evidence pointer; the defects with their reproductions and where each is routed; a coverage table — behavior → `covered`/`weak`/`absent` → the test that closes it → how it was proven; tests added or updated; check results as they are, including any digest you reused instead of re-running; what coverage evidence was reused rather than re-proved (`coverage evidence reused: <n> fresh, <m> stale or absent`); what was `unverifiable` and what is missing to close it; the tier, profile and `used/cap`. No wall of output: pointers, not payloads.
2. **Write one record**, after the verdicts and the coverage work so it states the real outcome: `tasks/verify/VERIFY-<slug>.md` (template below), creating `tasks/verify/` if absent. Derive `<slug>` from the verified functionality; on a collision use the first free deterministic suffix (`-2`, `-3`, …) and never overwrite. When the scope's task bundle is already archived, write the record into that archive directory instead and link it there — as `announce` does — rather than re-creating active artifacts. Archive nothing yourself.
3. **Capture at most one memory entry**, and only if it clears the durable bar — a verified way to reach and check this surface, or a recurring gotcha in the environment. Usually capture nothing.
4. **Commit/push only on request.** Tests you wrote stay in the working tree; if you are on `main`/`master` and the user asks to commit, create a branch first.

---

## What NOT to do

- Don't let the probing context see the implementation, the diff, the file paths or the symbol names — and don't accept its verdict if its declaration shows it did.
- Don't take an expected value from the code, the current output, or a snapshot of either; don't call "no error" a pass.
- Don't fix product code, don't widen the change, don't rewrite a document because observed behavior disagrees with it — report it.
- Don't probe production with anything but observation, don't create or destroy real data, don't enter credentials or secrets anywhere, don't install tooling, don't disable a check to make a probe pass.
- Don't invent a user scenario for a change that has none, and don't report `works` for something you could not reach — `unverifiable` with the missing prerequisite is the honest answer.
- Don't count a test as coverage without proving it can fail; don't leave the suite red; don't build a coverage project around the behaviors you happened to verify.
- Don't run a `Workflow` at tier S, don't spawn a prober per assertion, and don't exceed the ceiling to close one more item.

---

## Artifact template

Headings and prose go in the **task's language** (English here only as a key); paths, commands, values and check output stay verbatim. Keep it to about a screen — drop a section with nothing to say, except `Not verified`, which always states its outcome.

```markdown
---
type: verify
slug: <slug>
date: <YYYY-MM-DD>
scope: <uncommitted | branch <name> vs <base> | <commit range> | task <slug>>
verdict: works | defects | partial
tier: S | M | L
profile: economy | balanced | thorough
links:
  - <tasks/IMPL-*.md or tasks/quick/QUICK-*.md, when one exists>
---

# <one line: what was verified and the outcome>

**How it was checked:** the instruments, the environment, and the blindness of the probing context — one or two sentences.

## Verdicts
| behavior (as a user sees it) | expected, and where it comes from | verdict | grade | evidence |
|---|---|---|---|---|
| <surface + action> | <expected value → requirement source> | works / broken / differs / unverifiable | observed / proxy | <invocation + evidence path> |

## Defects
- <what is broken> — reproduction: `<exact invocation/steps>`; expected `<x>`, observed `<y>`; routed to `<command>`.

## Coverage
| behavior | before | test that closes it | proof (+ test `sha1`) |
|---|---|---|---|
| <behavior> | covered / covered (reused) / weak / absent | <test name/path> | mutation → red · `<sha1>` / reused from `<artifact>` (<red-first\|mutation>) / skipped: <reason> |

## Checks
- `<exact command>` — <exit code and passed/collected counters, or the failure tail>
- <skipped check> — skipped: <reason>

## Not verified
- <behavior> — <what is missing: environment, access, data, oracle> — <what would close it>.
- Or: everything in scope was reached.
```
