# Project navigation initiative

Execution order and statuses live only in [`ROADMAP.md`](../../ROADMAP.md). This document explains the
navigation design. Model and effort selection is defined separately in
[`model-routing.md`](model-routing.md).

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

That spends limits before implementation starts and pollutes model context with code that may be
irrelevant.

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

`Explore` remains a fallback for genuine ambiguity, not the normal way to discover a codebase. Its
model must follow the model-routing policy rather than silently inheriting an expensive session model.

## Core decisions

### 1. Do not make LSP the literal first step

LSP is excellent for definitions, references, implementations and call hierarchy **after** a useful
symbol or file is known. A natural-language request often contains only domain language, so the first
step must be a cheap locator that can turn task vocabulary into plausible code anchors.

Search order:

1. fresh Code map / artifact anchors;
2. explicit paths, symbols, API names, error strings and user-visible text from the task;
3. exact lexical/file-name search and a compact RepoMap;
4. LSP expansion around the best candidates;
5. narrow direct reads of evidence ranges;
6. bounded `Explore` only for unresolved cross-cutting ambiguity.

A fixed rule such as "after N searches, delegate" is not sufficient. Delegate when uncertainty remains
material to scope or implementation.

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

Parser strategy should be chosen by the smallest viable implementation. Native LSP data is preferred
when reliable and cheap; Tree-sitter or another bundled parser is a candidate fallback. Do not build a
large parser platform before ordinary tasks show the need.

### 3. Retrieval must be task-aware and bounded

The navigator returns a **candidate set**, not the repository map itself.

Ranking should favor:

- exact artifact/path/symbol anchors;
- exact task-vocabulary matches;
- symbol and dependency proximity;
- consumers/contracts/tests connected to a primary candidate;
- broader fuzzy signals only when exact signals are insufficient.

A result explains `why selected` and points back to current source. Normal output should remain a small
capsule, roughly 800–1,500 tokens rather than a code dump.

### 4. Maps accelerate discovery; source proves behavior

A matching hash proves evidence is unchanged, not that a previous interpretation was correct. Before
changing behavior, an external contract or a public signature, the agent still opens the relevant
current source range. Stale or partial navigation data degrades to bounded fresh recon rather than
blocking a command.

## Milestones

### NAV-001 — Task-aware reconnaissance contract

Change the framework's reconnaissance policy before building indexing infrastructure.

Required behavior:

- use fresh Code map/artifact evidence first;
- derive a short task vocabulary and explicit anchors;
- prefer exact lexical/path search for initial localization;
- use LSP once a plausible symbol/file exists;
- read narrow ranges instead of whole files where possible;
- stop recon when evidence is sufficient for scope/change-point/test decisions;
- invoke `Explore` only when unresolved uncertainty is material;
- route recon workers through the model/effort policy rather than inheriting an expensive session;
- use the same terminology for change points, consumers, contracts, reuse points, tests and
  uncertainty across heavy commands.

This milestone should provide savings before RepoMap exists.

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
- implementation stays minimal: a local read-only executable/library is enough; MCP is not required.

### NAV-003 — Product-track integration

Integrate navigation into the highest-value path first:

- `refine` queries the navigator before broad recon and records resulting evidence in its existing
  Code map;
- `build` continues to reuse fresh Code map entries and re-localizes only stale or explicitly unstudied
  areas;
- `revise` keeps its existing warm-path inheritance and does not pay for a new global scan;
- absence or failure of the navigator falls back to bounded normal tools.

Do not introduce a second competing task-memory format just to support navigation.

### NAV-004 — Tech-track integration

After the product path has worked in normal use:

- `audit → refactor` reuses target/consumer/test evidence when fresh;
- `lint-audit → lint-fix` reuses tooling inventory and exact verification recipes;
- audit coverage reports parser/navigation gaps honestly;
- existing characterization, drift and verification safety floors remain unchanged.

### NAV-005 — Freshness and cache hardening

Harden the cache behavior the preceding milestones actually use:

- unrelated edits do not invalidate the whole map;
- direct evidence, dependency, consumer and contract edits invalidate the relevant neighborhood;
- rename, deletion, staged/unstaged changes, branch switch and multiple worktrees are handled;
- cache writes are atomic and old/corrupt schema recovers safely;
- correctness does not depend on a watcher or hook.

## Gated extensions

### NAV-006 — Semantic retrieval / embeddings

Activate only if **repeated real tasks** show that lexical + symbol/graph retrieval misses relevant
code because task vocabulary does not overlap with identifiers. First improve the cheap locator; add
embeddings only when the failure pattern remains material.

Embeddings remain an additional candidate source. Exact anchors and graph evidence keep priority.

### NAV-007 — Shared/remote index

Activate only if real projects repeatedly show unacceptable local cold-start cost, waste from many
clones indexing the same tree, genuine cross-repository impact needs, or an existing organization-wide
code-intelligence service that is clearly cheaper to integrate than reproduce. Local/offline fallback
remains mandatory.

## How we tune navigation

There is no required historical-task benchmark or dedicated eval phase.

Use normal work as the feedback loop:

- if the navigator repeatedly misses a kind of change point, fix its locator/ranking;
- if `Explore` still appears frequently for routine tasks, inspect why the cheap stages were
  insufficient;
- if RepoMap adds maintenance cost without changing recon behavior, simplify or remove it;
- if a one-off unusual repository needs broad exploration, treat that as an exception rather than
  expanding the global system immediately.

Only add persistent metrics or fixtures if recurring failures become hard to diagnose from ordinary
runs.

## Explicit non-goals for the first iterations

- vector database;
- AI summaries for every file;
- remote service;
- mandatory Sourcegraph dependency;
- large MCP tool surface;
- background watcher required for correctness;
- project-specific stack assumptions;
- installing language servers, parsers or models without explicit permission;
- benchmark infrastructure that blocks shipping the optimization.

## Reference approaches

These are design references, not requirements:

- Claude Code plugins and LSP: <https://code.claude.com/docs/en/plugins-reference>
- Aider repository map: <https://aider.chat/docs/repomap.html>
- Sourcegraph precise code navigation: <https://sourcegraph.com/docs/code-navigation/precise-code-navigation>
- Git content-addressed object model: <https://git-scm.com/docs/gitdatamodel.html>
- Repoformer selective retrieval: <https://proceedings.mlr.press/v235/wu24a.html>
