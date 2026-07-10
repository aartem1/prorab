# The prorab-tech plugin

The **tech-quality** track of prorab — a separate namespace, so it doesn't get confused with the
product commands (`/prorab:*`). About continuous code health: finding accumulated tech debt and
fixing it **safely**, without changing behavior. Inside — **two pairs** of commands for two
different natures of debt:

- **Structural debt** (duplication, complexity, layers) — `audit` → `refactor`.
- **Static debt** (linters, types, formatters, dead code, gate) — `lint-audit` → `lint-fix`.

## The structural-quality pair: `audit` → `refactor`

- **`/prorab-tech:audit`** (`commands/audit.md`) — a multi-agent codebase audit:
  sweeps by smell classes (duplication, complexity, layer violations, dead code,
  reliability, perf, coverage, conventions) + churn×complexity from git, clusters,
  ranks by `value × safety × size × confidence`, adversarially verifies the top,
  and produces the **optimal candidate**. Touches no code. Result —
  `tasks/audits/AUDIT-<slug>.md` (backlog + the full #1 spec).
- **`/prorab-tech:refactor`** (`commands/refactor.md`) — a turnkey safe fix via a
  multi-agent ultracode Workflow. **Prime directive — behavior preservation:** a net of
  characterization tests on the old code, small steps, adversarial drift search,
  a differential old-vs-new run, a measured quality improvement. Both modes:
  `refactor <id>` fixes the chosen candidate, `refactor` with no argument — auto-picks #1 from
  the latest audit. Result — code + `tasks/IMPL-refactor-<slug>.md`.

Pipeline: `audit → AUDIT → refactor → IMPL → /prorab:announce`.

## The static-quality pair: `lint-audit` → `lint-fix`

About tooling: linters, typecheckers, formatters, dead code, security and the **gate**
(pre-commit/CI). The core idea is an explicit gate lifecycle: early A/B passes prepare green tools
without claiming they are locked; C creates and proves the first gate; every later pass that changes
the enforced bar tightens or expands that same gate. The result is an **ordered ladder of safe
passes** that first reaches a locked state and then raises it monotonically.

- **`/prorab-tech:lint-audit`** (`commands/lint-audit.md`) — inventories the tooling (what
  exists / is broken / is absent) + runs analyzers already available in the project (read-only).
  An ephemeral download requires explicit permission; otherwise absent-tool estimates are manual
  and labeled as not executed. Clusters findings into
  batches and orders them as a ladder: **A** zero-risk autofix → **B** onboarding/fixing tools
  on a passing base → **C** the first gate at the current level (the top leverage) → **D**
  incremental strictness ratchet. Scoring `value × safety × size × confidence` +
  a prerequisite DAG; adversarially verifies that each batch is behavior-preserving and
  passable in one go. Touches no code. Result — `tasks/audits/LINT-<slug>.md`
  (tooling inventory + batch roadmap + the full batch #1 spec).
- **`/prorab-tech:lint-fix`** (`commands/lint-fix.md`) — runs **ONE** batch turnkey
  via Workflow. **Prime directive — behavior preservation + a truthful gate lifecycle:** remove a
  finite class of violations and prove equivalence (a baseline net of tests/build/typecheck +
  a drift search). Before C, A/B are preparatory and explicitly not locked; C creates and
  sabotage-proves the first gate; post-C A/B/D tighten or expand that gate and prove the new coverage.
  A latent bug the analyzer surfaces it **does not fix** (that's a behavior change → route to
  `/prorab:refine`→`/prorab:build`). Respects the ladder order (won't take a batch before its
  prerequisites). Both modes: `lint-fix <id>` — a specific batch, `lint-fix` with no argument —
  auto-picks the first undone batch with met prerequisites. Result — code + gate-state evidence +
  `tasks/IMPL-lint-<slug>.md`; marks the batch done in the plan.

Pipeline: `lint-audit → LINT → lint-fix → (repeat per batch) → /prorab:announce`.
Each `lint-fix` call = one ratchet step; run it again until the ladder is done. Commands are
global, artifacts are local to the project.

**Inversion relative to `build`:** `/prorab:build` proves that *new* behavior matches a
requirement; `/prorab-tech:refactor` proves that *old* behavior **did not change**.
A different verification discipline — hence a separate executor, not a run through `build`.

**Bounded adaptive budget.** All four commands run **Phase 0.5 — Budget triage** with hard
cumulative limits: S = 2 model contexts and no Workflow; M = 6; L = 12 by default and an absolute
16 only for confirmed critical risk or explicit `--thorough`. Delegated contexts have mandatory
`maxTurns`; review/verification cycles are capped at 1/2/3 and stop immediately after a round with
no new confirmed findings. `audit` groups its catalog into three scan directions and verifies #1 by
default; runners-up only on a near tie or #1 failure. `refactor`/`lint-fix` take the tier straight
from the upstream artifact. **The safety floor is non-negotiable at any tier.** More detail — in
the [root README](../../README.md).

**Language.** Command bodies and the internal work are in English; artifacts
(`AUDIT`/`LINT`/`IMPL-*`) and the dialogue are in the task's language (Russian by default). See the
[root README](../../README.md).

Installation and updating are described in the [root README](../../README.md).
