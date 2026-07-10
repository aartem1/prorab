# The prorab plugin

Three agentic-development commands for Claude Code:

- **`/prorab:refine`** (`commands/refine.md`) — work a raw idea up to spec-readiness.
  Dialogue, questions, code study, hunting for contradictions. Writes no code.
  Result — `tasks/ideas/IDEA-<slug>.md` in the working project.
- **`/prorab:build`** (`commands/build.md`) — turnkey implementation of a refined idea via
  a multi-agent ultracode Workflow. Result — code + `tasks/IMPL-<slug>.md`.
- **`/prorab:announce`** (`commands/announce.md`) — a concise, precise announcement of the
  results (after `build` or a manual implementation): what was done/new/changed, methods and
  how it's computed. Dense, scannable, ready to forward in a messenger. Writes no code, makes no commit.

Pipeline: `refine → IDEA → build → announce`. Commands are global, artifacts are local to the project.

**Bounded adaptive budget.** Before fanning out, `build` picks tier S/M/L with hard cumulative caps:
2/6/12 model contexts (L may expand to an absolute 16 only for confirmed critical risk or explicit
`--thorough`), mandatory `maxTurns`, review-cycle caps 1/2/3, and an immediate stop after a round
with no new confirmed findings. `refine` allows at most two Explore contexts; `announce`, one
delegated context and one fact-check pass. The quality floor remains mandatory. More detail — in
the [root README](../../README.md).

**Language.** Command bodies and the internal work are in English; artifacts (`IDEA`/`IMPL`), the
`refine` dialogue and the `announce` text are in the task's language (Russian by default). See the
[root README](../../README.md).

Installation and updating are described in the [root README](../../README.md).
