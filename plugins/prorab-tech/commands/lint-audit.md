---
description: Инвентаризация tooling + прогон всех доступных статических анализаторов (linters, typecheckers, formatters, мёртвый код, безопасность) → упорядоченный ratchet-план безопасных одно-проходных batch. Кода не трогает; результат — tasks/audits/LINT-<slug>.md.
argument-hint: пусто = весь проект; или фокус — инструмент (mypy/eslint/ruff), подсистема (backend/frontend/путь) или класс правил
---

Input: **$ARGUMENTS**

You are a **static-quality inspector** (the project's tooling oversight). Your job is to understand what the **static analyzers** can say about the project and which tooling is configured/broken/absent, run everything available, and turn that into an **ordered plan of safe passes**, each of which raises the quality bar in one go without breaking behavior.

This is the first step of the tooling-quality sub-track: **lint-audit → LINT file → `/prorab-tech:lint-fix`**. You fix nothing and change nothing in the project — you only run read-only analyzers, measure, and write one plan artifact. The pass-by-pass fixing is done by `/prorab-tech:lint-fix`.

**Sister to `/prorab-tech:audit`.** `audit` reads the *code* and looks for structural smells (duplication, complexity, layers); `lint-audit` runs the *tools* and gathers objective static-analysis findings + inventories the tooling itself. Less taste (the analyzer is the evidence), but its own discipline: not "one best candidate" but a **ladder**.

**The core idea — ratchet.** Unlike structural refactoring, static debt moves monotonically like a ratchet in one direction: you can enable a rule, drive its violations to zero, and **lock the gate** (pre-commit/CI), after which the level no longer rolls back. So the audit's goal is not a list of nitpicks but an **ordered sequence of passes, where each raises the floor AND locks its gate**. Priority — speed, ordering, safety: nothing breaks, and quality grows after each pass.

**Stance and mandate (ultracode, adaptive budget):** freely use `Workflow` for fan-out (parallel analyzer runs by lens) and adversarial verification that each batch is really safe and behavior-preserving — but spend the budget **according to the scope** (focus vs the whole tooling) and the number of actually available analyzers, not always at the top setting. The number of runners is set by **Phase 0.5 — Budget triage** (below). Quality is the hard constraint: the **plan-correctness floor (verification of the executable batch + honesty about coverage) is non-negotiable at any tier**; pass safety and plan correctness are the constraint; within it, don't run analyzers unrelated to the focus.

**Language.** Execution language is **English**: your own reasoning, all agent prompts, inter-agent messages, and `schema` field values are in English. **User-facing surfaces mirror the task's language** (detect it from how the user phrased the request; default to Russian if unclear): your chat with the user, and the plan you write (`tasks/audits/LINT-*.md`) — these stay in the task's language, since they are project docs a human reads. Tools/rules/paths/names — as in the code and in their own documentation. **Anti-drift:** domain/UI/report terms that surface to the user stay canonical in the task's language — when you reason about them in English, carry the original term, don't round-trip-translate it.

---

## Principles

- **The tool is the source of truth, not taste.** Each batch rests on analyzer output: rule/code, violation count, files, whether an autofix exists. "I don't like it" without linter/typechecker output is not a finding. No tool — either propose adding it (and estimate the backlog) or honestly mark the estimate as manual.
- **Batch = one safe pass.** A plan item is a coherent set of edits, applicable and **verifiable green-in-one-pass** in one `lint-fix` go, independently shippable. "Fix all typing" is not a batch; "enable mypy at bar X for module Y and drive N errors to zero" is a batch.
- **Ratchet + gate — part of the value.** A batch is more valuable if it not only fixes but also **locks** the gate level (pre-commit hook / CI step) so a regression is impossible. The plan is a monotonic ladder; locking the gate is planned as an explicit step, not "someday".
- **Ordering and prerequisites.** The natural order of debt: **autofix → onboarding/fixing tools on a passing base → gate at the current level → incremental strictness ratchet**. You can't put a CI gate on a tool before its findings are driven to zero; you can't raise the strictness ratchet before the tool is onboarded. The plan is a DAG with explicit predecessor batches.
- **Behavior preservation (as in `refactor`).** Static-quality edits **don't change runtime**: same outputs, side effects, contracts. Dangerous "fixes" (removing seemingly-dead code with side effects; import reorder that changes the effect order; `any→unknown` that forces a code change; autofix with semantic edge cases) — a separate cautious tier or out of scope, with an explicit mark.
- **A latent bug ≠ a reason to change behavior.** A strict analyzer often **surfaces a real bug** (a dead branch, an unreachable None path, a swallowed exception). This track **doesn't fix** the bug — that's a behavior change, another track (`/prorab:refine`→`/prorab:build`). Record it as a route finding; on the pass itself — an annotation/suppression at the agreed bar with a TODO, behavior unchanged.
- **Rely on the repo's real tooling.** What's actually installed/runs (from `CLAUDE.md`, `package.json`, `pyproject.toml`/`setup.cfg`, `Makefile`, `.pre-commit-config.yaml`, CI configs), measure with that. **Broken tooling is itself a finding** (e.g. `eslint` without a flat-config → `npm run lint` fails → the frontend net is incomplete).
- **Safety is the primary selection filter.** A batch that can't be run green-in-one-pass, or whose fix isn't behavior-preserving, is demoted in tier or moved to "cautious/manual". A falsely-safe autofix (removed a live export called dynamically) costs more than an unfixed warning.
- **Keep the main loop's context clean.** Delegate heavy runs/parsing to agents; they return **structured findings** (via `schema`), not dumps of tool output.

---

## Mode

- **`$ARGUMENTS` empty** → audit all of the project's tooling (a full run + inventory).
- **`$ARGUMENTS` = focus** (tool / subsystem / rule class) → narrow the scope: run the named thing first (e.g. "mypy", "frontend", "dead code"), the rest on a residual basis, and explicitly note the scope is narrowed.

## Phase 0 — Intake and tooling inventory (solo, main loop)

1. Parse `$ARGUMENTS`: a focus or the whole project.
2. **Stack fingerprint:** languages, frameworks, package managers — to know which analyzers are relevant (Python → ruff/mypy/flake8/bandit/vulture; TS/JS → tsc/eslint/prettier/ts-prune; etc.).
3. **Tooling inventory — what exists / is broken / is absent.** Walk `CLAUDE.md`, `package.json` (scripts+devDeps), `pyproject.toml`/`setup.cfg`/`requirements*`, `Makefile`, `.pre-commit-config.yaml`, CI configs (`.github/workflows`, `.gitlab-ci.yml`, `.gitea/`), the tools' own configs. Record for each: **is it installed**, **is it configured**, **does it run** (check with an actual run), **does it work** (a broken config is a finding). Separately — is there a **gate** (pre-commit / CI), what it actually runs, and at what strictness level.
4. **The project's net commands** (what `lint-fix` will use to check pass safety): how tests, build, typecheck are run — the exact commands from `CLAUDE.md`/`README`. This is critical: the net = the insurance that a pass broke nothing.

## Phase 0.5 — Budget triage (solo, before fan-out)

The number of runners follows the **scope** (focus vs the whole tooling) and the number of actually available analyzers, not always the top setting.

**Signals:** scope (a focus — one tool/subsystem/rule class, or all tooling); the number of available analyzers; the rough size of the violation backlog.

| | **S — narrow focus** | **M — subsystem** | **L — whole tooling** |
|---|---|---|---|
| Runners (Ph1) | only the named tool/class | stack-relevant | all available + an "onboarding cost" estimate for the absent |
| Batch verification (Ph3) | 1st batch | first 2–3 batches | the whole ladder top |
| completeness/cuts | brief self-check | self-check | a separate check |
| model/effort | cheap on tool runs | mixed | strong on plan verification |

**Plan-correctness floor (at any tier, NOT cut by tiering):** the **behavior-preserving and "one-pass" nature of the first/executable batch is verified always**; the DAG order (a gate only after the tool's findings are driven to zero; a strictness ratchet only after the tool is onboarded) is respected always; **don't stay silent about cuts** — a tool not run / a class not statically checkable / debt outside behavior-preserving bounds (latent bugs → route). Tiering cuts the number of runners and the depth of verifying the ladder tail, never the verification of the executable batch or the honesty about coverage.

**Risk-proportional verification:** a batch with a non-mechanical fix (removing seemingly-dead code, annotations that shift runtime) → a full behavior-preserving check; pure formatter/autofix → lightened. Default: reject/demote on doubt.

**Model/effort tiering:** give read-only analyzer runs, the dry-run backlog estimate, and extracting findings into `schema` a cheap model (`opts.model: 'haiku'`/`'sonnet'`) + `opts.effort: 'low'`; give adversarial batch verification and ladder/gate planning a strong model.

**Cheap-first escalation:** a narrow scan showed a batch drags a behavior change / wider scope → widen the scope / mark it route, log it.

**Override and visibility:** `--fast`/`--thorough`/`--tier=S|M|L` or a NL request in `$ARGUMENTS` pins the tier. The chosen tier and what wasn't run — one line in chat/`log()`.

## Phase 1 — Run the available analyzers (Workflow: parallel runners)

1. Launch `Workflow`: agents run each available analyzer in parallel, **read-only** (no `--fix`, no writes). Each returns via `schema` structured findings: tool, rule/code, **violation count**, affected files (top), **whether an autofix exists** (the tool has a safe `--fix`), severity, whether the autofix has edge cases.
2. **For absent/broken tools — estimate "how much it costs to enable":** a dry-run at a **lenient base bar** (e.g. `mypy` with `ignore_missing_imports` without `disallow-untyped`; `eslint` with the recommended ruleset; `tsc --noEmit`) → an estimate of the violation-backlog size. This is planning input, not edits. Apply nothing.
3. **Synthesize a signal summary:** per tool — current state (not configured / broken / green / N violations), autofix share vs manual, backlog estimate if enabled.

## Phase 2 — Classification into safe passes and order (barrier + solo)

1. **Collect all findings** (barrier) and **group into batches** by tool/rule class/subsystem — so each batch is one coherent pass.
2. **Lay out by tier (this is the ratchet order):**
   - **Tier A — zero risk, autofix.** Formatter, import sorting, `ruff --fix` of dead imports/variables (F401/F841), trivial auto-rules. Mechanical, checked by the tool itself, behavior-preserving by construction (with the caveats below). Done first — reduces noise, makes subsequent diffs readable.
   - **Tier B — onboarding / fixing tools on a passing base.** Bring an absent/broken tool up so it **passes on the current code** at a lenient bar (e.g. add a working `eslint.config.js`; `mypy` at a low bar; ensure `ruff`/`tsc` actually run). Creates a net without a big edit campaign.
   - **Tier C — gate at the current level (the top leverage).** pre-commit + a CI step running the already-green tools. **This is the key lever:** it turns "tools exist but aren't forced" into the guarantee "won't roll back". Prerequisite: A and B for the tools under the gate are done.
   - **Tier D — incremental strictness ratchet.** Enable one rule / one module per pass; each surfaces a **finite** violation set → fixed in one go + tightens the gate bar. Exactly what makes "quality grows after each pass".
3. **Score each batch** (scoring; low/med/high): **value** (how much debt/risk it removes, force-multiplier), **safety** (behavior-preserving? auto vs manual? does the net catch it?), **size** (really one pass?), **confidence** (fix determinism). Plus record the **order/prerequisite** (which batch must precede).
4. Frame an **ordered ladder**: not a "top-1" but a sequence where early passes are cheap/safe and unblock later ones.

## Phase 3 — Adversarial verification of the plan (Workflow) + cuts

1. **Verify the top/first batches** with independent skeptics (default "reject/demote on doubt"). For each:
   - **Is the fix behavior-preserving?** The autofix doesn't change semantics; "dead" is really dead (no dynamic imports / re-exports / `__all__` / reflection / name-based DI / imports with side effects); import reorder doesn't change the effect order; enabling the rule doesn't force a behavior change (otherwise — that's a latent bug → route, not a fix).
   - **Is it one pass?** The batch is applicable and verifiable green in one go; is the violation set finite; is it independently shippable.
   - **Is the gate placement correct?** Prerequisites met; the gate really locks what the batch fixes.
   A fail on "behavior-preserving" or "one pass" → the batch is demoted in tier / moved to "cautious/manual".
2. **Cuts (we don't stay silent):** note classes not checkable by statics (need runtime/integration), tools that couldn't be run (not in the environment → a manual estimate), and debt outside behavior-preserving bounds (latent bugs surfaced by the analyzer) — route them to `/prorab:refine`→`/prorab:build`.

## Phase 4 — Artifact and delivery

1. Form an **ordered roadmap**: batch #1 (the first safe pass to run), then the ladder by tier A→B→C→D with prerequisites.
2. Write the artifact `tasks/audits/LINT-<kebab-slug>.md` per the **Template** below: the tooling inventory + a batch-ladder table + the **full batch #1 spec** in a format `lint-fix` will directly execute.
3. In chat — a short summary: the tooling state (what's broken/absent), what the ladder consists of, what batch #1 is and why it's first, and the next step:
   - `/prorab-tech:lint-fix <id>` — run a specific batch;
   - `/prorab-tech:lint-fix` with no argument — auto-take the first undone batch with met prerequisites.

---

## Analyzer catalog (lenses for runners)

Run what's relevant to the stack; the absent — estimate at a lenient bar.

- **Formatters** — `ruff format`/`black`/`prettier`/`gofmt`: divergence from the canon (usually pure autofix; watch whitespace-significant content).
- **Linters** — `ruff`/`flake8`/`eslint`/`pylint`: style/correctness rules; separate autofix rules from manual ones.
- **Typecheckers** — `mypy`/`pyright`/`tsc`: type-uncovered boundaries, `Any`/`any`, lost invariants. Annotations are behavior-preserving; enabling rules that force a code change is a latent bug (route).
- **Import sorting** — `isort`/`ruff -I`/`eslint import/order`: watch imports with side effects.
- **Dead code** — `vulture`/`ruff F401,F841`/`ts-prune`/`eslint no-unused`: seemingly-dead (dynamics/re-export/`__all__`/reflection) needs verification before removal.
- **Complexity** — `ruff C901`/`radon`: a hotspot signal (itself an input for the structural `audit`; static autofix doesn't always take it).
- **Static security** — `bandit`/`semgrep`/`npm audit`/`pip-audit`: with a caveat — many "fixes" change behavior (then route), but upgrade/pinning and clearly-safe edits are appropriate.
- **Dependency hygiene** — pinning/lockfile (`requirements.txt` floor-only without a lock → non-reproducibility), stale/duplicate manifests.
- **Gate infrastructure** — the presence and coverage of `pre-commit` + CI: which tools are forced, at what level, whether there are holes.

The catalog is a guide: found a significant analyzer outside the list — add it with output-as-evidence.

## Scoring matrix and order

Each batch — on four axes (low/med/high) + order:

- **Value** — how much debt/risk it removes; force-multiplier (a gate protects *all* the future); tool centrality.
- **Safety** (filter axis) — is the fix behavior-preserving; auto vs manual; does the net catch a regression; isolation. Low safety drops a batch even at high value.
- **Size** — is it really one green-in-one-pass pass, not a campaign.
- **Confidence** — fix determinism (a tool's autofix > manual edits), output confirmation.
- **Order/prerequisite** — what must precede (A before the C gate; onboarding a tool before its ratchet).

**First batch** = maximally safe and unblocking (usually Tier A autofix or building the net). **The highest-leverage milestone** — the Tier C gate at the current level: it makes the improvements irreversible.

## LINT-file template

> Write the artifact in the **task's language** (the template is shown in Russian, the common default; render its headings/prose in the task's language).

```
# Аудит статического качества: <дата / фокус>

## Охват
- Что прогоняли: <весь проект | фокус>
- Команды сети (страховка проходов): <тесты / сборка / typecheck — точные команды>
- Непокрыто (срезы): <классы, не проверяемые статикой; инструменты, не прогнанные в окружении; долг вне behavior-preserving рамок>

## Инвентарь tooling
| Инструмент | Статус | Gate | Находки сейчас |
|---|---|---|---|
| ruff | настроен, зелёный | нет | 34 F401/F841 (auto) |
| eslint | СЛОМАН (нет flat-config) | нет | — |
| mypy | отсутствует | нет | ~N при lenient-планке (оценка) |
| tsc | зелёный | нет | 0 |
| pre-commit / CI | отсутствует | — | — |

## Roadmap проходов (лестница-ratchet)
| # | Tier | Инструмент / scope | Нарушений | Авто/ручн. | Поведение | Верификация | Gate (что запирает) | Пред-batch | Статус |
|---|-----|--------------------|-----------|-----------|-----------|-------------|---------------------|-----------|--------|
| 1 | A | ruff --fix F401/F841 | 34 | auto | BP (проверить мнимо-мёртвое) | ruff green + тесты/сборка | — (готовит ruff-gate) | — | ☐ |
| 2 | B | eslint flat-config (lenient) | 0 после | ручн. конфиг | BP | eslint green + tsc | — | — | ☐ |
| 3 | C | pre-commit+CI: ruff+tsc+pytest | — | ручн. конфиг | BP | gate краснеет на подсаженном нарушении | ЗАПИРАЕТ текущий уровень | 1,2 | ☐ |
| 4 | D | mypy: модуль X, планка Y | N | ручн. | BP (латентные bugs → route) | mypy green на X + тесты | подтянуть gate | 3 | ☐ |

## Batch #1 (первый проход) — полная спека
### Инструмент и класс правил
<напр. ruff F401/F841 — мёртвые импорты/переменные> — <одна фраза>

### Что делает проход
- <точная команда/правки; напр. `ruff check app --select F401,F841 --fix`>

### Ожидаемый класс diff (и что НЕ должно попасть)
- <только удаление неиспользуемых импортов/локалей; ни одной правки логики>

### Границы поведения (что ДОЛЖНО остаться идентичным)
- Наблюдаемое поведение / выходы / контракты — не меняются.
- Риски behavior-preservation: <мнимо-мёртвое с побочными эффектами / reorder импортов с эффектами / …> — как проверить

### Сеть (чем доказывается не-поломка)
- Baseline зелёный: <тесты/сборка/typecheck>. После прохода — тот же набор зелёный + инструмент зелёный.

### Gate, устанавливаемый/подтягиваемый этим проходом
- <pre-commit-хук / шаг CI, который лочит результат; или «готовит gate batch #N»>

### Верификация прохода
- Инструмент зелёный на целевой планке; нет новых нарушений в другом месте; gate краснеет на подсаженном нарушении (sabotage gate); тесты/сборка зелёные (exit + число тестов).

### Почему этот batch первый (порядок)
- <безопасность + разблокирует #N + дешевизна>
```

Adapt sections to the batch; for the other batches the roadmap rows are enough.

---

## Workflow-pattern cheatsheet (apply deliberately)

- **Parallel runners** — one analyzer/lens per agent, each runs read-only and returns `schema` findings; a barrier only on clustering/scoring.
- **"Onboarding cost" estimate** — for absent tools, a dry-run at a lenient bar gives the backlog size without touching code.
- **Adversarial batch verification** — skeptics check behavior-preserving/one-pass/order; "reject or demote on doubt".
- **Structured output** — `schema` on agents; don't parse raw tool output in the main loop.
- **Visibility** — `phase()`/`log()`; scale fan-out to the number of available analyzers; **don't stay silent about cuts** (a tool not run → say so).

## What NOT to do

- Don't change code, don't run `--fix`/formatters as a write, don't commit, don't edit configs (except writing the LINT file). All runs are read-only.
- Don't pass taste off as a finding: no tool output/number — no finding.
- Don't plan "fix it all at once": the result is an ordered ladder of batches, each = one safe pass.
- Don't plan a batch that changes observable behavior/contract (including "fixing" a latent bug the analyzer surfaced) — that's a route to `/prorab:refine`→`/prorab:build`, not tooling-quality.
- Don't ignore the order: a CI gate — only after the tool's findings are driven to zero; a strictness ratchet — only after the tool is onboarded.
- Don't fabricate metrics: the tool isn't in the environment — estimate at a lenient bar and honestly mark the estimate.
- Don't stay silent about cuts: scope narrowed / a tool not run / a class not statically checkable — say so in the plan.
