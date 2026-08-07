# Plugin architecture initiative

Execution order and status live only in [`ROADMAP.md`](../../ROADMAP.md). This document defines the
architecture Prorab should converge on before further large workflow changes.

## Goal

Turn Prorab from a set of large prompt-heavy command files into a small, layered Claude Code plugin
whose instructions and model work are loaded only when needed — **without changing the user-facing
workflow or lowering its safety floor**.

This is a modernization, not a rewrite.

## Why now

The current product model is sound: users intentionally choose `refine`, `build`, `quick`, `revise`,
`verify`, `announce` and `ask`, while `prorab-tech` owns audit/refactor/static-quality work. The problem
is internal: much of orchestration, policy, conditional behavior and mechanical procedure is encoded in
large `commands/*.md` prompts.

Navigation work will touch the same heavy entrypoints. Restructuring them first avoids implementing new
recon logic inside files that would immediately need another migration.

## Target architecture

```text
plugin/
├── skills/
│   ├── refine/
│   │   ├── SKILL.md
│   │   └── supporting workflow/reference files
│   ├── build/
│   ├── quick/
│   ├── revise/
│   └── verify/
├── agents/                 # only stable bounded reasoning roles
├── references/             # genuinely shared policy/knowledge
├── bin/                    # deterministic plugin utilities as they become useful
└── .claude-plugin/
```

The same principle applies to `prorab-tech`.

### Skills: workflow entrypoints

Canonical user-facing commands should become plugin Skills while preserving their current slash names
and semantics.

A `SKILL.md` should contain only what the main context needs throughout the run:

- purpose and contract;
- entry conditions and routing decisions;
- quality floor;
- concise phase order;
- when to load a supporting file;
- when to delegate or escalate;
- final artifact/result requirements.

Large conditional instructions belong next to the Skill and are read only when their branch applies.
Examples: XL segmentation, browser verification, specialized review policy, artifact templates or
stack-specific guidance.

Migration is valuable only when it reduces always-loaded prompt and improves ownership. Moving a
40 kB command unchanged to `SKILL.md` does not count as success.

### Subagents: bounded isolated intelligence

Use `agents/` for roles that benefit from a clean context, stable contract and independent model/effort
choice, for example a narrow recon worker or independent verifier.

Do not turn every phase into an agent. A role deserves a fixed subagent when at least one is true:

- it needs a different model/effort from the main workflow;
- isolation is required for validity, such as blind verification;
- its contract repeats across commands;
- keeping its intermediate work outside the main context materially reduces pollution.

Task-specific one-off reasoning can remain a short delegated brief rather than creating a permanent
agent definition.

### Plugin executables: deterministic mechanics

Anything enumerable and repeatable should prefer `bin/` over model reasoning when a utility is actually
needed. Likely consumers include:

- content hashes and freshness checks;
- repository inventory / RepoMap operations;
- compact test/build output digestion;
- manifest/version checks;
- artifact validation;
- exact machine-readable status and counts.

Utilities are introduced alongside the feature that consumes them, not as a speculative utility
platform.

### References: shared policy, not a dumping ground

Keep a reference file only when multiple workflows need the same stable policy or source-of-truth
contract. Command-specific detail should live beside its Skill so it can be loaded progressively.

Avoid converting every reference into a discoverable Skill: internal documentation is not an
independent capability and should not add unnecessary discovery/context surface.

### Workflows: exceptional large fan-out

Dynamic/Workflow orchestration remains appropriate for genuinely large parallel work where keeping
intermediate state outside the main model context is valuable. It is not the default implementation of
ordinary `build`, `quick`, `revise` or verification.

Prorab remains the owner of orchestration; Ultracode/dynamic automatic orchestration is not stacked on
top as the normal execution mode.

### Hooks: narrow guardrails only

Hooks may enforce a deterministic safety/event invariant when prompt policy is insufficient. They are
not the orchestration layer and are not required for ARCH-001.

### No `prorab-core` plugin yet

Keep the existing `prorab` and `prorab-tech` plugin boundary. A shared third plugin becomes justified
only after both tracks depend on substantial executable infrastructure with an independently useful
version/lifecycle. Shared prose alone is not enough reason.

## ARCH-001 — Canonical Skills and progressive disclosure

### Scope

- migrate user-facing `commands/*.md` entrypoints to canonical plugin Skills;
- preserve existing slash names, arguments, artifacts and lifecycle semantics;
- decompose large command bodies so conditional instructions are loaded on demand;
- keep genuinely shared contracts as references rather than duplicating them;
- establish the directory/ownership convention for `skills/`, `agents/`, `references/` and `bin/`;
- integrate MODEL-001 routing cleanly into the new Skill/subagent boundaries;
- update contract tests and documentation for the new layout.

### Explicitly not required

- rewriting the product lifecycle;
- changing artifacts merely to fit the new directory structure;
- building RepoMap/navigation yet;
- creating a third core plugin;
- creating a broad agent catalog;
- adding hooks, MCP or Workflow where the current behavior does not need them;
- extracting every possible deterministic helper in one pass.

### Definition of Done

- all current user-facing commands still invoke the same capabilities and produce the same artifact
  classes;
- canonical entrypoints live under `skills/`, not legacy `commands/`;
- heavy Skills have materially smaller always-loaded bodies and conditional detail is reachable through
  explicit supporting files;
- model/effort routing and independent verifier/recon roles have clear ownership instead of ad-hoc
  duplication inside commands;
- there is one documented rule for deciding Skill vs subagent vs reference vs executable vs Workflow;
- plugin validation/contract tests pass and no compatibility behavior is silently lost;
- no speculative runtime layer is added without a current consumer.

## Architecture rule of thumb

When adding behavior after ARCH-001, ask in this order:

1. **Can it be deterministic?** Put it in an existing/new minimal executable when there is a consumer.
2. **Does it require isolated bounded reasoning?** Use a subagent with the cheapest sufficient model.
3. **Is it conditional guidance inside an existing workflow?** Put it beside that Skill and load it on
   demand.
4. **Is it shared stable policy?** Put it in a reference.
5. **Is it the user-facing capability/workflow itself?** It belongs in a Skill.
6. **Is it truly large parallel orchestration?** Only then consider Workflow.

## Reference

- Claude Code Skills: <https://code.claude.com/docs/en/skills>
- Claude Code plugins: <https://code.claude.com/docs/en/plugins>
- Claude Code subagents: <https://code.claude.com/docs/en/sub-agents>
- Claude Code workflows: <https://code.claude.com/docs/en/workflows>
