# Prorab roadmap

This is the single source of truth for **what Prorab should develop next**.

Detailed design belongs in `docs/roadmap/`; unscheduled ideas belong in
[`docs/roadmap/backlog.md`](docs/roadmap/backlog.md). Completed work belongs in `CHANGELOG.md` and git
history, not in an ever-growing checklist here.

## Product goal

Reduce Claude Code limit consumption and task latency **without reducing implementation quality**.

The biggest current opportunity is code reconnaissance. Prorab already has a strong warm path:
`refine` records a hashed `Code map`, and downstream work can reuse unchanged evidence. The active
initiative therefore targets the **cold start of a new task**: finding the right files, symbols,
consumers and tests with fewer searches, reads and delegated contexts.

See [`docs/roadmap/project-navigation.md`](docs/roadmap/project-navigation.md) for the design.

## Development rules

- **Quality is a hard floor.** An optimization is rejected if it increases missed change points,
  consumers, contracts or tests.
- **Reuse before rediscovery.** Fresh task evidence wins over new reconnaissance.
- **Cheap deterministic signals before model exploration.** Exact paths, identifiers, lexical
  matches, symbols and dependency edges are preferred to broad `Explore` work.
- **LSP after localization, not blindly first.** LSP is most useful once a plausible file or symbol
  has been found.
- **Current source remains evidence.** Maps and caches accelerate discovery; material behavior and
  contract claims are still checked in the current worktree before editing.
- **Progressive complexity.** Embeddings, vector databases, remote indexes and a large MCP surface
  need measured evidence before they enter the active plan.
- **One owner for status.** Initiative documents explain work; only this file owns execution order
  and status.

## Active order

Statuses: `NEXT` = do next, `TODO` = committed follow-up, `GATED` = only if its activation condition
is proven, `DONE` = remove from this table after the release is recorded in `CHANGELOG.md`.

| ID | Status | Priority | Milestone | Depends on |
|---|---|---:|---|---|
| NAV-001 | `NEXT` | P0 | Task-aware reconnaissance contract | — |
| NAV-002 | `TODO` | P0 | Lightweight incremental RepoMap | NAV-001 |
| NAV-003 | `TODO` | P0 | Product-track integration: `refine → build` | NAV-002 |
| NAV-004 | `TODO` | P0 | Navigation eval and limit-consumption measurement | NAV-003 |
| NAV-005 | `TODO` | P1 | Tech-track integration: audit/refactor and lint flows | NAV-004 |
| NAV-006 | `TODO` | P1 | Freshness and cache hardening | NAV-004 |
| NAV-007 | `GATED` | P2 | Semantic retrieval / embeddings | NAV-004 proves lexical+symbol recall is insufficient |
| NAV-008 | `GATED` | P2 | Shared/remote index or Sourcegraph adapter | NAV-004 proves local cold-start or cross-repo limits matter |

## Promotion rule

Do not pull work from the backlog while a P0 milestone above is actionable unless it fixes a
confirmed blocker or quality regression. When a new large initiative becomes active, give it its own
file under `docs/roadmap/` and add only its ordered milestones here.
