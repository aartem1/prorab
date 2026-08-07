# Project navigation initiative

Execution order and statuses live only in [`ROADMAP.md`](../../ROADMAP.md). This document explains the
initiative and its acceptance criteria.

## Goal

Make project reconnaissance cheaper in **tokens, delegated contexts, tool calls and elapsed time**
without lowering the probability of finding the correct change points, consumers, contracts and tests.

The optimization target is primarily the **cold start of a new task**. The warm path is already
substantially better: `refine` can hand a hashed `Code map` to later stages, and unchanged evidence can
be reused instead of re-read.

## Problem

A new task can still follow an expensive loop:

```text
task → Glob/Grep → Read → more search → Explore → more Read → useful change point
```

That spends limits before implementation starts and also pollutes the main context with code that may
turn out to be irrelevant.

The target flow is:

```text
task
  ↓
fresh task evidence, if any
  ↓
cheap task-aware localization
  ↓
5–15 plausible files/symbols
  ↓
LSP/graph expansion around those candidates
  ↓
narrow source verification
  ↓
small task context capsule
```

`Explore` remains a fallback for genuine ambiguity, not the normal way to discover a codebase.

## Core decisions

### 1. Do not make LSP the literal first step

LSP is excellent for definitions, references, implementations and call hierarchy **after** a useful
symbol or file is known. A natural-language request often contains only domain language, so the first
step must be a cheap locator that can turn task vocabulary into plausible code anchors.

The search order should therefore be:

1. fresh Code map / artifact anchors;
2. explicit paths, symbols, API names, error strings and user-visible text from the task;
3. exact lexical/file-name search and a compact RepoMap;
4. LSP expansion around the best candidates;
5. narrow direct reads of evidence ranges;
6. bounded `Explore` only for unresolved cross-cutting ambiguity.

The current heuristic "after N searches, delegate" should not be the deciding rule. Delegation should
happen when uncertainty remains material to scope or implementation, not because a counter reached a
fixed number.

### 2. Keep RepoMap deterministic and small

RepoMap is not documentation and not an LLM summary. Its minimum useful shape is:

- repository-relative path;
- top-level symbols and signatures where reliably available;
- imports/exports or other dependable dependency edges;
- likely entrypoints and test declarations/associations;
- content hash and parser/tool version;
- capability marker when richer symbol extraction is unavailable.

It must not contain function bodies, generated output, ignored/vendor files or free-form AI summaries.
Unchanged files reuse cached entries; changed files are the unit of refresh.

Parser strategy should be chosen by a small executable spike. Native LSP data is preferred when it is
reliable and cheap; Tree-sitter or another bundled parser is a candidate for deterministic cross-language
fallback. Do not commit to a parser stack before measuring the simplest viable implementation.

### 3. Retrieval must be task-aware and bounded

The navigator should return a **candidate set**, not dump the repository map into the model context.
Ranking should favor, in order:

- exact artifact/path/symbol anchors;
- exact task-vocabulary matches;
- symbol and dependency proximity;
- consumers/contracts/tests connected to a primary candidate;
- broader fuzzy signals only when exact signals are insufficient.

A result should explain `why selected` and point back to current source. The normal output target is a
compact capsule of roughly 800–1,500 tokens.

### 4. Maps accelerate discovery; source proves behavior

A matching hash proves that evidence is unchanged, not that a previous interpretation was correct.
Before changing behavior, an external contract or a public signature, the agent still opens the
relevant current source range. Stale or partial navigation data degrades to bounded fresh recon rather
than blocking a command.

## Milestones

### NAV-001 — Task-aware reconnaissance contract

Change the framework's reconnaissance policy before building infrastructure.

Required behavior:

- use fresh Code map/artifact evidence first;
- derive a short task vocabulary and explicit anchors;
- prefer exact lexical/path search for initial localization;
- use LSP once a plausible symbol/file exists;
- read narrow ranges instead of whole files where possible;
- stop recon when the map is sufficient for scope/change-point/test decisions;
- invoke `Explore` only when unresolved uncertainty is material;
- use the same terminology for change points, consumers, contracts, reuse points, tests and
  uncertainty across heavy commands.

This milestone should provide immediate savings even before RepoMap exists.

### NAV-002 — Lightweight incremental RepoMap

Build the smallest local deterministic map that improves cold-start localization.

Requirements:

- automatic first use; no mandatory `/init`;
- content-addressed per-file cache;
- file/symbol/signature/dependency/test facts only;
- no model-generated summaries;
- unsupported languages keep a useful file-level fallback;
- dirty, untracked, deleted and renamed files are visible to freshness checks;
- ignored, binary, vendor, generated and oversized files are excluded by default;
- implementation form stays minimal: a local read-only executable/library is enough; MCP is not a
  requirement.

### NAV-003 — Product-track integration

Integrate navigation into the highest-value path first:

- `refine` queries the navigator before broad recon and records the resulting evidence in its existing
  Code map;
- `build` continues to reuse fresh Code map entries and re-localizes only stale or explicitly unstudied
  areas;
- `revise` keeps its existing warm-path inheritance and does not pay for a new global scan;
- absence or failure of the navigator falls back to the bounded normal tools.

Do not introduce a second competing task-memory format just to support navigation.

### NAV-004 — Eval and limit-consumption measurement

Measure before adding heavier retrieval layers. Use roughly 10–20 reproducible historical or fixture
tasks covering exact identifiers, domain-language requests, cross-component work and tooling changes.

Measure, when available directly, or use deterministic proxies when exact token accounting is not
exposed:

- input/output token usage attributable to recon;
- delegated context count and turns;
- `Read` / `Grep` / `Glob` / `Explore` calls;
- bytes or ranges of source read into model context;
- top-N recall of known primary files/symbols;
- consumers/contracts/tests found;
- cold vs incremental work;
- stale evidence incorrectly reported as fresh;
- end-task correctness / wrong-file selection versus baseline.

Initial acceptance targets are gates, not promised results:

- zero stale evidence marked `fresh` in the freshness suite;
- at least 90% recall of ground-truth primary files/symbols in top 10 on required fixtures;
- median navigation capsule at or below roughly 1,500 tokens;
- at least 30% reduction in recon tool calls or equivalent model-context work on pipeline fixtures;
- no measured quality regression versus the current reconnaissance baseline.

If the quality gate fails, improve lexical/symbol/graph retrieval before pursuing additional token
savings.

### NAV-005 — Tech-track integration

Only after the product path is measured:

- `audit → refactor` reuses target/consumer/test evidence when fresh;
- `lint-audit → lint-fix` reuses tooling inventory and exact verification recipes;
- audit coverage reports parser/navigation gaps honestly;
- existing characterization, drift and verification safety floors remain unchanged.

### NAV-006 — Freshness and cache hardening

Harden only the cache behavior proven useful by NAV-004:

- unrelated edits do not invalidate the whole map;
- direct evidence, dependency, consumer and contract edits invalidate the relevant neighborhood;
- rename, deletion, staged/unstaged changes, branch switch and multiple worktrees are covered;
- cache writes are atomic and old/corrupt schema recovers safely;
- correctness does not depend on a watcher or hook.

## Gated extensions

### NAV-007 — Semantic retrieval / embeddings

Activate only if lexical + symbol/graph retrieval misses domain-language tasks often enough to fail the
NAV-004 quality gate, and a controlled hybrid experiment improves recall without adding excessive noise.
Embeddings remain an additional candidate source; exact anchors and graph evidence retain priority.

### NAV-008 — Shared/remote index

Activate only if measurement shows unacceptable local cold-start cost, repeated indexing across a team,
real cross-repository impact needs, or an existing organization-wide code-intelligence service that is
clearly cheaper to integrate than reproduce. A local/offline fallback remains mandatory.

## Explicit non-goals for the first iterations

- vector database;
- AI summaries for every file;
- remote service;
- mandatory Sourcegraph dependency;
- large MCP tool surface;
- background watcher required for correctness;
- project-specific stack assumptions;
- installing language servers, parsers or models without explicit permission.

## Reference approaches

These are design references, not requirements:

- Claude Code plugins and LSP: <https://code.claude.com/docs/en/plugins-reference>
- Aider repository map: <https://aider.chat/docs/repomap.html>
- Sourcegraph precise code navigation: <https://sourcegraph.com/docs/code-navigation/precise-code-navigation>
- Git content-addressed object model: <https://git-scm.com/docs/gitdatamodel.html>
- Repoformer selective retrieval: <https://proceedings.mlr.press/v235/wu24a.html>
