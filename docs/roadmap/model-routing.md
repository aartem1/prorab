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

Current Claude Code supports the routing primitives Prorab needs directly, but each one has an edge
worth stating before designing on top of it:

- files under `commands/` take the same frontmatter as Skills, so `model` and `effort` can be set on
  today's entrypoints — **MODEL-001 does not depend on ARCH-001** and no migration to `skills/` is
  needed first;
- a model override holds **only for the turn it was invoked on**; the session model returns on the
  user's next message. That makes pinning natural for a one-pass command and costly for a
  many-round dialogue;
- a prompt cache is scoped to one model, so every hop between models rewrites the conversation
  prefix cold — another reason a multi-turn command is not a pinning candidate;
- subagents defined in `agents/*.md` can set their own `model`, `effort` and `maxTurns`, and a
  subagent invocation can override the configured model for that call. Prorab ships no `agents/`
  yet (that is ARCH-001), so today the control is per call;
- the `Agent` tool accepts `model` per call but has **no `effort` parameter**. Per-call effort exists
  only for `agent()` inside a `Workflow`. In `quick`/`revise`/`verify` the delegate's effort is
  therefore not directly controllable — it inherits, which is acceptable because those delegates run
  at the pinned entrypoint level anyway;
- agents inside a `Workflow` **inherit the main loop's model by default**. Pinning an entrypoint to
  Sonnet therefore silently makes every Workflow node Sonnet, judges and verifiers included. The
  strong side has to be named explicitly, and before or with the pin — not after;
- built-in `Explore` inherits the main conversation's model, and a **plugin cannot override it**: only
  a user- or project-level agent named `Explore` can, and plugin agents are namespaced. So exploration
  is cheapened at each call site, not once globally;
- `CLAUDE_CODE_SUBAGENT_MODEL` outranks both a per-invocation `model` and a subagent's own
  frontmatter. For a user who sets it, delegated routing is silently inert;
- `haiku-4-5` does **not support effort levels at all**. Fable 5, Opus 5/4.8/4.7 and Sonnet 5 do.
  Claude Code collapses an unsupported level to the nearest supported one, so this is not an error —
  but it is also not control, and a Haiku row in a routing table should not pretend otherwise;
- **effort already defaults to `high`** on every model that supports it. Writing `effort: high` in
  frontmatter therefore saves nothing on a default session; its whole job is to stop an `xhigh`/`max`
  session from being inherited;
- Ultracode is a **session setting**, not an effort level: `xhigh` **plus** automatic dynamic-workflow
  orchestration, for the current session only. Whether a command's frontmatter `effort` also switches
  off that auto-orchestration **is not documented — it is an open unknown**, not an assumption this
  design may lean on.

Therefore MODEL-001 should not introduce a proxy, provider abstraction or separate scheduler. Use the
native controls first, and route around the edges above rather than assuming they do not exist.

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
| File discovery, exact lookup, inventory, first-pass recon | Haiku | not settable — Haiku 4.5 has no effort levels | candidates remain ambiguous or scope depends on interpretation |
| Routine implementation, tests, fixes, refactors | Sonnet | `high` (the default; written down to block an `xhigh` session) | repeated failure, unclear contract, or materially uncertain design |
| Routine reviewer / verifier | Sonnet | `high` (as above) | evidence conflicts, critical risk, or reviewer cannot reach a grounded verdict |
| Ambiguous product/architecture decision, cross-cutting contract reasoning | Opus | `high` | only exceptional cases need more |
| Recovery from failed lower-tier reasoning, security/business-critical ambiguity | Opus | `xhigh` | `max` only by explicit exceptional need |

Two honest readings of this table. **The effort column mostly protects rather than saves:** `high` is
already the default everywhere it is supported, so writing it down changes nothing on a default
session and everything on an `xhigh`/`max`/Ultracode one. And **Haiku's row has no effort control at
all** — an unsupported level collapses to the nearest supported one, which is a graceful fallback,
not a knob.

If a requested effort level is not supported by the chosen model, the nearest supported level is used
and the command continues. Do not move to a more expensive model family merely to obtain a higher
effort setting.

### What the savings actually are

Per-token list prices: Opus 5 $5/$25 per 1M in/out; Sonnet 5 $3/$15 ($2/$10 introductory, through
2026-08-31); Haiku 4.5 $1/$5. So Opus→Sonnet is **1.67×** at list (2.5× while the introductory price
holds), and Sonnet→Haiku is **3×**. Haiku's context window is 200K against 1M on the larger models,
which is a real constraint on what may be routed there.

The multipliers are not the main effect. **The main effect is not being dragged into an expensive
session at all**: before this change, invoking a command from an Opus/`xhigh` session made all of its
up-to-16 contexts Opus/`xhigh`. Starting from a Sonnet session, the gain from this initiative is close
to zero — and that is the honest way to state it.

## Command defaults

The normal Prorab entrypoint should no longer inherit an expensive user session by accident.

Initial recommendation:

- `build`, `quick`, `revise`, `verify`, `ask` → **Sonnet / high**;
- `audit`, `refactor`, `lint-audit`, `lint-fix` → **Sonnet / high**;
- `announce` → **Sonnet / medium**;
- `refine` → **not pinned; runs on the session model** (see below);
- targeted recon workers → **Haiku**, effort not settable, where the role is genuinely
  lookup/extraction rather than scope judgment;
- Opus is invoked only for the narrow escalation cases below, named explicitly at the node.

**`refine` is a deliberate exception.** It is a many-round dialogue by design — it advances in
iterations and has to stay habitable across rounds. Because a frontmatter override lasts only for the
turn it fired on, pinning it would make the conversation alternate between the pinned model and the
session model round by round, and because a prompt cache is scoped to one model, every alternation
would rewrite the prefix cold. That is a net *increase* in spend, not a saving. `refine` therefore
runs on the session model — which is also where the product decisions are made and where a strong
model earns its price. It still cheapens its own delegated recon per call. Reshaping `refine` into a
single-pass command would change this conclusion, and is out of scope for MODEL-001.

The user's session model resumes after the command turn, so Prorab makes this automatic rather than
asking the user to switch models manually for every command.

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

There is also an unknown here, and it is the reason the recommendation is "off" rather than "harmless
either way": **it is not documented whether a command's frontmatter `effort` switches off Ultracode's
automatic orchestration** for that turn, or only its effort level. If it does not, a pinned Prorab
command running inside an Ultracode session could still have workflows spawned around it. Until that
is established, the safe recommendation is a plain Opus session with Ultracode off. `xhigh` on the
session is fine and costs Prorab nothing, since every pinned entrypoint overrides it for its own turn.

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

0. **first** name the strong side explicitly at every judgment stage — before or together with step 1.
   A Workflow agent inherits the main loop, so pinning entrypoints first would quietly demote judges
   and verifiers to Sonnet, and no Definition-of-Done item would notice;
1. set sensible `model` / `effort` defaults on Prorab command entrypoints using native command/Skill
   frontmatter, with `refine` deliberately excluded;
2. make recon/extraction workers explicitly cheap instead of inheriting the parent model — per call,
   since a plugin cannot redefine built-in `Explore`;
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
- **Quality did not drop.** Every item above checks that routing was *applied*; this one checks that
  it cost nothing. One real `build` run on the new defaults reaches the same verdict as the old
  defaults did on the same task — same DoD items closed, no new defect escaping the same checks. One
  run, judged by a human reading both reports. This is deliberately not an eval suite: a suite is
  still not being built (see `ROADMAP.md` → *Continuous tuning*), but shipping a cost change with no
  evidence at all on the quality side would make the rest of this list self-confirming.

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
- Claude Code slash commands: <https://code.claude.com/docs/en/slash-commands>
- Claude Code subagents/model routing: <https://code.claude.com/docs/en/sub-agents>
- Claude Code dynamic workflows/Ultracode: <https://code.claude.com/docs/en/workflows>
- Model comparison and effort support: <https://docs.claude.com/en/docs/about-claude/models/overview>
- Pricing: <https://claude.com/pricing#api>
