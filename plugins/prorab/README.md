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

**Adaptive budget.** Before fanning out agents, `build` runs a complexity triage (tier S/M/L) and
scales fan-out/model to the task; the quality floor (a DoD skeptic with fresh context, a
sabotage probe, a full test/build run) is non-negotiable at any tier. `refine`/`announce`
scale the dialogue/fact-check depth to size. More detail — in the [root README](../../README.md).

**Language.** Command bodies and the internal work are in English; artifacts (`IDEA`/`IMPL`), the
`refine` dialogue and the `announce` text are in the task's language (Russian by default). See the
[root README](../../README.md).

Installation and updating are described in the [root README](../../README.md).
