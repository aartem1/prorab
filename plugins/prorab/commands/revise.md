---
description: "The next batch of feedback on an already implemented result: an expected result stated before the edit, one independent verifier, and one rolling record that makes each iteration cheaper than the last."
argument-hint: what you checked and what should be different (optionally a slug or artifact path first)
model: sonnet
effort: high
---

Input: **$ARGUMENTS**

You apply **one batch of user feedback to a result this framework already implemented**. The user has looked at the page, the endpoint, the CLI or the service, and brought back what is wrong with it. Your job is to close that batch honestly and leave the next one cheaper.

This is the **continuation lane**, and continuation — not size — is what puts a task here. A one-line copy fix that belongs to an existing task is a `revise`; a two-file change that continues nothing is a `quick`. What you inherit is the whole point: a `Code map` whose hashes tell you what is still fresh, the invariants earlier iterations pinned, and the record of decisions already made. Recon is paid once, on the first iteration, and amortized over every one after it.

**There is no start and no finish.** No `status`, no `done`, no `reopen`, no closing run. Each call is a complete iteration that leaves the repository green, because each call may be the last one. The absence of a next message *is* the end of the process.

**Hard budget.** Count every model context: yourself, every `Agent`, every `Workflow` node; retries count again.

- **S — the default: at most 2 model contexts total** (you plus one independent verifier). No `Workflow`. This is the shape of nearly every batch of feedback.
- **M — at most 6 model contexts total**, when the batch genuinely spans several subsystems or a moderate blast radius. Prefer direct `Agent` calls; use `Workflow` only for a real parallel fan-out, never below M.

`max_turns` is **6** at S and **8** at M. There is no L, no XL and **no segmented run** in this lane: past 6 contexts the work is not a revision but a build, and the gate below hands it over. Never raise the tier because the *original* task was large — size the batch in front of you.

**Your context is the executor's context at S.** As in `quick`, the main-loop rule of the `Context hygiene` contract does not apply at 2 contexts: reading, editing and running the checks yourself is the intended shape. At M, delegate bulk reading and take capsules back. `Run output discipline` binds at both: a run becomes a digest, never a pasted log.

**One rolling artifact.** Exactly one file per task: `tasks/revisions/REVISION-<slug>.md` (template at the end). Every iteration updates that same file — never one file per round. It **archives nothing, ever**, and never edits the IDEA, IMPL or VERIFY of an archived bundle; it links to them.

**Contracts.** Read `${CLAUDE_PLUGIN_ROOT}/references/project-knowledge.md` (language, source-of-truth order, bounded recall, active-vs-archive lookup), `${CLAUDE_PLUGIN_ROOT}/references/execution.md` (capability routing, run output discipline, deterministic steps) and `${CLAUDE_PLUGIN_ROOT}/references/documentation-sync.md` — correcting the documents this iteration falsifies is a mandatory step, not a nicety. Read `${CLAUDE_PLUGIN_ROOT}/references/web-probing.md` **only if** this batch touches a browser surface; at S that means a headless run over the changed behavior and its negative, never an interactive visual session. Recall exact paths/symbols/terms only, verify any material recalled claim against current source, and capture at most one entry at the end — usually none, since the `Code map` already holds what this task needs. `REVISION-<slug>.md` is a project document a human reads, so it follows the task's language.

---

## Eligibility gate — check before editing, re-check after locating the code

**Escalate — stop and hand over — if any of these holds:**

- the feedback is a **separate new capability** that needs its own product decision rather than a correction of what exists;
- closing it needs **more than 6 contexts**, more than ~8 files, or a new design;
- it **changes an external contract**: a database migration, a breaking change to a public/HTTP API, a wire or serialization format, published types (merely *touching* a file that has an external contract is not the trigger — changing the contract is);
- it changes the **security, authentication, permission or payment model** (correcting a label or a layout on such a screen is not the trigger);
- it has **two incompatible readings** that one question cannot settle, or you cannot state the expected result as `given → expected` *before* writing code;
- the point is to **preserve behavior** while changing structure (`/prorab-tech:refactor`) or to move a linter/type bar (`/prorab-tech:lint-fix`);
- it needs a **secret, access, or environment you don't have**.

Escalation is mandatory, not a preference, and it applies mid-run: the moment reading the code reveals one of the above, stop, say in one or two sentences which trigger fired, and name the command — **`/prorab:refine`** (then `build`) for anything product-shaped, or the tech-track command above. Do not "just finish it since I'm already here". If you had already edited files, still append the iteration to `History` with its outcome `escalated`, recording what is half-done and which command takes over; an abandoned edit with no record is exactly the divergence this artifact prevents. Escalated before touching anything, and no record exists yet → write nothing.

Ordinary large-but-continuous work is **not** a gate trigger. "The filter should also survive a reload, and the reset button should clear the URL" is two subsystems and a `revise` at M, not a new idea.

---

## Order of work

1. **Resolve the task.** If `$ARGUMENTS` opens with a slug or a path — to `tasks/revisions/REVISION-*.md`, `tasks/IMPL-*.md`, `tasks/quick/QUICK-*.md`, or an archived bundle — take it and treat the rest as the feedback. Otherwise resolve by evidence, in order: an active `REVISION-*` whose `Code map` paths intersect the current change set; then the most recently modified active `IMPL-*`/`QUICK-*` whose paths intersect the change set or the feedback's own vocabulary. Do not select `tasks/archive/**` by default — only when the user names it. A similar slug alone is never enough: check the explicit cross-links, the paths, and the actual change set. Several equal candidates → **one** short question with the list. Nothing plausible found → say so and point at `/prorab:quick`, which is the right command for a change that continues nothing.
2. **Read the record and the ground.** Read `REVISION-<slug>.md` in full if it exists — it is small by construction. Snapshot the worktree with `git status --porcelain` and keep it: **pre-existing foreign changes are not yours**, they stay out of this iteration's diff, out of the verifier's input, and out of the record. Do not revert or absorb them.
3. **Check freshness before reading anything else.** Re-hash the `Code map` entries with `git hash-object -- <paths>` and compare. All fresh → spend **zero** recon and go straight to item 4 with the map. Some stale → re-read **only** those entries and their `Invariants`. Log one line: `map reused: <n> fresh, <m> stale`. Re-open IDEA/IMPL only on a real trigger — no `REVISION` exists yet, the feedback questions the original product decision, the relevant map entry is stale, or a contradiction cannot be resolved from the current code and the feedback. Never re-study the project "just in case". A matching hash proves the file is unchanged, not that the earlier reading of it was right: a map claim that materially drives an external-contract edit still gets its current source opened.
   On the **first** iteration there is no map: build one once, from the IDEA/IMPL if they exist, the current code, and the repository's own guidance — and record the verification commands you actually ran, not ones you saw.
4. **State the feedback contract in chat, before any edit.** Split the input into independent checkable items — no backlog with IDs and statuses. Each one is a `given <input> → <expected>` pair plus the surface it is checked on, and for each non-trivial item at least one negative (empty/invalid → error) or boundary (0 / limit / off-by-one) case. **The expected value comes from the user's current message**, never from what the code happens to return. IDEA and IMPL are context, not a fence: a working result legitimately sharpens the understanding of the product, so the original DoD does not cap what may be asked for now. Obvious reading → proceed without a question. Two genuinely incompatible readings → one combined question, before editing.
5. **Gate check and tier**, now that you have seen the code. Log the tier and, at M, `used/cap` with the model/effort per context before each delegation.
6. **Implement.** Where the behavior admits an automatic test: tie the test to a specific feedback item, get a **right-reason red** first — only an `AssertionError` counts; an `ImportError`/`SyntaxError`/fixture error means the test is wrong — then implement to green, then add the negative or boundary case. Where the behavior already exists and only its shape is wrong, or the correction is purely visual, use the cheapest credible evidence instead: an existing test, a measured layout value, a headless probe, or an exact manual re-check recipe named in the report. Mirror the local architecture and conventions; no unrelated refactoring, no cosmetic sweep of untouched lines. **Respect the recorded `Invariants`** — breaking one is a finding, not a side effect, unless this feedback deliberately replaces it.
7. **Run the checks** with the project's own supported commands, preferring the ones the map records as confirmed and re-deriving anything missing from repository guidance, CI, task runners or package scripts — never invented, never a silently installed tool. Always run the targeted checks, and the nearest affected invariant or neighbouring scenario with them. Run the full suite when this iteration touches an external contract or a wide blast radius, when targeted evidence is not enough, when shared components have changed since the last full run, or when the suite is cheap and is the project's ordinary gate — and never claim a full run you did not make on the current tree. Judge by exit code **and** counters. What reaches the record is the digest line, not the log.
8. **Sync the documentation** per the `Documentation sync` contract: grep for the symbols, paths, flags and literal values you touched, correct only what this iteration made factually wrong, and never edit `CHANGELOG.md`, release notes, ADRs or anything under `tasks/archive/**` to match new code. A correction larger than the change itself, or one needing a product decision, is named in the report instead of made. Nothing affected → say so explicitly; that is a finding, not silence.
9. **One independent verifier** (fresh context, `schema` for a structured verdict). Its input is deliberately narrow: the feedback contract from item 4, the recorded `Invariants`, **this iteration's diff only** — never the task's accumulated diff — the changed tests, and the documentation edits you declared. It answers yes/no on: expected values derived from the feedback rather than from the implementation; the real unit-under-test executes and neither it nor its direct return is mocked (mocking external boundaries — network, DB, time, FS — is fine); negative/boundary present or a specific reason why not; no green-up workarounds in new or changed tests (`assert True`, a tautology, no assert, `skip`/`xfail`, a commented-out or deleted case, `try/except` without re-raise, a hardcoded answer for the test input); no recorded invariant broken; nothing changed outside the stated feedback, foreign worktree changes excluded and documentation edits included; and no document left contradicting the diff. Default **refuted if in doubt**. Fix confirmed findings, then **at most one** more targeted re-run. If a second round still confirms real findings, this batch was not a revision: escalate rather than grinding.
10. **Update the record**, after the verifier, so it states the real outcome. Append **one** line to `History` — it is append-only, and an earlier line is never rewritten, even when this iteration reverses its decision. Patch only the `Code map` entries this iteration made stale, and re-stamp `Provenance`. Add or amend an `Invariant` when the batch established or replaced one. Put in `Open` only what is genuinely unclosed — a partial result, a blocker, a handover — and leave it empty otherwise. Create `tasks/revisions/` if absent.
11. **Report, honestly and short.** What changed; the check results as they are, failures with their output; what the user should re-check by hand; the documentation corrected or deliberately left stale; anything skipped; what is left open. Do not declare the product finished or perfect — no next message is what finishes it.

---

## What NOT to do

- Don't create `IDEA-*`/`IMPL-*`, don't archive anything, and don't edit an archived bundle — link to it.
- Don't add statuses, a state machine, per-item IDs, or a closing run. Don't ask the user to confirm a successful iteration.
- Don't write one file per iteration, and don't let the record grow into an IMPL: no plan, no diff, no raw logs, no reasoning.
- Don't rewrite `History`. A reversed decision is a new line referring to the old one, not an edit of it.
- Don't re-read the whole IDEA/IMPL and the whole codebase on every call; hashes exist so you don't have to.
- Don't go past 6 contexts, don't reach for a segmented run, and don't raise the tier because the original build was big.
- Don't green up a test (`assert True`, skip/xfail, a snapshot taken from your own output, mocking the unit-under-test, a hardcode for the test input), and don't take the expected value from the implementation.
- Don't treat "no error" as proof that a remark was addressed, and don't call a check run that you didn't run.
- Don't absorb foreign worktree changes into this iteration, and don't commit or push unless asked. If on `main`/`master`, create a working branch first.
- Don't do open-ended "general improvements" outside the feedback in front of you.

---

## Artifact template

Section names and prose go in the **task's language** (headings below are shown in English only as a key); paths, commands, symbols, hashes and check output stay verbatim. Keep the whole file to about a screen and a half — if it does not fit, the entries are too verbose, not the history too long.

```markdown
---
type: revision
slug: <slug>
date: <YYYY-MM-DD>
links:
  idea: <path or null>
  impl: <path or null>
  quick: <path or null>
---

# Revisions: <task name>

## Code map
- Provenance: commit `<sha>`, recorded `<YYYY-MM-DD>`
- Files studied (`path` — role — `sha1`): …
- Change points (file:line → what changes here): …
- Conflicts / contracts at risk (file:line → what breaks): …
- Local conventions to mirror (file:line → the pattern): …
- Not studied (deliberate gaps a later iteration must cover itself): …
- Verification commands CONFIRMED (`<exact command>` — what it covers): …
- Web surfaces (only with a browser surface): start command and base URL · routes reached · the user-facing handles · the e2e harness and its invocation, or "none"

## Invariants
- <behavior a later iteration must not break> — pinned by `<test name / check>`

## History
1. `<YYYY-MM-DD>` <the remark, in one clause> → <what changed> → `<check digest>` · red-first `<test file sha1>` · <verifier verdict, or `escalated to <command>`> · routing `<main model/effort · delegated role → model>`

## Open
- <partial, blocker or handover — an empty section means nothing is open>
```

**Filling it.** The `Code map` is the same handoff the IDEA carries, deliberately: one format across `refine`, `build` and `revise`. Stamp provenance with `git rev-parse HEAD` and `git hash-object -- <paths…>` (the blob hash of current content, so modified and untracked files are covered); not a git repository or the command unavailable → drop the `Provenance` line and the `sha1` column and say so, and the next iteration re-derives the map. Never guess a hash. Unlike the IDEA's map, the verification commands here are **CONFIRMED**: you ran them. The `routing` clause on a `History` line is the same ledger the `Capability routing` contract asks every run to leave — the pinned pair plus what each delegated context actually ran on — and it is what makes a later "this role keeps escalating" a fact rather than an impression.

The `History` line's test hash is the **coverage-evidence handoff** — a later `/prorab:verify` re-hashes that file instead of re-proving a test whose right-reason red is already recorded. Write `none` with a reason where an item has no such proof. The iteration's outcome lives in its own line: a partial or escalated iteration says so there, which is why this artifact needs no `status` field.
