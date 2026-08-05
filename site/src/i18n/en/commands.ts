import type { Table } from '../types';

/** One entry in a command's definition list. `warn` colours the term for the "Refuses" row. */
type Row = { term: string; body: string; warn?: boolean };

/** Everything translatable about one command. The anchor, the invocation and the track are
    structural — they are identical in every language and live in the view. */
type CommandDoc = { tag: string; intro: string; rows: Row[] };

export const commands = {
  meta: {
    title: 'Commands — Prorab',
    description:
      'All ten Prorab commands: refine, build, quick, verify, announce, ask, audit, refactor, ' +
      'lint-audit, lint-fix — what each one takes, what it writes, what it refuses to do, and when ' +
      'to reach for a different one.',
    ogTitle: 'Prorab — ten commands',
    ogDescription:
      'Six commands for product work and four for technical quality, with inputs, outputs, limits, ' +
      'and handoff points.',
  },

  hero: {
    eyebrow: 'Reference',
    title: 'Ten commands.',
    lede:
      'Six commands handle product work; four handle technical quality. For each command, this ' +
      'page lists its input, output, limits, and handoff points.',
  },

  toc: {
    lane: 'picking a lane',
    flags: 'flags',
  },

  lane: {
    eyebrow: 'Before the reference',
    heading: 'Choose the right workflow',
    lede:
      'Use the table below as a starting point. <code>quick</code> checks the task again after ' +
      'reading the code and routes larger work to the full workflow. <code>refine</code> can point ' +
      'a genuinely small task back to <code>quick</code>.',
    table: {
      head: ['The situation', 'Reach for'],
      rows: [
        [
          'The requirement can be read more than one way, touches an external contract, or spans layers',
          '<code>/prorab:refine</code> → <code>/prorab:build</code>',
        ],
        [
          'One or two files, one layer, nothing published changes, and you can already state <code>given → expected</code>',
          '<code>/prorab:quick</code>',
        ],
        [
          'Something shipped and you want to know whether it works for the people who use it',
          '<code>/prorab:verify</code>',
        ],
        [
          'The structure is wrong but the behavior must not change',
          '<code>/prorab-tech:audit</code> → <code>/prorab-tech:refactor</code>',
        ],
        [
          'Linters, types and formatters are unenforced or in disarray',
          '<code>/prorab-tech:lint-audit</code> → <code>/prorab-tech:lint-fix</code>',
        ],
        [
          'You need to tell someone what changed, or find out what happened here before',
          '<code>/prorab:announce</code> · <code>/prorab:ask</code>',
        ],
      ],
    } as Table,
  },

  product: {
    eyebrow: 'Product track · <code>prorab</code>',
    heading: 'From an unclear idea to a verified result.',
    lede:
      'Four stages plus two you reach for as needed. <code>verify</code> is optional and works on ' +
      'any scope — after <code>build</code>, after <code>quick</code>, or on a branch nobody used ' +
      'the framework for.',
  },

  tech: {
    eyebrow: 'Tech-quality track · <code>prorab-tech</code>',
    heading: 'Two workflows for two kinds of technical debt.',
    lede:
      '<strong>Structural:</strong> <code>audit</code> → <code>refactor</code>. ' +
      '<strong>Static:</strong> <code>lint-audit</code> → <code>lint-fix</code>. Both workflows ' +
      'must prove that existing behavior did not change. Use ' +
      '<a href="#announce">/prorab:announce</a> to share the result.',
  },

  docs: {
    refine: {
      tag: 'writes no code',
      intro:
        'Turns a rough idea into a usable specification. It reads the relevant code, identifies ' +
        'contradictions, scope gaps, and hidden assumptions, then asks one to four focused ' +
        'questions at a time.',
      rows: [
        {
          term: 'Takes',
          body:
            'A short idea description. Raw, incomplete or self-contradictory is the expected ' +
            'input, not a problem.',
        },
        {
          term: 'Writes',
          body:
            '<code>tasks/ideas/IDEA-&lt;slug&gt;.md</code> — problem, solution, scope IN/OUT, ' +
            'affected parts and reuse points, order of stages, key decisions <em>including what ' +
            'was rejected and why</em>, risk spikes, remaining assumptions, and a numbered ' +
            'Definition of Done. Plus a <em>Code map</em> handoff: every file it opened with a ' +
            'content hash, reuse and change points, contracts at risk, conventions to mirror, and ' +
            'an honest list of what it did <em>not</em> study. An idea too big for one run also ' +
            'gets a <em>Segment plan</em>: the cut into segments, each one independently checkable ' +
            'and each leaving the repository green.',
        },
        {
          term: 'Budget',
          body:
            'Dialogue-first: no <code>Workflow</code>, at most two delegated <code>Explore</code> ' +
            'contexts for a genuinely cross-cutting idea. After one delegated round with no new ' +
            'scope-relevant fact, it stops delegating.',
        },
        {
          term: 'Refuses',
          warn: true,
          body:
            'To write or change any project code. To declare the idea ready — you confirm that, it ' +
            'may only propose it. To agree for the sake of agreeing: if the idea looks harmful it ' +
            'says so with arguments and offers alternatives.',
        },
        {
          term: 'Notable',
          body:
            'An unresolved fork becomes <code>[?:&nbsp;…]</code> in the artifact rather than a ' +
            'silent default, and <code>build</code> treats that marker as a blocker. Skepticism is ' +
            'bounded on purpose: it serves scope and DoD, and after two rounds that move nothing ' +
            'it proposes settling.',
        },
        {
          term: 'Then',
          body:
            '<code>/clear</code>, then <code>/prorab:build &lt;slug&gt;</code> — a fresh context ' +
            'that pays nothing for the dialogue and re-uses the hashed Code map instead.',
        },
      ],
    },

    build: {
      tag: 'turnkey',
      intro:
        'Implements a refined idea end to end: inspect the code, plan, implement in dependency ' +
        'order, review, and verify. It does not pause for routine approval; quality is checked by ' +
        'independent review and the project’s own test commands.',
      rows: [
        {
          term: 'Takes',
          body:
            'A path to <code>tasks/ideas/IDEA-*.md</code>, an idea slug, or a free description of ' +
            'an already-refined idea. Without an IDEA it warns that quality will suffer and ' +
            'suggests refining first.',
        },
        {
          term: 'Writes',
          body:
            'Working code plus <code>tasks/IMPL-&lt;slug&gt;.md</code>: the task DAG, the per-file ' +
            'change list, the test plan, the verification recipe, the decisions and deviations, ' +
            'and a DoD table with a <code>proof</code> column. On a segmented idea that same file ' +
            'is the run’s <em>ledger</em> — segment statuses, the interfaces each segment froze for ' +
            'the next ones, the integration checkpoints — with per-segment detail in ' +
            '<code>tasks/segments/&lt;slug&gt;/</code>. Archives the completed bundle into ' +
            '<code>tasks/archive/&lt;YYYY&gt;/</code> — only after verification passed, and at XL ' +
            'only once every segment is done.',
        },
        {
          term: 'Stops on',
          body:
            'A real blocker only: a failed risk spike, an unclosed <code>[?:&nbsp;…]</code>, a ' +
            'direct contradiction between the IDEA and the code, an IDEA defect affecting scope or ' +
            'DoD, or a secret/access it does not have. A “sensible default” is allowed only for ' +
            'decisions that touch neither scope nor DoD.',
        },
        {
          term: 'Refuses',
          warn: true,
          body:
            'To re-open product decisions already settled in the IDEA. To take an expected value ' +
            'from its own output. To green up a test — <code>assert True</code>, a tautology, ' +
            '<code>skip</code>/<code>xfail</code>, mocking the unit under test, a hardcoded answer ' +
            'for the test input. To declare done without a run. To commit or push unasked.',
        },
        {
          term: 'Notable',
          body:
            'Reuses the IDEA’s <em>Code map</em> where the recorded hashes still match. Derives ' +
            'the verification recipe from repository guidance, CI and task runners rather than ' +
            'assuming a stack — a missing command is reported as a gap, not invented. Records ' +
            'which of its tests were proven able to fail, so <code>verify</code> does not re-prove ' +
            'them. On an idea with seams it runs each segment in a fresh context, so an interrupted ' +
            'run continues from the first unfinished segment instead of starting over.',
        },
      ],
    },

    quick: {
      tag: '2 contexts, fixed',
      intro:
        'For a small change in one or two files. It skips the full IDEA/IMPL workflow but keeps a ' +
        'Definition of Done, a red-first test, project checks, documentation updates, and one ' +
        'independent review.',
      rows: [
        {
          term: 'Takes',
          body:
            'A concrete small change — one or two files, one layer, no external contract touched.',
        },
        {
          term: 'Writes',
          body:
            'Code plus one compact <code>tasks/quick/QUICK-&lt;slug&gt;.md</code>: what changed ' +
            'and why, the DoD table with its proof column, the exact checks and their results, the ' +
            'documentation it corrected, and the verifier’s verdict. If it needs more than about a ' +
            'screen to state honestly, the task was not small.',
        },
        {
          term: 'Escalates',
          body:
            'Mandatory, not a preference, and it applies mid-run: an external contract, more than ' +
            'two or three files, two incompatible readings, security/auth/payment/permission ' +
            'logic, a behavior-preserving restructure, or missing access. It stops, names the ' +
            'trigger, and points at <code>/prorab:refine</code> or the tech track — leaving a ' +
            'record marked <code>escalated</code> if it had already edited files.',
        },
        {
          term: 'Refuses',
          warn: true,
          body:
            'To run a <code>Workflow</code> or a judge panel, to create IDEA/IMPL files, to ' +
            'archive anything, or to “just finish it since I’m already here”.',
        },
      ],
    },

    verify: {
      tag: 'black box',
      intro:
        'Checks shipped behavior through the interface a user or client actually uses. The ' +
        'probing context receives scenarios and expected results, but no implementation, diff, or ' +
        'source paths.',
      rows: [
        {
          term: 'Takes',
          body:
            'A slug, an IMPL/QUICK path, a branch or base ref, a commit range, ' +
            '<code>uncommitted</code>, or a free description. Empty derives the scope from git and ' +
            'asks only when it is genuinely undetermined — with concrete candidates, never a vague ' +
            '“what should I check?”.',
        },
        {
          term: 'Writes',
          body:
            '<code>tasks/verify/VERIFY-&lt;slug&gt;.md</code> — a graded verdict and evidence per ' +
            'behavior, the defects with their reproductions and routing, the coverage table, the ' +
            'check digests, and what stayed unverified — plus the missing tests, each proven by a ' +
            'mutation in an isolated worktree. Archives nothing.',
        },
        {
          term: 'Verdicts',
          body:
            '<code>works</code> · <code>broken</code> (the expected result is not produced at all) ' +
            '· <code>differs</code> (it works, but not as the requirement states) · ' +
            '<code>unverifiable</code> (the surface, data, access or oracle could not be ' +
            'obtained), each with a grade: <code>observed</code> (drove the real surface) or ' +
            '<code>proxy</code> (drove it through the project’s own harness).',
        },
        {
          term: 'Refuses',
          warn: true,
          body:
            'To fix anything — the only code it writes is test code, and defects are routed with ' +
            'their reproduction to <code>quick</code>, <code>build</code> or <code>refactor</code>. ' +
            'To accept a <code>works</code> that rests on the system’s own output, on “no error”, ' +
            'or on a screenshot with no compared value. To probe production with anything but ' +
            'observation, to enter credentials anywhere, to install into the project, or to fetch ' +
            'a runner without asking first.',
        },
        {
          term: 'Notable',
          body:
            '<code>differs</code> is not automatically a defect: it may mean stale code or a stale ' +
            'requirement, so it names which reading the evidence supports and leaves the product ' +
            'call to you. A web UI is driven <strong>headless by default</strong>; pixels are ' +
            'reserved for genuinely perceptual cases and an interactive visual session is an ' +
            'escalation whose trigger is logged.',
        },
      ],
    },

    announce: {
      tag: 'writes no code',
      intro:
        'Writes a short message explaining what changed, how it works, and any important limit. ' +
        'Claims come from the implementation record and diff, not from the original intention.',
      rows: [
        {
          term: 'Takes',
          body:
            'A feature slug, a path to an IMPL or IDEA, commits, or a free “what we shipped”. ' +
            'Empty means the latest completed work.',
        },
        {
          term: 'Writes',
          body:
            'The text in chat, ready to copy-paste. It saves <code>ANNOUNCE-&lt;slug&gt;.md</code> ' +
            'only on request, and for an already-archived task into that same archive directory.',
        },
        {
          term: 'Budget',
          body:
            'Read-only and S-sized: no <code>Workflow</code>, at most one delegated context total, ' +
            'at most one adversarial fact-check pass.',
        },
        {
          term: 'Refuses',
          warn: true,
          body:
            'To write about anything unverified or not actually done. To treat a partial or ' +
            'blocked IMPL as completed. To invent a computation method — it takes methods and ' +
            'thresholds from the IDEA/IMPL, or asks. To recreate an active IDEA or IMPL for work ' +
            'that is already archived. To commit.',
        },
        {
          term: 'Notable',
          body:
            'Terms are taken strictly as they appear in the app’s own UI, and a known limitation ' +
            'the recipient should hear about goes in without being inflated.',
        },
      ],
    },

    ask: {
      tag: 'read-mostly',
      intro:
        'Answers questions about the project or its history. It uses task records and project ' +
        'memory to find the relevant area, then verifies important claims against current code, ' +
        'documentation, or Git history.',
      rows: [
        {
          term: 'Takes',
          body:
            'A question about architecture, behavior, history, consumers, ownership or verification.',
        },
        {
          term: 'Writes',
          body:
            'Nothing, except that a memory entry its own read-only investigation disproved may be ' +
            'corrected or marked <code>stale</code>.',
        },
        {
          term: 'Refuses',
          warn: true,
          body:
            'To answer a current-state question from memory or an archived artifact alone. To ' +
            'present an inferred historical motive as documented fact. To implement a fix, run a ' +
            'mutating check, install anything, commit or push.',
        },
        {
          term: 'Notable',
          body:
            'The answer separates <em>Confirmed now</em> from <em>Historical context</em> and ' +
            '<em>Unverified</em>, so a fact from an old artifact is never handed to you as current ' +
            'truth.',
        },
      ],
    },

    audit: {
      tag: 'touches no code',
      intro:
        'Audits structural debt across code structure, reliability, security, performance, and ' +
        'maintainability. Git history adds change frequency to the analysis. Findings are grouped, ' +
        'ranked, and the top candidate is independently checked.',
      rows: [
        {
          term: 'Takes',
          body:
            'Empty for the whole project, or a focus: a path, a subsystem, or a problem class such ' +
            'as “duplication in services”.',
        },
        {
          term: 'Writes',
          body:
            '<code>tasks/audits/AUDIT-&lt;slug&gt;.md</code> — a ranked backlog plus one fully ' +
            'specified candidate, including what to add as a characterization net <em>before</em> ' +
            'the refactoring. Stamped with hashed provenance: the commit plus hashes of the target ' +
            'files, the tests its coverage claim rests on, and the call-site files.',
        },
        {
          term: 'Ranks by',
          body:
            '<code>value × safety × size × confidence</code> — high value at high safety and ' +
            'bounded size wins, and on a tie the safer, more isolated candidate does. A ' +
            'refactoring that is valuable but unsafe is not the one to do first.',
        },
        {
          term: 'Refuses',
          warn: true,
          body:
            'To change any code, and to call something a finding on taste alone: a diagnosis rests ' +
            'on executable, measured or analyzer evidence.',
        },
        { term: 'Then', body: '<code>/clear</code>, then <code>/prorab-tech:refactor</code>.' },
      ],
    },

    refactor: {
      tag: 'turnkey',
      intro:
        'Safely applies one structural improvement while preserving behavior: the same outputs, ' +
        'side effects, errors, and contracts for the same inputs. Existing bugs and quirks are ' +
        'preserved rather than mixed into the refactor.',
      rows: [
        {
          term: 'Takes',
          body:
            'Empty auto-picks candidate #1 from the latest AUDIT; or an id/slug, a file path, or a ' +
            'free problem description.',
        },
        {
          term: 'Writes',
          body:
            'Code plus <code>tasks/IMPL-refactor-&lt;slug&gt;.md</code>, reporting two blocks: ' +
            '<em>behavior preserved</em> (net, differential/mutation evidence, stable contracts, ' +
            'zero scope creep) and <em>quality improved</em> (a numeric before→after metric).',
        },
        {
          term: 'Floor',
          body:
            'No net, no refactoring. If the target has no coverage, characterization tests pinning ' +
            'the <em>current</em> behavior are written first and must be green on the OLD code. ' +
            'Then a contract diff, an adversarial drift search, and at least one differential ' +
            'old-versus-new run — none of which any budget tier can switch off.',
        },
        {
          term: 'Refuses',
          warn: true,
          body:
            'To start without a net that can catch a behavior change. To accept equivalence as the ' +
            'default — behavior counts as changed until proven otherwise, and any diverging input ' +
            'is a critical finding. To widen scope into a behavior fix.',
        },
        {
          term: 'Notable',
          body:
            'It re-hashes the AUDIT’s provenance <em>before</em> choosing a tier, because it would ' +
            'otherwise inherit safety and blast-radius numbers from an audit describing code that ' +
            'has moved on. A stale target makes the candidate obsolete until the smell is ' +
            're-confirmed; a stale test voids the coverage claim; a stale call site voids the blast ' +
            'radius.',
        },
      ],
    },

    'lint-audit': {
      tag: 'touches no code',
      intro:
        'Reviews linters, type checkers, formatters, and other static tools. It runs configured ' +
        'tools without changing code and clearly labels any estimate made without an installed ' +
        'tool.',
      rows: [
        {
          term: 'Takes',
          body: 'Empty for the whole project, or a focus: a tool, a subsystem, or a rule class.',
        },
        {
          term: 'Writes',
          body:
            '<code>tasks/audits/LINT-&lt;slug&gt;.md</code>: an ordered ladder of safe single-pass ' +
            'batches — <strong>A</strong> autofix → <strong>B</strong> onboard tools on a passing ' +
            'base → <strong>C</strong> create the first gate → <strong>D</strong> strictness ' +
            'ratchet — plus the exact invocations and the gate entrypoint.',
        },
        {
          term: 'Notable',
          body:
            'A batch is defined as work that is verifiably green in one pass and independently ' +
            'shippable. “Fix all typing” is not a batch; “enable the typechecker at bar X for ' +
            'module Y and drive N errors to zero” is. Violation counts in the plan are explicitly ' +
            'a snapshot, not a handoff — they go stale the moment a batch lands, and re-running an ' +
            'analyzer is nearly free.',
        },
        {
          term: 'Refuses',
          warn: true,
          body:
            'To change code, to simulate a dry run for a tool that is not there, or to promise a ' +
            'locked ratchet before a gate exists.',
        },
      ],
    },

    'lint-fix': {
      tag: 'one batch per run',
      intro:
        'Runs exactly <strong>one</strong> planned batch. Early batches prepare clean tooling, the ' +
        'first gate makes checks mandatory, and later batches strengthen that same gate and verify ' +
        'its new coverage.',
      rows: [
        {
          term: 'Takes',
          body:
            'Empty auto-picks the first undone batch whose prerequisites are met; or a batch ' +
            'id/slug, a path to the LINT file, or a free description.',
        },
        {
          term: 'Writes',
          body:
            'Code, gate-state evidence, and ' +
            '<code>tasks/IMPL-lint-&lt;plan-slug&gt;-batch-&lt;id&gt;.md</code>. The LINT and its ' +
            'batch artifacts are archived together once the ladder is complete or explicitly ' +
            'closed — never a partial ladder.',
        },
        {
          term: 'Refuses',
          warn: true,
          body:
            'To change runtime behavior: static-quality edits keep the same outputs, side effects ' +
            'and contracts. A latent bug the analyzer surfaces — a dead branch, an unreachable ' +
            'path, a swallowed exception — is <em>routed to the product track</em>, not quietly ' +
            'fixed inside a pass that claims to change nothing.',
        },
        {
          term: 'Notable',
          body:
            'It reads the current gate state from the last completed batch artifact rather than ' +
            'rediscovering it, and treats a falsely-safe autofix — a removed export that was ' +
            'called dynamically — as costing more than an unfixed warning.',
        },
      ],
    },
  } satisfies Record<string, CommandDoc>,

  flags: {
    eyebrow: 'Overrides',
    heading: 'Flags',
    lede:
      'Heavy commands choose a context tier automatically. You can override that choice, but no ' +
      'flag removes the required checks or the 16-context ceiling.',
    table: {
      head: ['Flag', 'Effect'],
      rows: [
        [
          '<code>--tier=S|M|L|XL</code>',
          'Pins the context tier: 2, 6 or 12 contexts cumulative for the whole command — or, at ' +
            '<code>XL</code>, 3 per segment of a segmented run.',
        ],
        [
          '<code>--fast</code>',
          'The cheapest defensible tier, and the <code>economy</code> verification profile where ' +
            'its conditions hold.',
        ],
        [
          '<code>--thorough</code>',
          'Allows expansion to the absolute ceiling of 16 contexts, and the <code>thorough</code> ' +
            'profile.',
        ],
        [
          '<code>--verification=economy|balanced|thorough</code>',
          'Mutation intensity, controlled separately from the tier: none · one per critical ' +
            'cluster (default) · one per substantial boundary.',
        ],
      ],
    } as Table,
    note:
      'A natural-language request in the arguments does the same thing. Whatever is chosen — tier, ' +
      'profile, <code>used/cap</code>, escalation reason, and anything consciously skipped — is ' +
      'logged rather than left implicit.',
  },

  language: {
    heading: 'Language',
    body:
      'Internal command instructions and agent-to-agent messages use <strong>English</strong>. ' +
      'Chat, the <code>refine</code> dialogue, announcements, and task records use the language of ' +
      'the request, with Russian as the default. Code, identifiers, comments, and commit messages ' +
      'remain in English. Product and interface terms are copied exactly from the project.',
    ctaHowItWorks: 'How the evidence rules and the budget work →',
    ctaSources: 'Read the command sources',
  },
};

export type Commands = typeof commands;
