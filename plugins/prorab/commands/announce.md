---
description: Prepares a concise, precise announcement of work results (after /prorab:build or a manual implementation) — what was done/new/changed, methods and how it's computed; dense and easy to forward in a messenger.
argument-hint: feature slug / path to IMPL or IDEA / commit(s) / free "what we shipped"; empty = latest work
---

Input: **$ARGUMENTS**

You prepare a **short, precise announcement of work results** — so it can be forwarded to colleagues (product, QA, managers, adjacent teams) in a messenger. This is not an engineer's report and not a changelog: the recipient must understand in 20–30 seconds **what was done, what's new, what changed, and how it's computed**, without reading code.

You write NO code right now and change NO project files (except optionally saving the announcement itself on request). You don't commit/push. Your result is the announcement text in chat, ready to copy-paste.

**Language.** This command's product — the announcement — is user-facing, so write the announcement (and your chat) in the **task's language** (detect it from `$ARGUMENTS` / the source material; default to Russian). Terms strictly as in the app's UI. Your own internal reasoning and any fact-check skeptic prompts/`schema` are in English. **Anti-drift:** the announcement uses UI/domain terms verbatim in the task's language — don't round-trip-translate them; file/function names stay as in the code (but you generally don't put them in the announcement anyway).

---

## Principles

- **Accuracy over beauty.** Every claim in the announcement must rest on what was actually done (the IMPL doc, diff, commits, test status), not on the intent from the IDEA. Not claimed/not verified — we don't write it. "Planned" ≠ "done".
- **Compression without losing meaning.** The goal is a dense, useful announcement, not a wall. Target: the body fits one messenger screen (≈ ≤ 20–25 lines). Cut fluff, bureaucratese, repetition; keep facts and value.
- **Write for the recipient, not for yourself.** Simple, informal language of the task (for Russian: no formal «вы»), no internal jargon, no private function/file names. **Terms strictly as in the app's UI** (report, column, tab, button names). If a term is technical — translate it into value ("pooled by volume" → can be kept, but explain "weighted by count…").
- **Scannability.** A short one-line header + sections with bullet points. Each bullet — one thought: `<what> — <why/value>`. No multi-line paragraphs.
- **Section adaptivity.** The sections below aren't a rigid template: drop empty ones. No computations — no "How it's computed" section. A small change — a header + 3 bullets suffice.
- **Honesty about boundaries.** If there's a known feature/limitation/unclosed tail the recipient should know (e.g. "the data hasn't been reconciled yet", "works only after X") — a short line in "Important". Don't hush it, but don't inflate it either.

---

## Order of work

### Phase 0 — What we're announcing

Determine the announcement's subject from `$ARGUMENTS`:
- slug / path to `tasks/IMPL-<slug>.md` or `tasks/ideas/IDEA-<slug>.md` → take it;
- commit(s)/hash → take the diff of those commits;
- free description → match to the latest relevant work;
- **empty** → take the latest completed work: a fresh `tasks/IMPL-*.md` and/or the latest commits (`git log --oneline -n 5`, `git show --stat`). If it's ambiguous what exactly to announce — list 2–3 candidates and ask (this clarifies the subject, not an approval).

### Phase 1 — Gathering the facts (read-only)

Gather what **actually** landed, from the most reliable sources (in order of trust):
1. **The IMPL doc** `tasks/IMPL-<slug>.md` — what was done, deviations from the plan, DoD status, follow-ups, known quirks. This is the primary source of "what exactly shipped".
2. **Diff/commits** — `git show --stat`/`git diff` on the feature's commit(s): which user-facing surfaces actually changed (endpoints, screens, columns, formats). Separate user-facing changes from internal ones.
3. **The IDEA** `tasks/ideas/IDEA-<slug>.md` — for phrasing "problem/why" and the product decisions (terms, thresholds, computation method). But take "done" from the IMPL/diff, not the IDEA.
4. **Verification status** — from the IMPL/session: tests/build green, a production run/reconciliations. Needed so as not to over-promise.
5. Where present — project memory and `CLAUDE.md` (terms, context).

Keep the context clean: delegate bulky reading to `Agent` (`subagent_type: Explore`), have them return a "what changed for the user + numbers/terms" digest, not file dumps — and only on a **bulky** diff/source set; read a small change directly, without deploying agents.

### Phase 2 — Announcement draft

Assemble the announcement per the structure below (adapt/drop sections to the feature):

> Write the announcement in the **task's language** (default Russian). The structure below is in English for reference — render its labels/prose in the task's language, terms as in the UI.

```
<emoji> <One-line header: what shipped and where>

In short: <1–2 sentences — the gist for those who read no further>

🆕 What's new
• <feature/capability> — <the value, briefly>

🔀 What changed
• <was → now> (only real changes to existing behavior)

🧮 How it's computed / methods  (only if there are computations, metrics, thresholds)
• <metric> — <how it's computed in plain words> (e.g.: sum across teams; weighted by volume; 85th percentile; thresholds X/Y)

⚠️ Important / what to watch  (only if any)
• <limitation / known quirk / what not to forget to do>

Where to see it: <screen/report/button as in the UI>
```

Draft rules:
- The header is the most valuable part; it reads as "we did X".
- Write "How it's computed" so a non-engineer gets it: not "pooled = Σnum/Σdenom" but "on average across all …, weighted by count". Take the computation method and thresholds from the IDEA/IMPL **verbatim in meaning**.
- Don't list all touched files/endpoints — only what the user sees and feels.
- Fit the length target. If it doesn't fit — cut the secondary, not the meaning.

### Phase 3 — Accuracy check and compression (proportionate)

Before handing it off — run a check proportionate to the announcement's size:
1. **Fact-check every claim.** For each item (especially numbers, thresholds, computation method, "new/changed") verify: is it confirmed by the IMPL/diff/test status? Unconfirmed — remove or soften it. For an announcement with non-trivial facts (numbers, metrics, several surfaces) run a light adversarial check via `Workflow`: a couple of independent skeptics cross-check claims against the sources and flag the unproven; drop/fix the flagged. For a small change, a self-check is enough. **Budget follows the number and riskiness of claims:** scale the number of skeptics to the count of non-trivial facts (don't fix it), and run the fact-check itself on a cheap model (`opts.model: 'haiku'`/`'sonnet'`, `opts.effort: 'low'`) — cross-checking a claim against a source doesn't need a strong model.
2. **Compression and clarity.** Go through once more: remove fluff and duplicates, replace bureaucratese, check that terms = UI, that there's no wall of text and the announcement scans in seconds.
3. **Length.** If it exceeds the target — shorten it. Optionally add a **TL;DR of 1–2 lines** at the top.

### Phase 4 — Delivery

- Hand off the final announcement **in chat, ready to copy-paste** (in one block, for easy copying).
- Propose (don't do it silently) variants: shorter (a TL;DR version of 3–5 lines), longer (with an example/details), save to `tasks/ANNOUNCE-<slug>.md`.
- Commit/push — you **don't do** (this task isn't about git).

---

## What NOT to do

- Don't turn the announcement into a report/changelog/wall of text. Dense and scannable.
- Don't write about what wasn't done or wasn't verified; don't gild the status.
- Don't sprinkle internal terms, file/function names, ticket numbers for volume — only value for the recipient.
- Don't change project code/files (except the optional announcement file on request) and don't commit.
- Don't invent a computation method — take it from the IDEA/IMPL; unsure — clarify, don't make it up.
