# Project Context Roadmap

Самодостаточный план внедрения эффективной навигации по проектам для `prorab`.

Цель инициативы: перестать исследовать большой проект с нуля при каждом запуске `refine`, `build`,
`audit`, `refactor`, `lint-audit` и `lint-fix`. Вместо этого команды должны получать компактный,
актуальный и проверяемый контекст по конкретной задаче, а затем читать только действительно нужные
участки исходного кода.

Этот файл — рабочий источник истины для всей инициативы project context. Общий roadmap framework
остаётся в `IMPROVEMENT-PROPOSALS.md`. Если документы расходятся именно по project context,
приоритет имеет этот файл. Общие safety-инварианты действующих команд сохраняют силу.

## Как использовать этот файл в новой сессии

Достаточно передать агенту этот файл и написать **«делай»**.

Агент обязан:

1. Полностью прочитать этот файл и актуальные repository instructions.
2. Проверить `git status`, текущую ветку и уже внесённые изменения.
3. В таблице приоритетов выбрать задачу с наименьшим номером, которая:
   - имеет статус `NEXT`, `TODO` или `BLOCKED`;
   - не является `GATED`, либо её activation gate уже доказан;
   - имеет все зависимости в статусе `DONE`.
4. Если первая подходящая задача имеет `BLOCKED`, сначала повторно проверить blocker. Не пропускать
   её молча. Отложить задачу и перейти дальше можно только по явному решению пользователя.
5. Выполнить ровно одну выбранную задачу полностью под ключ: код, тесты, документация, versions,
   changelog и проверка plugin manifests — всё, что относится к её Definition of Done.
6. Не останавливаться на плане или частичной заготовке. `DONE` означает, что результат реально
   работает и проверен.
7. В этом файле:
   - поменять статус выполненной задачи на `DONE`;
   - записать дату, версию/commit и результаты проверок;
   - следующую обязательную `TODO`-задачу с выполненными зависимостями пометить `NEXT`;
   - новые существенные решения или отклонения добавить в журнал решений.
8. Не делать commit/push без отдельной просьбы пользователя. «Под ключ» здесь означает готовые и
   проверенные изменения в рабочем дереве; git-публикация остаётся отдельным действием.

Если во время реализации обнаружена необходимая работа, которой нет в roadmap:

- небольшую работу, без которой невозможно выполнить текущий DoD, включить в текущую задачу;
- отдельную крупную работу добавить новой задачей с ID, зависимостями и приоритетом;
- не расширять инициативу несвязанными улучшениями framework.

## Статусы

- `NEXT` — следующая обязательная задача.
- `TODO` — обязательная задача, ожидающая своей очереди или зависимостей.
- `BLOCKED` — задача начата или исследована, но есть подтверждённый blocker.
- `DONE` — полностью реализовано и проверено.
- `GATED` — необязательная задача; выполняется только при выполненном activation gate.
- `NOT_NEEDED` — activation gate проверен и не выполнен; решение зафиксировано доказательствами.

Одновременно статус `NEXT` должна иметь не более чем одна задача. Если подсказка `NEXT` потеряна или
ошибочна, числовой порядок и зависимости важнее статуса.

## Проблема

Сейчас upstream-команда уже изучает код, но downstream-команда часто повторяет ту же работу:

- `refine` ищет релевантные файлы, reuse points и конфликты;
- `build` снова читает широкий набор project files и заново строит codebase map;
- `audit` строит карту проекта, а `refactor` повторно ищет target, consumers и call-sites;
- `lint-audit` выясняет tooling и verification recipe, а `lint-fix` повторно читает эти источники;
- `announce` снова восстанавливает факты, если upstream artifact недостаточно точен.

На больших проектах это приводит к повторным `Grep`/`Glob`/`Read`, лишним Explore-контекстам,
зашумлению main context и повторному расходованию токенов.

## Целевой пользовательский результат

Для запроса вроде «добавь частичный возврат» агент сначала получает компактную капсулу:

```text
Основной change point:
- RefundService.create_refund — services/payments/refunds.py

Consumers и контракты:
- POST /refunds — services/payments/api.py
- event refund.created — services/events/refunds.py

Тесты и проверки:
- tests/payments/test_refunds.py
- make test-refunds

Риск:
- формат события используется сервисом accounting
```

После этого он читает только указанные source ranges и проверяет выводы по реальному коду.

Система должна работать без обязательного `/init` и без участия остальных разработчиков. После
`git pull`, checkout, rebase или ручного редактирования следующий context query сам замечает
изменившееся содержимое и обновляет только затронутую часть индекса.

## Принятая архитектура

### 1. Три разных вида знания

Не смешивать их в одном большом summary:

1. **Командные правила** — краткие, version-controlled: architecture boundaries, ownership,
   supported commands, business terms. Источник: `CLAUDE.md`, path-scoped rules, README,
   `CODEOWNERS`, опциональные `.prorab/project.yaml` и component cards.
2. **Производный индекс** — автоматически вычисляемые files, symbols, imports, references,
   dependencies, tests и tooling. Он локальный, одноразовый и никогда не является ручной
   документацией.
3. **Task context capsule** — маленькая выборка из индекса под конкретную задачу с evidence и
   freshness metadata. Она может передаваться между `refine → build` и `audit → refactor`.

### 2. Источник истины — текущий worktree

- Clean tracked file идентифицируется Git blob ID.
- Dirty и untracked file идентифицируется хешем текущего содержимого.
- Удаления, rename, mode changes и branch changes входят в fingerprint.
- `mtime` можно использовать только как performance hint, но не как доказательство свежести.
- Один `source_sha` хранится как provenance, но не инвалидирует весь context целиком.
- Evidence хранит `stable symbol id + path + content hash`; `file:line` — только удобная подсказка.

### 3. Progressive retrieval

Порядок поиска:

1. Явные path/symbol и evidence из task artifact.
2. LSP: definition, references, implementations, workspace symbols, call hierarchy.
3. Exact lexical search / FTS.
4. Repository map и dependency graph.
5. `rg`/`Glob` fallback.
6. Explore-agent только для оставшейся неоднозначности.
7. Embeddings — только если отдельный eval докажет пользу.

### 4. Summary не является доказательством

Любой найденный context указывает на исходный файл и его content hash. Перед изменением поведения,
контракта или публичной сигнатуры агент обязан открыть релевантный source range. Старая капсула
может ускорить поиск, но не может переопределить текущий код.

### 5. Correctness не зависит от watcher

File watcher, hook или background monitor может ускорить обновление, но каждый context query всё
равно выполняет дешёвую проверку fingerprint. Поэтому система остаётся корректной после изменений,
сделанных не через Claude Code, в другой сессии или другим разработчиком.

### 6. Два существующих plugin используют одно context core

Общая функциональность должна жить в отдельном plugin `prorab-context`. `prorab` и `prorab-tech`
объявляют его dependency. Производное состояние хранится в persistent plugin data, разделённое по
repository/worktree, а не внутри versioned plugin directory и не в рабочем репозитории пользователя.

## Общие инварианты реализации

- Framework остаётся stack-agnostic: никакой обязательной привязки к Python, Node, Docker или
  конкретной структуре backend/frontend.
- На машине пользователя не устанавливаются зависимости и не скачиваются модели без явного
  разрешения. Bundled/offline functionality предпочтительнее.
- Context tools по умолчанию read-only и не могут менять project code.
- Secrets, ignored files, binary files, build output, vendor directories и слишком большие files не
  индексируются по умолчанию.
- Индекс должен иметь schema/tool version. При несовместимом обновлении он безопасно перестраивается.
- Любой context feature имеет корректный fallback на существующие Claude Code tools.
- Частично готовый или сломанный индекс никогда не блокирует обычный `build`/`refactor`; команда
  сообщает degradation и выполняет bounded fresh recon.
- Выдача context ограничивается явным token/character budget и содержит причины выбора каждого
  результата.
- Plugin paths используют `${CLAUDE_PLUGIN_ROOT}`; persistent state — `${CLAUDE_PLUGIN_DATA}`.
- Любое изменение plugin требует semver bump в `plugin.json` и marketplace, а также записи в
  `CHANGELOG.md`.
- Все новые deterministic scripts имеют unit/integration tests. Prompt-only обещание не считается
  реализацией executable invariant.

## Таблица приоритетов

| ID | Статус | Приоритет | Задача | Зависимости |
|---|---|---:|---|---|
| CTX-001 | NEXT | P0 | LSP-first navigation и единый recon contract | — |
| CTX-002 | TODO | P0 | `prorab-context`: repository fingerprint и inventory core | CTX-001 |
| CTX-003 | TODO | P0 | Artifact schema v1 и freshness-aware context capsule | CTX-002 |
| CTX-004 | TODO | P0 | Инкрементальная deterministic repository map | CTX-002 |
| CTX-005 | TODO | P0 | Selective retrieval API: CLI/MCP без embeddings | CTX-003, CTX-004 |
| CTX-006 | TODO | P0 | Интеграция context core в `refine → build` | CTX-005 |
| CTX-007 | TODO | P1 | Интеграция context core в tech-quality track | CTX-005 |
| CTX-008 | TODO | P1 | Freshness hardening: dirty overlay и dependency invalidation | CTX-006, CTX-007 |
| CTX-009 | TODO | P1 | `/prorab:doctor` и опциональный project knowledge contract | CTX-008 |
| CTX-010 | TODO | P1 | Context-specific eval и решение о следующих уровнях | CTX-006, CTX-007, CTX-008 |
| CTX-011 | GATED | P2 | Semantic retrieval / embeddings | CTX-010 + activation gate |
| CTX-012 | GATED | P2 | Shared CI index, remote cache или Sourcegraph adapter | CTX-010 + activation gate |

## CTX-001 — LSP-first navigation и единый recon contract

### Зачем

Получить первую экономию без собственного индексатора. Claude Code уже умеет definition,
references, implementations, workspace symbols и call hierarchy через LSP, но команды framework
сейчас ориентированы преимущественно на `Grep`/`Glob` и Explore-agents.

### Что сделать

- Ввести единый recon order из раздела Progressive retrieval во все команды, которые исследуют
  project code.
- В `refine`, `build`, `audit`, `refactor`, `lint-audit` и `lint-fix` явно использовать LSP, когда
  tool доступен и применим к языку.
- Не считать отсутствие LSP blocker: записывать capability gap и переходить к `rg`/`Glob`.
- Стандартизовать recon result:
  - affected components;
  - exact change points;
  - definitions/consumers/call-sites;
  - external contracts;
  - reuse points;
  - relevant tests;
  - verification commands;
  - unresolved uncertainty;
  - evidence `path:symbol/line`.
- Устранить противоречащие новому порядку инструкции и дублирование между командами.

### Definition of Done

- Все шесть heavy commands используют одинаковую search hierarchy и одинаковые термины.
- Small task не запускает Explore-agent, если LSP/точечный поиск уже дал достаточную карту.
- Отсутствие LSP имеет честный и рабочий fallback.
- Обновлены README, CHANGELOG и versions затронутых plugins.
- `claude plugin validate .` либо `/plugin validate .` проходит.
- Добавлена документированная ручная fixture-проверка минимум для:
  - LSP available;
  - LSP unavailable;
  - unsupported language.

### Не входит

- Собственный index/cache.
- Автоматическая установка language servers.
- MCP server.

### Реализация

- Статус: `NEXT`.
- Evidence: не реализовано.

## CTX-002 — `prorab-context`: repository fingerprint и inventory core

### Зачем

Создать общий deterministic foundation для обоих tracks. Он должен автоматически понимать, с какой
версией проекта работает агент, и не требовать ручной инициализации.

### Что сделать

- Добавить третий marketplace plugin `prorab-context` версии `0.1.0`.
- Объявить его dependency для `prorab` и `prorab-tech`.
- Перед выбором runtime провести короткий executable spike и зафиксировать решение:
  - работает на поддерживаемых Claude Code платформах;
  - не требует неявного network install;
  - допускает CLI и будущий stdio MCP;
  - корректно обрабатывает paths с пробелами и Unicode.
- Реализовать read-only CLI минимум с командами:
  - `prorab-context status --json`;
  - `prorab-context snapshot --json`;
  - `prorab-context inventory --json`.
- Snapshot включает:
  - repository identity;
  - HEAD commit и tree;
  - tracked clean blobs;
  - dirty/untracked/deleted/renamed files с content hashes;
  - index schema/tool version;
  - ignore/config fingerprint.
- Inventory включает компактные deterministic facts:
  - tracked source/config/docs files;
  - manifests, CI, task runners, test roots;
  - обнаруженные languages/stacks как evidence-based hints;
  - `CLAUDE.md`, README, CODEOWNERS и project rules;
  - возможные verification command sources без выдумывания самих команд.
- Persistent state хранить за пределами project tree и versioned plugin directory.

### Definition of Done

- Установка любого из двух основных plugins транзитивно разрешает `prorab-context` dependency.
- Первый snapshot строится без `/init`; повторный на неизменном repo использует cache.
- Изменение содержимого без изменения `mtime` обнаруживается.
- Dirty, untracked, deletion и rename отражаются в fingerprint.
- Ignored/binary/vendor/build files не попадают в inventory по умолчанию.
- Есть unit tests для fingerprint и integration fixture с Git repository.
- Есть безопасный non-git fallback или ясная диагностическая ошибка без stack trace dump.
- Обновлены marketplace, manifests, README и CHANGELOG; plugin validation проходит.

### Не входит

- Symbols/import graph.
- Context retrieval.
- Изменение IDEA/AUDIT artifacts.

### Реализация

- Статус: `TODO`.
- Evidence: не реализовано.

## CTX-003 — Artifact schema v1 и freshness-aware context capsule

### Зачем

Позволить downstream-команде использовать recon из upstream artifact и обновлять только устаревшие
фрагменты, а не повторять весь поиск.

### Что сделать

- Формализовать versioned schemas для IDEA, AUDIT, LINT и IMPL artifacts.
- Ввести вложенную capsule schema `prorab.context/v1`.
- Минимальные поля capsule:

```yaml
context:
  schema: prorab.context/v1
  query: <task/focus>
  repository:
    head: <commit>
    tree: <tree>
    dirty_fingerprint: <hash|null>
  components: []
  evidence:
    - role: primary_change_point
      symbol: <stable symbol id|null>
      path: <repo-relative path>
      line: <display hint|null>
      content_hash: <blob/content hash>
  verification_recipe:
    commands: []
    source_hashes: []
  uncertainties: []
```

- Добавить deterministic validator и freshness checker.
- `source_sha` оставить provenance, но freshness считать по evidence hashes.
- Старые artifacts без schema должны читаться через backward-compatible fallback и не считаться
  автоматически fresh.
- Определить статусы `draft → ready → in_progress → done|blocked|stale` и допустимые transitions.
- Обновить artifact templates и команды, которые их создают/читают.

### Definition of Done

- Валидный новый artifact проходит schema validation.
- Невалидный artifact получает короткий actionable report.
- Изменение несвязанного файла не делает capsule целиком stale.
- Изменение evidence file помечает конкретный evidence item stale.
- Старый artifact не ломает command и вызывает bounded fresh recon.
- Context capsule ограничена ориентиром 800–1 500 токенов, большие excerpts запрещены.
- Есть schema fixtures и tests для status/freshness transitions.
- README/CHANGELOG/versions обновлены; plugin validation проходит.

### Не входит

- Автоматическое нахождение symbols и dependencies.
- Embeddings.

### Реализация

- Статус: `TODO`.
- Evidence: не реализовано.

## CTX-004 — Инкрементальная deterministic repository map

### Зачем

Дать агенту компактное представление проекта: где находятся основные definitions, imports,
entrypoints и tests, не читая целые файлы и не вызывая LLM для построения карты.

### Что сделать

- На базе inventory извлекать для поддерживаемых языков:
  - top-level classes/functions/types/interfaces;
  - signatures без тел функций;
  - imports/exports;
  - definitions/references, если parser даёт их надёжно;
  - test declarations и связь test file → source component;
  - config-driven entrypoints, где это возможно детерминированно.
- Выбрать parser strategy через проверяемый ADR:
  - Tree-sitter/bundled parsers;
  - LSP-derived data;
  - комбинация;
  - fallback для неподдерживаемых языков.
- Cache key каждого file map:
  `content hash + parser version + configuration hash`.
- При изменении файла обновлять только его symbols/edges и зависимые агрегаты.
- Не генерировать LLM summaries на этом этапе.

### Definition of Done

- Map строится автоматически на первом запуске и повторно использует unchanged entries.
- Output детерминирован и имеет versioned machine-readable schema.
- Минимум три разных language fixtures покрывают definitions/imports/tests.
- Unsupported language даёт file-level map и честный capability marker.
- Parse error одного файла не ломает всю карту.
- Карта не содержит function bodies, secrets, ignored files и binary content.
- Есть benchmark на synthetic repository, фиксирующий cold и incremental path без жёсткого
  привязывания к скорости конкретной машины.

### Не входит

- Natural-language retrieval.
- Embeddings.
- Remote/shared index.

### Реализация

- Статус: `TODO`.
- Evidence: не реализовано.

## CTX-005 — Selective retrieval API: CLI/MCP без embeddings

### Зачем

Не передавать агенту полную repository map. Под каждую задачу выбирать маленький набор наиболее
релевантных symbols/files/contracts/tests в заданном budget.

### Что сделать

- Реализовать retrieval pipeline:
  1. exact path/symbol/artifact anchors;
  2. exact lexical/FTS search;
  3. graph expansion по imports/references/consumers/tests;
  4. ranking по task match, graph proximity и evidence role;
  5. обрезка по token/character budget.
- Добавить CLI и компактный read-only MCP server.
- MCP API держать маленьким, ориентировочно:
  - `repo_overview`;
  - `find_context`;
  - `symbol_context`;
  - `impact`;
  - `tests_for`;
  - `verify_evidence`.
- Каждый result содержит `why selected`, path, symbol/line hint и content hash.
- Перед каждым query выполнять дешёвый fingerprint sync.
- Любой partial/stale index явно маркировать и дополнять fallback evidence.

### Definition of Done

- Natural-language query возвращает bounded context, а не file dumps.
- Явный symbol/path имеет приоритет над fuzzy candidates.
- Token/character budget соблюдается детерминированно.
- Повторный query на неизменном repo не перестраивает индекс.
- Изменённый файл обновляется до выдачи результата.
- MCP не имеет write tools и не принимает path traversal за пределы project root.
- CLI остаётся полноценным fallback, если MCP недоступен.
- Integration tests покрывают overview, symbol, impact, tests и stale evidence.

### Не входит

- Vector database и embeddings.
- Remote service.

### Реализация

- Статус: `TODO`.
- Evidence: не реализовано.

## CTX-006 — Интеграция context core в `refine → build`

### Зачем

Получить основную продуктовую экономию: `refine` один раз находит затронутую область, `build`
проверяет свежесть и продолжает с готовой capsule.

### Что сделать

- `refine`:
  - вызывает context sync/query перед широким recon;
  - использует найденные components/change points/reuse/contracts/tests;
  - проверяет важные выводы по source;
  - записывает capsule в IDEA.
- `build`:
  - валидирует IDEA/capsule;
  - переиспользует fresh evidence;
  - обновляет только stale/uncertain sections;
  - не читает весь набор README/CI/manifests повторно, если inventory и recipe fresh;
  - сохраняет использованный/обновлённый context в IMPL.
- `announce` использует verified IMPL facts; context query запускается только при недостаточном или
  stale artifact, а не по умолчанию.
- Логировать `context hit/miss/partial`, reused evidence count и причины fallback.

### Definition of Done

- Сценарий `refine → без изменений → build` не повторяет полный recon.
- Изменение одного evidence file обновляет только связанную часть.
- Изменение несвязанного файла сохраняет reuse.
- Отсутствующий/сломанный context plugin не блокирует pipeline.
- Implementation plan ссылается на проверенный текущий код, а не только на summary.
- Есть end-to-end fixtures для full hit, partial hit, miss и plugin unavailable.
- Versions/README/CHANGELOG обновлены; plugin validation проходит.

### Не входит

- Tech-quality commands.
- Remote cache.

### Реализация

- Статус: `TODO`.
- Evidence: не реализовано.

## CTX-007 — Интеграция context core в tech-quality track

### Зачем

Переиспользовать project map, tooling inventory и candidate boundaries между
`audit → refactor` и `lint-audit → lint-fix`.

### Что сделать

- `audit` использует repository map для направленного sweep, но честно сообщает coverage и не
  выдаёт неполную parser support за полный аудит.
- AUDIT candidate содержит exact target, consumers, contracts, coverage/test evidence и hashes.
- `refactor` проверяет capsule и повторно исследует только stale target neighbourhood.
- `lint-audit` получает manifests, analyzers, CI и verification sources из inventory.
- LINT artifact сохраняет freshness-aware tooling recipe.
- `lint-fix` переиспользует recipe, но заново проверяет executable availability и текущий violation
  set перед изменениями.
- Сохраняются существующие safety floors: characterization net, differential evidence, truthful
  gate lifecycle и drift search.

### Definition of Done

- Fresh AUDIT/LINT artifact устраняет повторный широкий inventory/recon.
- Contract/call-site changes инвалидируют нужную часть refactor capsule.
- Tool version/config changes инвалидируют соответствующий lint recipe.
- Map/parser gaps видны в audit coverage report.
- Context outage имеет bounded fallback и не ослабляет safety floor.
- End-to-end fixtures покрывают `audit → refactor` и `lint-audit → lint-fix`.
- Versions/README/CHANGELOG обновлены; plugin validation проходит.

### Не входит

- Изменение risk-based verification policy.
- Semantic retrieval.

### Реализация

- Статус: `TODO`.
- Evidence: не реализовано.

## CTX-008 — Freshness hardening: dirty overlay и dependency invalidation

### Зачем

Доказать корректность в реальной командной разработке, где код меняется через pull, rebase, branch
switch, IDE, другой агент и незакоммиченные edits.

### Что сделать

- Добавить mutation-style freshness suite для:
  - unrelated file edit;
  - direct evidence edit;
  - upstream dependency edit;
  - consumer/contract edit;
  - rename;
  - deletion;
  - untracked file;
  - staged и unstaged variants;
  - branch switch;
  - rebase-like tree replacement;
  - несколько worktrees;
  - parser/config version change;
  - interrupted/corrupted index update.
- Реализовать atomic index writes и safe recovery.
- Ввести reverse-dependency invalidation там, где edge надёжен.
- Для неизвестной/dynamic зависимости выбирать conservative partial stale, а не ложный `fresh`.
- Проверить concurrency двух Claude sessions на одном repository cache.

### Definition of Done

- Во freshness suite нет случая, где stale evidence маркирован как `fresh`.
- Unrelated changes не вызывают глобальный rebuild.
- Corrupted/old-schema cache безопасно восстанавливается.
- Параллельные readers не видят частично записанный индекс.
- Параллельные writers либо сериализуются, либо безопасно переиспользуют content-addressed entries.
- Worktree overlays не смешиваются, shared immutable entries могут переиспользоваться.
- Результаты suite документированы в этом файле.

### Реализация

- Статус: `TODO`.
- Evidence: не реализовано.

## CTX-009 — `/prorab:doctor` и опциональный project knowledge contract

### Зачем

Сделать систему понятной и обслуживаемой, не превращая ручную документацию в обязательное условие
работы.

### Что сделать

- Реализовать `/prorab:doctor` как read-only диагностику:
  - context plugin/runtime availability;
  - LSP availability по найденным languages;
  - index state/schema/freshness;
  - cache location/size;
  - ignored/unsupported files;
  - artifact schema health;
  - verification recipe sources;
  - опциональный project contract health.
- Определить минимальный опциональный `.prorab/project.yaml`:
  - components и paths;
  - owners/CODEOWNERS references;
  - responsibility и external contracts;
  - supported verification commands или ссылки на их source;
  - generated и human-maintained fields должны различаться.
- Добавить component cards только как opt-in progressive knowledge.
- Добавить validator и пример; не создавать/переписывать project files без явного запроса.

### Definition of Done

- Новый repo без `.prorab/` полноценно индексируется и получает doctor report.
- Repo с contract получает более точные component/ownership hints.
- Несуществующие paths, дубли components и stale generated fields обнаруживаются.
- Doctor не запускает mutating checks и ничего не устанавливает.
- Report короткий, actionable и различает error/warning/opportunity.
- README содержит инструкции для solo и team usage.

### Реализация

- Статус: `TODO`.
- Evidence: не реализовано.

## CTX-010 — Context-specific eval и решение о следующих уровнях

### Зачем

Проверить, что context system реально уменьшает чтение и сохраняет качество, прежде чем добавлять
embeddings или remote infrastructure. Это небольшой специализированный eval, а не общий дорогой
benchmark всего framework из `IMPROVEMENT-PROPOSALS.md`.

### Что сделать

- Подготовить 10–20 reproducible fixtures или исторических задач с ground truth:
  - relevant files/symbols;
  - contracts/consumers;
  - tests/verification recipe;
  - expected stale/fresh behaviour.
- Сравнить baseline recon и context-assisted recon.
- Собирать доступные deterministic metrics:
  - retrieval recall/precision в top-N;
  - размер context output;
  - число fallback `Read`/`Grep`/`Glob`/Explore calls;
  - cold/incremental work;
  - stale-labelled-fresh count;
  - task completion/correct-file selection на fixtures.
- Зафиксировать отдельные результаты для exact symbol, domain-language, cross-component и tooling
  queries.

### Целевые gates

Это acceptance targets, а не заранее обещанный эффект:

- `0` stale evidence, ошибочно помеченных `fresh`, во freshness suite;
- не менее `90%` recall ground-truth primary files/symbols в top-10 на обязательных fixtures;
- median context output не более `1 500` приблизительных токенов;
- не менее `30%` снижения повторных recon tool calls на pipeline fixtures без ухудшения task result;
- incremental path обрабатывает только changed files и доказанно затронутые aggregates.

Если target не достигнут, исправить lexical/graph retrieval отдельной добавленной задачей до
активации CTX-011/CTX-012.

### Definition of Done

- Eval запускается одной документированной командой и выдаёт machine-readable report.
- Fixtures не зависят от network и недетерминированного LLM judge там, где достаточно exact facts.
- Результаты и решение по activation gates записаны ниже.
- CTX-011 и CTX-012 получают статус `NEXT`, `TODO` или `NOT_NEEDED` согласно доказательствам.

### Реализация

- Статус: `TODO`.
- Evidence: не реализовано.

## CTX-011 — Semantic retrieval / embeddings

### Activation gate

Выполнять только если после настройки exact lexical + symbol graph:

- domain-language fixtures не достигают 90% primary recall; или
- пользователю регулярно приходится вручную переформулировать запрос в identifiers; и
- controlled eval показывает, что semantic candidates улучшают итоговый recall/precision, а не
  просто добавляют похожий шум.

### Что сделать при активации

- Добавить embeddings только как дополнительный candidate source.
- Exact path/symbol и graph evidence всегда имеют больший приоритет.
- Chunking следует syntactic boundaries.
- Embedding cache content-addressed и versioned по model/chunker version.
- По умолчанию всё выполняется локально; remote processing требует явного privacy decision.
- Сравнить no-retrieval, lexical/graph и hybrid режимы на CTX-010 eval.

### Definition of Done

- Hybrid mode статистически/детерминированно улучшает заранее проваленные fixtures.
- На exact-symbol fixtures нет регрессии.
- Index freshness и deletion semantics доказаны tests.
- Feature можно отключить без потери базовой functionality.
- Storage, privacy и model acquisition явно документированы.

### Реализация

- Статус: `GATED`.
- Evidence: activation gate ещё не проверен.

## CTX-012 — Shared CI index, remote cache или Sourcegraph adapter

### Activation gate

Выполнять только если CTX-010 и реальные проекты показывают хотя бы одно:

- неприемлемый measured cold-start на больших repositories;
- много разработчиков повторно индексируют почти одинаковые clones;
- необходим cross-repository impact/search;
- организация уже использует Sourcegraph или совместимый code-intelligence service.

### Что сделать при активации

- Сначала ADR `build vs integrate`:
  - content-addressed CI artifacts/cache;
  - Sourcegraph SCIP/MCP adapter;
  - другой уже существующий organization index.
- Remote index всегда привязан к commit/tree hash.
- Local dirty overlay применяется поверх shared immutable base.
- Клиент никогда не получает entries для content, к которому у него нет доступа.
- Offline/local fallback сохраняется.

### Definition of Done

- Teammate clone может переиспользовать индекс того же tree без полного rebuild.
- Branch/dirty differences корректно накладываются локально.
- Access control, retention, privacy и cache poisoning рассмотрены и проверены.
- Remote outage не блокирует context query.
- Измеренная польза превышает добавленную operational complexity.

### Реализация

- Статус: `GATED`.
- Evidence: activation gate ещё не проверен.

## Общий regression checklist

Каждая задача после CTX-002 должна, где применимо, сохранять следующие свойства:

- [ ] Plugin marketplace и manifests валидны.
- [ ] Versions согласованы между `plugin.json` и marketplace.
- [ ] CHANGELOG описывает пользовательское изменение.
- [ ] Новый repo работает без ручной инициализации.
- [ ] Dirty worktree не очищается и не перезаписывается.
- [ ] Context code не изменяет project files.
- [ ] Unsupported stack имеет рабочий fallback.
- [ ] Context output bounded и не содержит file dumps.
- [ ] Evidence ведёт к текущему source.
- [ ] Несвязанные изменения не инвалидируют весь cache.
- [ ] Stale evidence не объявляется fresh.
- [ ] Secrets/ignored/binary/generated files исключены.
- [ ] Нет неявной установки зависимостей или network download.
- [ ] Unit/integration tests и plugin validation прошли.

## Definition of Done всей инициативы

Обязательная часть инициативы завершена, когда `CTX-001`–`CTX-010` имеют статус `DONE` и:

- `refine → build`, `audit → refactor` и `lint-audit → lint-fix` переиспользуют fresh context;
- чужие/ручные/branch изменения автоматически обнаруживаются по текущему worktree;
- агент получает bounded task-specific capsule и открывает raw source перед изменением;
- отсутствие index/LSP/MCP имеет рабочий bounded fallback;
- eval подтверждает freshness correctness и измеримую экономию recon;
- по CTX-011/CTX-012 принято доказательное решение `TODO/NEXT` или `NOT_NEEDED`.

## Журнал решений и прогресса

Заполнять при каждой завершённой задаче:

```text
YYYY-MM-DD — CTX-NNN — DONE
Реализация: <version/commit/PR>
Проверки: <commands and results>
Решения/отклонения: <что изменилось относительно roadmap и почему>
Следующая задача: CTX-NNN
```

Текущая запись:

```text
2026-07-13 — roadmap создан
Реализация: только planning artifact; project context functionality ещё не реализована.
Следующая задача: CTX-001.
```

## Справочные источники

- [Claude Code: LSP tool and tools reference](https://code.claude.com/docs/en/tools-reference)
- [Claude Code: plugins reference](https://code.claude.com/docs/en/plugins-reference)
- [Claude Code: plugin dependencies](https://code.claude.com/docs/en/plugin-dependencies)
- [Claude Code: memory and path-scoped rules](https://code.claude.com/docs/en/memory)
- [Git content-addressed data model](https://git-scm.com/docs/gitdatamodel.html)
- [Aider repository map](https://aider.chat/docs/repomap.html)
- [Cursor content-addressed incremental indexing](https://cursor.com/blog/secure-codebase-indexing)
- [Sourcegraph precise code navigation](https://sourcegraph.com/docs/code-navigation/precise-code-navigation)
- [Sourcegraph MCP server](https://sourcegraph.com/docs/api/mcp)
- [Repoformer: selective retrieval](https://proceedings.mlr.press/v235/wu24a.html)
- [RepoGraph: repository-level code graph](https://arxiv.org/abs/2410.14684)
