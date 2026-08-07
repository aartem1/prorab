# Development backlog

This file contains worthwhile ideas that are **not in the active execution order**. Promotion into
active work happens only by adding a milestone to [`ROADMAP.md`](../../ROADMAP.md).

Do not add statuses here; the roadmap is the only status owner.

## Budget and observability

- **Framework-wide usage measurements.** Extend the XL context ledger idea to ordinary S/M/L runs if
  real optimization decisions need it. Prefer exact provider/tool usage when available; otherwise use
  deterministic proxies such as input bytes, turns and delegated-context count.
- **Pre-dispatch context sizing.** Estimate an executor brief before dispatch and choose `fits`, split
  by a coherent seam, or return to refinement. Do this only after measurements provide a useful
  threshold; XL already handles deliberate segmentation at idea level.
- **General framework eval suite.** Broader than the focused navigation eval: quality, cost and drift
  across command types. Useful, but too expensive to block the current navigation work.
- **Measure English-execution benefit.** Replace the historical token-density estimate with real
  measurements if language choice becomes an optimization decision again.

## Deterministic execution and safety

- **Move more mechanical work from prompts to deterministic utilities.** Examples: compact test/build
  output runner, manifest/version checks, artifact validation and enumerable repository facts.
- **Executable hooks/guardrails where they add real safety.** Keep mutation isolation and destructive
  operation protection machine-enforced when prompt rules are insufficient.
- **Formal artifact schema and freshness validation.** Revisit when multiple executable consumers need
  a stable machine contract; do not introduce schema ceremony only for prose-to-prose handoff.

## Prompt and agent architecture

- **Modularize command bodies further.** Heavy command-specific Phase 0.5 prose and repetitive negative
  rules remain a prompt-size target. Prefer conditionally loaded Skills/references over a larger
  always-loaded command body when Claude Code's current plugin model makes that genuinely cheaper.
- **Specialized subagents.** Consider fixed roles only where repeated prompts and stable contracts show
  a measurable quality/cost advantage over short task-specific briefs.

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

1. it removes a measured cost or recurring failure;
2. it is required by an active milestone;
3. it closes a demonstrated quality/safety gap;
4. maintaining the current manual process costs more than the proposed automation.

Do not promote an item only because it is architecturally attractive.
