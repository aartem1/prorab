# Segmented run contract (XL)

Loaded only when the task in front of the command has **seams**: by `refine` when the idea shows XL
signals — it does the cutting — and by `build` when its triage selects XL — it does the executing.
This is a topology, not a new command: the same `refine → IDEA → build → IMPL` chain, with the
implementation phase run as a sequence of small runs instead of one long one.

## Why a bigger tier would be the wrong answer

L already spends 12 contexts, 16 on confirmed critical risk, and that is not what a genuinely large
task runs out of. What it runs out of is the **main loop**: one orchestrating context has to live from
intake to the final report, and across a multi-hour task compaction takes the plan with it, a
thirty-item DoD table stops fitting beside the work, and a diff that touched forty files reviews
worse than ten diffs that touched four. Raising the ceiling buys **more of exactly what degrades**.

So XL changes the shape instead of the number. The work is cut at its seams while the idea is being
refined; each segment is then implemented by a **fresh context** on an ordinary S/M budget; and the
state of the run — what is done, what it published, what it proved — lives in a file rather than in a
conversation. Hence the property that makes hours of work possible at all: the run survives its own
context. Compaction, `/clear` and an outright interruption all leave it resumable.

## XL signals

Assess these from the idea, alongside the S/M/L signals — they are cheap and already in hand:

- the ordered stages exceed about four, and at least two of them **cannot start** before an earlier
  one lands;
- three or more subsystems *plus* repetition across surfaces — several pages, screens, components or
  entities that each need the same treatment;
- the Definition of Done passes roughly eight checkable items;
- one surface, but many independently checkable rules (~8+), each with its own negative and boundary;
- a pre-stage everything else sits on (an infrastructure or contract change other segments assume);
- the user explicitly asked for work in **several repositories**.

Pick XL when at least two signals hold **and** a cut satisfying the discipline below actually exists.
**If the work has no seam, it is not XL.** A task that cannot be cut without splitting a coherent
edit is either L, or an idea that is still **under-decomposed** — and then the answer is to keep
refining, **never a forced shard**. Sharding coherent work is how decomposition starts costing
quality instead of buying it.

## Seam discipline

A cut is good when every one of these holds:

- **Each segment leaves the repository green.** Its own DoD items are closed and the project's checks
  pass at the level its recipe defines. A segment that leaves the tree broken for the next one is not
  a segment, it is half an edit.
- **Every DoD item belongs to exactly one segment.** An item split across two can be closed by
  neither, and it is the first thing to go wrong in a plan that looks tidy.
- A cut may **never split a coherent edit**, a contract change from its call-sites,
  or a DoD item from its test.
- **Each segment is sized to S or M.** A segment too big for one executor is a bad cut, not a licence
  to fan out inside it — re-cut it.
- **Order by dependency, not by layer.** Where many segments sit on shared plumbing, make the first
  segment a walking skeleton: it turns the interface into something real before six segments assume
  it.
- **Each segment names what it publishes** for the ones after it. That list is what lets a later
  fresh context consume the work without re-reading it.
- **No hard cap on the number of segments.** Past about twelve, say which of them could ship as an
  independent increment and let the user decide — do not split their idea unilaterally.

An unresolved fork stays local: `[?:…]` inside one segment **blocks that segment only**, not the run.
A fork that decides a seam, an order or a published interface is global and has to be closed while
refining.

## Segment plan

Written by `refine` into the IDEA, next to the `Code map`. Headings render in the task's language;
paths, symbols and identifiers stay verbatim.

```markdown
### Segment plan (handoff for build — the execution unit at XL)
- Segments: <n> · repositories: <only when several were asked for>
- Global DoD → segment: 1→S01, 2→S01, 3→S02, …

#### S01 — <name>
- Goal: one sentence, in the requirement's terms.
- Depends on: none | S…
- DoD items: <global numbers>
- Files / subsystems: …
- Publishes: <symbols, routes, schemas, props a later segment may rely on> | nothing
- Expected tier: S | M
- Local forks: `[?: …]` | none
- Repo: <only in a multi-repo plan>
```

## Segment ledger

Written by `build` into `tasks/IMPL-<slug>.md`, once, before the first segment. **The ledger is the
state** — everything else about a segment lives in its own record, so the orchestrator's context stays
flat no matter how many segments run.

```markdown
## Segment ledger
- Source IDEA: `tasks/ideas/IDEA-<slug>.md` · provenance commit `<sha>`
- Checkpoint commits: yes, on branch `<name>` | no — <reason>
- Foreign uncommitted paths at start (never staged): … | none

| # | segment | depends on | DoD | status | contexts | record | evidence |
|---|---|---|---|---|---|---|---|
| S01 | <name> | — | 1,2 | done | 2/3 | `tasks/segments/<slug>/SEG-01-<name>.md` | `<cmd>` exit=0, 14 passed |

## Frozen interfaces
- S01 → `<symbol / route / schema>` at `path:line` — what a consumer may rely on.

## Integration checkpoints
- after level 1 (S01–S03): `<full recipe command>` — exit=0, <counters>

## Context ledger
- S01 executor — `sonnet`/`high` · 14 turns · S01 verifier — `sonnet` · 5 turns
```

`status` ∈ `pending` · `running` · `done` · `blocked` · `drifted`. A segment's own record —
`tasks/segments/<slug>/SEG-<nn>-<name>.md` — is written by its executor and holds the detail: what it
changed, the red-first tail, its check digests, its documentation edits. The orchestrator does not
read those records back; the capsule already told it everything the ledger needs.

## Segment brief

The brief is the only thing standing between a fresh context and re-reading the repository, so it is
assembled deliberately. It carries:

- the segment's goal and **its** DoD items, verbatim from the IDEA;
- the paths it may touch and the ones it must not — an explicit scope fence;
- the `Code map` slice for those paths, plus the conventions to mirror as `path:line`;
- the exact verification commands it may run, from the recipe Phase 0 derived;
- the `Frozen interfaces` slice it consumes;
- its record path, and the discipline it owes: red-first with the actual assertion tail, minimal edit,
  negative and boundary, documentation sync for what it falsifies, `Run output discipline` on every
  run;
- on a retry only: the previous attempt's failure digest.

Equally deliberate is what it leaves out: **never the whole IDEA**, never the ledger, never another
segment's record or diff, never raw run output, never the refinement dialogue. A brief that grows past
a slice is the signal that the segment was cut too wide.

## Segment capsule

The executor returns one `schema` capsule, near **1500 tokens** like every other delegated return:
status; changed paths; each DoD item closed with its `proof` — `red-first` plus the test file's
`git hash-object` hash, or `none` with the reason; check digests (command, exit code, counters, one
line per failure); the interface it published as symbol → `path:line`; the documentation it corrected
or the searches that found nothing affected; deviations from the plan; facts later segments need; and
any `[?:…]` it had to leave open. Never a diff, never a log, never its own reasoning.

## Budget

- **The orchestrator is one context for the whole run.** It holds the ledger, the frontier and the
  capsules — never a segment's code, never its record.
- The executor is **one fresh `Agent` context per segment**, dispatched sequentially: never a pool,
  never a context carried over from the previous segment.
- Spend **at most 3 contexts per segment** — the executor, one independent verifier, and at most one
  recon when the map slice for those paths is stale. Log it per segment as `S03 2/3`.
- Turn limits: executor `max_turns: 20` — it has to go red-first → implement → run → fix, which 12
  does not fit — verifier and recon `8`.
- Use **no `Workflow` at XL.** Two reasons, and both matter: a workflow script
  **cannot touch the filesystem**, so it could not write the ledger between segments, which is the
  very state that makes the run resumable; and a segment that would need fan-out inside itself is a
  segment that was cut wrong.
- There is **no global context ceiling** at XL, because the bound that matters here is per segment.
  Nothing in the run fans out without a bound, and the orchestrator's occupancy is flat in the number
  of segments — exactly the property a ten-segment run needs and a raised ceiling would not give.

## Failure and the ready frontier

A segment is *ready* when every dependency is `done`. Run one ready segment at a time.

- Checks still red at the end of a segment: **one retry**, same brief plus the failure digest and, if
  it helps, a narrowed scope. Still failing → mark it `blocked`, with the reason and the digest in its
  record.
- Then **carry on with the rest of the frontier**. A blocked segment blocks its dependents and nothing
  else; that is the difference between losing one segment and losing an afternoon.
- Stop and ask the user only when the **ready frontier is empty** and work remains. The global
  blockers stay global: a failed spike, the IDEA contradicting the code, a missing secret or access,
  an IDEA defect touching Scope or DoD — those stop the run when they appear.
- Never mark a segment `done` over a red check and never weaken a check to move on. A ledger that
  flatters the run is the same false report the framework forbids everywhere else.

## Integration checkpoints

A green segment proves itself, not the whole. After each DAG level completes — and once at the end —
run the full recipe. A failure there belongs to the level rather than to one segment: repair it under
the same one-retry rule and record it as a checkpoint line, not as a new segment. The frequency is
deliberate: running the full suite after every segment costs more than it finds, and skipping it until
the end finds the breakage after five more segments were built on it.

## Checkpoint commits

Hours of work in a single dirty worktree is one crash away from being lost, so intermediate commits
are allowed here — narrowly:

- only on a **branch dedicated to this task**: one this run created, or one the user confirms is
  theirs for this task — never on `main`/`master`, and never on a shared or mixed-purpose branch.
- **asked once**, before the first segment, with `AskUserQuestion`; the answer goes into the ledger and
  is not asked again mid-run.
- stage only the paths the segment declared plus its record — **never `git add -A`**. Paths already
  dirty when the run started are recorded in the ledger as **foreign** and are never staged.
- one commit per green segment, its message naming the segment. No push, no PR, no tag unless asked.

A "no", or a branch that is not dedicated, means no checkpoints: say it once, in one line, and
continue.

## Resume

Because the ledger is the state, a run continues after compaction, after `/clear`, and after an
outright interruption — re-invoking `/prorab:build <slug>` reads the ledger, confirms it belongs to
this IDEA, and continues from the frontier. Log `resumed: <n> done, <m> pending, <k> blocked`.

The rule that keeps a resume cheap: **never re-run a `done` segment**. Confirm instead that what it
published still exists — one `grep` per frozen interface, a deterministic step that costs no context.
A missing interface marks that segment `drifted`: it is a real blocker for its dependents, and it is
reported, never silently rebuilt. A ledger whose source IDEA no longer matches is not resumed at all; say so and stop.

## Cross-segment review

Per-segment review already happened inside the segment, against that segment's DoD. The final pass is
**cross-segment**: integration, coherence between the interfaces segments published and consumed,
scope creep against the IDEA's Scope-IN, and DoD completeness — every global item closed by exactly
one segment, with a recorded proof.

The **quality floor** does not move. The DoD skeptic still runs in a fresh context, over the aggregate
table instead of one diff; the verification profile's mutation budget applies to critical clusters
across the whole run rather than per segment; the full recipe still runs at the end. What is dropped
is only the re-reading: reviewing every segment's diff again at the end is how a segmented run turns
back into the one enormous review it was built to avoid.

## Several repositories

Supported **only when the user explicitly asks** for it. Then each segment carries `Repo:`, and every
declared repository must be an existing local checkout whose path the user gave. The run must
**never clone, fetch or create** a repository, and never touch one that was not declared.

Order **provider before consumer**: the repository that owns a contract runs its segment first, and
that contract lands in `Frozen interfaces` for the consumer's brief. Each repository keeps its own
verification recipe, its own branch and its own checkpoint answer, and the ledger keeps status per
repository. No cross-repository commit coordination and no PR chain — the report names what is left
uncommitted where, and the rest is the user's call.

## Stage handoff — each stage pays once

- **`refine` cuts, once**, from code it has already read, and writes the `Segment plan`. Its `Code map`
  entries carry the segments they serve, so a brief can be sliced later without opening anything again.
- **`build` executes and records.** The ledger is the only place per-segment state lives, and the
  aggregate DoD table it finalizes keeps the `proof` column — the same **coverage-evidence handoff**
  the single-run path produces.
- **`verify` needs no XL awareness.** It reads that same table, re-hashes the fresh proofs, and spends
  its budget on the behaviors nobody has checked. A segmented run is invisible to it, which is the
  point of keeping the table's shape.
- The bundle archives only when **every segment is `done`**; a `blocked` or `pending` segment keeps the
  IDEA, the IMPL and the segment records active, exactly as a partial single-run implementation does.
