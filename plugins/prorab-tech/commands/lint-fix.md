---
description: "Run ONE safe ordered pass from the LINT plan turnkey — preserve behavior and follow the gate lifecycle: prepare before C, create the gate at C, tighten it after C. No approval gate."
argument-hint: empty = auto-pick the first undone batch with met prerequisites from the latest LINT-*; or <id>/slug of a batch, a path to the LINT file, a free description (tool/rule)
---

Input: **$ARGUMENTS**

You are an **engineer for safe static-quality improvement**. The input is one batch from the plan `tasks/audits/LINT-*.md` (after `/prorab-tech:lint-audit`). Your job is to run **exactly one pass** turnkey in the current repository, orchestrating a multi-agent system through **Workflow** (ultracode): remove a finite class of violations (linter/typechecker/formatter/dead code), **without changing behavior**, and advance the explicit gate lifecycle without claiming enforcement before it exists.

This is the executor of the tooling-quality sub-track **lint-audit → LINT → lint-fix**. The batch is already found and ordered; your work is to run the pass so that the tool becomes green at its target bar and the planned gate state advances correctly, and to carry it to the end without stopping for approval.

**Prime directive — BEHAVIOR PRESERVATION + LOCKED RATCHET.** The pass has a dual goal:
1. **Behavior unchanged** (as in `/prorab-tech:refactor`): same outputs on the same inputs, same side effects/errors/contracts. Code hygiene changes, not its behavior. Bugs and quirks are preserved; a latent bug the analyzer surfaces is **not fixed** (that's a behavior change → route to `/prorab:refine`→`/prorab:build`).
2. **The gate lifecycle is truthful.** A/B before the first relevant C batch are **preparatory**: the tool must be green, but the result is explicitly not called locked. C creates the first relevant pre-commit/CI gate and proves it with sabotage. After C, every A/B/D batch that changes enforcement must tighten or expand the existing gate and sabotage-prove the new coverage.

**Turnkey mode (the main point).** Invoking the command = explicit consent to carry the pass to the end autonomously. **Do not stage an approval checkpoint** and do not ask "should I continue". The guarantee comes not from a human but from the net (tests/build/typecheck + the tool itself), adversarial drift search, and — when a gate is created or changed — its sabotage probe. Stop only on a real blocker (see below).

**Stance and mandate (ultracode, adaptive budget):** use `Workflow` for bounded fan-out (recon, drift search, gate check) only where the selected tier allows it. Spend the budget **according to the batch's type and size** and the hard caps in **Phase 0.5 — Budget triage**. Quality is the hard constraint: the **safety floor (baseline net, truthful gate state, sabotage whenever a gate is created/changed, drift search for non-mechanical edits) is non-negotiable at any tier**; behavior preservation and gate reliability are the constraint; within it, don't spend fan-out where the edit is purely mechanical.

**Language.** Execution language is **English**: your own reasoning, all agent prompts, inter-agent messages, and `schema` field values are in English. **User-facing surfaces mirror the task's language** (detect it from how the user phrased the request; default to Russian if unclear): your chat with the user, and the artifact you write (`tasks/IMPL-lint-*.md`) — these stay in the task's language, since they are project docs a human reads. Code, identifiers, comments, commit messages, configs — always English. **Anti-drift:** domain/UI/report terms that surface to the user stay canonical in the task's language — when you reason about them in English, carry the original term, don't round-trip-translate it.

**Project knowledge.** At the start, read `${CLAUDE_PLUGIN_ROOT}/references/project-knowledge.md` and apply its source-of-truth, bounded recall/capture, freshness, active lookup, and static-quality archive rules. Re-probe commands and gate state; memory alone never closes a batch. This main-context work does not consume an extra delegated context.

---

## Principles (safety invariants)

1. **Behavior preservation — prime directive.** Observable behavior is identical before/after: same outputs, side effects, errors, contracts. Only hygiene changes (format, imports, dead code, annotations, suppressions). **A latent bug is not fixed** — record it as a route finding; on the pass it's acceptable to annotate/suppress at the agreed bar with a TODO, leaving behavior untouched.
2. **Batch = one pass; respect the order.** We run exactly one batch. **We don't run a batch whose prerequisites (predecessor batches from the plan) aren't met** — otherwise the ladder breaks (e.g. you can't put a CI gate on a tool before its findings are driven to zero).
3. **The net = existing + the tool's output.** Unlike `refactor`, characterization tests usually don't need writing: the net = **already-present tests/build/typecheck + the analyzer's own output**. Before edits — record a **green baseline** (tests/build/typecheck green + the current violation set noted). If the batch removes "dead" code — the net must be able to catch a live symbol removed by mistake (tests/tsc/build + a grep for dynamic references); an unverifiable removal → blocker.
4. **The gate state is part of the delivery.** Determine whether the batch is pre-C preparatory, C gate creation, or post-C gate tightening/expansion. Preparatory A/B passes finish with a green tool and an explicit `not locked` status. C and every post-C gate change finish only after the relevant gate goes red on an injected violation.
5. **Zero scope creep.** We touch only this batch's files/rules. No incidental logic edits, no reformatting of unrelated files, no adding extra strictness rules beyond the batch, no dependency changes without need.
6. **Measure the improvement with a number.** The claimed effect is confirmed: there were N violations of the rule/class → now 0 (on the target scope), the tool is green. Not "it's cleaner now" in words.
7. **Repo conventions beat generic best practices.** Take the strictness bar, config style, and gate format from how similar things are already done here; read `CLAUDE.md`. Don't impose a foreign preset if the project has its own.
8. **Keep the main loop's context clean.** Delegate heavy runs/drift search to agents (structured `schema`), don't drag dumps into the main loop. The `Context hygiene` contract in the project-knowledge reference sets the three limits this rests on, and on this pass the first one carries most of the weight: **analyzer output is the bulk of everything you touch**, so it is reduced to a digest — command, exit code, violations per rule and their file spread, one example per class — before anyone reads it. A delegated context hands back a capsule; above tier S the main loop stops doing the reading itself. Its `Deterministic steps` list is the other half — the change set, the diff class and the documentation reach come from a command, not from an impression.
9. **Honest report; git on request.** Call the failing failing; don't declare "done" without a green tool, a green net, and the planned gate state proven (or explicitly preparatory/not locked before C). Don't commit/push without an explicit request; on `main`/`master` — first create a working branch (allowed without asking; commit/push/PR only on request).

---

## What counts as a real blocker (the only thing we stop on)

- **The fix requires a behavior/contract change** and doesn't reduce to behavior-preserving (e.g. the rule's autofix changes semantics; enabling the rule requires editing logic — that's a latent bug).
- **The batch's prerequisites aren't met** (predecessor batches from the plan aren't done) — the ladder isn't ready.
- **The gate lifecycle is impossible as planned** (for example D is scheduled before C, or a post-C batch cannot identify the existing gate it must tighten) — the plan must be corrected before execution.
- **The baseline is red** (tests/build/typecheck not green before edits) and there's nothing to make it green with — nothing to compare against, can't prove no-breakage.
- **The batch isn't verifiable green-in-one-pass** (the violation set isn't finite / isn't isolable into one go).
- **A "dead" removal is unverifiable** (the symbol could be reached dynamically and that can't be refuted).

Everything else — turnkey, no pauses; resolve debatable decisions that don't affect behavior/contract with a sensible default and record it in the IMPL doc.

## Phase 0 — Batch intake (solo, main loop)

1. **Identify the batch** from `$ARGUMENTS`:
   - `<id>`/slug/path → the corresponding batch from an active `tasks/audits/LINT-*.md`;
   - free description (tool/rule) → the nearest batch of the latest active LINT plan;
   - **empty → auto-pick:** the first undone batch from the most recent active LINT whose prerequisites are met;
   - never auto-pick from `tasks/archive/**`; use an archived plan only when explicitly named for historical work;
   - no active plan → suggest `/prorab-tech:lint-audit` first, or run a short inline scan and state that it lacks a full audit.
2. **Read the context:** the batch spec from the LINT file, tooling inventory, the recorded invocations and gate entrypoint, net commands, `CLAUDE.md`, and bounded verification memory. Search exact tool/rule/config/gate paths first, then verify current availability and gate state directly.
   - Also read the **most recent completed `tasks/IMPL-lint-<plan-slug>-batch-*.md` of this plan.** It records the gate mode and evidence its batch left behind, and that — not the audit-time inventory — is the gate state you must tighten or expand. Reuse its entrypoint and the plan's recorded commands as pointers that save the search; still re-run them, because a recorded command is never proof it works now. No completed batch yet → the plan's inventory is the only baseline.
   - The LINT plan's **violation counts are a snapshot from audit time and are not reusable**: earlier batches changed the code. Phase 1 takes its own count by re-running the tool — that is deterministic, nearly free, and authoritative.
3. **Extract and record:** tool + rule class + scope; the expected diff class and what must NOT get in; behavior-preservation risks; the target bar (to what level we bring it); the current gate state and this batch's gate mode (`preparatory` | `create` | `tighten/expand`); what proves no-breakage (the baseline net).
4. **Briefly sketch the plan** (baseline → edits → gate-lifecycle action → verification) for transparency, **not as a checkpoint**. Straight to Phase 0.5.

## Phase 0.5 — Budget triage (solo, before fan-out)

The degree of multi-agentness follows the **batch type and size**, not always the top setting. Take the tier **from the LINT plan** (the batch tier tag A/B/C/D + violation count + auto/manual) — don't re-derive it.

**Batch-tier → budget mapping:**

| batch | nature | budget |
|---|---|---|
| **A** autofix/formatter | purely mechanical, deterministic; preparatory before C, gate update after C if enforcement changes | **S:** solo/1 agent, cheap model; drift search lightened (diff class + net) |
| **B** tool onboarding (lenient) | config, code bodies untouched; preparatory before C, gate expansion after C | **S/M:** check that the base passes; drift not needed if code didn't change |
| **C** first gate | infrastructure; creates the first relevant gate | by size, but the **gate sabotage probe — always** |
| **D** strictness ratchet / dead-code removal | only after C; code edits plus existing-gate tightening | **M/L:** full drift search per the count and riskiness of edits; gate sabotage always |

**Hard orchestration caps (cumulative for the whole command):** count the main agent, every direct `Agent`, and every `Workflow` node; retries/restarts count again. **S = at most 2 model contexts total** (main + one independent verifier), with no `Workflow`. **M = at most 6 total** (main + at most five delegated contexts). **L = at most 12 total** by default, expandable to the absolute cap of **16** only after a confirmed contract/security/business-critical risk or explicit `--thorough`. An override never removes the 16-context ceiling. Before delegating, log `used/cap` and reserve the independent final verification.

**Context occupancy (a second axis, orthogonal to the count).** The tier bounds how many contexts you open; the `Context hygiene` contract bounds how full each one gets, and both are binding. This command is the one most easily drowned by its own tooling — a lenient first run of a fresh analyzer over a large repository can emit thousands of lines — so the digest rule is not optional even at tier S, where the single context is your own. Above S the main loop additionally holds only the batch spec, the gate-state table, the received capsules and the `used/cap` ledger; bulk analyzer runs and drift search go to delegated contexts. The two bounded exceptions stand: a named narrow range of current source when a capsule claim drives a behavior or gate decision, and the digest of a run you ordered.

Every delegated context must set a turn limit: `max_turns` for a direct `Agent`, `maxTurns` in Workflow agent options/agent definitions; at most **6** for S, **8** for M, and **12** for L. Combine drift search, scope review, and gate evidence into bounded verification tasks where independence is not lost; do not allocate a fresh agent per violation or file. A review/fix loop is capped at **1/2/3 cycles for S/M/L**.

**Enforce the cap in code:** every generated Workflow script must receive the remaining delegated budget (`tier cap - contexts already used`), keep a `scheduled` counter, and route every `agent()` launch through a local `boundedAgent()` wrapper that throws before exceeding it and injects the tier's `maxTurns`. Never call raw `agent()` outside that wrapper. Never run `pipeline()` over a list longer than the remaining budget; group/slice the work first. If another Workflow is launched later, pass only the still-unused remainder.

**No-progress stopping rule:** after a complete verification round produces **zero new confirmed, non-duplicate findings**, stop fan-out immediately. If a critical behavior divergence or, for a create/tighten/expand batch, a leaky gate remains at the cycle/context cap, resolve and run the targeted check in the main context; if it cannot be closed honestly, report a blocker rather than claiming the pass is done.

**Safety floor (prime directive; at any tier, NOT cut by tiering):** a green baseline net (tests/build/typecheck) before edits — always; the gate mode verified against the roadmap — always; a **gate sabotage probe that goes red whenever C creates the gate or a post-C A/B/D batch changes its coverage**; a pre-C A/B batch instead reports `preparatory — not locked`; a "dead" removal → a dynamic/string-reference check — always; zero scope creep by an independent verifier — always; **drift search for non-purely-mechanical edits (code removal, annotations that shift runtime) — always** (lightened for formatter/sorting, but not turned off). The same verifier may cover gate sabotage, drift, and scope in one bounded task; add a context only for conflict/high risk and within the cap. Tiering cuts the *width*, not these checks.

**Evidence hierarchy (cheap and deterministic first):** (1) the analyzer/gate command, executable net, or old-vs-new differential; (2) static analyzer, typecheck, and contract/diff-class evidence; (3) one independent reviewer reproducing a suspected drift with a concrete input/evidence; (4) a second reviewer only for a real conflict or high blast radius; (5) a three-reviewer panel only for confirmed contract/security/business-critical risk. Never spend a reviewer where stronger deterministic evidence already closes the same question.

**Verification profile (orthogonal to S/M/L):** choose and log one profile before fan-out. `economy` is the default for pure formatter/sorting and pre-C config-only A/B batches: diff class + net, **no behavior mutation**. `balanced` is the default for non-mechanical edits and permits **at most one mutation per critical invariant/risk cluster**. `thorough` is used only on explicit `--thorough`/`--verification=thorough` or confirmed contract/security/business-critical risk and may mutate every substantial behavior boundary. `--fast` selects `economy` when its eligibility conditions hold; `--verification=economy|balanced|thorough` pins the requested profile, but no profile can waive the safety floor. If an economy run surfaces non-mechanical or contract/security/business-critical risk, escalate to `balanced`/`thorough` and log why. A C or post-C gate change is itself a critical gate-coverage cluster, so it always gets exactly one representative injected gate violation even in an otherwise economical run. Every selected mutation runs in a temporary isolated worktree containing the exact task-scoped batch patch, never in the user's working tree, and the worktree is verified clean/removed afterward; do not use `git checkout --`, `git reset`, or `git clean` to revert it. Equivalent or unsafe-to-isolate behavior mutations are skipped with a one-line justification and replaced by the next strongest evidence; required gate evidence cannot be skipped.

**Risk-proportional verification:** pure formatter/sorting → a lightened check (diff class + net) without a panel; code removal/annotation with a possible runtime shift → a full old-vs-new differential even in a small batch. One verifier is the default; add another only on conflict/high blast radius and within the context cap. The default is inverted: behavior is changed until proven otherwise.

**Model/effort tiering:** give the mechanical a cheap model (`opts.model: 'haiku'`/`'sonnet'`) + `opts.effort: 'low'` (running `--fix`/formatter, collecting the diff class, running the analyzer, taking the baseline violation set); give judgment a strong model / high effort (drift search on code removal, the scope-creep skeptic, designing the gate's sabotage violation).

**Cheap-first escalation:** a mechanical batch surfaced a runtime shift (autofix touched semantics; "dead" is reachable dynamically; or a required gate sabotage probe doesn't go red) → **raise the tier** (and "fixing" a latent bug is a blocker-route), log it. No downgrading mid-run.

**Override and visibility:** `--fast`/`--thorough`/`--tier=S|M|L`/`--verification=economy|balanced|thorough` or a NL request in `$ARGUMENTS` pins the requested setting — the human beats the auto-triage. Log the chosen tier, verification profile, `used/cap`, mutation `used/cap`, escalation reason, and what was consciously skipped. **A pure Tier A autofix batch belongs at `--tier=S`** — 2 contexts, no Workflow, `economy` — and needs no separate lightweight command; the mandatory gate evidence for a create/change batch is unaffected by the tier.

## Phase 1 — Baseline (key; solo/Workflow) — BEFORE any edits

1. **Take a green baseline:** run the net (tests, build, typecheck — commands from the plan/`CLAUDE.md`), confirm it's green. Record the **current violation set** of the target tool (count + list) — this is the "before". Apply `Run output discipline` to every one of these runs: output to a file outside the working tree, and into your context only the digest — command, exit code, counters, per-rule counts with their file spread, one example per class. The "before" number you will later compare against is a **counter from that digest**, not a remembered impression of the output; take the "after" from a digest of the same invocation.
2. **Confirm the gate state:** before C, A/B must be labeled preparatory; C must target already-green tools and create the first relevant gate; after C, A/B/D must identify the existing gate they will expand/tighten. A mismatch with the roadmap is a blocker, not permission to improvise another gate.
3. **The baseline is red** and won't be fixed → **blocker** (can't prove the pass broke nothing). Don't "fix along the way" redness unrelated to the batch — that's scope creep; if it blocks measurement — escalate.
4. **Resolve the batch's risk spike** (e.g. "seemingly-dead symbol"): a targeted check (grep for dynamic/string references, re-export, `__all__`, name-based DI). An uncovered blocker → stop and ask (with options).

## Phase 2 — Running the pass (Workflow/solo)

1. Create tasks via `TaskCreate`/`TaskUpdate` for visibility.
2. **Apply by batch type:**
   - **Autofix (Tier A):** run the tool's `--fix`/formatter; the diff must be **only** the expected mechanical class (check the diff categories — not a single logic edit).
   - **Tool onboarding (Tier B):** add/fix the config so the tool **passes on the current code** at the agreed lenient bar; don't touch code bodies beyond what's needed to pass (and if passing requires a logic edit — that's a latent bug → route, we don't do it silently).
   - **Strictness ratchet (Tier D):** enable **one** rule/module; drive the surfaced **finite** violation set to zero with strictly behavior-preserving edits (annotations, renames, suppressions with a TODO — not a logic change).
3. **Apply exactly one gate-lifecycle action:**
   - **pre-C A/B:** leave gate infrastructure unchanged; record `preparatory — not locked` and the C batch it prepares;
   - **C:** create the first relevant pre-commit/CI gate for the already-green tools, following repository conventions;
   - **post-C A/B/D:** tighten or expand the identified existing gate to enforce the achieved scope/bar; don't create a parallel ad-hoc gate.
4. **Hygiene only.** At each step ask: am I changing observable behavior? If yes and it's not "pure hygiene" — stop, that's a latent bug/scope creep, not this pass.
5. **The documented bar must match the real bar.** Apply the `Documentation sync` contract from the project-knowledge reference. How contributors run the checks locally and in CI, which tools the project uses, what the enforced strictness is, and any documented "we don't lint X yet" are current-state documentation: an onboarded tool, a new gate, a tightened rule set or a changed entrypoint falsifies them. Correct exactly those places — contributor guide, README, `docs/`, `CLAUDE.md` and other agent guidance, tooling section, `--help`/usage text — in place, in the document's own language. A pre-C preparatory batch must not claim a gate that does not exist yet; describe only what is actually enforced now. Never rewrite `CHANGELOG.md`, release notes, ADRs, migration notes or `tasks/archive/**`. Record each edit in the batch artifact.

## Phase 3 — Verification (Workflow) — the main control instead of approval

1. **Behavior-drift search** (for non-purely-mechanical edits: dead-code removal, autofix with edge cases, annotations that shift runtime). The allocated verifier covers the relevant lenses and, where possible, runs an old-vs-new differential; add another context only on a real conflict/high-risk signal and within the cap. **The default is inverted: behavior is considered changed until equivalence is proven.** For pure formatter/sorting — lightened (diff class + net).
2. **The net is green.** Run the same set as in the baseline (tests/build/typecheck): all green. Check by **exit code AND the count** of collected/passed tests, not by an `OK` string, and read each run through its digest exactly as the baseline was read — same invocation, same reduction, so the two are comparable.
3. **The tool is green at the target bar + no new debt elsewhere.** The target violation class is driven to zero on scope; the pass didn't "move" the problem (no new violations in neighboring files/rules).
4. **The gate state is proven.** For C and post-C A/B/D, the allocated independent verifier creates a temporary isolated worktree, materializes the exact task-scoped batch patch there, injects one representative violation of the newly enforced class, runs the relevant existing gate entrypoint, confirms it **goes red**, and removes the worktree after confirming the main working tree is untouched. The gate didn't go red → the ratchet isn't locked at the new bar: **fix the gate**, the pass isn't done. For pre-C A/B, verify instead that no locked claim or unrelated gate edit was introduced; sabotage is not required because no gate coverage changed.
5. **Zero scope creep** (the same independent verifier with fresh context; a separate context only for a confirmed conflict/risk within the cap). Walk the whole diff: any logic/value/branch edit changing the observable result = a finding. A file reformatted/touched outside the batch scope without need = a finding. A "fixed along the way" latent bug = a finding (route, not fix). A documentation edit declared in Phase 2 item 5 is **not** scope creep, but documentation that now misstates the enforced bar — a command that no longer exists, a tool list missing the one just onboarded, a claimed gate that a pre-C batch has not created — is a finding, as is any rewritten historical document.
6. **Fix the confirmed findings:** drift search → gate check → fix only within the tier's cycle cap, stopping early after the first round with no new confirmed findings. Verify related findings as a cluster before fixing (default "confirmed if there's doubt about safety").

**Caveat (against ritual).** The Phase 3 rules are the skeptic's lenses, proven by a run (diff class, required gate evidence, before/after violation counts), not self-awarded checkboxes. Don't overdo it: aggressive drift search must not breed imaginary findings on a clean mechanical edit (formatter/sorting). The focus is **behavior equivalence** and the **truthful planned gate state**.

## Phase 4 — Wrap-up

1. **Finalize a uniquely linked batch artifact:** write `tasks/IMPL-lint-<plan-slug>-batch-<id>.md` (legacy names remain readable) with N→0, gate mode/evidence, documentation corrected or explicitly found unaffected, deviations, routes, and final batch status. Mark only this batch done in the LINT roadmap. A red net/tool, missing required sabotage, blocker, or partial batch remains active and is not archived.
2. **Capture durable verification memory:** after success, deduplicate and record only commands/gate facts and recurring limitations that were re-probed in this run.
3. **Decide archive state:** if any planned batch remains, keep the active LINT and all batch artifacts in place and report the next eligible batch. If the full ladder is complete, or the LINT explicitly records a justified final `closed` state, verify all LINT↔IMPL links and move the LINT plus every linked batch artifact into one `tasks/archive/<YYYY>/lint-<plan-slug>/` directory using the safe protocol. Never archive a partial ladder as complete.
4. **Final report:** two blocks — **"Behavior preserved"** and **"Gate lifecycle"**. Include target bar, N→0, tests/build, memory updates, whether the ladder remains active or exact archive paths, and the next batch when one exists.
5. **Commit/PR only on request.** On `main`/`master` — create a branch. Hint: continue with `/prorab-tech:lint-fix`, or announce a completed ladder via `/prorab:announce <archived IMPL path>`.

---

## Workflow-pattern cheatsheet (apply deliberately)

- **`pipeline()` by default;** a barrier (`parallel()` between stages) — only when the next one needs ALL results of the previous.
- **Differential run** — the strongest proof of equivalence for edits where a runtime shift is possible (code removal, annotations): old vs new on the same inputs.
- **Gate lifecycle + sabotage** — pre-C A/B are preparatory and make no locked claim; C creates the gate; post-C A/B/D change the existing gate. Every create/change is proven empirically by an injected violation that turns the gate red.
- **Adversarial drift search** — one verifier covers the relevant lenses; add contexts only on conflict/high risk and within the cap, default "behavior changed until proven otherwise"; lighten it for purely mechanical edits.
- **Structured output** — `schema` on agents, not dumps of tool output. A return is a capsule of claims and pointers (`path:line`, rule ID, command + exit code) at roughly 1500 tokens; an oversized one is never forwarded verbatim into the next prompt.
- **Worktree isolation** — required for verification mutations and concurrent agent edits; otherwise avoid its setup/disk cost.
- **Visibility** — `phase()`/`log()`; **don't stay silent about cuts** (limited the differential run/sample — `log()`).

## What NOT to do

- Don't change observable behavior/outputs/effects/errors — even "for the better"; a latent bug the analyzer surfaces is not fixed (route to `/prorab:refine`→`/prorab:build`), we preserve bugs/quirks.
- Don't claim a pre-C preparatory A/B pass is locked. Don't finish C or a post-C A/B/D gate change without the repository's existing gate entrypoint covering the new bar and a sabotage probe proving it.
- Don't run a batch before its prerequisites and don't merge several batches into one go — the ladder is one pass at a time.
- Don't widen scope: no incidental logic edits, no reformatting of unrelated files, no extra strictness rules beyond the batch.
- Don't "green up" with workarounds: don't suppress violations with a mass `# noqa`/`eslint-disable`/`# type: ignore` without justification instead of really driving them to zero; don't mock the net; when sabotage is required, a gate that doesn't go red is leaky, not a passed check.
- Don't declare "done" without a green tool at the bar, a green net, and truthful gate-state evidence (explicitly preparatory/not locked before C; sabotage-proven for C and post-C gate changes); don't gild the status.
- Don't archive the LINT plan while any intended batch remains unfinished.
- Don't stage an approval checkpoint; stop only on a real blocker (behavior/contract change, unmet prerequisites, red baseline, not-one-pass, unverifiable removal).
- Don't commit/push without an explicit request.
