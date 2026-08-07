# Development backlog

This file contains worthwhile ideas that are **not in the active execution order**. Promotion into
active work happens only by adding a milestone to [`ROADMAP.md`](../../ROADMAP.md).

Do not add statuses here; the roadmap is the only status owner.

## Budget and observability

- **Lightweight routing/recon counters.** Add persistent counts for model family, effort, escalation,
  delegated contexts and recon calls only if ordinary task outcomes stop being enough to tune the
  active policies. Do not build telemetry pre-emptively.
- **Pre-dispatch context sizing.** Estimate an executor brief before dispatch and choose `fits`, split
  by a coherent seam, or return to refinement. Promote only if real S/M/L runs repeatedly approach
  their context limits; XL already handles deliberate segmentation at idea level.
- **Measure English-execution benefit.** Revisit only if language choice becomes a meaningful
  optimization lever again.

## Architecture extensions

ARCH-001 establishes the basic Skill/subagent/reference/executable boundaries. These extensions remain
outside the active plan until ordinary work justifies them:

- **Shared `prorab-core` plugin.** Split common runtime into a third dependency only when both product
  and tech plugins have substantial executable infrastructure that benefits from independent
  versioning/lifecycle. Shared prose is not enough.
- **Additional specialized agents.** MODEL-001/ARCH-001 may introduce the few roles needed for routing
  or isolation. Add more fixed agents only when repeated work shows a stable reusable contract.
- **Executable hooks/guardrails.** Add hooks when a concrete invariant cannot be protected reliably by
  the current workflow and deterministic checks.
- **Formal artifact schema.** Introduce a stable machine schema when multiple executable consumers need
  it; do not add schema ceremony only for prose-to-prose handoff.

## Deterministic utilities

ARCH-001 makes `bin/` the home for deterministic mechanics but does not require speculative utilities.
Promote individual helpers when an active feature consumes them. Candidates include compact test/build
output, manifest/version checks and artifact validation. Navigation-specific inventory, hashes and
RepoMap operations belong to the active navigation initiative rather than this backlog.

## Developer experience

- **`/prorab:doctor`.** Read-only diagnostics for framework/project readiness, tool availability and
  navigation/index health. Promote when the system has enough executable infrastructure to diagnose.
- **Artifact navigation command.** A small `/prorab:next`-style helper may be useful once artifact
  discovery is a repeated user problem rather than a hypothetical one.
- **Artifact-aware consistency check.** Extend verification only if there is a clear gap between
  external behavior verification and artifact/state consistency that users actually hit.

## Repository maintenance

- **CI for plugin/manifests and documentation invariants.** Promote when local contract tests are no
  longer enough protection for release flow.
- **Release automation / version deduplication.** Reduce manual version drift if release frequency or
  plugin count makes the current two-location bump materially error-prone.

## Promotion criteria

A backlog item should enter `ROADMAP.md` when at least one is true:

1. it removes a recurring cost or failure observed in normal work;
2. it is required by an active milestone;
3. it closes a demonstrated quality/safety gap;
4. maintaining the current manual process costs more than the proposed automation.

Do not promote an item only because it is architecturally attractive.
