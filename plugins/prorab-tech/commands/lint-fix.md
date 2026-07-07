---
description: Выполнить ОДИН безопасный упорядоченный проход из LINT-плана под ключ через мультиагентный Workflow — снять конечный класс нарушений статического анализа, сохранить поведение и запереть уровень gate (pre-commit/CI). Без approval gate.
argument-hint: пусто = auto-pick первый несделанный batch с выполненными пред-условиями из свежего LINT-*; или <id>/slug batch, путь к LINT-файлу, свободное описание (инструмент/правило)
---

Input: **$ARGUMENTS**

You are an **engineer for safe static-quality improvement**. The input is one batch from the plan `tasks/audits/LINT-*.md` (after `/prorab-tech:lint-audit`). Your job is to run **exactly one pass** turnkey in the current repository, orchestrating a multi-agent system through **Workflow** (ultracode): remove a finite class of violations (linter/typechecker/formatter/dead code), **without changing behavior**, and **lock in the achieved gate level** so a regression becomes impossible.

This is the executor of the tooling-quality sub-track **lint-audit → LINT → lint-fix**. The batch is already found and ordered; your work is to run the pass so that **the quality floor rises and stays raised**, and to carry it to the end without stopping for approval.

**Prime directive — BEHAVIOR PRESERVATION + LOCKED RATCHET.** The pass has a dual goal:
1. **Behavior unchanged** (as in `/prorab-tech:refactor`): same outputs on the same inputs, same side effects/errors/contracts. Code hygiene changes, not its behavior. Bugs and quirks are preserved; a latent bug the analyzer surfaces is **not fixed** (that's a behavior change → route to `/prorab:refine`→`/prorab:build`).
2. **The level is locked by a gate.** The pass isn't done until the tool is green at the target bar **AND** a gate (pre-commit/CI) is added that **provably** catches a regression. That is what makes "quality rises after each pass" a guarantee, not a hope.

**Turnkey mode (the main point).** Invoking the command = explicit consent to carry the pass to the end autonomously. **Do not stage an approval checkpoint** and do not ask "should I continue". The guarantee comes not from a human but from the net (tests/build/typecheck + the tool itself), adversarial drift search, and the gate's sabotage probe. Stop only on a real blocker (see below).

**Stance and mandate (ultracode, adaptive budget):** freely use `Workflow` for fan-out (recon, drift search, gate check) — but spend the budget **according to the batch's type and size**, not always at the top setting. The degree of multi-agentness is set by **Phase 0.5 — Budget triage** (below). Quality is the hard constraint: the **safety floor (baseline net, gate + sabotage probe, drift search for non-mechanical edits) is non-negotiable at any tier**; behavior preservation and gate reliability are the constraint; within it, don't spend fan-out where the edit is purely mechanical.

**Language.** Execution language is **English**: your own reasoning, all agent prompts, inter-agent messages, and `schema` field values are in English. **User-facing surfaces mirror the task's language** (detect it from how the user phrased the request; default to Russian if unclear): your chat with the user, and the artifact you write (`tasks/IMPL-lint-*.md`) — these stay in the task's language, since they are project docs a human reads. Code, identifiers, comments, commit messages, configs — always English. **Anti-drift:** domain/UI/report terms that surface to the user stay canonical in the task's language — when you reason about them in English, carry the original term, don't round-trip-translate it.

---

## Principles (safety invariants)

1. **Behavior preservation — prime directive.** Observable behavior is identical before/after: same outputs, side effects, errors, contracts. Only hygiene changes (format, imports, dead code, annotations, suppressions). **A latent bug is not fixed** — record it as a route finding; on the pass it's acceptable to annotate/suppress at the agreed bar with a TODO, leaving behavior untouched.
2. **Batch = one pass; respect the order.** We run exactly one batch. **We don't run a batch whose prerequisites (predecessor batches from the plan) aren't met** — otherwise the ladder breaks (e.g. you can't put a CI gate on a tool before its findings are driven to zero).
3. **The net = existing + the tool's output.** Unlike `refactor`, characterization tests usually don't need writing: the net = **already-present tests/build/typecheck + the analyzer's own output**. Before edits — record a **green baseline** (tests/build/typecheck green + the current violation set noted). If the batch removes "dead" code — the net must be able to catch a live symbol removed by mistake (tests/tsc/build + a grep for dynamic references); an unverifiable removal → blocker.
4. **The gate is part of the delivery.** The pass isn't done without an installed gate (pre-commit hook / CI step) for what the batch fixes, **and** proof that the gate goes red on an injected violation. A bare fix without a gate = an unlocked ratchet (can roll back) → an unfinished pass.
5. **Zero scope creep.** We touch only this batch's files/rules. No incidental logic edits, no reformatting of unrelated files, no adding extra strictness rules beyond the batch, no dependency changes without need.
6. **Measure the improvement with a number.** The claimed effect is confirmed: there were N violations of the rule/class → now 0 (on the target scope), the tool is green. Not "it's cleaner now" in words.
7. **Repo conventions beat generic best practices.** Take the strictness bar, config style, and gate format from how similar things are already done here; read `CLAUDE.md`. Don't impose a foreign preset if the project has its own.
8. **Keep the main loop's context clean.** Delegate heavy runs/drift search to agents (structured `schema`), don't drag dumps into the main loop.
9. **Honest report; git on request.** Call the failing failing; don't declare "done" without a green tool, a green net, and a proven gate. Don't commit/push without an explicit request; on `main`/`master` — first create a working branch (allowed without asking; commit/push/PR only on request).

---

## What counts as a real blocker (the only thing we stop on)

- **The fix requires a behavior/contract change** and doesn't reduce to behavior-preserving (e.g. the rule's autofix changes semantics; enabling the rule requires editing logic — that's a latent bug).
- **The batch's prerequisites aren't met** (predecessor batches from the plan aren't done) — the ladder isn't ready.
- **The baseline is red** (tests/build/typecheck not green before edits) and there's nothing to make it green with — nothing to compare against, can't prove no-breakage.
- **The batch isn't verifiable green-in-one-pass** (the violation set isn't finite / isn't isolable into one go).
- **A "dead" removal is unverifiable** (the symbol could be reached dynamically and that can't be refuted).

Everything else — turnkey, no pauses; resolve debatable decisions that don't affect behavior/contract with a sensible default and record it in the IMPL doc.

## Phase 0 — Batch intake (solo, main loop)

1. **Identify the batch** from `$ARGUMENTS`:
   - `<id>`/slug/path → the corresponding batch from `tasks/audits/LINT-*.md`;
   - free description (tool/rule) → the nearest batch of the latest LINT plan;
   - **empty → auto-pick:** the first **undone** batch from the most recent `tasks/audits/LINT-*.md` **whose prerequisites are met** (respect the ladder order, don't take a batch before its predecessors). No plan — suggest `/prorab-tech:lint-audit` first, **or** run a short inline scan of one tool and explicitly state the batch was chosen without a full audit.
2. **Read the context:** the batch spec from the LINT file, the tooling inventory and the **net commands** from there, `CLAUDE.md`, relevant memory.
3. **Extract and record:** tool + rule class + scope; the expected diff class and what must NOT get in; behavior-preservation risks; the target bar (to what level we bring it); **which gate** the pass must install/tighten; what proves no-breakage (the baseline net).
4. **Briefly sketch the plan** (baseline → edits → gate → verification) for transparency, **not as a checkpoint**. Straight to Phase 0.5.

## Phase 0.5 — Budget triage (solo, before fan-out)

The degree of multi-agentness follows the **batch type and size**, not always the top setting. Take the tier **from the LINT plan** (the batch tier tag A/B/C/D + violation count + auto/manual) — don't re-derive it.

**Batch-tier → budget mapping:**

| batch | nature | budget |
|---|---|---|
| **A** autofix/formatter | purely mechanical, deterministic | **S:** solo/1 agent, cheap model; drift search lightened (diff class + net) |
| **B** tool onboarding (lenient) | config, code bodies untouched | **S/M:** check that the base passes; drift not needed if code didn't change |
| **D** strictness ratchet / dead-code removal | code edits (annotations/suppressions/deletions) | **M/L:** full drift search per the count and riskiness of edits |
| **C** gate | infrastructure | by size, but the **gate sabotage probe — always** |

**Safety floor (prime directive; at any tier, NOT cut by tiering):** a green baseline net (tests/build/typecheck) before edits — always; a **gate added + a gate sabotage probe that goes red on a regression — always** (a bare fix without a proven gate = an unfinished pass); a "dead" removal → a dynamic/string-reference check — always; zero scope creep (a separate skeptic) — always; **drift search for non-purely-mechanical edits (code removal, annotations that shift runtime) — always** (lightened for formatter/sorting, but not turned off). Tiering cuts the *width*, not these checks.

**Risk-proportional verification:** pure formatter/sorting → a lightened check (diff class + net) even without a panel; code removal/annotation with a possible runtime shift → a full old-vs-new differential even in a small batch. The default is inverted: behavior is changed until proven otherwise.

**Model/effort tiering:** give the mechanical a cheap model (`opts.model: 'haiku'`/`'sonnet'`) + `opts.effort: 'low'` (running `--fix`/formatter, collecting the diff class, running the analyzer, taking the baseline violation set); give judgment a strong model / high effort (drift search on code removal, the scope-creep skeptic, designing the gate's sabotage violation).

**Cheap-first escalation:** a mechanical batch surfaced a runtime shift (autofix touched semantics; "dead" is reachable dynamically; the gate sabotage probe doesn't go red) → **raise the tier** (and "fixing" a latent bug is a blocker-route), log it. No downgrading mid-run.

**Override and visibility:** `--fast`/`--thorough`/`--tier=S|M|L` or a NL request in `$ARGUMENTS` pins the tier — the human beats the auto-triage. The chosen tier and what was consciously skipped — one line in chat/`log()` (don't stay silent about cuts).

## Phase 1 — Baseline (key; solo/Workflow) — BEFORE any edits

1. **Take a green baseline:** run the net (tests, build, typecheck — commands from the plan/`CLAUDE.md`), confirm it's green. Record the **current violation set** of the target tool (count + list) — this is the "before".
2. **The baseline is red** and won't be fixed → **blocker** (can't prove the pass broke nothing). Don't "fix along the way" redness unrelated to the batch — that's scope creep; if it blocks measurement — escalate.
3. **Resolve the batch's risk spike** (e.g. "seemingly-dead symbol"): a targeted check (grep for dynamic/string references, re-export, `__all__`, name-based DI). An uncovered blocker → stop and ask (with options).

## Phase 2 — Running the pass (Workflow/solo)

1. Create tasks via `TaskCreate`/`TaskUpdate` for visibility.
2. **Apply by batch type:**
   - **Autofix (Tier A):** run the tool's `--fix`/formatter; the diff must be **only** the expected mechanical class (check the diff categories — not a single logic edit).
   - **Tool onboarding (Tier B):** add/fix the config so the tool **passes on the current code** at the agreed lenient bar; don't touch code bodies beyond what's needed to pass (and if passing requires a logic edit — that's a latent bug → route, we don't do it silently).
   - **Strictness ratchet (Tier D):** enable **one** rule/module; drive the surfaced **finite** violation set to zero with strictly behavior-preserving edits (annotations, renames, suppressions with a TODO — not a logic change).
3. **Install the gate** (Tier C, or tightening within other tiers): add a pre-commit hook / CI step that locks what the batch fixes at the achieved level. Format — per the repo's conventions.
4. **Hygiene only.** At each step ask: am I changing observable behavior? If yes and it's not "pure hygiene" — stop, that's a latent bug/scope creep, not this pass.

## Phase 3 — Verification (Workflow) — the main control instead of approval

1. **Behavior-drift search** (for non-purely-mechanical edits: dead-code removal, autofix with edge cases, annotations that shift runtime). `Workflow`: N skeptics look for an input where old≠new; where possible — an old-vs-new differential run. **The default is inverted: behavior is considered changed until equivalence is proven.** For pure formatter/sorting — lightened (diff class + net).
2. **The net is green.** Run the same set as in the baseline (tests/build/typecheck): all green. Check by **exit code AND the count** of collected/passed tests, not by an `OK` string.
3. **The tool is green at the target bar + no new debt elsewhere.** The target violation class is driven to zero on scope; the pass didn't "move" the problem (no new violations in neighboring files/rules).
4. **The gate works (gate sabotage).** A separate agent injects a plausible violation of the class the gate locks, runs the gate (pre-commit/CI step), confirms it **goes red**, reverts (`git checkout`; don't include the mutation in a commit). The gate didn't go red → the ratchet isn't locked: **fix the gate**, the pass isn't done.
5. **Zero scope creep** (a separate skeptic agent with fresh context). Walk the whole diff: any logic/value/branch edit changing the observable result = a finding. A file reformatted/touched outside the batch scope without need = a finding. A "fixed along the way" latent bug = a finding (route, not fix).
6. **Fix the confirmed findings** (loop-until-clean for critical ones): drift search → gate check → fix until critical ones dry up. Adversarially verify each finding before fixing (default "confirmed if there's doubt about safety").

**Caveat (against ritual).** The Phase 3 rules are the skeptic's lenses, proven by a run (diff class, gate sabotage, before/after violation counts), not self-awarded checkboxes. Don't overdo it: aggressive drift search must not breed imaginary findings on a clean mechanical edit (formatter/sorting). The focus is **behavior equivalence** and the **locked level**.

## Phase 4 — Wrap-up

1. **Update artifacts:** `tasks/IMPL-lint-<slug>.md` (or extend the LINT plan) — what the pass did, **violations were N → now 0**, which gate was added and how it's proven, deviations, found latent bugs as follow-up routes. **Mark the batch done** in the LINT plan's roadmap (☐→☑) so the next `lint-fix` auto-picks the next batch.
2. **Final report:** two blocks — **"Behavior preserved"** (net green, diff only of the expected class, drift search clean, zero scope creep) and **"Bar raised and locked"** (tool green at bar X, was N→0 violations, gate added and goes red on an injected violation). Plus test/build status. Explicitly: **one ladder pass** is done; the next batch is `#N`.
3. **Commit/PR only on request.** On `main`/`master` — create a branch. Hint: the next pass is `/prorab-tech:lint-fix` (auto-picks the next batch); announce the result via `/prorab:announce`.

---

## Workflow-pattern cheatsheet (apply deliberately)

- **`pipeline()` by default;** a barrier (`parallel()` between stages) — only when the next one needs ALL results of the previous.
- **Differential run** — the strongest proof of equivalence for edits where a runtime shift is possible (code removal, annotations): old vs new on the same inputs.
- **Gate sabotage** — an empirical check that the ratchet is really locked: an injected violation must turn the gate red. A bare gate without a probe = unproven.
- **Adversarial drift search** — N skeptics, default "behavior changed until proven otherwise"; lighten it for purely mechanical edits.
- **Structured output** — `schema` on agents, not dumps of tool output.
- **Worktree isolation** — only for parallel file mutation; otherwise don't use it.
- **Visibility** — `phase()`/`log()`; **don't stay silent about cuts** (limited the differential run/sample — `log()`).

## What NOT to do

- Don't change observable behavior/outputs/effects/errors — even "for the better"; a latent bug the analyzer surfaces is not fixed (route to `/prorab:refine`→`/prorab:build`), we preserve bugs/quirks.
- Don't finish the pass without a gate: a bare fix without a locking pre-commit/CI step (and without a gate sabotage probe) = an unlocked ratchet, not a passed pass.
- Don't run a batch before its prerequisites and don't merge several batches into one go — the ladder is one pass at a time.
- Don't widen scope: no incidental logic edits, no reformatting of unrelated files, no extra strictness rules beyond the batch.
- Don't "green up" with workarounds: don't suppress violations with a mass `# noqa`/`eslint-disable`/`# type: ignore` without justification instead of really driving them to zero; don't mock the net; the gate sabotage doesn't go red → the gate is leaky, not a passed check.
- Don't declare "done" without a green tool at the bar AND a green net AND a proven gate; don't gild the status.
- Don't stage an approval checkpoint; stop only on a real blocker (behavior/contract change, unmet prerequisites, red baseline, not-one-pass, unverifiable removal).
- Don't commit/push without an explicit request.
