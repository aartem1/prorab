# The prorab plugin

Seven agentic-development commands for Claude Code:

- **`/prorab:refine`** (`commands/refine.md`) — work a raw idea up to spec-readiness.
  Dialogue, questions, code study, hunting for contradictions. Writes no code.
  Result — `tasks/ideas/IDEA-<slug>.md` in the working project, carrying a `Code map` handoff of
  what it already read (file content hashes, reuse/change points, conflicts, conventions, gaps).
  An idea too big for one run also carries a `Segment plan`: the cut into independently checkable
  segments, each leaving the repository green.
- **`/prorab:build`** (`commands/build.md`) — turnkey implementation of a refined idea via
  a multi-agent `Workflow` Prorab orchestrates itself. Reuses the IDEA's `Code map` when the recorded hashes still
  match, so recon isn't paid for twice. It derives the project's verification recipe from repository
  guidance, CI, task runners/package scripts, and test conventions instead of assuming a stack.
  On a segmented idea it runs the segments one at a time, each in a fresh context, keeping the run's
  state in a ledger so an interrupted run continues from the same command.
  Result — code + `tasks/IMPL-<slug>.md` (plus `tasks/segments/<slug>/` at XL).
- **`/prorab:quick`** (`commands/quick.md`) — the cheap lane for a 1–2 file everyday change:
  no IDEA/IMPL, no archive, no Workflow, at most two contexts. Keeps the floor (DoD stated before
  editing, red-for-the-right-reason test, the project's own checks, one independent verifier) and
  hands the task over to `refine`+`build` or the tech track as soon as its eligibility gate fires.
  Result — code + one compact `tasks/quick/QUICK-<slug>.md` record (change, DoD table, checks,
  documentation corrected, verifier verdict), so small changes still leave a trace.
- **`/prorab:revise`** (`commands/revise.md`) — the continuation lane: the next batch of remarks on
  a result already implemented, applied as one complete iteration that leaves the repository green.
  What puts work here is continuity rather than size — it resolves which task the feedback is about
  (explicit slug, or by the change set intersecting an active `IMPL`/`QUICK`/`REVISION`) and then
  re-hashes that task's `Code map`, so a round whose files are unchanged spends **zero** recon.
  Same floor as `quick`: the expected result stated before the edit and taken from the feedback
  rather than from the code, red-first where the behavior admits a test, the project's own checks,
  one independent verifier that sees only this iteration's diff and the recorded invariants.
  Bounded at 2 contexts by default and 6 at most — no L, no XL, no segmented run; a remark needing
  more, changing an external contract or the security model, or requiring its own product decision,
  is handed to `refine`+`build`. There is no start and no close: the absence of a next remark is the
  end of the process.
  Result — code + one rolling `tasks/revisions/REVISION-<slug>.md` per task, with an append-only
  `History`, the `Invariants` later rounds may not break, and no `status` field to keep in sync.
- **`/prorab:verify`** (`commands/verify.md`) — black-box check that shipped functionality really
  works for the people who use it, plus proof that a test would catch it breaking. The scope
  (uncommitted / branch vs base / commit range / task artifact) is resolved with `git` commands and
  only asked about when genuinely undetermined. The probing context is delegated at every tier — it
  receives a charter of surfaces, preconditions and expected results and never the implementation,
  the diff or a path, and returns a blindness declaration of everything it read and ran. Expected
  values come from the requirement (or a metamorphic invariant, or an independent recomputation),
  never from the system's own output. Verdicts are graded `works`/`broken`/`differs`/`unverifiable`
  × `observed`/`proxy`; defects are routed with a reproduction, not fixed. Then each verified
  behavior is checked for a test that provably fails when it breaks, and the missing ones are
  written — proven by mutation, since red-first cannot apply to code that already works. Proofs
  `build`/`quick` already recorded (right-reason red, sabotage mutation) are re-hashed and reused
  rather than repeated, so the budget goes to what nobody checked yet. A browser surface is driven
  **headless by default**: one authored session judged from a structured result, layout checked by
  measurement, a clipped screenshot only where the requirement is perceptual, and an interactive
  visual session only on a named trigger that lands in the report.
  Result — the tests it added + one compact `tasks/verify/VERIFY-<slug>.md`.
- **`/prorab:announce`** (`commands/announce.md`) — a concise, precise announcement of the
  results (after `build` or a manual implementation): what was done/new/changed, methods and
  how it's computed. Dense, scannable, ready to forward in a messenger. Writes no code, makes no commit.
- **`/prorab:ask`** (`commands/ask.md`) — answers current-state and historical questions about the
  project. It uses memory and active/archive artifacts for discovery, verifies material claims
  against current code/docs or Git history, and identifies historical-only/uncertain facts.

Pipeline: `refine → IDEA → build → memory capture + archive → announce`, with `verify` available
after any implementation step and `revise` looping on the result for as many rounds of remarks as it
takes. `ask` is available at any time, and `quick` is a separate short lane beside the pipeline for
changes too small to deserve it.
Commands are global; artifacts, memory, and archive are local to the working project.

**Project memory and archive.** All seven commands read the bundled
[`references/project-knowledge.md`](references/project-knowledge.md) contract — language,
source-of-truth order, memory, delegated-return capsules and the archive lifecycle. Two sibling
contracts are loaded only by the commands that need them:
[`references/execution.md`](references/execution.md) (run output discipline, main-loop discipline,
deterministic steps) by `build`, `quick`, `revise` and `verify`, and
[`references/documentation-sync.md`](references/documentation-sync.md) by the first three only. `refine`,
`announce` and `ask` load neither, so they no longer pay for contracts they cannot use; `verify` runs
checks but changes no behavior, so it loads execution and not documentation sync. A fourth,
[`references/web-probing.md`](references/web-probing.md), is loaded by `build`, `quick`, `revise` and `verify`
**only when the scope has a browser surface**: it makes a headless run the default instrument for a
web UI, keeps pixels to the pointwise cases that are genuinely perceptual, and splits the work across
the stages so each pays once. A fifth,
[`references/segmented-run.md`](references/segmented-run.md), is loaded by `refine` and `build`
**only when the task is XL** — seam discipline, the `Segment plan` and ledger templates, the segment
brief and capsule, the per-segment budget, checkpoint commits and resume. Memory is a
lazy,
small Markdown structure under `tasks/memory/`; exact paths/symbols/terms are recalled first, and
material claims are re-checked because current code remains the source of truth. Successful
`refine`/`build` runs capture only durable cross-task knowledge. After a fully verified `build`,
IDEA+IMPL(+existing ANNOUNCE) move to `tasks/archive/<YYYY>/<task-slug>/`; partial/blocked work stays
active. `announce` reads archived bundles in place and saves beside them. Legacy active artifacts
remain supported, and no archive entry is selected as active work by default.

**Bounded adaptive budget.** Before fanning out, `build` picks tier S/M/L with hard cumulative caps:
2/6/12 model contexts (L may expand to an absolute 16 only for confirmed critical risk or explicit
`--thorough`), mandatory `maxTurns`, review-cycle caps 1/2/3, and an immediate stop after a round
with no new confirmed findings. A fourth tier, **XL**, exists for a task with real seams, and it is the
one whose cap is not cumulative: the orchestrator is a single context holding only the ledger, and each
segment gets at most 3 contexts. That is the point of it — a multi-hour task runs out of main loop long
before it runs out of agents, so `refine` cuts the idea into segments and `build` runs them one at a
time, each in a fresh context, from a ledger on disk that lets an interrupted run continue from the
same command. `refine` allows at most two Explore contexts; `announce` allows one
delegated context and one fact-check pass; `ask` allows one delegated context; `quick` is fixed at two
contexts with no Workflow; `revise` defaults to those same two and stops at six, with no L, XL or
segmented run available to it — past that ceiling a remark is a build, not a revision. `verify` uses the same 2/6/12 tiers but always spends at least one of them
on the blind prober, because blindness cannot be self-imposed by a context that has read the diff;
its probers fan out on instrument boundaries, never per behavior. Recon carried in the IDEA's `Code map` and still hash-fresh costs `build`
zero recon contexts, and the saving is banked rather than respent. `revise` applies the same mechanism
across rounds of the same task: its `REVISION` carries the map forward, so the second and every later
round re-hashes it instead of re-reading the code. The same idea covers test evidence:
`build`, `quick` and `revise` record which of their tests were proven able to fail (`red-first`/`mutation`
plus the test file's hash), and `verify` reuses a fresh proof instead of running the mutation again. The quality
floor remains mandatory.

**Bounded occupancy, too.** A tier caps how many contexts open; the shared `Context hygiene` contract
caps how full each one gets. Run output is captured outside the working tree and read back as a
~40-line digest (command, exit code, counters, one line per failure), a delegated context returns a
~1500-token capsule of claims and `path:line` pointers rather than the material, and above tier S the
main loop holds the plan and the ledger while the reading happens elsewhere — at tier S it *is* the
executor and reads directly. Compaction never hides a result: exit codes and failure counts are
always reported in full. More detail — in the [root README](../../README.md).

**Bounded cost per context — the third axis.** How many contexts and how full each one is are two
questions; how *expensive* each one is, is a third. `build`, `quick`, `revise`, `verify` and `ask` pin
themselves to **Sonnet / high** in frontmatter and `announce` to **Sonnet / medium**, so a command
invoked from an Opus/`xhigh` session no longer makes every one of its contexts Opus/`xhigh`; the pin
lasts that turn only, and the session model returns on your next message. Inside a run both ends are
named explicitly rather than inherited — map extraction, diff classification and inventory on
**Haiku**, the judge panel, the DoD skeptic and adversarial verification on **Opus**. `refine` is the
one command deliberately left on the session model, because it is a many-round dialogue and a
per-turn pin would hop models between rounds and rewrite the prompt cache cold each time. Escalation
sends only the unresolved question to the stronger model and leaves the rest of the run where it was;
an unavailable model or effort level collapses to the nearest available one instead of failing the
command. The `Capability routing` contract in `references/execution.md` holds the rules.

**Risk-based verification.** `build` prefers executable/static evidence before reviewers and uses
one independent verifier by default. Mutation intensity is separate from S/M/L: `economy` performs
none for low-risk work, `balanced` allows one per critical risk cluster, and `thorough` may cover
each substantial DoD item. Selected mutations run only in a temporary isolated worktree.

**Documentation sync.** `build`, `quick` and `revise` own the documentation their change falsifies: current-state
documents (README, `docs/`, the spec, `CLAUDE.md`, usage text, docstrings and comments) are corrected
in place as part of the change, while historical ones (`CHANGELOG.md`, release notes, ADRs, the
archive) are never rewritten to match new code. A current-state document still contradicting the diff
is a review finding, not a follow-up. The full rule lives in
[`references/documentation-sync.md`](references/documentation-sync.md). `verify` is outside this duty
on purpose: it changes no behavior, so a document contradicting what it observed is a finding it
reports with both readings named — the document may be the stale one.

**Language.** Command bodies and the internal work are in English; artifacts (`IDEA`/`IMPL`/`REVISION`), the
`refine` dialogue and the `announce` text are in the task's language (Russian by default). See the
[root README](../../README.md).

Installation and updating are described in the [root README](../../README.md).
