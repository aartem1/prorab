# Changelog

All notable changes to the prorab framework. Versions follow [SemVer](https://semver.org/).
The marketplace has **two plugins** with independent versions: `prorab` (the product track) and
`prorab-tech` (the tech-quality track). Each one's version lives in its
`plugins/<plugin>/.claude-plugin/plugin.json` and is duplicated in `.claude-plugin/marketplace.json`.
The entries below are tagged with the plugin they concern.

## prorab 0.11.0 · prorab-tech 0.10.0

**Documentation stops drifting away from the code, and `quick` stops being invisible.** Two changes
with one motive: the written state of a project should not silently fall behind what the code does.

- **New shared contract — `Documentation sync`** (in both `references/project-knowledge.md` files).
  A command that changes code now **owns the documentation that change falsifies**; a stale document
  left behind is an incomplete change, not a follow-up, and it counts against the command's own
  completion condition. The dividing line is what a file is *for*: *current-state* documents (README,
  `docs/`, the spec, API/configuration references, runbooks, `CLAUDE.md` and other agent guidance,
  docstrings, comments, `--help` text) are corrected in place; *historical* documents
  (`CHANGELOG.md`, release notes, ADRs, migration notes, `tasks/archive/**`, completed task
  artifacts) are **never** rewritten to match new code — a new entry may be added where the project's
  convention calls for one, but a past entry stays as it was written.
- **Bounded on purpose.** The duty covers only what the change makes *factually wrong* — a renamed
  symbol or path, a changed default, flag, signature, limit, format or command, an example that
  would now behave differently, a step that no longer exists. Style rewrites, pre-existing gaps,
  restructuring, and corrections needing a product decision are **reported with a follow-up named**,
  not absorbed into the diff. A correction larger than the code change itself is reported, not made.
  And "nothing was affected" must be earned by searching the docs for the symbols, paths, flags and
  literal values the change touched.
- **Wired into every executor, each where it belongs.** `build` corrects docs as tasks land (Phase 3)
  and discharges the duty explicitly during Phase 4 re-grounding — a current-state document still
  contradicting the diff is a *finding of that phase*. `refactor` gets the case behavior preservation
  would otherwise excuse: a rename or a moved module leaves docs wrong even though nothing observable
  changed. `lint-fix` gets the case that matters most for it — the documented way to run the checks
  and the documented strictness bar must match the gate that now exists, and a pre-C preparatory
  batch must not describe a gate it has not created. In all three, scope-creep review was taught the
  distinction: a *declared* documentation edit is not creep, an undeclared or over-wide one is, and a
  rewritten historical document always is.
- **`quick` now leaves one compact artifact — `tasks/quick/QUICK-<slug>.md`.** Previously it wrote
  nothing at all, which kept it cheap but made small changes invisible to `ask`, to a later `audit`,
  and to anyone reading the project's history. The record holds what changed and why, the DoD table,
  the exact checks and their real results, the documentation corrected, and the verifier's verdict.
  It costs one `Write` in a context `quick` already has — no new context, no Workflow, no archive,
  still no IDEA/IMPL. Slug collisions use the same deterministic `-2`/`-3` suffix as the archive
  protocol and never overwrite.
- **The artifact is a floor, not an IMPL.** It is capped at about a screen — if the change can't be
  stated honestly in that space, the eligibility gate should have fired, so the size of the record is
  itself a signal. A run that escalates *after* already editing files still writes the record with
  `status: escalated`, naming what is half-done and which command takes over; a run that escalates
  before touching anything writes nothing. An abandoned edit with no record was exactly the
  divergence this change is meant to prevent.

## prorab 0.10.0 · prorab-tech 0.9.0

**The tech track gets its own handoff — shaped by what each pair actually wastes.** `prorab` is
unchanged in this release. This entry **supersedes the "not covered yet" note below**: the structural
pair does need the hashed handoff, and it buys more safety than tokens; the static pair does **not**,
because its numbers go stale by construction and re-probing them is a deterministic command that
costs almost nothing.

- **`audit` records provenance (structural pair):** the #1 candidate spec now carries the recorded
  commit plus `git hash-object` hashes of the target files, the test files its net status rests on,
  and the call-site files — a caller can change while the target stays byte-identical, which would
  otherwise invalidate the blast-radius claim invisibly.
- **`refactor` checks that provenance in Phase 0, before choosing a tier** — deliberately earlier
  than recon, because the tier depends on it. `refactor` previously took `safety`,
  `coverage_nearby`, `blast_radius` and the size/confidence scoring straight from the AUDIT and was
  told not to re-derive them, so a month-old audit silently set the budget and the safety assessment
  of a behavior-preservation change. Now staleness is explicit and typed: a stale **target** makes
  the candidate obsolete unless the smell is re-confirmed in current code (not a blocker — a
  finished candidate, with the next one offered); a stale **test** file voids the coverage claim and
  forces a from-scratch net assessment in Phase 1.5; a stale **call-site** file voids the blast
  radius. Any staleness at all means the tier is re-derived rather than inherited.
- **`refactor` reuses only the fresh part of the map:** fresh paths are adopted as the Phase 1
  result at zero recon cost, recon is scoped to the stale ones and to call-sites that were never
  hashed, and the saving is banked rather than respent. Freshness is explicitly **not** evidence of
  equivalence — the net green on the OLD code, the contract diff, and at least one drift/differential
  run remain mandatory.
- **`lint-audit` hands over commands, not counts:** the plan now records each analyzer invocation
  verbatim as run read-only, the net commands, and the gate entrypoint (config path + the command
  that runs it), with the probe date and commit. The violation counts are labeled a snapshot, not a
  handoff.
- **`lint-fix` reads the previous completed batch:** the gate state to tighten or expand comes from
  the most recent completed `IMPL-lint-*-batch-*.md` of the plan rather than being rediscovered,
  since that batch is what last changed it. Recorded commands are pointers that save the search and
  are still re-run — a recorded command is never proof it works now — and every batch still takes
  its own baseline count.
- **No new tech-track command, deliberately.** `refactor --tier=S` is already two contexts with no
  Workflow and already runs without an AUDIT, and `lint-fix` is already one batch at a time, so a
  "quick" analogue would only drop the IMPL artifact — which on a behavior-preservation track *is*
  the record of what equivalence evidence was produced. Both commands now point at `--tier=S` as the
  intended cheap lane instead.
- **`/clear` handoff in both audits,** with the reason stated: the command that judged a candidate
  safe should not also be the one proving nothing drifted, and the recorded provenance/invocations
  are what make the fresh context nearly free.

## prorab 0.10.0 · prorab-tech 0.8.0

**A cheap lane for small changes, and a recon handoff so `build` stops re-studying the code.** Both
changes target the same cost — the duplicated work and the fixed ceremony around a small task —
without touching the quality floor of the heavy path. Deliberately *not* done: merging `refine` and
`build` into one command. Prompt-body deduplication saves under 1% of a heavy run, while carrying the
refine transcript into build's phases costs more context than it saves, unfreezes the DoD before the
implementation exists, and turns the final Scope/DoD re-grounding into self-assessment by the author
of the idea. The saving people expect from merging is the recon reuse below, which does not require
it.

- **`Code map` handoff in the IDEA (proposal 11):** `refine` now records what it *already* read —
  files studied with their role and a `git hash-object` content hash, reuse points, change points,
  contracts at risk, conventions to mirror, honest "not studied" gaps, and observed-but-unrun
  verification commands. Bookkeeping only: it is never a reason to widen recon or spend another
  `Explore` context.
- **`build` reuses only a provably fresh map:** it re-hashes the listed paths and compares. All
  fresh → zero recon contexts spent; partly fresh → recon scoped to the stale entries and the
  declared gaps; no map, no hashes, or a non-git project → normal recon. Saved contexts are banked,
  not respent, and progress logs report `recon reused: <n> fresh, <m> stale`.
- **Trust stays bounded:** a matching hash proves the file is unchanged, not that `refine` read it
  correctly, so a map claim that drives an external-contract edit is still opened in current source.
  The observed-commands line is a hint; the verification recipe is still derived and confirmed in
  Phase 0. A missing or malformed map is a lost saving, never a blocker.
- **New `/prorab:quick` (proposal 12):** a standalone short command for a 1–2 file everyday change —
  no IDEA/IMPL, no archive, no `Workflow`, at most 2 model contexts (itself plus one independent
  verifier with `max_turns: 6`). It keeps the evidence floor: a DoD stated as `input → expected`
  before any edit, a red-for-the-right-reason test (`AssertionError`, not `ImportError`), the
  project's own check commands, and a verifier that defaults to refuted-if-in-doubt.
- **`quick` cannot quietly do a big task:** an eligibility gate is checked before editing and again
  after locating the code. An external contract, more than ~2–3 files or one layer, two incompatible
  readings, security/auth/payment logic, behavior-preserving restructuring, or a missing
  secret/access forces a handover to `/prorab:refine`+`build` or the tech track. A second confirmed
  verification round also escalates instead of grinding.
- **Explicit fresh-context handoff:** after saving an IDEA, `refine` names the next step —
  `/clear`, then `/prorab:build <slug>` — and explains that the fresh context is what keeps build's
  DoD check independent, or routes a genuinely tiny remainder to `/prorab:quick`.
- **Contract tests extended** for the hashed handoff, the reuse/staleness rules, and `quick`'s
  bounds, gate, and evidence floor.
- **Not covered yet:** the same recon handoff for `audit → refactor` and `lint-audit → lint-fix`;
  the tech track is unchanged at `prorab-tech 0.8.0`.

## prorab 0.9.0 · prorab-tech 0.8.0

**Built-in project memory and a structural archive for completed work.** Both tracks now recall
small task-specific knowledge digests, verify material claims against current evidence, capture only
durable cross-task facts, and physically separate completed task bundles from active artifacts.

- **Transparent Markdown memory:** lazily created `tasks/memory/INDEX.md` plus small component,
  decision, gotcha, and verification entries. Each entry records type/status, verification dates,
  artifact/current-path evidence, confirmed facts separately from inference, and invalidation
  conditions. No init step, external service, embeddings, model, daemon, or transcript storage.
- **Current evidence remains authoritative:** worktree → repository instructions/docs →
  tests/CI/executable evidence → task artifacts → memory. Exact path/symbol/component/domain matches
  precede broader search; material recalled claims are reopened in current source and stale or
  conflicting entries are updated, superseded, or marked stale.
- **Automatic lifecycle integration:** `refine`, `build`, `audit`, `refactor`, `lint-audit`, and
  `lint-fix` capture only durable knowledge after their own success condition. `announce` consumes
  already-verified facts and normally captures nothing.
- **New `/prorab:ask`:** compact read-mostly answers for current structure/behavior, historical
  decisions, consumers, and verification. It searches memory plus active/archive artifacts,
  verifies current claims in code/docs, uses Git history for historical questions, and separates
  current, historical-only, and unverified statements.
- **Completed product bundles:** after Scope/DoD and mandatory verification pass, `build` moves the
  linked IDEA+IMPL(+existing ANNOUNCE) to `tasks/archive/<YYYY>/<task-slug>/`. `announce` finds
  archived sources and saves beside them without restoring active copies.
- **Safe structural edge case:** a completed candidate from a multi-candidate AUDIT gets a scoped
  archived AUDIT snapshot with its IMPL; the original AUDIT remains active until its other
  candidates are completed.
- **Truthful static ladder:** each successful lint batch has a uniquely linked IMPL artifact. A
  partial ladder remains active; only a completed or explicitly closed ladder moves its LINT and all
  linked batch artifacts into one archive directory.
- **Archive safety and compatibility:** explicit artifact identity checks, exact paths, traversal
  rejection, deterministic conflict suffixes, no overwrite, link updates, destination re-read, and
  a moved-file report. Legacy active artifact names remain readable and archive is never selected
  as active work by default.
- **Bundled shared contracts:** each plugin ships one `references/project-knowledge.md`, avoiding
  repetition across command bodies without relying on files outside the installed plugin.

## prorab 0.8.0 · prorab-tech 0.7.0

**Risk-based verification instead of ritual fan-out and mutations.** Both tracks now spend
verification effort according to the specific risk while preserving the existing hard context
caps and command-specific safety floors.

- **Cheap-first evidence hierarchy:** executable tests/differential runs → static/type/contract
  evidence → one independent reviewer → a second only on conflict/high blast radius → a
  three-reviewer panel only for confirmed contract/security/business-critical risk.
- **Three verification profiles:** `economy` skips mutations for low-risk, contract-untouched work;
  `balanced` (the default otherwise) allows at most one mutation per critical invariant/risk
  cluster; `thorough` may mutate each substantial DoD item or behavior boundary.
- **Profiles are independent from S/M/L.** Context tier controls orchestration width; verification
  profile controls mutation intensity. `--fast`, `--thorough`, and
  `--verification=economy|balanced|thorough` pin the profile, and progress logs include mutation
  `used/cap` alongside context `used/cap`.
- **Gate evidence remains strict:** creating or expanding a lint gate is a critical invariant and
  still receives one representative injected violation, including in an otherwise economical run.
- **Mutation isolation:** every selected verification mutation runs in a temporary isolated
  worktree; the commands no longer instruct agents to revert mutations with `git checkout --` in
  the user's working tree.
- **Valid command metadata:** `refactor` frontmatter strings containing a colon/hash are quoted so
  the command file parses as YAML.
- **Roadmap synchronized:** proposal #8 is marked implemented; the eval-suite proposal is explicitly
  deferred because of its implementation and maintenance cost.

## prorab 0.7.0 · prorab-tech 0.6.0

**Stack-agnostic build verification and a coherent lint-gate lifecycle.** Both command tracks get
a backward-compatible behavior correction, so both plugins receive a minor bump.

- **`build` derives a verification recipe.** It now discovers exact targeted/full test, lint,
  typecheck, build, migration, and smoke commands from repository guidance, CI, task runners,
  package scripts, and existing test conventions. Hard-coded assumptions about `services/`, Docker
  pytest, Alembic, Vite, and a backend/frontend layer sequence were removed from the mandatory flow.
- **One explicit lint-gate lifecycle.** A/B batches before C are preparatory and must not claim a
  locked ratchet; C creates and sabotage-proves the first relevant gate; post-C A/B/D batches
  tighten or expand that existing gate and sabotage-prove the changed coverage. `lint-audit` and
  `lint-fix` now use the same prerequisites, artifact fields, verification, and reporting language.
- **Honest unavailable-analyzer handling.** `lint-audit` runs an analyzer only when it is already
  available, requires explicit permission before an ephemeral download, and otherwise records a
  manual estimate labeled `not executed` instead of promising a dry-run.
- **Roadmap synchronized.** Proposal #4 is marked implemented in `IMPROVEMENT-PROPOSALS.md`, and
  the root/plugin READMEs and manifests describe the corrected behavior.

## prorab 0.6.0 · prorab-tech 0.5.0

**Hard orchestration budgets and no-progress stopping.** The adaptive S/M/L tiers now enforce a
cumulative context ceiling instead of only describing approximate fan-out. This is a
backward-compatible behavior change in all seven commands, so both plugins receive a minor bump.

- **Absolute context caps:** S = 2 total contexts and no Workflow; M = 6; L = 12 by default and an
  absolute 16 only after a confirmed critical risk or explicit `--thorough`. The main context,
  direct agents, every Workflow node, and retries all count.
- **Bounded execution:** delegated contexts must set `max_turns` (direct Agent) or `maxTurns`
  (Workflow/custom-agent configuration) to at most 6/8/12 for S/M/L;
  review→fix cycles are capped at 1/2/3 and stop immediately after a complete round yields no new
  confirmed, non-duplicate findings.
- **Executable Workflow cap:** generated scripts must launch agents only through a counted
  `boundedAgent()` wrapper, reject launches above the remaining command budget, and never feed an
  unbounded list to `pipeline()`.
- **Hybrid orchestration:** judge-panels require at least two materially different designs and
  consume the same cap. Related subsystems/findings are grouped rather than receiving one fresh
  context each, and the final independent verifier is reserved before recon fan-out.
- **Audit-specific cuts:** smell lenses are grouped into structure, reliability/security, and
  performance/maintainability. Candidate #1 is verified by default; runners-up only on a near tie
  or when #1 fails. Analyzer runners in `lint-audit` are similarly grouped by stack/tool family.
- **Light commands bounded too:** `refine` allows two Explore contexts total and stops recon after a
  no-progress round; `announce` allows one delegated context and one adversarial fact-check pass.
- **Priority record:** deterministic mutation guardrails moved from P0 to P1 in
  `IMPROVEMENT-PROPOSALS.md` because the owner does not edit files concurrently with agents. The
  task remains planned: agent-owned intermediate changes can still overlap a mutation.

## prorab 0.5.1 · prorab-tech 0.4.1

**Full English across the docs and command metadata.** Follow-up to the English execution language
(0.5.0/0.4.0): the remaining Russian prose that isn't user-facing runtime output is now English too.
**Behavior and guarantees unchanged** — docs/wording only, so a patch bump of both plugins (as with
the 0.3.1 terminology normalization).

- **READMEs and CHANGELOG → English.** The root `README.md`, both plugin READMEs, and this
  CHANGELOG are translated. They document the framework itself (a developer-facing catalog), so
  English keeps them consistent with the command bodies.
- **JSON manifest descriptions → English.** `marketplace.json` (the top description + both plugin
  descriptions) and both `plugin.json` descriptions.
- **Command frontmatter → English.** The `description`/`argument-hint` of all 7 commands (the text
  shown in the command picker). Previously left in Russian at 0.5.0; now English for a fully
  English-first catalog.
- **Artifact-template scaffolds in commands → English.** The `IDEA` (refine), announcement
  (announce), `AUDIT` (audit) and `LINT` (lint-audit) templates inside the command bodies are now
  English reference scaffolds. **The runtime behavior is unchanged:** the accompanying note still
  says "write the artifact in the task's language (default Russian)", so produced artifacts stay
  localized — only the in-command example flipped from Russian to English.
- **Unchanged:** the language policy itself (execution = English, user-facing = the task's
  language), all command logic, tiers, floors, and the anti-drift rule for UI/domain terms.

## prorab 0.5.0 · prorab-tech 0.4.0

**English execution language across all commands.** The bodies of all 7 commands were translated to
English and a language policy was fixed: the internal work (reasoning, inter-agent prompts,
`schema` outputs) is in English (denser in tokens, steadier in quality), while everything
user-facing is in the task's language. A second-order saving on top of the adaptive budget
(0.4.0/0.3.0), but it **stacks** with it; command behavior and guarantees don't change. A minor bump
of both plugins.

- **Language policy (across all commands).** Execution language = English: the orchestrator's
  reasoning, agent prompts, inter-agent messages, `schema` field values. **User-facing = the task's
  language** (detected from how the request is phrased; Russian by default): the chat, the `refine`
  dialogue, the `announce` text.
- **Artifacts stay in the task's language** (the user's decision): `IDEA`/`IMPL`/`IMPL-refactor`/
  `IMPL-lint`/`AUDIT`/`LINT`/`ANNOUNCE` — human-readable project docs. At 0.5.0 their templates in the
  commands were left in Russian (the common default) with an explicit note "write the artifact in the
  task's language". *(0.5.1 later flipped those template scaffolds to English too, keeping the note.)*
- **Code/names/comments/commit/configs — English** (unchanged). **Anti-drift:** UI/domain terms
  visible to the user aren't round-tripped through a double translation — they're carried as-is in the
  task's language (protecting the 0.3.1 terminology normalization when languages mix at the boundary).
- **Rename:** the triage-phase heading in the commands is now **`Phase 0.5 — Budget triage`** (was
  "Фаза 0.5 — Триаж бюджета") — together with the full Englishing of the bodies; the
  signals/tiers/thresholds/triage structure didn't change.
- **Left in Russian deliberately (at 0.5.0):** command frontmatter (`description`/`argument-hint`),
  `marketplace.json`, and the READMEs/CHANGELOG — a static catalog and project prose for a
  Russian-speaking user, not part of executing a task. *(Superseded by 0.5.1, which translated these.)*
- **Why it saves:** Russian generation is ~1.5–2× denser in tokens; translating the *bodies* by
  itself saves almost nothing (loaded once + cached), but English prose primes the agents'
  English reasoning and `schema` outputs — the largest pool of generated tokens. Net ≈ 10–20% on top
  of the adaptive budget (depends on how Russian the task's domain content is).

## prorab 0.4.0 · prorab-tech 0.3.0

**Adaptive budget for task complexity** across all commands. Previously the heavy commands ran in a
single mode — always the top setting of fan-out ("tokens aren't a constraint"). Now the degree of
multi-agentness is picked to the task's complexity and reversibility: a noticeable saving of limits on
simple tasks **without lowering quality** (a non-negotiable safety floor keeps the guarantees), while
large/risky tasks still get the full ultracode fan-out. A minor bump of both plugins (new behavior,
backward-compatible).

- **Phase 0.5 — Budget triage (new) in `build`, `audit`, `refactor`, `lint-audit`, `lint-fix`:**
  before any fan-out the command estimates complexity from cheap signals (size, blast radius, novelty,
  reversibility, uncertainty) and picks a **budget tier S/M/L**. The tier scales the number of
  scouts/scanners, the judge-panel (engaged only on real ≥2 designs), the number of verification
  skeptics, the loop-until-clean/dry caps. `refactor`/`lint-fix` take the tier **from the
  upstream artifact** (AUDIT `blast_radius`/`coverage`/`risk`; LINT batch tier tag A/B/C/D) — they
  don't re-derive it.
- **The safety floor is non-negotiable at any tier.** Tiering trims only the *width* of the fan-out,
  not the guarantees: `refactor`/`lint-fix` — net/baseline + sabotage probe + contract-diff + drift
  search for non-mechanical edits + a proven gate; `build` — a DoD skeptic with fresh context +
  a sabotage probe on the substance of the DoD + a full test/build run + re-grounding against Scope;
  `audit`/`lint-audit` — verification of the recommended candidate/executable batch + honesty about
  coverage.
- **Risk-proportional verification.** The check intensity is for the risk of the **specific** finding,
  not for the tier as a whole: a safe isolated finding → 1 check suffices even in L; a finding that
  touched a contract/wide blast → a full panel of ≥3 skeptics even in S. The inverted default
  ("refuted / behavior changed until proven otherwise") is preserved.
- **Model/effort tiering (new lever).** Mechanical stages (autofix/formatter, running analyzers,
  extracting the code map into `schema`, collecting the diff class) are given a cheap model
  (`opts.model: 'haiku'`/`'sonnet'`) + `opts.effort: 'low'`; judgment stages (judge-panel, drift
  search, the DoD/scope skeptic, designing the sabotage mutation) — a strong model. Previously all
  agents inherited the main-loop model (Opus) indiscriminately.
- **Cheap-first escalation.** Start at the chosen tier; an underestimated signal surfaced (an edit
  touched a contract, the blast is larger, a spike failed, the sabotage probe doesn't go red) → the
  tier is raised mid-run and logged. No downgrading mid-run.
- **Human override.** A flag in `$ARGUMENTS` (`--fast` / `--thorough` / `--tier=S|M|L`) or an
  NL request pins the tier — the human beats the auto-triage. The chosen tier and what was
  consciously skipped — one line in the chat/`log()` (we don't stay silent about cuts).
- **`refine` and `announce` (a light edit):** code recon and the number of question rounds (`refine`),
  the fact-check depth and the number of skeptics (`announce`) scale to size; the fact-check in
  `announce` runs on a cheap model. They don't need a full tier triage — the commands are light anyway.
- **Reformulated the "tokens aren't a constraint" doctrine** across all heavy commands → "adaptive
  budget: quality is the hard constraint (the floor is non-negotiable); within it, don't spend fan-out
  where it doesn't buy correctness".

## prorab 0.3.1 · prorab-tech 0.2.1

Normalization of mixed RU/EN terminology in both plugins. Cyrillic transliterations of English terms
and awkward Russian calques were replaced with clean English terms-of-art; Russian stays the primary
prose language, English — where there's no clear Russian equivalent. **Command behavior didn't
change** — only the wording (docs/wording), hence a patch bump of both plugins.

- **Transliterations → English:** гейт→gate, храповик/ратчет→ratchet, батч→batch, тир→tier,
  смелл→smell, спайк→spike, скоуп→scope, дефолт→default (noun), бэклог→backlog,
  дифф→diff, фан-аут→fan-out, апрув→approval, чекпоинт→checkpoint, роут→route,
  коммит→commit, пуш→push, баг→bug, линтер→linter, юнит→unit, мок→mock,
  фикс/автофикс→fix/autofix, тайпчек(ер)→typecheck(er), форматтер→formatter,
  тулинг→tooling, ревью→review, скоринг→scoring, рефайнмент→refinement,
  неймспейс→namespace, роадмап→roadmap, релиз→release, смоук→smoke, перф→perf.
- **Awkward calques → clean Russian:** «провод инструментов»→«подключение»,
  «бар»→«планка», «пиннящие поведение»→«фиксирующие».
- **Left as-is:** established Russian (рефакторинг, репозиторий, фреймворк,
  миграция, сеть, покрытие, планка) and already-English terms-of-art (Workflow, DAG,
  baseline, sabotage, churn, behavior-preserving, judge-panel, loop-until-clean).

## prorab-tech 0.2.0

A second pair of commands in the tech-quality track — **static quality via ratchet passes**.
Complements the structural pair (`audit`/`refactor`) with a separate pair for a different nature of
debt: linters, typecheckers, formatters, dead code, security and the **gate** (pre-commit/CI).
Pipeline: `lint-audit → LINT → lint-fix (repeat per batch) → /prorab:announce`.

- **The core idea — the ratchet.** Unlike structural refactoring, static debt is locked in
  monotonically: you enable a rule, drive its violations to zero, **lock the gate** → the level
  won't roll back. So the artifact is not "one candidate" but an **ordered ladder of safe
  passes**, each of which raises the floor AND locks it. That turns "quality grows after every
  pass" into a guarantee rather than a hope.
- **`/prorab-tech:lint-audit` (new command, `commands/lint-audit.md`):** inventories the
  tooling (what exists / is broken / is absent, + net commands to insure the passes) and
  runs all available analyzers read-only via `Workflow`; for the absent ones estimates the
  "cost of enabling" at a lenient bar. Clusters findings into batches and orders them as a
  ladder by tier: **A** zero-risk autofix → **B** onboarding/fixing tools on a passing base →
  **C** a gate at the current level (the top leverage) → **D** incremental strictness ratchet.
  Scoring `value × safety × size × confidence` + a prerequisite DAG; adversarially verifies
  behavior-preserving and "one pass". Touches no code; result —
  `tasks/audits/LINT-<slug>.md` (tooling inventory + batch roadmap + the full batch #1 spec).
- **`/prorab-tech:lint-fix` (new command, `commands/lint-fix.md`):** runs **ONE** batch
  turnkey via the ultracode Workflow. **Prime directive — behavior preservation + a locked
  ratchet:** remove a finite class of violations, prove equivalence (a green baseline of
  tests/build/typecheck + an adversarial drift search + a differential run where apt),
  **add a gate (pre-commit/CI) and prove by a sabotage probe that it goes red on a regression**.
  A latent bug the analyzer surfaces it **does not fix** — that's a behavior change, route to
  `/prorab:refine`→`/prorab:build`. Respects the ladder order (won't take a batch before its
  prerequisites). Zero scope creep, the improvement is measured by a number (N violations → 0).
  Both modes: `lint-fix <id>` — a specific batch, `lint-fix` with no argument — auto-picks the next
  undone one with met prerequisites. Result — code + gate + `tasks/IMPL-lint-<slug>.md`; marks the
  batch done in the LINT plan.

## prorab-tech 0.1.0

The new `prorab-tech` plugin — a separate **tech-quality** track with its own namespace
(`/prorab-tech:*`), so it doesn't get confused with the product commands. The track is about
continuous code health: find tech debt and fix it **safely**, without changing behavior.
Pipeline: `audit → AUDIT → refactor → IMPL-refactor → /prorab:announce`.

- **`/prorab-tech:audit` (new command, `commands/audit.md`):** a multi-agent audit of the
  codebase. A multi-modal sweep by smell classes (duplication, complexity, layer/coupling
  violations, dead code, reliability, perf, coverage holes, conventions, typing) +
  churn×complexity from git history. Clustering/dedup, scoring by
  `value × safety × size × confidence`, adversarial verification of the top
  (real/safe/useful, "reject on doubt"), a completeness-critic. Touches no code; result —
  `tasks/audits/AUDIT-<slug>.md` (a ranked backlog + the full #1-candidate spec).
  Safety is the primary selection criterion: "the most valuable AND safe", not
  "the grimiest".
- **`/prorab-tech:refactor` (new command, `commands/refactor.md`):** a turnkey safe fix
  via the ultracode Workflow. **Prime directive — behavior preservation** (an inversion of
  `build`: it proves *new* behavior, this proves *old* behavior didn't change). No net —
  no refactoring: first characterization tests pinning the current behavior (green on the old
  code, quirks preserved), then small behavior-preserving steps under green. Equivalence
  verification: an adversarial drift search (N skeptics look for an input where old≠new; a
  differential old-vs-new run), a sabotage probe of the net, contract stability, zero scope creep
  (a separate skeptic with fresh context), a **measured** quality improvement (a before/after
  metric). Both modes: `refactor <id>` fixes the chosen candidate, `refactor` with no argument —
  auto-picks #1 from the latest audit. Result — code +
  `tasks/IMPL-refactor-<slug>.md` (read by the same `/prorab:announce`).

## prorab 0.3.0

The new `announce` command — the final step of the pipeline: `refine → build → announce`.

- **`/prorab:announce` (new command, `commands/announce.md`):** prepares a concise, precise
  announcement of the results to forward in a messenger — what was done/new/changed, the
  methods applied and how it's computed. Not a report and not a changelog: the recipient understands
  the feature in 20–30 seconds without reading code.
- **Source of truth — what was done, not what was intended:** "done" is taken from the IMPL doc and
  the diff/commits + the test status; the IDEA — only for "why" and terms/thresholds. A fact-check
  phase cross-checks every claim against the sources (for non-trivial facts — a light adversarial
  check via `Workflow`); the unproven is removed or softened.
- **Format for forwarding:** simple informal Russian without the formal "вы", terms strictly as in
  the UI, a scannable structure (a header + bullets), a length target of "one screen", ready for
  copy-paste. Writes no code, changes no project files, makes no commit.

## prorab 0.2.0

Closing the `refine → build` seam and guarding against verification theater in tests. Only edits to
the bodies of the two command-prompts — no new commands/skills/agents were introduced.

- **`/prorab:refine` — the IDEA template synced with what `build` reads:** "Affected parts" gained
  "Reuse points (file:line)"; "Open risks / assumptions" split into "Risk spikes (risk → how to
  check)" and "Other assumptions"; an "Order of stages (prerequisites/pre-stages)" was added;
  "Key decisions" now asks to record what was rejected too.
- **A numbered checkable DoD:** each item is an input→expected pair, the expected value from the
  requirement (not "how the code returns it"), with a negative and a boundary; where a value isn't
  independently derivable — a metamorphic invariant instead of a literal.
- **The `[?:…]` marker** for unconfirmed assumptions: `refine` marks unclosed forks with it,
  `build` treats it as a blocker (a short question with options, not a silent default).
- **An extended definition of a blocker in `build`:** a defect in the IDEA itself affecting Scope/DoD
  (incompatible readings, behavior on an unconfirmed assumption, an uncheckable DoD item)
  — a blocker fork; a "sensible default" — only for decisions outside Scope/DoD.
- **Anti-verification-theater in tests:** right-reason red (a valid red only on
  `AssertionError`), a blacklist of green-up bypasses, a separate skeptic agent with fresh
  context runs the "tests" measurement in Phase 4 (a sabotage probe, an independent oracle, a real
  unit, a negative+boundary, a grep for bypasses), re-grounding against DoD/Scope-IN before the
  report. A caveat against ritual: the rules are a skeptic's lenses proven by a command's output, not
  the author's checkboxes.
- **`refine` stop-triggers:** skepticism serves scope/DoD; on a two-round stall — settle, fixing the
  remainder as open items / `[?:…]`.
- **Pipeline tail:** `build` records significant decisions in the IMPL doc's decisions/deviations
  section (a cross-idea one — optionally in `CLAUDE.md`) and in the final report neutrally marks the
  "last mile" (review/smoke/commit/PR) as done per the project's practices and only on an explicit
  request.

## prorab 0.1.0

The initial packaging of the framework into a Claude Code marketplace.

- The repository turned into a marketplace with one `prorab` plugin.
- The **`/prorab:refine`** command — from the former `brainstorm` (working an idea up to a spec).
- The **`/prorab:build`** command — from the former `implement-idea` (turnkey implementation via a
  multi-agent ultracode Workflow).
- Installation via `/plugin marketplace add` + `/plugin install`, updating via
  `/plugin marketplace update`.
- The artifact contract fixed: the commands are global, `IDEA-*`/`IMPL-*` are written to the
  `tasks/` of the working project.
