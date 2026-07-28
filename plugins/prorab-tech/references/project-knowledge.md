# Project knowledge contract

This contract is shared by the tech-quality commands. Apply it without increasing the command's
orchestration tier or fan-out: recall, capture, and archival are main-context filesystem work.

## Source-of-truth and memory

Trust, in order: current worktree; current repository instructions/docs; tests, CI, and executable
evidence; active/archived task artifacts; project memory. Memory accelerates discovery and is never
standalone proof of current behavior, boundaries, contracts, findings, or gate state.

Create memory lazily:

```text
tasks/memory/
  INDEX.md
  components/
  decisions/
  gotchas/
  verification/
```

Every small thematic entry uses:

```yaml
---
type: decision | component | gotcha | verification | contract | pattern
status: active | superseded | stale
created_at: YYYY-MM-DD
last_verified_at: YYYY-MM-DD
sources:
  - artifact: tasks/...
  - commit: <sha>
  - paths:
      - path/to/source
---
```

Omit unavailable commits. Add `Confirmed facts`, `Inference or recommendation`, `Evidence`, and
`Invalidated when` sections. Put component/contract/pattern entries in `components/`, decisions in
`decisions/`, gotchas in `gotchas/`, and executable/gate knowledge in `verification/`.

### Recall

Derive exact paths, symbols, component/tool names, rule IDs, contract names, and domain terms.
Search the compact index, filenames, and entries by exact match before broader terms. Read only
relevant entries and pass at most an eight-bullet digest to the main flow. Open current source for
every material memory claim affecting candidate selection, behavior boundaries, contract risk,
scope, implementation, or verification. Re-probe executable/tool availability and gate state;
memory cannot prove that a command still exists or passes. Missing memory is non-fatal.

Current evidence wins on conflict. Update the entry, preserve it as `superseded` when the historical
decision matters, or mark it `stale`; if verification is impossible, state uncertainty. Refresh
`last_verified_at` only after checking cited current source.

Active lookup excludes `tasks/archive/**` by default. Search archive only for an explicitly named
archived item or a historical question.

### Capture

After the command's own successful outcome, automatically capture only durable cross-task
knowledge: verified component boundaries/contracts, recurring gotchas, structural decisions, and
real verification/tool/gate commands and limitations. Search for duplicates first and update the
same subject rather than appending. Usually zero to three entries are enough. Keep `INDEX.md` to one
line per entry: link, type, status, topic, and key paths/symbols.

Do not capture the audit backlog, transcripts, reasoning, temporary status, ordinary facts cheaper
to read from code, one-off failures, unmarked assumptions, or copies of AUDIT/LINT/IMPL content.

## Documentation sync

A command that changes code owns the documentation that change falsifies. A stale document left
behind is an incomplete change, not a follow-up, and it is part of the command's own completion
condition. Behavior preservation does not exempt a command from this: a rename, a moved module, a
changed entrypoint, a new gate or a tightened rule set can all leave a current-state document wrong
while behavior is untouched.

**Current-state documents are corrected. Historical documents are never rewritten.**

- *Current state* — anything claiming to describe how the project works now: `README`, `docs/`, the
  project spec, API/configuration references, runbooks, contributor and tooling guides, `CLAUDE.md`
  and other agent guidance, docstrings, comments, `--help`/usage text, and their examples.
- *Historical* — anything recording what happened: `CHANGELOG.md`, release notes, ADRs and other
  dated decision records, migration notes, `tasks/archive/**`, completed task artifacts, and any
  section explicitly written as a record of a past state. Add a new entry where the project's
  convention calls for one; never edit a past entry so it matches new code.

Scope is what the change makes **factually wrong**: a renamed symbol or path, a moved module, a
changed default, flag, signature, limit, format, command or entrypoint, an example that would now
behave differently, a step that no longer exists. For a gate change, the documented way to run the
checks locally and in CI, and the documented strictness bar, are current-state documentation and
must match the gate that now exists. Fix in place, minimally, in the document's existing language
and style.

Out of scope, and reported instead of edited: style rewrites, pre-existing documentation gaps,
restructuring, and corrections needing a product decision. A correction larger than the code change
itself is reported with the follow-up command named, not absorbed into the diff.

Do not conclude nothing is affected without searching the documentation for the symbols, paths,
rule IDs, flags and literal values the change touched. Report the documents corrected and the stale
places deliberately left alongside the code changes.

## Context hygiene

Three limits on what may enter a model context. They are budget rules, not tidiness: a context
filled with material nobody reads degrades the judgement of everything that follows it. They are
orthogonal to the orchestration tier — the tier bounds how *many* contexts a command opens, these
bound how *full* each one gets. On this track the dominant bulk is **analyzer and test output**, so
the first limit is the one that pays most.

### Run output discipline

One command run — a linter, a typechecker, a test suite, a build, a coverage or dead-code pass — can
emit more text than the whole batch it checks. **Raw run output never enters a model context.** Send
it to a file outside the working tree and bring back a digest:

```sh
<the project's exact command> >"${TMPDIR:-/tmp}/prorab-run.log" 2>&1; echo "exit=$?"
```

The log stays outside the repository: never add it to the project, never commit it.

A digest always states the exact command as invoked, its **exit code**, the run's own counters
(violations per rule/code and their file spread; collected/passed/failed/skipped; the build result),
and for each failure or violation class its identifying line only — the rule or test name plus the
message. Keep it near 40 lines: two hundred violations of one rule become the rule, the count, the
file spread and one example, never two hundred lines. Dropped: progress output, passing test names,
repeated identical tracebacks, dependency resolution, and warnings unrelated to the batch. When one
violation needs detail, grep it by name out of the file on disk — one bounded read, not the whole log.

**Compaction must never hide a result.** The exit code and the failure/violation counts are reported
in full; shortening *what* failed is allowed, concealing *that* something failed is a false report.
Judge a run by its exit code **and** its counters — never by an `OK`/`passed` string, and `passed`
with ~0 collected is a finding, not a pass. A before→after count claim (N→0) is taken from two
digests of the same invocation, not from an impression of the output.

### Delegated context returns

A delegated context returns one compact structured result through `schema`: claims plus pointers to
evidence, never the evidence itself. Keep a return near 1500 tokens.

It carries the finding, candidate or map entry and where to verify it — `path:line`, a symbol, a rule
ID, an artifact section, or a command with its exit code. It does **not** carry file contents beyond a
minimum quoted line, a full diff, raw analyzer output, a directory listing, the agent's reasoning, or
a restatement of its own prompt. When material genuinely has to be seen, the return names it and the
orchestrator opens that one range, so the reading happens once where it is needed instead of being
copied through a context that only passes it along. An oversized return is never forwarded verbatim
into another prompt: extract the claim, drop the bulk.

### Main-loop discipline

The orchestrating context lives from intake to the final report and is the only one in the run that
cannot be replaced, so it is the one to keep small.

- **At the smallest tier** (2 contexts, no `Workflow`) the main loop *is* the executor: reading code,
  editing it and running the checks there is correct.
- **Above it** the main loop holds the task artifact, the plan and its order, the behavior-boundary or
  gate-state table with per-item status, the returns received, and the `used/cap` ledger. Bulk
  reading, scanning and full runs belong in delegated contexts that hand back capsules.
- **Two bounded exceptions**, because the source-of-truth order outranks tidiness: the main loop
  opens a **named, narrow range** of current source when a returned claim materially drives a
  contract, behavior or gate decision, and it reads the **digest** of a run it ordered. A sweep is not
  a narrow range.
- Needing broad reading in the main loop above the smallest tier is a signal the work was
  under-delegated: delegate the read and take the capsule.

## Deterministic steps

An enumerable fact is established by a command, not by a model reading around for it. These are
cheap, exact and repeatable, and their answer is stronger than an impression:

- **Content identity and freshness** — `git hash-object -- <paths>`; the commit is
  `git rev-parse HEAD`.
- **The change set** — `git status --porcelain` (it includes untracked files); against a known base,
  `git diff --name-only <base>...HEAD`. A scope-creep review's diff class comes from
  `git diff --stat` and then `git diff -- <path>` per file.
- **Documentation reach** — for every symbol, path, rule ID, flag or literal value the change
  touched, grep for it instead of judging from memory, with history excluded:
  `grep -rIn --exclude-dir=.git --exclude-dir=archive -e '<symbol>' .` An empty result is the
  evidence that nothing was affected.
- **Run results and before→after counts** — the exit codes and counters from the digests above.

Where the repository already defines its own command for one of these, that one wins.

## Safe archive protocol

Archive only after the command-specific successful completion condition. A blocker, partial result,
red required check, or unproven behavior preservation means no archive.

Before any move, read and cross-check explicit artifact links/task IDs; slug similarity is not
enough. Resolve `tasks/archive/<YYYY>/<kind>-<task-slug>/`; if occupied, use the first free
deterministic suffix (`-2`, `-3`, ...). Enumerate exact paths, reject traversal/paths outside
`tasks/`/unexpanded globs, never overwrite, update links after movement, re-open destinations, and
report the moved files. Do not use recursive deletion or broad destructive shell operations. Do not
commit or push unless explicitly requested.

### Structural track

After a successful `refactor`, archive `IMPL-refactor-*`. If its AUDIT has only that candidate (or
all candidates are now completed), move the whole linked AUDIT beside it.

If one AUDIT still contains unfinished candidates:

1. Keep the source AUDIT active.
2. Mark only the implemented candidate completed and link its archive directory.
3. Create an archive snapshot containing the audit header/coverage needed for provenance and the
   complete implemented candidate spec, named `AUDIT-<audit-slug>-candidate-<id>.md`.
4. Archive that snapshot with the candidate's `IMPL-refactor-*`.
5. Do not imply the remaining backlog is completed.

### Static-quality track

Each successful batch writes a uniquely linked artifact such as
`tasks/IMPL-lint-<plan-slug>-batch-<id>.md`; continue to accept legacy `IMPL-lint-*.md`. While any
batch remains, keep the LINT and completed batch artifacts active and mark only that batch done.

After the full ladder is complete, or the LINT document explicitly records a justified final
`closed` status, move the linked LINT and all of its batch IMPL artifacts into one
`tasks/archive/<YYYY>/lint-<plan-slug>/` directory. A partial ladder is never archived as complete.
