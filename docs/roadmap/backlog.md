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

## Deterministic execution and safety

- **Move more mechanical work from prompts to deterministic utilities.** Examples: compact test/build
  output runner, manifest/version checks, artifact validation and enumerable repository facts.
- **Executable hooks/guardrails where they add real safety.** Keep mutation isolation and destructive
  operation protection machine-enforced when prompt rules are insufficient.
- **Formal artifact schema and freshness validation.** Revisit when multiple executable consumers need
  a stable machine contract; do not introduce schema ceremony only for prose-to-prose handoff.

## Prompt and agent architecture

- **Modularize command bodies further.** Heavy command-specific prose and repetitive negative rules
  remain a prompt-size target. Prefer conditionally loaded Skills/references when that is genuinely
  cheaper than the current command body.
- **Specialized subagents beyond routing needs.** MODEL-001 may introduce narrowly defined workers to
  control model/effort. Add more fixed roles only when repeated real work shows a stable reusable
  contract; do not build an agent catalog for its own sake.

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
