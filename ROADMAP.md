# Prorab roadmap

This is the single source of truth for **what Prorab should develop next**.

Detailed designs live in `docs/roadmap/`; unscheduled ideas live in
[`docs/roadmap/backlog.md`](docs/roadmap/backlog.md). Completed work belongs in `CHANGELOG.md` and git
history, not in an ever-growing checklist here.

## Product goal

Reduce Claude Code limit consumption and task latency **without reducing implementation quality**.

Prorab should optimize three different costs, in this order:

1. **Cost per model context** — do not spend Opus/xhigh reasoning on work Sonnet or Haiku can do safely.
2. **Number of model contexts and tool calls** — reuse fresh evidence and avoid broad repeated recon.
3. **Size of each context** — read and return only the source ranges and evidence a task needs.

The first active initiative is therefore model/effort routing: it is cheap to implement, reversible,
and can reduce consumption immediately without waiting for new indexing infrastructure. Project
navigation follows next and attacks the other large source of waste: cold-start code reconnaissance.

See:

- [`docs/roadmap/model-routing.md`](docs/roadmap/model-routing.md)
- [`docs/roadmap/project-navigation.md`](docs/roadmap/project-navigation.md)

## Development rules

- **Quality is a hard floor.** Tests, contract checks, independent verification and existing safety
  requirements do not get weaker because a cheaper model is used.
- **Cheapest sufficient capability, then escalate.** Start each kind of work on the least expensive
  model/effort that should reliably handle it; move upward only on a concrete complexity, uncertainty
  or failure signal.
- **Escalate the narrow problem, not the whole run.** A hard design decision may need Opus; that does
  not mean file discovery, routine edits and every verifier do too.
- **Prorab owns orchestration.** Ultracode/dynamic workflows are not the Prorab default because they
  add a second orchestration layer and can multiply model work.
- **Reuse before rediscovery.** Fresh task evidence wins over new reconnaissance.
- **Cheap deterministic signals before model exploration.** Exact paths, identifiers, lexical
  matches, symbols and dependency edges are preferred to broad `Explore` work.
- **Current source remains evidence.** Maps and caches accelerate discovery; material behavior and
  contract claims are still checked in the current worktree before editing.
- **Tune from real use, not a benchmark project.** We will not block progress on replaying historical
  tasks or maintaining a large eval suite. If normal work exposes repeated under-routing,
  over-routing or navigation misses, adjust the policy then.
- **Progressive complexity.** Embeddings, vector databases, remote indexes and large new tool surfaces
  require a recurring real-world problem before entering the active plan.
- **One owner for status.** Initiative documents explain work; only this file owns execution order
  and status.

## Active order

Statuses: `NEXT` = do next, `TODO` = committed follow-up, `GATED` = only if its activation condition
appears in real use, `DONE` = remove after the release is recorded in `CHANGELOG.md`.

| ID | Status | Priority | Milestone | Depends on |
|---|---|---:|---|---|
| MODEL-001 | `NEXT` | P0 | Automatic model & effort routing with bounded escalation | — |
| NAV-001 | `TODO` | P0 | Task-aware reconnaissance contract | MODEL-001 |
| NAV-002 | `TODO` | P0 | Lightweight incremental RepoMap | NAV-001 |
| NAV-003 | `TODO` | P0 | Product-track navigation integration: `refine → build` | NAV-002 |
| NAV-004 | `TODO` | P1 | Tech-track navigation integration | NAV-003 |
| NAV-005 | `TODO` | P1 | Freshness and cache hardening | NAV-003 |
| NAV-006 | `GATED` | P2 | Semantic retrieval / embeddings | repeated real tasks show lexical+symbol retrieval is insufficient |
| NAV-007 | `GATED` | P2 | Shared/remote index or Sourcegraph adapter | repeated real projects show local cold-start or cross-repo limits matter |

## Continuous tuning

There is deliberately no separate historical-task benchmark milestone. The initial policies are based
on task complexity, model capability and bounded fallback. Then normal Prorab usage is the feedback
loop:

- a route that repeatedly needs escalation should start one level higher;
- a route that reliably succeeds without escalation stays where it is;
- expensive work that repeatedly adds no useful finding should move down or become deterministic;
- one exceptional task does not rewrite the global policy.

Only add persistent telemetry or an eval suite later if real tuning decisions cannot be made from
ordinary runs.

## Promotion rule

Do not pull work from the backlog while an actionable P0 milestone exists unless it fixes a confirmed
blocker or quality regression. When a new large initiative becomes active, give it its own file under
`docs/roadmap/` and add only its ordered milestone here.
