# prorab

**A set of Claude Code commands that take a task from a raw thought to verified, shipped code —
and keep the codebase healthy while you do it.**

Working with a coding agent usually breaks in two places. Either the idea goes in half-formed and
you get a confident implementation of the wrong thing, or the agent burns an enormous amount of
tokens re-reading the same files with no upper bound. Prorab addresses both: every command has a
mandatory quality floor (a stated Definition of Done, a test that failed for the right reason
first, independent verification) *and* a hard, counted budget it cannot exceed.

It ships as a Claude Code **marketplace with two plugins**. Commands install globally and update
from git; the artifacts they produce (refined ideas, audits, implementation plans) stay in the
project where you ran them, under version control.

| Plugin | Namespace | For |
|---|---|---|
| **`prorab`** | `/prorab:*` | The product track — a feature from idea to announcement. |
| **`prorab-tech`** | `/prorab-tech:*` | The tech-quality track — debt audits and safe refactoring. |

---

## Install

```
/plugin marketplace add aartem1/prorab
/plugin install prorab@prorab
/plugin install prorab-tech@prorab
```

Both plugins live in the same `prorab` marketplace but install separately — take one track or both.
To update later: `/plugin marketplace update prorab`.

<details>
<summary>Installing from a local clone (when developing the framework itself)</summary>

```
/plugin marketplace add /path/to/prorab
/plugin install prorab@prorab
/plugin install prorab-tech@prorab
```

</details>

## Your first task

```
/prorab:refine  add a CSV export to the reports page
```

It asks you skeptical questions, reads the relevant code, and surfaces the contradictions and gaps
you hadn't thought about. It writes **no code**. When the idea is spec-ready it saves
`tasks/ideas/IDEA-csv-export.md` — including a *Code map* of everything it already read.

```
/prorab:build
```

Picks up that IDEA and implements it turnkey: recon → plan → DAG-ordered implementation →
adversarial review → verification. No approval gate in the middle — the agents check each other.
Result: working code plus `tasks/IMPL-csv-export.md`.

```
/prorab:revise

The column order doesn't match the report, and an empty export still writes a header row.
```

You looked at the result and it isn't right yet. This applies the next batch of remarks to the task
you already built — same discipline, but it inherits that task's hashed `Code map` and the invariants
earlier rounds pinned, so it doesn't pay for recon twice. Run it as many times as the result needs;
there is nothing to open and nothing to close. Result: the corrected code plus one rolling
`tasks/revisions/REVISION-csv-export.md`.

```
/prorab:verify
```

Checks the shipped result the way its users meet it — from outside the code, by a context that never
reads the implementation, against expected values taken from the requirement. Then it makes sure a
project test actually fails when that behavior breaks. Result: a verdict per behavior with evidence,
plus `tasks/verify/VERIFY-csv-export.md`.

```
/prorab:announce
```

Turns the result into a short, factual message you can paste into a chat.

For a two-file change where all that ceremony costs more than the work itself, skip straight to
**`/prorab:quick`**.

## Which command do I need?

| I want to… | Use |
|---|---|
| Think an idea through before anyone writes code | `/prorab:refine` |
| Implement a refined idea, end to end | `/prorab:build` |
| Ship something too big for one run — many components, pages, or repositories | the same two commands: they switch to a segmented run |
| Make a small everyday change (1–2 files) | `/prorab:quick` |
| Apply the next round of remarks to something already built | `/prorab:revise` |
| Check that what shipped actually works for its users | `/prorab:verify` |
| Tell the team what shipped | `/prorab:announce` |
| Ask a question about this project or its history | `/prorab:ask` |
| Find the tech debt worth paying down first | `/prorab-tech:audit` |
| Pay it down without changing behavior | `/prorab-tech:refactor` |
| Get linters/types/formatters under control | `/prorab-tech:lint-audit` |
| Land one safe static-quality pass | `/prorab-tech:lint-fix` |

**Picking a lane.** `refine → build` is for anything that touches an external contract, spans
several files or layers, or has a requirement that can be read more than one way. `quick` is for the
daily two-file change. `revise` is for the round *after* something was built — and what puts work
there is continuity, not size: a one-line fix that belongs to an existing task is a `revise`, a
two-file change that continues nothing is a `quick`. You don't have to guess right: `quick`
re-checks its eligibility gate *after* reading the code and hands the task over rather than
finishing it on the wrong budget, `refine` points at `quick` when a settled idea turns out to be
tiny, and `revise` hands back anything that turns out to need its own product decision.

---

## The product track — `prorab`

```
raw idea ──/prorab:refine──▶ IDEA-<slug>.md ──/prorab:build──▶ code + IMPL ──/prorab:announce──▶ message
                             (carries a hashed Code map)          │
                                                                  ├──/prorab:verify──▶ VERIFY + tests
                                                                  │
                                                                  └──/prorab:revise──▶ code + REVISION
                                                                     ↑ once per round of remarks;
                                                                       no next remark = finished

small change ──/prorab:quick──▶ code + QUICK-<slug>.md   (escalates to refine+build if it isn't small)

large idea ──▶ the same two commands: the IDEA carries a Segment plan, and build runs the segments one
               at a time from a resumable ledger (tier XL)
```

`/prorab:verify` is optional and works on any scope — after `build`, after `quick`, or on a branch
nobody used the framework for.

| Command | What it does |
|---|---|
| **`/prorab:refine`** | Works a raw idea up to spec-readiness: skeptical questions, code study, surfacing contradictions and gaps. Writes no code. Result — `tasks/ideas/IDEA-<slug>.md` with a `Code map` handoff of what it read. An idea too big for one run also gets a `Segment plan`: the cut into independently checkable segments, each of which leaves the repository green. |
| **`/prorab:build`** | Turnkey implementation of a refined idea via a multi-agent Workflow: recon → plan → DAG-ordered implementation → adversarial review → verification. Reuses the IDEA's `Code map` when the recorded file hashes still match. Derives the verification recipe from repo guidance, CI, task runners and test conventions instead of assuming a stack. Records which of its tests were proven able to fail, so `verify` doesn't re-prove them. On a segmented idea it runs each segment in a fresh context and keeps the run's state in a ledger, so an interrupted run continues from the same command. Result — code + `tasks/IMPL-<slug>.md`. |
| **`/prorab:quick`** | The cheap lane: no IDEA/IMPL, no archive, no Workflow, at most 2 contexts. Keeps the floor — a DoD stated before editing, a red-for-the-right-reason test, the project's own checks, one independent verifier. Result — code + one compact `tasks/quick/QUICK-<slug>.md` record. |
| **`/prorab:revise`** | The continuation lane: the next batch of remarks on a result already implemented, applied as one complete iteration that leaves the repository green. Resolves which task the feedback is about, then reuses that task's hashed `Code map` instead of re-running recon — so the second round costs less than the first. Keeps the same floor as `quick`: an expected result stated before the edit and taken from the feedback rather than the code, red-first where the behavior admits a test, the project's own checks, one independent verifier that sees only this iteration's diff. Bounded at 2 contexts by default and 6 at most; a remark needing more, or its own product decision, is handed to `refine`. There is no start and no close — the absence of a next remark is the end. Result — code + one rolling `tasks/revisions/REVISION-<slug>.md` whose history is append-only. |
| **`/prorab:verify`** | Black-box check that the implemented functionality works **for its users**, plus proof that a test would catch it breaking. Resolves the scope by command (uncommitted / branch vs base / commit range / task artifact) and asks only when that is genuinely undetermined. The context that drives the system gets a charter of surfaces and expected results and **never** the implementation, the diff or a path; expected values come from the requirement, and a `works` resting on the system's own output is downgraded. Writes no product code — defects are routed with their reproduction, and the only code it writes is the missing tests, each proven by a mutation. Reuses the proof `build`/`quick`/`revise` already recorded instead of re-proving it. A web UI is driven **headless by default** — the prober authors one consumer session and judges a structured result instead of clicking through screenshots — with pixels reserved for the pointwise perceptual cases and an interactive visual session only on a named, logged trigger. Result — a graded verdict per behavior + `tasks/verify/VERIFY-<slug>.md`. |
| **`/prorab:announce`** | A concise, precise announcement of the results (what was done/new/changed, methods, how it's computed), dense enough to forward in a messenger. Reads IMPL/diff/IDEA and fact-checks. Writes no code, makes no commit. |
| **`/prorab:ask`** | Answers questions about the project or its history. Finds the area via project memory and task artifacts, then verifies material claims against current code, docs or Git history — and cites the sources. |

`refine` and `build` are deliberately **not** merged into one command; see the `prorab 0.10.0` entry
in the [CHANGELOG](CHANGELOG.md) for why the token saving people expect from merging is really
recon reuse, which needs no merge.

## The tech-quality track — `prorab-tech`

Two pairs, for two different natures of debt.

```
structural: ──/prorab-tech:audit──▶ AUDIT-<slug>.md (backlog + spec #1) ──/prorab-tech:refactor──▶ refactor + IMPL-refactor ──▶ /prorab:announce
static:     ──/prorab-tech:lint-audit──▶ LINT-<slug>.md (batch ladder)  ──/prorab-tech:lint-fix──▶ one pass + gate state + IMPL-lint (repeat) ──▶ /prorab:announce
```

| Command | What it does |
|---|---|
| **`/prorab-tech:audit`** | Multi-agent audit of **structure**: sweeps by smell class plus churn×complexity from git, clusters, ranks by `value × safety × size × confidence`, adversarially verifies the top. Produces the single best candidate for a safe refactoring, stamped with hashed provenance so `refactor` can tell a valid audit from one describing code that has moved on. Touches no code. Result — `tasks/audits/AUDIT-<slug>.md`. |
| **`/prorab-tech:refactor`** | Turnkey safe fix via a multi-agent Workflow. **Prime directive — behavior preservation:** characterization tests over the old code, small steps, adversarial drift search, a differential old-vs-new run, a measured quality improvement. Re-hashes the AUDIT's provenance before choosing a tier. `refactor <id>` takes a specific candidate; with no argument it auto-picks #1 from the latest audit. Result — code + `tasks/IMPL-refactor-<slug>.md`. |
| **`/prorab-tech:lint-audit`** | Audit of **statics**: inventories the tooling (present / broken / absent), runs the analyzers the project already has, read-only, and labels absent-tool estimates as manual. Clusters into an ordered ladder of safe passes: **A** autofix → **B** onboard tools → **C** first gate → **D** strictness ratchet. Records the exact invocations and the gate entrypoint for `lint-fix`. Touches no code. Result — `tasks/audits/LINT-<slug>.md`. |
| **`/prorab-tech:lint-fix`** | Runs **one** batch of that ladder turnkey. **Behavior preservation + a truthful gate lifecycle:** pre-C batches are preparatory and are not called locked; C creates and sabotage-proves the first gate; later batches tighten or expand it and prove the changed coverage. A latent bug found on the way is routed to the product track, not silently fixed. `lint-fix <id>` for a specific batch, no argument to auto-pick the next. Result — code + gate-state evidence + `tasks/IMPL-lint-<plan-slug>-batch-<id>.md`. |

**Why these are separate executors from `build`.** `build` proves that *new* behavior matches a
requirement. `refactor` and `lint-fix` prove that *old* behavior **did not change** — a different
verification discipline entirely. Their results are announced by the same `/prorab:announce`.

---

## How does Prorab compare?

Prorab sits between a hand-written Claude Code setup and a full product-development framework. Its
narrower bet is that an existing codebase needs two things at the same time: a repeatable path from
an unclear task to verified code, and a separate, behavior-preserving path for paying down debt.

The closest popular, actively maintained approaches are compared below. This is a comparison of
their **documented default workflows as of 2026-07-25**, not a benchmark of model output. All of
them are extensible, so “not in the default workflow” does not mean “impossible to add.”

| Approach | Best fit | What its default workflow emphasizes | Deliberate trade-off |
|---|---|---|---|
| **Prorab** | Existing codebases where verification and bounded agent fan-out matter | Separate feature and tech-quality tracks; red-first tests; independent review; versioned task history; hashed handoffs; a hard cumulative context budget | Claude Code only; the evidence trail creates more project files and ceremony than an ad-hoc prompt |
| **[Superpowers](https://github.com/obra/superpowers)** | Teams wanting a strong TDD methodology across several coding agents | Brainstorming → design approval → worktree → implementation plan → subagent development → two-stage review; skills activate automatically | Its published basic workflow does not define a cumulative context ceiling or dedicated structural-debt and static-quality ladders |
| **[GitHub Spec Kit](https://github.github.com/spec-kit/)** | Teams wanting portable, highly customizable spec-driven development | Spec → Plan → Tasks → Implement, with cross-artifact analysis, many agent integrations, presets and extensions | It is a broader toolkit: the exact verification discipline, debt workflow and spend limits depend on the selected workflow and extensions |
| **[BMAD Method](https://docs.bmad-method.org/)** | Product discovery and delivery that benefit from explicit analyst, PM, architect, UX and developer roles | Progressive context and artifacts across analysis, planning, solutioning and implementation; specialized agents and optional modules | Broader lifecycle coverage brings more concepts and ceremony; counted context budgets and Prorab-style debt/static ladders are not part of the documented default |
| **[Native Claude Code customization](https://code.claude.com/docs/en/plugins)** | A small or highly project-specific workflow | Composable skills, agents, hooks and commands, packaged locally or as plugins | It supplies the primitives, not a delivery contract: the team must design its own gates, artifacts, budget and failure handling |

### Capability matrix

**Built in** means the default documented workflow makes the capability explicit. **Configurable**
means the approach provides a mechanism or extension point, but does not make one policy universal.

| Capability | Prorab | Superpowers | Spec Kit | BMAD | Native Claude Code |
|---|---|---|---|---|---|
| Refine an unclear feature before coding | Built in | Built in | Built in | Built in | Configurable |
| Red-first TDD in the implementation path | Required | Required | Configurable | Configurable | Configurable |
| Independent implementation review | Required | Built in | Configurable | Built in | Configurable |
| Persistent, linked task artifacts | Built in | Design + plan | Built in | Built in | Configurable |
| Dedicated structural-debt workflow | Built in | Not in the basic workflow | Extension/custom workflow | Not in the default method | Configurable |
| Dedicated lint/type/gate ratchet | Built in | Not in the basic workflow | Extension/custom workflow | Custom/module-dependent | Configurable |
| Hard cumulative agent-context limit | Built in: 2/6/12, ceiling 16 | Not documented | Not documented | Not documented | Configurable |
| Coding-agent portability | Claude Code | Multiple agents | Multiple agents | Multiple agents | Claude Code |

### Choosing without ideology

- Choose **Prorab** when auditability, behavior-preserving maintenance and a hard context boundary are
  more important than agent portability.
- Choose **Superpowers** when you want a prescriptive TDD/subagent methodology that follows you
  across coding tools.
- Choose **Spec Kit** when specifications are the primary organizing artifact and you want a large
  integration and extension surface.
- Choose **BMAD** when the work starts before engineering — market/domain analysis, PRDs,
  architecture and UX — and role separation is useful.
- Use **native Claude Code customization** when the workflow is small or unusual enough that owning
  the policy is cheaper than adopting a framework.

Sources: [Superpowers basic workflow](https://github.com/obra/superpowers#the-basic-workflow),
[Spec Kit agentic SDD reference](https://github.github.com/spec-kit/reference/agentic-sdd.html),
[BMAD workflow map](https://docs.bmad-method.org/reference/workflow-map/) and
[BMAD agent catalog](https://docs.bmad-method.org/reference/agents/).

---

## What lands in your project

Commands are global; everything they write is local to the working project and worth committing —
these files document what was decided and why.

```text
tasks/
├── ideas/IDEA-<slug>.md                     # refine
├── IMPL-<slug>.md                           # build
├── segments/<slug>/SEG-<nn>-<name>.md       # build, at XL only
├── quick/QUICK-<slug>.md                    # quick
├── revisions/REVISION-<slug>.md             # revise, one per task, rolling
├── verify/VERIFY-<slug>.md                  # verify
├── audits/AUDIT-<slug>.md                   # audit
├── audits/LINT-<slug>.md                    # lint-audit
├── IMPL-refactor-<slug>.md                  # refactor
├── IMPL-lint-<plan-slug>-batch-<id>.md      # lint-fix
├── memory/                                  # small, verified project memory
└── archive/<YYYY>/<task-slug>/              # completed, verified bundles
```

`/prorab:quick` leaves one short record and nothing else — no IDEA, no IMPL, no archive entry. It
exists so the written history of the project doesn't skip small changes; if it can't be stated in
about a screen, the change wasn't small. `/prorab:announce` produces its text in chat, and saves
`ANNOUNCE-<slug>.md` into the archive directory only when the task is already archived.
`/prorab:ask` changes no project code; at most it corrects or stales a disproved memory entry.
`/prorab:verify` leaves one record and the tests it wrote, and archives nothing. `/prorab:revise`
writes one file per task no matter how many rounds it runs, and archives nothing either — when the
task's bundle is already archived it links to it and leaves it untouched.

<details>
<summary><b>Full artifact contract</b> — who reads and writes what, and when things get archived</summary>

- `/prorab:refine` writes `tasks/ideas/IDEA-<slug>.md`, including the `Code map` handoff (files
  studied with content hashes, reuse/change points, conflicts, conventions, gaps).
- `/prorab:build` reads an active IDEA, reuses its `Code map` where hashes still match, writes
  `tasks/IMPL-<slug>.md`, and after verified completion moves the linked bundle into
  `tasks/archive/<YYYY>/<task-slug>/`. At XL that IMPL is also the run's **segment ledger** — the
  segment table with per-segment status, the interfaces each segment froze for the next ones, the
  integration checkpoints — and each segment's own detail goes to `tasks/segments/<slug>/SEG-<nn>-*.md`,
  written by the context that implemented it. The ledger is what makes the run resumable: re-invoking
  the command continues from the first unfinished segment. The bundle archives only when every segment
  is `done`; one blocked or pending segment keeps the whole thing active.
- `/prorab:quick` writes one compact `tasks/quick/QUICK-<slug>.md`: what changed and why, the DoD
  table, the exact checks and their results, the documentation it corrected, and the verifier's
  verdict. On a slug collision it uses the same deterministic `-2`, `-3` suffix and never overwrites.
  It creates no IDEA/IMPL, archives nothing, and adds at most one memory entry. A run that escalates
  after already editing files still leaves the record, marked `escalated`; one that escalates before
  touching anything leaves nothing.
- `/prorab:revise` writes exactly one `tasks/revisions/REVISION-<slug>.md` per task and updates that
  same file on every round: a `Code map` in the same format the IDEA carries (files with content
  hashes, change points, conflicts, conventions, gaps, and the verification commands it *confirmed*
  by running them), the `Invariants` later rounds may not break, an **append-only** `History` of one
  line per iteration — remark → what changed → check digest → the red-first test hash → the
  verifier's verdict — and `Open`, which is empty when nothing is unclosed. There is no `status`
  field: a partial or escalated iteration says so in its own history line. It reads an IDEA/IMPL only
  on a real trigger, edits no archived artifact, creates no IDEA/IMPL, and archives nothing.
- `/prorab:verify` writes one compact `tasks/verify/VERIFY-<slug>.md`: the scope it adopted, a verdict
  and evidence grade per user-visible behavior, the defects with their reproductions and where each was
  routed, the coverage table with how each test was proven able to fail, the check digests, and what
  stayed unverified. Same deterministic `-2`, `-3` suffix on a collision, never an overwrite. When the
  scope's bundle is already archived it writes the record into that archive directory instead, the way
  `announce` does. It archives nothing and creates no IDEA/IMPL.
- `/prorab-tech:audit` writes a ranked backlog plus a candidate spec to `tasks/audits/AUDIT-<slug>.md`;
  touches no code.
- `/prorab-tech:refactor` reads that spec and writes `tasks/IMPL-refactor-<slug>.md`. A completed
  candidate is archived; a multi-candidate AUDIT stays active until its backlog is exhausted, with a
  scoped candidate snapshot in the archive.
- `/prorab-tech:lint-audit` writes the tooling inventory and pass ladder to `tasks/audits/LINT-<slug>.md`;
  touches no code. Violation counts in it are explicitly a snapshot, not a handoff.
- `/prorab-tech:lint-fix` reads the active LINT plan, runs one batch, writes a linked
  `tasks/IMPL-lint-<plan-slug>-batch-<id>.md` and marks only that batch done. The LINT and its batch
  artifacts move to the archive together, once the full ladder is completed or explicitly closed.
- `/prorab:announce` reads active or archived IMPL/diff/IDEA.
- Legacy active `IDEA-*`, `IMPL-*`, `AUDIT-*`, `LINT-*` and `IMPL-lint-*` names remain understood.
  Archived work is never picked up as active by default.

**Archive safety.** Before moving anything, a command verifies explicit artifact identity and links,
refuses paths outside `tasks/`, never overwrites an existing directory (deterministic `-2`, `-3`
suffixes), updates links, re-opens destinations and reports every moved file. A blocker, partial
completion or failed mandatory verification leaves artifacts active. **No command commits or pushes
unless you explicitly ask.**

```text
tasks/archive/
└── YYYY/
    ├── <task-slug>/
    ├── refactor-<task-slug>/
    └── lint-<plan-slug>/
```

</details>

## Documentation doesn't drift away from the code

Every command that changes code owns the documentation that change falsifies. A stale document left
behind counts as an incomplete change, not a follow-up — it is part of the command's completion
condition and the reviewers treat a contradiction between the diff and a current-state document as
a finding.

The line that keeps this from turning into an endless documentation project runs between two kinds
of file:

| | Examples | What a command does |
|---|---|---|
| **Current state** — claims to describe how the project works *now* | `README`, `docs/`, the spec, API and configuration references, runbooks, `CLAUDE.md` and other agent guidance, docstrings and comments, `--help` text | Corrects exactly what the change made factually wrong — a renamed symbol or path, a changed default, flag, signature, limit, format or command, an example that would now behave differently. In place, minimally, in the document's own language. |
| **Historical** — records what *happened* | `CHANGELOG.md`, release notes, ADRs, migration notes, `tasks/archive/**`, completed task artifacts | Never rewritten to match new code. A new entry is added where the project's convention calls for one; a past entry stays as it was written. |

Anything wider — a style rewrite, a documentation gap that predates the change, a restructure, or a
correction that needs a product decision — is reported with the follow-up named, not absorbed into
the diff. And "nothing was affected" has to be earned by actually searching the docs for the
symbols, paths and values the change touched.

`/prorab:verify` sits deliberately outside this duty. It changes no behavior, so it falsifies no
document — and when observed behavior contradicts a document, either one of them can be the wrong one.
That is a finding it reports with both readings named, not a document it rewrites.

## Cost is bounded, quality is not negotiable

The heavy commands (`build`, `verify`, `audit`, `refactor`, `lint-audit`, `lint-fix`) run a **budget
triage** step before fanning out any agents: they estimate complexity from cheap signals — size, blast
radius, novelty, reversibility, uncertainty — and pick a tier.

| Tier | Total contexts | Notes |
|---|---|---|
| **S** | 2 | No Workflow at all. |
| **M** | 6 | |
| **L** | 12 | Expandable to an absolute ceiling of 16, only for confirmed critical risk or explicit `--thorough`. |
| **XL** | 3 *per segment* | `build` only, and only for a task with seams: the run becomes a chain of small runs. No run-wide ceiling — see below. |

The count is cumulative for the whole command and includes the main context plus every delegated or
Workflow context, retries included. You can pin the choice with `--fast`, `--thorough`,
`--tier=S|M|L|XL` or `--verification=economy|balanced|thorough`; the 16-context ceiling stays absolute
for the single-run tiers.

**XL is the exception, because a very large task does not run out of agents — it runs out of main
loop.** One orchestrating context has to survive from intake to the final report, and across a
multi-hour task compaction takes the plan with it, a thirty-item DoD table stops fitting beside the
work, and a forty-file diff reviews worse than ten four-file diffs. A higher ceiling buys more of
exactly what degrades. So XL changes the topology instead: `refine` cuts the idea at its seams into
segments, each sized to an ordinary S or M build, and `build` runs them one at a time — **one fresh
context per segment**, at most three contexts each, with a thin orchestrator that holds only the
ledger. The state of the run lives in that ledger on disk, so an interrupted run resumes from the same
command instead of starting over, and a segment that fails blocks its dependents rather than the
afternoon. A task that cannot be cut without splitting a coherent edit is not XL — it is an idea that
needs one more refinement round, and the seam rules say so out loud rather than sharding it anyway.

**A tier bounds how many contexts open, not how full each one gets** — those are two different
things, and a context stuffed with material nobody reads judges worse than one given the range that
matters. So a second, orthogonal limit applies at every tier: raw output from a test suite or an
analyzer never enters a context (it goes to a file outside the working tree and comes back as a
~40-line digest — command, exit code, counters, one line per failure), a delegated context returns a
capsule of claims and `path:line` pointers rather than the material itself, and above the smallest
tier the orchestrator holds the plan, the DoD table and the ledger while the reading happens in
delegated contexts. At tier S the main loop *is* the executor and reads and runs directly — that is
the intended shape of the cheap lane, not an exception to the rule.

Compaction never buys silence: the exit code and the failure counts are always reported in full.
Shortening *what* failed is allowed; concealing *that* something failed is a false report.

The same principle applies to the commands' own text. The shared rules live in five contracts, and a
command loads only the ones it can act on: `project-knowledge.md` (language, source-of-truth order,
memory, delegated-return capsules, archive) is read by all eleven; `execution.md` (capability routing,
run output and main-loop discipline, deterministic steps) only by the eight that run checks or
analyzers;
`documentation-sync.md` only by the five that change product code; `web-probing.md` (the headless
instrument ladder, the locator rule, the runner) only by `build`, `quick`, `revise` and `verify`, and only when
the scope in front of them actually has a browser surface; and `segmented-run.md` (seam discipline, the
ledger, the segment brief and capsule, resume) only by `refine` and `build`, and only when the task in
front of them is XL. `ask`, `announce` and `refine` load neither of the middle two, which is where the
biggest part of their prompt used to go, and `verify` skips documentation sync — it writes tests, never
behavior.

What the budget never buys back: the safety floor is non-negotiable at every tier — the
characterization net or baseline, the contract diff, the drift search, a DoD skeptic, and a
sabotage-proven gate whenever one is created or changed.

<details>
<summary><b>How the budget is enforced, and how verification escalates</b></summary>

**Enforcement.** Every delegated context carries a mandatory turn limit (`max_turns` for direct
agents, `maxTurns` in workflow configuration — 6/8/12 for S/M/L; at XL a segment executor gets 20,
because it has to go red-first → implement → run → fix, and its verifier 8), and review→fix cycles are
capped at 1/2/3, or at XL one per segment plus one per integration checkpoint. A completed round that
produces no new confirmed, non-duplicate finding stops fan-out immediately. Judge panels are used only when there are at least two genuinely different designs, and
they consume the same cap. Generated Workflow scripts enforce their remaining allowance with a
counter and a `boundedAgent()` wrapper; unbounded `agent()`/`pipeline()` fan-out is forbidden.

**Occupancy limits** (the second axis; `Delegated context returns` sits in the shared
`project-knowledge.md` because every command needs it, the other two in `execution.md`). *Run output:*
captured to a file outside the working tree, read back as a digest of ~40 lines — the command, its
exit code, its own counters, and one identifying line per failure; ten failures of one class become
one example plus a count, and a specific failure is grepped out of the file on disk when it needs
detail. A run is judged by exit code **and** counters, never by an `OK` string. *Returns:* a
delegated context hands back one `schema` capsule of roughly 1500 tokens — claims plus `path:line`,
symbol or command pointers, never file contents, a full diff or raw output; an oversized return is
not forwarded verbatim into the next prompt. *Main loop:* above tier S it holds the artifact, the
plan, the status table, the capsules and the `used/cap` ledger, with two bounded exceptions that the
source-of-truth order requires — a named narrow range of current source when a capsule claim drives
an external-contract or behavior decision, and the digest of a run it ordered. *Deterministic
steps:* enumerable facts come from a command, not a reading — `git hash-object` for content identity,
`git status --porcelain` / `git diff --name-only` for the change set, `git diff --stat` for the diff
class, and a `grep` per touched symbol for documentation reach, where an empty result *is* the
evidence that nothing was affected.

**Per-command caps.** `refine` gets at most two Explore contexts; `announce` one delegated context
plus a fact-check pass; `ask` one delegated context; `quick` is fixed at two contexts with no
Workflow; `revise` starts from those same two and stops at six, with no L, XL or segmented run in its
ladder at all — the ceiling is what keeps the continuation lane from slowly turning back into `build`.
`verify` uses the same 2/6/12 tiers, but spends them differently: the blind probing context
is delegated at *every* tier, S included, because a context that has read the diff cannot un-read it —
so at S the main loop does the code-aware half (scope, surfaces, coverage) and the one delegated
context does all the probing, and probers fan out on instrument boundaries (browser / API / data)
rather than per behavior. `audit` groups its catalog into three directions (structure; reliability/security;
performance/maintainability) and verifies candidate #1 by default — runners-up only on a near tie or
if #1 fails. `refactor`/`lint-fix` inherit the tier from the upstream AUDIT/LINT artifact rather than
re-deriving it, except that any staleness in `refactor`'s hashed provenance forces a re-derive.

**Cheap-first evidence hierarchy.** Executable tests and differential runs → static/type/contract
evidence → one independent reviewer → a second only on conflict or high blast radius → a
three-reviewer panel only for confirmed contract, security or business-critical risk.

**Mutation intensity** is controlled separately from the context tier, and at XL its budget applies to
critical clusters across the whole run rather than per segment:

- **`economy`** — no mutation, for low-risk contract-untouched work with strong executable evidence;
- **`balanced`** — the default; at most one mutation per critical invariant or risk cluster;
- **`thorough`** — explicit or critical-risk mode; mutation of each substantial DoD/behavior boundary.

Gate creation or expansion always gets one representative violation, because gate coverage is itself
a critical invariant. Verification mutations run only in temporary isolated worktrees — never in your
working tree.

</details>

<details>
<summary><b>Recon is never paid for twice</b> — the hashed handoff between commands</summary>

`refine` records a `Code map` in the IDEA: the files it opened, each with a `git hash-object`
content hash, plus reuse points, change points, contracts at risk, conventions to mirror, and its
honest list of "not studied" gaps. `build` re-hashes those paths — all fresh means recon costs zero
contexts; partly fresh means recon is scoped to the stale entries and the declared gaps; no map or
no hashes means normal recon. Saved contexts are banked, not respent.

A matching hash proves only that a file is unchanged, so a map claim that drives an external-contract
edit is still verified against current source, and the map's observed verification commands remain a
hint that Phase 0 must confirm.

The tech track applies the same idea in two different shapes, because the two pairs waste different
things. `audit` stamps its #1 candidate with the commit plus hashes of the target files, the tests
its net status rests on, and the call-site files; `refactor` re-hashes them **before choosing a
tier**, since it otherwise inherits `safety`/`coverage_nearby`/`blast_radius` from an audit that may
describe code which no longer exists. A stale target makes the candidate obsolete until the smell is
re-confirmed, a stale test voids the coverage claim, a stale call-site voids the blast radius.

The product track applies it a third time, to test evidence rather than reading. `build`, `quick` and
`revise` already prove that the tests they write can fail — a right-reason red before the code existed,
or a sabotage mutation — so each records that proof beside the item it closes (`red-first` | `mutation`
| `none`, plus the test file's hash): in the DoD table for the first two, in the history line for
`revise`. `/prorab:verify` re-hashes those entries and marks the fresh ones
`covered (reused)`, spending its budget on what nobody checked yet: the behaviors driven from outside,
and the ones no DoD ever stated. Same two bounds as the `Code map` — a matching hash proves the file is
unchanged, not that the test asserts the behavior in question, and a reused proof never upgrades a
behavior's own verdict. An identical full-suite run on an identical tree is cited from the upstream
digest rather than paid for twice.

For the static pair a hashed map would be the wrong instrument — violation counts go stale the moment
a batch lands, and re-running an analyzer is deterministic and nearly free. So `lint-audit` hands over
the **exact invocations and the gate entrypoint** instead, and `lint-fix` reads the current gate state
from the last completed batch artifact rather than rediscovering it.

</details>

## Which model runs what

The tiers above bound how many contexts a command opens, and the occupancy limits bound how full each
one gets. There is a third axis: **how expensive each context is.**

Before this existed, the answer was "whatever session you happened to be in". Invoking `/prorab:build`
from an Opus session at `xhigh` made all of its up-to-16 contexts Opus at `xhigh` — including the ones
that were only extracting a file list into a schema.

**Recommended session mode: Opus, Ultracode off.** `xhigh` is fine and costs Prorab nothing. You don't
have to switch models before running a command, and you shouldn't have to remember to switch back.

**What the framework pins for you.** Ten of the eleven commands set their own `model`/`effort` in
frontmatter: `build`, `quick`, `revise`, `verify`, `ask`, `audit`, `refactor`, `lint-audit` and
`lint-fix` at **Sonnet / high**, `announce` at **Sonnet / medium**. The pin holds for that turn only —
your session model is back on your next message, which is exactly why it can be automatic. Inside a
run, the cheap and the strong side are both named explicitly, never inherited: map extraction,
inventory, diff classification and analyzer runs go to **Haiku**, while the judgment stages — the
judge panel, the DoD skeptic, adversarial verification of a finding, drift search, designing a
sabotage mutation — go to **Opus**.

**What still runs on your session model: `refine`.** That is deliberate. `refine` is a many-round
dialogue, and a frontmatter override lasts one turn — so pinning it would make the conversation
alternate between two models round after round, and because a prompt cache is scoped to one model,
each alternation rewrites the whole prefix cold. It would cost more than it saves. Refinement is also
where the product decisions get made, which is the right place for a strong model. Its delegated
recon is still cheapened per call.

**Escalation names a node, not a run.** When a cheap context reports it can't reach a grounded
conclusion, or two readings of a requirement remain and the choice changes scope, or reviewers
disagree on a material correctness question — the evidence already collected is kept, only the
unresolved question goes to the stronger model, and the rest of the run continues where it was.
Restarting the whole command on Opus because one node needed Opus is the failure mode the rule exists
to prevent. What was spent on each context is written into the run's artifact, so "this role keeps
escalating" can become a fact rather than an impression.

**Nothing here is an acceptance criterion.** The Definition of Done, right-reason red, the
independent verifier, the contract checks and the project's own commands do not get weaker because a
context got cheaper. And a model or effort level that isn't available collapses to the nearest one
that is — the command continues rather than failing.

**Two honest notes.** First, the biggest saving is *not walking into an expensive session*, not the
per-token multiplier: Opus→Sonnet is about 1.67× at list price and Sonnet→Haiku about 3×, so if you
already work on Sonnet, this changes almost nothing for you. Second, Ultracode is off in the
recommendation because Prorab already owns orchestration, budgets and review cycles, and stacking a
second automatic orchestrator on top makes spend unpredictable — **and because it is not documented
whether a command's frontmatter `effort` also switches off Ultracode's auto-orchestration for that
turn.** That is an open unknown, stated here as one rather than assumed away.

## Project memory

Prorab builds a small, version-controlled memory during normal work. There is no `init`, no
`remember` command, no background process, no external model, no vector database — the structure is
created lazily under `tasks/memory/` (`INDEX.md`, `components/`, `decisions/`, `gotchas/`,
`verification/`).

Memory is deliberately **last** in the source-of-truth order:

> current worktree → repository instructions/docs → tests/CI/executable evidence → task artifacts → memory

A material memory claim must be checked against current source before it can affect behavior,
architecture, contracts, Scope, DoD, implementation or verification. A conflict marks the entry
updated, `superseded` or `stale` — it never overrides the code. Missing memory never breaks a command.

Capture is automatic but selective: durable decisions, boundaries, contracts and consumers, recurring
gotchas, rejected alternatives, re-verified commands. Not stored: transcripts, reasoning, temporary
status, ordinary code facts, unmarked assumptions, or copies of task artifacts.

## Language

Command bodies and all internal work run in **English** — reasoning, inter-agent prompts, `schema`
outputs. It is denser in tokens and steadier in quality.

**Everything a human reads is in the task's language**, detected from how you phrased the request
(Russian by default): the chat, the `refine` dialogue, the `announce` text, and the
`IDEA`/`IMPL`/`AUDIT`/`LINT` artifacts, which stay project documents in that language. Code, names,
comments and commit messages are always English. User-visible domain and UI terms are carried as-is,
never round-tripped through a double translation.

---

## Developing the framework

<details>
<summary>Repository layout</summary>

```
prorab/
├── .claude-plugin/
│   └── marketplace.json           # marketplace manifest (both plugins)
├── plugins/
│   ├── prorab/                    # product track
│   │   ├── .claude-plugin/plugin.json
│   │   ├── commands/              # refine.md build.md quick.md revise.md verify.md announce.md ask.md
│   │   ├── references/            # project-knowledge.md execution.md documentation-sync.md web-probing.md
│   │   └── README.md
│   └── prorab-tech/               # tech-quality track
│       ├── .claude-plugin/plugin.json
│       ├── commands/              # audit.md refactor.md lint-audit.md lint-fix.md
│       ├── references/            # project-knowledge.md execution.md documentation-sync.md
│       └── README.md
├── site/                          # the documentation site (Astro, static output)
│   ├── src/views/                 # one page body per page, shared by every language
│   ├── src/i18n/{en,ru}/          # the text, one dictionary per language
│   ├── src/components/ layouts/ scripts/ styles/
│   ├── package.json astro.config.mjs
│   └── README.md                  # how to run it locally and deploy it
├── vercel.json                    # builds site/ and deploys site/dist
├── tests/test_contracts.py        # manifests/frontmatter + lifecycle scenario checks
├── README.md
└── CHANGELOG.md
```

`site/` and `vercel.json` are inert as far as Claude Code is concerned: the marketplace reads
`.claude-plugin/marketplace.json` and the `plugins/*` sources and ignores everything else, so the
site cannot affect `/plugin install`. Its Node toolchain stays inside `site/` and its
`node_modules/` and `dist/` are never committed.

</details>

**The documentation site.** [`site/`](site/README.md) is a four-page static site in **English and
Russian**, built with Astro and deployed from the repository root via
[`vercel.json`](vercel.json). Page structure is written once and both languages render from it;
the text lives in one type-checked dictionary per language, so a missing translation is a build
error rather than a blank on a page nobody opened. It restates what this README and the command
bodies say, so it is a **current-state document**: when a command, flag, tier, artifact path or
version changes, the site changes in the same pass. `SiteTests` in `tests/test_contracts.py`
enforces the mechanical part (every command documented in every language, every language routing
to every page, versions read from the manifest rather than copied, nothing personal crossing over
from it).

**Adding a command**

1. Drop `plugins/<plugin>/commands/<name>.md` (frontmatter `description` / `argument-hint`, then the
   prompt body) into the right plugin — `prorab` for product, `prorab-tech` for tech quality.
2. Bump `version` in **two** places: that plugin's `.claude-plugin/plugin.json` and its entry in the
   root `.claude-plugin/marketplace.json`. The two plugins are versioned independently.
3. Add a [CHANGELOG.md](CHANGELOG.md) entry.
4. `/plugin marketplace update prorab` — the command is now available as `/<plugin>:<name>`.

The same version-bump rule applies to any change to an existing command.

**More detail:** [`plugins/prorab/README.md`](plugins/prorab/README.md) ·
[`plugins/prorab-tech/README.md`](plugins/prorab-tech/README.md) · [`CHANGELOG.md`](CHANGELOG.md)
