# Execution contract

For commands that run the project's own checks: two of the three context-occupancy limits (the
third, `Delegated context returns`, is in `project-knowledge.md`) plus the deterministic steps.

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
  behavior-boundary table with per-item status, the returns received, and the `used/cap` ledger. Bulk
  reading, scanning and full runs belong in delegated contexts that hand back capsules.
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
