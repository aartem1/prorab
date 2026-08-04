import type { Card, Table } from '../types';

export const howItWorks = {
  meta: {
    title: 'How it works — Prorab',
    description:
      'Prorab’s mechanics: what a Definition of Done has to look like, how a test earns its place, ' +
      'blind outside-in verification, behavior-preserving refactoring, the context budget and ' +
      'occupancy limits, hashed handoffs, documentation sync, project memory and the artifact ' +
      'lifecycle.',
    ogTitle: 'Prorab — how it works',
    ogDescription:
      'The rules that decide what may be called done, and the limits that keep them affordable.',
  },

  hero: {
    eyebrow: 'Mechanics',
    titleA: 'The rules that decide',
    titleB: 'what may be called done.',
    lede:
      'Everything below exists to keep one property true: the expected value in every check can be ' +
      'traced back to a stated requirement, and never to the code that is being checked. The rest ' +
      'is making that affordable.',
  },

  toc: {
    dod: 'definition of done',
    evidence: 'how a test earns its place',
    blind: 'blind verification',
    preserve: 'the inverted proof',
    cost: 'cost',
    handoffs: 'handoffs',
    docs: 'documentation sync',
    memory: 'project memory',
    artifacts: 'artifacts',
    compare: 'how it compares',
  },

  dod: {
    rail: 'the DoD',
    heading: 'What “explicit” has to mean to be worth anything',
    lede:
      'A Definition of Done that reads “the export works” is not a requirement — it is the same ' +
      'ambiguity in a more confident font. The form is fixed, and it is fixed because each part of ' +
      'it closes a specific way of being wrong.',
    table: {
      head: ['Rule', 'The failure it closes'],
      rows: [
        [
          'Numbered, one <code>given &lt;input&gt; → &lt;expected&gt;</code> pair per item',
          'An intention cannot be run. A pair can, which is what makes “done” checkable rather ' +
            'than declared.',
        ],
        [
          'The expected value comes <strong>from the requirement</strong>, not from how the code ' +
            'returns it',
          'The central one. An expectation derived from the implementation always agrees with the ' +
            'implementation.',
        ],
        [
          'At least one <strong>negative</strong> per non-trivial item — empty or invalid input → ' +
            'the documented refusal',
          'Happy-path-only suites. Most real defects live in what the code does when the input is ' +
            'wrong.',
        ],
        [
          'At least one <strong>boundary</strong> — 0, the limit, off-by-one',
          'The single most common class of silent bug, and the one a golden snapshot hides best.',
        ],
        [
          'Where no literal value is independently derivable — a <strong>metamorphic ' +
            'invariant</strong> from the spec',
          'Ranking, aggregates, parsing, non-determinism. Without this rule, these get a snapshot ' +
            'instead. The invariant must be one the spec implies, not an always-true relation.',
        ],
        [
          'An unclosed fork is written as <code>[?:&nbsp;…]</code>',
          'The silent default. The marker survives into the next command, which treats it as a ' +
            'blocker and asks — rather than picking something reasonable and never mentioning it.',
        ],
      ],
    } as Table,
    metamorphic:
      'Metamorphic invariants are the part people skip, so: <em>permuting the input does not ' +
      'change the total</em>; <em>parse ∘ serialize returns the original</em>; <em>running it ' +
      'twice is idempotent</em>; <em>more input never lowers the count</em>. Each is checkable ' +
      'without knowing the answer, which is exactly the situation a ranking or an aggregate puts ' +
      'you in.',
  },

  evidence: {
    rail: 'evidence',
    heading: 'A test that cannot fail is not evidence.',
    lede:
      'Every test the framework counts has been shown to go red. There are exactly two ways to ' +
      'show it, and which one was used is recorded per test, with the test file’s hash.',
    routes: [
      {
        num: 'route 1 · red-first',
        title: 'It failed before the code existed',
        body:
          'The test is written on a DoD item and run <em>before</em> implementing. A valid red is ' +
          'an <code>AssertionError</code> carrying the value from the DoD. An ' +
          '<code>ImportError</code>, a syntax error or a fixture error is <strong>not</strong> a ' +
          'red — it means the test is wrong, and the test is fixed before any implementation is ' +
          'written. The actual run tail goes into the artifact.',
      },
      {
        num: 'route 2 · mutation',
        title: 'A regression was injected and it caught it',
        body:
          'For a test written after the behavior already works — where red-first is impossible — ' +
          'one plausible regression is injected from a closed set: invert a condition, shift a ' +
          'boundary, flip a sign, delete a significant branch, return a constant. Red → covered. ' +
          'Not red → <code>weak</code>, however convincing the test reads, and the report says so.',
      },
    ] as Card[],
    worktree:
      '<strong>Mutations never run in your working tree.</strong> A temporary isolated worktree is ' +
      'created, the task-scoped patch is materialized there, the regression is injected, the test ' +
      'is run, and the worktree is removed after confirming your tree is untouched — never ' +
      '<code>git checkout --</code>, <code>git reset</code> or <code>git clean</code> to undo a ' +
      'probe.',

    skepticHeading: 'The skeptic, and its inverted default',
    skepticLede:
      'The “tests” dimension of the review is run by a <strong>separate agent with a fresh ' +
      'context</strong> — not the one that wrote the code. Its input is the DoD and the test diff; ' +
      'it opens the implementation only to confirm a finding. Its starting position is the ' +
      'opposite of the usual one: <em>a green suite does not, by itself, close a DoD item.</em> It ' +
      'works a yes/no rubric, and any “no” is a finding.',
    rubric: {
      head: ['The rubric', 'What a “no” looks like'],
      rows: [
        ['Sabotage probe', 'A plausible regression was injected and no test went red.'],
        [
          'Independent oracle',
          'A magic number with no derivation from a requirement, or a snapshot taken from the code ' +
            'itself.',
        ],
        [
          'Real unit',
          'The unit under test — or its direct return — is mocked. Mocking external boundaries by ' +
            'name (network, DB, time, filesystem) is fine and expected.',
        ],
        [
          'Negative + boundary',
          'Missing, with no specific reason why the behavior has none. “Not applicable” is not a ' +
            'reason.',
        ],
        [
          'No workarounds',
          'A grep across new and changed tests hits <code>skip</code>, <code>xfail</code>, a ' +
            'commented-out case, <code>assert True</code>, a tautology, no assertion at all, ' +
            '<code>sys.exit(0)</code>, <code>try/except</code> without re-raise, or a hardcoded ' +
            'answer keyed on the test input.',
        ],
      ],
    } as Table,
    caveat:
      '<strong>A caveat the framework states about itself.</strong> These are lenses for a ' +
      'skeptic, proven by a command’s output — not checkboxes the author awards themselves. Pushed ' +
      'too hard, “the reviewer must find something” breeds false findings and over-engineering, so ' +
      'the skeptic’s focus is DoD coverage and defused fake checks, explicitly <em>not</em> style.',

    judgedHeading: 'How a run is judged',
    judged:
      'By its <strong>exit code and its own counters</strong> — never by an <code>OK</code> or ' +
      '<code>passed</code> string in the output. A suite reporting <code>passed</code> having ' +
      'collected approximately zero tests is a finding, not a pass. And the verification recipe ' +
      'itself is derived from the project — repository guidance, CI, task runners, package ' +
      'scripts, existing test conventions — rather than assumed from the language. A check with no ' +
      'discoverable command is reported as a gap; it is not invented, and no tooling is silently ' +
      'installed.',
  },

  blind: {
    rail: 'blind check',
    heading: 'Blindness has to be structural, not promised.',
    lede:
      'Everything in section 02 is performed by contexts that can see the implementation. That is ' +
      'necessary and not sufficient: a check designed while looking at the code inherits the ' +
      'code’s assumptions and then confirms them. So <code>/prorab:verify</code> splits the roles ' +
      'physically. The probing context is <strong>delegated at every tier, S included</strong> — ' +
      'not because probing is expensive, but because a context that has already read the diff ' +
      'cannot un-read it.',
    cards: [
      {
        num: 'the charter',
        title: 'What crosses over',
        body:
          'Per behavior: the surface a consumer reaches it through, the precondition and how to ' +
          'obtain it via the project’s own seeding path, the action, the expected result <em>and ' +
          'the requirement it comes from</em>, a negative and a boundary case, and the allowed ' +
          'instruments. If an item can only be phrased in implementation terms, it is not a ' +
          'user-visible behavior — it is dropped, and the report says so.',
      },
      {
        num: 'the declaration',
        title: 'What makes it checkable',
        body:
          'Every prober returns every file it read, every command it ran, and — for a scripted ' +
          'probe — every locator it used. An implementation file, a test file or the diff in that ' +
          'list drops the items it touched to <em>not independently verified</em>. Those items are ' +
          're-probed within the cap or reported at that grade; they are never laundered into ' +
          '<code>works</code>.',
      },
    ] as Card[],
    downgrades:
      'Weak passes are downgraded rather than accepted: a <code>works</code> resting on the ' +
      'system’s own output, on “no error”, or on a screenshot with no compared value becomes ' +
      '<code>unverifiable</code> with the reason stated. A defect is reproduced a second time ' +
      'before being announced, so a flake is not reported as a bug. And an honest ' +
      '<code>unverifiable</code>, naming the missing environment, access, data or oracle, is a ' +
      'legitimate result — a fabricated “works” is not.',

    ladderHeading: 'The instrument ladder for a browser surface',
    ladderLede:
      'The default for a web UI is a headless run, and the reason is not only speed. In a visual ' +
      'session the model is the driver: look at a screenshot, decide, click, look again — every ' +
      'step a round trip carrying an image. In a headless run it <strong>authors</strong> the ' +
      'session once, executes it with one command, and judges a structured result. That is also ' +
      'the stronger check: a screenshot after pressing <em>Save</em> shows a toast, while a script ' +
      'reloads the page and re-reads the resource, which is what actually proves the data was ' +
      'stored.',
    ladder: {
      head: ['Level', 'When', 'What it asserts on'],
      rows: [
        [
          '<strong>L0</strong> — no browser',
          'The behavior is observable over HTTP, the CLI, or the data it writes.',
          'A plain client. A browser is needed only when the behavior <em>lives</em> in the ' +
            'browser: client routing, client state, client validation, rendering.',
        ],
        [
          '<strong>L1</strong> — headless run <span class="small">(the default)</span>',
          'Anything that lives in the browser.',
          'Role and accessible name, label, visible text, URL, response status, storage, console — ' +
            'and layout <em>measured</em>: clipping as <code>scrollWidth &gt; clientWidth</code>, ' +
            'overlap as intersecting boxes, off-screen as a box outside the viewport, plus ' +
            'computed size and colour.',
        ],
        [
          '<strong>L2</strong> — pixels, clipped',
          'A genuinely perceptual requirement: visual regression, canvas or chart rendering, ' +
            'print, a deliberate aesthetic.',
          'One element-clipped screenshot taken <em>inside</em> the same L1 run, read only for the ' +
            'item that needs adjudication.',
        ],
        [
          '<strong>L3</strong> — interactive visual session',
          'Escalation only, on a named trigger: an auth/2FA/captcha step a human must complete, a ' +
            'native dialog, an unreachable environment, or L1 failing twice to find a user-facing ' +
            'handle.',
          'The trigger is logged with the escalation. An unlogged L3 is how this quietly decays ' +
            'back into the slow default.',
        ],
      ],
    } as Table,
    captures:
      'Every run captures console errors and unhandled rejections, failed requests with method, ' +
      'path and status, the <strong>write request’s own status</strong> behind a save rather than ' +
      'the message the UI shows afterwards, persistence proven by an independent re-read, and — ' +
      'for a negative case — the documented refusal with the failure <em>injected</em> (a 500, a ' +
      'timeout, an offline state, an empty or invalid submit) rather than waited for.',
    locators:
      '<strong>Locators are user-facing only</strong> — role plus accessible name, label, visible ' +
      'text, placeholder, heading, or a <code>data-testid</code> the project’s own conventions ' +
      'publish. Never a class hash, an internal id, an XPath, or a selector lifted from the ' +
      'source. This one rule does two jobs: authoring a script is the single moment a blind prober ' +
      'is tempted to open the implementation “just for a selector”, and it is also simply how a ' +
      'user finds a control. A handle that cannot be found by its user-facing name is therefore a ' +
      '<em>finding</em> — a labelling or accessibility gap — never a reason to read the code.',
  },

  preserve: {
    rail: 'preservation',
    heading: 'The tech track proves the opposite thing.',
    lede:
      '<code>build</code> proves that <em>new</em> behavior matches a requirement. ' +
      '<code>refactor</code> and <code>lint-fix</code> prove that <em>old</em> behavior did not ' +
      'change. That is not the same proof with a different subject — it needs a different ' +
      'instrument entirely, which is why they are separate executors rather than a flag on ' +
      '<code>build</code>.',
    cards: [
      {
        num: 'the oracle',
        title: 'The old code is the requirement',
        body:
          'There is no DoD to derive an expectation from — the expectation <em>is</em> what the ' +
          'code did yesterday. So a characterization net is written first, pinning the current ' +
          'behavior and green on the OLD code, and structure is only changed under green. No net ' +
          'that can catch a behavior change, and nothing to build one from, is a blocker. ' +
          '<strong>Bugs and quirks are preserved too</strong>: a refactoring that also fixes ' +
          'something is two changes wearing one diff.',
      },
      {
        num: 'the default',
        title: 'Changed until proven equivalent',
        body:
          'The drift search assumes divergence and goes looking for it — boundaries, negatives, ' +
          'unusual types, concurrency, errors — and where it is possible, an old-versus-new ' +
          'differential run on common inputs compares outputs and side effects directly. Any ' +
          'diverging input is a critical finding. The sabotage probe here targets the <em>net</em>: ' +
          'if a mutation survives, the net is leaky and the net gets fixed, not the refactoring.',
      },
    ] as Card[],
    statics:
      'The static pair carries the same directive with one addition that matters. A strict ' +
      'analyzer routinely surfaces a <em>real</em> bug — a dead branch, an unreachable path, a ' +
      'swallowed exception. Fixing it would be a behavior change inside a pass that claims to make ' +
      'none, so it is recorded and routed to the product track, and the pass itself annotates or ' +
      'suppresses at the agreed bar. The gate lifecycle is stated with the same honesty: batches ' +
      'before the first gate are <em>preparatory</em> and are never described as locked; the gate ' +
      'batch creates the first enforcement and sabotage-proves it; later batches tighten that same ' +
      'gate and prove the changed coverage.',
  },

  cost: {
    rail: 'cost',
    heading: 'Two independent limits: how many contexts, and how full each one gets.',
    lede:
      'The heavy commands — <code>build</code>, <code>verify</code>, <code>audit</code>, ' +
      '<code>refactor</code>, <code>lint-audit</code>, <code>lint-fix</code> — run a ' +
      '<strong>budget triage</strong> before fanning out any agents, estimating complexity from ' +
      'cheap signals: size, blast radius, novelty, reversibility, uncertainty.',
    tiers: {
      head: ['Tier', 'Total contexts', 'Shape'],
      rows: [
        [
          '<strong>S</strong>',
          '2',
          'No <code>Workflow</code> at all — the main loop is the executor and reads, edits and ' +
            'runs directly.',
        ],
        [
          '<strong>M</strong>',
          '6',
          'The usual shape for a real feature: an orchestrator plus up to five delegated contexts.',
        ],
        [
          '<strong>L</strong>',
          '12',
          'Expandable to an absolute ceiling of 16, only for confirmed critical risk or an ' +
            'explicit <code>--thorough</code>.',
        ],
      ],
    } as Table,
    cumulative:
      'The count is <strong>cumulative for the whole command</strong> and includes the main ' +
      'context plus every delegated or Workflow context, retries included. Enforcement is ' +
      'mechanical: every delegated context carries a turn limit (6/8/12 for S/M/L), review→fix ' +
      'cycles are capped at 1/2/3, a completed round that produces no new confirmed non-duplicate ' +
      'finding stops fan-out immediately, and a generated Workflow script tracks its remaining ' +
      'allowance with a counter and a <code>boundedAgent()</code> wrapper that throws before ' +
      'exceeding it. Unbounded fan-out is forbidden outright.',

    occupancyHeading: 'The second axis: occupancy',
    occupancyLede:
      'A tier bounds how many contexts open, not how full each one gets — and those are different ' +
      'things. A context stuffed with material nobody reads judges worse than one given the range ' +
      'that matters, so three limits apply at every tier.',
    occupancy: [
      {
        num: 'run output',
        title: 'Never enters a context raw',
        body:
          'Output from a suite or an analyzer goes to a file <em>outside</em> the working tree and ' +
          'comes back as a ~40-line digest: the command, its exit code, its own counters, one ' +
          'identifying line per failure. Ten failures of one class become one example plus a ' +
          'count; a specific failure is grepped out of the file on disk when it needs detail. ' +
          '<strong>Compaction may never hide a result</strong> — shortening <em>what</em> failed ' +
          'is allowed, concealing <em>that</em> something failed is a false report.',
      },
      {
        num: 'delegated returns',
        title: 'Capsules, not material',
        body:
          'A delegated context hands back one schema capsule of roughly 1500 tokens — claims plus ' +
          '<code>path:line</code>, symbol or command pointers, never file contents, a full diff or ' +
          'raw output. When material genuinely has to be seen, the capsule <em>names</em> it and ' +
          'the orchestrator opens that one range, so the reading happens once where it is needed. ' +
          'An oversized return is never forwarded verbatim into the next prompt.',
      },
      {
        num: 'main loop',
        title: 'Holds the plan, not the code',
        body:
          'Above tier S the orchestrator holds the artifact, the plan, the DoD table with per-item ' +
          'status, the capsules and the <code>used/cap</code> ledger. Two bounded exceptions ' +
          'stand, because the source-of-truth order outranks tidiness: a named, narrow range of ' +
          'current source when a capsule claim materially drives a contract decision, and the ' +
          'digest of a run it ordered. Needing broad reading up here is a signal the work was ' +
          'under-delegated.',
      },
      {
        num: 'deterministic steps',
        title: 'Enumerable facts come from a command',
        body:
          '<code>git hash-object</code> for content identity, <code>git status --porcelain</code> ' +
          'for the change set, <code>git diff --stat</code> for the diff class, and a ' +
          '<code>grep</code> per touched symbol for documentation reach — where an empty result ' +
          '<em>is</em> the evidence that nothing was affected. Cheap, exact, repeatable, and ' +
          'stronger than an impression.',
      },
    ] as Card[],

    contractsHeading: 'The same principle, applied to the commands’ own text',
    contractsLede:
      'The shared rules live in four contracts, and a command loads only the ones it can act on. A ' +
      'read-only command has no business paying for the executor rules, and a change with no ' +
      'browser surface never pays for the web method.',
    matrixHead: 'Command',
    matrixIfBrowser: 'if browser',
    contractsNote:
      '<code>verify</code> runs checks and writes tests, but changes no behavior — so it falsifies ' +
      'no document and carries no documentation duty. The tech track has no web contract at all: ' +
      'its oracle is old-versus-new behavior, which needs a differential run, not a consumer ' +
      'session.',

    floor:
      '<strong>What no tier buys back.</strong> The safety floor is outside the budget at every ' +
      'tier: the characterization net or baseline, the contract diff, the drift search, a DoD ' +
      'skeptic with a fresh context, and a sabotage-proven gate whenever one is created or ' +
      'changed. Mutation intensity is a separate dial — <code>economy</code> (none), ' +
      '<code>balanced</code> (one per critical cluster, the default), <code>thorough</code> (one ' +
      'per substantial boundary). Tiering cuts how many lenses look at the code; it never cuts the ' +
      'evidence.',
  },

  handoffs: {
    rail: 'handoffs',
    heading: 'Nothing is paid for twice.',
    lede:
      'The commands run in sequence, and each stage already knows something the next would ' +
      'otherwise rediscover. So each records it — stamped with content hashes, so the next stage ' +
      'can tell fresh knowledge from a confident description of code that has moved on.',
    table: {
      head: ['Handoff', 'What is carried', 'What staleness costs'],
      rows: [
        [
          '<code>refine → build</code>',
          'The <em>Code map</em>: files opened with <code>git hash-object</code> hashes, reuse and ' +
            'change points, contracts at risk, conventions, declared gaps.',
          'All fresh → recon costs zero contexts. Partly fresh → recon scoped to the stale entries ' +
            'plus the declared gaps. No map → normal recon. Never a blocker.',
        ],
        [
          '<code>audit → refactor</code>',
          'Commit plus hashes of the target files, the tests the coverage claim rests on, and the ' +
            'call-site files.',
          'Re-hashed <em>before</em> a tier is chosen, since safety and blast radius are inherited ' +
            'from it. Stale target → candidate obsolete; stale test → coverage claim void; stale ' +
            'call site → blast radius void.',
        ],
        [
          '<code>build/quick → verify</code>',
          'Which tests were proven able to fail and how — <code>red-first</code> or ' +
            '<code>mutation</code> — plus the test file’s hash.',
          'Fresh entries become <code>covered (reused)</code>, and the budget goes to what nobody ' +
            'checked yet. A reused proof never upgrades a behavior’s own verdict.',
        ],
        [
          '<code>build/quick → verify</code> <span class="small">(web)</span>',
          'The runner and its exact invocation, the base URL that worked, the seeding path, the ' +
            'recorded answer to any provisioning question.',
          'A stale entry means the recipe is re-derived. A runner that fails on first use is ' +
            're-derived, not retried blindly.',
        ],
        [
          '<code>lint-audit → lint-fix</code>',
          'The exact analyzer invocations and the gate entrypoint — deliberately <em>not</em> ' +
            'violation counts.',
          'Counts go stale the moment a batch lands and re-running an analyzer is nearly free, so ' +
            'gate state is read from the last completed batch artifact instead.',
        ],
      ],
    } as Table,
    bounds:
      'Two bounds hold on every one of these. A matching hash proves a file is unchanged — not ' +
      'that the claim about it is right, and not that a test asserts the behavior in question; so ' +
      'a claim that drives an external-contract edit is still verified against current source. And ' +
      'saved contexts are <strong>banked, not respent</strong>: a cheap recon is not a licence to ' +
      'fan out further.',
  },

  docs: {
    rail: 'docs sync',
    heading: 'Documentation doesn’t drift away from the code.',
    lede:
      'Every command that changes code owns the documentation that change falsifies. A stale ' +
      'document left behind is an <em>incomplete change</em>, not a follow-up — it is part of the ' +
      'command’s own completion condition, and reviewers treat a contradiction between the diff ' +
      'and a current-state document as a finding.',
    table: {
      head: ['Kind', 'Examples', 'What a command does'],
      rows: [
        [
          '<strong>Current state</strong><br><span class="small">claims to describe how the ' +
            'project works now</span>',
          '<code>README</code>, <code>docs/</code>, the spec, API and configuration references, ' +
            'runbooks, <code>CLAUDE.md</code> and other agent guidance, docstrings, comments, ' +
            '<code>--help</code> text, and the examples inside any of them',
          'Corrects exactly what the change made factually wrong — a renamed symbol or path, a ' +
            'changed default, flag, signature, limit, format or command, an example that would now ' +
            'behave differently. In place, minimally, in the document’s own language and style.',
        ],
        [
          '<strong>Historical</strong><br><span class="small">records what happened</span>',
          '<code>CHANGELOG.md</code>, release notes, ADRs, migration notes, ' +
            '<code>tasks/archive/**</code>, completed task artifacts',
          'Never rewritten to match new code. A new entry is added where the project’s convention ' +
            'calls for one; a past entry stays exactly as it was written.',
        ],
      ],
    } as Table,
    scope:
      'What keeps this from becoming an endless documentation project is the scope rule: the duty ' +
      'is what the change made <em>factually wrong</em>. Anything wider — a style rewrite, a gap ' +
      'that predates the change, a restructure, a correction needing a product decision, or a fix ' +
      'larger than the code change itself — is reported with the follow-up named, not absorbed ' +
      'into the diff. And “nothing was affected” has to be earned by actually grepping for the ' +
      'symbols, paths, flags and literal values the change touched.',
    verifyNote:
      '<code>/prorab:verify</code> sits deliberately outside this duty. It changes no behavior, so ' +
      'it falsifies no document — and when observed behavior contradicts a document, either one of ' +
      'them can be the wrong one. That is a finding it reports with both readings named, never a ' +
      'document it quietly rewrites.',
  },

  memory: {
    rail: 'memory',
    heading: 'Project memory that can’t outrank the code.',
    lede:
      'Prorab accumulates a small, version-controlled memory during normal work. No ' +
      '<code>init</code>, no <code>remember</code> command, no background process, no external ' +
      'model, no vector database — the structure is created lazily under ' +
      '<code>tasks/memory/</code>, and every command still works when it is absent.',
    tree: `tasks/memory/
├── INDEX.md          <span class="d"># one line per entry: link, type, status, topic, key paths</span>
├── components/       <span class="d"># component, contract, pattern</span>
├── decisions/
├── gotchas/
└── verification/     <span class="d"># commands that were actually re-verified</span>`,
    orderLede: 'Memory is deliberately <strong>last</strong> in the source-of-truth order:',
    order: `current worktree → repository instructions and docs → tests, CI and other
  executable evidence → task artifacts → <span class="d">memory</span>`,
    rule:
      'Memory accelerates discovery; it never proves current behavior by itself. A material claim ' +
      'that affects behavior, architecture, an external contract, scope, DoD, an implementation ' +
      'choice or the verification recipe must have its current source opened before it can be ' +
      'used. On a conflict the current evidence wins and the entry is updated, marked ' +
      '<code>superseded</code> or marked <code>stale</code> — an entry never overrides the code.',
    captured:
      'Captured: durable architectural decisions, component responsibility, contracts and their ' +
      'consumers, non-obvious constraints, recurring gotchas, verified commands, rejected ' +
      'alternatives and why. Not captured: transcripts, reasoning, temporary status, one-off ' +
      'errors, ordinary code facts that are cheaper to read directly, unmarked assumptions, or ' +
      'copies of task artifacts. Usually zero to three entries per task are enough.',
  },

  artifacts: {
    rail: 'artifacts',
    heading: 'Artifact lifecycle',
    lede:
      'A bundle is archived only after the command has re-checked scope and every mandatory DoD ' +
      'item and recorded a successful final status. A blocker, a partial completion or a failed ' +
      'mandatory check leaves everything active.',
    tree: `tasks/archive/
└── YYYY/
    ├── &lt;task-slug&gt;/
    ├── refactor-&lt;task-slug&gt;/
    └── lint-&lt;plan-slug&gt;/`,
    safety:
      'Before moving anything, a command verifies explicit artifact identity and cross-links — a ' +
      'similar slug alone is not enough — refuses paths outside <code>tasks/</code>, path ' +
      'traversal and unexpanded globs, never overwrites an existing directory (deterministic ' +
      '<code>-2</code>, <code>-3</code> suffixes), updates the links in the moved bundle and the ' +
      'remaining artifacts, re-opens each destination and reports every moved file. No recursive ' +
      'deletion, no broad destructive shell operations.',
    lookup:
      'Archived work is never picked up as active by default: a lookup searches the archive only ' +
      'when you name an archived task explicitly, when <code>announce</code> needs completed work, ' +
      'or when a historical question requires it. <code>/prorab:quick</code> and ' +
      '<code>/prorab:verify</code> archive nothing at all — they each leave exactly one record. ' +
      'And no command commits or pushes unless you ask.',
  },

  compare: {
    rail: 'compare',
    heading: 'How it compares',
    lede:
      'Prorab sits between a hand-written Claude Code setup and a full product-development ' +
      'framework. Its narrower bet: an existing codebase needs two things at once — a repeatable ' +
      'path from an unclear task to verified code, and a separate, behavior-preserving path for ' +
      'paying down debt.',
    table: {
      head: ['Capability', 'Prorab', 'Superpowers', 'Spec Kit', 'BMAD', 'Native'],
      rows: [
        [
          'Refine an unclear feature before coding',
          'Built in',
          'Built in',
          'Built in',
          'Built in',
          'Configurable',
        ],
        [
          'Red-first TDD in the implementation path',
          'Required',
          'Required',
          'Configurable',
          'Configurable',
          'Configurable',
        ],
        [
          'Independent implementation review',
          'Required',
          'Built in',
          'Configurable',
          'Built in',
          'Configurable',
        ],
        [
          'Persistent, linked task artifacts',
          'Built in',
          'Design + plan',
          'Built in',
          'Built in',
          'Configurable',
        ],
        [
          'Dedicated structural-debt workflow',
          'Built in',
          'Not in the basic workflow',
          'Extension',
          'Not in the default method',
          'Configurable',
        ],
        [
          'Dedicated lint/type/gate ratchet',
          'Built in',
          'Not in the basic workflow',
          'Extension',
          'Module-dependent',
          'Configurable',
        ],
        [
          'Hard cumulative agent-context limit',
          '2/6/12, ceiling 16',
          'Not documented',
          'Not documented',
          'Not documented',
          'Configurable',
        ],
        [
          'Coding-agent portability',
          'Claude Code',
          'Multiple agents',
          'Multiple agents',
          'Multiple agents',
          'Claude Code',
        ],
      ],
    } as Table,
    tableNote:
      'A comparison of documented <em>default workflows</em> as of 2026-07-25, not a benchmark of ' +
      'model output. All of these are extensible, so “not in the default workflow” does not mean ' +
      '“impossible to add”. Full sources and a per-approach discussion are in the ' +
      '<a href="{repo}#how-does-prorab-compare">README</a>.',
    choose:
      'Choose <strong>Prorab</strong> when auditability, behavior-preserving maintenance and a ' +
      'hard context boundary matter more than agent portability. Choose ' +
      '<strong>Superpowers</strong> for a prescriptive TDD/subagent methodology that follows you ' +
      'across coding tools. Choose <strong>Spec Kit</strong> when specifications are the primary ' +
      'organizing artifact and you want a large integration surface. Choose <strong>BMAD</strong> ' +
      'when the work starts before engineering — market and domain analysis, PRDs, architecture, ' +
      'UX — and role separation is useful. Use <strong>native Claude Code customization</strong> ' +
      'when the workflow is small or unusual enough that owning the policy is cheaper than ' +
      'adopting a framework.',
    ctaInstall: 'Install Prorab →',
    ctaCommands: 'All ten commands',
  },
};

export type HowItWorks = typeof howItWorks;
