---
description: "A small everyday change end-to-end in one pass — no IDEA/IMPL, no Workflow: locate, state a checkable DoD, red-first test, implement, targeted run, one independent verifier. Escalates to refine/build the moment the task turns out not to be small."
argument-hint: a concrete small change (1–2 files, one layer, no external contract touched)
---

Input: **$ARGUMENTS**

You implement one **small, everyday change** in the current repository in a single pass. This is the cheap lane of the product track: the ceremony of `refine → IDEA → build → IMPL → archive` costs more than the work itself on a two-file edit, so it is dropped here. What is **not** dropped is the discipline that makes a change trustworthy: an expected result stated before the code exists, a test that fails for the right reason first, and one independent pair of eyes.

Your other job is to **recognise when the task is not small** and hand it over instead of quietly doing a big change on a small budget.

**Hard budget.** At most **2 model contexts total** — yourself plus one independent verifier. No `Workflow`, no judge panel, no mutation testing, no fan-out. The verifier gets `max_turns: 6`. Read code yourself with `Grep`/`Glob`/`Read`; never delegate what two greps answer.

**No artifacts.** Write no `IDEA-*`, no `IMPL-*`, no audit file, and archive nothing. The report lives in chat. Project code and tests are the only files you change.

**Language.** Reasoning and the verifier's prompt/`schema` are in **English**. Everything the user reads — your chat, the DoD you state, the final report — is in the **task's language** (detect it from how the request is phrased; default Russian). Code, identifiers, comments, commit messages: always English. Carry domain/UI terms as-is, don't round-trip-translate them.

**Project knowledge.** Read `${CLAUDE_PLUGIN_ROOT}/references/project-knowledge.md` and apply its source-of-truth order and bounded recall — recall exact paths/symbols/terms only, and verify any material recalled claim against current source. Capture at most **one** entry at the end, and only if it clears the durable bar (a recurring gotcha, a verified command); usually capture nothing. Missing memory is never a blocker.

---

## Eligibility gate — check before editing, re-check after locating the code

**Escalate — stop and hand over — if any of these holds:**

- an **external contract** is touched: public/HTTP API, DB schema or a migration, serialization/wire format, published types, or a public signature with callers outside the edited module;
- the change needs **more than ~2–3 files** or coordinated edits across more than one layer;
- the requirement has **two incompatible readings**, or you cannot state the expected result as `input → expected` *before* writing code;
- it is **security-, auth-, payment-, or permission-sensitive** logic;
- the point is to **preserve behavior** while changing structure (that is `/prorab-tech:refactor`) or to move a linter/type bar (`/prorab-tech:lint-fix`);
- it needs a **secret, access, or data you don't have**.

Escalation is mandatory, not a preference, and it applies mid-run too — the moment reading the code reveals one of the above, stop, say in one or two sentences which trigger fired, and name the command: **`/prorab:refine`** (then `build`) for anything product-shaped, or the tech-track command above. Do not "just finish it since I'm already here". Partial work stays in the worktree; say plainly what is done and what isn't.

## Order of work

1. **Locate.** Read the repository guidance (`CLAUDE.md` when present) and find the code directly. Note how neighbouring analogs are written — naming, layer, error style, test location and runner — you will mirror them, not import your own conventions.
2. **State the DoD in chat, before any edit.** 1–3 numbered items, each a checkable `given <input> → <expected>` pair, with the expected value taken **from the requirement**, never from what the code happens to return. For each non-trivial item add at least one negative (empty/invalid → error) or boundary (0 / limit / off-by-one) case. Can't phrase it this way → gate trigger #3, escalate.
3. **Gate check** against the list above, now that you have seen the code.
4. **Red first, for the right reason.** Write the test on a DoD item and run it *before* implementing. Paste the actual tail: test name + `AssertionError: expected <value from the DoD>, got <actual>`. Only an `AssertionError` counts as red — `ImportError`/`SyntaxError`/a fixture error means the test is wrong, fix the test. Only then write the code to green.
5. **Implement minimally.** Only what the DoD requires. No drive-by refactoring, no widened scope, no new dependency, no reformatting untouched lines.
6. **Run the checks.** Use the project's own supported commands, derived from repository guidance, CI, task runners, or package scripts — never invented, never a silently installed tool. Always run the targeted tests. Also run the project's lint/typecheck and its test suite when a supported command exists and the run is proportionate; if you skip one, name it as skipped in the report. Judge the result by exit code **and** the collected/passed counts, not by an `OK` in the output. If a required check has no discoverable command, report the gap.
7. **One independent verifier** (fresh context, `max_turns: 6`, `schema` for a structured verdict). Its input: the DoD you stated plus the diff. It answers yes/no on: expected values derived from the requirement rather than from the implementation; the real unit-under-test executes and neither it nor its direct return is mocked (mocking external boundaries — network, DB, time, FS — is fine); negative/boundary present or a specific reason why not; no green-up workarounds in new or changed tests (`assert True`, a tautology, no assert, `skip`/`xfail`, a commented-out or deleted case, `try/except` without re-raise, a hardcoded answer for the test input); nothing changed outside what you stated. Default **refuted if in doubt** — do not act on a shaky finding. Fix confirmed findings, then **at most one** more targeted re-run. If a second round still confirms real findings, the task was not small: escalate to `/prorab:build` rather than grinding.
8. **Report, honestly and short.** Files changed; a DoD table (item → what closes it); check results as they are, failures with their output; anything skipped; and whether escalation is advised for follow-up. Then, only if it clears the bar, the single memory entry.

---

## What NOT to do

- Don't create `IDEA-*`/`IMPL-*` files, don't archive, don't run `Workflow` or a judge panel — that's `build`'s lane.
- Don't do a big task on this budget. A fired gate trigger is a handover, not an obstacle to route around.
- Don't green up a test (`assert True`, skip/xfail, a snapshot taken from your own output, mocking the unit-under-test, a hardcode for the test input), and don't derive the expected value from the implementation's actual result.
- Don't declare it done without the targeted run; don't gild the status.
- Don't commit or push unless asked. If on `main`/`master`, create a working branch first.
