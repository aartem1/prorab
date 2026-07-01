# Changelog

Все заметные изменения фреймворка prorab. Версии — по [SemVer](https://semver.org/lang/ru/).
Версия плагина живёт в `plugins/prorab/.claude-plugin/plugin.json` и дублируется в
`.claude-plugin/marketplace.json`.

## 0.1.0

Начальная упаковка фреймворка в Claude Code marketplace.

- Репозиторий превращён в marketplace с одним плагином `prorab`.
- Команда **`/prorab:refine`** — из прежней `brainstorm` (проработка идеи до спецификации).
- Команда **`/prorab:build`** — из прежней `implement-idea` (реализация под ключ через
  мультиагентный ultracode-Workflow).
- Установка через `/plugin marketplace add` + `/plugin install`, обновление через
  `/plugin marketplace update`.
- Зафиксирован контракт артефактов: команды глобальны, `IDEA-*`/`IMPL-*` пишутся в
  `tasks/` рабочего проекта.
