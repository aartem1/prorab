# Model and effort routing initiative

Execution order and statuses live only in [`ROADMAP.md`](../../ROADMAP.md). This document defines the
initial routing policy. It is intentionally opinionated: start with a sensible low-cost default, keep
quality gates unchanged, and adjust from real work instead of building a benchmark project first.

## Goal

Reduce Claude Code limit consumption by avoiding expensive models and reasoning levels where they do
not materially improve the result.

Prorab already limits how many model contexts a command may create. This initiative adds the missing
second axis: **how expensive each context is**.

## Native Claude Code capabilities to use

Current Claude Code supports the routing primitives Prorab needs directly:

- custom commands and Skills can set `model` and `effort` for the invoked turn;
- subagents can set their own `model`, `effort` and `maxTurns`;
- a subagent invocation can override its configured model for that specific call;
- built-in `Explore` now inherits the parent session model, so an Opus session does not automatically
  make exploration cheap;
- Ultracode combines `xhigh` effort with automatic dynamic-workflow orchestration.

Therefore MODEL-001 should not introduce a proxy, provider abstraction or separate scheduler. Use the
native controls first.

## Core policy

**Use the cheapest model/effort that should reliably complete the role, then escalate only the part
that proves harder than expected.**

Model choice and Prorab's S/M/L/XL context tiers are independent axes. A large mechanical migration can
still use Sonnet; a small but ambiguous architecture decision can require Opus.

### Initial routing table

This is the starting policy, not a permanent model benchmark.

| Work | Default | Effort | Escalate when |
|---|---|---|---|
| Deterministic facts, hashing, status, counts, test parsing | no model where possible | — | only if interpretation is actually needed |
| File discovery, exact lookup, inventory, first-pass recon | Haiku | `medium` where supported | candidates remain ambiguous or scope depends on interpretation |
| Routine implementation, tests, fixes, refactors | Sonnet | `high` | repeated failure, unclear contract, or materially uncertain design |
| Routine reviewer / verifier | Sonnet | `high` | evidence conflicts, critical risk, or reviewer cannot reach a grounded verdict |
| Ambiguous product/architecture decision, cross-cutting contract reasoning | Opus | `high` | only exceptional cases need more |
| Recovery from failed lower-tier reasoning, security/business-critical ambiguity | Opus | `xhigh` | `max` only by explicit exceptional need |

If a requested effort level is not supported by the chosen model, use the nearest normal supported
level. Do not move to a more expensive model family merely to obtain a higher effort setting.

## Command defaults

The normal Prorab entrypoint should no longer inherit an expensive user session by accident.

Initial recommendation:

- `refine`, `build`, `quick`, `revise`, `verify`, `ask` → **Sonnet / high**;
- `audit`, `refactor`, `lint-audit`, `lint-fix` → **Sonnet / high**;
- `announce` → **Sonnet / medium**;
- targeted recon workers → **Haiku / medium** where the role is genuinely lookup/extraction rather
  than scope judgment;
- Opus is invoked only for the narrow escalation cases below.

The user's session model resumes after the command turn, so Prorab should make this automatic rather
than asking the user to switch models manually for every command.

## Escalation rules

Escalation must have a concrete reason. Valid signals include:

- two or more materially plausible interpretations remain and the choice affects behavior or scope;
- a public/API/data contract or high-blast-radius architectural boundary cannot be resolved from
  current evidence;
- implementation or verification fails again after one grounded correction and the root cause is not
  mechanical;
- independent evidence or reviewers disagree on a material correctness issue;
- security, irreversible data change or business-critical behavior requires stronger reasoning;
- the lower-tier context explicitly reports that it cannot reach a grounded conclusion within its
  bounded turns.

When escalation triggers:

1. preserve the evidence already collected;
2. send only the unresolved decision/problem to the stronger model;
3. return the stronger model's conclusion as a compact capsule;
4. continue routine execution on the cheaper default where possible.

Do **not** restart the whole command on Opus just because one node needed Opus.

## De-escalation rules

Do not spend Sonnet/Opus on work that can be made deterministic or is narrowly extractive:

- file lists and hashes;
- git status/diff classification;
- exact symbol/path/string lookup;
- mechanical test-output compaction;
- manifest/version checks;
- straightforward candidate inventory.

Prefer a script/tool first, Haiku second, then Sonnet only if interpretation is necessary.

## Ultracode policy

Ultracode is **not a Prorab default**.

It combines `xhigh` reasoning with automatic workflow orchestration, and one substantive request can
become multiple workflows. Prorab already owns orchestration, context budgets, review/fix cycles and
verification. Stacking the two makes token use harder to predict and risks paying twice for planning,
implementation and verification.

Prorab commands should therefore set their own normal model/effort policy. A user can still choose
Ultracode deliberately outside Prorab or for an exceptional task, but Prorab must not require it for
quality.

## Quality floor

Routing changes **capability allocation**, not acceptance criteria.

The following remain independent of model choice:

- Definition of Done;
- right-reason red / characterization where required;
- contract and consumer checks;
- project verification commands;
- independent verification/review required by the command;
- bounded fallback and escalation when uncertainty remains.

A cheaper model is acceptable only because the framework can detect when the task needs stronger
reasoning and escalate narrowly.

## MODEL-001 — implementation scope

Implement one coherent routing pass rather than a new subsystem:

1. set sensible `model` / `effort` defaults on Prorab command entrypoints using native command/Skill
   frontmatter;
2. make recon/extraction workers explicitly cheap instead of inheriting the parent model;
3. let task-specific agent calls select Sonnet or Opus according to the role and escalation rules;
4. add bounded escalation language to the shared execution contract so commands do not invent their
   own routing rules;
5. keep existing context caps and safety floors unchanged;
6. document that Ultracode is not required or recommended as the normal Prorab session mode;
7. avoid adding user prompts or approval steps for routine model selection.

### Definition of Done

- Starting Prorab from an Opus/Ultracode session no longer causes every Prorab context to inherit that
  expense by default.
- Routine coding and verification use Sonnet/high unless a defined escalation signal fires.
- Narrow recon/extraction can use Haiku without being allowed to make final high-impact scope or
  contract decisions.
- Opus escalation is narrow and preserves prior evidence rather than restarting the run.
- Existing quality/safety contracts and context caps remain unchanged.
- Unsupported/unavailable model overrides degrade safely to an available model rather than breaking
  the command.

## How we tune it

No replay of old tasks is required.

Adjust the table only from repeated normal-use evidence:

- if a role repeatedly escalates for the same reason, raise that role's default;
- if a role repeatedly succeeds and produces no quality issues, leave it alone;
- if an expensive role repeatedly contributes no unique finding, lower it or make the work
  deterministic;
- if a cheaper route causes a real miss, fix that route or its escalation trigger before seeking more
  savings.

Keep this qualitative at first. Add counters/telemetry only if ordinary runs stop being enough to make
those decisions.

## References

- Claude Code Skills/frontmatter: <https://code.claude.com/docs/en/skills>
- Claude Code subagents/model routing: <https://code.claude.com/docs/en/sub-agents>
- Claude Code dynamic workflows/Ultracode: <https://code.claude.com/docs/en/workflows>
