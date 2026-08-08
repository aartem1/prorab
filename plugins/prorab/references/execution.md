# Execution contract

For commands that run the project's own checks: capability routing, two of the three
context-occupancy limits (the third, `Delegated context returns`, is in `project-knowledge.md`) and
the deterministic steps.

## Capability routing

A tier bounds how *many* contexts a command opens and `Context hygiene` bounds how *full* each one
gets. This third axis bounds **how expensive** each one is. It is a routing rule, never an acceptance
rule: nothing below weakens a Definition of Done, a red-first requirement, an independent verifier or
a project check.

**Cheapest sufficient capability, then escalate the node that proves harder.**

| Role | Model | Effort | Escalate when |
|---|---|---|---|
| Enumerable fact — hashes, status, counts, test parsing | no model at all (see `Deterministic steps`) | — | only if the answer needs interpreting |
| Lookup, inventory, first-pass recon, extraction into `schema` | `haiku` | `low` | candidates stay ambiguous, or scope depends on a judgement |
| Command entrypoint, routine implementation, tests, fixes | `sonnet` | `high` | a defined signal below fires |
| Routine independent verifier | `sonnet` | `high` | evidence conflicts, or the verdict cannot be grounded |
| Judgement — panel, DoD skeptic, adversarial verification, contract reasoning | `opus` | `high` | exceptional cases only |
| Recovery from failed cheaper reasoning; security or business-critical ambiguity | `opus` | `xhigh` | `max` only on an explicit exceptional need |

**Where each control lives.** The entrypoint's own model/effort is set in the command's frontmatter,
and it holds **for that turn only** — the user's session model returns on their next message, which
is why the pin is per-command and not a setting anyone has to remember. A delegated context inherits
the main loop unless its call says otherwise, so **every** cheap and every strong node names its
model explicitly: `opts.model`/`opts.effort` on a `Workflow` agent, `model` on a direct `Agent`. A
direct `Agent` has **no** `effort` parameter — choose its model and let effort stand. Built-in
`Explore` inherits the main conversation too, so it is cheapened per call, not once.

**Escalation is per node, not per run.** Valid signals: two or more materially plausible readings
remain and the choice changes behavior or scope; a public/API/data contract or a high-blast-radius
boundary cannot be settled from current evidence; the work failed again after one grounded
correction and the cause is not mechanical; independent evidence or reviewers disagree on a material
correctness question; security, irreversible data change or business-critical behavior is in play;
the cheaper context reports it cannot reach a grounded conclusion inside its bounded turns. When one
fires: keep the evidence already collected, send **only the unresolved question** to the stronger
model, take back a compact capsule, and continue the rest of the run on the pinned default. Restarting
a whole command on the strong model because one node needed it is the failure mode this rule exists
to prevent. Log the escalation and its reason alongside `used/cap`.

**Degradation is graceful, never fatal.** A model or effort level that is unavailable, unsupported by
the chosen model, or overridden by the environment (`CLAUDE_CODE_SUBAGENT_MODEL` outranks both a
per-call `model` and a subagent's own frontmatter) **collapses to the nearest available setting and
the command continues**. Never fail, stall or ask the user because a preferred capability was not
granted; never climb to a more expensive family merely to reach a higher effort level. If a routing
preference was visibly not honoured, say so in the report — the run is still valid, and the quality
floor is what decides whether its result is.

**The routing is recorded, or it cannot be tuned.** Every `used/cap` line carries the model and
effort that context actually ran on, and the run's artifact carries the same as one `Routing` line —
the entrypoint's pinned pair, each delegated role with its model/effort, and any escalation with its
reason. A run that does not record what it spent on each context leaves nothing to raise or lower
later; this line is the whole feedback loop, so it is not optional.

## Context hygiene

Limits on what may enter a model context. They are budget rules, not tidiness: a context filled with
material nobody reads degrades the judgement of everything that follows it. They are
orthogonal to the orchestration tier — the tier bounds how *many* contexts a command opens,
these bound how *full* each one gets.

### Run output discipline

One command run — a test suite, an analyzer, a typechecker, a build, a migration — can emit more
text than the whole task it checks. **Raw run output never enters a model context.** Send it to a
file outside the working tree and bring back a digest:

```sh
<the project's exact command> >"${TMPDIR:-/tmp}/prorab-run.log" 2>&1; echo "exit=$?"
```

The log stays outside the repository: never add it to the project, never commit it.

A digest always states the exact command as invoked, its **exit code**, the run's own counters
(collected/passed/failed/skipped; violations per rule; the build result), and for each failure its
identifying line only — the test or rule name plus the assertion/error line. Keep it near 40 lines:
ten failures of one class become one example and a count. Dropped: progress output, passing test
names, repeated identical tracebacks, dependency resolution, warnings unrelated to the change, and
tables nobody asked for. When one failure needs detail, grep it by name out of the file on disk —
one bounded read, not the whole log.

**Compaction must never hide a result.** The exit code and the failure/violation counts are reported
in full; shortening *what* failed is allowed, concealing *that* something failed is a false report.
Judge a run by its exit code **and** its counters — never by an `OK`/`passed` string, and `passed`
with ~0 collected is a finding, not a pass.

### Main-loop discipline

The orchestrating context lives from intake to the final report and is the only one in the run that
cannot be replaced, so it is the one to keep small.

- **At the smallest tier** (2 contexts, no `Workflow`) the main loop *is* the executor: reading code,
  editing it and running the checks there is correct.
- **Above it** the main loop holds the task artifact, the plan and its order, the DoD or
  behavior-boundary table with per-item status, the returns received, and the `used/cap` ledger with
  the model/effort each context ran on. Bulk reading, scanning and full runs belong in delegated
  contexts that hand back capsules.
- **Two bounded exceptions**, because the source-of-truth order outranks tidiness: the main loop
  opens a **named, narrow range** of current source when a returned claim materially drives an
  external-contract or behavior decision, and it reads the **digest** of a run it ordered. A sweep is
  not a narrow range.
- Needing broad reading in the main loop above the smallest tier is a signal the work was
  under-delegated: delegate the read and take the capsule.

## Deterministic steps

An enumerable fact is established by a command, not by a model reading around for it. These are
cheap, exact and repeatable, and their answer is stronger than an impression:

- **Content identity and freshness** — `git hash-object -- <paths>`; the commit is
  `git rev-parse HEAD`.
- **The change set** — `git status --porcelain` (it includes untracked files); against a known base,
  `git diff --name-only <base>...HEAD`. A scope review's diff class comes from `git diff --stat` and
  then `git diff -- <path>` per file.
- **Documentation reach** — for every symbol, path, flag or literal value the change touched, grep
  for it instead of judging from memory, with history excluded:
  `grep -rIn --exclude-dir=.git --exclude-dir=archive -e '<symbol>' .` An empty result is the
  evidence that nothing was affected.
- **Run results** — the exit code and counters from the digest above.

Where the repository already defines its own command for one of these, that one wins.
