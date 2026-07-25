# Project knowledge contract

This contract is shared by the product commands. Apply it without increasing the command's
orchestration tier or fan-out: recall and capture are main-context filesystem work.

## Source-of-truth order

1. Current worktree.
2. Current repository instructions and project documentation.
3. Tests, CI, and other executable evidence.
4. Active and archived task artifacts.
5. Project memory.

Memory accelerates discovery; it never proves current behavior by itself. If a material memory
claim affects behavior, architecture, an external contract, Scope, DoD, implementation choice, or
the verification recipe, open its current source before using it. If it conflicts with current
evidence, use the current evidence and update the entry or mark it `stale`. If it cannot be checked,
label the uncertainty.

## Layout

Create this structure lazily in the working project; commands must still work when it is absent:

```text
tasks/
  memory/
    INDEX.md
    components/
    decisions/
    gotchas/
    verification/
  archive/
    YYYY/
      <task-slug>/
```

Use small thematic files, predictable kebab-case names, and a compact `INDEX.md`. Put `component`,
`contract`, and `pattern` entries under `components/`; `decision` under `decisions/`; `gotcha` under
`gotchas/`; and `verification` under `verification/`.

Every entry starts with:

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

Omit `commit` when unavailable. Follow the metadata with:

- `## Confirmed facts`
- `## Inference or recommendation`
- `## Evidence`
- `## Invalidated when`

Keep facts separate from inference. Cite current paths/symbols and the producing artifact. Do not
copy whole IDEA/IMPL documents into memory.

## Documentation sync

A command that changes code owns the documentation that change falsifies. A stale document left
behind is an incomplete change, not a follow-up. This duty is part of the command's own completion
condition — a task with an uncorrected contradiction between code and a current-state document is
not done.

**Current-state documents are corrected. Historical documents are never rewritten.**

- *Current state* — anything that claims to describe how the project works now: `README`, `docs/`,
  the project spec, API/configuration references, runbooks, `CLAUDE.md` and other agent guidance,
  docstrings, comments, `--help`/usage text, and the examples inside any of them.
- *Historical* — anything whose purpose is to record what happened: `CHANGELOG.md`, release notes,
  ADRs and other dated decision records, migration notes, `tasks/archive/**`, completed task
  artifacts, and any section explicitly written as a record of a past state. Add a new entry when
  the project's convention calls for one; never edit a past entry so it matches new code.

Scope of the duty is what the change makes **factually wrong**: a renamed symbol or path, a changed
default, flag, signature, limit, format or command, a documented example that would now produce a
different result, a step that no longer exists. Fix it in place, minimally, in the language the
document is already written in, following its existing style.

Out of scope, and reported instead of edited: rewriting for style, filling documentation gaps that
predate the change, restructuring a document, and any correction that needs a product decision.
If a needed correction is larger than the code change itself, say so in the report and name the
follow-up command rather than expanding the diff.

Do not conclude that nothing is affected without looking: search the documentation for the symbols,
paths, flags and literal values the change touched. Report both the documents corrected and the
stale places deliberately left, in the same place the code changes are reported.

## Recall

1. Derive a short search vocabulary from the task: exact paths, symbols, component names, event/API
   names, and domain terms.
2. Search `tasks/memory/INDEX.md`, entry filenames, and entry text by exact match first. Use broader
   term matching only if exact search is insufficient.
3. Read only matching entries, normally no more than needed for an eight-bullet digest. Never load
   the whole memory tree into the main context.
4. Open the current source for every material claim. A changed referenced path or symbol is a
   freshness signal, not automatic proof that the entry is wrong; compare the specific claim.
5. Pass only a compact digest into the command: relevant fact, current evidence, confidence, and
   source entry.
6. A missing/unreadable memory tree is non-fatal.

Active artifact lookup must not select `tasks/archive/**` by default. Search the archive only when
the user explicitly names an archived task, when `announce` needs completed work, or when a
historical question requires it.

## Capture

Capture automatically only after the command's own success condition. Before creating an entry,
search for the same subject, paths, symbols, and decision; update the existing entry when it is the
same durable fact. Usually zero to three entries are enough.

Capture only durable, cross-task knowledge: architectural decisions, component responsibility,
contracts/consumers, non-obvious constraints, recurring gotchas, verified commands, rejected
alternatives and their reasons, or a past result that changes future work. Do not capture
transcripts, chain-of-thought, temporary status, unmarked assumptions, one-off errors, ordinary code
facts that are cheaper to read directly, or duplicated IDEA/IMPL/AUDIT content.

When current evidence invalidates an entry, preserve it as `superseded` only if the historical
decision matters; otherwise update it or mark it `stale`. Refresh `last_verified_at` only after
opening the cited current source. Keep `INDEX.md` to one line per entry: link, type, status, topic,
and key paths/symbols.

## Archive lifecycle

Archive only after the command has re-checked Scope/DoD and recorded a final successful status.
Blocker, partial completion, or a failed mandatory check means no archive.

For a completed product task, move the linked IDEA, IMPL, and existing ANNOUNCE into:

```text
tasks/archive/<YYYY>/<task-slug>/
```

Before moving:

1. Read every candidate artifact and verify explicit cross-links/task identity; a similar slug alone
   is insufficient.
2. Resolve the destination from the task identity. If it exists, use the first free deterministic
   suffix (`<task-slug>-2`, then `-3`, and so on); never overwrite.
3. Enumerate exact source and destination paths. Reject paths outside `tasks/`, path traversal, and
   unexpanded globs. Do not use recursive deletion or broad destructive shell operations.
4. Create the destination, move only the verified files, update Markdown links/plain path references
   in the moved bundle and remaining task artifacts, then re-open each destination.
5. Report the exact moved files. Do not commit or push unless explicitly requested.

If `announce` runs after archival, it reads the archived IDEA/IMPL in place. When the user asks to
save the announcement, save it in that same archive directory; do not restore active copies.
