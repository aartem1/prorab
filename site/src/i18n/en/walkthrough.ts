import type { Card, LegendRow, Table } from '../types';

export const walkthrough = {
  meta: {
    title: 'Walkthrough — one task through Prorab, start to finish',
    description:
      'One ordinary feature request taken through refine → build → verify → announce: the ' +
      'unclarity map, the Definition of Done, the red-first test, the blind outside-in probe, and ' +
      'every artifact each step leaves behind.',
    ogTitle: 'Prorab — one task, start to finish',
    ogDescription: 'From an eight-word ticket to a verified change, with every artifact shown.',
  },

  railLabel: 'Steps',

  hero: {
    eyebrow: 'Walkthrough',
    titleA: 'From a short request',
    titleB: 'to a verified change.',
    lede:
      'Follow one ordinary feature request through clarification, implementation, verification, ' +
      'and announcement.',
    note:
      '<strong>The panels are shortened reconstructions, not captured output.</strong> The CSV ' +
      'feature, file names, and numbers are illustrative. The artifact structure and command rules ' +
      'match the real plugins.',
  },

  toc: {
    request: 'the request',
    refine: 'refine',
    clear: '/clear',
    build: 'build',
    verify: 'verify',
    announce: 'announce',
    lanes: 'the other lanes',
    result: 'what you are left with',
  },

  request: {
    rail: 'the request',
    lab: 'the request',
    heading: '“Add a CSV export to the reports page.”',
    body:
      'This is a normal request, and it still contains ' +
      '<a href="{overview}#problem">fourteen unresolved decisions</a>. An agent that starts coding ' +
      'must choose an answer for each one.',
    kicker: 'So the first command writes no code at all.',
  },

  refine: {
    rail: 'refine',
    lab: 'make the requirement explicit',
    heading: '<code>/prorab:refine</code> — clarify before coding',
    invocation: '<span class="c">/prorab:refine</span>  add a CSV export to the reports page',
    intro:
      'It first reads the repository guidance and relevant code: models, endpoints, the report ' +
      'query, and existing screens. Then it paraphrases the request so you can correct its reading ' +
      'before answering questions, followed by an ambiguity map.',

    legend: [
      {
        mark: '🟥',
        text: '<strong>Contradictions</strong> — where the idea disagrees with itself.',
      },
      {
        mark: '🟧',
        text:
          '<strong>Gaps</strong> — what is critically undefined: actor, trigger, boundary, data ' +
          'format, error behavior.',
      },
      {
        mark: '🟨',
        text:
          '<strong>Hidden assumptions</strong> — what it had to invent to make the idea look ' +
          'coherent.',
      },
      {
        mark: '🟦',
        text:
          '<strong>Links to existing code</strong> — which modules and entities are actually ' +
          'affected.',
      },
    ] as LegendRow[],

    mapName: 'ambiguity map, first round',
    map: `<span class="r">🟥</span> "everything the user sees" (your words) vs the page's own default filter —
   the screen already hides archived rows. Which of the two is "what the user sees"?
<span class="c">🟧</span> empty result: a header-only file, a zero-byte file, or a refusal with a message?
<span class="c">🟧</span> row cap — the query can return ~2M rows; the request times out at 30s
<span class="d">🟨</span> assumed: headers are the UI column labels, in the active interface language
<span class="d">🟨</span> assumed: displayed (formatted) values, not the stored ones
<span class="v">🟦</span> reports/query.py:88 already builds the filtered rowset — reuse, don't rewrite
<span class="v">🟦</span> exports/base.py:12 has a streaming-response helper with the project's own conventions`,

    asks:
      'It asks <strong>one to four focused questions at a time</strong>, with concrete, mutually ' +
      'exclusive options. Each answer updates the map; scope changes are called out explicitly.',

    roundName: 'a question round',
    round: `Which rows does the file contain?
  ① exactly what the active filters and sorting show   <span class="d">(recommended — it is
     what "export what I am looking at" means to the person clicking)</span>
  ② every row the underlying query can return, ignoring the screen filters
  ③ ① by default, ② behind an explicit "export all" option

And when the result is empty?
  ① the header row and no data rows
  ② a refusal with a message, no file
`,

    stops:
      'The dialogue ends when the scope and DoD are clear enough to implement. If two rounds add ' +
      'nothing, the command proposes recording the remaining open items. You decide when the idea ' +
      'is ready.',

    forks:
      'An unresolved fork is not quietly defaulted. It is written into the artifact as ' +
      '<code>[?:&nbsp;…]</code>, and the next command treats that marker as a blocker it has to ' +
      'ask about.',

    ideaName: 'tasks/ideas/IDEA-csv-export.md',
    idea: `## Scope
- IN:  export of the currently filtered rowset; visible columns in screen order;
       displayed values; header = UI labels; empty result → header-only file
- OUT: scheduled exports, XLSX, exporting from any screen other than reports

## Affected parts of the project
- Backend: reports/query.py (reuse), exports/base.py (reuse the streaming helper)
- Frontend: the report toolbar — a new control next to the existing filter chips

## Code map (handoff for build — so it does not re-study what is still fresh)
- Provenance: commit \`9f2c1ab\`, recorded 2026-07-24
- Files studied: reports/query.py — builds the filtered rowset — \`a3f1…\`
                 exports/base.py  — streaming response conventions — \`7c02…\`
                 <span class="d">… 4 more</span>
- Ready to reuse: reports/query.py:88 → the filtered rowset, already permission-scoped
- Change points:  exports/__init__.py:1 → register the new exporter
- Conflicts / contracts at risk: none — no public API touched
- Not studied: the frontend i18n catalogue (build must cover it itself)
- Verification commands OBSERVED (unverified hint — build must confirm): \`make test\`

## Key decisions (what and why, and what was rejected — why)
- Rows follow the active filters. Rejected "everything the query can return": it is
  not what the button appears to promise, and it is the row-cap problem in disguise.

## Other assumptions
- [?: is a 50 000-row cap acceptable for the first iteration, or must it stream unbounded?]

## Definition of Done
1. given the report with no filters → the file contains every row the screen shows
2. given the "Team" filter set to Platform → 47 data rows plus one header row
3. given a filter matching nothing → the header row and no data rows
4. given a cell containing the delimiter → the value is quoted and re-parses unchanged
5. given a result above the cap → the documented refusal, not a truncated file
6. given any permutation of the input rows → row count and column set unchanged
7. given the file opened as its consumer opens it → the header equals the visible labels`,

    note:
      '<strong>Look at what the DoD is not.</strong> It is not “the export works”. Every item is a ' +
      'pair a machine can run and a human can check, the expected value comes from the requirement ' +
      'rather than from whatever the code will return, and items 3–6 are the negative, the ' +
      'boundary and — where no literal value can be derived independently — a metamorphic ' +
      'invariant.',
  },

  clear: {
    rail: '/clear',
    lab: 'a fresh context',
    heading: '<code>/clear</code> — start implementation separately',
    why:
      'The context that wrote the DoD already knows the intended answer. Implementation therefore ' +
      'starts in a fresh session, using the written artifact as the handoff.',
    cost:
      'This would normally mean paying for the code recon twice. It doesn’t, because the <em>Code ' +
      'map</em> above carries a <code>git hash-object</code> hash per file. <code>build</code> ' +
      're-hashes those paths and spends recon only on what actually moved.',
    snippet: `<span class="c">/clear</span>
<span class="c">/prorab:build</span>
<span class="d">   recon reused: 6/6 hashes fresh, 0 stale</span>`,
    caveat:
      'A matching hash proves a file is unchanged — not that <code>refine</code> read it ' +
      'correctly. So any map claim that drives an external-contract edit still gets its current ' +
      'source opened, and the map’s observed verification commands remain a hint that must be ' +
      'confirmed before anything is run. Contexts saved this way are banked, not respent.',
  },

  build: {
    rail: 'build',
    lab: 'explicit requirement → matching code',
    heading: '<code>/prorab:build</code> — turnkey, with the agents checking each other',
    consent:
      'The command continues through normal implementation steps without asking for routine ' +
      'approval. It stops for a real blocker, including an unresolved <code>[?:&nbsp;…]</code> in ' +
      'the IDEA:',

    blockerName: 'the one interruption',
    blocker: `Blocker — the IDEA leaves an open fork that decides a DoD item:
  [?: is a 50 000-row cap acceptable for the first iteration?]

  ① cap at 50 000 rows, refuse above it with a documented message
  ② no cap, stream unbounded and accept the timeout risk
  ③ cap at 50 000 but make it configurable`,

    autonomy:
      'Before planning, it derives the project’s test, lint, type-check, and build commands from ' +
      'repository guidance, CI, and task runners. It then selects a context tier and runs the ' +
      'workflow: inspection → plan → implementation by dependency → review → verification.',

    testHeading: 'How a test proves its value',
    testLede:
      'Each task ends with checks at the level and location the repository already uses. The ' +
      'discipline is what stops a test from faking green:',

    redName: 'DoD #2, written before the implementation exists',
    red: `$ make test TARGET=tests/test_export.py::test_filter_is_respected

<span class="r">FAILED</span> tests/test_export.py::test_filter_is_respected
<span class="r">E   AssertionError: expected 47, got 0</span>

<span class="g">✓ a valid red</span> — it failed on the assertion, with the value from DoD #2.
<span class="d">  An ImportError or a fixture error is NOT a red: it means the test is wrong,
  and the test gets fixed before any implementation is written.</span>`,

    skeptic:
      'Then the code is written until that goes green — and only then. Afterwards the ' +
      '<strong>“tests” dimension is reviewed by a separate skeptic with a fresh context</strong>, ' +
      'one that did not write the code. Its input is the DoD and the test diff; it opens the ' +
      'implementation only to confirm a finding. Its default is inverted from the usual one:',

    rubric:
      '<strong>A green <code>tests/</code> does not, by itself, close a DoD item.</strong> The ' +
      'skeptic works a yes/no rubric per item, and any “no” is a finding: was a plausible ' +
      'regression injected and did the test catch it; is the expected value traceable to a named ' +
      'DoD item rather than to a snapshot of the code; does the real unit execute, un-mocked; are ' +
      'the negative and boundary present; and a grep across new and changed tests for ' +
      '<code>skip</code>, <code>xfail</code>, commented-out cases, <code>assert True</code>, ' +
      'tautologies, <code>sys.exit(0)</code>, <code>try/except</code> without re-raise, and a ' +
      'hardcoded answer keyed on the test input.',

    sabotage:
      'The sabotage probe runs in a temporary isolated worktree containing the task’s patch — ' +
      'never in your working tree, and never undone with <code>git checkout --</code>, ' +
      '<code>reset</code> or <code>clean</code>. How many mutations happen is a separate dial ' +
      'from the context tier: <code>economy</code> runs none, <code>balanced</code> (the default) ' +
      'takes one representative mutation per critical cluster, <code>thorough</code> mutates each ' +
      'substantial DoD item.',

    docsHeading: 'Documentation is part of the change, not a follow-up',
    docs:
      'As each task lands, the documents the change made <em>factually wrong</em> are corrected in ' +
      'place: a renamed path, a changed default or flag, an example that would now behave ' +
      'differently. Historical documents — <code>CHANGELOG.md</code>, release notes, ADRs, ' +
      '<code>tasks/archive/**</code> — are never rewritten to match new code. And “nothing was ' +
      'affected” has to be earned by actually grepping for the symbols, paths and values the ' +
      'change touched: an empty result <em>is</em> the evidence.',

    implName: 'tasks/IMPL-csv-export.md — the re-grounding table',
    impl: {
      head: ['DoD item', 'closed by', 'proof'],
      rows: [
        [
          '#2 — 47 rows under the Platform filter',
          '<code>test_filter_is_respected</code>',
          'red-first · <code>4b91…</code>',
        ],
        [
          '#3 — empty result → header only',
          '<code>test_empty_result_has_header_only</code>',
          'red-first · <code>4b91…</code>',
        ],
        [
          '#4 — delimiter inside a cell',
          '<code>test_quoting_roundtrip</code>',
          'mutation → red · <code>4b91…</code>',
        ],
        [
          '#5 — above the cap → refusal',
          '<code>test_row_cap_refuses</code>',
          'red-first · <code>4b91…</code>',
        ],
      ],
    } as Table,

    handoff:
      'That third column is not decoration. It is a <strong>handoff</strong>: it records how each ' +
      'test was shown to be capable of failing, with the test file’s hash. The next command ' +
      're-hashes those entries and refuses to pay for the same proof twice.',
  },

  verify: {
    rail: 'verify',
    lab: 'does it work for the person who uses it?',
    heading: '<code>/prorab:verify</code> — from outside the code',
    intro:
      'Code-aware checks are necessary, but they may inherit the implementation’s assumptions. ' +
      'This command gives user-facing verification to a separate context.',

    halves: [
      {
        num: 'code-aware half',
        title: 'Scope, charter, coverage',
        body:
          'The main loop derives the scope with commands rather than impressions (<code>git ' +
          'status --porcelain</code>, the branch against its base, <code>git diff --stat</code>), ' +
          'reduces it to <em>user-visible surfaces</em>, and fixes the oracle before anything is ' +
          'driven. If nothing user-visible remains, it says so and names the right instrument ' +
          'instead of inventing a scenario.',
      },
      {
        num: 'blind half',
        title: 'The probing context',
        body:
          'Delegated at <em>every</em> tier, including the cheapest, because blindness cannot be ' +
          'self-imposed by a context that has already read the diff. It gets the charter and ' +
          'nothing else, and returns a declaration of every file it read, every command it ran ' +
          'and every locator it used.',
      },
    ] as Card[],

    noFixes:
      'Nothing is fixed here. The only code this command writes is test code; a confirmed defect ' +
      'is routed — with its reproduction — to the command that owns fixes, so that command starts ' +
      'red.',

    verdictName: 'tasks/verify/VERIFY-csv-export.md',
    verdicts: {
      head: ['behavior, as a user meets it', 'expected, and where it comes from', 'verdict', 'grade'],
      rows: [
        [
          'Export with the Team filter on Platform',
          '47 data rows + header → DoD #2',
          'works',
          'observed',
        ],
        ['Export with a filter matching nothing', 'header row only → DoD #3', 'works', 'observed'],
        [
          'A cell containing the delimiter',
          'quoted, re-parses intact → DoD #4',
          'works',
          'observed',
        ],
        [
          'Header text in a non-default language',
          'the visible column labels → DoD #7',
          '<strong>differs</strong>',
          'observed',
        ],
        ['Above the row cap', 'the documented refusal → DoD #5', 'unverifiable', '—'],
      ],
    } as Table,

    twoRows:
      'Two of those rows are the point of the whole command. ' +
      '<strong><code>differs</code></strong> is not automatically a defect: observed behavior that ' +
      'contradicts the requirement can mean stale code <em>or</em> a stale requirement, so it says ' +
      'which reading the evidence supports and leaves the product call to you. ' +
      '<strong><code>unverifiable</code></strong> is a legitimate, useful result — here the ' +
      'environment could not be seeded with two million rows — and it names exactly what is ' +
      'missing. A fabricated “works” is not a result at all, which is why a <code>works</code> ' +
      'resting on the system’s own output, on “no error”, or on a screenshot with no compared ' +
      'value gets downgraded rather than accepted.',

    coverageName: 'the coverage table — would a test catch this breaking?',
    coverage: {
      head: ['behavior', 'before', 'test that closes it', 'proof'],
      rows: [
        [
          'filter respected',
          'covered (reused)',
          '<code>test_filter_is_respected</code>',
          'reused from IMPL (red-first)',
        ],
        [
          'empty result',
          'covered (reused)',
          '<code>test_empty_result_has_header_only</code>',
          'reused from IMPL (red-first)',
        ],
        [
          'header = visible labels',
          '<strong>absent</strong>',
          '<code>test_header_uses_visible_labels</code> <span class="dim">(written here)</span>',
          'mutation → red · <code>c7ea…</code>',
        ],
      ],
    } as Table,

    budget:
      'The first two cost nothing: their hashes still match what <code>build</code> recorded, so ' +
      'the proof is reused rather than repeated. The budget goes to the third — DoD&nbsp;#7 was ' +
      'stated, but nothing in the suite actually asserts it, so the behavior the probe just found ' +
      'disagreeing with the requirement is also the one nothing would catch breaking. Note that ' +
      'red-first cannot apply to a test written after the fact: the behavior already exists, so a ' +
      'new test starts green, and the only thing that makes it worth anything is proving it can ' +
      'fail.',
  },

  announce: {
    rail: 'announce',
    lab: 'tell people, without overclaiming',
    heading: '<code>/prorab:announce</code> — twenty seconds of someone else’s attention',
    intro:
      'This is a short update for product, QA, or another team. It explains what shipped without ' +
      'requiring the reader to open the code. Claims are checked against the IMPL, diff, and test ' +
      'status; uncertain claims are removed or qualified.',

    messageName: 'ready to paste into a messenger',
    message: `📤 CSV export on the reports screen

In short: the report you are looking at can now be downloaded as a CSV —
exactly the rows and columns on screen, with the filters you have applied.

🆕 What's new
• "Export CSV" next to the filters — downloads what the screen shows
• Column headers match the labels you see, so the file needs no decoding

⚠️ Important
• Above 50 000 rows the export is refused rather than truncated — narrow
  the filters and repeat
• Header labels currently follow the default interface language; a fix is
  tracked separately

Where to see it: Reports → the toolbar above the table`,

    /* The example above is rendered in the language of this page; the note says why, so a reader
       does not take it for a claim about what the command produces. */
    languageNote:
      'The announcement is written in the task’s language (Russian by default, detected from how ' +
      'you phrased the request) with terms taken verbatim from the app’s own UI — never ' +
      'round-tripped through a translation. English above only because this page is in English.',
  },

  lanes: {
    rail: 'other lanes',
    lab: 'not every task is that task',
    heading: 'Small changes and technical-quality work',
    cards: [
      {
        num: '/prorab:quick',
        title: 'The two-file change',
        body:
          'One pass, two contexts, no <code>Workflow</code>, no IDEA, no IMPL, nothing archived. ' +
          'What survives is the floor: a DoD stated in chat <em>before</em> any edit, a red-first ' +
          'test, the project’s own checks, one independent verifier, the documentation duty, and ' +
          'one short record under <code>tasks/quick/</code>. It re-checks its eligibility gate ' +
          'after reading the code — an external contract, more than two or three files, two ' +
          'incompatible readings, auth/payment/permission logic — and hands over the moment one ' +
          'fires, leaving a record marked <code>escalated</code> if it had already touched files.',
      },
      {
        num: 'prorab-tech',
        title: 'The inverted proof',
        body:
          '<code>audit → refactor</code> for structural debt and <code>lint-audit → ' +
          'lint-fix</code> for static debt. Both executors prove the opposite thing from ' +
          '<code>build</code>: that <em>old</em> behavior did not change. That means a ' +
          'characterization net green on the OLD code before anything is touched, a contract ' +
          'diff, a drift search, a differential old-versus-new run — and the default inverted, so ' +
          'behavior counts as changed until equivalence is proven. Bugs and quirks are preserved ' +
          'too; a latent bug the analyzers surface is routed to the product track, not silently ' +
          'fixed.',
      },
    ] as Card[],
    verifyAnywhere:
      '<code>/prorab:verify</code> is not tied to any of this. It works on any scope — after ' +
      '<code>build</code>, after <code>quick</code>, or on a branch nobody used the framework for ' +
      'at all. Point it at a branch, a commit range, <code>uncommitted</code>, or nothing, and it ' +
      'derives the scope itself.',
  },

  result: {
    rail: 'the result',
    lab: 'afterwards',
    heading: 'What is in the repository when it is over',
    tree: `tasks/
├── archive/2026/csv-export/
│   ├── IDEA-csv-export.md      <span class="d"># the decisions, and what was rejected — with reasons</span>
│   ├── IMPL-csv-export.md      <span class="d"># what was built, DoD → test → how the test was proven</span>
│   └── ANNOUNCE-csv-export.md  <span class="d"># only if you asked for it to be saved</span>
├── verify/VERIFY-csv-export.md <span class="d"># outside-in verdicts, defects, coverage</span>
└── memory/decisions/           <span class="d"># at most a couple of durable, verified lines</span>`,
    why:
      'The code shows what the system does. These records preserve why it works that way, which ' +
      'alternatives were considered, and how the result was verified.',
    archiving:
      'Archiving only happens after a re-check of scope and every mandatory DoD item. A blocker, ' +
      'a partial implementation or a failed mandatory check leaves everything active, exactly ' +
      'where you can see it.',
    ctaInstall: 'Install Prorab →',
    ctaMechanics: 'The mechanics behind all of this',
  },
};

export type Walkthrough = typeof walkthrough;
