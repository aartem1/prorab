# Предложения по развитию и оптимизации prorab

Дата анализа: 2026-07-10

## Краткий вывод

`prorab` уже имеет сильную концептуальную архитектуру: продуктовый контур
`refine → build → announce` и технический контур
`audit/refactor + lint-audit/lint-fix`. Особенно полезны разделение нового поведения и
behavior-preserving изменений, передача контекста через артефакты, адаптивные tiers и требование
проверяемых доказательств.

Главное ограничение текущей версии в том, что почти все гарантии существуют только как текст внутри
prompt-команд. Нет исполняемых guardrails, формальной схемы артефактов, eval-набора, CI и фактических
метрик расхода. Поэтому приоритетное направление — превратить набор подробных инструкций в
измеряемую, ограниченную по бюджету и частично детерминированную систему.

Суммарный объём семи команд на момент анализа — 1 098 строк и 116 445 символов, ориентировочно
28–32 тысячи токенов. Они не загружаются все одновременно, однако тяжёлые команды стоят примерно
4,5–5,5 тысячи входных токенов на вызов и остаются в контексте до конца сессии.

## Сводное ранжирование

Шкала:

- качество и токены: 1 — низкое влияние, 5 — максимальное;
- сложность: S — небольшое изменение, M — среднее, L — крупное;
- P0 — сделать в первую очередь, P1 — следующий этап, P2 — полезное развитие.

Статус реализации:

- `☐` — не начато;
- `◐` — в работе или реализовано частично;
- `☑` — реализовано и проверено;
- `⊘` — решено не реализовывать;
- в колонке «Реализация» указывается версия, commit, PR или дата завершения.

| № | Статус | Приоритет | Предложение | Качество | Экономия токенов | Сложность | Реализация |
|---:|:---:|:---:|---|:---:|:---:|:---:|---|
| 1 | ☐ | P0 | Ввести жёсткие лимиты агентов и hybrid orchestration | 5 | 5 | M | — |
| 2 | ☐ | P0 | Создать eval-набор и собирать фактические usage-метрики | 5 | 5 | M | — |
| 3 | ☐ | P0 | Перенести безопасность из prompt'ов в hooks и изолировать mutations | 5 | 2 | M | — |
| 4 | ☐ | P0 | Исправить противоречия lint pipeline и stack-specific предположения | 5 | 2 | S | — |
| 5 | ☐ | P1 | Мигрировать `commands/` в модульные Skills | 4 | 4 | M | — |
| 6 | ☐ | P1 | Ввести формальную схему и freshness-проверку артефактов | 5 | 4 | M | — |
| 7 | ☐ | P1 | Заменить механических LLM-агентов детерминированными scripts | 4 | 5 | M | — |
| 8 | ☐ | P1 | Сделать verification risk-based вместо обязательных panels/mutations | 4 | 5 | M | — |
| 9 | ☐ | P1 | Добавить фиксированных специализированных subagents | 4 | 4 | M | — |
| 10 | ☐ | P1 | Использовать LSP и встроенные `/verify`, `/run`, `/simplify`, `/review` | 4 | 3 | S–M | — |
| 11 | ☐ | P1 | Переиспользовать recon между этапами с проверкой свежести | 4 | 4 | M | — |
| 12 | ☐ | P1 | Добавить `/prorab:quick` для небольших повседневных задач | 4 | 5 | S | — |
| 13 | ☐ | P2 | Добавить `/prorab:next` для навигации по артефактам | 3 | 3 | S–M | — |
| 14 | ☐ | P2 | Добавить `/prorab:doctor` для диагностики framework/project readiness | 4 | 2 | M | — |
| 15 | ☐ | P2 | Добавить artifact-aware `/prorab:check` | 4 | 2 | M | — |
| 16 | ☐ | P2 | Добавить компактный runner для test/build output | 3 | 4 | M | — |
| 17 | ☐ | P2 | Настроить CI и автоматическую проверку plugin manifests | 4 | 1 | S | — |
| 18 | ☐ | P2 | Устранить дублирование версий и автоматизировать release flow | 3 | 1 | S | — |
| 19 | ☐ | P2 | Дополнить manifests и исправить документацию | 3 | 1 | S | — |
| 20 | ☐ | P2 | Измерить пользу English execution вместо фиксированной оценки | 3 | 2 | M | — |

## P0 — первоочередные изменения

### 1. Жёсткие лимиты агентов и hybrid orchestration

Текущие S/M/L tiers описывают ширину работы приблизительно, но не ограничивают фактическое число
агентов. Полный `audit` может запустить readers, 11 smell-scanners, churn-анализ, проверку 5–10
кандидатов несколькими скептиками и completeness critic. Такой run легко превышает 25–30 агентов.

Предлагаемая политика:

- **S:** без Workflow; главный агент и максимум один независимый verifier;
- **M:** максимум 5–6 агентов суммарно, не более двух review-циклов;
- **L:** максимум 12–16 агентов; расширение только после обнаруженного риска;
- обязательный `maxTurns` для каждого subagent;
- прекращение цикла после одного раунда без новых подтверждённых findings;
- judge-panel только при наличии минимум двух действительно различных архитектурных вариантов;
- для `audit` сгруппировать lenses в три направления: structure, reliability/security,
  performance/maintainability;
- по умолчанию adversarially проверять только кандидата #1; runners-up — только при близких оценках;
- `--thorough` может расширять caps, но `balanced` должен оставаться default.

Ожидаемый эффект: снижение расхода на S/M примерно на 30–60%, более предсказуемые L-задачи,
меньше коррелированных и повторяющихся выводов.

### 2. Evals и usage-метрики

Нужен benchmark suite, который позволит сравнивать версии framework не по ощущениям, а по
результатам.

Минимальный состав:

- 10–20 fixture-сценариев: маленький fix, API feature, миграция, refactor, dirty worktree,
  отсутствующие тесты, красный baseline, внешний контракт, русский UI/domain;
- измерения: успешность задачи, DoD coverage, корректность diff, запрещённые действия, число
  агентов, turns, tokens, duration;
- A/B-запуск старой и новой версии prompt'ов;
- детерминированные graders через tests/diff/schema;
- LLM-grader только там, где качество нельзя проверить программно;
- статические проверки на каждый commit, дорогие eval'ы — nightly или перед release.

Целевые показатели:

- S использует не более двух model contexts;
- M имеет медиану не более шести агентов;
- медианные токены S/M снижаются минимум на 30%;
- отсутствуют destructive git-операции и незапрошенные commit/push;
- task success rate не ухудшается;
- balanced-профиль использует не более одной mutation на critical risk cluster.

### 3. Детерминированные safety guardrails

Mutation/sabotage проверки сейчас предлагают откат через `git checkout`. Это может стереть
пользовательские незакоммиченные изменения в том же файле.

Необходимо:

- запускать mutations в отдельном временном worktree;
- либо сохранять точный patch мутации и откатывать только этот patch;
- через `PreToolUse` блокировать `git checkout --`, `git reset`, `git clean`, commit и push, если
  действие не разрешено текущим workflow;
- для read-only команд блокировать записи вне разрешённой папки артефактов;
- перед mutating Workflow проверять dirty tree и пересечение затрагиваемых файлов;
- после sabotage-проверки программно убеждаться, что mutation полностью удалена;
- проверять `worktree.baseRef`: для работы с текущей веткой нужен `head`, либо чистый и явно
  подходящий base commit.

Prompt-инструкция «не делай» должна оставаться объяснением, а hook — настоящим ограничителем.

### 4. Исправить конкретные противоречия

#### Lint pipeline

`lint-audit` разделяет работу на:

- A — autofix;
- B — onboarding;
- C — первоначальная установка gate;
- D — strictness ratchet.

Одновременно `lint-fix` требует добавлять и sabotage-проверять gate при каждом batch. Шаблон LINT
при этом допускает, что batch A лишь подготавливает gate.

Рекомендуемая единая модель:

- A/B/D обновляют или расширяют уже существующий gate;
- отдельный C создаёт gate впервые;
- до C ранние batch'и называются preparatory и не объявляются «locked»;
- после C каждый следующий batch обязан tighten существующий gate и проверять его mutation'ом.

#### Stack-specific предположения

Глобальная команда `build` содержит конкретные предположения про `services/`, Docker pytest,
Alembic, Vite, backend/frontend. Их надо убрать из обязательного алгоритма и оставить только в
examples/reference.

Основной алгоритм должен сначала определить verification recipe из:

- `CLAUDE.md`;
- README;
- package/build scripts;
- CI;
- Makefile/task runner;
- существующих test conventions.

#### Отсутствующие analyzers

Нельзя обещать dry-run отсутствующего инструмента без установки. Нужно различать:

- tool уже доступен — запускать read-only;
- требуется ephemeral download — только после разрешения;
- tool отсутствует — давать manual estimate и честно указывать ограничение.

## P1 — архитектурное усиление

### 5. Миграция в Skills и progressive disclosure

Перейти от flat `commands/*.md` к структуре:

```text
plugins/prorab/
  skills/
    build/
      SKILL.md
      references/
        budget.md
        verification.md
        artifact-contract.md
      templates/
        impl.md
      scripts/
        build-workflow.js
```

В основном `SKILL.md` оставить только роль, вход, blockers, короткий phase flow и routing к
references. Таблицы, каталоги проблем, шаблоны и подробные anti-patterns читать только на нужном
этапе.

Всем пользовательским workflow-командам добавить:

```yaml
disable-model-invocation: true
```

Это исключит автоматический запуск mutating workflows моделью и уберёт их descriptions из
always-on контекста.

### 6. Формальный artifact contract

Добавить YAML frontmatter к IDEA/AUDIT/LINT/IMPL:

```yaml
schema: prorab.idea/v1
id: feature-slug
status: ready
created_at: 2026-07-10T12:00:00+03:00
source_sha: abc123
task_language: ru
tier: M
next_command: prorab:build
```

Обязательные свойства:

- `Context capsule` максимум 800–1 200 токенов;
- стабильные sections для Scope, DoD, risks и evidence;
- evidence в виде путей/строк и hash/commit, а не больших excerpts;
- статусная модель `draft → ready → in_progress → done|blocked|stale`;
- стабильные batch IDs и prerequisites;
- `schema_version` для будущих migrations;
- выбор «latest» по metadata/status, не по filesystem mtime;
- проверка `source_sha` перед использованием старого audit/idea.

### 7. Scripts вместо механических LLM-агентов

Создать небольшие utilities:

- `prorab-inventory` — stack, manifests, test/lint/build commands;
- `prorab-metrics` — LOC, churn, complexity, duplication candidates;
- `prorab-run-check` — запускает команду и возвращает структурированный summary;
- `prorab-artifact-validate` — проверяет schema и status transitions;
- `prorab-release-check` — проверяет manifests/version/changelog.

LLM должен интерпретировать данные и принимать решения, а не расходовать контекст на запуск и
парсинг детерминированных команд.

### 8. Risk-based verification hierarchy

Использовать доказательства в следующем порядке:

1. executable test или differential run;
2. static analyzer, typecheck, contract diff;
3. один reviewer, воспроизводящий finding конкретным input/evidence;
4. второй reviewer только при конфликте или высоком blast radius;
5. panel из трёх — только для contract/security/business-critical риска.

Профили mutations:

- `economy`: без mutation для низкорисковых изменений;
- `balanced`: одна mutation на critical invariant/risk cluster;
- `thorough`: mutation каждого существенного DoD;
- во всех профилях mutation выполняется в изоляции.

### 9. Фиксированные специализированные subagents

Предлагаемый набор:

- `recon` — Haiku, read-only, `maxTurns: 8`;
- `test-runner` — Haiku/Sonnet, Bash+Read, structured summary;
- `dod-verifier` — Sonnet, read-only;
- `contract-reviewer` — Sonnet, read-only;
- `mutation-runner` — Sonnet, isolated worktree;
- `audit-synthesizer` — Sonnet/Opus только для сложного L.

Фиксировать через frontmatter `model`, `effort`, `maxTurns`, `tools`, `disallowedTools` и
`isolation`. Это надёжнее, чем каждый раз описывать модель и ограничения естественным языком.

Важно: встроенный `Explore` не получает проектный `CLAUDE.md` и git status. Если recon обязан
учитывать эти правила, их надо передать явно или использовать custom agent с компактным
repo-contract skill.

### 10. Использование встроенных возможностей Claude Code

- LSP-first navigation вместо серий grep/read;
- `/run-skill-generator` один раз фиксирует способ запуска проекта;
- `/verify` проверяет изменение на работающем приложении;
- `/simplify` делает post-implementation cleanup;
- `/review` и `/security-review` закрывают стандартные read-only reviews;
- `/usage` показывает вклад skills, subagents и plugins;
- `claude plugin details` показывает always-on и on-invoke token cost;
- `claude plugin validate . --strict` проверяет manifests/frontmatter/hooks.

Не создавать собственные общие `review`, `security-review` или `verify`, если нет дополнительного
artifact-aware поведения.

### 11. Переиспользование recon

`refine` уже изучает код, но `build` часто начинает recon заново. То же происходит между
`audit → refactor` и `lint-audit → lint-fix`.

Добавить в upstream artifacts:

- compact code map;
- список reuse points;
- evidence paths;
- source commit/hash;
- hash затронутых файлов;
- проектный verification recipe.

Следующая команда должна переиспользовать этот context, если соответствующие файлы не изменились,
и повторно проверять только stale sections.

### 12. `/prorab:quick`

Отдельный компактный Skill для ежедневных задач в 1–2 файлах:

- без IDEA/IMPL;
- без Workflow;
- implementation главным агентом;
- targeted tests;
- один независимый verifier;
- короткий итог;
- автоматическая эскалация в `refine/build`, если обнаружен contract change или неоднозначный DoD.

Важно: это должен быть самостоятельный короткий Skill, а не алиас, загружающий весь `build`.

## P2 — удобство и инфраструктура

### 13. `/prorab:next`

Read-only команда, которая:

- читает metadata артефактов;
- показывает незавершённые IDEA/IMPL/AUDIT/LINT;
- определяет stale artifacts;
- предлагает ровно следующую команду;
- находит следующий LINT batch с выполненными prerequisites;
- помогает продолжить прерванную работу.

### 14. `/prorab:doctor`

Проверяет:

- версию Claude Code и доступность Workflow;
- plugin validation;
- dynamic workflow size;
- `worktree.baseRef`;
- dirty tree;
- наличие project verification recipe;
- доступность test/lint/build;
- artifact schemas;
- projected plugin token cost.

### 15. `/prorab:check`

Artifact-aware read-only verification текущего diff против IDEA/IMPL:

- Scope IN/OUT;
- каждый DoD item;
- contract boundaries;
- test evidence;
- незакрытые `[?:…]`;
- файлы вне scope.

Имеет смысл после появления формальной схемы артефактов.

### 16. Компактный test/build runner

Полный output сохранять в файл, а модели возвращать JSON:

```json
{
  "command": "pytest -q",
  "exit_code": 1,
  "collected": 184,
  "passed": 183,
  "failed": 1,
  "failure_tail": "...",
  "full_log": "/tmp/prorab-run-123.log"
}
```

Это уменьшит контекст тестовых агентов и не потеряет проверку exit code/test count.

### 17. CI

Минимальный pipeline:

- `claude plugin validate . --strict`;
- JSON/YAML validation;
- проверка всех skill/agent frontmatter;
- artifact schema tests;
- запрет известных опасных шаблонов вроде необусловленного `git checkout --`;
- проверка version/changelog consistency;
- проверка ссылок и автоматически генерируемых README tables.

### 18. Единый источник версии

`plugin.json` уже имеет приоритет над marketplace entry. Поэтому можно:

- оставить explicit SemVer только в `plugin.json`;
- убрать дублирующую version из marketplace;
- во время активной разработки использовать commit-SHA versioning;
- для release использовать SemVer и `claude plugin tag`;
- автоматически проверять запись в CHANGELOG.

### 19. Manifest и документация

- добавить `$schema` в оба `plugin.json`;
- добавить `repository`, `homepage`, `license`, `keywords`;
- добавить файл LICENSE;
- исправить устаревший локальный путь установки `/Users/a.altukhov/Documents/prorab`;
- обновить раздел добавления команд: Skills должны быть рекомендуемым форматом;
- генерировать каталог команд из frontmatter, чтобы README не расходился с кодом.

### 20. Проверить экономию English execution

Сохранить английский внутренний контур как разумный default, но измерить его через A/B eval:

- одинаковые задачи с English и Russian execution prompt;
- input/output/thinking tokens;
- task success rate;
- число повторных уточнений и исправлений;
- устойчивость UI/domain terminology.

Заявлять процент экономии только после накопления данных. Артефакты при этом можно оставить в языке
пользователя, но сделать их компактными и структурированными.

## Что не рекомендуется добавлять сейчас

- новые reviewer personas без измеримой пользы;
- собственные аналоги встроенных `/review`, `/security-review`, `/simplify`;
- agent teams для обычного `build` — у coding-задач слишком много общего контекста и зависимостей;
- MCP для локальных операций, которые дешевле и проще выполнить через CLI;
- ещё более подробные prompt-инварианты без hooks/evals;
- полную автоматическую установку linters/analyzers без явного разрешения.

## Рекомендуемый порядок реализации

### Релиз 1 — безопасность и устранение явных проблем

- [ ] Исправить lint gate contradiction.
- [ ] Убрать `git checkout` из sabotage flows.
- [ ] Добавить dirty-tree/worktree preflight.
- [ ] Убрать stack-specific обязательные команды из `build`.
- [ ] Добавить `disable-model-invocation: true`.

### Релиз 2 — измеримость и бюджеты

- [ ] Создать минимальный eval suite.
- [ ] Начать собирать usage/agent/turn metrics.
- [ ] Ввести hard caps S/M/L.
- [ ] Добавить no-progress stopping rule.
- [ ] Сделать mutations risk-based.

### Релиз 3 — модульная архитектура

- [ ] Мигрировать команды в Skills.
- [ ] Вынести references/templates.
- [ ] Добавить custom agents.
- [ ] Перевести механические этапы в scripts.
- [ ] Подключить LSP-first и встроенные verification skills.

### Релиз 4 — artifact platform и новые команды

- [ ] Ввести artifact schema v1.
- [ ] Добавить freshness и status transitions.
- [ ] Реализовать `/prorab:quick`.
- [ ] Реализовать `/prorab:next`.
- [ ] Реализовать `/prorab:doctor` и затем `/prorab:check`.

## Использованные внешние источники

- [Claude Code Skills](https://code.claude.com/docs/en/slash-commands)
- [Dynamic Workflows](https://code.claude.com/docs/en/workflows)
- [Custom subagents](https://code.claude.com/docs/en/sub-agents)
- [Hooks reference](https://code.claude.com/docs/en/hooks)
- [Plugin reference](https://code.claude.com/docs/en/plugins-reference)
- [Claude Code cost management](https://code.claude.com/docs/en/costs)
- [Worktree settings](https://code.claude.com/docs/en/settings)
- [Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
- [How Anthropic built its multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
