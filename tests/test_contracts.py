import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PRODUCT = ROOT / "plugins" / "prorab"
TECH = ROOT / "plugins" / "prorab-tech"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


class ManifestAndCommandTests(unittest.TestCase):
    def test_manifest_versions_are_consistent(self) -> None:
        marketplace = json.loads(read(ROOT / ".claude-plugin" / "marketplace.json"))
        market_versions = {item["name"]: item["version"] for item in marketplace["plugins"]}
        self.assertEqual(
            market_versions["prorab"],
            json.loads(read(PRODUCT / ".claude-plugin" / "plugin.json"))["version"],
        )
        self.assertEqual(
            market_versions["prorab-tech"],
            json.loads(read(TECH / ".claude-plugin" / "plugin.json"))["version"],
        )
        changelog = read(ROOT / "CHANGELOG.md")
        self.assertIn(
            f"prorab {market_versions['prorab']} · prorab-tech {market_versions['prorab-tech']}",
            changelog,
        )

    def test_command_frontmatter_and_reference_links(self) -> None:
        commands = sorted(PRODUCT.glob("commands/*.md")) + sorted(TECH.glob("commands/*.md"))
        self.assertEqual(8, len(commands))
        for command in commands:
            text = read(command)
            match = re.match(r"^---\n(.*?)\n---\n", text, flags=re.DOTALL)
            self.assertIsNotNone(match, command)
            frontmatter = match.group(1)
            self.assertRegex(frontmatter, r"(?m)^description:\s+\S+", command)
            self.assertRegex(frontmatter, r"(?m)^argument-hint:\s+\S+", command)
            self.assertIn(
                "${CLAUDE_PLUGIN_ROOT}/references/project-knowledge.md", text, command
            )
            self.assertTrue((command.parents[1] / "references" / "project-knowledge.md").is_file())


class LifecycleScenarioTests(unittest.TestCase):
    def setUp(self) -> None:
        self.build = read(PRODUCT / "commands" / "build.md")
        self.announce = read(PRODUCT / "commands" / "announce.md")
        self.ask = read(PRODUCT / "commands" / "ask.md")
        self.refactor = read(TECH / "commands" / "refactor.md")
        self.lint_fix = read(TECH / "commands" / "lint-fix.md")
        self.product_contract = read(PRODUCT / "references" / "project-knowledge.md")
        self.tech_contract = read(TECH / "references" / "project-knowledge.md")

    def test_new_project_without_memory_or_archive_is_supported(self) -> None:
        self.assertIn("Missing memory", read(PRODUCT / "commands" / "refine.md"))
        self.assertIn("missing/unreadable memory tree is non-fatal", self.product_contract)

    def test_existing_and_stale_memory_are_verified(self) -> None:
        self.assertIn("exact paths, symbols", self.product_contract)
        self.assertIn("open its current source", self.product_contract)
        self.assertIn("mark it `stale`", self.product_contract)

    def test_successful_and_blocked_build_archive_rules(self) -> None:
        self.assertIn("Archive a successful bundle", self.build)
        self.assertIn("partial implementation", self.build)
        self.assertIn("must not be archived", self.build)
        self.assertIn("move the linked IDEA, IMPL, and existing ANNOUNCE", self.product_contract)

    def test_active_lookup_does_not_default_to_archive(self) -> None:
        self.assertIn("do not select `tasks/archive/**` by default", self.build)
        self.assertIn("never auto-pick from `tasks/archive/**`", self.refactor)
        self.assertIn("never auto-pick from `tasks/archive/**`", self.lint_fix)

    def test_multi_candidate_audit_keeps_backlog_active(self) -> None:
        self.assertIn("Keep the source AUDIT active", self.tech_contract)
        self.assertIn("scoped candidate snapshot", self.refactor)
        self.assertIn("unfinished backlog", self.refactor)

    def test_partial_and_complete_lint_ladder(self) -> None:
        self.assertIn("if any planned batch remains", self.lint_fix)
        self.assertIn("keep the active LINT", self.lint_fix)
        self.assertIn("If the full ladder is complete", self.lint_fix)
        self.assertIn("Never archive a partial ladder", self.lint_fix)

    def test_announce_reads_and_saves_in_archive(self) -> None:
        self.assertIn("active or archived IMPL/IDEA", self.announce)
        self.assertIn("same archived task directory", self.announce)
        self.assertIn("do not recreate active IDEA/IMPL", self.announce)

    def test_ask_current_and_historical_contract(self) -> None:
        self.assertIn("Confirmed now", self.ask)
        self.assertIn("Historical context", self.ask)
        self.assertIn("Git history", self.ask)
        self.assertIn("Do not write project code", self.ask)


if __name__ == "__main__":
    unittest.main()
