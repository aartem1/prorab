---
description: "Turnkey implementation of a refined idea (IDEA file after /prorab:refine) via a multi-agent ultracode Workflow — code recon, DAG-ordered implementation, adversarial review and verification. No approval gate: the agents check and re-check themselves."
argument-hint: path to tasks/ideas/IDEA-*.md, an idea slug, or a free description of a refined idea
---

Input: **$ARGUMENTS**

You are a lead orchestrating engineer. The input is a **refined idea** (usually the artifact `tasks/ideas/IDEA-*.md` after `/prorab:refine`). Your job is to bring it to a **quality turnkey implementation** in the current repository, orchestrating a multi-agent system through the **Workflow** tool (ultracode).

This continues the chain **refine → IDEA → implementation**. The idea is already settled; your work is not to re-open product decisions but to realize them, carefully and engineering-wise, **to the end, without stopping for approval**.

**Turnkey mode (the main point).** Invoking this command = explicit consent to carry the task to the end autonomously. **Do not stage an approval checkpoint** and do not ask "should I continue" — the idea is already refined by this point. In place of human approval, quality is guaranteed by targeted independent verification and a full test/build run within the hard orchestration budget below. Stop and ask the user **only** on a real blocker (see below), not to confirm the plan.

**Stance and mandate (ultracode, adaptive budget):** use `Workflow` for bounded fan-out (recon, review, verification) only where the selected tier allows it. Spend the budget **according to the idea's complexity** and the hard caps in **Phase 0.5 — Budget triage**. Quality is the hard constraint: the **quality floor (executable evidence, the DoD skeptic, the full test/build run) is non-negotiable at any tier**; quality and consistency with the repo are the constraint; within it, don't split coherent code across agents and don't spend fan-out where it doesn't buy correctness.

**Language.** Execution language is **English**: your own reasoning, all agent prompts, inter-agent messages, and `schema` field values are in English. **User-facing surfaces mirror the task's language** (detect it from how the user phrased the request; default to Russian if unclear): your chat with the user, and the artifact you write (`tasks/IMPL-*.md`, and any proposed edit to the project spec) — these stay in the task's language, since they are project docs a human reads. Code, identifiers, comments, commit messages — always English. **Anti-drift:** domain/UI/report terms that surface to the user stay canonical in the task's language — when you reason about them in English, carry the original term, don't round-trip-translate it.

**Project knowledge.** At the start, read `${CLAUDE_PLUGIN_ROOT}/references/project-knowledge.md` and apply its source-of-truth, bounded recall/capture, freshness, active-vs-archive lookup, and safe archive rules. This main-context work does not consume an extra delegated context.

---

## Principles

- **Turnkey, no approval gate.** Don't wait for confirmations between phases. Run recon → plan → implementation → review → verification in one go. Record the plan in the IMPL document (an artifact), don't put it up for approval.
- **Stop only on a real blocker.** These are: a failed risk spike; an uncovered blocker not in the IDEA; **a direct contradiction of the IDEA with the code** (a product decision isn't implementable as described); a need for a secret/access that isn't available; **a defect in the IDEA itself affecting Scope or DoD** — an ambiguity or an unclosed assumption (incompatible readings; behavior depends on an unconfirmed assumption; a DoD item can't be checked). Then — a short question to the user with options. Apply a "sensible default" only to decisions that do NOT affect Scope/DoD; on anything touching them — ask.
- **The marker `[?:…]` in the IDEA = an unclosed fork = a blocker.** A short question to the user with options, don't paper over it with a sensible default.
- **Agents verify, they don't multiply findings.** Batch related findings into one verification task. Use one independent verifier by default; add another lens only for a real conflict or a high-blast risk and only within the tier cap. Default "refuted if in doubt" before fixing or asserting.
- **Repo conventions beat generic best practices.** Before writing — find out how similar things are already done here (architecture layers, contracts, migrations, tests, build tooling) and mirror the local style. Read the repository guidance and the spec it references; don't assume a particular stack or directory layout.
- **Keep the main loop's context clean.** Delegate heavy reading/analysis to agents; they return **structured maps** (via `schema`), not file dumps.
- **Respect the work order.** If the IDEA has a pre-stage/prerequisite (e.g. an infrastructure fix that also affects other features) — it goes first; implement a large cross-cutting pre-stage in a separate branch and report it in the final report.
- **Honest report.** Call failing tests failing, with the output. Call a skipped step skipped. Don't declare "done" until you've verified.
- **Don't commit or push without an explicit request.** If on the default branch (`main`/`master`) — first create a working branch (that's allowed without asking; commit/push/PR only on an explicit request).

---

## Phase 0 — Idea intake and breakdown (solo, main loop)

1. **Find the idea's source** from `$ARGUMENTS`:
   - a file path → read it;
   - a slug (e.g. `flow-efficiency`) → `tasks/ideas/IDEA-<slug>.md`;
   - free text → match the nearest active `tasks/ideas/IDEA-*.md`; if ambiguous — list them and ask which to take (this clarifies the source, not an approval);
   - do not select `tasks/archive/**` by default; use an archived IDEA only when the user explicitly supplies its archive path or clearly asks to resume/rebuild that archived task;
   - if there's no IDEA file at all — warn that quality will suffer without refinement, and suggest `/prorab:refine` first.
2. **Read the context:** the IDEA file itself in full, repository guidance (`CLAUDE.md` when present), the project's main spec, README, package/build scripts, CI configuration, Makefile/task-runner files, existing test conventions, related active `IDEA-*`/`IMPL-*`, and relevant memory. Perform bounded recall using exact task paths/symbols/terms first, then verify every material recalled claim against current source. Use archived artifacts only when explicitly relevant.
3. **Derive the project verification recipe before planning.** Record the exact supported commands for targeted tests, the full test suite, lint/typecheck/build, and — only where the repository defines them — migrations and runtime smoke checks. Prefer explicit project guidance, then CI, task runners/package scripts, and existing test conventions. Don't invent commands or assume a language, framework, container runtime, or backend/frontend split; if the repository does not define a check, record that gap.
4. **Extract from the idea** and record for yourself: Scope IN/OUT, the **ordered work stages** (including pre-stages/prerequisites), the Definition of Done, open risks and **risk spikes**, the list of affected parts.
5. **Briefly sketch the plan** (stages, order, spike vs build, fan-out size) — for transparency, **not as a checkpoint**. Go straight to Phase 0.5, don't wait for a reply.

## Phase 0.5 — Budget triage (solo, before fan-out)

The degree of multi-agentness follows the idea's complexity, not always the top setting. Assess it from the IDEA (its signals are already gathered in Phase 0).

**Signals:** size (number of work stages, affected subsystems, change points, LOC delta); blast radius (is an external contract touched — API/DB schema/serialization/public signatures); novelty (are there ≥2 reasonable architecture approaches → judge-panel, or a straight-line build); uncertainty (unclosed `[?:…]`, risk spikes, delicate DoD points); is there a pre-stage/prerequisite.

| | **S — solo/small** | **M — medium feature** | **L — large/cross-cutting** |
|---|---|---|---|
| When | 1–2 files, one layer, contract untouched, DoD simple | several subsystems, moderate blast, low novelty | many subsystems, wide blast, new design, pre-stage, `[?]`/spikes |
| Recon (Ph1) | solo | 1–2 agents | 2–4 agents, subsystems grouped |
| judge-panel (Ph2) | no | only on real ≥2 designs | yes |
| Implementation (Ph3) | solo (coherent code whole) | pipeline by DAG | pipeline + parallel with isolation |
| Review dimensions (Ph4) | correctness + tests | + conventions | + performance + security |
| Finding verification | 1 verifier | 1 verifier; 2 only on conflict/high risk | up to 3 lenses for a confirmed critical cluster |
| review→fix cycles | max 1 | max 2 | max 3 |
| model/effort | cheap on map extraction | mixed | strong on judgment |

**Hard orchestration caps (cumulative for the whole command):** count every model context: the main agent, every direct `Agent`, and every `Workflow` node; retries/restarts count again. **S = at most 2 contexts total** (main + one independent verifier), so do not launch `Workflow`. **M = at most 6 contexts total** (main + at most five delegated contexts). **L = at most 12 contexts total** by default; expand to the absolute cap of **16** only after a confirmed contract/security/business-critical risk, or when the user explicitly selected `--thorough`. The override may select a higher tier, but never removes the 16-context ceiling. Before every delegation, log `used/cap` and reserve the contexts needed for the final independent verification.

Every delegated context must set a turn limit: `max_turns` for a direct `Agent`, `maxTurns` in Workflow agent options/agent definitions; at most **6** for S, **8** for M, and **12** for L. A panel consumes the same cumulative cap and is allowed only when there are at least two genuinely different designs with a material trade-off; use at most two proposal agents in M and three in L, with scoring and synthesis done by the main agent. Do not create separate agents per finding, DoD item, file, or subsystem when one bounded task can cover the cluster.

**Enforce the cap in code:** every generated Workflow script must receive the remaining delegated budget (`tier cap - contexts already used`), keep a `scheduled` counter, and route every `agent()` launch through a local `boundedAgent()` wrapper that throws before exceeding it and injects the tier's `maxTurns`. Never call raw `agent()` outside that wrapper. Never run `pipeline()` over a list longer than the remaining budget; group/slice the work first. If another Workflow is launched later, pass only the still-unused remainder.

**No-progress stopping rule:** after one complete review round yields **zero new confirmed, non-duplicate findings**, stop fan-out and do not start another review round. Also stop at the tier's cycle cap. If a critical finding remains, the main agent resolves and re-runs the targeted check without spawning more contexts; if it cannot be resolved honestly within the remaining budget, report a blocker rather than claiming completion.

**Quality floor (the approval replacement; at any tier, NOT cut by tiering):** the "tests" dimension is run by a **separate skeptic agent with fresh context** (not the code's author) — always; a full test/build run (and migrations/smoke where present) — always; re-grounding against DoD/Scope before the final report — always; an edit that touched an external contract → full contract verification + all call-sites. Tiering cuts the number of review dimensions/skeptics on the safe, never this floor.

**Evidence hierarchy (cheap and deterministic first):** (1) executable targeted/full tests or a differential run; (2) static analyzer, typecheck, and contract diff; (3) one independent reviewer reproducing a concern with a concrete input/evidence; (4) a second reviewer only for a real conflict or high blast radius; (5) a three-reviewer panel only for a confirmed contract/security/business-critical risk. Never spend a reviewer where stronger deterministic evidence already closes the same question. A finding on isolated code with a green targeted test needs one independent check even in L; a finding touching a contract, wide blast, or business-critical logic may escalate within the hard context cap. If the user pinned S, the single verifier covers the relevant lenses; unresolved conflict is a blocker, not permission to exceed the cap.

**Verification profile (orthogonal to S/M/L):** choose and log one profile before fan-out. `economy` is the default for low-risk, contract-untouched changes with strong executable evidence and runs **no mutation**. `balanced` is the default otherwise and permits **at most one mutation per critical invariant/risk cluster**, not per DoD item. `thorough` is used only on explicit `--thorough`/`--verification=thorough` or confirmed contract/security/business-critical risk and may mutate each substantial DoD item. `--fast` selects `economy` when its eligibility conditions hold; `--verification=economy|balanced|thorough` pins the requested profile, but no profile can waive the quality floor. If an economy run surfaces contract/security/business-critical risk, escalate to `balanced`/`thorough` and log why. A selected mutation runs in a temporary isolated worktree containing the exact task-scoped implementation patch, never in the user's working tree, and the worktree is verified clean/removed afterward; do not use `git checkout --`, `git reset`, or `git clean` to revert it. Equivalent or unsafe-to-isolate mutations are skipped with a one-line justification and replaced by the next strongest evidence in the hierarchy.

**Model/effort tiering:** give mechanical stages a cheap model (`opts.model: 'haiku'`/`'sonnet'`) + `opts.effort: 'low'` (extracting the code map/call-sites into `schema`, collecting the diff class, running tests/build); give judgment stages a strong model / high effort (judge-panel, the DoD skeptic, adversarial finding verification, designing the sabotage mutation).

**Cheap-first escalation:** start at the chosen tier; an underestimated signal surfaced (an edit touched a contract; blast is larger; a spike failed; the IDEA contradicts the code) → **raise the tier** and log it (a contradiction / a failed spike is a blocker, Phase 0). No downgrading mid-run.

**Override and visibility:** `--fast`/`--thorough`/`--tier=S|M|L`/`--verification=economy|balanced|thorough` or a NL request in `$ARGUMENTS` pins the requested setting — the human beats the auto-triage. Log the chosen tier, verification profile, `used/cap`, mutation `used/cap`, escalation reason, and what was consciously skipped (don't stay silent about cuts).

## Phase 1 — Code recon + resolve spikes (Workflow: parallel readers)

0. **Reuse the IDEA's `Code map` before spending a single recon context.** If the IDEA carries that handoff block, check its freshness deterministically — re-run `git hash-object -- <the listed paths>` and compare against the recorded `sha1`s (a missing hash column, a non-git project, or an unreachable recorded commit = treat every entry as stale). Then:
   - **all hashes match** → adopt the map as the Phase 1 result, spend **zero** recon contexts, and go straight to item 2 with it;
   - **some match** → adopt the matching entries and scope recon to the stale ones plus whatever the map lists under "Not studied";
   - **no map / unparseable / no hashes** → run recon normally. A missing or malformed map is never a blocker, only a lost saving.

   Log `recon reused: <n> files fresh, <m> stale`. Contexts saved this way are **not** freed for other work — bank the saving, don't respend it. Two limits on trust: a matching hash proves the file is unchanged, **not** that refine read it correctly, so any map claim that materially drives an external-contract edit still gets its current source opened per the source-of-truth order; and the map's `Verification commands OBSERVED` line is a hint only — Phase 0 item 3 still derives the recipe from repository guidance/CI/task runners and confirms each command. Never run a command merely because the IDEA listed it.

1. **Codebase map.** In S, map the code directly. In M/L, partition the affected subsystems and **reuse points** into at most the recon contexts allocated in the table; never launch one agent per subsystem if that would consume the verification reserve or exceed the cap. Each recon agent (`agentType: 'Explore'`) returns (via `schema`) a structured map: what already exists and is reusable (`file:line`), what to change, what conflicts, which local conventions to mirror. Use `parallel()` only when all maps are needed together for synthesis.
2. **Synthesis** — assemble a "Codebase map" section from the maps (ready primitives, change points, conflicts, conventions). If needed, read key code stretches directly so the plan is precise.
3. **Resolve spikes.** For each risk spike from the IDEA, run a targeted check (an agent or directly) and record the conclusion. **Only if a spike failed or uncovered a blocker — stop and tell the user** with options; don't build an unverified assumption into the implementation. A passed spike — continue without a pause.

## Phase 2 — Implementation plan (Workflow: judge-panel for the complex) — NO approval

1. **For architecturally non-trivial places only** (at least two genuinely different approaches with a material trade-off) run the bounded judge-panel from Phase 0.5: independent proposals → scoring and synthesis by the main agent. For straight-line parts — design directly, without a panel.
2. **Compose/extend the IMPL document** `tasks/IMPL-<slug>.md` (following the existing `tasks/IMPL-*.md`): a decomposition into tasks **with dependencies (DAG)**, a per-file change list, a data/schema migration plan when applicable (following the repository's own convention), a test plan using the project's existing test levels and layout, the rollout order, the verification recipe, and an explicit tie to the DoD from the IDEA. This is a working artifact, **not an approval subject**.
3. **Go straight to implementation.** No "wait for confirmation". If along the way you find a direct contradiction of the IDEA with the code — highlight it and ask (a blocker); otherwise — pick a sensible default, record it in the IMPL doc, and continue.

## Phase 3 — Implementation (Workflow: pipeline by task DAG)

1. Create tasks via `TaskCreate`/`TaskUpdate` so progress is visible. If needed — `EnterWorktree`/isolation.
2. **Orchestrate by DAG:**
   - Sequential project dependencies (for example, a data/schema change before its consumers) run as a `pipeline()` — no barriers between stages. Derive the actual order from the codebase map; don't impose a fixed layer sequence.
   - Genuinely independent modules — `parallel()`. **If parallel agents edit files at the same time — give each `isolation: 'worktree'`**, otherwise they clobber each other; then integrate in a separate pass. By default prefer pipeline; parallel with isolation only for provably non-overlapping edits.
   - Tightly coupled edits with already-gathered precise context can be done directly (solo), leaving fan-out for review/verification — this is often cleaner than splitting coherent code across agents.
3. **Every task ends with the relevant checks.** Add or adjust tests at the level and location established by the repository, then run the exact targeted command from the verification recipe. Follow the project's runner, fixture, isolation, and integration conventions; don't assume Docker, pytest, a database policy, or a particular test directory. Discipline so the test proves behavior rather than faking green:
   - **Derive the test from a specific DoD item.** Take the expected value from the DoD / spec / a manual calculation — NOT from your implementation's actual output (a snapshot/golden taken by running the code does not count as a DoD check).
   - **Right-reason red.** First write the test on the DoD item and run it BEFORE implementing; paste the actual run tail (test name + `AssertionError: expected <value from DoD>, got <actual>`) into the IMPL doc. Only a red on `AssertionError` is valid; `ImportError`/`SyntaxError`/a fixture error = not-red, rewrite the test. Only after a valid red — write the code to green.
   - **Negative and boundary.** For each non-trivial behavior — at least one negative and one boundary case, not just the happy path.
   - **"Preserve behavior".** For such tasks first freeze the baseline on the OLD code; changing logic and its baseline/assert in one diff is forbidden unless the DoD explicitly allows a behavior change.
   - **Honest dead-end.** If a DoD item can't be closed by a test honestly (not implementable, contradicts the code / another item, needs an unavailable secret/data) — that's a real blocker (escalate, Phase 0), NOT grounds for skip/xfail/`assert True`/weakening.
   - **Forbidden ways to "green up"** (any one in a new/changed test = a "tests"-dimension finding in Phase 4, not a closed DoD): (1) `assert True`, the tautology `assert f(x) == f(x)`, a test with no assert, an assert against a value taken from the code itself; (2) `sys.exit(0)`, an unconditional `print("PASS")`, bypassing the runner; (3) skip/xfail/a commented-out/deleted failing case, `try/except` without re-raise; (4) `if input == <test-case>` + a hardcoded answer for the test input; (5) mock/patch of the tested unit itself or substituting its return — you may substitute (mock) only external boundaries by name (network, DB, time, FS).
   - **Check the result by exit code AND the count of collected/passed tests** (`passed` with ~0 collected = a finding), not by an `OK`/`passed` string.
4. **Minimal, consistent edits.** Don't widen scope, don't refactor unrelated things along the way. Take names/structure/patterns from neighboring analogs.

## Phase 4 — Adversarial review + verification (Workflow) — the main quality control instead of approval

1. **Review the diff** — group the relevant dimensions into the smallest number of bounded tasks (correctness/tests first; conventions, performance, and security only when applicable). **Adversarially verify** the resulting finding clusters within the cap (default "refuted if in doubt") before fixing — so as not to breed false edits.
2. **The "tests" dimension is run by a SEPARATE skeptic agent with fresh context** (NOT the code/test author). Its input: the DoD from the IDEA + the test diff; it opens the implementation only to verify a finding. "The run is green" and the author's reasoning are not arguments — **the default is inverted: a green `tests/` by itself does NOT close the DoD.** For each non-trivial DoD item — a yes/no rubric, any "no" = a finding (verified like the other findings of this phase):
   1. **Profile-bounded sabotage probe:** first group DoD items by critical invariant/risk cluster. In `economy`, use executable/static evidence and no mutation. In `balanced`, choose at most one representative mutation per critical cluster. In `thorough`, mutate each substantial DoD item. For every selected mutation, create a temporary isolated worktree, materialize the exact task-scoped implementation patch there, inject one plausible regression from the closed set (invert a condition `==`/`!=`, `>`/`<=`; shift a boundary; flip a `+`/`-` sign; delete a significant branch; return a constant), run the relevant test, and remove the isolated worktree after confirming the main working tree is untouched. No test went red → "no"; fix the TEST (`assert result != <mutant>` is forbidden). Skip an equivalent or unsafe-to-isolate mutation only with a one-line justification and substitute the next strongest evidence; a bare "equivalent" is not evidence.
   2. **Independent oracle**: name the specific DoD item that is the source of each expected value. A magic number without derivation from a requirement / a snapshot from the code itself = "no".
   3. **Real unit**: the real code of the unit-under-test executes; the unit itself and its direct return are not mocked.
   4. **Negative + boundary**: present — or a specific "why not" (not "not applicable").
   5. **No workarounds** in new/changed tests: `grep skip|xfail|# assert|sys.exit|except.*pass` → a manual review of the diff.
3. **Fix the confirmed findings:** repeat review → verification → fix only up to the tier's cycle cap, and stop earlier immediately after a round with no new confirmed findings.
4. **Full verification and honest report:** run the exact full recipe derived in Phase 0 — the repository's test suite plus its configured lint/typecheck/build checks, and migrations or runtime smoke checks only when the project defines them. Use the supported invocation from repository guidance, CI, task runners/package scripts, and existing conventions; don't substitute stack-specific commands or silently install tooling. If a required check has no discoverable command, report the gap instead of inventing one. Report results as they are.
5. **Re-grounding before the final report.** Re-read the DoD and Scope-IN from the IDEA file and present a table "each DoD item → what closes it (task + check)". Record the verification profile and mutation count/limit. A file changed outside Scope-IN = a scope-creep finding; an unclosed DoD item ≠ "done".

**Caveat (against ritual).** The Phase 3–4 rules are LENSES for the Phase 4 skeptic, proven by a command's output, not the author's self-awarded checkboxes (that is the "honest report"). Don't overdo it: aggressive "the reviewer must find holes" breeds flaky, false-finding noise, and over-engineering. The skeptic's focus is DoD coverage and defusing faked checks, NOT style. Mocking external boundaries is allowed; only mocking the unit-under-test itself is forbidden.

## Phase 5 — Wrap-up

1. **Finalize the IMPL:** record what was done, deviations, follow-ups, exact verification results, and an explicit final status. Re-check Scope-IN and every mandatory DoD item. A blocker, partial implementation, skipped mandatory check, or failed mandatory check must remain active and must not be archived.
2. **Capture durable memory:** only from the implemented and verified result, never from IDEA intent alone. Deduplicate and record only cross-task architecture, contracts/consumers, component relationships, recurring gotchas, rejected alternatives, or verified commands that meet the project-knowledge contract.
3. **Archive a successful bundle:** after — and only after — item 1 confirms completion, verify the IDEA↔IMPL identity and move the linked IDEA, IMPL, and any existing ANNOUNCE into `tasks/archive/<YYYY>/<task-slug>/` using the safe archive protocol. Update links and report each old → new path. If the destination exists, use the contract's deterministic suffix; never overwrite. The implementation remains uncommitted unless requested.
4. **Final report:** what was implemented (by task), test/build status, defaults, deferred work, memory entries created/updated, and exact archive paths (or the reason archival was correctly skipped). State explicitly that the implementation stage is done; reviewing changes, run/smoke, commit/PR follows project practice.
5. **Commit/PR only on request.** If on `main`/`master` — create a branch. Commit messages and the PR body — per the project's rules.

---

## Workflow-pattern cheatsheet (apply deliberately)

- **`pipeline()` by default.** A barrier (`parallel()` between stages) — only when the next stage needs ALL results of the previous one (dedup/merge/early exit).
- **Structured output.** Give agents `schema` so they return validated objects, not text to parse, and so they don't clutter your context.
- **Adversarial verification.** Verify finding clusters, not each item with fresh agents. Add a second/third lens only on conflict or confirmed high risk and within the cumulative cap; kill a finding if the available evidence refutes it.
- **Risk-based evidence.** Prefer executable/static proof, use one independent verifier by default, and spend mutations only within the selected verification profile's cap.
- **Worktree isolation** — required for verification mutations and concurrent agent edits; otherwise avoid its setup/disk cost.
- **Visibility.** `phase()`/`log()` — show progress, chosen tier, `used/cap`, any escalation signal, and the no-progress stop.
- **Don't stay silent about cuts.** If you bounded coverage (top-N, no retry, sample) — `log()` it.

## What NOT to do

- Don't stage an approval checkpoint and don't ask "should I continue" — the task is done turnkey. Stop only on a real blocker (a spike fails, the IDEA contradicts the code, an unavailable secret/access is needed, an IDEA defect on Scope/DoD, a `[?:…]` marker).
- Don't "green up" tests with workarounds (`assert True`, skip/xfail, a snapshot from your own code, mocking the unit-under-test itself, a hardcode for the test input) and don't derive the expected from the implementation's actual output — the test proves a DoD item, otherwise it's a Phase 4 finding, not a closed DoD.
- Don't re-open product decisions fixed in the IDEA (unless you found a direct contradiction with the code — then highlight it and ask).
- Don't declare "done" without a test/build run; don't gild the status.
- Don't archive a blocked/partial task or an artifact bundle whose identity was inferred only from a similar slug.
- Don't commit/push without an explicit request; don't widen scope beyond the IDEA.
- Don't build the implementation on an unverified spike.
