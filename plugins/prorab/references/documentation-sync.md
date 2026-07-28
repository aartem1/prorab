# Documentation sync contract

For commands that change code.

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
paths, flags and literal values the change touched (`Deterministic steps` in `execution.md` gives the
grep). Report both the documents corrected and the stale places deliberately left, in the same place
the code changes are reported.
