# Prorab roadmap

This is the single source of truth for **what Prorab should develop next**.

Detailed designs live in `docs/roadmap/`; unscheduled ideas live in
[`docs/roadmap/backlog.md`](docs/roadmap/backlog.md). Completed work belongs in `CHANGELOG.md` and git
history, not in an ever-growing checklist here.

## Product goal

Reduce Claude Code limit consumption and task latency **without reducing implementation quality**.

Prorab should optimize four things together:

1. **Cost per model context** — do not spend Opus/xhigh reasoning on work Sonnet or Haiku can do safely.
2. **Prompt loaded per invocation** — keep entrypoints small and load detailed instructions only when a
   branch of the workflow actually needs them.
3. **Number of model contexts and tool calls** — reuse fresh evidence and avoid broad repeated recon.
4. **Size of task context** — read and return only the source ranges and evidence a task needs.

The active sequence started with model/effort routing, which has now shipped, and continues by
modernizing the plugin's prompt architecture before navigation work changes the heavy workflows. This
avoids optimizing large legacy command bodies and then restructuring them immediately afterwards.

See:

- [`docs/roadmap/model-routing.md`](docs/roadmap/model-routing.md)
- [`docs/roadmap/architecture.md`](docs/roadmap/architecture.md)
- [`docs/roadmap/project-navigation.md`](docs/roadmap/project-navigation.md)

## Development rules

- **Quality is a hard floor.** Tests, contract checks, independent verification and existing safety
  requirements do not get weaker because an optimization is cheaper.
- **Preserve the user API.** `refine → build → revise → verify`, `quick`, `announce`, `ask` and the
  tech-track commands remain the product surface unless a separate product reason justifies change.
- **Cheapest sufficient capability, then escalate.** Start each kind of model work on the least
  expensive model/effort that should reliably handle it; move upward only on a concrete complexity,
  uncertainty or failure signal.
- **Progressive disclosure.** A Skill entrypoint owns the workflow; detailed phase, stack or risk
  instructions are supporting files loaded only when needed.
- **Use each Claude Code primitive for one job.** Skills orchestrate; subagents isolate bounded
  reasoning roles; plugin executables handle deterministic mechanics; Workflows are reserved for real
  large fan-out rather than ordinary execution.
- **Do not create architecture for its own sake.** No agent catalog, core plugin, hook layer or MCP
  surface without a concrete consumer.
- **Reuse before rediscovery.** Fresh task evidence wins over new reconnaissance.
- **Cheap deterministic signals before model exploration.** Exact paths, identifiers, lexical
  matches, symbols and dependency edges are preferred to broad model exploration.
- **Current source remains evidence.** Maps and caches accelerate discovery; material behavior and
  contract claims are still checked in the current worktree before editing.
- **Tune from real use, not a benchmark project.** We will not block progress on replaying historical
  tasks or maintaining a large eval suite. Repeated real-task behavior is the normal feedback loop.
- **Progressive complexity.** Embeddings, vector databases, remote indexes and large new tool surfaces
  require a recurring real-world problem before entering the active plan.
- **One owner for status.** Initiative documents explain work; only this file owns execution order
  and status.

## Active order

Statuses: `NEXT` = do next, `TODO` = committed follow-up, `GATED` = only if its activation condition
appears in real use, `DONE` = remove after the release is recorded in `CHANGELOG.md`.

| ID | Status | Priority | Milestone | Depends on |
|---|---|---:|---|---|
| MODEL-001 | `DONE` | P0 | Automatic model & effort routing with bounded escalation | — |
| ARCH-001 | `NEXT` | P0 | Canonical Skills + progressive-disclosure plugin architecture | MODEL-001 |
| NAV-001 | `TODO` | P0 | Task-aware reconnaissance contract | ARCH-001 |
| NAV-002 | `TODO` | P0 | Lightweight incremental RepoMap | NAV-001 |
| NAV-003 | `TODO` | P0 | Product-track navigation integration: `refine → build` | NAV-002 |
| NAV-004 | `TODO` | P1 | Tech-track navigation integration | NAV-003 |
| NAV-005 | `TODO` | P1 | Freshness and cache hardening | NAV-003 |
| NAV-006 | `GATED` | P2 | Semantic retrieval / embeddings | repeated real tasks show lexical+symbol retrieval is insufficient |
| NAV-007 | `GATED` | P2 | Shared/remote index or Sourcegraph adapter | repeated real projects show local cold-start or cross-repo limits matter |

MODEL-001 stays listed rather than being removed, because one of its Definition-of-Done items is not
closed by shipping: the routing is applied everywhere it was meant to be, but the parity check — one
real `build` run on the new defaults reaching the same verdict the old defaults reached on the same
task — has not been run yet. That is closed by ordinary use, not by another milestone, and the row
comes out once it is.

## Continuous tuning

There is deliberately no separate historical-task benchmark milestone. Initial policies use current
Claude Code capabilities, task complexity and bounded fallback. Normal Prorab usage is the feedback
loop:

- a model route that repeatedly escalates should start one level higher;
- a route that reliably succeeds without escalation stays where it is;
- supporting instructions repeatedly loaded together may be consolidated;
- instructions rarely needed should move out of the Skill entrypoint;
- repeated deterministic model work is a candidate for `bin/`;
- one exceptional task does not rewrite the global policy.

Only add persistent telemetry or a dedicated eval suite later if real tuning decisions cannot be made
from ordinary runs.

## Promotion rule

Do not pull work from the backlog while an actionable P0 milestone exists unless it fixes a confirmed
blocker or quality regression. When a new large initiative becomes active, give it its own file under
`docs/roadmap/` and add only its ordered milestone here.
