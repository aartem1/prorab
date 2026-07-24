# The prorab plugin

Five agentic-development commands for Claude Code:

- **`/prorab:refine`** (`commands/refine.md`) — work a raw idea up to spec-readiness.
  Dialogue, questions, code study, hunting for contradictions. Writes no code.
  Result — `tasks/ideas/IDEA-<slug>.md` in the working project, carrying a `Code map` handoff of
  what it already read (file content hashes, reuse/change points, conflicts, conventions, gaps).
- **`/prorab:build`** (`commands/build.md`) — turnkey implementation of a refined idea via
  a multi-agent ultracode Workflow. Reuses the IDEA's `Code map` when the recorded hashes still
  match, so recon isn't paid for twice. It derives the project's verification recipe from repository
  guidance, CI, task runners/package scripts, and test conventions instead of assuming a stack.
  Result — code + `tasks/IMPL-<slug>.md`.
- **`/prorab:quick`** (`commands/quick.md`) — the cheap lane for a 1–2 file everyday change:
  no IDEA/IMPL, no archive, no Workflow, at most two contexts. Keeps the floor (DoD stated before
  editing, red-for-the-right-reason test, the project's own checks, one independent verifier) and
  hands the task over to `refine`+`build` or the tech track as soon as its eligibility gate fires.
  Result — code + a short chat report.
- **`/prorab:announce`** (`commands/announce.md`) — a concise, precise announcement of the
  results (after `build` or a manual implementation): what was done/new/changed, methods and
  how it's computed. Dense, scannable, ready to forward in a messenger. Writes no code, makes no commit.
- **`/prorab:ask`** (`commands/ask.md`) — answers current-state and historical questions about the
  project. It uses memory and active/archive artifacts for discovery, verifies material claims
  against current code/docs or Git history, and identifies historical-only/uncertain facts.

Pipeline: `refine → IDEA → build → memory capture + archive → announce`. `ask` is available at any
time, and `quick` is a separate short lane beside the pipeline for changes too small to deserve it.
Commands are global; artifacts, memory, and archive are local to the working project.

**Project memory and archive.** All five commands read the bundled
[`references/project-knowledge.md`](references/project-knowledge.md) contract. Memory is a lazy,
small Markdown structure under `tasks/memory/`; exact paths/symbols/terms are recalled first, and
material claims are re-checked because current code remains the source of truth. Successful
`refine`/`build` runs capture only durable cross-task knowledge. After a fully verified `build`,
IDEA+IMPL(+existing ANNOUNCE) move to `tasks/archive/<YYYY>/<task-slug>/`; partial/blocked work stays
active. `announce` reads archived bundles in place and saves beside them. Legacy active artifacts
remain supported, and no archive entry is selected as active work by default.

**Bounded adaptive budget.** Before fanning out, `build` picks tier S/M/L with hard cumulative caps:
2/6/12 model contexts (L may expand to an absolute 16 only for confirmed critical risk or explicit
`--thorough`), mandatory `maxTurns`, review-cycle caps 1/2/3, and an immediate stop after a round
with no new confirmed findings. `refine` allows at most two Explore contexts; `announce` allows one
delegated context and one fact-check pass; `ask` allows one delegated context; `quick` is fixed at two
contexts with no Workflow. Recon carried in the IDEA's `Code map` and still hash-fresh costs `build`
zero recon contexts, and the saving is banked rather than respent. The quality floor
remains mandatory. More detail — in
the [root README](../../README.md).

**Risk-based verification.** `build` prefers executable/static evidence before reviewers and uses
one independent verifier by default. Mutation intensity is separate from S/M/L: `economy` performs
none for low-risk work, `balanced` allows one per critical risk cluster, and `thorough` may cover
each substantial DoD item. Selected mutations run only in a temporary isolated worktree.

**Language.** Command bodies and the internal work are in English; artifacts (`IDEA`/`IMPL`), the
`refine` dialogue and the `announce` text are in the task's language (Russian by default). See the
[root README](../../README.md).

Installation and updating are described in the [root README](../../README.md).
