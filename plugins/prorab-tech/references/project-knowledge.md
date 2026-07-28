# Project knowledge contract

Shared by the tech-quality commands. Apply it without increasing the command's orchestration tier or
fan-out: recall, capture, and archival are main-context filesystem work.

Siblings, loaded only by the commands that need them: `execution.md` (run output, main-loop
discipline, deterministic steps) and `documentation-sync.md`.

## Language

Reason, prompt agents, and fill `schema` fields in **English**. Everything a human reads is in the
**task's language** — detected from how the request was phrased, Russian by default: your chat and
the task artifacts you write, which are project documents. Code, identifiers, paths, tool and rule
names, comments, commit messages and configs stay as in the code and its own documentation. Carry
user-visible domain/report terms verbatim in the task's language; never round-trip-translate them. A
template printed inside a command is in English for reference — render its headings and prose in the
task's language.

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

## Delegated context returns

One of three context-occupancy limits, orthogonal to the orchestration tier: the tier bounds how
*many* contexts a command opens, these bound how *full* each one gets. The other two — run output
discipline and main-loop discipline — are in `execution.md`.

A delegated context returns one compact structured result through `schema`: claims plus pointers to
evidence, never the evidence itself. Keep a return near 1500 tokens.

It carries the finding, candidate or map entry and where to verify it — `path:line`, a symbol, a rule
ID, an artifact section, or a command with its exit code. It does **not** carry file contents beyond a
minimum quoted line, a full diff, raw analyzer output, a directory listing, the agent's reasoning, or
a restatement of its own prompt. When material genuinely has to be seen, the return names it and the
orchestrator opens that one range, so the reading happens once where it is needed instead of being
copied through a context that only passes it along. An oversized return is never forwarded verbatim
into another prompt: extract the claim, drop the bulk.

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
