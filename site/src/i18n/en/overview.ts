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
    title: 'Prorab — turn unclear tasks into verified code',
    description:
      'Two Claude Code plugins for refining requirements, implementing changes, verifying ' +
      'user-visible behavior, and improving code without changing how it works.',
    ogTitle: 'Prorab — a structured development workflow for Claude Code',
    ogDescription:
      'Make the requirement explicit, implement it, and verify the result against the requirement.',
  },

  hero: {
    eyebrow: 'Claude Code marketplace · two plugins · ten commands',
    titleA: 'Clarify the task.',
    titleB: 'Then verify the code.',
    lede:
      'Coding agents fill gaps with plausible assumptions. Their tests can then confirm those ' +
      'same assumptions instead of your intent. Prorab separates clarification, implementation, ' +
      'and independent verification.',
    ctaInstall: 'Install →',
    ctaWalkthrough: 'Watch one task go through',
    badges: {
      runtime: 'no runtime, API keys, or background service',
      artifacts: 'records stay in your repository',
    },
  },

  terminal: {
    caption: 'example · one feature from idea to verification',
    replay: 'replay',
    note:
      'This is a shortened example, not a session transcript. In practice, <code>refine</code> ' +
      'asks questions and <code>build</code> reads, edits, and runs project checks.',
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
      { kind: 'note', text: '   no commit or push unless you ask for one' },
    ] as TermLine[],
  },

  problem: {
    rail: 'the problem',
    eyebrow: 'Why it exists',
    heading: 'A short ticket can hide a lot of decisions.',
    lede:
      'Take a common request. Open each underlined phrase, then the decisions that the sentence ' +
      'does not mention at all.',

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
    assumedTitle: 'The defaults an agent may choose before it starts coding',
    assumedKicker:
      'Every answer is plausible, but none came from the requirement. If the same context chooses ' +
      'the defaults and writes the tests, a green suite proves consistency, not correctness.',

    note:
      '<strong>This is the problem Prorab addresses.</strong> The agent silently turns an ' +
      'ambiguous request into a specific one, then tests the choices it made itself.',
  },

  thesis: {
    rail: 'two conversions',
    eyebrow: 'The approach',
    heading: 'Clarify first. Implement second.',
    lede:
      'Prorab separates two jobs that are often mixed together. First, a person resolves the ' +
      'important gaps. Then a fresh run implements the result and checks it against the written ' +
      'requirement.',
    cards: [
      {
        num: '01 / implicit → explicit',
        title: 'Find the missing decisions',
        body:
          '<code>/prorab:refine</code> reads the relevant code, identifies contradictions, scope ' +
          'gaps, and hidden assumptions, then asks you to resolve them. It writes no code. Open ' +
          'questions remain marked as <code>[?:&nbsp;…]</code>, so <code>build</code> cannot turn ' +
          'them into silent defaults.',
      },
      {
        num: '02 / explicit → matching code',
        title: 'Make the result testable',
        body:
          'The result is a numbered <strong>Definition of Done</strong> made of checkable ' +
          '<code>given&nbsp;→&nbsp;expected</code> pairs. Tests point back to those items, fail for ' +
          'the expected reason before the fix, and are reviewed by a separate context.',
      },
    ] as Card[],
    dodLede:
      'A DoD item looks like this. When no exact value can be derived independently, use a ' +
      '<strong>metamorphic invariant</strong> that follows from the requirement:',
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
    eyebrow: 'The rule behind every command',
    heading: 'The expected value never comes from the code.',
    lede:
      'Below are two tests for the same off-by-one error. The only difference is where the ' +
      'expected value came from. Change the implementation to see which test still gives useful ' +
      'information. <span class="small">(Interactive illustration, not a live test run.)</span>',

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
      'Each step rejects one weak substitute. These are enforced rules because a run can stay ' +
      'green even when the expected value is wrong.',
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
      '<strong>A test that cannot fail is not coverage.</strong> A counted test either failed for ' +
      'the right reason before implementation, or caught a plausible regression injected in an ' +
      'isolated worktree. If it stays green, the test must be improved.',
  },

  outsideIn: {
    rail: 'outside-in',
    eyebrow: 'The last check',
    heading: 'Independent verification starts outside the code.',
    lede:
      '<code>/prorab:verify</code> checks the result through the same interface a user or client ' +
      'would use. The probing context receives a scenario and expected results, but no ' +
      'implementation, diff, or source paths.',

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
      'Blindness is <strong>auditable</strong>: the probing context lists the files it read, the ' +
      'commands it ran, and the locators it used. If it opened the implementation, tests, or ' +
      'diff, the affected checks are no longer marked independent.',

    note:
      'Browser checks run <strong>headlessly by default</strong>. A script can reload the page, ' +
      're-read saved data, simulate failures, and capture console or network errors. Screenshots ' +
      'are used only for genuinely visual requirements; an interactive session needs a recorded ' +
      'reason.',
  },

  loop: {
    rail: 'the loop',
    eyebrow: 'How you actually work with it',
    heading: 'Use a fresh session for implementation.',
    lede:
      'The workflow is a short sequence of commands, not a separate service to configure.',
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
      'For a small one- or two-file change, <code>/prorab:quick</code> keeps the essential checks ' +
      'and writes one short record. If the task turns out to be larger, it routes it to the full ' +
      'workflow.',

    tracksHeading: 'Two tracks, one discipline',
    tracksLede:
      'The product track checks new behavior against a requirement. The tech track checks that ' +
      'existing behavior stays unchanged. Choose the command that matches the job.',
    tabProduct: 'product',
    tabTech: 'tech quality',
    writes: 'writes →',

    product: [
      {
        step: '01',
        name: 'refine',
        cmd: '/prorab:refine',
        what:
          'Clarifies a rough idea by reading the relevant code, finding contradictions and hidden ' +
          'assumptions, and asking focused questions. It writes no code; you decide when the idea is ready.',
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
          'For a routine one- or two-file change: no IDEA, IMPL, archive, or Workflow, and exactly ' +
          'two contexts. It keeps the DoD, red-first test, project checks, and independent review. ' +
          'If the task is larger, it routes it to the full workflow.',
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
    eyebrow: 'Cost control',
    heading: 'The workflow has a fixed context budget.',
    lede:
      'Before delegating work, each heavy command estimates size, affected area, novelty, ' +
      'reversibility, and uncertainty, then chooses a context tier.',

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
      '<strong>The tier limits context count; separate rules limit context size.</strong> Raw test ' +
      'output is reduced to a short digest, and delegated work returns concise findings with ' +
      '<code>path:line</code> references. A summary may shorten a failure, but it may not hide one.',

    floor:
      '<strong>The minimum checks do not change with the tier.</strong> The budget controls how ' +
      'many independent reviews are used, not whether required evidence is collected.',
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
      'Prorab is deliberately narrow. It is a poor fit in these cases.',
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
    eyebrow: 'What the commands add to your project',
    heading: 'The commands are global. The evidence is yours.',
    lede:
      'Commands install once. Their task records stay in the project, and no command commits or ' +
      'pushes unless you ask it to.',
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
    heading: 'Clarify the requirement. Build it. Verify the result.',
    lede: 'Start with the idea in your own words.',
    ctaInstall: 'Install Prorab →',
    ctaWalkthrough: 'See one task go through',
  },
};

export type Overview = typeof overview;
