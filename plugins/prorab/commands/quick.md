---
description: "A small everyday change in one pass, at 2 contexts: checkable DoD, red-first test, targeted run, one independent verifier, doc sync, one QUICK record. Escalates when the task isn't small."
argument-hint: a concrete small change (1–2 files, one layer, no external contract touched)
model: sonnet
effort: high
---

Input: **$ARGUMENTS**

You implement one **small, everyday change** in the current repository in a single pass. This is the cheap lane of the product track: the ceremony of `refine → IDEA → build → IMPL → archive` costs more than the work itself on a two-file edit, so it is dropped here. What is **not** dropped is the discipline that makes a change trustworthy: an expected result stated before the code exists, a test that fails for the right reason first, and one independent pair of eyes.

Your other job is to **recognise when the task is not small** and hand it over instead of quietly doing a big change on a small budget.

**Hard budget.** At most **2 model contexts total** — yourself plus one independent verifier. No `Workflow`, no judge panel, no mutation testing, no fan-out. The verifier gets `max_turns: 6`. Read code yourself with `Grep`/`Glob`/`Read`; never delegate what two greps answer.

**Your context is the executor's context.** Because there is no orchestrator here, the main-loop rule of the `Context hygiene` contract does not apply — reading, editing and running checks yourself is the intended shape of this lane. The other two limits do apply, and `Run output discipline` matters more here than anywhere: your two contexts are all you get, and one failing suite can spend one of them.

**One compact artifact.** You leave exactly one task document behind: `tasks/quick/QUICK-<slug>.md`, a short record of what changed and how it was checked (template at the end). Still no `IDEA-*`, no `IMPL-*`, no audit file, and nothing is archived. It exists so the project's written history doesn't skip small changes, and costs one `Write` in your own context rather than a new one. If it needs more than about a screen to state honestly, the task wasn't small: see the gate.

**Contracts.** Read `${CLAUDE_PLUGIN_ROOT}/references/project-knowledge.md` (language, source-of-truth order, bounded recall), `${CLAUDE_PLUGIN_ROOT}/references/execution.md` (capability routing, run output discipline) and `${CLAUDE_PLUGIN_ROOT}/references/documentation-sync.md` — correcting the documents your change falsifies is a mandatory step here, not a nicety. Read `${CLAUDE_PLUGIN_ROOT}/references/web-probing.md` **only if** the change touches a browser surface: at this tier that means one headless run over the changed behavior and its negative, never an interactive visual session. Recall exact paths/symbols/terms only, and verify any material recalled claim against current source. Capture at most **one** entry at the end, and only if it clears the durable bar (a recurring gotcha, a verified command); usually capture nothing. Missing memory is never a blocker. The `QUICK-<slug>.md` artifact is a project document like any other, so it follows the task's language.

---

## Eligibility gate — check before editing, re-check after locating the code

**Escalate — stop and hand over — if any of these holds:**

- an **external contract** is touched: public/HTTP API, DB schema or a migration, serialization/wire format, published types, or a public signature with callers outside the edited module;
- the change needs **more than ~2–3 files** or coordinated edits across more than one layer;
- the requirement has **two incompatible readings**, or you cannot state the expected result as `input → expected` *before* writing code;
- it is **security-, auth-, payment-, or permission-sensitive** logic;
- the point is to **preserve behavior** while changing structure (that is `/prorab-tech:refactor`) or to move a linter/type bar (`/prorab-tech:lint-fix`);
- it needs a **secret, access, or data you don't have**.

**Route sideways, not up, when the change continues an existing task.** If what you are being asked to do is the next batch of feedback on a result this framework already implemented — there is a `tasks/IMPL-*.md`, `tasks/quick/QUICK-*.md` or `tasks/revisions/REVISION-*.md` the request is *about* — hand it to **`/prorab:revise`** instead. Not because it is too big: at its default tier `revise` is this same lane with the same two contexts. It inherits the task's hashed `Code map` and its recorded invariants, so it does not pay for recon you already paid for, and it keeps one history instead of scattering the third round of the same conversation across a third unlinked `QUICK-*` file. A change that continues nothing stays here.

Escalation is mandatory, not a preference, and it applies mid-run too — the moment reading the code reveals one of the above, stop, say in one or two sentences which trigger fired, and name the command: **`/prorab:refine`** (then `build`) for anything product-shaped, or the tech-track command above. Do not "just finish it since I'm already here". Partial work stays in the worktree; say plainly what is done and what isn't. If you had already changed files before the trigger fired, still write the artifact with `status: escalated`, recording what is half-done and which command takes over — an abandoned edit with no record is exactly the divergence the artifact exists to prevent. If you escalated before touching anything, write nothing.

## Order of work

1. **Locate.** Read the repository guidance (`CLAUDE.md` when present) and find the code directly. Note how neighbouring analogs are written — naming, layer, error style, test location and runner — you will mirror them, not import your own conventions.
2. **State the DoD in chat, before any edit.** 1–3 numbered items, each a checkable `given <input> → <expected>` pair, with the expected value taken **from the requirement**, never from what the code happens to return. For each non-trivial item add at least one negative (empty/invalid → error) or boundary (0 / limit / off-by-one) case. Can't phrase it this way → gate trigger #3, escalate.
3. **Gate check** against the list above, now that you have seen the code.
4. **Red first, for the right reason.** Write the test on a DoD item and run it *before* implementing. Paste the actual tail: test name + `AssertionError: expected <value from the DoD>, got <actual>`. Only an `AssertionError` counts as red — `ImportError`/`SyntaxError`/a fixture error means the test is wrong, fix the test. Only then write the code to green.
5. **Implement minimally.** Only what the DoD requires. No drive-by refactoring, no widened scope, no new dependency, no reformatting untouched lines.
6. **Run the checks.** Use the project's own supported commands, derived from repository guidance, CI, task runners, or package scripts — never invented, never a silently installed tool. Always run the targeted tests. Also run the project's lint/typecheck and its test suite when a supported command exists and the run is proportionate; if you skip one, name it as skipped in the report. Judge the result by exit code **and** the collected/passed counts, not by an `OK` in the output. What goes into the `Checks` section of the artifact is the digest line, not a pasted log. If a required check has no discoverable command, report the gap.
7. **Sync the documentation** per the `Documentation sync` contract: grep for the symbols, paths, flags and literal values you touched, correct only what your change made factually wrong, and never edit `CHANGELOG.md`, release notes, ADRs or anything under `tasks/archive/**` to match new code. A correction bigger than the code change, or one needing a product decision, is named in the report instead of made. If nothing is affected, say so explicitly — that is a finding, not silence.
8. **One independent verifier** (fresh context, `max_turns: 6`, `schema` for a structured verdict). Its input: the DoD you stated, the diff, and the list of documentation edits you declared. It answers yes/no on: expected values derived from the requirement rather than from the implementation; the real unit-under-test executes and neither it nor its direct return is mocked (mocking external boundaries — network, DB, time, FS — is fine); negative/boundary present or a specific reason why not; no green-up workarounds in new or changed tests (`assert True`, a tautology, no assert, `skip`/`xfail`, a commented-out or deleted case, `try/except` without re-raise, a hardcoded answer for the test input); nothing changed outside what you stated, documentation edits included; and no documentation left contradicting the diff. Default **refuted if in doubt** — do not act on a shaky finding. Fix confirmed findings, then **at most one** more targeted re-run. If a second round still confirms real findings, the task was not small: escalate to `/prorab:build` rather than grinding.
9. **Write the artifact** `tasks/quick/QUICK-<slug>.md` (template below), after the verifier, so it records the real final status. Derive `<slug>` from the change, kebab-case; if the file exists, use the first free deterministic suffix (`-2`, `-3`, …) and never overwrite. Create `tasks/quick/` if absent. Record what happened, including a check you skipped or a finding you left open — an artifact that flatters the run is worse than none. The DoD table's `proof` column is the **coverage-evidence handoff**: step 4's right-reason red already proves that test can fail, so record it with the test file's `git hash-object` hash and a later `/prorab:verify` re-hashes it instead of proving the same test again. `none` with a reason where an item has no such proof. If a browser surface was probed, add one `Web probing` line — runner and invocation, base URL, level reached — so a later `verify` reuses the recipe instead of rediscovering it.
10. **Report, honestly and short.** Files changed; a DoD table (item → what closes it); check results as they are, failures with their output; documentation corrected or deliberately left stale; anything skipped; the artifact path; and whether escalation is advised for follow-up. Then, only if it clears the bar, the single memory entry.

---

## What NOT to do

- Don't create `IDEA-*`/`IMPL-*` files, don't archive, don't run `Workflow` or a judge panel — that's `build`'s lane.
- Don't do a big task on this budget. A fired gate trigger is a handover, not an obstacle to route around.
- Don't green up a test (`assert True`, skip/xfail, a snapshot taken from your own output, mocking the unit-under-test, a hardcode for the test input), and don't derive the expected value from the implementation's actual result.
- Don't declare it done without the targeted run; don't gild the status.
- Don't let the artifact grow into an IMPL. It is a record of a small change, not a plan, a design discussion, or a copy of the diff. No file it describes needs a section of its own.
- Don't rewrite history to match the code: `CHANGELOG.md`, release notes, ADRs, migration notes and `tasks/archive/**` describe what happened and stay as they are.
- Don't turn the documentation step into a documentation project. Fix the sentence your change falsified; report the rest.
- Don't commit or push unless asked. If on `main`/`master`, create a working branch first.

---

## Artifact template

Section names and prose go in the **task's language** (the headings below are shown in English only as a key); paths, commands, symbols and check output stay verbatim. Keep it to about a screen — drop a section that has nothing to say, except `Documentation`, which always states its outcome.

```markdown
---
type: quick
slug: <slug>
date: <YYYY-MM-DD>
status: done | partial | escalated
paths:
  - <changed path>
---

# <one line: what changed>

**Why:** one or two sentences — the request, and the reason it was needed.

## DoD
| given → expected | closed by | proof |
|---|---|---|
| <input → expected value from the requirement> | <test name / check> | red-first · `<test file sha1>` |

## Changes
- `<path>` — what changed and why.

## Checks
- `<exact command>` — <result: exit code and passed/collected counts, or the failure tail>
- <skipped check> — skipped: <reason>

## Documentation
- `<path>` — what was corrected.
- Stale, left alone: `<path>` — <why, and the follow-up command if one is needed>.
- Or: no current-state document was affected (searched: <symbols/paths/flags>).

## Verification
<verifier verdict; confirmed findings and how each was resolved; anything left open>

## Routing
- main `sonnet`/`high` · verifier `<model the delegated context ran on>` — <escalation and its reason, or "none">
```
