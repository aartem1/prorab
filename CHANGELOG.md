# Changelog

All notable changes to the prorab framework. Versions follow [SemVer](https://semver.org/).
The marketplace has **two plugins** with independent versions: `prorab` (the product track) and
`prorab-tech` (the tech-quality track). Each one's version lives in its
`plugins/<plugin>/.claude-plugin/plugin.json` and is duplicated in `.claude-plugin/marketplace.json`.
The entries below are tagged with the plugin they concern.

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
