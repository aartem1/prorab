# prorab

An agentic-development framework for Claude Code. A set of commands that carry an idea
through the whole path — from a raw formulation to a turnkey implementation — plus a separate
track of continuous code health.

The repository is laid out as a **Claude Code marketplace** with **two plugins**: the commands
install globally via the standard plugin mechanism and update from git. The working artifacts
(refined ideas, audits, implementation plans) meanwhile stay in the project where the command
was run.

- **`prorab`** — the product/business track (`/prorab:*`): a new feature from idea to release.
- **`prorab-tech`** — the tech-quality track (`/prorab-tech:*`): tech-debt audit and safe
  refactoring. A separate namespace — so the tech commands don't get confused with the product ones.

## Pipeline: the product track (`prorab`)

```
raw idea ──/prorab:refine──▶ IDEA-<slug>.md ──/prorab:build──▶ implementation + IMPL ──/prorab:announce──▶ announcement to forward
                             (carries a hashed Code map)

small change ──/prorab:quick──▶ implementation, no artifacts   (escalates to refine+build if it turns out not to be small)
```

| Command | What it does |
|---|---|
| **`/prorab:refine`** | Iteratively works a raw idea up to spec-readiness: skeptical questions, code study, surfacing contradictions and gaps. Writes no code. Result — `tasks/ideas/IDEA-<slug>.md`, including a `Code map` handoff of what it already read. |
| **`/prorab:build`** | Turnkey implementation of a refined idea via a multi-agent ultracode Workflow: code recon → plan → DAG-ordered implementation → adversarial review → verification. Reuses the IDEA's `Code map` when the recorded file hashes still match, so fresh recon isn't paid for twice. It derives the verification recipe from repository guidance, CI, task runners/package scripts, and test conventions instead of assuming a stack. No approval gate. Result — code + `tasks/IMPL-<slug>.md`. |
| **`/prorab:quick`** | The cheap lane for a 1–2 file everyday change: no IDEA/IMPL, no archive, no Workflow, at most 2 contexts. Keeps the floor — a DoD stated before editing, a red-for-the-right-reason test, the project's own checks, one independent verifier. An eligibility gate hands the task over to `refine`+`build` (or the tech track) the moment it turns out not to be small. Result — code + a short chat report. |
| **`/prorab:announce`** | Prepares a concise, precise announcement of the results (what was done/new/changed, methods, how it's computed) — dense and convenient to forward in a messenger. Reads IMPL/diff/IDEA, fact-checks. Writes no code, makes no commit. |
| **`/prorab:ask`** | Answers questions about the current project or its history. Uses bounded project memory and task artifacts to find the area, then verifies material claims against current code/docs or Git history and cites the sources. |

The commands can be used separately, but they're designed as a pipeline:
first work up the "blueprint", then build, then briefly tell people about the result.

**Choosing the lane.** `refine → build` is for anything that touches an external contract, spans
several files or layers, or has a requirement that can be read more than one way. `quick` is for the
daily two-file change where the pipeline's ceremony would cost more than the work. You don't have to
guess right: `quick` re-checks its eligibility gate after it has read the code and hands the task
over instead of finishing it on the wrong budget, and `refine` points at `quick` when a settled idea
turns out to be tiny. `refine` and `build` are deliberately **not** merged into one command — see the
[CHANGELOG](CHANGELOG.md) entry for `prorab 0.10.0` for why the token saving people expect from
merging is really recon reuse, which needs no merge.

## Pipeline: the tech-quality track (`prorab-tech`)

Two pairs for two natures of debt. **Structural** debt (duplication, complexity, layers) —
`audit → refactor`. **Static** debt (linters, types, formatters, dead code, gate) —
`lint-audit → lint-fix`.

```
structural: ──/prorab-tech:audit──▶ AUDIT-<slug>.md (backlog + spec #1) ──/prorab-tech:refactor──▶ refactoring + IMPL-refactor ──▶ /prorab:announce
static:     ──/prorab-tech:lint-audit──▶ LINT-<slug>.md (batch ladder) ──/prorab-tech:lint-fix──▶ pass + gate state + IMPL-lint (repeat per batch) ──▶ /prorab:announce
```

| Command | What it does |
|---|---|
| **`/prorab-tech:audit`** | A multi-agent codebase audit: sweeps by smell classes + churn×complexity from git, clusters, ranks by `value × safety × size × confidence`, adversarially verifies the top. Produces the optimal candidate for a safe refactoring. The candidate spec carries hashed provenance, so `refactor` can tell a still-valid audit from one describing code that has moved on. Touches no code. Result — `tasks/audits/AUDIT-<slug>.md`. |
| **`/prorab-tech:refactor`** | A turnkey safe fix via a multi-agent ultracode Workflow. **Prime directive — behavior preservation:** a net of characterization tests on the old code, small steps, adversarial drift search, a differential old-vs-new run, a measured quality improvement. It re-hashes the AUDIT's provenance before choosing a tier and reuses only the fresh part of the map. `refactor <id>` fixes the chosen candidate; `refactor` with no argument — auto-picks #1 from the latest audit. Result — code + `tasks/IMPL-refactor-<slug>.md`. |
| **`/prorab-tech:lint-audit`** | An audit of **static quality**: inventories the tooling (what exists / is broken / is absent), runs analyzers already available in the project read-only, and labels absent-tool estimates as manual unless an ephemeral download is explicitly authorized. Clusters into an **ordered ladder of safe passes**: A autofix → B onboarding tools → C first gate → D strictness ratchet. Records the exact analyzer/net invocations and the gate entrypoint for `lint-fix` to reuse; violation counts are explicitly a snapshot, not a handoff. Touches no code. Result — `tasks/audits/LINT-<slug>.md`. |
| **`/prorab-tech:lint-fix`** | Runs **ONE** batch of the ladder turnkey via Workflow. **Prime directive — behavior preservation + a truthful gate lifecycle:** pre-C A/B batches are preparatory and not called locked; C creates and sabotage-proves the first gate; post-C A/B/D batches tighten or expand that gate and prove the changed coverage. Doesn't fix a latent bug — routes it to the product track. Takes the current gate state from the last completed batch artifact instead of rediscovering it, and re-runs every command it reuses. `lint-fix <id>` — a batch, no argument — auto-picks the next. Result — code + gate-state evidence + `tasks/IMPL-lint-<plan-slug>-batch-<id>.md`. |

**Inversion relative to `build`:** `build` proves that *new* behavior matches a requirement;
`refactor` and `lint-fix` prove that *old* behavior **did not change**. A different
verification discipline — hence separate executors, and their results (`IMPL-refactor-*` /
`IMPL-lint-*`) are announced by the same `/prorab:announce`.

**Two pairs — different natures of debt.** `audit`/`refactor` work with *structure* (read the
code, find one best candidate, fix with characterization tests). `lint-audit`/`lint-fix`
work with *statics* (run tools, produce a ladder, prepare green tools in A/B, create the first gate
in C, then tighten that existing gate in later passes so the enforced bar grows monotonically).

## Adaptive budget for complexity

The heavy commands (`build`, `audit`, `refactor`, `lint-audit`, `lint-fix`) run a
**Phase 0.5 — Budget triage** step before fanning out agents: they estimate complexity from cheap
signals (size, blast radius, novelty, reversibility, uncertainty) and pick a **tier S/M/L**. The
budget is cumulative for the whole command and counts the main context plus every delegated or
Workflow context, including retries:

- **S:** at most 2 contexts total; no Workflow;
- **M:** at most 6 contexts total;
- **L:** at most 12 by default, expandable to the absolute cap of 16 only for a confirmed critical
  risk or explicit `--thorough`.

Every delegated context has a mandatory turn limit (`max_turns` for direct agents, `maxTurns` in
workflow/custom-agent configuration; 6/8/12 for S/M/L), and review→fix cycles
are capped at 1/2/3. A completed round with no new confirmed, non-duplicate findings stops fan-out
immediately. Judge-panels are used only for at least two genuinely different designs and consume
the same cap. Generated Workflow scripts enforce their remaining allowance with a counter and a
`boundedAgent()` wrapper; unbounded `agent()`/`pipeline()` fan-out is forbidden. `audit` groups its
catalog into three directions (structure; reliability/security;
performance/maintainability) and verifies candidate #1 by default; runners-up are verified only on
a near tie or if #1 fails. `refactor`/`lint-fix` take the tier from the upstream artifact
(AUDIT/LINT) instead of re-deriving it — except that `refactor` inherits it only while the AUDIT's
recorded hashes still match (see below); any staleness makes it re-derive.

**Savings without losing quality.** The safety floor is non-negotiable at any tier (per the
command's nature: net/baseline, contract-diff, drift search, a DoD skeptic, and a sabotage-proven
gate whenever one is created or changed). Verification follows a cheap-first evidence hierarchy:
executable tests/differential runs → static/type/contract evidence → one independent reviewer → a
second only on conflict/high blast → a three-reviewer panel only for confirmed
contract/security/business-critical risk.

Mutation intensity is controlled separately from the S/M/L context tier:

- **`economy`** — no mutation for low-risk, contract-untouched work with strong executable evidence;
- **`balanced`** — the default otherwise; at most one mutation per critical invariant/risk cluster;
- **`thorough`** — explicit or critical-risk mode; mutation of each substantial DoD/behavior boundary.

Gate creation/expansion still gets one representative violation because gate coverage is itself a
critical invariant. Verification mutations run only in temporary isolated worktrees, never in the
user's working tree. The settings can be pinned with `--fast`, `--thorough`, `--tier=S|M|L`, or
`--verification=economy|balanced|thorough`, but the 16-context ceiling remains absolute. `refine`
has a two-Explore-context recon cap; `announce` allows one delegated context and one fact-check pass;
`quick` is fixed at two contexts (itself plus one independent verifier) with no Workflow at all.

**Recon is not paid for twice.** `refine` records a `Code map` in the IDEA — the files it already
opened, with a `git hash-object` content hash each, plus reuse points, change points, contracts at
risk, conventions to mirror and its honest "not studied" gaps. `build` re-hashes those paths: all
fresh → recon costs zero contexts; partly fresh → recon is scoped to the stale entries and the
declared gaps; no map or no hashes → normal recon. Saved contexts are banked, not respent. A matching
hash proves only that the file is unchanged, so a map claim driving an external-contract edit is still
verified in current source, and the map's observed verification commands stay a hint that Phase 0 must
confirm.

The tech track gets the same idea in two different shapes, because the pairs waste different things.
`audit` stamps its #1 candidate with the commit plus hashes of the target files, the tests its net
status rests on, and the call-site files; `refactor` re-hashes them **before choosing a tier**, since
it otherwise inherits `safety`/`coverage_nearby`/`blast_radius` from an audit that may describe code
which no longer exists. Fresh paths cost zero recon; a stale target makes the candidate obsolete until
the smell is re-confirmed, a stale test voids the coverage claim, a stale call-site voids the blast
radius, and any staleness forces the tier to be re-derived. For the static pair a hashed map would be
the wrong instrument — violation counts go stale the moment a batch lands, and re-running the analyzer
is deterministic and nearly free — so `lint-audit` hands over the **exact invocations and the gate
entrypoint** instead, and `lint-fix` reads the current gate state from the last completed batch
artifact rather than rediscovering it.

## Execution language

Command bodies are written in **English**, and the internal work runs in English
(reasoning, inter-agent prompts, `schema` outputs) — it's denser in tokens and steadier
in quality. **Everything a human reads is in the task's language** (detected from how the
request is phrased; Russian by default): the chat, the `refine` dialogue, the `announce` text, and
the artifacts (`IDEA`/`IMPL`/`AUDIT`/`LINT`) — they stay project documents in the task's language.
Code, names, comments, commit messages — always English. Terms visible to the user
(UI/domain) aren't round-tripped through a double translation — they're carried as-is in the task's
language.

## Installation

### Locally (for developing the framework itself)

```
/plugin marketplace add /Users/a.altukhov/Documents/prorab
/plugin install prorab@prorab
/plugin install prorab-tech@prorab
```

### From GitHub (on other machines)

First push the repository to GitHub, then:

```
/plugin marketplace add <owner>/prorab
/plugin install prorab@prorab
/plugin install prorab-tech@prorab
```

Both plugins live in the same `prorab` marketplace; they install separately. After installation
the commands are available globally in all projects: product ones — `/prorab:refine`, `/prorab:build`,
`/prorab:quick`, `/prorab:announce`, `/prorab:ask`; tech-quality — `/prorab-tech:audit`, `/prorab-tech:refactor`,
`/prorab-tech:lint-audit`, `/prorab-tech:lint-fix`.

## Updating

```
/plugin marketplace update prorab
```

This pulls the fresh version from git for both plugins. When you change a command, don't forget
to **bump the `version`** in two places for the affected plugin — its
`plugins/<plugin>/.claude-plugin/plugin.json` and the corresponding entry in
`.claude-plugin/marketplace.json` — and record the change in [CHANGELOG.md](CHANGELOG.md).
Each plugin has its own version (`prorab` and `prorab-tech` are versioned independently).

## Artifact contract

- The commands are installed **globally**; the artifacts live **locally** in the working project.
- `/prorab:refine` writes the refined idea to `tasks/ideas/IDEA-<slug>.md`, including the `Code map`
  handoff (files studied with content hashes, reuse/change points, conflicts, conventions, gaps).
- `/prorab:build` reads an active IDEA, reuses its `Code map` where the hashes still match, writes
  `tasks/IMPL-<slug>.md`, and after verified completion moves the linked task bundle into
  `tasks/archive/<YYYY>/<task-slug>/`.
- `/prorab:quick` writes **no** artifact at all — only project code and tests, plus a short chat
  report. It creates no IDEA/IMPL, archives nothing, and at most adds one memory entry.
- `/prorab-tech:audit` writes an audit report with a ranked backlog and a candidate spec to
  `tasks/audits/AUDIT-<slug>.md`; touches no code.
- `/prorab-tech:refactor` reads the AUDIT spec and writes a refactoring plan to
  `tasks/IMPL-refactor-<slug>.md`. A completed candidate is archived; a multi-candidate AUDIT stays
  active until its unfinished backlog is exhausted, with a scoped candidate snapshot in the archive.
- `/prorab-tech:lint-audit` writes a static-quality plan (tooling inventory + a ladder of
  safe passes) to `tasks/audits/LINT-<slug>.md`; touches no code.
- `/prorab-tech:lint-fix` reads the active LINT plan, runs one batch, writes a linked
  `tasks/IMPL-lint-<plan-slug>-batch-<id>.md`, and marks only that batch done. The LINT and batch
  artifacts move together only when the full ladder is completed or explicitly closed.
- `/prorab:announce` reads active or archived IMPL/diff/IDEA and produces an announcement in chat.
  When saved for an archived task, `ANNOUNCE-<slug>.md` goes into the same archive directory.
- `/prorab:ask` reads current code/docs, bounded memory, active/archive artifacts, and Git history.
  It changes no project code; it may only correct or stale a disproved memory entry.
- All commands continue to understand legacy active `IDEA-*`, `IMPL-*`, `AUDIT-*`, `LINT-*`, and
  `IMPL-lint-*` names. Archive is never selected as active work by default.
- It's worth keeping these files in the project repository under version control — they document what
  was decided and why.

## Project memory

Prorab builds a small, version-controlled memory during normal work; there is no `init`, `remember`,
background process, external model, or vector database. The structure is created lazily:

```text
tasks/memory/
├── INDEX.md
├── components/
├── decisions/
├── gotchas/
└── verification/
```

Entries are small Markdown documents with typed/statused frontmatter, source artifacts/current
paths, confirmed facts separated from inference, evidence, and explicit invalidation conditions.
Commands recall exact paths, symbols, component names, and domain terms before broader matching and
pass only a compact digest into the main flow.

Memory is deliberately last in the source-of-truth order: current worktree → current repository
instructions/docs → tests/CI/executable evidence → task artifacts → memory. A material memory claim
must be checked against current source before it affects behavior, architecture, contracts, Scope,
DoD, implementation, or verification. A conflict makes the entry updated, `superseded`, or `stale`;
it never overrides the code. Missing memory never breaks a command.

Capture is automatic but selective: durable decisions, boundaries, contracts/consumers, recurring
gotchas, rejected alternatives, and re-verified commands may be stored. Transcripts, reasoning,
temporary status, ordinary code facts, unmarked assumptions, and copies of task artifacts are not.

## Active and archive lifecycle

Active work stays in the existing paths. Verified completed bundles move to:

```text
tasks/archive/
└── YYYY/
    ├── <task-slug>/
    ├── refactor-<task-slug>/
    └── lint-<plan-slug>/
```

Before moving, the command verifies explicit artifact identity/links, refuses paths outside
`tasks/`, never overwrites an existing directory (uses deterministic `-2`, `-3`, ... suffixes),
updates links, re-opens destinations, and reports every moved file. A blocker, partial completion,
or failed mandatory verification leaves artifacts active. No command commits or pushes unless the
user explicitly requests it.

Examples:

1. `refine → build`: the IDEA is implemented, verified facts are captured, then IDEA+IMPL move into
   one archive directory. A later saved ANNOUNCE joins that directory.
2. A new task recalls an earlier decision, but opens the cited current source before relying on it.
3. `/prorab:ask "How is X calculated?"` answers from current code and identifies historical-only
   context separately.
4. Another developer changes cited code: recall detects the mismatch, uses current code, and updates
   or marks the memory entry stale.
5. One AUDIT has three candidates and refactor completes #1: the AUDIT remains active with #2/#3;
   the archive receives a #1 snapshot and its IMPL.
6. A partial LINT ladder stays active with completed batch artifacts beside it. After the final
   batch, the LINT and all linked batch IMPL files move together.

## How to add a new command

1. Drop `plugins/<plugin>/commands/<name>.md` (frontmatter `description` /
   `argument-hint` + the prompt body) into the right plugin (`prorab` — product, `prorab-tech`
   — tech-quality).
2. Bump the `version` in that plugin's `plugin.json` and in its entry in `marketplace.json`,
   add an entry to `CHANGELOG.md`.
3. `/plugin marketplace update prorab` — the command becomes available as `/<plugin>:<name>`.

## Repository structure

```
prorab/
├── .claude-plugin/
│   └── marketplace.json          # marketplace manifest (both plugins)
├── plugins/
│   ├── prorab/                    # product track
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json        # plugin manifest + version
│   │   ├── commands/
│   │   │   ├── refine.md
│   │   │   ├── build.md
│   │   │   ├── quick.md         # cheap lane for small changes
│   │   │   ├── announce.md
│   │   │   └── ask.md
│   │   ├── references/
│   │   │   └── project-knowledge.md
│   │   └── README.md
│   └── prorab-tech/               # tech-quality track
│       ├── .claude-plugin/
│       │   └── plugin.json        # plugin manifest + version
│       ├── commands/
│       │   ├── audit.md           # structural debt: audit
│       │   ├── refactor.md        # structural debt: fix
│       │   ├── lint-audit.md      # static debt: audit
│       │   └── lint-fix.md        # static debt: ratchet pass
│       ├── references/
│       │   └── project-knowledge.md
│       └── README.md
├── tests/
│   └── test_contracts.py         # manifests/frontmatter + lifecycle scenario checks
├── README.md
└── CHANGELOG.md
```
