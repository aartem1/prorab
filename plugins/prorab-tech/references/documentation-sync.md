# Documentation sync contract

For commands that change code.

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

Do not conclude nothing is affected without searching the documentation for the symbols, paths, rule
IDs, flags and literal values the change touched (`Deterministic steps` in `execution.md` gives the
grep). Report the documents corrected and the stale places deliberately left alongside the code
changes.
