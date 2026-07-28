import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PRODUCT = ROOT / "plugins" / "prorab"
TECH = ROOT / "plugins" / "prorab-tech"

# The shared contracts, split so a command loads only what it needs.
KNOWLEDGE = (
    PRODUCT / "references" / "project-knowledge.md",
    TECH / "references" / "project-knowledge.md",
)
EXECUTION = (
    PRODUCT / "references" / "execution.md",
    TECH / "references" / "execution.md",
)
DOC_SYNC = (
    PRODUCT / "references" / "documentation-sync.md",
    TECH / "references" / "documentation-sync.md",
)

# Commands that run the project's checks or analyzers, and so load execution.md.
RUNNERS = (
    PRODUCT / "commands" / "build.md",
    PRODUCT / "commands" / "quick.md",
    TECH / "commands" / "refactor.md",
    TECH / "commands" / "lint-fix.md",
    TECH / "commands" / "audit.md",
    TECH / "commands" / "lint-audit.md",
)
# Commands that write code, and so also load documentation-sync.md.
EXECUTORS = (
    PRODUCT / "commands" / "build.md",
    PRODUCT / "commands" / "quick.md",
    TECH / "commands" / "refactor.md",
    TECH / "commands" / "lint-fix.md",
)
# Commands that neither run checks nor change code: they load neither extra contract.
READ_ONLY = (
    PRODUCT / "commands" / "refine.md",
    PRODUCT / "commands" / "announce.md",
    PRODUCT / "commands" / "ask.md",
)


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
        self.assertEqual(9, len(commands))
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
            for reference in ("project-knowledge.md", "execution.md", "documentation-sync.md"):
                self.assertTrue((command.parents[1] / "references" / reference).is_file())

    def test_each_command_loads_only_the_contracts_it_needs(self) -> None:
        """The split is the saving: a read-only command must not pull in the executor contracts."""
        execution = "${CLAUDE_PLUGIN_ROOT}/references/execution.md"
        doc_sync = "${CLAUDE_PLUGIN_ROOT}/references/documentation-sync.md"
        for command in RUNNERS:
            self.assertIn(execution, read(command), command)
        for command in EXECUTORS:
            self.assertIn(doc_sync, read(command), command)
        # audit/lint-audit run analyzers but change no code
        for command in (TECH / "commands" / "audit.md", TECH / "commands" / "lint-audit.md"):
            self.assertNotIn(doc_sync, read(command), command)
        for command in READ_ONLY:
            text = read(command)
            self.assertNotIn(execution, text, command)
            self.assertNotIn(doc_sync, text, command)


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
        self.assertIn("memory tree\nis non-fatal", self.product_contract)

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


class ReconHandoffTests(unittest.TestCase):
    def setUp(self) -> None:
        self.refine = read(PRODUCT / "commands" / "refine.md")
        self.build = read(PRODUCT / "commands" / "build.md")

    def test_refine_writes_a_hashed_code_map(self) -> None:
        self.assertIn("Code map (handoff for build", self.refine)
        self.assertIn("git hash-object", self.refine)
        self.assertIn("Not studied", self.refine)
        self.assertIn("Verification commands OBSERVED", self.refine)

    def test_build_reuses_only_a_fresh_map(self) -> None:
        self.assertIn("Reuse the IDEA's `Code map`", self.build)
        self.assertIn("git hash-object", self.build)
        self.assertIn("recon reused:", self.build)
        self.assertIn("is never a blocker", self.build)

    def test_observed_commands_stay_a_hint(self) -> None:
        self.assertIn("unverified hint", self.refine)
        self.assertIn("is a hint only", self.build)

    def test_refine_names_the_fresh_context_handoff(self) -> None:
        self.assertIn("`/clear`, then `/prorab:build <slug>`", self.refine)


class TechHandoffTests(unittest.TestCase):
    def setUp(self) -> None:
        self.audit = read(TECH / "commands" / "audit.md")
        self.refactor = read(TECH / "commands" / "refactor.md")
        self.lint_audit = read(TECH / "commands" / "lint-audit.md")
        self.lint_fix = read(TECH / "commands" / "lint-fix.md")

    def test_audit_stamps_hashed_provenance(self) -> None:
        self.assertIn("Provenance and freshness", self.audit)
        self.assertIn("git hash-object", self.audit)
        self.assertIn("Call-site files", self.audit)

    def test_refactor_checks_freshness_before_choosing_a_tier(self) -> None:
        self.assertIn("Check the AUDIT's freshness", self.refactor)
        self.assertIn("only while Phase 0's freshness check came back fully fresh", self.refactor)
        order = self.refactor.index("Check the AUDIT's freshness")
        self.assertLess(order, self.refactor.index("## Phase 0.5"))

    def test_refactor_types_each_kind_of_staleness(self) -> None:
        for marker in ("stale target file", "stale test file", "stale call-site file"):
            self.assertIn(marker, self.refactor)
        self.assertIn("recon reused:", self.refactor)
        self.assertIn("never evidence of equivalence", self.refactor)

    def test_static_pair_hands_over_commands_not_counts(self) -> None:
        self.assertIn("Verified invocations and gate entrypoint", self.lint_audit)
        self.assertIn("a snapshot, not a handoff", self.lint_audit)
        self.assertIn("most recent completed", self.lint_fix)
        self.assertIn("snapshot from audit time", self.lint_fix)

    def test_both_audits_name_the_fresh_context_handoff(self) -> None:
        self.assertIn("**`/clear`, then**", self.audit)
        self.assertIn("**`/clear`, then**", self.lint_audit)

    def test_cheap_lane_is_a_tier_not_a_new_command(self) -> None:
        self.assertIn("`--tier=S` is the intended cheap lane", self.refactor)
        self.assertIn("belongs at `--tier=S`", self.lint_fix)
        self.assertFalse((TECH / "commands" / "quick.md").exists())


class QuickLaneTests(unittest.TestCase):
    def setUp(self) -> None:
        self.quick = read(PRODUCT / "commands" / "quick.md")

    def test_quick_is_hard_bounded(self) -> None:
        self.assertIn("2 model contexts total", self.quick)
        self.assertIn("No `Workflow`", self.quick)
        self.assertIn("Still no `IDEA-*`", self.quick)
        self.assertIn("nothing is archived", self.quick)

    def test_quick_leaves_exactly_one_record(self) -> None:
        self.assertIn("tasks/quick/QUICK-<slug>.md", self.quick)
        self.assertIn("## Artifact template", self.quick)
        for field in ("type: quick", "status: done | partial | escalated"):
            self.assertIn(field, self.quick)
        # written after the verifier, so it records the real outcome
        self.assertIn("after the verifier", self.quick)
        # never overwrite a colliding slug
        self.assertIn("first free deterministic suffix", self.quick)
        # an abandoned partial edit still leaves a trace
        self.assertIn("`status: escalated`", self.quick)

    def test_quick_escalates_instead_of_overreaching(self) -> None:
        self.assertIn("Eligibility gate", self.quick)
        self.assertIn("external contract", self.quick)
        self.assertIn("Escalation is mandatory", self.quick)
        self.assertIn("/prorab:refine", self.quick)
        self.assertIn("/prorab-tech:refactor", self.quick)

    def test_quick_keeps_the_evidence_floor(self) -> None:
        self.assertIn("Red first", self.quick)
        self.assertIn("AssertionError", self.quick)
        self.assertIn("One independent verifier", self.quick)
        self.assertIn("refuted if in doubt", self.quick)


class DocumentationSyncTests(unittest.TestCase):
    """A code-changing command owns the docs its change falsifies, and only those."""

    REFERENCES = DOC_SYNC
    EXECUTORS = EXECUTORS
    HISTORICAL = ("CHANGELOG.md", "release notes", "ADR", "tasks/archive/**")

    def test_both_references_define_the_contract(self) -> None:
        for reference in self.REFERENCES:
            text = read(reference)
            self.assertIn("# Documentation sync contract", text, reference)
            self.assertIn("owns the documentation that change falsifies", text, reference)
            self.assertIn(
                "Current-state documents are corrected. Historical documents are never rewritten.",
                text,
                reference,
            )
            self.assertIn("factually wrong", text, reference)
            for marker in self.HISTORICAL:
                self.assertIn(marker, text, f"{reference}: {marker}")

    def test_every_executor_applies_it(self) -> None:
        for command in self.EXECUTORS:
            text = read(command)
            self.assertIn("`Documentation sync` contract", text, command)
            self.assertIn("tasks/archive/**", text, command)
            self.assertIn("CHANGELOG.md", text, command)

    def test_read_only_commands_do_not_touch_documentation(self) -> None:
        for command in ("refine.md", "announce.md", "ask.md"):
            text = read(PRODUCT / "commands" / command)
            self.assertNotIn("`Documentation sync` contract", text, command)
        for command in ("audit.md", "lint-audit.md"):
            text = read(TECH / "commands" / command)
            self.assertNotIn("`Documentation sync` contract", text, command)

    def test_declared_doc_edits_are_not_treated_as_scope_creep(self) -> None:
        for command in (TECH / "commands" / "refactor.md", TECH / "commands" / "lint-fix.md"):
            self.assertIn("is **not** scope creep", read(command), command)


class ContextHygieneTests(unittest.TestCase):
    """Occupancy is bounded per context, orthogonally to the S/M/L context count."""

    REFERENCES = EXECUTION
    ALL_COMMANDS = tuple(sorted(PRODUCT.glob("commands/*.md")) + sorted(TECH.glob("commands/*.md")))
    RUNNERS = RUNNERS

    def test_the_three_limits_are_defined_where_their_readers_look(self) -> None:
        """Returns ride with the knowledge contract every command reads; the other two with execution."""
        for reference in KNOWLEDGE:
            text = read(reference)
            self.assertIn("## Delegated context returns", text, reference)
            self.assertIn("orthogonal to the orchestration tier", text, reference)
            # and it points at where the siblings live
            self.assertIn("execution.md", text, reference)
        for reference in EXECUTION:
            text = read(reference)
            self.assertIn("## Context hygiene", text, reference)
            for limit in ("### Run output discipline", "### Main-loop discipline"):
                self.assertIn(limit, text, f"{reference}: {limit}")
            self.assertIn("orthogonal to the orchestration tier", text, reference)
            self.assertIn("`Delegated context returns`, is in `project-knowledge.md`", text, reference)

    def test_raw_run_output_never_reaches_a_context(self) -> None:
        for reference in self.REFERENCES:
            text = read(reference)
            self.assertIn("Raw run output never enters a model context", text, reference)
            # captured outside the worktree, so the log cannot be committed
            self.assertIn('>"${TMPDIR:-/tmp}/prorab-run.log" 2>&1', text, reference)
            self.assertIn("never commit it", text, reference)
            # a digest is identified by command, exit code and counters
            self.assertIn("exit code", text, reference)
            self.assertIn("counters", text, reference)

    def test_compaction_may_not_hide_a_failure(self) -> None:
        """The whole point of the honest report survives compaction."""
        for reference in self.REFERENCES:
            text = read(reference)
            self.assertIn("Compaction must never hide a result", text, reference)
            self.assertIn("concealing *that* something failed is a false report", text, reference)
            self.assertIn("~0 collected is a finding", text, reference)

    def test_returns_are_capsules_of_claims_and_pointers(self) -> None:
        for reference in KNOWLEDGE:
            text = read(reference)
            self.assertIn("1500 tokens", text, reference)
            self.assertIn("pointers to\nevidence, never the evidence itself", text, reference)
            self.assertIn("never forwarded verbatim", text, reference)

    def test_main_loop_discipline_exempts_the_smallest_tier(self) -> None:
        """At 2 contexts the main loop IS the executor; the rule starts above it."""
        for reference in self.REFERENCES:
            text = read(reference)
            self.assertIn("the main loop *is* the executor", text, reference)
            self.assertIn("used/cap", text, reference)
            # the source-of-truth order still outranks a clean context
            self.assertIn("named, narrow range", text, reference)
        for command in (
            PRODUCT / "commands" / "build.md",
            TECH / "commands" / "refactor.md",
        ):
            self.assertIn("Context occupancy", read(command), command)
            self.assertIn("At **S the main loop is the executor**", read(command), command)
        quick = read(PRODUCT / "commands" / "quick.md")
        self.assertIn("main-loop rule of the `Context hygiene` contract does not apply", quick)

    def test_enumerable_facts_come_from_a_command(self) -> None:
        for reference in self.REFERENCES:
            text = read(reference)
            self.assertIn("## Deterministic steps", text, reference)
            for command in (
                "git hash-object",
                "git status --porcelain",
                "git diff --name-only",
                "grep -rIn",
            ):
                self.assertIn(command, text, f"{reference}: {command}")
            # a project's own command wins over the generic one
            self.assertIn("that one wins", text, reference)

    def test_every_command_names_an_occupancy_limit(self) -> None:
        self.assertEqual(9, len(self.ALL_COMMANDS))
        for command in self.ALL_COMMANDS:
            text = read(command)
            self.assertTrue(
                "`Context hygiene`" in text
                or "`Delegated context returns`" in text
                or "`Run output discipline`" in text,
                command,
            )

    def test_every_runner_reduces_its_output(self) -> None:
        for command in self.RUNNERS:
            self.assertIn("digest", read(command), command)


if __name__ == "__main__":
    unittest.main()
