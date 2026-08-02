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
# Product-track only, and loaded only when the scope has a browser surface.
WEB_PROBING = PRODUCT / "references" / "web-probing.md"
# Commands that actually drive a browser, and so load the method.
WEB_PROBERS = (
    PRODUCT / "commands" / "build.md",
    PRODUCT / "commands" / "quick.md",
    PRODUCT / "commands" / "verify.md",
)

# Commands that run the project's checks or analyzers, and so load execution.md.
RUNNERS = (
    PRODUCT / "commands" / "build.md",
    PRODUCT / "commands" / "quick.md",
    PRODUCT / "commands" / "verify.md",
    TECH / "commands" / "refactor.md",
    TECH / "commands" / "lint-fix.md",
    TECH / "commands" / "audit.md",
    TECH / "commands" / "lint-audit.md",
)
# Commands that write product code, and so also load documentation-sync.md.
EXECUTORS = (
    PRODUCT / "commands" / "build.md",
    PRODUCT / "commands" / "quick.md",
    TECH / "commands" / "refactor.md",
    TECH / "commands" / "lint-fix.md",
)
# Runs checks and writes tests, but no product code: it falsifies no document, so a document
# contradicting what it observed is a finding it reports, not one it rewrites.
TEST_WRITERS = (PRODUCT / "commands" / "verify.md",)
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
        self.assertEqual(10, len(commands))
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
        # verify runs checks and writes tests, but changes no behavior: no doc-sync duty either
        for command in TEST_WRITERS:
            text = read(command)
            self.assertIn(execution, text, command)
            self.assertNotIn(doc_sync, text, command)
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
        self.assertIn(
            "Do not select `tasks/archive/**` by default",
            read(PRODUCT / "commands" / "verify.md"),
        )
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


class VerifyLaneTests(unittest.TestCase):
    """Outside-in acceptance: the prober is blind, the oracle is the requirement, coverage can fail."""

    def setUp(self) -> None:
        self.verify = read(PRODUCT / "commands" / "verify.md")

    def test_the_probing_context_never_sees_the_implementation(self) -> None:
        self.assertIn("Blind by construction", self.verify)
        # blindness cannot be self-imposed, so probing is delegated even at the cheapest tier
        self.assertIn("delegated at **every** tier, S included", self.verify)
        self.assertIn("no file path, symbol, diff, or implementation hint", self.verify)
        # and it is checkable, not promised
        self.assertIn("Blindness declaration, mandatory", self.verify)
        self.assertIn("not independently verified", self.verify)

    def test_the_oracle_comes_from_the_requirement(self) -> None:
        self.assertIn("The oracle is the requirement, never the system's own output", self.verify)
        self.assertIn("metamorphic invariant", self.verify)
        self.assertIn("`oracle: none`", self.verify)
        self.assertIn("Never promote the implementation's behavior into the expectation", self.verify)

    def test_scope_is_derived_by_command_then_asked_about(self) -> None:
        for step in ("git status --porcelain", "git diff --name-only", "AskUserQuestion"):
            self.assertIn(step, self.verify, step)
        self.assertIn("Ask the user when the scope is genuinely undetermined", self.verify)
        # a change with no user-visible surface is reported, not given an invented scenario
        self.assertIn("If nothing user-visible remains, stop and say so", self.verify)

    def test_it_verifies_and_does_not_fix(self) -> None:
        self.assertIn("**The only code you write is test code.**", self.verify)
        self.assertIn("Findings are routed, not fixed", self.verify)
        for target in ("/prorab:quick", "/prorab:build", "/prorab-tech:refactor"):
            self.assertIn(target, self.verify, target)

    def test_verdicts_are_graded_and_weak_passes_are_downgraded(self) -> None:
        self.assertIn("`verdict` ∈ `works`", self.verify)
        for verdict in ("`broken`", "`differs`", "`unverifiable`"):
            self.assertIn(verdict, self.verify, verdict)
        self.assertIn("`grade` ∈ `observed`", self.verify)
        self.assertIn("Downgrade weak passes, don't accept them", self.verify)
        self.assertIn("Confirm a defect once before reporting it", self.verify)

    def test_coverage_must_be_provable_by_mutation(self) -> None:
        self.assertIn("would a test catch this breaking?", self.verify)
        self.assertIn("Red-first does not apply here", self.verify)
        self.assertIn("A test that cannot be proven by mutation is", self.verify)
        self.assertIn("isolated worktree", self.verify)
        self.assertIn("Never leave the suite red", self.verify)
        # a coverage test written from today's output is a snapshot, not a check
        self.assertIn("golden snapshot", self.verify)

    def test_probing_is_bounded_and_safe(self) -> None:
        self.assertIn("S = at most 2 contexts total", self.verify)
        self.assertIn("absolute cap of **16**", self.verify)
        self.assertIn("Never one prober per assertion", self.verify)
        self.assertIn("never against production", self.verify)
        self.assertIn("You do not type credentials", self.verify)
        # The promise is no longer a blanket "install nothing" — a headless runner may be
        # provisioned outside the working tree. What must survive is the part that protects the
        # user: the project is untouched, and nothing is fetched without asking first. A bare
        # `assertIn("Install nothing")` would still pass on the new wording, so it asserts the
        # qualifier and the ask instead.
        self.assertIn("Install nothing **into the project**", self.verify)
        self.assertIn("manifests and lockfiles stay untouched", self.verify)
        self.assertIn("**asked about before it is fetched**", self.verify)
        self.assertIn("produces evidence, never project coverage", self.verify)

    def test_it_reuses_recorded_proof_instead_of_re_proving(self) -> None:
        """build/quick already prove their tests can fail; verify re-hashes and skips those."""
        self.assertIn("Evidence is never paid for twice", self.verify)
        self.assertIn("Reuse the recorded proofs before proving anything", self.verify)
        self.assertIn("git hash-object", self.verify)
        self.assertIn("coverage evidence reused:", self.verify)
        self.assertIn("covered (reused)", self.verify)
        # the saving is banked, and a reused proof never upgrades the behavior's own verdict
        self.assertIn("banked, not respent", self.verify)
        self.assertIn("never upgrades a behavior's own verdict", self.verify)
        # an identical run on an identical tree is cited, not repeated
        self.assertIn("not the ones already run on this exact tree", self.verify)

    def test_the_producing_commands_record_that_proof(self) -> None:
        build = read(PRODUCT / "commands" / "build.md")
        quick = read(PRODUCT / "commands" / "quick.md")
        for command, text in (("build.md", build), ("quick.md", quick)):
            self.assertIn("coverage-evidence handoff", text, command)
            self.assertIn("git hash-object", text, command)
        # build proves a test by either route; quick's route is the red-first it already runs
        self.assertIn("`red-first` (Phase 3's right-reason red)", build)
        self.assertIn("| proof |", quick)
        self.assertIn("red-first · `<test file sha1>`", quick)

    def test_it_leaves_one_record_and_archives_nothing(self) -> None:
        self.assertIn("tasks/verify/VERIFY-<slug>.md", self.verify)
        self.assertIn("type: verify", self.verify)
        self.assertIn("first free deterministic suffix", self.verify)
        self.assertIn("Archive nothing yourself", self.verify)


class WebProbingTests(unittest.TestCase):
    """A web UI is driven headless by default: the model authors the session instead of watching it."""

    def setUp(self) -> None:
        self.contract = read(WEB_PROBING)
        self.verify = read(PRODUCT / "commands" / "verify.md")

    def test_the_contract_lives_in_the_product_track_only(self) -> None:
        """The tech track's oracle is old-vs-new behavior, so it needs a differential, not this ladder."""
        self.assertTrue(WEB_PROBING.is_file())
        self.assertFalse((TECH / "references" / "web-probing.md").exists())
        for command in sorted(TECH.glob("commands/*.md")):
            self.assertNotIn("web-probing.md", read(command), command)

    def test_only_the_commands_with_a_browser_surface_load_it(self) -> None:
        reference = "${CLAUDE_PLUGIN_ROOT}/references/web-probing.md"
        for command in WEB_PROBERS:
            text = read(command)
            self.assertIn(reference, text, command)
            # conditional, so a change with no browser surface never pays for the file
            self.assertIn("**only if**", text, command)
        # refine only *records* the surface map it saw while reading code — it drives no browser,
        # so it must not pay for the runner and ladder sections it would never use.
        refine = read(PRODUCT / "commands" / "refine.md")
        self.assertNotIn(reference, refine)
        self.assertIn("Web surfaces OBSERVED", refine)
        for command in ("announce.md", "ask.md"):
            self.assertNotIn(reference, read(PRODUCT / "commands" / command), command)

    def test_the_ladder_defaults_to_headless_and_makes_pixels_the_exception(self) -> None:
        self.assertIn("The default instrument for a web UI is a **headless run**", self.contract)
        for level in ("**L0 —", "**L1 —", "**L2 —", "**L3 —"):
            self.assertIn(level, self.contract, level)
        self.assertIn("The default for a web UI.", self.contract)
        # layout has a numeric oracle far more often than people assume
        self.assertIn("measured rather than\n  eyeballed", self.contract)
        self.assertIn("scrollWidth > clientWidth", self.contract)
        # a visual session is an escalation that has to name and log its trigger
        self.assertIn("Escalation only, on a **named** trigger", self.contract)
        self.assertIn("unlogged L3", self.contract)
        self.assertIn("level", self.verify)

    def test_headless_is_the_stronger_check_not_just_the_faster_one(self) -> None:
        """The reason it can be the default: a script proves things a screenshot cannot."""
        self.assertIn("persistence proven by an independent re-read", self.contract)
        self.assertIn("success toast is not evidence", self.contract)
        self.assertIn("the **write request's own status**", self.contract)
        self.assertIn("failure *injected*", self.contract)
        self.assertIn("console errors and unhandled rejections", self.contract)

    def test_locators_stay_user_facing_so_blindness_survives_authoring(self) -> None:
        """Writing a script is the moment a blind prober is tempted to open the source."""
        self.assertIn("## Locators are user-facing only", self.contract)
        self.assertIn("Never** a class hash, an internal id, an XPath", self.contract)
        self.assertIn("never a reason to read the code", self.contract)
        # and the declaration is what makes it checkable
        self.assertIn("the locators it used", self.verify)

    def test_a_probe_is_deterministic_and_re_runnable(self) -> None:
        self.assertIn("Wait for state, never read after an action", self.contract)
        self.assertIn("No fixed sleeps", self.contract)
        self.assertIn("Name every entity the run creates uniquely", self.contract)
        self.assertIn("Retry a failed item once inside the same run", self.contract)

    def test_provisioning_asks_first_and_never_touches_the_project(self) -> None:
        self.assertIn("ask first, always", self.contract)
        self.assertIn("Ask once per project, then record the answer", self.contract)
        self.assertIn("Nothing is installed into the project.", self.contract)
        # cached engines are not proof that no download is needed — a fresh runner pins a build
        self.assertIn("cached engines are\n   *not* proof", self.contract)
        # a runner is evidence, never a smuggled-in test level
        self.assertIn("produces evidence, never project coverage", self.contract)
        self.assertIn("never count its script as the missing\nregression test", self.contract)
        # refusal is an honest unverifiable, not a quiet escalation to the visual path
        self.assertIn("never an escalation to a visual session merely to avoid the question",
                      self.contract)

    def test_the_run_is_bounded_like_every_other_run(self) -> None:
        self.assertIn("Run output discipline", self.contract)
        self.assertIn('"${TMPDIR:-/tmp}/prorab-web-<slug>/"', self.contract)
        self.assertIn("that *is* the digest", self.contract)

    def test_the_skeleton_is_present_and_is_the_zero_download_path(self) -> None:
        """Shipped only after being executed: it launches an installed Chrome, no engine fetch."""
        self.assertIn("```js", self.contract)
        self.assertIn("channel: 'chrome'", self.contract)
        self.assertIn("result.json", self.contract)
        self.assertIn("process.exit(", self.contract)

    def test_each_stage_pays_once(self) -> None:
        """Commands run in sequence, so the method is shared and the work is split, not repeated."""
        self.assertIn("## Stage handoff — each stage pays once", self.contract)
        for stage in ("`refine`", "`build`", "`quick`", "`verify`"):
            self.assertIn(stage, self.contract, stage)
        # refine owns the code-aware half precisely because verify must not have it
        self.assertIn("Web surfaces OBSERVED", read(PRODUCT / "commands" / "refine.md"))
        self.assertIn("`Web probing` handoff", read(PRODUCT / "commands" / "build.md"))
        self.assertIn("Web probing", read(PRODUCT / "commands" / "quick.md"))
        # verify reads the recorded recipe instead of re-deriving it, and logs the reuse
        self.assertIn("web recon reused:", self.verify)
        self.assertIn("web recon reused:", self.contract)
        # freshness is hashed, and reuse never launders a verdict
        self.assertIn("git hash-object", self.contract)
        self.assertIn("never upgrades a behavior's own\nverdict", self.contract)
        # the handoff must not leak an implementation hint into the blind charter
        self.assertIn("no path, symbol or selector crosses over", self.contract)


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
        # verify writes tests but no behavior, so it reports a contradicting document instead
        for command in ("refine.md", "announce.md", "ask.md", "verify.md"):
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
        self.assertEqual(10, len(self.ALL_COMMANDS))
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


class SiteTests(unittest.TestCase):
    """The docs site is a current-state document: it may not drift from the manifests.

    Only the mechanical part is enforced here — every command listed, versions matching the
    manifests, the real marketplace name in the install snippet, no dead internal links. Prose
    accuracy stays a human duty, like every other current-state document.
    """

    SITE = ROOT / "site"
    PAGES = ("index.html", "commands.html", "how-it-works.html")

    def setUp(self) -> None:
        self.pages = {name: read(self.SITE / name) for name in self.PAGES}
        marketplace = json.loads(read(ROOT / ".claude-plugin" / "marketplace.json"))
        self.marketplace = marketplace
        self.versions = {item["name"]: item["version"] for item in marketplace["plugins"]}

    def test_the_site_is_static_and_self_contained(self) -> None:
        """No build step: Vercel serves the directory as-is, so nothing may need compiling."""
        for name in self.PAGES + ("styles.css", "site.js", "favicon.svg", "README.md"):
            self.assertTrue((self.SITE / name).is_file(), name)
        # a package manifest anywhere in site/ would mean a build step crept in
        self.assertEqual([], list(self.SITE.glob("**/package.json")))
        vercel = json.loads(read(ROOT / "vercel.json"))
        self.assertEqual("site", vercel["outputDirectory"])
        self.assertIsNone(vercel["buildCommand"])

    def test_the_deploy_config_cannot_shadow_the_plugin_manifests(self) -> None:
        """Plugin install reads .claude-plugin/ and plugins/ — the site must stay outside both."""
        for path in sorted(self.SITE.rglob("*")):
            self.assertNotIn(".claude-plugin", path.parts, path)
        for entry in self.marketplace["plugins"]:
            self.assertTrue(entry["source"].startswith("./plugins/"), entry["source"])

    def test_every_command_is_documented_on_the_site(self) -> None:
        commands = sorted(PRODUCT.glob("commands/*.md")) + sorted(TECH.glob("commands/*.md"))
        reference = self.pages["commands.html"]
        landing = self.pages["index.html"]
        for command in commands:
            namespace = "prorab" if command.parents[1].name == "prorab" else "prorab-tech"
            invocation = f"/{namespace}:{command.stem}"
            self.assertIn(invocation, reference, invocation)
            self.assertIn(f'id="{command.stem}"', reference, invocation)
            self.assertIn(invocation, landing, invocation)

    def test_advertised_versions_match_the_manifests(self) -> None:
        landing = self.pages["index.html"]
        for plugin, version in self.versions.items():
            self.assertIn(f"{plugin} <b>{version}</b>", landing, plugin)

    def test_the_install_snippet_matches_the_real_marketplace(self) -> None:
        landing = self.pages["index.html"]
        self.assertIn(f"marketplace add aartem1/{self.marketplace['name']}", landing)
        for plugin in self.versions:
            self.assertIn(f"install {plugin}@{self.marketplace['name']}", landing)

    def test_internal_links_and_assets_resolve(self) -> None:
        for name, text in self.pages.items():
            for target in set(re.findall(r'(?:href|src)="([^"#:]+)(?:#[^"]*)?"', text)):
                if not target:
                    continue
                self.assertTrue((self.SITE / target).exists(), f"{name} → {target}")
            # in-page anchors must exist too
            for anchor in set(re.findall(r'href="#([^"]+)"', text)):
                self.assertIn(f'id="{anchor}"', text, f"{name} → #{anchor}")


if __name__ == "__main__":
    unittest.main()
