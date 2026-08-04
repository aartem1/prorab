import type {
  AmbGroup,
  Card,
  CmdLink,
  Hop,
  OracleState,
  PipeNode,
  Plural,
  Stat,
  TermLine,
} from '../types';

export const overview = {
  meta: {
    title: 'Prorab — make the requirement explicit, then prove the code matches it',
    description:
      'A Claude Code marketplace with two plugins. It drives an unstated requirement into the ' +
      'open — contradictions, gaps, hidden assumptions — turns it into a checkable Definition of ' +
      'Done, and then keeps every test’s expected value traceable back to that requirement ' +
      'instead of to the code.',
    ogTitle: 'Prorab — an agentic development framework for Claude Code',
    ogDescription:
      'An agent will implement the half of the requirement you never stated, and its tests will ' +
      'agree with it. Prorab breaks that loop.',
  },

  hero: {
    eyebrow: 'Claude Code marketplace · two plugins · ten commands',
    titleA: 'Make the requirement explicit.',
    titleB: 'Then prove the code matches it.',
    lede:
      'A coding agent turns any requirement into code — including the half of it you never ' +
      'stated. It fills that half with plausible defaults, writes tests that assert the defaults ' +
      'it picked, and reports green. Prorab is a set of Claude Code commands built to break that ' +
      'loop.',
    ctaInstall: 'Install →',
    ctaWalkthrough: 'Watch one task go through',
    badges: {
      runtime: 'no runtime, no API keys, no daemon',
      artifacts: 'artifacts stay in your repo',
    },
  },

  terminal: {
    caption: 'schematic · one feature, start to finish',
    replay: 'replay',
    note:
      'A condensed schematic of what the three commands establish — not a captured transcript. A ' +
      'real session is a conversation: <code>refine</code> spends most of it asking you ' +
      'questions, and <code>build</code> spends most of it in tool calls you can watch scroll past.',
    lines: [
      { kind: 'cmd', text: '/prorab:refine  add a CSV export to the reports page' },
      { kind: 'out', text: '   read 6 files · 2 Explore contexts' },
      { kind: 'out', text: '   🟥 "everything the user sees" vs "the current filter" — which one?' },
      { kind: 'out', text: '   🟧 empty result: header-only file, or a refusal?' },
      { kind: 'out', text: '   🟨 assumed: UI labels as headers, not field names   [?: confirm]' },
      {
        kind: 'ok',
        text: '   ✓ settled — 14 questions raised, 12 answered, 2 kept as explicit forks',
      },
      {
        kind: 'file',
        text: '   → IDEA-csv-export.md   DoD: 7 checkable items · Code map: 6 files, hashed',
      },
      { kind: 'gap', text: '' },
      { kind: 'cmd', text: '/clear  ·  /prorab:build' },
      { kind: 'out', text: '   recon reused: 6/6 hashes fresh · tier M · 6 contexts' },
      { kind: 'out', text: '   DoD #2 → test written before the code' },
      {
        kind: 'bad',
        text: '   ✗ FAILED  AssertionError: expected 47, got 0   ← red for the right reason',
      },
      {
        kind: 'ok',
        text: '   ✓ green · skeptic: 7/7 items, every expected value traced to the DoD',
      },
      { kind: 'file', text: '   → IMPL-csv-export.md' },
      { kind: 'gap', text: '' },
      { kind: 'cmd', text: '/prorab:verify' },
      { kind: 'out', text: '   charter: 4 surfaces · prober gets no path, no diff, no symbol' },
      { kind: 'out', text: '   downloaded the file, parsed it: 47 data rows, header = UI labels' },
      { kind: 'ok', text: '   ✓ mutation: shift the filter boundary → the suite goes red' },
      { kind: 'file', text: '   → VERIFY-csv-export.md' },
      { kind: 'note', text: '   nothing committed. nothing pushed. that is your call.' },
    ] as TermLine[],
  },

  problem: {
    rail: 'the problem',
    eyebrow: 'Why it exists',
    heading: 'A ticket is never as small as its sentence.',
    lede:
      'Here is a normal, reasonable, entirely unremarkable request. Open each underlined phrase ' +
      'in turn — and then the group that no phrase in the sentence points at.',

    ticketLabel: 'the ticket, exactly as it arrives',
    /* The sentence with a slot per clickable phrase. Word order is a translator's decision, so
       the slots may appear in any order and the text between them is theirs to write. */
    sentence: '“{0} {1} {2} to {3}.”',
    groups: [
      {
        label: '“Add”',
        text: 'Add',
        title: '“Add” — for whom, and under what limits?',
        decisions: [
          {
            question:
              'Does everyone who can open the report get the button, or only the roles allowed ' +
              'to see the underlying rows?',
            assumed: 'everyone who can see the page gets the button',
          },
          {
            question:
              'Is the export rate-limited or audited — and if it is, does the person clicking it ' +
              'find out?',
            assumed: 'no rate limit, no audit entry',
          },
        ],
      },
      {
        label: '“a CSV”',
        text: 'a CSV',
        title: '“a CSV” — a CSV in whose dialect?',
        decisions: [
          {
            question:
              'Delimiter: a comma, or a semicolon for the locales where the comma is a decimal ' +
              'separator?',
            assumed: 'a comma',
          },
          {
            question:
              'Encoding: UTF-8, or UTF-8 with a BOM so that Excel opens non-Latin text correctly?',
            assumed: 'UTF-8, no BOM',
          },
          {
            question:
              'Quoting and line endings: what happens to a value that itself contains the ' +
              'delimiter, a quote character, or a newline?',
            assumed: 'RFC-4180 quoting, LF line endings',
          },
          {
            question: 'Dates and numbers: raw and ISO, or formatted the way the screen formats them?',
            assumed: 'formatted exactly as the screen renders them',
          },
        ],
      },
      {
        label: '“export”',
        text: 'export',
        title: '“export” — what shape does the operation have?',
        decisions: [
          {
            question:
              'A synchronous download, or a background job that notifies you when the file is ready?',
            assumed: 'a synchronous streaming download',
          },
          {
            question: 'What happens when the report takes longer than the request timeout?',
            assumed: 'nothing — it works until it doesn’t',
          },
          {
            question:
              'Is there a row cap — and if it is exceeded, is the file truncated or is the ' +
              'request refused?',
            assumed: 'no row cap',
          },
        ],
      },
      {
        label: '“the reports page”',
        text: 'the reports page',
        title: '“the reports page” — which rows, which columns, which values?',
        decisions: [
          {
            question:
              'Which rows: exactly what the active filters and sorting show, or every row the ' +
              'underlying query can return?',
            assumed: 'the rows currently shown, filters applied',
          },
          {
            question: 'Which columns: the visible ones in their on-screen order, or the full record?',
            assumed: 'the visible ones, in screen order',
          },
          {
            question:
              'Which values: what is displayed after formatting and translation, or what is stored?',
            assumed: 'displayed values, already formatted',
          },
        ],
      },
    ] as AmbGroup[],

    ghostLead:
      'Those are the phrases. And then there are the decisions that no phrase in the sentence ' +
      'points at:',
    ghost: {
      label: 'in no phrase at all',
      text: 'open the unmentioned ones',
      title: 'Questions the sentence never raises',
      decisions: [
        {
          question:
            'Empty result: a header-only file, a zero-byte file, or a refusal with a message?',
          assumed: 'a header-only file',
        },
        {
          question:
            'The header row itself: the UI column labels in the current interface language, or ' +
            'stable field names a downstream script can rely on?',
          assumed: 'the UI labels, in whatever language is active',
        },
      ],
    } as AmbGroup,

    /* `{seen}`, `{total}` and `{left}` are filled in by the widget from the groups above. */
    progress: '<b>{seen}</b> of <b>{total}</b> open decisions surfaced · {left} still closed',
    progressGroups: { one: '1 group', other: '{n} groups' } as Plural,
    progressDone:
      '<b>{total}</b> open decisions in one sentence — and it stated the answer to none of them',

    idleTitle: '{total} decisions are already made in this sentence',
    idleBody:
      'Not by whoever wrote it — by whoever writes the code first, silently, and then tests the ' +
      'code against those same silent answers. Open a phrase to see which decisions.',
    assumedPrefix: 'assumed:',

    showAssumed: 'show what an agent fills in silently',
    hideAssumed: 'hide the silent defaults',
    assumedTitle: 'What gets decided for you, in the time it takes to start typing code',
    assumedKicker:
      'One answer per question, in the same order you just read them. Every one is defensible. ' +
      'None of them was your decision. And the tests will be written to assert exactly these — by ' +
      'the same context that chose them, from the same reading, in the same session. Green does ' +
      'not mean right; it means self-consistent.',

    note:
      '<strong>This is the failure Prorab is built around.</strong> Not that the agent writes bad ' +
      'code — modern models write decent code. That it silently converts an ambiguous requirement ' +
      'into a specific one, and then produces its own evidence that it was right.',
  },

  thesis: {
    rail: 'two conversions',
    eyebrow: 'The position',
    heading: 'Two conversions, and they must not happen in the same breath.',
    lede:
      'Prorab splits the job at the point where it usually collapses. First the requirement is ' +
      'made explicit — with a human answering, not a model guessing. Only then is it turned into ' +
      'code, by a run that is measured against the requirement rather than against itself.',
    cards: [
      {
        num: '01 / implicit → explicit',
        title: 'Drive out what nobody said',
        body:
          '<code>/prorab:refine</code> reads the actual code and then interrogates the idea, ' +
          'sorting what it finds into contradictions, gaps that decide scope, and assumptions it ' +
          'had to invent to make the idea look coherent. It writes no code. Anything still open ' +
          'when the dialogue ends is written down as <code>[?:&nbsp;…]</code> — an explicit fork, ' +
          'not a default — and <code>build</code> treats that marker as a blocker it has to ask ' +
          'about.',
      },
      {
        num: '02 / explicit → matching code',
        title: 'Keep the correspondence provable',
        body:
          'The dialogue ends in a numbered <strong>Definition of Done</strong>: checkable ' +
          '<code>given&nbsp;→&nbsp;expected</code> pairs whose expected values come from the ' +
          'requirement. Every test is derived from a numbered item, has to fail before it may ' +
          'pass, and is judged by a skeptic that did not write it. A green suite, on its own, ' +
          'closes nothing.',
      },
    ] as Card[],
    dodLede:
      'A DoD item looks like this — and where an exact value cannot be derived independently ' +
      '(ranking, aggregates, parsing, anything non-deterministic), it is replaced by a ' +
      '<strong>metamorphic invariant</strong> from the requirement, never by an always-true ' +
      'relation:',
    dodExample: `2. given a report with 1 284 matching rows and the "Team" filter set to Platform
   → the file contains 47 data rows plus one header row
3. given the same report and a filter that matches nothing
   → the header row and no data rows                          <span class="d">(negative)</span>
4. given a cell whose text contains the delimiter
   → the value is quoted, and re-parsing the file returns it unchanged   <span class="d">(boundary)</span>
6. given any permutation of the input rows
   → the row count and the column set are unchanged   <span class="d">(metamorphic, where no literal exists)</span>`,
  },

  oracle: {
    rail: 'the oracle rule',
    eyebrow: 'The rule that runs through all ten commands',
    heading: 'The expected value never comes from the code.',
    lede:
      'This is the whole framework compressed into one sentence. Below, one implementation with ' +
      'an off-by-one on the filter boundary, and two tests that differ in nothing except where ' +
      'their expected value came from. Move the implementation and watch which test can still ' +
      'tell you something. <span class="small">(An illustration you can click, not a live test ' +
      'run.)</span>',

    impl46: 'implementation returns 46',
    impl40: 'later regression: 40',
    impl47: 'bug fixed: 47',
    hint: 'DoD&nbsp;#2 fixes the answer at 47 data rows.',

    passed: 'passed',
    failed: 'failed',

    reqName: 'test_export_respects_the_active_filter',
    reqSource: 'expected value ← the requirement (DoD #2)',
    reqCode: `rows = export_csv(report, team="platform")
assert count_data_rows(rows) == <span class="c">47</span>
assert rows[0] == <span class="c">"Team,Candidate,Stage,Updated"</span>`,

    snapName: 'test_export_matches_snapshot',
    snapSource: 'expected value ← a run of the implementation',
    snapCode: `rows = export_csv(report, team="platform")
assert rows == load_fixture(<span class="r">"export.golden.csv"</span>)
<span class="d"># the golden file was captured by running the code</span>`,

    states: {
      '46': {
        req: 'E   AssertionError: expected 47, got 46',
        snap: '1 passed — the file equals export.golden.csv',
        line:
          'The snapshot did not <em>miss</em> the bug — it <strong>recorded</strong> it. The ' +
          'golden file was produced by running this exact code, so 46 is now the specification, ' +
          'and it will stay green for as long as the bug survives.',
      },
      '40': {
        req: 'E   AssertionError: expected 47, got 40',
        snap: 'E   AssertionError: file differs from export.golden.csv',
        line:
          'Both red — but only one of them knows what the right answer is. The snapshot can ' +
          'report that the output changed; it cannot report that the output is wrong.',
      },
      '47': {
        req: '1 passed — 47 data rows, header row matches',
        snap: 'E   AssertionError: file differs from export.golden.csv',
        line:
          'Fixing the bug turns the snapshot red, and the reflex is to re-record the golden file. ' +
          'That is the whole failure mode: an expected value taken from the code always ends up ' +
          'agreeing with the code.',
      },
    } as Record<'46' | '40' | '47', OracleState>,

    chainHeading: 'Chain of custody for a single expected value',
    chainLede:
      'Each hop has one thing it is not allowed to accept. Break any of them and the run still ' +
      'goes green — which is exactly why each is stated as a rule the commands enforce rather ' +
      'than as advice.',
    hops: [
      {
        name: 'the requirement',
        what: 'Your answer to a question you were made to notice.',
        refuses: '✗ an assumption nobody stated',
      },
      {
        name: 'the DoD item',
        what: 'Numbered, checkable, <code>given → expected</code>, with a negative and a boundary.',
        refuses: '✗ an intention (“export should work”)',
      },
      {
        name: 'the assertion',
        what:
          'Written before the code and run first — a valid red is <code>AssertionError</code>, ' +
          'not an import error.',
        refuses: '✗ a value read off the implementation',
      },
      {
        name: 'the outside-in probe',
        what: 'Driven by a context that never opened the implementation.',
        refuses: '✗ “it returned something and didn’t error”',
      },
    ] as Hop[],
    note:
      '<strong>And a test that cannot fail is not coverage.</strong> Every test the framework ' +
      'counts has been shown to go red: either it was red for the right reason before the code ' +
      'existed, or a plausible regression was injected into an isolated worktree — invert a ' +
      'condition, shift a boundary, flip a sign, delete a branch, return a constant — and the ' +
      'test caught it. If it didn’t, the test is fixed, not the report.',
  },

  outsideIn: {
    rail: 'outside-in',
    eyebrow: 'The last check',
    heading: 'A reviewer who has read the code can’t un-read it.',
    lede:
      '<code>/prorab:verify</code> establishes whether the thing works for the people who meet ' +
      'it from outside — someone in a UI, an API client, a CLI user, a reader of an export. So ' +
      'the context that drives the system is kept structurally blind: it is delegated at every ' +
      'tier, including the cheapest, and receives a charter of surfaces and expected results and ' +
      'nothing else.',

    handedTitle: 'What the probing context is handed',
    peekShow: 'show what it is never given',
    peekHide: 'hide it again',

    charterTitle: 'the charter',
    charter: `surface      the report screen → the "Export CSV" control
precondition seed 1 284 rows through the project's own fixture path
action       set the Team filter to "Platform", start the export
expected     47 data rows + 1 header row              <span class="c">← DoD #2</span>
             header text equals the visible column labels
negative     a filter matching nothing → header row, no data rows
boundary     a cell containing the delimiter → quoted, re-parses intact
level        L1 — headless run; assert on role, label, text, status`,

    forbiddenTitle: 'never crosses over',
    forbidden: `src/reports/export.py:118   build_csv_rows()
src/reports/filters.py:44   apply_team_filter()
tests/test_export.py        the tests build just wrote
the diff                    +214 −6 across 5 files
the symbol names, the paths, the framework, the ORM`,

    foot:
      'Blindness is <strong>checkable, not promised</strong>: every prober returns a declaration ' +
      'of the files it read, the commands it ran and the locators it used. An implementation ' +
      'file, a test file or the diff in that list drops the items it touched to <em>not ' +
      'independently verified</em> — never quietly to <em>works</em>.',

    note:
      'A browser surface is driven <strong>headless by default</strong>. Not only because it is ' +
      'cheaper than a model clicking through screenshots, but because it is a stronger check: a ' +
      'screenshot after pressing <em>Save</em> shows a toast, while a script reloads the page and ' +
      're-reads the resource — which is what actually proves anything was stored. Forcing a 500, ' +
      'a timeout or an offline state is one line there and impractical by hand, and console ' +
      'errors and failed requests come out for free. Pixels are reserved for genuinely ' +
      'perceptual cases; an interactive visual session is an escalation that has to name and log ' +
      'its trigger.',
  },

  loop: {
    rail: 'the loop',
    eyebrow: 'How you actually work with it',
    heading: 'Two sessions, and a deliberate <code>/clear</code> between them.',
    lede:
      'The commands are not a pipeline you configure — they are things you type. This is the ' +
      'shape of an ordinary feature.',
    script: `<span class="d">── session 1 ────────────────────────────────────────────</span>
<span class="c">/prorab:refine</span>  add a CSV export to the reports page
<span class="d">   a dialogue: it reads the code, argues, asks 1–4 questions at a time
   → tasks/ideas/IDEA-csv-export.md  — scope, decisions, DoD, Code map</span>

<span class="c">/clear</span>
<span class="d">   not hygiene. build's DoD check has to be independent of the
   conversation that produced the DoD — and the hashed Code map is
   what keeps the fresh session from re-reading the same six files.</span>

<span class="d">── session 2 ────────────────────────────────────────────</span>
<span class="c">/prorab:build</span>      <span class="d">→ working code + tasks/IMPL-csv-export.md</span>
<span class="c">/prorab:verify</span>     <span class="d">→ outside-in verdict + the tests nobody wrote</span>
<span class="c">/prorab:announce</span>   <span class="d">→ a short factual message you can forward</span>`,

    quick:
      'For a two-file change where all of that costs more than the work, there is ' +
      '<code>/prorab:quick</code>: one pass, two contexts, no artifacts beyond a single short ' +
      'record — and the same floor, a DoD stated before editing, a red-first test, one ' +
      'independent verifier. It re-checks its own eligibility <em>after</em> reading the code and ' +
      'hands the task over rather than finishing a large change on a small budget.',

    tracksHeading: 'Two tracks, one discipline',
    tracksLede:
      'The product track proves that <em>new</em> behavior matches a requirement. The tech track ' +
      'proves that <em>old</em> behavior did not change — a different proof obligation, so a ' +
      'different executor. Pick a stage.',
    tabProduct: 'product',
    tabTech: 'tech quality',
    writes: 'writes →',

    product: [
      {
        step: '01',
        name: 'refine',
        cmd: '/prorab:refine',
        what:
          'Your sparring partner while the idea is still raw. Skeptical questions, real code ' +
          'study, contradictions and hidden assumptions surfaced — until a spec can be written ' +
          'meaningfully. It writes no code, and it never declares the idea ready: you do.',
        writes:
          'tasks/ideas/IDEA-&lt;slug&gt;.md — scope, decisions, DoD, and a hashed Code map of ' +
          'everything it read',
      },
      {
        step: '02',
        name: 'build',
        cmd: '/prorab:build',
        what:
          'Turnkey implementation through a multi-agent Workflow: recon → plan → DAG-ordered ' +
          'implementation → adversarial review → verification. No approval gate in the middle; ' +
          'the agents check each other. It stops only on a real blocker — an unclosed [?:…], a ' +
          'failed risk spike, or an IDEA that contradicts the code.',
        writes:
          'working code + tasks/IMPL-&lt;slug&gt;.md, with a DoD table stating how each test was ' +
          'proven able to fail',
      },
      {
        step: '03',
        name: 'verify',
        cmd: '/prorab:verify',
        what:
          'A black-box check by a context that never reads the implementation — no path, no ' +
          'diff, no symbol. Expected values come from the requirement, never from what the system ' +
          'printed. Then it proves a project test actually fails when the behavior breaks.',
        writes: 'tasks/verify/VERIFY-&lt;slug&gt;.md + the missing tests, each proven by a mutation',
      },
      {
        step: '04',
        name: 'announce',
        cmd: '/prorab:announce',
        what:
          'The result as a short, fact-checked message: what shipped, what changed, how it is ' +
          'computed. Readable in 20–30 seconds by someone who will never open the diff. Claims ' +
          'are taken from what landed — the IMPL and the diff — not from what the IDEA intended.',
        writes: 'text in chat (a file only when the task is already archived)',
      },
      {
        step: 'alt',
        name: 'quick',
        cmd: '/prorab:quick',
        what:
          'The cheap lane for the daily two-file change: no IDEA, no IMPL, no archive, no ' +
          'Workflow, fixed at two contexts. The floor survives — a DoD before editing, a ' +
          'red-first test, the project’s own checks, one independent verifier. If the task turns ' +
          'out not to be small, it hands over instead of finishing on the wrong budget.',
        writes: 'code + one compact tasks/quick/QUICK-&lt;slug&gt;.md',
      },
      {
        step: 'any',
        name: 'ask',
        cmd: '/prorab:ask',
        what:
          'Answers a question about this project or its history — how a component works, why a ' +
          'decision was made, who consumes a contract, what was already verified. It separates ' +
          'what is confirmed in current code from what only an old artifact says, and cites its ' +
          'sources.',
        writes: 'nothing (at most it corrects a memory entry its own investigation disproved)',
      },
    ] as PipeNode[],

    tech: [
      {
        step: '01',
        name: 'audit',
        cmd: '/prorab-tech:audit',
        what:
          'A multi-agent sweep for structural debt by smell class, plus churn×complexity from ' +
          'git — code that is changed often AND complex is where refactoring pays. Clusters, ' +
          'ranks by value × safety × size × confidence, adversarially verifies the top one. ' +
          'Touches no code.',
        writes:
          'tasks/audits/AUDIT-&lt;slug&gt;.md — a ranked backlog + one spec’d candidate, hash-stamped',
      },
      {
        step: '02',
        name: 'refactor',
        cmd: '/prorab-tech:refactor',
        what:
          'Prime directive: behavior preservation — bugs and quirks included. No net, no ' +
          'refactoring: characterization tests pinning the current behavior, green on the OLD ' +
          'code, before anything is touched. Then small steps, an adversarial drift search, a ' +
          'differential old-vs-new run, and a measured quality improvement. The default is ' +
          'inverted: behavior counts as changed until equivalence is proven.',
        writes: 'code + tasks/IMPL-refactor-&lt;slug&gt;.md',
      },
      {
        step: '03',
        name: 'lint-audit',
        cmd: '/prorab-tech:lint-audit',
        what:
          'What the static analyzers can actually say, and which tooling is configured, broken ' +
          'or absent. Runs everything available read-only, labels absent-tool numbers as manual ' +
          'estimates, then builds an ordered ladder: A autofix → B onboard tools → C first gate → ' +
          'D strictness ratchet.',
        writes: 'tasks/audits/LINT-&lt;slug&gt;.md — the ladder, the exact invocations, the gate entrypoint',
      },
      {
        step: '04',
        name: 'lint-fix',
        cmd: '/prorab-tech:lint-fix',
        what:
          'Exactly one rung of that ladder, turnkey, with an honest gate lifecycle: batches ' +
          'before C are preparatory and are never called locked, C creates and sabotage-proves ' +
          'the first gate, later batches tighten it and prove the changed coverage. A latent bug ' +
          'found on the way is routed to the product track, not silently fixed inside a pass that ' +
          'claims to change no behavior.',
        writes: 'code + gate evidence + tasks/IMPL-lint-&lt;plan&gt;-batch-&lt;id&gt;.md',
      },
    ] as PipeNode[],
  },

  cost: {
    rail: 'cost',
    eyebrow: 'The optimization track',
    heading: 'Discipline you can’t afford is discipline you won’t keep.',
    lede:
      'None of the above is the reason the framework exists — but all of it fails if a careful ' +
      'run costs an unbounded number of tokens. So every heavy command triages complexity from ' +
      'cheap signals (size, blast radius, novelty, reversibility, uncertainty) and picks a tier ' +
      'before it opens a single extra context.',

    tier: 'tier {n}',
    readout: '{n} / 16 contexts',
    legendSpent: 'spent by this command',
    legendCeiling: 'reachable only on confirmed critical risk',

    tiers: {
      S:
        'Two contexts, no Workflow at all. The main loop is the executor: it reads, edits and ' +
        'runs directly. This is the fixed shape of <code>/prorab:quick</code>, and the cheap tier ' +
        'of every other command.',
      M:
        'The usual shape for a real feature. The orchestrator holds the plan, the DoD table and ' +
        'the ledger; the reading happens in delegated contexts that hand back ~1500-token ' +
        'capsules of claims and pointers.',
      L:
        'Wide blast radius, external contracts, genuine uncertainty. Expandable to the absolute ' +
        'ceiling of 16 — dashed above — and only for confirmed critical risk or an explicit ' +
        '<code>--thorough</code>.',
    },

    enforced:
      'The count is cumulative for the whole command — the main context plus every delegated or ' +
      'Workflow context, retries included — and it is enforced in code, not in prose: a generated ' +
      'Workflow script carries the remaining allowance, counts what it schedules, and routes ' +
      'every launch through a wrapper that throws before exceeding it. You can pin the choice ' +
      'with <code>--fast</code>, <code>--thorough</code> or <code>--tier=S|M|L</code>; the ' +
      '16-context ceiling stays absolute.',

    occupancy:
      '<strong>A tier bounds how many contexts open, not how full each one gets.</strong> Those ' +
      'are different things, and a context stuffed with material nobody reads judges worse than ' +
      'one given the range that matters. So a second, orthogonal limit applies at every tier: raw ' +
      'suite output never enters a context — it goes to a file outside the working tree and comes ' +
      'back as a ~40-line digest — and a delegated context returns a capsule of claims and ' +
      '<code>path:line</code> pointers, never the material itself. Compaction may shorten ' +
      '<em>what</em> failed; concealing <em>that</em> something failed is a false report.',

    floor:
      '<strong>What no tier can buy back.</strong> The safety floor is not part of the budget: ' +
      'the characterization net or baseline, the contract diff, the drift search, a DoD skeptic ' +
      'with a fresh context, and a sabotage-proven gate whenever one is created or changed. ' +
      'Tiering cuts how many lenses look at the code. It never cuts the evidence.',
  },

  install: {
    rail: 'install',
    eyebrow: 'Install',
    heading: 'Three lines, inside Claude Code.',
    lede:
      'Both plugins live in the same marketplace but install separately — take one track or both. ' +
      'There is nothing to run and nothing to configure: the commands are prompt files plus a few ' +
      'shared contracts.',
    update:
      'Update later with <code>/plugin marketplace update prorab</code>. Developing the framework ' +
      'itself? Point the marketplace at a local clone: <code>/plugin marketplace add ' +
      '/path/to/prorab</code>.',
    firstTaskHeading: 'Then run your first task',
    firstTask:
      '<span class="c">/prorab:refine</span>  &lt;describe the idea in your own words — raw and ' +
      'half-formed is fine&gt;',
    firstTaskNote:
      'It will paraphrase the idea back at you first, so you can see immediately whether it ' +
      'understood it, then show its unclarity map and start asking. It writes no code and it will ' +
      'not declare the idea ready — that call stays yours.',
  },

  fit: {
    rail: 'fit',
    eyebrow: 'Fit',
    heading: 'When not to use this.',
    lede:
      'The cases where it is the wrong tool, stated plainly — because a framework that only ' +
      'describes its own strengths is not describing anything.',
    cards: [
      {
        num: 'portability',
        title: 'You need more than one coding agent',
        body:
          'Prorab is Claude Code only — plugins, slash commands, subagents, <code>Workflow</code>. ' +
          'Nothing here moves to another agent without being rewritten. If agent portability ' +
          'matters more than anything else on this page, pick something portable.',
      },
      {
        num: 'artifacts',
        title: 'You don’t want the trail in git',
        body:
          'Every command leaves a file under <code>tasks/</code>. That trail is the product — it ' +
          'is what lets someone reconstruct in six months what was decided and why. If you would ' +
          'rather keep the repo clean, you are paying the ceremony and discarding what it buys.',
      },
      {
        num: 'scale',
        title: 'The change really is one line',
        body:
          '<code>refine</code> on a typo fix is an interrogation. <code>quick</code> exists for ' +
          'the small lane and still writes a short record. Below that, just ask the agent ' +
          'directly — nothing here improves a rename.',
      },
      {
        num: 'inputs',
        title: 'Your requirements already arrive precise',
        body:
          'If someone else writes the spec, and it closes the negatives and the boundaries, the ' +
          'first conversion is already done. <code>refine</code> will feel like it is ' +
          're-litigating settled questions, and it mostly will be.',
      },
      {
        num: 'evidence',
        title: 'The project has no way to run a check',
        body:
          'The floor rests on executable evidence. With no test harness and no analyzers the ' +
          'commands report the gap honestly rather than invent tooling — correct behavior, and ' +
          'also much less value than the same commands get from a project with a suite.',
      },
      {
        num: 'expectations',
        title: 'You expect a smarter model',
        body:
          'It is not one. Generation quality is whatever your model already gives you. What ' +
          'changes is what the model is allowed to call <em>done</em>, and what it may spend ' +
          'getting there.',
      },
    ] as Card[],
    note:
      '<strong>Where it does pay off:</strong> an existing codebase, a requirement that can be ' +
      'read more than one way, and a wrong-but-green implementation that would be expensive to ' +
      'discover later. That is the whole target — narrower than it sounds, and very common.',
  },

  artifacts: {
    rail: 'artifacts',
    eyebrow: 'What lands in your project',
    heading: 'The commands are global. The evidence is yours.',
    lede:
      'Commands install once and update from git. Everything they write is local to the working ' +
      'project and worth committing — and no command commits or pushes unless you ask it to.',
    tree: `tasks/
├── ideas/IDEA-&lt;slug&gt;.md                     <span class="d"># refine</span>
├── IMPL-&lt;slug&gt;.md                           <span class="d"># build</span>
├── quick/QUICK-&lt;slug&gt;.md                    <span class="d"># quick</span>
├── verify/VERIFY-&lt;slug&gt;.md                  <span class="d"># verify</span>
├── audits/AUDIT-&lt;slug&gt;.md                   <span class="d"># audit</span>
├── audits/LINT-&lt;slug&gt;.md                    <span class="d"># lint-audit</span>
├── IMPL-refactor-&lt;slug&gt;.md                  <span class="d"># refactor</span>
├── IMPL-lint-&lt;plan-slug&gt;-batch-&lt;id&gt;.md      <span class="d"># lint-fix</span>
├── memory/                                  <span class="d"># small, verified project memory</span>
└── archive/&lt;YYYY&gt;/&lt;task-slug&gt;/              <span class="d"># completed, verified bundles</span>`,
    stats: [
      { value: '16', label: 'absolute context ceiling, flags included' },
      { value: '~1500', label: 'tokens a delegated context may hand back' },
      { value: '~40', label: 'lines of digest per suite or analyzer run' },
      { value: '0', label: 'commits or pushes you didn’t ask for' },
    ] as Stat[],
    archiving:
      'A completed, verified bundle is archived; a blocked or partial one stays active. Archiving ' +
      'verifies artifact identity and links first, refuses any path outside <code>tasks/</code>, ' +
      'never overwrites an existing directory, updates the links and reports every moved file.',
  },

  index: {
    eyebrow: 'Reference',
    heading: 'Which command do I need?',
    lede:
      '<code>refine → build</code> for anything touching an external contract, spanning layers, ' +
      'or readable more than one way. <code>quick</code> for the daily two-file change. You don’t ' +
      'have to guess right — each one re-checks its own fit and hands over.',
    links: [
      { cmd: '/prorab:refine', what: 'Think an idea through before anyone writes code' },
      { cmd: '/prorab:build', what: 'Implement a refined idea, end to end' },
      { cmd: '/prorab:quick', what: 'Make a small everyday change (1–2 files)' },
      { cmd: '/prorab:verify', what: 'Check it actually works for its users' },
      { cmd: '/prorab:announce', what: 'Tell the team what shipped' },
      { cmd: '/prorab:ask', what: 'Ask about this project or its history' },
      { cmd: '/prorab-tech:audit', what: 'Find the debt worth paying down first' },
      { cmd: '/prorab-tech:refactor', what: 'Pay it down without changing behavior' },
      { cmd: '/prorab-tech:lint-audit', what: 'Get linters and types under control' },
      { cmd: '/prorab-tech:lint-fix', what: 'Land one safe static-quality pass' },
    ] as CmdLink[],
  },

  closing: {
    heading: 'Say what you actually want. Then make the code prove it.',
    lede: 'Everything else here is in service of those two sentences.',
    ctaInstall: 'Install Prorab →',
    ctaWalkthrough: 'See one task go through',
  },
};

export type Overview = typeof overview;
