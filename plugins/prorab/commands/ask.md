---
description: "Answers a question about the current project from current code, docs, task history and bounded memory; verifies claims and cites sources."
argument-hint: "question about architecture, behavior, history, consumers, ownership, or verification"
model: sonnet
effort: high
---

Input: **$ARGUMENTS**

You answer a question about the current project, for example: how a component works, why an
approach was chosen, where a metric is calculated, which consumers a contract has, what happened in
this area before, or how to test it correctly.

This is a **read-mostly** command. Do not write project code, run mutating checks, install tools,
commit, or push. The only allowed writes are correcting a project-memory entry whose staleness is
proved by the read-only investigation, or marking it `stale`/`superseded`.

**Project knowledge.** First read
`${CLAUDE_PLUGIN_ROOT}/references/project-knowledge.md`. Follow its language, source-of-truth order,
bounded recall, freshness, active/archive lookup, and memory-correction rules. Memory is an
accelerator, never the only source.

## Method

1. If `$ARGUMENTS` is empty, ask for one project question. Otherwise classify it as current
   structure, behavior, historical decision, verification, or a combination.
2. Extract exact paths, symbols, component/event/API names, tool commands, and domain terms.
3. Search `tasks/memory/INDEX.md` and matching entries exact-first. Keep recall task-specific and
   compact; missing memory is non-fatal.
4. Search related active IDEA/IMPL/QUICK/REVISION/VERIFY/AUDIT/LINT/ANNOUNCE artifacts and
   `tasks/archive/**`. Archived artifacts are historical evidence, not current state. A
   `tasks/revisions/REVISION-*.md` is the exception worth reaching for first on a "why does it
   behave like this" question about shipped work: its `History` records the remarks that reshaped
   the result after the original build, and its `Invariants` say which of them are pinned by a test.
5. Inspect current code, repository instructions, and project docs for every material claim about
   current behavior, architecture, contracts/consumers, ownership, or verification. Use read-only
   tests/commands only when they are already supported and necessary; do not mutate state.
6. For a historical "why/when/what changed" question, inspect relevant task artifacts and Git
   history (`git log`, `git show`, `git blame`) when current code cannot answer it. Separate a
   documented reason from an inference based on the diff.
7. If memory conflicts with current evidence, current evidence wins. Correct or mark only the
   affected entry; do not change project code. If evidence is insufficient, state the uncertainty.
8. Answer compactly. Use one delegated `Explore` context only when the source set is genuinely
   bulky; otherwise work directly. A delegated context must use `max_turns: 6`, return a source map
   rather than dumps, and does not justify extra fan-out. Per the `Delegated context returns` limit
   in the project-knowledge reference, that map is a capsule of claims and pointers — `path:line`,
   symbol, artifact section, commit SHA — at roughly 1500 tokens; you open a named narrow range
   yourself when a specific claim needs the source.

## Answer contract

Lead with the direct answer. Then, only where relevant, separate:

- **Confirmed now** — supported by current code/docs/executable evidence.
- **Historical context** — supported only by archived artifacts or Git history.
- **Unverified** — what could not be established and why.
- **Sources** — concise repository paths, symbols/lines when useful, artifact paths, and commit
  SHAs. Do not cite a memory entry without also stating how its material claim was checked.

Do not expose internal reasoning or turn the answer into a full repository dump.

## What NOT to do

- Do not answer a current-state question from memory or an archived artifact alone.
- Do not present an inferred historical motive as documented fact.
- Do not load the whole memory or archive when exact matching is sufficient.
- Do not implement a fix, edit project code, run mutating checks, install dependencies, commit, or
  push.

