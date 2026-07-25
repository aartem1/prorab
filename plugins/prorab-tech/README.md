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
  the latest active audit. Result — code + `tasks/IMPL-refactor-<slug>.md`. A completed candidate
  is archived; when its AUDIT has unfinished candidates, the AUDIT stays active and only a scoped
  snapshot of the completed candidate joins its IMPL in the archive.

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
  a uniquely linked `tasks/IMPL-lint-<plan-slug>-batch-<id>.md`; marks only that batch done.
  The active LINT remains in place after partial progress. Once the ladder is complete/explicitly
  closed, the LINT and all linked batch IMPL artifacts move together into the archive.

Pipeline: `lint-audit → LINT → lint-fix → (repeat per batch) → /prorab:announce`.
Each `lint-fix` call = one ratchet step; run it again until the ladder is done. Commands are
global, artifacts are local to the project.

**Project memory and archive.** Every command reads the bundled
[`references/project-knowledge.md`](references/project-knowledge.md) contract. Recall is
task-specific and exact-first; current code and executable tool/gate evidence always outrank
memory. Successful commands capture only durable boundaries, contracts, recurring gotchas, and
re-probed verification knowledge under `tasks/memory/`. Active lookup excludes
`tasks/archive/**`; blocked/partial work is never archived. Safe movement checks explicit artifact
identity, refuses overwrite/path traversal, updates links, and reports exact paths. Legacy
AUDIT/LINT/IMPL names remain readable.

**Inversion relative to `build`:** `/prorab:build` proves that *new* behavior matches a
requirement; `/prorab-tech:refactor` proves that *old* behavior **did not change**.
A different verification discipline — hence a separate executor, not a run through `build`.

**Bounded adaptive budget.** All four commands run **Phase 0.5 — Budget triage** with hard
cumulative limits: S = 2 model contexts and no Workflow; M = 6; L = 12 by default and an absolute
16 only for confirmed critical risk or explicit `--thorough`. Delegated contexts have mandatory
`maxTurns`; review/verification cycles are capped at 1/2/3 and stop immediately after a round with
no new confirmed findings. `audit` groups its catalog into three scan directions and verifies #1 by
default; runners-up only on a near tie or #1 failure. `refactor` takes the tier straight from the
AUDIT **only while that spec's recorded file hashes still match**; any staleness makes it re-derive
the tier from current signals. `lint-fix` takes it from the batch tag in the LINT plan.
**The safety floor is non-negotiable at any tier.** More detail — in
the [root README](../../README.md).

**Handoff between the pairs, shaped by what each actually wastes.** `audit` stamps the #1 candidate
with its commit and `git hash-object` hashes of the target files, the tests its net status rests on,
and the call-site files. `refactor` re-hashes them **in Phase 0, before choosing a tier**: fresh paths
are adopted at zero recon cost, while a stale target makes the candidate obsolete until the smell is
re-confirmed, a stale test voids the coverage claim, and a stale call-site voids the blast radius.
Freshness never replaces evidence — the net green on the old code, the contract diff, and a
drift/differential run stay mandatory. The static pair gets a different handoff on purpose: `lint-audit`
records the exact analyzer/net invocations and the gate entrypoint, `lint-fix` reads the gate state
from the last completed batch artifact rather than rediscovering it, and violation counts are never
carried over — they go stale by construction, and re-running the tool is deterministic and nearly free.

**Risk-based verification.** Deterministic executable/static evidence comes before reviewers; one
independent verifier is the default, with extra lenses only for conflict or high blast radius.
For `refactor`/`lint-fix`, mutation intensity is separate from S/M/L: `economy` performs no
low-risk behavior mutation, `balanced` allows one per critical risk cluster, and `thorough` may
cover each substantial behavior boundary. Gate creation/expansion still receives one representative
violation. Selected mutations run only in a temporary isolated worktree.

**Documentation sync.** Behavior preservation is not an exemption. `refactor` corrects the
current-state documents its renames and moves make wrong (paths, symbols, architecture notes);
`lint-fix` keeps the documented way to run the checks and the documented strictness bar matching the
gate that actually exists — a pre-C batch must not claim a gate it hasn't created. Historical
documents (`CHANGELOG.md`, release notes, ADRs, migration notes, the archive) are never rewritten to
match new code: an ADR explaining why the old shape was chosen stays true history. A stale
current-state document is a verification finding. The full rule lives in
[`references/project-knowledge.md`](references/project-knowledge.md).

**Language.** Command bodies and the internal work are in English; artifacts
(`AUDIT`/`LINT`/`IMPL-*`) and the dialogue are in the task's language (Russian by default). See the
[root README](../../README.md).

Installation and updating are described in the [root README](../../README.md).
