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
```

| Command | What it does |
|---|---|
| **`/prorab:refine`** | Iteratively works a raw idea up to spec-readiness: skeptical questions, code study, surfacing contradictions and gaps. Writes no code. Result — `tasks/ideas/IDEA-<slug>.md`. |
| **`/prorab:build`** | Turnkey implementation of a refined idea via a multi-agent ultracode Workflow: code recon → plan → DAG-ordered implementation → adversarial review → verification. No approval gate. Result — code + `tasks/IMPL-<slug>.md`. |
| **`/prorab:announce`** | Prepares a concise, precise announcement of the results (what was done/new/changed, methods, how it's computed) — dense and convenient to forward in a messenger. Reads IMPL/diff/IDEA, fact-checks. Writes no code, makes no commit. |

The commands can be used separately, but they're designed as a pipeline:
first work up the "blueprint", then build, then briefly tell people about the result.

## Pipeline: the tech-quality track (`prorab-tech`)

Two pairs for two natures of debt. **Structural** debt (duplication, complexity, layers) —
`audit → refactor`. **Static** debt (linters, types, formatters, dead code, gate) —
`lint-audit → lint-fix`.

```
structural: ──/prorab-tech:audit──▶ AUDIT-<slug>.md (backlog + spec #1) ──/prorab-tech:refactor──▶ refactoring + IMPL-refactor ──▶ /prorab:announce
static:     ──/prorab-tech:lint-audit──▶ LINT-<slug>.md (batch ladder) ──/prorab-tech:lint-fix──▶ pass + gate + IMPL-lint (repeat per batch) ──▶ /prorab:announce
```

| Command | What it does |
|---|---|
| **`/prorab-tech:audit`** | A multi-agent codebase audit: sweeps by smell classes + churn×complexity from git, clusters, ranks by `value × safety × size × confidence`, adversarially verifies the top. Produces the optimal candidate for a safe refactoring. Touches no code. Result — `tasks/audits/AUDIT-<slug>.md`. |
| **`/prorab-tech:refactor`** | A turnkey safe fix via a multi-agent ultracode Workflow. **Prime directive — behavior preservation:** a net of characterization tests on the old code, small steps, adversarial drift search, a differential old-vs-new run, a measured quality improvement. `refactor <id>` fixes the chosen candidate; `refactor` with no argument — auto-picks #1 from the latest audit. Result — code + `tasks/IMPL-refactor-<slug>.md`. |
| **`/prorab-tech:lint-audit`** | An audit of **static quality**: inventories the tooling (what exists / is broken / is absent) + runs all available analyzers (linters, typecheckers, formatters, dead code, security) read-only, and for the absent ones estimates the "cost of enabling". Clusters into an **ordered ladder of safe passes**: A autofix → B onboarding tools → C a gate at the current level → D strictness ratchet. Touches no code. Result — `tasks/audits/LINT-<slug>.md`. |
| **`/prorab-tech:lint-fix`** | Runs **ONE** batch of the ladder turnkey via Workflow. **Prime directive — behavior preservation + a locked ratchet:** remove a finite class of violations, prove equivalence (a baseline net + a drift search), **add a gate (pre-commit/CI) and prove by a sabotage probe that it catches a regression**. Doesn't fix a latent bug — routes it to the product track. `lint-fix <id>` — a batch, no argument — auto-picks the next. Result — code + gate + `tasks/IMPL-lint-<slug>.md`. |

**Inversion relative to `build`:** `build` proves that *new* behavior matches a requirement;
`refactor` and `lint-fix` prove that *old* behavior **did not change**. A different
verification discipline — hence separate executors, and their results (`IMPL-refactor-*` /
`IMPL-lint-*`) are announced by the same `/prorab:announce`.

**Two pairs — different natures of debt.** `audit`/`refactor` work with *structure* (read the
code, find one best candidate, fix with characterization tests). `lint-audit`/`lint-fix`
work with *statics* (run tools, produce a ladder, fix in ratchet passes: each pass raises the
bar and locks it with a gate, so quality grows monotonically and doesn't roll back).

## Adaptive budget for complexity

The heavy commands (`build`, `audit`, `refactor`, `lint-audit`, `lint-fix`) run a
**Phase 0.5 — Budget triage** step before fanning out agents: they estimate complexity from cheap
signals (size, blast radius, novelty, reversibility, uncertainty) and pick a **tier S/M/L**. The tier
scales the number of scouts/scanners, the judge-panel (engaged only on real ≥2 designs), the
number of verification skeptics and the loop caps; mechanical stages are given a cheap model
(`opts.model`/`opts.effort`). `refactor`/`lint-fix` take the tier from the upstream artifact
(AUDIT/LINT), not re-deriving it. So simple tasks cost noticeably fewer limits, while large ones
still get the full ultracode fan-out.

**Savings without losing quality.** The safety floor is non-negotiable at any tier (per the
command's nature: net/baseline, sabotage probe, contract-diff, drift search, a DoD skeptic, a proven
gate), and verification is risk-proportional: a safe isolated finding is checked cheaply, a finding
at a contract with a full panel. The tier can be pinned manually: `--fast` / `--thorough`
/ `--tier=S|M|L` (or by an NL request). `refine` and `announce` scale the dialogue/fact-check depth
to size without a formal triage.

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
`/prorab:announce`; tech-quality — `/prorab-tech:audit`, `/prorab-tech:refactor`,
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
- `/prorab:refine` writes the refined idea to `tasks/ideas/IDEA-<slug>.md`.
- `/prorab:build` reads that IDEA file and writes the implementation plan to `tasks/IMPL-<slug>.md`
  (right there, in the working project).
- `/prorab-tech:audit` writes an audit report with a ranked backlog and a candidate spec to
  `tasks/audits/AUDIT-<slug>.md`; touches no code.
- `/prorab-tech:refactor` reads the AUDIT spec and writes a refactoring plan to
  `tasks/IMPL-refactor-<slug>.md` (the same `IMPL-*` contract that `announce` reads).
- `/prorab-tech:lint-audit` writes a static-quality plan (tooling inventory + a ladder of
  safe passes) to `tasks/audits/LINT-<slug>.md`; touches no code.
- `/prorab-tech:lint-fix` reads the LINT plan, runs one batch and writes `tasks/IMPL-lint-<slug>.md`
  (the same `IMPL-*` contract); marks the batch done in the LINT plan so the next call takes
  the next step.
- `/prorab:announce` reads IMPL/diff/IDEA and produces an announcement as text in the chat (on
  request — saves it to `tasks/ANNOUNCE-<slug>.md`); changes no project code/files. It announces
  the results of both tracks.
- It's worth keeping these files in the project repository under version control — they document what
  was decided and why.

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
│   │   │   └── announce.md
│   │   └── README.md
│   └── prorab-tech/               # tech-quality track
│       ├── .claude-plugin/
│       │   └── plugin.json        # plugin manifest + version
│       ├── commands/
│       │   ├── audit.md           # structural debt: audit
│       │   ├── refactor.md        # structural debt: fix
│       │   ├── lint-audit.md      # static debt: audit
│       │   └── lint-fix.md        # static debt: ratchet pass
│       └── README.md
├── README.md
└── CHANGELOG.md
```
