# prorab

Фреймворк агентской разработки для Claude Code. Набор команд, которые проводят
идею через весь путь — от сырой формулировки до реализации под ключ.

Репозиторий устроен как **Claude Code marketplace**: команды ставятся глобально
штатным механизмом плагинов и обновляются из git. Рабочие артефакты (проработанные
идеи, планы реализации) при этом остаются в том проекте, где команда запущена.

## Конвейер

```
сырая идея ──/prorab:refine──▶ IDEA-<slug>.md ──/prorab:build──▶ реализация + IMPL ──/prorab:announce──▶ анонс для пересылки
```

| Команда | Что делает |
|---|---|
| **`/prorab:refine`** | Итеративно доводит сырую идею до готовности к спецификации: скептические вопросы, изучение кода, выявление противоречий и пропусков. Кода не пишет. Результат — `tasks/ideas/IDEA-<slug>.md`. |
| **`/prorab:build`** | Реализует готовую идею под ключ через мультиагентный ultracode-Workflow: разведка кода → план → реализация по DAG → состязательное ревью → верификация. Без апрув-гейтов. Результат — код + `tasks/IMPL-<slug>.md`. |
| **`/prorab:announce`** | Готовит краткий точный анонс результатов работы (что сделано/ново/изменилось, методики, способ расчёта) — сжато и удобно для пересылки в мессенджер. Читает IMPL/дифф/IDEA, факт-чекает утверждения. Кода не пишет, не коммитит. |

Команды можно использовать и по отдельности, но задуманы как конвейер:
сначала прорабатываем «чертёж», потом строим, потом коротко рассказываем о результате.

## Установка

### Локально (для разработки самого фреймворка)

```
/plugin marketplace add /Users/a.altukhov/Documents/prorab
/plugin install prorab@prorab
```

### С GitHub (на других машинах)

Сначала запушить репозиторий на GitHub, затем:

```
/plugin marketplace add <owner>/prorab
/plugin install prorab@prorab
```

После установки команды доступны глобально во всех проектах как `/prorab:refine`,
`/prorab:build` и `/prorab:announce`.

## Обновление

```
/plugin marketplace update prorab
```

Это подтянет свежую версию из git. При изменении команд не забудь **бампнуть
`version`** в двух местах — `plugins/prorab/.claude-plugin/plugin.json` и в
`.claude-plugin/marketplace.json` — и записать изменение в [CHANGELOG.md](CHANGELOG.md).

## Контракт артефактов

- Команды установлены **глобально**; артефакты живут **локально** в рабочем проекте.
- `/prorab:refine` пишет проработанную идею в `tasks/ideas/IDEA-<slug>.md`.
- `/prorab:build` читает этот IDEA-файл и пишет план реализации в `tasks/IMPL-<slug>.md`
  (там же, в рабочем проекте).
- `/prorab:announce` читает IMPL/дифф/IDEA и выдаёт анонс текстом в чат (по просьбе —
  сохраняет в `tasks/ANNOUNCE-<slug>.md`); код/файлы проекта не меняет.
- Эти файлы имеет смысл коммитить в репозиторий проекта — они документируют, что и
  почему было решено.

## Как добавить новую команду

1. Положи `plugins/prorab/commands/<name>.md` (frontmatter `description` /
   `argument-hint` + тело промпта).
2. Бампни `version` в `plugin.json` и `marketplace.json`, добавь запись в `CHANGELOG.md`.
3. `/plugin marketplace update prorab` — команда станет доступна как `/prorab:<name>`.

## Структура репозитория

```
prorab/
├── .claude-plugin/
│   └── marketplace.json          # манифест marketplace
├── plugins/
│   └── prorab/
│       ├── .claude-plugin/
│       │   └── plugin.json        # манифест плагина + version
│       ├── commands/
│       │   ├── refine.md
│       │   ├── build.md
│       │   └── announce.md
│       └── README.md
├── README.md
└── CHANGELOG.md
```
