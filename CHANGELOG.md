# Changelog

All notable changes to the prorab framework. Versions follow [SemVer](https://semver.org/).
The marketplace has **two plugins** with independent versions: `prorab` (the product track) and
`prorab-tech` (the tech-quality track). Each one's version lives in its
`plugins/<plugin>/.claude-plugin/plugin.json` and is duplicated in `.claude-plugin/marketplace.json`.
The entries below are tagged with the plugin they concern.

## prorab 0.17.0 · prorab-tech 0.12.0

**The round after the first one now has a lane.** `build` could finish a feature; it could not
absorb the sentence that always follows — *"the heading is too big on mobile, and going back drops
the filter."* Those remarks had two homes, and both were wrong. Ordinary chat messages after `build`
kept no record and re-read the code every session. `/prorab:quick` kept the discipline but is
forbidden by construction from linking to an IDEA or IMPL, so three rounds of the same conversation
became three unrelated `QUICK-*` files, each paying full recon, and the task's written history
forked. The gap was never about size — it was about **continuity**, and nothing in the framework
modelled it.

- **New `/prorab:revise` — the continuation lane.** Its input is what you checked and what should
  be different; its output is one complete iteration that leaves the repository green, because any
  round may be the last. It keeps `quick`'s floor exactly: the expected result stated in chat
  *before* the edit and taken **from your remark, never from what the code returns**, a red-first
  test where the behavior admits one, the project's own checks, the documentation duty, and one
  independent verifier. What it adds is inheritance — and what it deliberately does not add is a
  process to manage.
- **Continuity, not size, is what routes work here.** A one-line copy fix belonging to a task
  already built is a `revise`; a two-file change that continues nothing stays a `quick`. `quick`
  now says so in its own gate, as a **sideways** hand-off rather than an escalation: at its default
  tier `revise` is the same two contexts doing the same work, so the routing buys history and
  recon reuse, not budget.
- **Recon is paid once per task instead of once per round.** The `REVISION` carries the same
  hashed `Code map` an IDEA does — one format across `refine`, `build` and `revise`, rather than a
  third dialect of the same handoff. Every call re-hashes it with `git hash-object` first: all
  fresh → **zero** recon contexts and straight to the work; some stale → only those entries are
  re-read, logged as `map reused: <n> fresh, <m> stale`. IDEA/IMPL are re-opened only on a named
  trigger. One difference from the IDEA's map, in the right direction: these verification commands
  are recorded as **CONFIRMED**, because this lane actually ran them.
- **A ceiling instead of a tier ladder — the one design decision the whole command rests on.**
  S is 2 contexts, M is 6, and there is no L, no XL and no segmented run available at all. The
  spec this was built from allowed the full ladder up to 16; that would have made `revise` a second
  owner of heavy orchestration with a duplicate copy of the tier logic, and two releases later the
  copies drift. Past six contexts the work is a build, and the eligibility gate hands it to
  `refine` — as it does for a remark that is really a new capability, changes an external contract,
  or changes the security model. Ordinary large-but-continuous work is explicitly **not** a trigger.
- **One rolling `tasks/revisions/REVISION-<slug>.md` per task, and no state machine.** The
  `History` is **append-only** — one line per iteration carrying the remark, what changed, the check
  digest, the red-first test hash and the verdict — so a reversed decision is a new line, never an
  edit of the old one. Beside it: the `Invariants` later rounds may not break, and an `Open` section
  that is empty when nothing is unclosed. There is **no `status` field, no `done`, no `reopen` and
  no closing run**: an iteration's outcome lives in its own history line, and the absence of a next
  remark is what ends the process. No `iteration` counter and no stored baseline either — the
  position in `History` and the map's `Provenance` already say both, and a second copy only drifts.
- **The archive stays immutable, and the boundary is now explicit.** An active `REVISION` is
  mutable; `tasks/archive/**` is not. Archiving a bundle no longer implies the task is closed to
  further work — the revision links the archived IDEA/IMPL and never edits them, so the archive
  keeps saying what was true when the build finished. `revise` archives nothing, ever.
- **The rest of the track learned the artifact exists**, which is what keeps it a record rather
  than a fork in the history: `verify` accepts a `REVISION` as scope and treats it as the
  requirements *as they now stand* where it and the IMPL disagree, and reuses the red-first hashes
  from its history the way it already reuses a DoD table's proof column; `announce` reads it beside
  the IMPL and lets it win, because announcing an IMPL that two rounds have since reworked
  describes a version nobody shipped; `ask` reaches for it first on a "why does it behave like
  this" question; `build` names it as where remarks go once the user has looked at the result.
- **Foreign changes in the worktree stay foreign.** Each call snapshots `git status --porcelain`
  and keeps pre-existing dirt out of the iteration's diff, out of the verifier's input and out of
  the record — neither reverted nor absorbed. The verifier sees **this iteration's diff only**,
  never the task's accumulated one.
- Twelve contract tests pin the lane's load-bearing properties — the six-context ceiling and the
  absence of the segmented-run contract, one rolling record, no state machine, append-only history,
  hash-based reuse, pointwise staleness, evidence floor, archive immutability, and the fact that
  four sibling commands know the artifact by name.

## prorab 0.16.0 · prorab-tech 0.12.0

**A task too big for one run is now cut at its seams and executed one segment at a time.** The
framework could describe a large feature but not finish one. `refine` produced a flat IDEA — one
scope, one DoD list, the order of stages in prose — and `build` implemented it in a single run whose
orchestrating context had to survive from intake to the final report. On work spanning many
components, pages, or repositories that context is what breaks first: compaction takes the plan with
it, a thirty-item DoD table stops fitting beside the work, and one forty-file diff reviews worse than
ten four-file diffs. Raising the 12/16-context ceiling would have bought **more of exactly what
degrades**, so this release changes the shape of the run instead of its budget.

- **New tier `XL` — a topology, not a bigger number.** It is the one tier whose cap is not
  cumulative: the orchestrator is a single context for the whole run and holds only the ledger, each
  segment gets **at most 3 contexts** (executor, one independent verifier, at most one recon), and no
  run-wide ceiling applies because nothing in the run fans out unbounded. Selected by the triage, or
  pinned with `--tier=XL`; `--tier=L` pins the old single-run shape even for an IDEA that carries a
  segment plan. Deliberately **not** a new command — the same `refine → build` pair keeps the task.
- **New `references/segmented-run.md`**, loaded **only** by `refine` when the idea shows XL signals
  and by `build` when its triage selects XL, so an ordinary idea never pays for it — the same
  conditional shape `web-probing.md` established. It holds the whole method: seam discipline, the
  `Segment plan` and ledger templates, the brief and capsule contracts, the per-segment budget,
  failure handling, checkpoint commits and resume.
- **`refine` cuts once, and only where a seam actually exists.** A new Phase 3.5 cuts the idea before
  settling it, from code it has already read — no extra `Explore` context, its two-context cap
  unchanged — and puts the order to the user in one `AskUserQuestion` round. A cut may never split a
  coherent edit, a contract change from its call-sites, or a DoD item from its test; every DoD item
  belongs to **exactly one** segment; every segment leaves the repository green and names the
  interface it publishes for later ones. **If the work has no such seam, it is not XL** — it is an
  idea still under-decomposed, and the honest answer is one more refinement round, never a forced
  shard of coherent work. An unresolved `[?:…]` inside a segment blocks that segment only.
- **`build` executes from a ledger on disk, which is what makes a multi-hour run possible at all.**
  Phase 3X materializes `tasks/IMPL-<slug>.md` as the run's state — the segment table with per-segment
  status, the interfaces each segment froze, the integration checkpoints, a per-context usage journal
  — then runs the ready frontier one segment at a time, each in **one fresh `Agent` context**
  (`max_turns: 20`, because a segment has to go red-first → implement → run → fix). Per-segment detail
  goes to `tasks/segments/<slug>/SEG-<nn>-*.md`, written by the context that implemented it; the
  orchestrator never opens a segment's diff and acts on the capsule and the digests. **Because the
  ledger is the state, the run survives its own context**: after compaction, `/clear` or an outright
  interruption, re-invoking `/prorab:build <slug>` continues from the first unfinished segment, logs
  `resumed: <n> done, <m> pending, <k> blocked`, and greps each finished segment's published interface
  to catch drift. A `done` segment is never re-run.
- **No `Workflow` at XL, and that is a design constraint rather than an omission.** A workflow script
  cannot touch the filesystem, so it could not write the ledger between segments — the very state the
  resume depends on. And a segment that would need fan-out inside itself is a segment that was cut
  wrong: the fix is a better seam, not an escape hatch.
- **A failed segment costs a segment, not the afternoon.** One retry with the failure digest in the
  brief, then `blocked` with its reason recorded, and the run carries on with the rest of the frontier;
  a blocked segment holds up only its dependents. The command stops and asks the user when the ready
  frontier is empty and work remains — the global blockers (failed spike, IDEA contradicting the code,
  missing secret, an IDEA defect on Scope/DoD) still stop it the moment they appear. Never `done` over
  a red check.
- **The evidence floor does not shrink when the work is cut smaller.** Each segment keeps the red-first
  discipline and its own independent verifier; the full recipe runs at each completed DAG level instead
  of after every segment (which costs more than it finds) and once at the end. The final review becomes
  **cross-segment only** — integration, coherence of published-and-consumed interfaces, scope creep,
  DoD completeness — because re-reviewing every segment's diff at the end rebuilds the single enormous
  review that segmenting exists to avoid. The DoD skeptic still runs in a fresh context, over the
  aggregate table, and the mutation budget applies to critical clusters across the whole run.
- **Checkpoint commits, narrowly.** Hours of work in one dirty worktree is a crash away from being
  lost, so `build` may commit after each green segment — **only** on a branch dedicated to this task
  (one it created, or one the user confirms), never on `main`/`master`, asked **once** before the first
  segment and recorded in the ledger. It stages only the paths that segment declared, never
  `git add -A`, and paths already dirty at the start are recorded as foreign and never staged.
- **Several repositories, only when the user explicitly asks.** Each segment then carries `Repo:`,
  every declared repository must be an existing local checkout the user named, and the run must never
  clone, fetch or create one. Provider before consumer: the repository owning a contract runs first and
  the contract lands in `Frozen interfaces` for the consumer's brief. No cross-repository commit
  coordination or PR chain — the report says what is left uncommitted where.
- **`verify` needed no change.** The aggregate DoD table keeps the `proof` column, so the
  coverage-evidence handoff works exactly as before: `verify` re-hashes the fresh proofs and spends its
  budget on behaviors nobody checked. A segmented run is invisible to it, which is the point.
- **Fourteen new contract tests**, written before the prose they check, lock the parts that would decay
  quietly: that XL is detected from seams rather than size, that the seam rules forbid the three
  splits, that state lives on disk and a `done` segment is never re-run, that a brief is a slice and
  never the whole IDEA, that checkpoint commits need a dedicated branch, and that the method stays in
  the product track and is loaded only conditionally.
- **What this release deliberately does not do.** Segments run sequentially — parallel segments remain
  available only explicitly and only with worktree isolation, since two agents editing one tree clobber
  each other. There is no segment limit per invocation and no forced hand-back: the run continues while
  ready segments remain. Proposal 22's pre-dispatch byte estimation is still not implemented; what now
  exists is its "split by seam" half, applied at idea level where a seam can still be chosen honestly
  instead of imposed on an executor already mid-run.

## prorab 0.15.0 · prorab-tech 0.12.0

**A web UI is driven headless by default — the model authors the session instead of watching it.**
`/prorab:verify` shipped telling the prober to use "a browser-automation tool available in the
session", which in practice meant an interactive visual session: look at a screenshot, decide, click,
look again. There the **model is the driver**, so every step is a round-trip carrying an image and one
consumer flow costs tens of them. That was the slow half of verification, and the fix is to change
who drives: the model now authors a consumer session once, runs it with a single command, and judges a
structured result.

- **New `references/web-probing.md`**, loaded **only** when a command's scope actually has a browser
  surface, so a change without one never pays for it. It carries a four-level ladder — **L0** no
  browser at all when HTTP/CLI/data can answer, **L1 the default** headless run asserting on roles,
  labels, visible text, URL, response status and **measured layout** (clipping as
  `scrollWidth > clientWidth`, overlap as intersecting boxes), **L2** one element-clipped screenshot
  where the requirement is genuinely perceptual, **L3** an interactive visual session only on a named
  trigger that gets logged. Every verdict records its level, and an unlogged L3 is how the contract
  would silently decay back into the slow default.
- **Faster, and deliberately stronger — that is why it can be the default.** A screenshot after
  clicking *Save* shows a toast; a script reloads the page and re-reads the resource, which is what
  actually proves data was stored. So a headless run **must** capture persistence by independent
  re-read, the write request's own status, console errors and unhandled rejections, failed requests,
  and the documented refusal for a negative case with the failure *injected* by route interception —
  a line of code here, impractical by hand.
- **Locators are user-facing only** — role and accessible name, label, visible text, or a
  `data-testid` the project itself publishes; never a class hash, internal id, XPath or a selector
  lifted from source. Authoring a script is the one moment a blind prober is tempted to open the
  implementation "just for a selector", so the rule protects blindness and tests-like-a-user with the
  same sentence, and the script's locators join the blindness declaration. A handle that cannot be
  found by its user-facing name is a labelling finding, never a reason to read the code.
- **Each stage pays once.** The commands run in sequence, so the method lives in one contract while
  each stage owns a different slice and records what the next would re-derive — the handoff pattern
  already used by `refine → build` and `build/quick → verify`. `refine` records
  `Web surfaces OBSERVED` in its `Code map` (the code-aware half, captured where code is already being
  read, and it loads no contract because it drives no browser); `build` and `quick` record the runner,
  its exact invocation and the base URL that worked; `verify` reads that recipe instead of rediscovering how to
  reach the app and logs `web recon reused: <n> fresh, <m> stale`. Blindness survives because the
  main loop passes only a base URL and user-facing handles into the charter — no path, symbol or
  selector crosses over.
- **The install promise is narrowed, not dropped.** `Install nothing` becomes **install nothing into
  the project**: manifests and lockfiles untouched, the runner in a run directory outside the working
  tree, and anything that must be fetched is **asked about first**, once, with the answer recorded so
  a later stage does not ask again. The cheapest non-project path needs no download at all —
  `channel: 'chrome'` drives an installed Chrome — and cached engines are explicitly *not* proof no
  download is needed, since a fresh runner pins a specific engine build. A provisioned runner
  produces **evidence, never project coverage**: it is not a test level and its script is never
  smuggled into the repository as the missing regression test.
- The shipped skeleton was **executed before being documented** — 5 items in 1.6 s on an installed
  Chrome with no engine download, catching a real clipping defect numerically and a console error the
  UI never showed. Writing it surfaced three rules now in the contract: wait for state instead of
  reading straight after a click, name every created entity uniquely or a re-run collides with
  itself, and prefer a state-independent oracle ("the count is unchanged") over one that assumes a
  clean database.

## prorab 0.14.0 · prorab-tech 0.12.0

**A check that the shipped thing works for the user — run by a context that has not seen the code.**
Everything the framework verified so far was verified from the inside: `build` proves its code matches
a DoD with tests its own author wrote, `refactor` proves old behavior survived, `lint-fix` proves a
gate holds. All three look at the implementation while designing the check, and a check designed with
the code in view inherits the code's assumptions and then confirms them. The README even conceded the
gap out loud — "reviewing changes, run/smoke, commit/PR follows project practice" — which meant the
one question a user actually asks, *does it work*, was the one step with no discipline attached.

- **New `/prorab:verify`:** black-box verification of implemented functionality against the
  requirement, plus proof that the project's tests would catch it breaking. It writes **no product
  code** — the only code it writes is test code, and a confirmed defect is routed to `quick`,
  `refine`+`build` or `refactor` with its reproduction recorded so the fixing command starts red.
- **Blindness is structural, not a promise.** The main loop is code-aware by necessity (it reads the
  diff to find the surfaces), so the probing context is delegated at **every** tier, S included — a
  context that has already read the implementation cannot un-read it. The prober receives a charter of
  surfaces, preconditions and expected results carrying no path, symbol, diff or implementation hint,
  and must return a **blindness declaration** of every file it read and command it ran. An
  implementation file in that declaration drops the affected items to `not independently verified`;
  they are re-probed or reported at that grade, never laundered into `works`.
- **The oracle is the requirement, never the system's own output.** Expected values come from the
  DoD/spec/product documentation/the user's words, or from a recomputation that does not reuse the
  feature's code path; where no literal value is derivable, from a metamorphic invariant (permutation,
  round-trip, idempotence, monotonicity) as `refine` already defines for a DoD. When the only
  available source is the implementation itself, the item is `oracle: none` — the user is asked, and
  it stays `unverifiable` rather than becoming a pass.
- **Scope is derived by command, then asked about.** `git status --porcelain`, the branch against its
  merge base, `git diff --name-only`/`--stat` and the latest active IMPL/QUICK produce concrete
  candidates; genuinely undetermined scope (uncommitted work and branch commits describing different
  features, HEAD on the default branch with no feature boundary, an empty change set, several equally
  matching artifacts) goes to one `AskUserQuestion` round with named candidates, not a vague "what
  should I check?".
- **Honest verdicts with grades.** Per behavior: `works` / `broken` / `differs` / `unverifiable`, each
  with `observed` (the real surface driven against the charter's oracle) or `proxy` (the project's own
  harness) — "no error", a screenshot with no compared value, or a pass resting on the system's own
  output is **downgraded**, not accepted. A defect is confirmed to reproduce once before it is
  reported, so a flake is not announced as a bug. `differs` names both readings — stale code or stale
  requirement — and leaves the product decision to the user.
- **Coverage means a test that can fail.** For each verified behavior: grep the test tree for the
  surface's own names, grade the candidate `covered`/`weak`/`absent`, and prove it profile-bounded by
  injecting one plausible regression in a temporary isolated worktree. Not red → `weak`, however
  convincing the test reads. **Red-first does not apply to a test over already-working behavior, and
  its substitute is mandatory:** the mutation is what proves the new test is worth anything, and an
  unprovable test is not counted as coverage. Expected values come from the charter — a test written
  by observing today's output is a golden snapshot, not a check.
- **Coverage evidence is never paid for twice.** The test-quality rules `verify` needs already exist in
  the product track, and so does most of the evidence: `build`'s right-reason red and its sabotage
  probe, and `quick`'s red-first, are *already* proofs that a given test can fail. Re-proving them from
  `verify` would be the same work billed twice. So both producing commands now record the proof they
  already have — `build`'s Scope/DoD re-grounding table and `quick`'s DoD table gain a `proof` column:
  `red-first` | `mutation` | `none` (with the reason), plus the test file's `git hash-object` hash. It
  costs one column. `verify` re-hashes those entries and marks a fresh one `covered (reused)`, citing
  the artifact and spending nothing; a changed hash, a `none`, a missing column or a behavior the DoD
  never stated is what it actually works on. The saving is banked rather than respent, and the same two
  bounds `build` puts on a reused `Code map` apply: a matching hash proves the file is unchanged, not
  that the test asserts *this* charter item, and a reused proof never upgrades a behavior's own
  verdict, which comes from the blind probe alone.
- **The same rule for runs:** the targeted tests for anything `verify` wrote always run, but an
  identical full-suite run on an identical tree (same `HEAD`, same `git status --porcelain`, no test
  changed) is **cited** from the upstream digest instead of paid for again — and the report says that is
  what happened.
- **Deliberately not extended to the tech track.** `refactor` and `lint-fix` prove a different thing
  (old behavior survived, a gate holds), and a change with no user-visible surface is routed *back* to
  them by `verify`'s own scope reduction — so a handoff there would be two more heavy-file edits and a
  version bump for near-zero reuse. `prorab-tech` is unchanged at `0.12.0`.
- **Instruments are discovered, never assumed:** HTTP/API, UI through the project's own driver or an
  available browser tool, CLI, independent data recomputation, exports opened as a consumer opens
  them, config/text products applied in dry-run/validate mode, observability as support only. Nothing
  is installed and no command is invented; an unreachable item is `unverifiable` with the missing
  prerequisite named.
- **Safety limits fixed in the command:** read-only by default, mutating probes only against a
  local/dev/test environment on a marked scoped entity, **never against production**, never real money
  or a message to a real person; no credentials, tokens or document numbers typed anywhere — a probe
  needing authentication asks the user; no protection bypassed and no check disabled to make a probe
  pass.
- **Bounded like the rest of the framework:** the same 2/6/12 tiers with the absolute 16 ceiling, the
  same `--fast`/`--thorough`/`--tier=`/`--verification=` overrides, `max_turns` 6/8/12, one prober per
  *instrument boundary* rather than per assertion, and evidence files (response bodies, logs,
  screenshots, query results) written outside the working tree and cited by path so they neither fill
  a context nor get committed.
- **One compact record, nothing archived:** `tasks/verify/VERIFY-<slug>.md` with the adopted scope,
  the verdict table, defects and their routing, the coverage table, check digests and what stayed
  unverified — written into an already-archived task's directory when the scope has one, as `announce`
  does. `verify` archives nothing and creates no IDEA/IMPL.
- **Contracts loaded: `project-knowledge` and `execution`, deliberately not `documentation-sync`.** It
  changes no behavior, so it falsifies no document; a document contradicting observed behavior is a
  **finding it reports**, not a document it rewrites. The contract test now locks that third category
  — a command that runs checks and writes tests but no product code.
- **Partly covers proposal 15** (`/prorab:check`): the outside-in half — behavior against the
  requirement, plus test coverage of what was verified — now exists. The artifact-side half (Scope
  IN/OUT reconciliation, per-DoD-item bookkeeping, unclosed `[?:…]`) still waits on the formal
  artifact schema.

## prorab 0.13.0 · prorab-tech 0.12.0

**A command loads only the contracts it can act on, and stops re-teaching what it already has.** A
measurement of every command's actual input found ~3.9k tokens of near-duplicate paragraphs across
the nine command files, one rule stated three and four times inside a single file, and — the largest
single item — a shared reference read in full by commands that could not use two thirds of it. None
of it was load-bearing: no tier, cap, floor, DoD rule or gate rule changed in this release.

- **The shared reference is split in three, per plugin.** `project-knowledge.md` keeps what every
  command needs — language, source-of-truth order, memory layout, recall/capture, the archive
  lifecycle, and `Delegated context returns`. `execution.md` takes the other two occupancy limits
  (`Run output discipline`, `Main-loop discipline`) plus `Deterministic steps`, and is loaded by the
  six commands that actually run checks or analyzers. `documentation-sync.md` is loaded by the four
  that change code. `ask`, `announce` and `refine` load neither of the last two, so they no longer
  carry rules they are forbidden to act on: **`ask` −33 %, `announce` −27 %, `refine` −21 %** of the
  tokens they load. `audit` and `lint-audit` skip documentation sync: **−8 % each**. A new test locks
  the wiring in both directions — a runner must cite `execution.md`, a read-only command must not.
- **The `Language` rule moved into the shared contract.** It was five near-verbatim copies plus three
  variants (709 tokens of pure duplication) saying the same thing: reason in English, write everything
  a human reads in the task's language, never round-trip a domain term. It is now stated once, and a
  command adds only the clause specific to it — `announce`'s "terms strictly as in the app's UI",
  `refine`'s dialogue surfaces, each executor's artifact. The four repeated "the template below is in
  English for reference" blockquotes are covered by the same sentence and gone.
- **The `Workflow-pattern cheatsheet` sections are removed** from `build`, `audit`, `refactor`,
  `lint-audit` and `lint-fix` (~1.4k tokens). They re-taught the `Workflow` tool's own documentation,
  which is already in the same context — pipeline by default, a barrier only when the next stage needs
  every result, worktree isolation being expensive, `phase()`/`log()`, `schema` returns, logging a
  bounded sample. Worse than redundant: a second copy of someone else's docs is a copy that can drift
  out of agreement with them. Everything they said operationally is still said where it applies, in
  Principles and in the phase that acts on it.
- **A rule now appears at most twice** — once in the contract, once in the step that acts on it.
  `digest` was stated four times in `build` and four in `lint-fix`, `used/cap` four times in `build`,
  the mutation-worktree rule five times; the "≈1500-token capsule" figure lived in all nine commands
  *and* both references, eleven places for one number. The inline restatements of
  `Documentation sync` in the four executors are one pointer each now, keeping only the
  current-state-versus-historical line that carries the actual decision.
- **Three real defects, found by the same read.** `lint-fix` derived its tier from "the batch tier tag
  + violation count", twenty lines after declaring the plan's violation counts a stale snapshot that
  must be re-run — the tier now comes from the batch's durable properties, and a fresh count that
  moves the size band adjusts the tier and is logged. `refactor` said "take the tier from the AUDIT
  spec"; the AUDIT template records `blast_radius`/`coverage_nearby`/`risk_hint` and the safety-size
  scoring, never a tier, so it now says to derive it from those inputs. And `refine`'s `max_turns: 8`
  and third context, which every other non-Workflow command sets to 6 and 2, are no longer an
  unexplained divergence: the reason (a many-round dialogue main loop that cannot be replaced) is
  written down.
- **Frontmatter descriptions trimmed** from 793 to ~660 tokens. Those nine lines are loaded into every
  session whether a command runs or not.
- **Net effect, measured per command** (body plus the contracts it loads): 74.1k → 67.7k tokens across
  the nine, with the cheap read-only lane cutting a third. The heavy executors move least (−1 to −3 %)
  because their bulk is the Phase 0.5 budget machinery, which is command-specific prose that
  compressing further would mean rewriting rather than de-duplicating — deliberately left for a
  separate pass, as were the `What NOT to do` sections, where roughly half the bullets restate the
  body but the negative framing is what keeps a skeptic honest.

## prorab 0.12.0 · prorab-tech 0.11.0

**A second budget axis: a tier bounds how many contexts open, not how full each one gets.** The
S/M/L caps have always counted *contexts*. They say nothing about occupancy, and the two are
independent — twelve contexts each stuffed to the brim is a legal L run and a bad one, because a
context filled with material nobody reads judges worse than one given the range that matters. A
measurement made the priority obvious: the fat is not the set of files an executor is given (a
well-scoped node reads a small fraction of what fits), it is the **tail of tool output** inside it.
One failing suite or one first lenient analyzer run can cost more context than the entire task.

- **New shared contract — `Context hygiene`** (in both `references/project-knowledge.md` files),
  with three limits that hold at every tier. **Run output discipline:** raw output from a test suite,
  linter, typechecker, build or migration never enters a model context — it is captured to a file
  outside the working tree (`>"${TMPDIR:-/tmp}/prorab-run.log" 2>&1`, never committed) and read back
  as a digest of ~40 lines: the exact command, its exit code, the run's own counters, and one
  identifying line per failure. Ten failures of one class become one example plus a count; a specific
  failure is grepped out of the file on disk when it needs detail. **Delegated context returns:** one
  `schema` capsule of roughly 1500 tokens — claims plus `path:line`, symbol or command pointers,
  never file contents, a full diff or raw output, and an oversized return is not forwarded verbatim
  into the next prompt. **Main-loop discipline:** above the smallest tier the orchestrator holds the
  artifact, the plan, the status table, the received capsules and the `used/cap` ledger, while the
  bulk reading happens in delegated contexts.
- **Compaction never buys silence.** The exit code and the failure/violation counts are always
  reported in full: shortening *what* failed is allowed, concealing *that* something failed is a
  false report. A run is judged by exit code **and** counters, never by an `OK`/`passed` string, and
  `passed` with ~0 collected stays a finding. The honest-report invariant outranks the budget.
- **Two deliberate exceptions, because the source-of-truth order outranks a tidy context.** Above
  tier S the main loop may still open a **named, narrow range** of current source when a capsule
  claim materially drives an external-contract or behavior decision, and it reads the digest of any
  run it ordered. A sweep is not a narrow range. And at **tier S the main loop *is* the executor** —
  reading, editing and running the checks there is the intended shape of the cheap lane, so `build`
  and `refactor` say so explicitly and `quick` states outright that the main-loop rule does not
  apply to it. This resolves a real contradiction: `build` demanded a clean main loop while also
  telling it to read key stretches, edit tightly coupled code and run the full suite itself.
- **New shared contract — `Deterministic steps`.** An enumerable fact is established by a command,
  not by a model reading around for it: `git hash-object` for content identity, `git rev-parse HEAD`
  for the commit, `git status --porcelain` (untracked included) or `git diff --name-only <base>...HEAD`
  for the change set, `git diff --stat` plus per-file `git diff` for a scope review's diff class, and
  a `grep` per touched symbol for documentation reach — where an empty result *is* the evidence that
  nothing was affected. A repository's own command for one of these always wins. Each such step is a
  step that costs no context at all.
- **Wired into all nine commands, each where its bulk actually is.** `lint-audit` gets it hardest,
  because its entire input *is* analyzer output; `lint-fix` takes its before→after `N→0` counts from
  two digests of the same invocation rather than from an impression; `refactor` reduces the
  differential run to the compared input set, the divergence count and one line per divergence
  instead of two output dumps; `build` applies it to the red-first run and to the full Phase 4
  recipe, its bulkiest output; `audit` to the read-only tool runs it lives on; `quick` because two
  contexts is all it has and one failing suite can spend one of them. `refine` is the one context
  that genuinely cannot be split — a dialogue with a human in it — so it keeps capsules and the
  unclarity map between rounds instead of file contents.
- **Measured, not estimated.** The figure in `IMPROVEMENT-PROPOSALS.md` (4.5–5.5k input tokens per
  heavy command) was too low: `build` is ~9.2k, `refactor` ~9.1k, `lint-fix` ~8.4k, plus ~3.3k of
  shared reference — 10–12.5k before the first file is read. The same measurement corrected a second
  belief worth recording: a delegated subagent does **not** receive the command body, only its brief
  (1–2k), so that preamble is the *main* context's cost, not each executor's. Proposals 7 and 16 move
  to `◐`, and 16 to P0, since this release implements their contracts but not an executable wrapper.
- **What this release deliberately does not do.** It bounds occupancy; it does not yet *estimate* it
  before dispatch or split an executor that would exceed it. Those are new proposals 21 (a per-context
  usage journal, needed to calibrate any threshold by fact rather than assertion) and 22 (pre-dispatch
  estimation with three outcomes — fits, split by seam, or return to `refine` for decomposition,
  never a forced shard of coherent work). 22 depends on 21.

## prorab 0.11.0 · prorab-tech 0.10.0

**Documentation stops drifting away from the code, and `quick` stops being invisible.** Two changes
with one motive: the written state of a project should not silently fall behind what the code does.

- **New shared contract — `Documentation sync`** (in both `references/project-knowledge.md` files).
  A command that changes code now **owns the documentation that change falsifies**; a stale document
  left behind is an incomplete change, not a follow-up, and it counts against the command's own
  completion condition. The dividing line is what a file is *for*: *current-state* documents (README,
  `docs/`, the spec, API/configuration references, runbooks, `CLAUDE.md` and other agent guidance,
  docstrings, comments, `--help` text) are corrected in place; *historical* documents
  (`CHANGELOG.md`, release notes, ADRs, migration notes, `tasks/archive/**`, completed task
  artifacts) are **never** rewritten to match new code — a new entry may be added where the project's
  convention calls for one, but a past entry stays as it was written.
- **Bounded on purpose.** The duty covers only what the change makes *factually wrong* — a renamed
  symbol or path, a changed default, flag, signature, limit, format or command, an example that
  would now behave differently, a step that no longer exists. Style rewrites, pre-existing gaps,
  restructuring, and corrections needing a product decision are **reported with a follow-up named**,
  not absorbed into the diff. A correction larger than the code change itself is reported, not made.
  And "nothing was affected" must be earned by searching the docs for the symbols, paths, flags and
  literal values the change touched.
- **Wired into every executor, each where it belongs.** `build` corrects docs as tasks land (Phase 3)
  and discharges the duty explicitly during Phase 4 re-grounding — a current-state document still
  contradicting the diff is a *finding of that phase*. `refactor` gets the case behavior preservation
  would otherwise excuse: a rename or a moved module leaves docs wrong even though nothing observable
  changed. `lint-fix` gets the case that matters most for it — the documented way to run the checks
  and the documented strictness bar must match the gate that now exists, and a pre-C preparatory
  batch must not describe a gate it has not created. In all three, scope-creep review was taught the
  distinction: a *declared* documentation edit is not creep, an undeclared or over-wide one is, and a
  rewritten historical document always is.
- **`quick` now leaves one compact artifact — `tasks/quick/QUICK-<slug>.md`.** Previously it wrote
  nothing at all, which kept it cheap but made small changes invisible to `ask`, to a later `audit`,
  and to anyone reading the project's history. The record holds what changed and why, the DoD table,
  the exact checks and their real results, the documentation corrected, and the verifier's verdict.
  It costs one `Write` in a context `quick` already has — no new context, no Workflow, no archive,
  still no IDEA/IMPL. Slug collisions use the same deterministic `-2`/`-3` suffix as the archive
  protocol and never overwrite.
- **The artifact is a floor, not an IMPL.** It is capped at about a screen — if the change can't be
  stated honestly in that space, the eligibility gate should have fired, so the size of the record is
  itself a signal. A run that escalates *after* already editing files still writes the record with
  `status: escalated`, naming what is half-done and which command takes over; a run that escalates
  before touching anything writes nothing. An abandoned edit with no record was exactly the
  divergence this change is meant to prevent.

## prorab 0.10.0 · prorab-tech 0.9.0

**The tech track gets its own handoff — shaped by what each pair actually wastes.** `prorab` is
unchanged in this release. This entry **supersedes the "not covered yet" note below**: the structural
pair does need the hashed handoff, and it buys more safety than tokens; the static pair does **not**,
because its numbers go stale by construction and re-probing them is a deterministic command that
costs almost nothing.

- **`audit` records provenance (structural pair):** the #1 candidate spec now carries the recorded
  commit plus `git hash-object` hashes of the target files, the test files its net status rests on,
  and the call-site files — a caller can change while the target stays byte-identical, which would
  otherwise invalidate the blast-radius claim invisibly.
- **`refactor` checks that provenance in Phase 0, before choosing a tier** — deliberately earlier
  than recon, because the tier depends on it. `refactor` previously took `safety`,
  `coverage_nearby`, `blast_radius` and the size/confidence scoring straight from the AUDIT and was
  told not to re-derive them, so a month-old audit silently set the budget and the safety assessment
  of a behavior-preservation change. Now staleness is explicit and typed: a stale **target** makes
  the candidate obsolete unless the smell is re-confirmed in current code (not a blocker — a
  finished candidate, with the next one offered); a stale **test** file voids the coverage claim and
  forces a from-scratch net assessment in Phase 1.5; a stale **call-site** file voids the blast
  radius. Any staleness at all means the tier is re-derived rather than inherited.
- **`refactor` reuses only the fresh part of the map:** fresh paths are adopted as the Phase 1
  result at zero recon cost, recon is scoped to the stale ones and to call-sites that were never
  hashed, and the saving is banked rather than respent. Freshness is explicitly **not** evidence of
  equivalence — the net green on the OLD code, the contract diff, and at least one drift/differential
  run remain mandatory.
- **`lint-audit` hands over commands, not counts:** the plan now records each analyzer invocation
  verbatim as run read-only, the net commands, and the gate entrypoint (config path + the command
  that runs it), with the probe date and commit. The violation counts are labeled a snapshot, not a
  handoff.
- **`lint-fix` reads the previous completed batch:** the gate state to tighten or expand comes from
  the most recent completed `IMPL-lint-*-batch-*.md` of the plan rather than being rediscovered,
  since that batch is what last changed it. Recorded commands are pointers that save the search and
  are still re-run — a recorded command is never proof it works now — and every batch still takes
  its own baseline count.
- **No new tech-track command, deliberately.** `refactor --tier=S` is already two contexts with no
  Workflow and already runs without an AUDIT, and `lint-fix` is already one batch at a time, so a
  "quick" analogue would only drop the IMPL artifact — which on a behavior-preservation track *is*
  the record of what equivalence evidence was produced. Both commands now point at `--tier=S` as the
  intended cheap lane instead.
- **`/clear` handoff in both audits,** with the reason stated: the command that judged a candidate
  safe should not also be the one proving nothing drifted, and the recorded provenance/invocations
  are what make the fresh context nearly free.

## prorab 0.10.0 · prorab-tech 0.8.0

**A cheap lane for small changes, and a recon handoff so `build` stops re-studying the code.** Both
changes target the same cost — the duplicated work and the fixed ceremony around a small task —
without touching the quality floor of the heavy path. Deliberately *not* done: merging `refine` and
`build` into one command. Prompt-body deduplication saves under 1% of a heavy run, while carrying the
refine transcript into build's phases costs more context than it saves, unfreezes the DoD before the
implementation exists, and turns the final Scope/DoD re-grounding into self-assessment by the author
of the idea. The saving people expect from merging is the recon reuse below, which does not require
it.

- **`Code map` handoff in the IDEA (proposal 11):** `refine` now records what it *already* read —
  files studied with their role and a `git hash-object` content hash, reuse points, change points,
  contracts at risk, conventions to mirror, honest "not studied" gaps, and observed-but-unrun
  verification commands. Bookkeeping only: it is never a reason to widen recon or spend another
  `Explore` context.
- **`build` reuses only a provably fresh map:** it re-hashes the listed paths and compares. All
  fresh → zero recon contexts spent; partly fresh → recon scoped to the stale entries and the
  declared gaps; no map, no hashes, or a non-git project → normal recon. Saved contexts are banked,
  not respent, and progress logs report `recon reused: <n> fresh, <m> stale`.
- **Trust stays bounded:** a matching hash proves the file is unchanged, not that `refine` read it
  correctly, so a map claim that drives an external-contract edit is still opened in current source.
  The observed-commands line is a hint; the verification recipe is still derived and confirmed in
  Phase 0. A missing or malformed map is a lost saving, never a blocker.
- **New `/prorab:quick` (proposal 12):** a standalone short command for a 1–2 file everyday change —
  no IDEA/IMPL, no archive, no `Workflow`, at most 2 model contexts (itself plus one independent
  verifier with `max_turns: 6`). It keeps the evidence floor: a DoD stated as `input → expected`
  before any edit, a red-for-the-right-reason test (`AssertionError`, not `ImportError`), the
  project's own check commands, and a verifier that defaults to refuted-if-in-doubt.
- **`quick` cannot quietly do a big task:** an eligibility gate is checked before editing and again
  after locating the code. An external contract, more than ~2–3 files or one layer, two incompatible
  readings, security/auth/payment logic, behavior-preserving restructuring, or a missing
  secret/access forces a handover to `/prorab:refine`+`build` or the tech track. A second confirmed
  verification round also escalates instead of grinding.
- **Explicit fresh-context handoff:** after saving an IDEA, `refine` names the next step —
  `/clear`, then `/prorab:build <slug>` — and explains that the fresh context is what keeps build's
  DoD check independent, or routes a genuinely tiny remainder to `/prorab:quick`.
- **Contract tests extended** for the hashed handoff, the reuse/staleness rules, and `quick`'s
  bounds, gate, and evidence floor.
- **Not covered yet:** the same recon handoff for `audit → refactor` and `lint-audit → lint-fix`;
  the tech track is unchanged at `prorab-tech 0.8.0`.

## prorab 0.9.0 · prorab-tech 0.8.0

**Built-in project memory and a structural archive for completed work.** Both tracks now recall
small task-specific knowledge digests, verify material claims against current evidence, capture only
durable cross-task facts, and physically separate completed task bundles from active artifacts.

- **Transparent Markdown memory:** lazily created `tasks/memory/INDEX.md` plus small component,
  decision, gotcha, and verification entries. Each entry records type/status, verification dates,
  artifact/current-path evidence, confirmed facts separately from inference, and invalidation
  conditions. No init step, external service, embeddings, model, daemon, or transcript storage.
- **Current evidence remains authoritative:** worktree → repository instructions/docs →
  tests/CI/executable evidence → task artifacts → memory. Exact path/symbol/component/domain matches
  precede broader search; material recalled claims are reopened in current source and stale or
  conflicting entries are updated, superseded, or marked stale.
- **Automatic lifecycle integration:** `refine`, `build`, `audit`, `refactor`, `lint-audit`, and
  `lint-fix` capture only durable knowledge after their own success condition. `announce` consumes
  already-verified facts and normally captures nothing.
- **New `/prorab:ask`:** compact read-mostly answers for current structure/behavior, historical
  decisions, consumers, and verification. It searches memory plus active/archive artifacts,
  verifies current claims in code/docs, uses Git history for historical questions, and separates
  current, historical-only, and unverified statements.
- **Completed product bundles:** after Scope/DoD and mandatory verification pass, `build` moves the
  linked IDEA+IMPL(+existing ANNOUNCE) to `tasks/archive/<YYYY>/<task-slug>/`. `announce` finds
  archived sources and saves beside them without restoring active copies.
- **Safe structural edge case:** a completed candidate from a multi-candidate AUDIT gets a scoped
  archived AUDIT snapshot with its IMPL; the original AUDIT remains active until its other
  candidates are completed.
- **Truthful static ladder:** each successful lint batch has a uniquely linked IMPL artifact. A
  partial ladder remains active; only a completed or explicitly closed ladder moves its LINT and all
  linked batch artifacts into one archive directory.
- **Archive safety and compatibility:** explicit artifact identity checks, exact paths, traversal
  rejection, deterministic conflict suffixes, no overwrite, link updates, destination re-read, and
  a moved-file report. Legacy active artifact names remain readable and archive is never selected
  as active work by default.
- **Bundled shared contracts:** each plugin ships one `references/project-knowledge.md`, avoiding
  repetition across command bodies without relying on files outside the installed plugin.

## prorab 0.8.0 · prorab-tech 0.7.0

**Risk-based verification instead of ritual fan-out and mutations.** Both tracks now spend
verification effort according to the specific risk while preserving the existing hard context
caps and command-specific safety floors.

- **Cheap-first evidence hierarchy:** executable tests/differential runs → static/type/contract
  evidence → one independent reviewer → a second only on conflict/high blast radius → a
  three-reviewer panel only for confirmed contract/security/business-critical risk.
- **Three verification profiles:** `economy` skips mutations for low-risk, contract-untouched work;
  `balanced` (the default otherwise) allows at most one mutation per critical invariant/risk
  cluster; `thorough` may mutate each substantial DoD item or behavior boundary.
- **Profiles are independent from S/M/L.** Context tier controls orchestration width; verification
  profile controls mutation intensity. `--fast`, `--thorough`, and
  `--verification=economy|balanced|thorough` pin the profile, and progress logs include mutation
  `used/cap` alongside context `used/cap`.
- **Gate evidence remains strict:** creating or expanding a lint gate is a critical invariant and
  still receives one representative injected violation, including in an otherwise economical run.
- **Mutation isolation:** every selected verification mutation runs in a temporary isolated
  worktree; the commands no longer instruct agents to revert mutations with `git checkout --` in
  the user's working tree.
- **Valid command metadata:** `refactor` frontmatter strings containing a colon/hash are quoted so
  the command file parses as YAML.
- **Roadmap synchronized:** proposal #8 is marked implemented; the eval-suite proposal is explicitly
  deferred because of its implementation and maintenance cost.

## prorab 0.7.0 · prorab-tech 0.6.0

**Stack-agnostic build verification and a coherent lint-gate lifecycle.** Both command tracks get
a backward-compatible behavior correction, so both plugins receive a minor bump.

- **`build` derives a verification recipe.** It now discovers exact targeted/full test, lint,
  typecheck, build, migration, and smoke commands from repository guidance, CI, task runners,
  package scripts, and existing test conventions. Hard-coded assumptions about `services/`, Docker
  pytest, Alembic, Vite, and a backend/frontend layer sequence were removed from the mandatory flow.
- **One explicit lint-gate lifecycle.** A/B batches before C are preparatory and must not claim a
  locked ratchet; C creates and sabotage-proves the first relevant gate; post-C A/B/D batches
  tighten or expand that existing gate and sabotage-prove the changed coverage. `lint-audit` and
  `lint-fix` now use the same prerequisites, artifact fields, verification, and reporting language.
- **Honest unavailable-analyzer handling.** `lint-audit` runs an analyzer only when it is already
  available, requires explicit permission before an ephemeral download, and otherwise records a
  manual estimate labeled `not executed` instead of promising a dry-run.
- **Roadmap synchronized.** Proposal #4 is marked implemented in `IMPROVEMENT-PROPOSALS.md`, and
  the root/plugin READMEs and manifests describe the corrected behavior.

## prorab 0.6.0 · prorab-tech 0.5.0

**Hard orchestration budgets and no-progress stopping.** The adaptive S/M/L tiers now enforce a
cumulative context ceiling instead of only describing approximate fan-out. This is a
backward-compatible behavior change in all seven commands, so both plugins receive a minor bump.

- **Absolute context caps:** S = 2 total contexts and no Workflow; M = 6; L = 12 by default and an
  absolute 16 only after a confirmed critical risk or explicit `--thorough`. The main context,
  direct agents, every Workflow node, and retries all count.
- **Bounded execution:** delegated contexts must set `max_turns` (direct Agent) or `maxTurns`
  (Workflow/custom-agent configuration) to at most 6/8/12 for S/M/L;
  review→fix cycles are capped at 1/2/3 and stop immediately after a complete round yields no new
  confirmed, non-duplicate findings.
- **Executable Workflow cap:** generated scripts must launch agents only through a counted
  `boundedAgent()` wrapper, reject launches above the remaining command budget, and never feed an
  unbounded list to `pipeline()`.
- **Hybrid orchestration:** judge-panels require at least two materially different designs and
  consume the same cap. Related subsystems/findings are grouped rather than receiving one fresh
  context each, and the final independent verifier is reserved before recon fan-out.
- **Audit-specific cuts:** smell lenses are grouped into structure, reliability/security, and
  performance/maintainability. Candidate #1 is verified by default; runners-up only on a near tie
  or when #1 fails. Analyzer runners in `lint-audit` are similarly grouped by stack/tool family.
- **Light commands bounded too:** `refine` allows two Explore contexts total and stops recon after a
  no-progress round; `announce` allows one delegated context and one adversarial fact-check pass.
- **Priority record:** deterministic mutation guardrails moved from P0 to P1 in
  `IMPROVEMENT-PROPOSALS.md` because the owner does not edit files concurrently with agents. The
  task remains planned: agent-owned intermediate changes can still overlap a mutation.

## prorab 0.5.1 · prorab-tech 0.4.1

**Full English across the docs and command metadata.** Follow-up to the English execution language
(0.5.0/0.4.0): the remaining Russian prose that isn't user-facing runtime output is now English too.
**Behavior and guarantees unchanged** — docs/wording only, so a patch bump of both plugins (as with
the 0.3.1 terminology normalization).

- **READMEs and CHANGELOG → English.** The root `README.md`, both plugin READMEs, and this
  CHANGELOG are translated. They document the framework itself (a developer-facing catalog), so
  English keeps them consistent with the command bodies.
- **JSON manifest descriptions → English.** `marketplace.json` (the top description + both plugin
  descriptions) and both `plugin.json` descriptions.
- **Command frontmatter → English.** The `description`/`argument-hint` of all 7 commands (the text
  shown in the command picker). Previously left in Russian at 0.5.0; now English for a fully
  English-first catalog.
- **Artifact-template scaffolds in commands → English.** The `IDEA` (refine), announcement
  (announce), `AUDIT` (audit) and `LINT` (lint-audit) templates inside the command bodies are now
  English reference scaffolds. **The runtime behavior is unchanged:** the accompanying note still
  says "write the artifact in the task's language (default Russian)", so produced artifacts stay
  localized — only the in-command example flipped from Russian to English.
- **Unchanged:** the language policy itself (execution = English, user-facing = the task's
  language), all command logic, tiers, floors, and the anti-drift rule for UI/domain terms.

## prorab 0.5.0 · prorab-tech 0.4.0

**English execution language across all commands.** The bodies of all 7 commands were translated to
English and a language policy was fixed: the internal work (reasoning, inter-agent prompts,
`schema` outputs) is in English (denser in tokens, steadier in quality), while everything
user-facing is in the task's language. A second-order saving on top of the adaptive budget
(0.4.0/0.3.0), but it **stacks** with it; command behavior and guarantees don't change. A minor bump
of both plugins.

- **Language policy (across all commands).** Execution language = English: the orchestrator's
  reasoning, agent prompts, inter-agent messages, `schema` field values. **User-facing = the task's
  language** (detected from how the request is phrased; Russian by default): the chat, the `refine`
  dialogue, the `announce` text.
- **Artifacts stay in the task's language** (the user's decision): `IDEA`/`IMPL`/`IMPL-refactor`/
  `IMPL-lint`/`AUDIT`/`LINT`/`ANNOUNCE` — human-readable project docs. At 0.5.0 their templates in the
  commands were left in Russian (the common default) with an explicit note "write the artifact in the
  task's language". *(0.5.1 later flipped those template scaffolds to English too, keeping the note.)*
- **Code/names/comments/commit/configs — English** (unchanged). **Anti-drift:** UI/domain terms
  visible to the user aren't round-tripped through a double translation — they're carried as-is in the
  task's language (protecting the 0.3.1 terminology normalization when languages mix at the boundary).
- **Rename:** the triage-phase heading in the commands is now **`Phase 0.5 — Budget triage`** (was
  "Фаза 0.5 — Триаж бюджета") — together with the full Englishing of the bodies; the
  signals/tiers/thresholds/triage structure didn't change.
- **Left in Russian deliberately (at 0.5.0):** command frontmatter (`description`/`argument-hint`),
  `marketplace.json`, and the READMEs/CHANGELOG — a static catalog and project prose for a
  Russian-speaking user, not part of executing a task. *(Superseded by 0.5.1, which translated these.)*
- **Why it saves:** Russian generation is ~1.5–2× denser in tokens; translating the *bodies* by
  itself saves almost nothing (loaded once + cached), but English prose primes the agents'
  English reasoning and `schema` outputs — the largest pool of generated tokens. Net ≈ 10–20% on top
  of the adaptive budget (depends on how Russian the task's domain content is).

## prorab 0.4.0 · prorab-tech 0.3.0

**Adaptive budget for task complexity** across all commands. Previously the heavy commands ran in a
single mode — always the top setting of fan-out ("tokens aren't a constraint"). Now the degree of
multi-agentness is picked to the task's complexity and reversibility: a noticeable saving of limits on
simple tasks **without lowering quality** (a non-negotiable safety floor keeps the guarantees), while
large/risky tasks still get the full ultracode fan-out. A minor bump of both plugins (new behavior,
backward-compatible).

- **Phase 0.5 — Budget triage (new) in `build`, `audit`, `refactor`, `lint-audit`, `lint-fix`:**
  before any fan-out the command estimates complexity from cheap signals (size, blast radius, novelty,
  reversibility, uncertainty) and picks a **budget tier S/M/L**. The tier scales the number of
  scouts/scanners, the judge-panel (engaged only on real ≥2 designs), the number of verification
  skeptics, the loop-until-clean/dry caps. `refactor`/`lint-fix` take the tier **from the
  upstream artifact** (AUDIT `blast_radius`/`coverage`/`risk`; LINT batch tier tag A/B/C/D) — they
  don't re-derive it.
- **The safety floor is non-negotiable at any tier.** Tiering trims only the *width* of the fan-out,
  not the guarantees: `refactor`/`lint-fix` — net/baseline + sabotage probe + contract-diff + drift
  search for non-mechanical edits + a proven gate; `build` — a DoD skeptic with fresh context +
  a sabotage probe on the substance of the DoD + a full test/build run + re-grounding against Scope;
  `audit`/`lint-audit` — verification of the recommended candidate/executable batch + honesty about
  coverage.
- **Risk-proportional verification.** The check intensity is for the risk of the **specific** finding,
  not for the tier as a whole: a safe isolated finding → 1 check suffices even in L; a finding that
  touched a contract/wide blast → a full panel of ≥3 skeptics even in S. The inverted default
  ("refuted / behavior changed until proven otherwise") is preserved.
- **Model/effort tiering (new lever).** Mechanical stages (autofix/formatter, running analyzers,
  extracting the code map into `schema`, collecting the diff class) are given a cheap model
  (`opts.model: 'haiku'`/`'sonnet'`) + `opts.effort: 'low'`; judgment stages (judge-panel, drift
  search, the DoD/scope skeptic, designing the sabotage mutation) — a strong model. Previously all
  agents inherited the main-loop model (Opus) indiscriminately.
- **Cheap-first escalation.** Start at the chosen tier; an underestimated signal surfaced (an edit
  touched a contract, the blast is larger, a spike failed, the sabotage probe doesn't go red) → the
  tier is raised mid-run and logged. No downgrading mid-run.
- **Human override.** A flag in `$ARGUMENTS` (`--fast` / `--thorough` / `--tier=S|M|L`) or an
  NL request pins the tier — the human beats the auto-triage. The chosen tier and what was
  consciously skipped — one line in the chat/`log()` (we don't stay silent about cuts).
- **`refine` and `announce` (a light edit):** code recon and the number of question rounds (`refine`),
  the fact-check depth and the number of skeptics (`announce`) scale to size; the fact-check in
  `announce` runs on a cheap model. They don't need a full tier triage — the commands are light anyway.
- **Reformulated the "tokens aren't a constraint" doctrine** across all heavy commands → "adaptive
  budget: quality is the hard constraint (the floor is non-negotiable); within it, don't spend fan-out
  where it doesn't buy correctness".

## prorab 0.3.1 · prorab-tech 0.2.1

Normalization of mixed RU/EN terminology in both plugins. Cyrillic transliterations of English terms
and awkward Russian calques were replaced with clean English terms-of-art; Russian stays the primary
prose language, English — where there's no clear Russian equivalent. **Command behavior didn't
change** — only the wording (docs/wording), hence a patch bump of both plugins.

- **Transliterations → English:** гейт→gate, храповик/ратчет→ratchet, батч→batch, тир→tier,
  смелл→smell, спайк→spike, скоуп→scope, дефолт→default (noun), бэклог→backlog,
  дифф→diff, фан-аут→fan-out, апрув→approval, чекпоинт→checkpoint, роут→route,
  коммит→commit, пуш→push, баг→bug, линтер→linter, юнит→unit, мок→mock,
  фикс/автофикс→fix/autofix, тайпчек(ер)→typecheck(er), форматтер→formatter,
  тулинг→tooling, ревью→review, скоринг→scoring, рефайнмент→refinement,
  неймспейс→namespace, роадмап→roadmap, релиз→release, смоук→smoke, перф→perf.
- **Awkward calques → clean Russian:** «провод инструментов»→«подключение»,
  «бар»→«планка», «пиннящие поведение»→«фиксирующие».
- **Left as-is:** established Russian (рефакторинг, репозиторий, фреймворк,
  миграция, сеть, покрытие, планка) and already-English terms-of-art (Workflow, DAG,
  baseline, sabotage, churn, behavior-preserving, judge-panel, loop-until-clean).

## prorab-tech 0.2.0

A second pair of commands in the tech-quality track — **static quality via ratchet passes**.
Complements the structural pair (`audit`/`refactor`) with a separate pair for a different nature of
debt: linters, typecheckers, formatters, dead code, security and the **gate** (pre-commit/CI).
Pipeline: `lint-audit → LINT → lint-fix (repeat per batch) → /prorab:announce`.

- **The core idea — the ratchet.** Unlike structural refactoring, static debt is locked in
  monotonically: you enable a rule, drive its violations to zero, **lock the gate** → the level
  won't roll back. So the artifact is not "one candidate" but an **ordered ladder of safe
  passes**, each of which raises the floor AND locks it. That turns "quality grows after every
  pass" into a guarantee rather than a hope.
- **`/prorab-tech:lint-audit` (new command, `commands/lint-audit.md`):** inventories the
  tooling (what exists / is broken / is absent, + net commands to insure the passes) and
  runs all available analyzers read-only via `Workflow`; for the absent ones estimates the
  "cost of enabling" at a lenient bar. Clusters findings into batches and orders them as a
  ladder by tier: **A** zero-risk autofix → **B** onboarding/fixing tools on a passing base →
  **C** a gate at the current level (the top leverage) → **D** incremental strictness ratchet.
  Scoring `value × safety × size × confidence` + a prerequisite DAG; adversarially verifies
  behavior-preserving and "one pass". Touches no code; result —
  `tasks/audits/LINT-<slug>.md` (tooling inventory + batch roadmap + the full batch #1 spec).
- **`/prorab-tech:lint-fix` (new command, `commands/lint-fix.md`):** runs **ONE** batch
  turnkey via the ultracode Workflow. **Prime directive — behavior preservation + a locked
  ratchet:** remove a finite class of violations, prove equivalence (a green baseline of
  tests/build/typecheck + an adversarial drift search + a differential run where apt),
  **add a gate (pre-commit/CI) and prove by a sabotage probe that it goes red on a regression**.
  A latent bug the analyzer surfaces it **does not fix** — that's a behavior change, route to
  `/prorab:refine`→`/prorab:build`. Respects the ladder order (won't take a batch before its
  prerequisites). Zero scope creep, the improvement is measured by a number (N violations → 0).
  Both modes: `lint-fix <id>` — a specific batch, `lint-fix` with no argument — auto-picks the next
  undone one with met prerequisites. Result — code + gate + `tasks/IMPL-lint-<slug>.md`; marks the
  batch done in the LINT plan.

## prorab-tech 0.1.0

The new `prorab-tech` plugin — a separate **tech-quality** track with its own namespace
(`/prorab-tech:*`), so it doesn't get confused with the product commands. The track is about
continuous code health: find tech debt and fix it **safely**, without changing behavior.
Pipeline: `audit → AUDIT → refactor → IMPL-refactor → /prorab:announce`.

- **`/prorab-tech:audit` (new command, `commands/audit.md`):** a multi-agent audit of the
  codebase. A multi-modal sweep by smell classes (duplication, complexity, layer/coupling
  violations, dead code, reliability, perf, coverage holes, conventions, typing) +
  churn×complexity from git history. Clustering/dedup, scoring by
  `value × safety × size × confidence`, adversarial verification of the top
  (real/safe/useful, "reject on doubt"), a completeness-critic. Touches no code; result —
  `tasks/audits/AUDIT-<slug>.md` (a ranked backlog + the full #1-candidate spec).
  Safety is the primary selection criterion: "the most valuable AND safe", not
  "the grimiest".
- **`/prorab-tech:refactor` (new command, `commands/refactor.md`):** a turnkey safe fix
  via the ultracode Workflow. **Prime directive — behavior preservation** (an inversion of
  `build`: it proves *new* behavior, this proves *old* behavior didn't change). No net —
  no refactoring: first characterization tests pinning the current behavior (green on the old
  code, quirks preserved), then small behavior-preserving steps under green. Equivalence
  verification: an adversarial drift search (N skeptics look for an input where old≠new; a
  differential old-vs-new run), a sabotage probe of the net, contract stability, zero scope creep
  (a separate skeptic with fresh context), a **measured** quality improvement (a before/after
  metric). Both modes: `refactor <id>` fixes the chosen candidate, `refactor` with no argument —
  auto-picks #1 from the latest audit. Result — code +
  `tasks/IMPL-refactor-<slug>.md` (read by the same `/prorab:announce`).

## prorab 0.3.0

The new `announce` command — the final step of the pipeline: `refine → build → announce`.

- **`/prorab:announce` (new command, `commands/announce.md`):** prepares a concise, precise
  announcement of the results to forward in a messenger — what was done/new/changed, the
  methods applied and how it's computed. Not a report and not a changelog: the recipient understands
  the feature in 20–30 seconds without reading code.
- **Source of truth — what was done, not what was intended:** "done" is taken from the IMPL doc and
  the diff/commits + the test status; the IDEA — only for "why" and terms/thresholds. A fact-check
  phase cross-checks every claim against the sources (for non-trivial facts — a light adversarial
  check via `Workflow`); the unproven is removed or softened.
- **Format for forwarding:** simple informal Russian without the formal "вы", terms strictly as in
  the UI, a scannable structure (a header + bullets), a length target of "one screen", ready for
  copy-paste. Writes no code, changes no project files, makes no commit.

## prorab 0.2.0

Closing the `refine → build` seam and guarding against verification theater in tests. Only edits to
the bodies of the two command-prompts — no new commands/skills/agents were introduced.

- **`/prorab:refine` — the IDEA template synced with what `build` reads:** "Affected parts" gained
  "Reuse points (file:line)"; "Open risks / assumptions" split into "Risk spikes (risk → how to
  check)" and "Other assumptions"; an "Order of stages (prerequisites/pre-stages)" was added;
  "Key decisions" now asks to record what was rejected too.
- **A numbered checkable DoD:** each item is an input→expected pair, the expected value from the
  requirement (not "how the code returns it"), with a negative and a boundary; where a value isn't
  independently derivable — a metamorphic invariant instead of a literal.
- **The `[?:…]` marker** for unconfirmed assumptions: `refine` marks unclosed forks with it,
  `build` treats it as a blocker (a short question with options, not a silent default).
- **An extended definition of a blocker in `build`:** a defect in the IDEA itself affecting Scope/DoD
  (incompatible readings, behavior on an unconfirmed assumption, an uncheckable DoD item)
  — a blocker fork; a "sensible default" — only for decisions outside Scope/DoD.
- **Anti-verification-theater in tests:** right-reason red (a valid red only on
  `AssertionError`), a blacklist of green-up bypasses, a separate skeptic agent with fresh
  context runs the "tests" measurement in Phase 4 (a sabotage probe, an independent oracle, a real
  unit, a negative+boundary, a grep for bypasses), re-grounding against DoD/Scope-IN before the
  report. A caveat against ritual: the rules are a skeptic's lenses proven by a command's output, not
  the author's checkboxes.
- **`refine` stop-triggers:** skepticism serves scope/DoD; on a two-round stall — settle, fixing the
  remainder as open items / `[?:…]`.
- **Pipeline tail:** `build` records significant decisions in the IMPL doc's decisions/deviations
  section (a cross-idea one — optionally in `CLAUDE.md`) and in the final report neutrally marks the
  "last mile" (review/smoke/commit/PR) as done per the project's practices and only on an explicit
  request.

## prorab 0.1.0

The initial packaging of the framework into a Claude Code marketplace.

- The repository turned into a marketplace with one `prorab` plugin.
- The **`/prorab:refine`** command — from the former `brainstorm` (working an idea up to a spec).
- The **`/prorab:build`** command — from the former `implement-idea` (turnkey implementation via a
  multi-agent ultracode Workflow).
- Installation via `/plugin marketplace add` + `/plugin install`, updating via
  `/plugin marketplace update`.
- The artifact contract fixed: the commands are global, `IDEA-*`/`IMPL-*` are written to the
  `tasks/` of the working project.
