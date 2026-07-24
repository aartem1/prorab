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
- `⏸` — отложено;
- `⊘` — решено не реализовывать;
- в колонке «Реализация» указывается версия, commit, PR или дата завершения.

| № | Статус | Приоритет | Предложение | Качество | Экономия токенов | Сложность | Реализация |
|---:|:---:|:---:|---|:---:|:---:|:---:|---|
| 1 | ☑ | P0 | Ввести жёсткие лимиты агентов и hybrid orchestration | 5 | 5 | M | `prorab 0.6.0` / `prorab-tech 0.5.0` |
| 2 | ⏸ | — | Создать eval-набор и собирать фактические usage-метрики | 5 | 5 | L | Отложено 2026-07-10: слишком высокая сложность |
| 3 | ◐ | P1 | Перенести безопасность из prompt'ов в hooks и изолировать mutations | 5 | 2 | M | Prompt isolation: `prorab 0.8.0` / `prorab-tech 0.7.0`; hooks не реализованы |
| 4 | ☑ | P0 | Исправить противоречия lint pipeline и stack-specific предположения | 5 | 2 | S | `prorab 0.7.0` / `prorab-tech 0.6.0` |
| 5 | ☐ | P1 | Мигрировать `commands/` в модульные Skills | 4 | 4 | M | — |
| 6 | ☐ | P1 | Ввести формальную схему и freshness-проверку артефактов | 5 | 4 | M | — |
| 7 | ☐ | P1 | Заменить механических LLM-агентов детерминированными scripts | 4 | 5 | M | — |
| 8 | ☑ | P1 | Сделать verification risk-based вместо обязательных panels/mutations | 4 | 5 | M | `prorab 0.8.0` / `prorab-tech 0.7.0` |
| 9 | ☐ | P1 | Добавить фиксированных специализированных subagents | 4 | 4 | M | — |
| 10 | ☐ | P1 | Использовать LSP и встроенные `/verify`, `/run`, `/simplify`, `/review` | 4 | 3 | S–M | — |
| 11 | ☑ | P1 | Переиспользовать recon между этапами с проверкой свежести | 4 | 4 | M | `prorab 0.10.0` / `prorab-tech 0.9.0` |
| 12 | ☑ | P1 | Добавить `/prorab:quick` для небольших повседневных задач | 4 | 5 | S | `prorab 0.10.0` |
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

Реализованная политика:

- бюджет считается кумулятивно за всю команду: главный контекст, каждый `Agent`/Workflow node и
  повторный запуск;
- **S:** максимум 2 model contexts суммарно, без Workflow;
- **M:** максимум 6 model contexts суммарно, не более двух review→fix циклов;
- **L:** максимум 12 model contexts по умолчанию и абсолютный cap 16; расширение только после
  подтверждённого критического риска или явного `--thorough`;
- обязательный лимит ходов: `max_turns` для прямого Agent и `maxTurns` для Workflow/custom agent,
  6/8/12 для S/M/L;
- каждый Workflow-скрипт обязан исполняемо ограничивать запуски через счётчик и `boundedAgent()`;
  raw `agent()` и `pipeline()` по списку длиннее остатка бюджета запрещены;
- прекращение цикла после одного раунда без новых подтверждённых findings;
- judge-panel только при наличии минимум двух действительно различных архитектурных вариантов;
- для `audit` сгруппировать lenses в три направления: structure, reliability/security,
  performance/maintainability;
- по умолчанию adversarially проверять только кандидата #1; runners-up — только при близких оценках;
- `refine` ограничен двумя Explore-контекстами, `announce` — одним делегированным контекстом и
  одним fact-check раундом;
- выбранный tier, `used/cap`, escalation и no-progress stop показываются в progress log.

Ожидаемый эффект: снижение расхода на S/M примерно на 30–60%, более предсказуемые L-задачи,
меньше коррелированных и повторяющихся выводов.

### 4. Исправить конкретные противоречия

Реализовано в `prorab 0.7.0` / `prorab-tech 0.6.0`.

#### Lint pipeline

`lint-audit` разделяет работу на:

- A — autofix;
- B — onboarding;
- C — первоначальная установка gate;
- D — strictness ratchet.

Одновременно `lint-fix` требует добавлять и sabotage-проверять gate при каждом batch. Шаблон LINT
при этом допускает, что batch A лишь подготавливает gate.

Реализованная единая модель:

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

### 3. Детерминированные safety guardrails

До `prorab 0.8.0` / `prorab-tech 0.7.0` mutation/sabotage проверки предлагали откат через
`git checkout`, что могло стереть незакоммиченные изменения в том же файле. Теперь prompt-flow
требует временный isolated worktree с task-scoped patch, но это всё ещё текстовая инструкция, а не
детерминированно исполняемое ограничение.

**Почему приоритет понижен с P0 до P1.** В текущем основном режиме использования владелец проекта
не редактирует файлы параллельно с агентом. Поэтому непосредственный риск потерять именно ручные
пользовательские изменения ниже, чем предполагалось первоначально, а неконтролируемый fan-out уже
создаёт гарантированный расход времени и токенов в каждом тяжёлом workflow. Guardrails не отменены:
mutation всё ещё может пересечься с промежуточными изменениями самого агента, поэтому задача остаётся
важной и должна идти следующим архитектурным этапом после бюджетов и измеримости.

Необходимо:

- исполняемо обеспечивать запуск mutations в отдельном временном worktree, а не полагаться только
  на prompt;
- либо сохранять точный patch мутации и откатывать только этот patch;
- через `PreToolUse` блокировать `git checkout --`, `git reset`, `git clean`, commit и push, если
  действие не разрешено текущим workflow;
- для read-only команд блокировать записи вне разрешённой папки артефактов;
- перед mutating Workflow проверять dirty tree и пересечение затрагиваемых файлов;
- после sabotage-проверки программно убеждаться, что mutation полностью удалена;
- проверять `worktree.baseRef`: для работы с текущей веткой нужен `head`, либо чистый и явно
  подходящий base commit.

Prompt-инструкция «не делай» должна оставаться объяснением, а hook — настоящим ограничителем.

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

Реализовано в `prorab 0.8.0` / `prorab-tech 0.7.0`.

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

**Реализовано частично в `prorab 0.10.0` для `refine → build`.** IDEA получила секцию `Code map`:
изученные файлы с `git hash-object` хэшами, reuse points, change points, задетые контракты,
конвенции, честный список неизученного и наблюдённые (но не запущенные) verification-команды.
`build` в Phase 1 пере-хэширует пути: всё свежее — recon стоит ноль контекстов; частично свежее —
recon сужается до stale-записей и заявленных пробелов; карты или хэшей нет — обычный recon.
Сэкономленные контексты не перетрачиваются. Совпавший хэш доказывает только неизменность файла,
поэтому утверждение карты, ведущее к правке внешнего контракта, всё равно проверяется по текущему
источнику, а наблюдённые команды остаются подсказкой для Phase 0.

**Реализовано в `prorab-tech 0.9.0` для обеих пар, но в двух разных формах** — предложение выше
неявно считало их одинаковыми, и это оказалось неверно.

`audit → refactor`: спека кандидата #1 получила `Provenance and freshness` — коммит и
`git hash-object` хэши целевых файлов, тестов, на которых держится net status, и файлов
call-sites. `refactor` пере-хэширует их в Phase 0, **до выбора тира**: раньше он брал
`safety`/`coverage_nearby`/`blast_radius` из AUDIT с прямым запретом перевыводить, поэтому
устаревший аудит молча задавал бюджет и оценку безопасности на контуре сохранения поведения.
Теперь устарелость типизирована: устаревшая цель делает кандидата obsolete до переподтверждения
смелла, устаревший тест обнуляет заявление о покрытии, устаревший call-site — blast radius, и любая
устарелость заставляет перевыводить тир. Свежесть не заменяет доказательств: сеть, зелёная на старом
коде, contract-diff и хотя бы один drift/differential прогон остаются обязательными.

`lint-audit → lint-fix`: хэшированная карта здесь — **неправильный инструмент**. Счётчики нарушений
устаревают конструктивно (батч N меняет код), а перезапуск анализатора детерминирован и почти
бесплатен. Поэтому handoff другой: LINT записывает точные инвокации анализаторов/сети и entrypoint
гейта, а `lint-fix` берёт текущее состояние гейта из артефакта последнего завершённого батча вместо
повторного поиска. Счётчики помечены как снимок, а не handoff.

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

**Реализовано в `prorab 0.10.0`** как отдельная короткая команда `commands/quick.md` (не алиас):
жёсткий лимит 2 контекста, без Workflow, без артефактов, DoD в формате `input → expected` до правки,
red-first тест по `AssertionError`, проектные команды проверок, один независимый верификатор с
`refuted if in doubt`. Eligibility gate проверяется до правки и повторно после чтения кода;
внешний контракт, больше ~2–3 файлов или одного слоя, двусмысленное требование,
security/auth/payment, behavior-preserving реструктуризация или недоступный доступ — обязательная
передача в `/prorab:refine`+`build` либо в технический контур. Второй подтверждённый раунд
верификации тоже эскалирует, а не продолжает шлифовать.

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

## Отложенные задачи

### 2. Evals и usage-метрики

Задача отложена 2026-07-10 из-за высокой сложности реализации и поддержки benchmark suite.
Возвращаться к ней следует только после упрощения framework и появления более дешёвого способа
собирать метрики.

Первоначально предлагалось подготовить 10–20 fixture-сценариев, измерять успешность, корректность
diff, DoD coverage, число агентов, turns, tokens и duration, а затем сравнивать версии через A/B.
Результаты должны были проверяться преимущественно детерминированными graders через tests, diff и
schema, с LLM-grader только для качественных критериев.

## Что не рекомендуется добавлять сейчас

- новые reviewer personas без измеримой пользы;
- собственные аналоги встроенных `/review`, `/security-review`, `/simplify`;
- agent teams для обычного `build` — у coding-задач слишком много общего контекста и зависимостей;
- MCP для локальных операций, которые дешевле и проще выполнить через CLI;
- ещё более подробные prompt-инварианты без hooks/evals;
- полную автоматическую установку linters/analyzers без явного разрешения.

## Рекомендуемый порядок реализации

### Релиз 1 — бюджеты оркестрации и устранение явных проблем

- [x] Ввести hard caps S/M/L и обязательный `maxTurns`.
- [x] Добавить no-progress stopping rule и предел review→fix циклов.
- [x] Сгруппировать audit lenses и проверять #1 по умолчанию.
- [x] Исправить lint gate contradiction.
- [x] Убрать stack-specific обязательные команды из `build`.

### Релиз 2 — risk-based verification

- [x] Сделать mutations risk-based.

### Релиз 3 — safety guardrails и модульная архитектура

- [x] Убрать `git checkout` из sabotage flows и описать изоляцию mutations.
- [ ] Обеспечить изоляцию mutations исполняемым hook/script.
- [ ] Добавить dirty-tree/worktree preflight и `PreToolUse`-ограничения.

- [ ] Мигрировать команды в Skills.
- [ ] Вынести references/templates.
- [ ] Добавить `disable-model-invocation: true`.
- [ ] Добавить custom agents.
- [ ] Перевести механические этапы в scripts.
- [ ] Подключить LSP-first и встроенные verification skills.

### Релиз 4 — artifact platform и новые команды

- [ ] Ввести artifact schema v1.
- [ ] Добавить freshness и status transitions.
- [ ] Реализовать `/prorab:quick`.
- [ ] Реализовать `/prorab:next`.
- [ ] Реализовать `/prorab:doctor` и затем `/prorab:check`.

### Отложено

- [ ] Создать eval suite и начать собирать usage/agent/turn metrics — вернуться после упрощения
  framework и снижения стоимости реализации.

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
