# ChatGPT Pro consultation — tooling migration approach review

**Date:** 2026-09-06
**Mode:** approach review (`chatgpt-pro-consult`)
**Model:** GPT-5.6, Pro power (5 of 5)
**Conversation:** https://chatgpt.com/c/6a9ce0fb-c8cc-83e9-b553-4a9ebfe95289
**Task/spec:** [`SPEC.md`](../../SPEC.md) · [`tasks/plan.md`](../../tasks/plan.md) · [`tasks/todo.md`](../../tasks/todo.md), as committed at `b9a2d6b`
**Verdict:** ADJUST (not pivot)

> Advisory only; verify against local project truth and authoritative docs; do not
> reduce scope without user approval.

## Locally verified before acceptance

Three findings were checked against the repository rather than taken on faith. All three confirmed:

1. **T2 → T3 ordering cannot be green.** `scripts/fixtures/sync-ledger/valid-required.sync-ledger.json` carries `rest-variables-oauth` and is asserted to yield `[]` at `figma-sync-policy.test.ts:78`, and is the base for six further assertions (lines 110, 123, 144, 157, 174). Removing the enum in T2 breaks seven assertions before T3 repairs the fixture.
2. **S2's verification method is defeated by preflight itself.** `scripts/lib/token-governance.mjs:10` registers `build:tokens`, and `pnpm govern:tokens` is preflight step 1 of 5. Perturbing `design-tokens/dist/figma/tokens.json` is erased by regeneration before any verify step observes it.
3. **`pack-check` conceals the optional-peer defect it exists to catch.** `scripts/pack-check.sh:16` runs `pnpm add "$tarball" esbuild` — it installs esbuild explicitly, so it proves the plugin builds _when a consumer separately installs esbuild_, never that a plain install can build.

## Prompt sent

```text
We are already working on this project task.

Task/spec: Move every executable Figma-design-token-rail code path out of a product repo (a Tauri v2 + Next.js desktop app) and into a single installable CLI, so the product repo contributes only JSON data — config, a governance ledger, expectations, inventories — and owns no rail logic. The product repo currently owns 357 lines of executable rail code against 30 lines of actual data. Three attached documents define the work: SPEC.md (objective, success criteria S1-S8, scope, structure, commands, code style, testing strategy, boundaries, sequencing, risks), tasks/plan.md (architecture decisions, dependency graph, four phases with checkpoints, risk table), tasks/todo.md (14 tasks, each with acceptance criteria, verification steps, dependencies, and scope sizing).

Current approach: The design-system agent-skill pack becomes one installable npm package exposing a CLI ("ds-skills"). A previously-extracted package ("figma-token-rail", extracted one day ago into its own repo) is absorbed into it as an internal module; that repo is renamed rather than a third repo being created, because it already carries CI, Prettier, tsconfig, vitest, and a pack-check gate that installs a packed tarball into a throwaway project. The governing constraint: data crosses the boundary, code never does — no CLI command imports from a consuming repo, and no consuming repo imports from the CLI. Every command reads JSON and exits non-zero on failure. Consequently the product repo will carry NO package.json entry for this tooling at all, because after the migration nothing in it imports the package; it only invokes a command. Two publish modes exist in the governance ledger today; one of them ("rest-variables-oauth", an Enterprise-only Figma Variables REST path) is being deleted entirely from all three surfaces — product repo, ledger schema, and package.

These are repository-derived facts, verified by direct inspection today rather than inferred: the product repo has 8 CI jobs that each run `pnpm install --frozen-lockfile`; the tooling package is currently a private git+ssh dependency, so all 8 jobs would fail at install (this has not surfaced because CI triggers only on pull_request or push-to-main and the working branch has had neither); zero tests assert the string "rest-variables-oauth" across the 6 relevant test files; a prior governance change already moved the promotion trigger off that mode, so no governance rule depends on it existing; the agent-skill pack is 162 tracked files with zero gate coverage (ESLint globally ignores the directory, vitest includes only two other roots, and the TypeScript `**/*` include glob skips dot-directories).

Project sources: none configured. The three attached Markdown documents are the complete evidence set; please read SPEC.md first, then tasks/plan.md, then tasks/todo.md.

Evidence, blockers, constraints, and validation:

TWO DECISIONS ARE SETTLED BY THE PROJECT OWNER AND ARE NOT UP FOR DEBATE. Do not spend the review re-litigating them; assume them and review everything downstream of them.
(1) The skill pack absorbs the rail package into one installable CLI.
(2) The "rest-variables-oauth" publish mode is removed entirely, leaving one publish mode.

THE LOAD-BEARING UNKNOWN, and where I want the most pressure: with deliberately no package.json entry, how does the CLI reach CI? Candidate mechanisms are a global npm install step, a skills-installer, or a pinned `dlx`/`npx` invocation. Each differs in caching, version pinning, reproducibility, and cold-start cost in GitHub Actions. The plan defers this to task T7 and requires it be proved in a throwaway workflow before task T13 removes the fallback. I want that judged hard: is deferring it to T7 correct, or does it need answering before any task starts? Is there a mechanism the plan has not considered? Is "no package.json entry" actually achievable and desirable in CI, or does the constraint break down at the CI boundary in a way that should change the design? Note that a `pnpm dlx` on every local pre-push run was rejected as introducing a network round-trip and silent version drift.

Additional constraints: every task must leave the system in a working state, with a repo-wide preflight gate green; that gate must retain the ability to FAIL on a design-token regression (a weakened gate means the migration made things worse, and this is success criterion S2); a generated Figma plugin manifest must stay byte-identical so an existing plugin registration keeps loading (S4); and rail output must be unchanged on real data (S3).

Validation expectations: eight success criteria S1-S8 in SPEC.md, each with a stated check; four phase checkpoints in the plan; per-task verification steps in todo.md.

Do not reduce the task or replace it with an easier alternative. Preserve the requested scope and project conventions.

Is the current approach the best way forward? Give a direct keep, adjust, or pivot recommendation; tradeoffs; what to keep/change first; inspections; validation; and pitfalls.

Beyond that general judgement, address specifically: (a) is the architecture decision sound, given the two settled decisions; (b) is the task breakdown correctly ordered, correctly sized, and are the dependencies right — in particular is T7 too large and is the T11/T12/T13 ordering safe; (c) are the risks in the plan's risk table the real risks, or are they the comfortable ones; (d) what is missing entirely.
```

The three documents were inlined after this prompt (53,741 characters total). Redaction
checked before sending: no Figma file key, no tokens, no personal identifiers.

## Response

Recommendation: ADJUST

Keep the single installable CLI, the data-only consumer boundary, the repository reuse, and the complete removal of the retired publish mode. Change the delivery contract, migration ordering, and completion tests before treating this plan as implementation-ready.

The direction is sound. The current plan, however, can finish its named tasks without actually achieving “Collider owns no rail logic,” and several intermediate tasks cannot satisfy their own green-state requirements.

The most consequential defects are:

Distribution comes after dependency on distribution. T11 starts requiring the CLI; T14 makes it available. T13 is not the first dangerous boundary.

The executable ownership inventory is incomplete. T10 does not explicitly retire or redirect the surviving ledger and publish-proof validators.

Some checkpoints prove less than their labels claim. Five summary fields do not prove unchanged rail output; file discovery does not prove effective gate coverage.

Skill materialization and plugin-builder dependencies remain architectural unknowns, not finishing details.

This is a review of the supplied documents and repository facts, not a claim that I executed the repositories or a GitHub Actions workflow.

1. The CI question: no package.json entry is viable, but installation must become an explicit contract
   The architectural distinction

“No imports” and “no dependency entry” are separate choices. A CLI can legitimately be a development dependency without being imported. Therefore, the latter does not logically follow from the former.

Nevertheless, your chosen no-entry design is achievable and reasonable here. Treat ds-skills as a separately provisioned development tool, with an independently recorded version—not an undeclared executable that happens to be on somebody’s PATH.

npm supports installing an exact package version globally, and a configurable installation prefix keeps that installation outside the product’s dependency tree. Its executable location differs between Unix and Windows, which the setup mechanism must handle. Nothing about that mechanism requires a Collider dependency entry.
npm Docs
+1

The required correction is:

No application-package dependency; explicit, reproducible toolchain dependency.

Collider should retain reviewed JSON identifying the package, exact release, and preferably expected tarball integrity. The setup mechanism consumes that data. This preserves the requested boundary rather than weakening it.

My preferred mechanism

Install the exact public package into an isolated, version-specific tool directory during environment setup; invoke the installed executable directly during checks.

In CI, use a job-local prefix. Locally, use a persistent version-specific directory outside the product dependency tree. The local pre-push path performs no package acquisition and no automatic upgrade. A missing or mismatched installation fails with an actionable setup instruction.

That separates two operations the current plan conflates:

Provisioning: may contact the registry; installs a reviewed release.

Execution: runs the selected local release; does not resolve a newer release.

The package-owned setup implementation can be shared rather than recreated across eight jobs. A composite action hosted in the renamed tooling repository is one option, provided its accessibility matches the credential requirement. Composite actions support shared setup steps and executable-path registration. Pin the action revision separately from the CLI release.
GitHub Docs

Mechanism Assessment for this project
Exact release in an isolated prefix Best default. Keeps the product dependency graph untouched without relying on one mutable machine-wide installation.
Ordinary global installation Acceptable on a disposable CI runner when exactly pinned. Less attractive locally when multiple repositories require different releases.
Pinned dlx / npx Viable in CI, but not my default for the local pre-push path. Acquisition and execution remain coupled.
Skills installer Not yet a concrete solution. It must prove executable installation, asset materialization, exact version selection, and offline execution—not merely copy skill documents.
Public packed tarball, pinned by digest Another acquisition mechanism the plan should recognize. It can install the same npm package without requiring anonymous access to its source repository.

npm supports installation from package tarballs as well as registry versions. An uploaded/local tarball proves packaging; an anonymously retrievable published artifact additionally proves distribution. Those are different tests.
npm Docs

Caching is an optimization, not the version-selection mechanism

Do not assume the existing pnpm dependency cache also provisions this external CLI. actions/setup-node caches package-manager data, not installed node_modules; its cache configuration must account for the actual tool-acquisition mechanism.
GitHub

Start with a correct cold installation. Then measure cold and warm runs. Cache keys should distinguish the tool release, installer/toolchain version, and any relevant operating-system or architecture differences. A cache miss must cause installation of the same release, not selection of a new one.

One factual refinement to the rejected local approach: silent top-level version drift is not inherent to an exactly pinned dlx invocation, and dlx does have caching. pnpm’s 10.x documentation describes a reusable cache with an expiry; npm also distinguishes prefer-offline, which may still fetch missing data, from strict offline operation. None of that is a reason to reverse your local rejection. Direct execution after explicit installation is the clearer contract. Verify behavior with your specified pnpm 10.11.1, not merely current examples.
pnpm
+2
pnpm
+2

Does this need answering before any task starts?

Not before every independent foundation task. Yes before the migration architecture is considered settled.

T1 and a corrected retirement change can proceed without knowing the final cache key. They do not depend on that optimization.

But move these decisions out of the middle of T7 and resolve them now:

Anonymous distribution channel, approval path, exact release identity, installation location, executable selection, and offline local behavior.

Then prove the actual package’s delivery before the first consumer cutover, including any deletion of .agents scripts—not merely before T13.

T7 currently mixes repository administration, CLI design, installation research, and an anonymous-distribution demonstration. It also requires that demonstration before T14 publishes the package. A throwaway workflow cannot prove access to an unavailable artifact.

Split the proof:

Early mechanism proof: isolated installation, package independence, executable discovery, and platform behavior.

Pre-cutover release proof: the exact approved package is anonymously retrievable, installs cold, and executes the required commands.

A dummy package or workflow-supplied tarball satisfies only the former.

Public package does not mean public source repository

Choose the registry explicitly. Public npm packages are downloadable by anyone, and scoped publication requires explicit public access. GitHub’s npm package registry has authentication requirements; “public package” there is not an interchangeable assumption.
npm Docs
+2
npm Docs
+2

Publishing the npm artifact does not require making the source repository public. Keep those approvals separate. A private source repository would, however, complicate using an action hosted there as the credential-free installer.

2. The architecture is sound, but the ownership cut is not completely specified
   The deletion list does not establish “every executable rail path”

SPEC §3.2 lists four deleted files. SPEC §3.3 and T2 separately identify:

scripts/lib/sync-ledger.mjs

scripts/lib/publish-proof.mjs

The plan modifies those validators but never clearly says when their rail logic leaves Collider, when their callers change, or what replaces their execution in preflight.

T10’s “move the CT-8B ledger mechanism” is insufficient acceptance language. Its likely touched files list only new package-side files. A package implementation can therefore be completed while the product continues owning the original validator.

Add an executable-path disposition inventory before implementation. For each entry point, helper, test driver, and generator carrying rail semantics, record its present callers and one final disposition: package-owned implementation, JSON input, command-only invocation, or deletion.

Pay particular attention to pnpm validate:sync-ledger, publish-proof validation, policy tests, and any governance-generation path using those validators. Retain unrelated product generation logic; extract its rail-specific policy evaluation where necessary. Do not declare the whole generator in scope merely because it calls a rail validator.

This is the missing work needed to satisfy the existing objective, not an expansion of it.

T10 describes inconsistent source and destination responsibilities

The documents currently say three different things:

SPEC §3.1: src/ledger/ owns read/write/promote.

CLI surface: only ledger validate.

T10: reimplement the mechanism from the 237-line sync script—which T2 deletes.

That needs resolution through source inspection before sizing T10. Determine which responsibilities remain after REST retirement. For surviving read/write/promotion behavior, identify an explicit command or package-owned execution path. For behavior intentionally eliminated with the retired rail, record that disposition.

Do not accidentally delete surviving governance behavior, but also do not recreate obsolete sync behavior merely because an old directory description mentions it.

The eleven fixtures are valuable. Freeze their expected post-retirement outcomes and diagnostic reasons before rewriting the mechanism. Pass/fail alone is insufficient: the contradictory-carrier fixture must not pass the test suite merely because it now fails earlier for an unrelated reason. This is exactly the right instinct already present in T3.

The optional esbuild peer is a real portability risk

The declared package has “no runtime dependencies,” yet a promised command builds the plugin using an optional peer. npm does not automatically install optional peer dependencies. Thus, successful installation of ds-skills does not establish that figma plugin build can run.
npm Docs

A throwaway project that separately installs esbuild can conceal this defect just as effectively as Collider’s existing dependencies can.

Prefer prebuilding invariant plugin code during package release and doing only configuration-dependent assembly at command execution, where the builder’s actual behavior permits this without changing output semantics. Otherwise, make the builder dependency part of the package’s self-contained installation contract. Do not resolve it from Collider.

If consumer-time dependencies remain, an exact top-level package version alone does not freeze their resolution. Bundling or an appropriate published dependency lock is needed for stronger reproducibility; npm specifically supports publishable shrinkwrap files for deployed CLI applications.
npm Docs

Also test the actual supported platforms. esbuild uses platform-specific executables, so an installed dependency tree is not automatically portable across operating systems or architectures.
esbuild

Clarify generated output versus owned implementation

The intended boundary is good, but literal “code never crosses” wording needs a generated-output qualification: the CLI is expected to write plugin code.js into Collider.

Specify that these are package-owned generated outputs, never consumer-maintained rail source. Likewise, command invocations and generic tool setup are orchestration, not permission to recreate validation or policy logic in shell.

3. The task order needs substantive correction
   T2 → T3 is not green at every boundary

T2 removes an accepted enum value. T3 subsequently changes a fixture that is supposed to remain valid.

Under the documented behavior, that valid fixture becomes invalid between those tasks. T2’s grep also scans fixtures and documents that T3 and T4 have not changed yet.

Therefore, T2 cannot satisfy its own verification as ordered.

Either change the fixtures first—while both modes remain accepted—or make T2/T3 and the relevant schema/profile changes one atomic green retirement task. Keep separate review subtasks if useful, but do not call their intermediate states independently complete.

T4’s final repository-wide S5 check belongs after the coordinated retirement, not before all its prerequisites.

Also correct the claim that T2–T6 are “pure deletion” and order-independent. T6 changes generated UI behavior; T3 changes fixtures; T4 changes schemas and profiles.

T7 is too large and has circular acceptance

T7 is not a medium scaffold task as written. Separate:

Repository/package identity: permissioned rename, metadata, links, release configuration.

CLI contract/scaffold: parsing, help, version reporting, dispatch, failure behavior.

Delivery proof: the independent work described above.

“Dispatches five commands” must not mean five successful placeholders. Either connect an implemented handler or report an explicit nonzero unavailable-command failure during development. Full functional acceptance belongs with the command implementation tasks.

The rename itself is not the primary technical danger. GitHub redirects Git operations after a rename, although hosted action references do not receive that redirect. Inspect affected references rather than treating a stale Git URL alone as an unavoidable break.
GitHub Docs

Several dependencies are wrong or absent
Task Required correction
T9 Split package preparation from consumer removal. Do not remove a working .agents script until its replacement is available and callers are switched.
T10 Depends on the profile/schema contract supplied through T9, or on an explicitly earlier extraction of that contract. Add caller migration and source retirement.
T11 Split package-side verifier implementation from Collider activation/test deletion. Its dependence on T10 is unexplained unless verification actually consumes ledger semantics.
T12 Depends on a functional, installed plugin-build command—not merely T8’s module relocation. It need not intrinsically follow T11.
T13 Depends on all relevant consumer imports/callers being retired and the replacement tool being provisioned, not just two file deletions.
T14 Move publication and tool provisioning before consumer activation. Leave final production-CI evidence and backlog closure at the end.

There is also a direct checkpoint contradiction: Phase 2 requires package coverage for $themeOverrides, but the task that moves that assertion is T11 in Phase 3. Move the package-side test work earlier.

Is T11/T12/T13 safe?

The last-import-before-dependency-removal relationship is correct. The overall sequence is not.

Once T11 changes just preflight to require ds-skills, every environment expected to run that task must already have an acquisition path. Keeping the old imported package installed does not provide the new CLI. T13 therefore does not “remove the fallback” in the way the risk table suggests.

The safe relationship is:

Implement and package → prove and publish → provision → activate new callers and gates → delete superseded code/imports → remove the old dependency.

T11 and T12 can be independent consumer changes after provisioning. Their relative order is less important than that prerequisite.

Preserve four phases, but change their checkpoints

Phase 1 — Baselines, gate coverage, and retirement. Capture the manifest and behavioral baselines; land T1; perform the coordinated mode removal; fix UI configuration. Resolve the delivery contract.

Phase 2 — Complete, self-contained package. Perform the rename and package moves, implement all promised command behavior, transfer tests, and complete isolated package checks. Prepare skill assets without prematurely breaking their consumers.

Phase 3 — Distribution and consumer cutover. Obtain publication approval, publish the tested artifact, prove anonymous acquisition, provision environments, then switch callers and delete superseded consumer code and dependencies.

Phase 4 — Clean-environment evidence and closure. Run the complete CI acceptance, verify all success criteria and absence of residual implementations, then close backlog items.

There is no need for a big-bang package rewrite. There may need to be an atomic consumer activation commit combining related invocation, deletion, and lockfile changes.

Task sizing

T9 is correctly large, but not merely mechanical: discovery paths, relative references, symlinks, and edit ownership change.

T10 is not credibly bounded at M until its responsibility inventory is reconciled. T11 combines implementation, test relocation, integration, and negative testing; split it. T13 may be an XS edit, but it has substantial integration verification. T5 and T8 remain plausible small tasks; T6 is small only after configuration and escaping behavior are specified.

Finally, record the existing CI failure honestly. The private Git dependency already prevents clean credential-free installation. Local green preflight during foundation work is not clean-CI evidence. If “every task green” means every intermediate landed commit must also pass clean CI, an accessible transitional artifact for the existing dependency is a prerequisite; the current plan cannot promise that stronger condition without one.

4. Strengthen the success checks without changing their intent
   Criterion What should change
   S1 — no consumer rail ownership Keep the grep, but add the executable-path inventory and caller audit. Searching only the old package name cannot detect copied logic or imports under the new name. Include .agents, workflow/task-runner entry points, and other relevant test roots.
   S2 — gate still fails Test direct CLI failure and the actual preflight path. Require a rail-specific diagnostic, not merely any nonzero exit. Also test missing tool, missing input, malformed JSON, and mismatched expectations.
   S3 — unchanged output Compare complete normalized before/after rail results. The five proposed fields remain useful diagnostics, but are not an equivalence proof.
   S4 — identical manifest Capture exact bytes before T6, preserve the baseline and digest, and compare independently generated output byte-for-byte. A baseline regenerated by the new builder is not independent evidence.
   S5 — retired mode absent Account for the literal string in these live planning documents themselves. Archive historical material or describe retirement without retaining the identifier in live material. Scan active tracked sources and the final packaged/generated deliverables.
   S6 — both gates green Exercise a clean, independently installed release, not a sibling checkout, link, or ambient global executable.
   S7 — effective gate coverage Prove discovery and actual failure behavior, then specify how coverage follows code into the package. A nonzero file count alone is inadequate.
   S8 — credential-free CI Exercise actual cold acquisition and preflight in all eight jobs as T14 requires. A dependency-install step alone does not prove the CLI was installed or its gate executed.
   S3’s current proof is too weak

A result can retain 176 leaves, the same first and last names, the same themes, and the same default while changing an interior token’s value or type.

Capture the full mapping: ordered names, types, namespace/collection information, per-theme values, and any other meaningful rail output. Compare that baseline after each structural move, with normalization limited to explicitly identified nondeterministic fields.

The five-field JSON preserves five existing assertions. It does not by itself establish the broader claim “rail output is unchanged.”

S2 has a generated-artifact trap

Inspect the actual order of just preflight. If it rebuilds design-tokens/dist/figma/tokens.json before verification, the proposed perturbation may be silently overwritten.

To satisfy S2 as written, preflight must detect the invalid supplied artifact before regeneration erases it, or compare against separately generated output without first replacing the evidence under test.

Use a temporary worktree or equivalent isolated fixture setup so restoration is reliable. Confirm that the mutated run fails for the intended invariant and that the restored run passes. Do not accept “command not found,” unrelated Storybook failures, or an earlier gate failure as evidence that the token gate still works.

Moving $themeOverrides can lose integration protection

Moving the generic rule into package unit tests is correct. But a package fixture assertion does not automatically preserve an assertion about Collider’s actual generated artifact.

Trace what the existing test protects. Where it constrains the consumer artifact, retain that check through the CLI’s real-data verification. Do not leave it protected only in an artificial package fixture.

Likewise, JSON expectations remain editable. Moving a constant from TypeScript to JSON improves the ownership boundary, not its resistance to being changed merely to make CI pass. Expectations changes still need deliberate review.

5. Skill materialization and gate ownership are missing implementation work

The plan acknowledges .agents/skills materialization as an open question, but no task resolves it. This affects both the primary agent users and S7.

Settle, before T9 removes anything:

Canonical editing location, materialization location, tracked/generated status, release identity, stale-copy handling, and .claude/skills symlink behavior.

Do not leave “edit only in .agents” active if that directory now contains generated package assets. Do not leave two independently editable copies of the same skill.

A release identity shared by CLI and skill materialization is important: otherwise an agent can read instructions for one command contract while executing another version.

T1 is worth doing, but its acceptance needs more than discovery. TypeScript’s --listFilesOnly prints participating files and then stops processing; JavaScript error checking separately depends on checkJs or equivalent per-file checking.
TypeScript
+1

Prove that representative applicable lint errors, type errors, and failing tests under the relevant paths actually fail their gates. Preserve separate appropriate compiler configurations where Node tooling and the Next application need different environments.

Then resolve the final-state question: if the migrated .agents subtree contains only Markdown and JSON, nonzero TypeScript/test-file counts are no longer a meaningful invariant for it. Keep coverage for any remaining executable .agents content, and explicitly establish equivalent package-side coverage for moved code. Do not retain dummy executable files simply to satisfy S7.

The package’s advertised existing infrastructure includes formatting, TypeScript, tests, and packing—but the plan does not explicitly add the corresponding lint gate or the requested LOC guard. Add those responsibilities where the code will live.

6. The risk table contains real risks, but gives too much space to comfortable ones

The distribution/authentication risks are correctly ranked high. The table is not wrong; it is incomplete and misweighted.

Highest-impact risks: a CLI required before provisioning; residual product-owned validators; loss of real-data gate protection; accidental governance behavior changes during genericization; and a plugin builder that works only with ambient dependencies.

Next tier: skills/CLI version skew; stale materialized assets; incomplete packed assets; unresolved input paths; and package publication exposing material introduced during the move.

Operational concerns: repository references, formatter noise, Storybook cache troubleshooting, and the intentional deletion of obsolete tests. Keep these, but put the Storybook incident in the execution runbook rather than allowing it to compete with ownership and gate correctness.

Specific omissions deserve acceptance checks:

Command inputs and side effects. figma drift --config … does not establish where independently observed state comes from. figma verify does not clearly establish a local artifact path despite CI needing deterministic access. Define those sources and whether each command reads or writes. Do not accidentally make offline preflight depend on a development server or live Figma access.

Path and configuration semantics. Define config-relative versus working-directory-relative paths, profile-name versus profile-path resolution, unknown-profile failure, missing-file behavior, and output locations. Test from outside the repository root. Keep profiles as constrained data, not executable callbacks or an embedded scripting escape hatch.

UI substitution correctness. T6 should test missing placeholders, unresolved placeholders, and safe handling of quotes/backslashes in configured values—not just one successful localhost substitution. Build a second distinctly configured plugin to prove the first configuration is not still embedded.

Publication and rollback. Review the final tarball after all assets move, including disclosure and redistribution suitability. The earlier clean scan does not establish that the final package is clean. Publish the exact artifact tested, record its identity, and define rollback through explicit version selection—not latest, and not automatic restoration of the retired mode.

7. Inspections and final acceptance I would require

Before implementation, inspect the complete preflight/caller graph; the surviving ledger and publish-proof implementations; all .agents executable assets and references; the plugin builder’s dependency resolution; and the eight CI jobs’ actual commands, environments, caches, and authentication configuration.

Expand pack-check rather than inventing a parallel packaging gate. Its decisive scenario should be:

A clean, data-only consumer directory, outside both source checkouts, with no product dependencies, no repository credentials, and no ambient builder installation. Install the selected package and exercise every promised command with valid and invalid inputs.

Then repeat against the real Collider data and an independently configured second consumer. The second consumer should vary namespace, paths, origin, plugin identity, and profile vocabulary—not merely copy Collider’s layout under another directory name.

Keep the direct built-Node smoke check, explicit .js imports, real-artifact verification, byte-level manifest comparison, existing project formatting conventions, and the prohibition on running the retired REST rail. Keep BL-1 and BL-2 outside this change.

Final verdict: ADJUST, not PIVOT. This remains the right direction. The first change should be to make delivery and ownership closure explicit; the first ordering correction should move publication/provisioning ahead of consumer activation. The project is ready for corrected foundation work, but the current T7–T14 plan is not yet safe to execute as written.

---

# Round 2 — follow-up review, 2026-09-06

**Conversation:** https://chatgpt.com/c/6a9d664f-f498-83ea-b62b-80aef775b588
**Reviewing:** the triad as revised at `91c019d`
**Verdict:** ADJUST — architecture kept, six execution/evidence gaps

## Locally verified before acceptance

1. **The dependency clauses did omit T11 and T12.** Read literally: T8→T7, T10→T8, T11→T8, T14→{T10,T13}. The explicit chain to T18 never scheduled T11 or T12, while the Phase 2 checkpoint and T14's acceptance both required their work.
2. **No CI job runs `just preflight`** — confirmed by grep over `.github/workflows/ci.yml`. It is the pre-push hook; CI runs `pnpm govern:tokens`, `pnpm govern:storybook-proof`, `just check`+`just loc`, `just test-all`, `pnpm build`, `pnpm storybook:build` and the Chromatic pair as separate jobs. `figma-token-rail.test.ts` runs inside `just test-all`, which **is** a CI job — so wiring the replacement into preflight alone would have removed a CI gate while every job stayed green. The review inferred this as a possible gap without the workflow; it was real.
3. **The isolated-worktree S2 fix does not work.** That worktree's own preflight runs `build:tokens` and regenerates the artifact. Round 1 moved the blast radius, not the overwrite.

## Prompt sent

```text
We are already working on this project task.

Task/spec: Same task you reviewed in your previous response — move every executable Figma-design-token-rail code path out of a product repo (Tauri v2 + Next.js desktop app) into a single installable CLI, so the product repo contributes only JSON data and owns no rail logic. You returned ADJUST with detailed corrections. I have applied them. This is a follow-up review of the revised spec/plan/todo, for approval or a further round.

This is a NEW conversation with no memory of the previous one, so the three revised documents are attached in full below. Judge them as they now stand.

Current approach: Unchanged in direction. The design-system agent-skill pack becomes one installable npm package exposing a "ds-skills" CLI; a previously-extracted "figma-token-rail" package is absorbed into it as an internal module via repository rename; data crosses the consumer boundary and code does not, with one stated exception for generated plugin output; the product repo carries no package.json entry for the tooling; and the "rest-variables-oauth" publish mode is deleted entirely.

What changed in this revision, so you can check whether each correction actually landed rather than being merely acknowledged:

1. Phase order. Publication and provisioning now precede consumer activation. Previously the plan made preflight require the CLI at task 11 and published the CLI at task 14. Now: implement and package (Phase 2) -> publish, prove anonymous cold acquisition, provision every environment (Phase 3, tasks 15-16) -> activate callers and delete superseded code in one atomic commit (task 17) -> clean-environment evidence (Phase 4).

2. Atomic retirement. The three-way split of the publish-mode removal is now one task (T3). I verified your claim locally before accepting it: the fixture in question is asserted to yield an empty error array at one test line and is the base object for six further assertions, so removing the enum first breaks seven assertions.

3. Ownership closure. A disposition inventory is now blocking work (T9), covering every entry point, helper, test driver and generator carrying rail semantics, each assigned exactly one of: package-owned, data, command-only, deleted. It explicitly names the two surviving validators you identified and requires extracting rail-specific policy from a generator rather than claiming the whole generator.

4. T7 split three ways: repository/package identity (T7), CLI contract and scaffold (T8), and delivery proof (split between T5's mechanism proof and T16's release proof). Unimplemented commands must exit non-zero with an explicit message rather than being successful placeholders.

5. Delivery contract moved to Phase 1 as a decision task (T5), on the principle that provisioning and execution are separate operations: provisioning installs an exact reviewed release into an isolated version-specific prefix and may reach the registry; execution runs that binary and never resolves a newer one; the local pre-push path acquires nothing; caching is an optimization and a cache miss installs the same release. The product repo records package name, exact release and integrity as reviewed JSON — a toolchain dependency rather than an application one.

6. Success criteria rewritten where they overstated what they proved. S2 now uses an isolated worktree and must fail for the intended invariant — I verified your trap claim: the governance step is preflight step 1 of 5 and registers the token build, so a perturbed artifact is regenerated before any verify step observes it. S3 now compares a full normalized mapping against a baseline captured before anything moves (new task T1) rather than five summary fields. S4 captures manifest bytes and digest before the builder-changing task. S7 now requires a lint error, a type error and a failing test to each actually fail their gate.

7. New work added: the plugin builder must become self-contained (T14). I verified your optional-peer finding: the packaging gate installs the builder dependency itself alongside the tarball, so it proves the plugin builds when a consumer already has that dependency and never that a plain install can. Skill materialization is settled before anything moves, with one release identity shared by the CLI and the materialized skills.

8. Recorded honestly rather than papered over: the existing private git+ssh dependency already prevents a clean credential-free CI install, so the plan does not promise per-commit clean CI before Phase 3 provisions the tool.

Project sources: none configured. The three revised documents below are the complete evidence set. Read SPEC.md, then tasks/plan.md, then tasks/todo.md.

Evidence, blockers, constraints, and validation:

TWO DECISIONS ARE SETTLED BY THE PROJECT OWNER AND ARE NOT UP FOR DEBATE: (1) the skill pack absorbs the rail package into one installable CLI; (2) the "rest-variables-oauth" publish mode is removed entirely. Assume both.

What I want from this review, in priority order:

(a) A direct approve-or-iterate verdict. Is this plan now safe to execute as written? If not, name specifically what still blocks execution rather than what could be improved.

(b) Did each of the eight corrections above actually land in the documents, or is any of them acknowledged in prose while the task structure still contradicts it? Check the task dependencies and checkpoints against the claims, not the summary.

(c) Are there NEW defects introduced by this revision? Reordering phases and splitting tasks can create fresh gaps — particularly around: whether Phase 2 can genuinely complete with the product repo untouched; whether T9's dependency on T3 is right; whether the atomic T17 is too large to be safe; and whether T5 can really be decided without information that only exists after T7 or T11.

(d) Anything still missing that would let this work report success while the product repo still owns rail logic, or while the gate has silently stopped biting.

Do not reduce the task or replace it with an easier alternative. Preserve the requested scope and project conventions.

Is the current approach the best way forward? Give a direct keep, adjust, or pivot recommendation; tradeoffs; what to keep/change first; inspections; validation; and pitfalls.
```

The three revised documents were inlined after this prompt (77,910 characters). Redaction checked before sending.

## Response

Verdict: ADJUST — keep the architecture, iterate on the execution plan

The direction is right, but I would not approve the plan for execution unchanged. The remaining problems are specific: the negative-test procedure still does not survive regeneration, the verification command lacks a consistent expected-data contract, the dependency graph does not enforce the stated prerequisites, skill preparation has no explicit consumer activation step, and the delivery/CI checkpoints still conflate different proofs.

None of these warrants a pivot, a third repository, retaining the product dependency, or preserving the retired mode. Keep the package absorption, complete retirement, data/command boundary, publication-before-activation sequence, and atomic consumer cutover.

This is a review of the three supplied documents. References below identify their sections and tasks; I am not claiming to have inspected the repositories or rerun their tests.

1. Did the eight corrections land?
   Correction Assessment What the task structure actually establishes
1. Publication and provisioning before activation Landed in direction; one checkpoint still contradicts it. T15 → T16 → T17 is the correct order. However, T16 requires successful cold and warm CI runs while the private dependency remains until T17. Provisioning the new CLI does not remove that blocker.
1. Atomic retirement Landed for the Collider change. T3 now includes the executable deletions, enum/message changes, fixture changes, schema/profile changes, and documentation changes together. The original enum/fixture split is fixed. T4 being separate in the other repository is not inherently a problem.
1. Blocking ownership inventory Partially landed. T9 has the right substantive coverage, including validators, callers, generators, and diagnostic reasons. But T8, T10, and T11 do not depend on it, despite the spec and plan saying it gates implementation.
1. Separate identity, scaffold, and delivery proof Landed. T7, T8, T5, and T16 now distinguish these responsibilities. Non-successful placeholders are explicitly required. The remaining problem is freezing T8’s command contract before T9 has established all surviving responsibilities.
1. Early delivery contract Partially landed. The provisioning/execution distinction is sound. The task structure does not clearly assign creation and enforcement of the reviewed toolchain JSON, and T5 must distinguish deciding release-identity rules from knowing the final artifact digest.
1. Stronger success criteria Mixed. T1/S4 establish a genuine pre-change manifest reference. T2 requires actual gate failures. S3 has a genuine baseline, but conflicts with the five-field expectations file. S2 still prescribes an artifact perturbation that the build can erase, even in a worktree.
1. Self-contained builder and skill materialization Builder: landed. Skills: incomplete. T14 contains the decisive no-ambient-builder scenario. T11 prepares assets and discusses materialization, but no task explicitly activates the release-matched skill assets in Collider and retires the old discovery/editing arrangement.
1. Honest treatment of existing credential failure Landed as disclosure, not fully in the checkpoints. The documents correctly acknowledge the existing private dependency. But the limitation ends at consumer dependency removal, not merely when Phase 3 provisions the CLI. T16 still asks for evidence that cannot yet be obtained through the ordinary full CI path.
1. Execution blockers
   B1. The revised S2 procedure still does not defeat the regeneration trap

Evidence: SPEC.md S2 and §7.2; tasks/todo.md T17 verification.

An isolated worktree protects the developer’s working copy. It does not change the order of operations inside preflight.

Under the procedure currently written:

The artifact is corrupted in the isolated worktree.

Preflight runs govern:tokens.

The registered build regenerates that worktree’s artifact.

Verification receives the regenerated artifact, not the corrupted one.

Requiring the intended diagnostic prevents accepting an unrelated failure, which is good. But it does not make the prescribed mutation reach the verifier. As written, the test can simply fail to produce the required evidence.

Required correction: specify how the fault survives until the real verifier reads it.

A concrete, bounded approach is to require two complementary tests:

Artifact rejection: run the installed release against a deliberately corrupted artifact in a data-only fixture location that the build does not overwrite.

End-to-end gate propagation: run unmodified preflight in the isolated worktree with a persistent mismatch, such as an altered expectation that the build does not regenerate. Confirm that the real installed verifier runs, reports that mismatch, and causes preflight to fail.

An artifact mutation injected after generation and before verification is another valid implementation, provided it does not replace or stub the verifier.

The evidence should identify the actual input read at verification time. Missing-tool, missing-input, and malformed-JSON failures remain separate negative cases; none substitutes for demonstrating a semantic token regression.

This correction has not yet landed merely by adding “isolated worktree.”

B2. figma verify has incompatible requirements for its comparison reference

Evidence: SPEC.md §3.2, §4.2, §7.1, and §7.4; tasks/todo.md T13 and T17.

The proposed expectations file contains only:

leafCount, firstLeaf, lastLeaf, defaultThemeId, and themeIds.

T13 nevertheless requires:

figma verify compares the full normalized mapping, not five fields.

Those five fields cannot supply expected interior variable names, types, collection/namespace bindings, or per-theme values. For example, changing an interior variable’s light-theme value can preserve all five summary fields.

T1 provides an independent full-mapping baseline, but the documents do not establish how that reference becomes an input to the installed verification command. There is therefore an unresolved choice between the task requirement and the specified consumer data.

Required correction: retain T13’s stronger requirement and make the consumer JSON contract capable of expressing it. The expectations file can contain, or explicitly reference, the full expected mapping captured at T1. Keep the original metadata constraints too; “full mapping” must not accidentally discard the default-theme constraint.

The expected data must not be regenerated from the current artifact during ordinary preflight. Otherwise the old self-referential test returns in a different form.

Two related details belong in the same contract closure:

Offline actual input. The described config includes an artifact URL, but the documents do not clearly bind figma verify to a local artifact. Specify that binding separately from the plugin’s serving origin. Path-resolution rules alone do not establish which artifact is read.

Real-artifact constraints. Moving $themeOverrides coverage to a package fixture does not automatically preserve the original integration assertion. T9 should identify precisely what that assertion protects, and T13 should explicitly enforce any surviving real-artifact constraint. A normalized mapping can conceal structural properties that normalization discards.

These are not requests for more consumer code. They are the data and command semantics needed to make the promised consumer boundary work.

B3. The inventory does not control contract closure, and the task dependencies disagree with the checkpoints

Evidence: SPEC.md §5.1–5.2; tasks/plan.md dependency graph and Phase 2 checkpoint; tasks/todo.md T8–T15.

There are two related problems.

The CLI contract is settled before its required responsibilities are known

T8 fixes five commands and their semantics. T9 subsequently establishes the surviving executable responsibilities. T12 then determines which ledger, publish-proof, read/write, and promotion responsibilities survive and need commands.

That is backwards for final contract closure.

The five commands might be sufficient—for example, a surviving responsibility might fit an existing validation command. But T9 must demonstrate that before T8’s contract is treated as settled. The current command table does not itself explain how publish-proof and any surviving mutation responsibilities are reached.

For each surviving caller, the inventory should identify its replacement command and any output that caller actually consumes. An exit status is sufficient for some callers; a generator that consumes structured results may need more. That distinction should be established from the caller, not improvised during T17.

The explicit dependency clauses omit required work

Reading the dependency clauses literally:

T8 depends on T7, not T9.

T10 and T11 depend on T8, not T9.

T14 depends on T10 and T13, not T11 or T12.

T15 depends only on T14.

Consequently, the explicit dependency chain to T18 does not include T11 or T12 at all.

The Phase 2 checkpoint and T14’s “every command” acceptance do require their work. Thus, this is a contradiction between the scheduling model and the acceptance model—not permission to skip those commands.

Required correction: make the join and inventory precedence explicit:

Task Required dependency correction
T8 contract closure Depend on T7 and T9. A generic parser scaffold can be prepared earlier, but the complete command contract cannot be approved earlier.
T10/T11 Be downstream of the approved inventory, transitively through the corrected T8 or explicitly.
T12/T13 Give each inventory entry a specific implementing task; T12 should not indiscriminately own every package-owned entry, including work assigned to T13.
T14 Depend on completion of the command and asset work, including T11 and T12.
T15 Depend on the complete-package checkpoint, including the exact artifact that passed its checks.

The fan-out diagram should also reflect the existing T11 → T12 and T10 → T13 dependencies rather than presenting all four implementation tasks as independent.

Is T9’s dependency on T3 right?

Yes, for a post-retirement survivor inventory. No, as the only point where behavior is first frozen.

I would retain T3 → T9 rather than moving all retirement analysis behind a larger redesign. But capture the eleven fixtures’ existing outcomes and diagnostic reasons before T3 edits their inputs or validators, identify the deliberate retirement-related changes, and have T9 freeze the approved post-retirement results.

Otherwise a T3 regression can become the new reference merely because T9 recorded it afterward. This also resolves the conflict with §5.2’s “before rewriting anything.”

Finally, preserve the T3 deletion list as inventory evidence. Deleted paths should have resolved deleted dispositions, not disappear from the accounting because the inventory was taken later.

B4. Skill preparation has no explicit consumer activation and retirement step

Evidence: SPEC.md §5.3; tasks/todo.md T11 and T17; Phase 2’s “Collider untouched” checkpoint.

T11 deliberately leaves Collider unchanged. That is appropriate for preparation. But T17 does not explicitly take over the remaining obligations:

materialize or activate skills from the approved release;

replace or remove superseded consumer copies;

update the canonical editing rule;

preserve or retarget .claude/skills discovery;

detect stale materialized assets or a skill/CLI release mismatch.

T17’s instruction to switch inventory callers is not a sufficient substitute. T9 inventories executable rail paths; stale Markdown instructions and agent discovery paths can remain broken even after every executable path has been moved.

Required correction: separate the lifecycle into explicit stages.

The materialization decision belongs with the early delivery decision. T11 prepares and tests packaged assets. T16 may stage the approved release’s assets without making them active. T17 owns the actual consumer skill cutover, alongside the executable callers.

T17 must then prove that the agent-visible skills—not merely the copies inside the tarball—belong to the selected CLI release and contain no stale references to removed scripts.

Can Phase 2 genuinely leave Collider untouched?

Yes, if “move” means package-side snapshot/copy preparation until T17. It must not mean removing consumer files during T11 or T13.

The retained consumer subtree needs an explicit temporary ownership rule: it remains the active compatibility snapshot, not a second independently maintained source. Package-side work can proceed against that frozen snapshot while consumer activation stays deferred.

There is one additional contradiction to remove: T7 accepts that Collider’s dependency may break as long as the breakage is understood and accepted. That does not satisfy the Phase 2 requirement that Collider remain green.

Inspect the existing lockfile/reference and preserve its functioning through the rename. If that cannot be done, stop and revise the transition explicitly. The acknowledged pre-existing credential failure is not authorization for a new local failure introduced by T7.

B5. The delivery contract needs an implementation owner, and T16 asks for full CI success too early

Evidence: SPEC.md §10; tasks/plan.md architecture decisions and honesty note; tasks/todo.md T5, T8, and T15–T17.

The delivery principle is good. Three details still need closing.

T5 can decide the contract early, but cannot certify nonexistent artifact bytes

T5 does not need to wait for T7. The target package name is already stated, and installation locations, discovery, offline behavior, registry requirements, and identity representation can all be decided before the rename.

However, distinguish:

deciding the identity format and version-selection rules;

assigning the version that will be built;

recording the integrity of the completed tarball.

The final digest comes after the final artifact exists. Set the package version before the decisive build/pack test, then record the resulting digest for T15/T16. Do not change package metadata after T14 and silently treat the rebuilt package as the already-tested artifact.

T5 should also settle the materialization contract’s release-selection obligations, rather than leaving T11 free to choose an incompatible activation scheme.

“Reviewed JSON exists” needs an assigned implementation step

T5 asks where Collider records package/version/integrity. T16 provisions and checks --version. T17 explicitly creates only the token expectations JSON.

Add explicit acceptance to T16 for creating the actual reviewed toolchain record and implementing the provisioning/execution behavior that uses it.

The relevant negative tests are bounded: wrong selected release, missing selected install, an unrelated global binary available on PATH, and an integrity mismatch during acquisition or cache acceptance. Execution must fail or use the intended installed release—not acquire another release or silently fall back.

A correct --version response in the successful case does not establish those behaviors.

The registry decision is also constrained by the credential-free requirement. GitHub’s npm registry currently requires authentication even for installing public packages, so it is not an interchangeable anonymous-acquisition option. Public npm packages are available for anyone to download; public npm fits the stated requirement, subject to the publication approval already required.
GitHub Docs
+1

T16 cannot require ordinary full CI to be green before T17 removes the old dependency

The private git+ssh dependency remains in package.json and the lockfile until T17. Installing ds-skills into a separate prefix does not remove it.

Therefore T16’s “cold and warm CI runs both succeed” needs to mean successful provisioning probes, not successful full product workflows.

A workable boundary is:

T16: publish-backed anonymous acquisition, integrity verification, isolated installation, executable discovery, supported-platform checks, shared setup wiring, and local readiness.

T17/T18: clean product dependency installation and complete job/gate success after removing the private dependency.

This preserves the corrected phase order. It does not require an accessible transitional version of the old package, credentials, or early consumer activation.

B6. Required CI enforcement is not yet demonstrated after deleting the product test

Evidence: SPEC.md S6–S8 and §4.1; tasks/todo.md T16–T18.

T17 wires figma verify into just preflight. T16 checks the CLI version in each environment. T18 requires each CI job to run its gate.

What remains unstated is which required CI gate runs the replacement semantic verification.

For example, if the existing required test job runs pnpm test rather than just preflight, deleting figma-token-rail.test.ts removes its old protection. All eight jobs could still acquire the CLI, report its version, run their existing commands, and pass.

I am not asserting that the actual workflow has this shape; the workflow is not supplied. I am identifying an acceptance gap that permits it.

Required correction: T16/T17 should map the eight jobs to their actual gate commands and identify the required job that executes the replacement rail verification against real Collider data. T18 should require a deliberate semantic failure to make that required check fail—not just a clean PR run.

This does not mean all eight jobs must redundantly run the entire rail suite. It means acquisition evidence and semantic enforcement evidence must be distinct, and the removed protection must have an identified required replacement.

Likewise, when executable coverage moves out of .agents, assign the final package-side S7 enforcement test explicitly. Having lint/type/test commands configured is not the same as proving that deliberate faults in the moved code fail them.

3. Is atomic T17 too large?

Not inherently. Keep the atomic consumer cutover.

The useful atomic boundary is the accepted consumer state: selected release, active skills, caller changes, legacy implementation retirement, dependency removal, and lockfile update agree with one another.

But one atomic final commit does not require one undifferentiated preparation task.

After T9, T17 needs a concrete file/caller/asset checklist and revised sizing. Its current “2 deleted, 1 new JSON” estimate is not a meaningful estimate of the complete cutover; the validators, generator integration, policy-test retirement, and skill materialization can materially expand it.

Prepare the patch and rehearse it in an isolated consumer worktree after provisioning, before accepting the commit. The rehearsal should include clean dependency installation, offline execution, actual agent skill discovery, and negative gate propagation.

The danger is not the L label. The danger is discovering missing command semantics or materialization behavior inside the cutover task. B3 and B4 move those decisions out of that moment.

Also inspect the proposed rollback target. “Explicit version selection” is a good rule, but on the first release it is not a demonstrated recovery procedure unless a compatible, retired-mode-free release actually exists. Do not imply that selecting the old REST-bearing package is an available rollback.

4. Smaller reconciliations—not additional architectural blockers

Builder strategy. T14 correctly fixes the optional-peer proof problem: npm documents that optional peers are not automatically installed.
npm Docs
Prefer prebuilding invariant plugin code if the builder inspection confirms that configuration-dependent assembly can remain separate. That aligns with the stated “no runtime dependencies” target. If T14 instead adds a runtime builder dependency, update that target explicitly and reconcile it with the reviewed installation identity.

Retirement inventory locations. SPEC.md §3.3 lists pack-side schema/profile enums, while T3 edits the Collider copies and T4 lists only the REST modules/export/smoke changes. Resolve whether those pack paths already exist or are future T11 destinations. If they exist now, T4 must explicitly cover them; if not, label their provenance correctly. The Foundation checkpoint must scan actual current package contents.

Installed-release testing. Clarify S6 without adding a parallel gate. Run source lint/type/unit checks in the pack checkout, and make the expanded pack-check exercise the independently installed, selected published artifact. A check that quietly rebuilds and tests a new local tarball is not the final published-release proof.

Baseline and residual audit details. T1’s nondeterministic-field exclusion must not weaken S4’s literal manifest-byte comparison. Include the new capture script and any subsequently introduced support code in the final ownership audit. Extract tarball contents before the retired-string scan, and classify permitted command/data references rather than treating every package-name match as a defect.

5. What to change first, and what should count as approval evidence

First close T9 → T8, the full-mapping/local-input verification contract, and the early skill/delivery decision. Those determine whether the implementation tasks have enough information to execute.

Then repair the task graph, give T17 explicit skill activation responsibilities, and narrow T16 to provisioning evidence. Finally update S2 and T18 so they test the real failure paths.

The decisive evidence should be:

Property Evidence required
No product-owned rail logic remains Every original and newly introduced rail-carrying path has a disposition, destination, caller replacement, and closure evidence. Final audit includes generator adapters and temporary capture/support scripts.
Verification has an independent reference A changed interior value or type is detected while the five summary fields remain unchanged; the expected side comes from reviewed baseline data, not the current artifact.
The real gates still fail correctly The installed verifier rejects the intended fault, unmodified preflight propagates it, and an identified required CI check becomes red.
Delivery is deterministic and offline at execution Cold acquisition verifies the approved artifact; warm and cold paths select the same release; missing/wrong installs fail without execution-time acquisition or global fallback.
Skills and CLI actually match for agents Consumer discovery resolves the activated release’s assets; stale copies and mismatches are detected; old editable sources and deleted-script instructions are gone.
Published-package portability is real The same reviewed artifact works without product dependencies or an ambient builder, against real Collider data and the differently configured second consumer.

Bottom line: keep the current approach. The architectural correction is sound, and several previous fixes genuinely landed. Approval is still blocked by the six execution/evidence gaps above—not by the settled package decision, the retirement decision, or the overall four-phase strategy.

---

# Round 3 — final review, 2026-09-06

**Conversation:** https://chatgpt.com/c/6a9d79d0-a734-83ea-b216-9717dcec61c7
**Reviewing:** the triad at `7faae57`, after the delivery mechanism changed to a GitHub Releases installer
**Verdict:** ADJUST — **but start T1 now.** Approval to begin, with named hold points.

## Hold points

| Boundary                 | Required before crossing                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Start T1                 | Nothing.                                                                                                      |
| Start T3                 | The T1 dependency, and the capture actually complete.                                                         |
| First public push (T11)  | Disclosure review of migrated material — the repo is public now, so exposure happens on push, not at release. |
| Close T5                 | Bootstrap version contract, trust chain, runtime boundary, lifecycle.                                         |
| Phase 2 checkpoint / T15 | Production installers implemented and tested against frozen candidate assets.                                 |
| Accept T17               | Corrected S2 procedure, the required job's artifact path, no ambient fallback.                                |

## Locally verified before acceptance

1. **T3 said `Dependencies: None`** while T1 captures the fixtures T3 edits — a prose/structure contradiction I introduced in round 2's own fix. Confirmed by reading the clause.
2. **The S2 criterion row still prescribed the obsolete method.** §7.2 said "an isolated worktree is not the fix"; the operative table row still said to perturb in an isolated worktree. My round-2 patch silently failed to match after prettier reformatted the table.
3. **The bootstrap does not learn its version from its URL.** Verified in the reference implementation: `VERSION_PIN` is parsed from `--version=` (`install.sh:147-167`), and with no argument it resolves `releases/latest`, falling back to `main`. Under `curl … | bash` there is no argv and no `BASH_SOURCE`, so the documented one-liner installs **latest**, not the tag in its own URL. Those coincide only while that tag is latest. This invalidated a claim I had written into the spec.

## Prompt sent

```text
We are already working on this project task.

Task/spec: Same task as your two previous reviews — move every executable Figma-design-token-rail code path out of a product repo (Tauri v2 + Next.js desktop app) into a single installable CLI, so the product repo contributes only JSON data and owns no rail logic. You returned ADJUST twice. This is the third and intended final round, for approval or a further iteration.

This is a NEW conversation with no memory of the previous ones. The three revised documents are attached in full below; judge them as they now stand.

THE BIGGEST CHANGE SINCE YOUR LAST REVIEW: the delivery mechanism is completely different, which invalidates the distribution section you previously reasoned about. It is no longer an npm package. It is now a GitHub Releases installer script, following a pattern the organization already runs in production for another tool:

  Linux/macOS:  curl -fsSL https://raw.githubusercontent.com/<org>/<repo>/<tag>/scripts/install.sh | bash
  Windows:      iwr https://raw.githubusercontent.com/<org>/<repo>/<tag>/scripts/windows/install.ps1 -UseBasicParsing | iex

The reference implementation is a thin bootstrap that resolves its version pin from the tag in its own URL, fetches the real installer at that same ref, then downloads release assets from the releases/download/<tag>/ path and verifies them against a published SHA256SUMS asset. There is a matched PowerShell twin for Windows.

Why this replaced npm, and what it costs:
- It already exists and is operated by the same people, so it is a reference implementation to copy rather than a mechanism to invent.
- Provisioning and execution are separated by construction: the installer runs at environment setup, the installed artifact runs at check time and resolves nothing.
- The version pin lives in the URL and cannot silently float.
- It dissolves a problem the previous plan needed a whole task for. The CLI builds a plugin using a bundler that was an optional peer dependency; npm does not auto-install optional peers, so a successful install did not establish that the build command could run. A release asset can ship the CLI with that bundler already bundled, and the bundler's platform-specific binaries become per-platform checksummed assets rather than a dependency tree npm may leave incomplete.
- The cost, which is real and is recorded as a high risk rather than buried: the repository must be public, because both the raw-content host and the releases download path return 404 for a private repository without a token. That is MORE source exposure than the npm route, which would have kept the source private and published only the package.

Two deliberate divergences from the reference implementation, both recorded so nobody later "fixes" them back into alignment: (a) the reference warns and skips when SHA256SUMS is missing — ours must fail, because this tool gates CI; (b) the reference falls back to the default branch when it cannot resolve a release tag — ours must hard-fail, so a resolution failure or cache miss installs the pinned release or nothing.

Repository-derived facts verified today by direct inspection rather than inferred:
- The repository has been made public. Tag-pinned anonymous fetches from the raw-content host return 200 at two different existing tags, with no credentials. That is the exact URL shape the installer uses, so the delivery path is proven rather than assumed.
- No CI job in the product repo runs the aggregate pre-push command. That command is the pre-push hook; CI runs its constituent parts as eight separate jobs. The test being deleted by this migration runs inside one of those jobs. The previous plan said "wire the new verification into the pre-push command", which would have removed a CI gate while all eight jobs stayed green. This is now handled by a section that maps the eight jobs, a task that names the required job, and a final task that proves a deliberate regression turns that job red.
- The governance step is preflight step 1 of 5 and registers the token build, so a perturbed artifact is regenerated before any verification step observes it. An isolated worktree does NOT avoid this, because that worktree's own preflight regenerates the artifact too. The negative test is now two complementary tests: artifact rejection in a data-only fixture location the build does not overwrite, and gate propagation through a persistent expectation mismatch, since the build regenerates artifacts and not expectations.

Corrections applied since your second review, so you can check whether each landed in the task structure rather than only in prose:
1. The dependency clauses previously omitted two implementation tasks entirely — the explicit chain to the final task never scheduled them, while the checkpoints required their work. Task 8 now depends on task 7 AND the inventory task; task 14 depends on all four implementation tasks; task 15 depends on the phase checkpoint.
2. The consumer expectations file previously held five summary fields while a task demanded comparison of a full normalized mapping — unsatisfiable. The file now carries or references the baseline captured before anything moves, and keeps the summary constraints too.
3. Task 7 previously accepted that the product repo's dependency "may break as long as it is understood", contradicting the phase checkpoint requiring that repo green. It must now preserve the reference through the rename or stop and revise.
4. Task 16 previously required full CI green while the old private dependency is still in the lockfile until task 17. It is now narrowed to provisioning probes; clean product install belongs to tasks 17 and 18.
5. Task 17 gained explicit skill-asset cutover. The inventory covers executable paths, so stale Markdown instructions and agent discovery paths could otherwise survive an otherwise complete migration.
6. The inventory task now reconciles against a pre-retirement capture of eleven governance fixtures' outcomes and diagnostic reasons, so a regression introduced by the retirement task cannot become the new reference merely because the inventory was taken afterwards.

Project sources: none configured. The three documents below are the complete evidence set. Read SPEC.md, then tasks/plan.md, then tasks/todo.md.

Evidence, blockers, constraints, and validation:

THREE DECISIONS ARE SETTLED BY THE PROJECT OWNER AND ARE NOT UP FOR DEBATE: (1) the skill pack absorbs the rail package into one installable CLI; (2) the "rest-variables-oauth" publish mode is removed entirely; (3) delivery is the GitHub Releases installer script described above, and the repository is now public. Assume all three.

What I want from this review, in priority order:

(a) A direct approve-or-iterate verdict. Is this plan now safe to begin executing? If not, name specifically what still blocks the FIRST task, versus what can be corrected during execution. I intend to start implementation immediately after this review, so distinguish "must fix before starting" from "must fix before phase 3".

(b) The delivery mechanism is new and neither previous review saw it. Scrutinize it hard: does the installer approach actually satisfy the separation of provisioning from execution; does pinning by tag in a URL give adequate reproducibility given that a tag is mutable; is checksum verification against a SHA256SUMS asset published by the same release sufficient integrity or merely self-consistent; what does a curl-pipe-to-shell install imply for CI trust and for a developer machine; and what does the plan still not say about uninstall, upgrade, and multiple concurrent versions.

(c) Did the six corrections above land in the task structure, or is any acknowledged in prose while dependencies and checkpoints still contradict it?

(d) Anything still missing that would let this work report success while the product repo still owns rail logic, or while the gate has silently stopped biting.

Do not reduce the task or replace it with an easier alternative. Preserve the requested scope and project conventions.

Is the current approach the best way forward? Give a direct keep, adjust, or pivot recommendation; tradeoffs; what to keep/change first; inspections; validation; and pitfalls.
```

Three documents inlined (95,284 characters). Redaction checked.

## Response

Verdict: ADJUST—but start T1 now

Keep the architecture and the GitHub Releases installer. Do not pivot. The remaining problems do not justify reopening absorption of the rail, retirement of rest-variables-oauth, or the delivery decision.

Nothing in the supplied evidence blocks T1. Begin the baseline capture now. I would not, however, approve executing the entire task list unchanged through publication and cutover. Several operative acceptance clauses still contradict the corrected prose, and the installer’s implementation, identity, and trust guarantees need explicit acceptance criteria.

The distinction is important: this is approval to begin, with specific later hold points—not a requirement to complete another full review round before doing any work.

I take the public-repository status, anonymous tag-fetch results, and CI observations as established facts supplied by you. This review does not independently certify an installer whose source is outside the evidence packet.

What blocks which step
Execution boundary Required correction or evidence
Starting T1 Nothing. Capture against the existing producers, fixture inputs, and validators before they change.
Starting T3 Add the explicit T1 → T3 dependency. T3 still says Dependencies: None.
First public push of migrated material—especially T11 Review that material for source disclosure before pushing it, rather than relying on T15’s release-tarball review.
Closing T5 / approving the Phase 2 contract Specify how the bootstrap receives the selected version, what authenticates downloaded executable code, runtime prerequisites, and installation/version lifecycle behavior.
Passing the Phase 2 checkpoint / starting T15 Have the production Bash and PowerShell installers implemented and tested against the exact release-candidate assets. Do not leave installer implementation until publication.
Accepting T17 Replace the obsolete S2 procedure, establish the required CI job’s actual artifact-production path, and demonstrate the provisioned CLI/skill selection works without ambient fallbacks.

1. Did the six corrections actually land?

Mostly yes. They are not merely acknowledged in prose.

Correction Assessment

1. Implementation dependencies Landed. T8 explicitly requires T7 and T9; T14 requires T10–T13; T15 requires the complete Phase 2 checkpoint. The previously omitted implementation work is on the dependency chain.
2. Full mapping expectations Landed. SPEC §3.2 can represent the full mapping and retains the summary constraints; T13 requires full-mapping verification.
3. Rename must preserve Collider’s dependency Landed. T7 now requires preservation or an explicit stop and transition revision. It no longer treats an introduced break as acceptable.
4. T16 cannot require clean product CI before T17 Landed. T16 explicitly limits its verification to provisioning probes. Clean product installation belongs to T17/T18.
5. Skill-asset cutover Landed. T11 freezes the compatibility snapshot, T16 stages the selected assets, and T17 activates them, updates discovery/editing rules, and checks skew.
6. Pre-retirement governance reference Substantively landed, but ordering remains inconsistent. T1 captures the eleven fixtures’ current outcomes and reasons; T9 reconciles the post-retirement results. However, T3’s explicit dependency is still None, despite the plan saying T1 must precede it.

For correction 6, change the dependency rather than relying on an executor to reconcile contradictory instructions. T3 should also use the captured results when accepting retirement; T9 can then preserve and complete that reconciliation rather than being the first place a retirement regression is discovered.

The S2 correction is still not fully implemented in the task text

This is separate from the six-item table and remains an actual acceptance defect.

SPEC §7.2 is correct. SPEC S2 and TODO T17 are not. T17 still says to perturb the artifact in an isolated worktree and then run preflight—the exact procedure §7.2 explains will be defeated by regeneration. The Phase 3 checkpoint and risk-table shorthand also retain the old formulation.

Make the operative acceptance criteria require the two distinct proofs already described in §7.2:

Artifact rejection: the installed release rejects a semantic mutation in an artifact stored where generation cannot overwrite it.

Gate propagation: unmodified preflight, and the named required CI job, reject a persistent expectation mismatch while running the actual installed verifier.

For each, identify the actual artifact and expectations read at verification time and the rail-specific diagnostic. An unrelated failure must not satisfy the criterion.

The historical “first draft” table can remain historical, but the current success criterion, task verification, and checkpoint must all point to the corrected procedure.

2. The installer approach is viable—but several guarantees need strengthening
   Separation of provisioning and execution: yes, provided it is enforced

The proposed ordering is sound: provision before activation; execute the installed release afterward; fail when the selected installation is unavailable; never acquire inside pre-push.

But this separation is not guaranteed by the fact that delivery uses an installer script. It is guaranteed by the installed command and its launcher having no acquisition, automatic repair, update, or dependency-resolution fallback during gate execution.

T16’s missing-install and unrelated-global-binary tests are therefore valuable. Strengthen them so that the unrelated binary is not executed even to ask for its version. A version string from an arbitrary executable on PATH is not a basis for trusting that executable.

Use an explicitly selected installation path or a package-owned offline launcher. Keep generic invocation plumbing in Collider; do not implement release-selection policy independently in eight workflows or recreate rail semantics inside the setup action.

Live observed-state acquisition by figma drift can remain a separately declared, non-gate behavior. It must not enter the offline verification path.

The bootstrap does not automatically know its download URL

The statement that the bootstrap “resolves the version pin from the tag in its own URL” needs a concrete mechanism, not an assumption about piping.

In ordinary curl … | bash, Bash receives the response body on standard input. It is not automatically given curl’s URL as a script argument or source filename. Likewise, Invoke-Expression executes the supplied string; the expression being evaluated is not inherently a version-aware installer invocation.
GNU
+2
Guix Manual
+2

I also checked the ordinary Bash behavior locally: a harmless script fetched through a local curl-to-Bash pipeline saw argv0=bash, no BASH_SOURCE filename, and zero arguments. That was a shell-mechanics test, not a test of your reference installer.

I am not asserting that the reference implementation is broken. I am saying the evidence packet does not establish how this critical handoff works.

T5 should require either an explicit selected-version argument/environment contract, or a release-specific bootstrap that contains its release identity before the candidate is tested. Another mechanism is acceptable if demonstrated, but it must not depend on shell history, the consuming repository’s Git state, or a floating lookup.

The early proof should exercise two distinct selected versions from outside any repository in noninteractive shells. It must establish what version reaches the real installer and asset URL—not merely that the first raw-content request returns 200.

Tag pinning alone is not immutable content selection

A concrete tag avoids a latest or version-range selection, but the plan overstates this as “cannot silently float” unless tag and asset mutation are prevented or detected.

There is a direct improvement available within your chosen delivery mechanism: GitHub immutable releases. GitHub documents that these lock the associated tag to its commit and prevent release-asset modification. This protection must be enabled for the release; it should not be inferred from the presence of a version-looking tag.
GitHub Docs

My recommendation is:

Use immutable releases, and retain Collider’s independently reviewed integrity record.

The record should bind the selected repository/release, source commit, platform asset identity, and expected asset integrity—or a reviewed digest of a manifest that binds those assets. A single unexplained “expected digest” is insufficient once there are multiple platform archives and multiple executable installer stages.

Use the T14-tested bytes as the source of those expectations. Do not populate the record by blindly trusting whatever SHA256SUMS happens to accompany a later download.

That establishes repeatable selection of the tested artifact. It does not, by itself, establish that rebuilding from source on another machine produces identical bytes; that is a separate reproducible-build claim.

Same-release SHA256SUMS is useful, but not an independent trust anchor

A checksum list accompanying the archive can detect corruption or inconsistency between the two. It cannot distinguish the approved archive from a replacement when an attacker can replace both the archive and its checksum list. Reviewed, separately retained verification metadata is what makes that substitution detectable. This distinction is also why dependency-verification systems separate downloaded artifacts from trusted verification metadata.
Gradle Docs

Your reviewed JSON is already the right place for that independent expectation. The missing detail is exactly how every accepted download is bound to it.

Add a negative test in which a controlled test server or fixture supplies a modified asset and a correspondingly modified SHA256SUMS. Installation must still reject it against the reviewed expectation. Testing only “corrupt the archive without changing its checksum” proves less.

Attestations can add evidence about the build’s origin and instructions, but they are not a substitute for the reviewed digest or behavioral tests. GitHub explicitly distinguishes provenance attestations from a guarantee that the artifact is secure. I would not make a new signing infrastructure a prerequisite to T1.
GitHub Docs

The bootstrap is executable code before the asset checksum is checked

Checking the final archive does not authenticate an installer that has already executed.

The trust chain includes the initial bootstrap, the second-stage installer, the selected archive, and any additional executable component they fetch. A compromised bootstrap can ignore the reviewed digest or perform unrelated actions before reporting a successful checksum comparison.

For CI, use the same installer through a download → reviewed-integrity verification → execution sequence, rather than treating unverified streaming execution as equivalent. A reviewed, commit-pinned setup action can also supply the trusted bootstrap logic; GitHub recommends full-length commit pins for actions rather than mutable tags. This is hardening the chosen Releases installer, not changing distribution mechanisms.
GitHub Docs

The convenience one-liner can remain available for developers, but its trust claim must be honest: it executes publisher-supplied code with the invoking user’s privileges. -UseBasicParsing does not neutralize the explicit | iex that follows; Microsoft recommends avoiding Invoke-Expression where safer invocation is available.
Microsoft Learn
+1

For developer installations, my default would be user-owned prefixes, no automatic elevation, and no unrequested persistent shell-profile or machine-policy changes. For CI, use minimal permissions and avoid exposing unrelated deployment credentials during provisioning. An isolated installation prefix is not a sandbox for the installer. GitHub’s workflow-security guidance likewise emphasizes limiting token permissions and treating executed workflow dependencies as trusted code.
GitHub Docs

The displayed Unix pipeline also has a failure-propagation trap

Without pipefail in the calling shell, a failed curl followed by Bash receiving empty input can leave the pipeline successful: the default pipeline status is the last command’s status. I confirmed the equivalent empty-producer case locally. Putting set -e inside the downloaded script cannot repair a case where no script arrives.
GNU

Test initial-download failure, not just missing SHA256SUMS after the installer has started. A verified download-to-file flow also avoids executing an incomplete transfer. For PowerShell, test terminating download failures and propagation of child-process failures explicitly rather than assuming Bash-like behavior.

3. The delivery change has not yet been fully translated into implementation work

This is the largest structural gap introduced by the new mechanism.

T5 is described as a decision task. T14 primarily owns the builder and pack-check. T15 requires installer scripts to exist at the release tag, but it does not establish a pre-publication implementation-and-test task for the production installers.

Installer existence at T15 is too late to be the first explicit acceptance point for installer implementation.

Expand T14, or add an explicit prerequisite within Phase 2, to own the production Bash/PowerShell installers, archive layout, platform selection, integrity enforcement, lifecycle behavior, and installer tests. Re-size that work. It is no longer merely an optional-peer packaging adjustment.

Resolve the candidate/release sequencing explicitly

T14 says it “installs the release,” while T15 creates that release. This is readily resolvable, but the meaning needs to be explicit:

T14 installs the frozen release candidate through the production installer using a controlled candidate-asset source. T15 publishes those exact tested assets without rebuilding. T16 proves the actual anonymous GitHub delivery path.

That preserves your good distinction between mechanism proof and publication proof. It also preserves the existing pack-check gate rather than creating a parallel, weaker acceptance path.

Freeze the installer scripts and release identity before that decisive test too. T15 must not modify scripts or package metadata and then call the resulting rebuild “the artifact that passed T14.”

With immutable releases, assemble the complete asset set before publication; GitHub specifically recommends draft preparation because assets cannot be added or replaced after an immutable release is published.
GitHub Docs

Remove npm-specific assumptions from release acceptance

Using package.json, pnpm, or an npm-style internal package name for development is not a problem. Nor is “tarball” an npm-specific concept.

The problem is making node_modules/.bin the decisive installed-product test in T8, or assuming the files field alone proves what the release archive contains in T11. Those can remain development checks, but release acceptance must exercise the actual archive layout and installed prefix.

Also clarify S6: source lint/type/unit gates run in the pack’s development checkout; pack-check exercises the independently installed release. An installed runtime distribution should not need to contain the development dependency tree merely so someone can run pnpm check inside it.

Declare the runtime boundary

The plan says both “Node ESM” and “installed binary,” but does not decide whether Node is included.

A self-contained builder does not necessarily mean a self-contained runtime. Decide whether the release includes a runtime or requires a separately provisioned, supported Node version. Either is compatible with the architecture, provided the prerequisite is explicit and never resolved from Collider during execution.

Similarly, esbuild’s native executable must actually be included and selected correctly when using the bundled-builder option. Its official documentation confirms that its native installation is platform-specific; copying one platform’s installation is not a cross-platform distribution strategy.
esbuild

T5 should define the supported OS/architecture/runtime combinations. T14 should test those combinations and reject unsupported ones clearly. You do not need to support every possible architecture, but “Linux/macOS/Windows” alone is not a complete asset-selection contract.

4. Installation, upgrade, uninstall, and concurrent versions need a small explicit contract

The version-specific local prefix is a good foundation. Complete it before shipping the installer.

Operation Required behavior
Install / reinstall Stage and verify a complete installation before making it selectable. Reinstalling the same approved identity is idempotent. An interrupted or failed install must not leave a directory that is subsequently accepted as complete.
Upgrade Provision the newly reviewed release first. Activate CLI and skill assets as one coherent selection, or fail closed on skew. Do not silently rewrite the project’s selected version or overwrite another version in place.
Concurrent versions Two repositories or worktrees can select different releases simultaneously. A global “current” pointer must not override project selection. The presence of another installed version must not satisfy a missing selected version.
Uninstall Remove only the selected installation and installer-owned links/integration. Preserve consumer config, expectations, ledgers, and unrelated files. State what happens to a project that still selects the removed release: an actionable failure, not fallback.

Add tests for interrupted installation, concurrent installation attempts, corrupted cache contents, and stale skill materialization. Cache acceptance should validate the actual selected content, not merely a plausible cache key or --version response.

CLI/skills equality should be tied to release contents, not just matching editable version labels. This matters especially if .agents remains a tracked materialization.

T15’s first-release rollback caveat is correct and should stay. There is no demonstrated earlier compatible release yet. Failed provisioning must leave activation unchanged; a defective first activated release needs an explicit recovery or corrected release, not an automatic return to the retired mode.

5. The public repository moves the disclosure checkpoint earlier

The documents still place disclosure review primarily at T15’s final tarball. That is too late for material copied into a repository that is already public. Public repository contents are accessible independently of whether a release archive includes them.
GitHub Docs

Review migrated files—and any history actually being imported—before their first public push, especially at T11. Keep T15’s archive review as a second checkpoint covering the final distribution.

This does not reopen the public-repository decision. It changes when the consequences of that decision must be checked.

Update T5 and the plan’s open questions to record public visibility as settled. Remove the stale request to approve making it public and the npm-specific publication explanation in SPEC §8. Keep the separate, still-applicable approvals for the repository rename and release publication.

6. Remaining ways ownership or gate enforcement could be falsely declared complete
   T9 must determine the final callable surface—not just fill in five preselected commands

T9’s requirement to record each caller’s consumed output is excellent. Preserve it.

There is nevertheless a mismatch to close at T8: SPEC §4.2 enumerates five commands, while T12 explicitly includes publish-proof and potentially surviving read/write/promotion responsibilities that those signatures do not obviously express.

Do not resolve that by making the consumer reconstruct missing semantics. Before approving T8, every surviving caller needs a complete command/input/output contract. This can extend the CLI surface or establish that an existing command covers the responsibility, but it must be explicit.

For generator adapters, distinguish ordinary process invocation and JSON transport from rail policy. A generator that parses CLI output and then independently decides eligibility, promotion, or exception meaning still owns rail logic.

The required CI job must verify the current change’s artifact

Naming a required job fixes the previous omission, but naming it does not establish how that job obtains the artifact.

If the replacement runs in the just test-all job, do not assume another job’s govern:tokens step has prepared its filesystem. T16/T17 must establish the selected job’s artifact producer, ordering, path, and association with the commit being checked.

A straightforward choice is verification after token generation in the appropriate existing required job. Another arrangement is acceptable if it proves that it consumes the current change’s artifact rather than a stale committed or cached result.

Also inspect actual required-check configuration, conditional execution, and error propagation. GitHub documents that a conditionally skipped job can report success, so a job called “required” in the plan is not enough evidence that the verifier ran.
GitHub Docs

T18 should retain a green/red/green proof with the installed verifier’s diagnostic. A persistent source-token mutation that changes an interior mapping value while leaving the five summary constraints unchanged is particularly useful for demonstrating the real generation-to-verification path.

Keep the eight cold-acquisition proofs. That does not require eight redundant executions of the rail suite.

Full mapping and summary constraints must both be mandatory

The expectations correction is sound. Its implementation must not quietly treat the summary as optional decoration or auto-fill missing expectations from actual output.

In particular, prove rejection of a default-theme mismatch independently of mapping equality. Preserve T13’s separate treatment of structural $themeOverrides constraints where normalization would hide them.

The expected baseline remains reviewed consumer data, never preflight-generated output. Any future baseline-update procedure should remain explicit and package-owned rather than preserving T1’s capture script as permanent consumer rail code.

“Generated” needs a mechanical boundary

The generated-plugin exception is legitimate, but a filename or comment saying “generated” does not enforce package ownership.

For retained generated plugin output, require that the complete generated set is reproducible from the selected release plus approved configuration, or is regenerated cleanly before use. Compare code.js and ui.html with that release’s expected generation, not just the manifest.

This does not extend S4’s historical byte-equivalence requirement to the intentionally changed UI. It prevents hand-maintained plugin logic from hiding behind the generated-output exception.

Likewise, T17 should materialize passive skill content without leaving executable rail helpers under .agents or exposing them through a discovery symlink as a new consumer entry point. The final audit should follow the actual agent discovery paths, not just inspect the archive.

Final recommendation

Keep the approach. Make a bounded execution-plan adjustment, not another architectural redesign.

The repaired inventory, full baseline, governance-fixture reconciliation, provisioning-before-activation sequence, and explicit skill cutover are substantial improvements. The installer route fits the organization’s established operating pattern, but it transfers responsibility from package-manager behavior into your own installer, asset selection, and lifecycle implementation.

The remaining mandatory changes are concrete: repair the T3 dependency; replace the operative S2 procedure; close the bootstrap identity and trust contract in T5; review migrated source before public pushes; and make the production installers and exact candidate installation part of Phase 2 acceptance.

Start T1 now. Do not start T3 before that capture is complete, do not pass the Phase 2 checkpoint with an untested production installer, and do not accept T17 without the corrected local and required-CI failure proofs.

---

# Round 4 — first review with implementation evidence, 2026-09-06

Advisory only; verify against local project truth and authoritative docs; do not reduce scope
without user approval.

**Task/spec:** the `ds-skills` migration, unchanged in direction.
**Current approach:** 8 of 18 tasks landed (T1–T7, T9). Rounds 1–3 reviewed a plan; this is the
first round with real implementation evidence, and it asks what the remaining tasks must change.

## Prompt sent

```text
We are already working on this project task.

Task/spec: Same migration you reviewed three times as a PLAN — move every executable Figma-design-token-rail code path out of a product repo (Tauri v2 + Next.js desktop app) into a single installable CLI, so the product repo contributes only JSON data and owns no rail logic. You returned ADJUST three times; round 3 said "start T1 now" with per-boundary hold points.

THIS IS THE FIRST REVIEW WITH IMPLEMENTATION EVIDENCE. 8 of 18 tasks have landed. This is a NEW conversation with no memory of the previous three. Judge what was built, and tell me what the REMAINING tasks must change as a consequence.

Current approach: unchanged in direction. The agent-skill pack absorbs a previously-extracted token-rail package into one installable CLI; data crosses the consumer boundary and code does not; the "rest-variables-oauth" publish mode is deleted entirely; delivery is a GitHub Releases installer rather than npm.

================================================================
WHAT LANDED, AND WHAT MEASURING IT CHANGED
================================================================

T1 — baselines captured before anything moved. Three committed artifacts: exact plugin-manifest bytes plus digest from the CURRENT builder; the full normalized rail mapping (176 ordered variables, resolved types, per-theme values), not five summary fields; and all 11 governance-fixture outcomes with verbatim diagnostics. Deterministic: re-running on an unchanged tree is a no-op diff.

I then found I had built the exact trap the spec warns about. The capture command rewrote all three baselines unconditionally, so the first person to run it after the retirement task would have silently replaced the pre-retirement reference with a post-retirement one, leaving the later reconciliation comparing a file against itself. It now refuses to overwrite a drifted baseline and exits non-zero; --force is the only way past. Verified both directions.

T2 — the ".agents subtree is invisible to every gate" premise was wrong in both directions. Of 162 files: 80 are vendored upstream payload already excluded with a recorded reason, 81 are Markdown/JSON/YAML, and ONE is an executable — a 332-line dependency-free JSON-Schema validator with no tests. The formatter already covered the subtree (proven by deliberately mis-formatting a file). The type-checker's blindness was structural, not an exclusion: a `**` glob does not match a leading-dot directory. That same mechanism means NO `.mjs` file anywhere in the product repo is type-checked — 35 more files, 27 measured errors, filed as separate backlog rather than folded in. Lint and test are now wired, with a real 6-case test for the one script so the test glob is not permanently inert. The type-check leg was deliberately NOT built product-side, because that file moves into the package where the package's own gate covers it; building product-side machinery for a subtree that is leaving is the stale invariant the success criterion explicitly rules out.

T3 — publish mode retired as one atomic change (two scripts deleted, both validators' enums AND error messages, the portable schema, the repo profile, both fixtures, four docs). Reconciled against T1's frozen baseline: exactly 2 of 11 fixtures moved, each in exactly one field, and NO diagnostic reason changed. The fixture that was supposed to keep failing still fails on the same parity/carrier contradiction code rather than on an invalid mode — the specific regression being watched for, now measured rather than eyeballed.

T4 — REST rail removed from the package (13 exports, 19 tests). TWO gates asserted the deleted export; the task's criteria named only one. The second surfaced by running the gate rather than reading the plan, and would have gone red on a correct build.

T5 — delivery contract settled, and one measurement overturned the plan. I fetched the reference implementation's bootstrap anonymously at two different release tags: BYTE-IDENTICAL, same 4458 bytes, same SHA-256, and neither copy contains its own tag anywhere. Version selection happens entirely at runtime — an explicit flag if supplied, otherwise "latest". So the widely-copied one-liner `curl .../<older-tag>/install.sh | bash` installs the LATEST release right now, not after some future drift. Under `curl | bash` there is no argv, so a copied one-liner cannot carry a pin the script can read.

Our contract therefore makes the bootstrap a RELEASE ASSET with its identity baked in at release time, and has no version flag at all — the asset IS the version, so there is nothing to disagree with. CI never pipes: it downloads the bootstrap, verifies it against the product repo's reviewed record, then executes. The independent trust anchor is that reviewed record, not the SHA256SUMS published beside the archive (whoever can replace the archive can replace its checksum list), so the negative test is a modified asset WITH a matching modified checksum. Immutable releases are now enabled on the repository — not a repo-object field and not a CLI flag; it has dedicated endpoints, and only releases created AFTER enabling are immutable, which is why it was done now rather than at release time.

T6 — the plugin UI had one consumer's paths baked in for every consumer: a hardcoded hostname twice and a hardcoded token-authoring directory. Substitution was two ad-hoc replace chains; it now goes through one helper that fails on either kind of drift (a placeholder the template no longer has, meaning a configured value silently stopped reaching the plugin; and an unresolved placeholder). Escaping is context-correct: HTML text is HTML-escaped, the URL landing inside a script block is JSON-encoded. Verified with a third, hostile configuration (different scheme/host/port, a path containing quotes and a backslash, a plugin name containing angle brackets and quotes). The manifest is still byte-identical to the T1 baseline, same digest.

T7 — repository renamed. Verified rather than assumed that the product repo's dependency still resolves: ls-remote on the exact SSH URL, on the HTTPS form the lockfile records, and a throwaway fresh install through the redirect that produced a built package. Two things surfaced: the lockfile's field labelled `commit:` is actually the ANNOTATED TAG OBJECT, not a commit; and the git dependency only installs at the pinned package-manager version — a newer one blocks lifecycle scripts for git dependencies unless allowlisted, the product repo allowlists nothing, and the package's build output is gitignored, so a newer package manager fails the install outright.

I also caught my own verification lying: my "no references remain" grep piped through `grep -v node_modules`, and one surviving reference was on a line that CONTAINS the literal string "node_modules". The filter matched line content, not path. The gate caught what the check hid.

T9 — the blocking disposition inventory. Every path carrying rail semantics, with present callers and exactly one of four dispositions. Found by three recorded passes (import graph, caller graph, boundary pass) so the result is reproducible rather than remembered.

================================================================
THE FOUR FINDINGS I MOST WANT JUDGED
================================================================

(1) A CONSUMER NO TASK HAD NAMED. A 647-line status generator imports the ledger loader and the conformance evaluator and reads two ledger fields directly, inside a 36-line function that produces one rail of a status report. It feeds one of the 8 CI jobs. An exit status cannot satisfy it — it needs structured output. The other 611 lines are unrelated (visual-review status, story inventory, claim profiles) and are explicitly NOT claimed. This forces a --json output mode into the CLI contract task, which did not have one.

(2) A VALIDATOR WITH ZERO CALLERS, AND A DEEPER PROBLEM UNDER IT. `validate:publish-proof` is invoked by nothing — not the task runner, not the governance chain, not any of the 8 CI jobs. A 229-line validator and 5 fixtures exist for a gate nobody connected. The record it validates is a hand-written attestation that a human ran the plugin and imported tokens into the design tool; nothing publishes automatically (the one thing that could was the rail just deleted in T3). Worse: that proof record and the governance ledger carry FIVE DUPLICATED FACTS (mode, artifact path, artifact revision, materialization status, carrier flag). They agree today. Nothing checks that they agree. The ledger is gated for internal consistency and staleness; the proof — the upstream source record the ledger's own contract doc says the ledger "may embed" — is gated by nothing but one incidental line inside a unit test. So the only machine-readable evidence that anyone actually pushed to the design tool is unverified, and the gated derivative restates its facts without ever comparing them.

(3) BOTH VALIDATORS HARDCODE PRODUCT-REPO CONSTANTS. The publish-proof validator asserts, with a literal-equality helper, that the destination name equals the product repo's name and the destination file equals one specific design-tool file key. The ledger validator does the same with one specific artifact path. A second consumer would fail validation for not being the first consumer. The implementation task's criteria say promotion levels and exception codes must come from the profile; these are the same class and are not covered.

(4) THE DELIVERY MECHANISM CHANGED after your third review, on the measurement in T5 above.

================================================================
WHAT REMAINS
================================================================

T8 CLI contract and scaffold (dispatch, help, version, failure behaviour; unimplemented commands must exit non-zero rather than succeed as placeholders)
T10 move the rail modules into the package
T11 move skills, schemas, profiles, templates in — preparation only, product repo untouched, plus a disclosure review before the first public push
T12 implement the ledger and publish-proof commands
T13 implement the figma commands
T14 production installers, self-contained plugin builder, expanded packaging gate
T15 cut the release (ask first)
T16 prove anonymous cold acquisition and provision every environment; name the required CI job
T17 consumer cutover — activate callers, move skill assets, delete superseded code and the dependency, in one atomic change
T18 clean-environment evidence, plus proving a deliberate regression turns the required CI job red

Three commands the inventory found the contract does not have: a parity command (the parity check is its own governance step with its own policy module), a serve command, and a baseline command. Without all three the product repo cannot reach zero rail executables.

================================================================
CONSTRAINTS AND VALIDATION
================================================================

SETTLED BY THE PROJECT OWNER, NOT UP FOR DEBATE: the pack absorbs the rail into one installable CLI; the publish mode is removed entirely; delivery is the release-asset installer and the repository is public.

Validation available: the product repo's aggregate pre-push command is green (276 unit + 458 browser tests); the package's own full check is green including a packing gate that installs a tarball into a throwaway consumer. NO CI JOB runs the aggregate pre-push command — it is the pre-push hook, and CI runs its constituent parts as 8 separate jobs. Three of those jobs enforce the rail surface.

What I want, in priority order:

(a) Given real implementation evidence rather than a plan, is the approach still right? Direct keep / adjust / pivot.

(b) THE MAIN QUESTION: what must change in T8 and T10–T18 because of what landed? Be specific about which task acquires which obligation. I would rather restructure the remaining tasks now than discover at T17 that something has no home.

(c) Judge finding (2) specifically. My current recommendation moved from "wire the unwired validator" to "wire it AND cross-check the two records against each other, because duplicated-and-unchecked is the actual defect." Is that right, or is the correct answer to collapse the two records into one, or to delete the proof record as a snapshot nothing reads?

(d) Findings (1) and (3) both mean the CLI contract task is under-specified. What else is likely under-specified that I have not hit yet, given the pattern in what I did hit — every miss so far was found by running a gate or walking an import graph, never by reading the plan.

(e) What in the landed work is weaker than it looks? I am specifically worried that I am marking tasks complete on evidence I generated myself, and that several verifications are one-shot manual proofs rather than tests that will still be true in a month.

Do not reduce the task or replace it with an easier alternative. Preserve the requested scope and project conventions.

Is the current approach the best way forward? Give a direct keep, adjust, or pivot recommendation; tradeoffs; what to keep/change first; inspections; validation; and pitfalls.
```

## Response

Recommendation: ADJUST

Keep the architecture. Restructure the remaining task contracts and acceptance gates before proceeding beyond T8. No pivot is warranted.

The implementation evidence strengthens the case for extraction: the product owns more rail behavior, more consumers, and more consumer-specific assumptions than the plan accounted for. Those discoveries do not undermine the single-CLI boundary. They show why moving the originally named files would not have completed the migration.

The important adjustment is this:

The remaining work must be organized around complete caller behavior, record relationships, and installed-artifact execution—not merely around moving modules and implementing command names.

I am evaluating the implementation evidence you supplied, not independently certifying the diffs or test logs. The connected repository lookup did not provide accessible source. Accordingly, I distinguish reported findings from additional inspection requirements below.

Keep the frozen baselines, the scoped T2 decision, the atomic retirement, the renamed repository, and the release-asset installer. Keep the unrelated .mjs backlog separate. Do not move the other 611 lines of the status generator.

1. Finding (2): keep the proof, wire validation, and enforce its relationship to the ledger

Your revised recommendation is right. Wiring the validator alone would fix reachability while leaving the actual consistency defect intact.

Two individually valid records can contradict each other. Conversely, two records can agree perfectly while both contain an unsupported claim. Your design should distinguish those problems.

Keep two responsibilities, not two independent sources of the same facts

The proof record represents an attestation about a particular publication/import: what someone says they imported, into which destination, using which artifact revision.

The ledger represents governance state, including whether that attestation supports the state the ledger currently claims.

Those responsibilities justify retaining both records. The fact that the proof currently has no operational validator caller is evidence of missing enforcement, not evidence that the source record is disposable—particularly when the ledger’s own contract identifies it as a source it may embed.

My recommendation for this migration is:

Retain the proof as the source attestation. Make the ledger’s duplicated publication facts a checked projection of an explicitly identified proof, rather than independently authored authority.

That does not require a new event store, signature system, or wholesale ledger redesign.

Define the relationship before implementing the comparison

T8 should specify, for each of the five duplicated facts, its meaning, source, and required relationship. T12 should implement that specification.

The relationship needs to establish that the records concern the same consumer, destination, artifact, revision, and publication claim. Use an unambiguous source reference and the existing identity/revision mechanism, adding a digest or equivalent exact binding where the present references are insufficient.

Do not just search for “the proof file” and compare whichever record happens to be there.

Also distinguish publication history from currentness. A valid attestation about revision A does not become false merely because the current tokens advance to revision B. It may instead cease to support a ledger claim that B is materialized. Do not “repair” that situation by rewriting the attestation to B.

The gate should therefore check both:

The shared publication claims agree for the exact referenced publication.

That publication is sufficient for the ledger’s present claim under the existing staleness and governance rules.

These checks should not silently copy one record over the other.

Absence needs a defined meaning

Do not make every pre-publication repository invalid simply because no publication has happened. Define when proof is required.

A state that makes no materialization claim may legitimately lack proof, depending on the existing policy. A state claiming successful/current materialization must not obtain a pass by omitting it. A present but malformed or contradictory proof must not be ignored.

Do not overstate what the gate proves

The resulting gate can establish:

“This attestation is well formed, refers to the expected destination and artifact, and consistently supports the ledger’s claims.”

It cannot establish:

“The claimed human import definitely happened, and the remote Figma file still contains those values.”

That limitation does not justify deleting the proof or restoring the removed REST mechanism. It means the CLI and status report must describe validated attestation and consistency, not independently observed remote synchronization.

Why not collapse the records now?

Collapsing the files would remove one duplication opportunity, but it would not establish that publication happened or resolve historical-versus-current semantics. It could also erase a useful distinction between source evidence and governance assessment.

Removing redundant ledger fields may become appropriate once their consumers have migrated. It is not necessary to make that redesign a prerequisite for this extraction. Within the requested scope, keep both, bind them explicitly, and enforce the relationship.

2. What each remaining task must acquire
   T8 — Expand from CLI scaffold to complete boundary contract

T8 is now the highest-leverage task. It should not close on dispatch, help, version, and placeholder failure behavior alone.

First, turn T9 into a caller-contract matrix. For every retained caller, record its replacement command, JSON inputs, outputs consumed, failure behavior, side effects, owning implementation task, and regression test. Every disposition must have a destination; every executable destination must have a task.

Add the independently invocable parity, serve, and baseline commands. Also specify the structured ledger/conformance output required by the status generator.

Second, define --json as an interface, not a formatting convenience. For finite machine-consumed commands, require a documented result schema/version, stable diagnostic codes, deterministic ordering where relevant, and no progress messages or human commentary on stdout.

Distinguish a completed evaluation reporting nonconformance from an invocation that could not evaluate its inputs. Preserve useful structured diagnostics on expected validation failures. Missing executables, malformed output, unsupported result versions, and process failures must not become “empty rail,” “not applicable,” or successful status.

Exact exit codes should follow project conventions, but their meanings must be explicit. A subprocess helper that throws on nonzero exit must not accidentally discard the valid failure report the caller needs.

Third, specify the status projection. The CLI must return everything currently derived by the 36-line rail function, including the two fields currently read directly from the ledger. Returning raw ledger JSON and expecting the product to reconstruct conformance would preserve the prohibited logic under a different interface.

The product may invoke the CLI, parse its result, and insert/render the rail result. It must not retain rail evaluation or rail-specific fallback policy.

Fourth, specify configuration ownership. Separate portable invariants from consumer expectations. Destination name, Figma file key, artifact path, promotion levels, and exception configuration need declared JSON owners, requiredness, and validation behavior. Expected values must come from the profile/configuration—not from the record being checked against them.

Do not solve portability by weakening literal-equality checks into “any string is acceptable.”

Fifth, specify environmental and filesystem behavior. Resolve configuration precedence, repository-root discovery, relative paths, installed-resource lookup, supported runtime prerequisites, missing files, unknown schema versions, time inputs for staleness, and permitted write locations. Help/version should work outside a consumer repository.

Checks must be read-only. Baseline capture must be explicitly mutating. Serve needs a separately defined readiness/shutdown contract.

T8 hold point: no retained T9 caller lacks an input/output/failure contract or implementation owner.

T10 — Move complete behavior, including the newly discovered semantics

T10 must include the status rail computation and the standalone parity policy module, not just the previously named ledger and conformance modules.

Extract reusable evaluation logic so that human output, machine output, standalone commands, and status projection share the same decisions. Do not implement a second evaluator solely for JSON output.

Preserve a reviewable distinction between:

Relocation: behavior remains equivalent to the reconciled post-T3 reference.

Intentional changes: proof–ledger consistency enforcement, portability corrections, and newly specified boundary behavior.

Otherwise a regression could be explained away as “part of the move,” or a necessary new check could be hidden by rebaselining.

Carry the relevant tests with the code. Record where moved assertions now execute; a lower product test count is not itself a regression if the tests moved into the package.

T10 hold point: the package can evaluate the relevant fixture inputs without importing product code or depending on its checkout layout.

T11 — Move assets, prove their coverage, and close the disclosure boundary

T11 remains preparation-only on the product side, but it acquires several explicit obligations.

Move the owned 332-line validator and its six tests into a location genuinely covered by the package’s gates. “The package check is green” is insufficient unless the moved executable is actually included. Preserve the deliberate decision not to build temporary product-side type-check machinery.

Retain justified upstream exclusions by provenance and path. Do not accidentally classify newly moved owned code as vendored payload.

Review operational instructions inside skills, Markdown, YAML, templates, and examples. These can retain obsolete commands, install URLs, product paths, or inline rail logic even when the import graph is clean.

The disclosure review must cover all consumer-derived material that will become public: profiles, fixtures, baselines, token values, file identifiers, generated output, source maps, and the history/refs being pushed—not merely the final archive contents. Consumer-specific values must live in declared JSON, not portable validators; any such values intentionally published as examples need explicit review.

Also prove how installed skill assets are discovered after the product copy disappears.

T11 hold point: disclosure review occurs before newly moved consumer-derived content is pushed publicly, not merely before T15 publishes a release.

T12 — Own validation, proof–ledger consistency, status output, and parity

Give T12 explicit ownership of:

Ledger and proof validation; their cross-record relationship; the machine-readable rail-status result; and the independently invocable parity command.

Keeping parity independently invocable preserves its existing governance-step identity. Do not make its replacement merely an incidental side effect of another command.

Generalize all consumer constants identified in finding (3). Audit the rest of both validators for the same pattern, including defaults and error messages. A configurable profile must not be allowed to re-enable the retired publish mode or override non-negotiable portable invariants.

Retain the eleven governance fixtures and five proof fixtures, with the approved retirement reconciliation. Add tests where each record passes its individual validation but their shared claims disagree.

For the five duplicated facts, use schema-valid mutations in each direction wherever representable. Also cover missing required proof, wrong source binding, wrong destination/revision, and valid historical proof that no longer supports the current claim.

Use a genuinely different second consumer with different destination identity, artifact path, and policy data. Test both legitimate acceptance and mismatched-record rejection.

T12 hold point: the status caller can obtain its complete rail result without loading or interpreting either record itself.

T13 — Own Figma behavior, serve, and baseline commands

Assign serve and baseline explicitly to T13. Baseline orchestration may depend on T12’s evaluators, but it still needs one command owner.

For the builder, preserve the original consumer’s exact manifest baseline and complete normalized mapping. For alternate configurations, test the intended changed output rather than demanding the original digest universally.

Promote T6’s configuration substitution checks into durable tests, including the HTML-parsing and network-permission issues discussed below.

Serve needs tests for actual readiness, occupied ports, shutdown, and access only to the intended resources. It must not become a generic server for the product checkout merely because that makes migration easy. Specify bind behavior and ensure generated plugin URLs and the served endpoint agree.

Baseline needs separate verification and capture/update behavior. Verification must never rewrite expected data and must fail when the required reference is missing. Preserve the non-overwrite guard; test that failure leaves all three artifacts unchanged, not just the one that first differed. Automated gates must not use --force.

Keep the original T1 reference and an explicit reconciliation record. Do not convert the frozen reference into an automatically refreshed “current baseline.”

T13 hold point: all builder, serve, and baseline behavior is reachable through installed CLI commands, without product-owned implementations.

T14 — Test the release product, not just a package tarball

The existing packing gate remains valuable, but it does not establish the new delivery contract.

T14 must test the actual staged release archive and production installer behavior, including resources and runtime dependencies. The installed CLI must build the plugin and run its commands without reaching into the package source tree, product node_modules, or undeclared developer tooling. A declared runtime prerequisite is acceptable; an accidental one is not.

Add a pre-release consumer-cutover rehearsal in a disposable checkout. Exercise the proposed caller changes against the staged candidate before publishing it. Product activation still belongs to T17.

Most importantly, close the entire verification chain:

Reviewed consumer record
→ verified bootstrap bytes
→ verified selected payload bytes
→ installed executable and resources

Verifying the bootstrap alone is insufficient if it subsequently trusts a replaceable archive plus a replaceable checksum list.

Either the reviewed record must bind the payload digests, or the verified bootstrap must contain and enforce those digests. A baked tag/name without a payload integrity binding is not the same property.

Test modified bootstrap and modified payload scenarios, including matching modified checksum metadata, while the reviewed consumer record remains unchanged. Rejection must occur before untrusted execution.

Cover installation failure without damaging an existing installation, paths with spaces, supported platform selection, and error propagation in both shell and PowerShell.

T14 hold point: the exact candidate assets have passed installed-artifact and prospective consumer integration tests. Local installer-fixture tests do not replace T16’s real anonymous acquisition.

T15 — Publish exactly what was tested, with approval

Keep the explicit approval requirement.

The approval packet should identify the source commit, release tag, candidate asset inventory, bootstrap/payload digests, and associated test evidence. Do not test candidate A and rebuild candidate B during publication without re-establishing that evidence.

Record annotated-tag identity separately from the peeled commit identity. Git explicitly distinguishes dereferencing a tag object from resolving the commit it names; a field labelled commit is not sufficient evidence of object type.
Git

Stage the complete release as a draft, attach every asset, then publish. GitHub’s immutable-release contract prevents adding, replacing, or deleting individual assets after publication; this changes release assembly, not merely release security.
GitHub Docs

Verify the actual published release’s immutable status. The earlier repository-setting check is useful preparation, not proof about a future release.

A defective immutable release requires a new release and a new reviewed consumer pin—not an attempted repair of the old assets.

T16 — Split into early contract selection and later acquisition/provisioning

T16a must happen alongside T8, not after T15.

Identify the actual developer, agent, hook, and CI environments that invoke the rail. Select supported platforms, runtime prerequisites, installation location, and noninteractive executable resolution.

Name the real enforcement checks now: workflow file, job identifier, emitted check context, applicable trigger conditions, and required-check/ruleset binding.

The supplied evidence does not name those jobs, so I cannot honestly identify the existing required check. It is not the aggregate pre-push command. Preserve the eight-job structure unless there is a separate reason to change it, and account for all three rail-using jobs.

T16b remains after T15 and before T17.

Prove anonymous acquisition of the exact release with fresh relevant caches and no usable authentication or existing rail installation. Then provision each required environment. Installing in one CI job does not establish availability in the others.

Bind invocation to the installed, verified executable rather than trusting whichever ds-skills happens to appear first on a developer’s PATH.

Check conditional execution carefully. GitHub documents that a conditionally skipped job can report success even when it is required; merely marking a check required does not prove its commands ran.
GitHub Docs

T16 hold point: the exact release is anonymously obtainable, every rail caller environment can execute it, and the required enforcement path is identified and exercised.

T17 — Make the entire consumer cutover atomic

T17 must activate all retained callers from T9, including the previously unnamed status generator and the newly wired proof relationship check.

Replace only the status generator’s rail-specific behavior. Preserve unrelated status behavior, and compare the unaffected report portions before and after migration.

Remove direct ledger-field reads, evaluator imports, local parity implementation, serve implementation, baseline implementation, moved skill executables, and superseded wrappers. No fallback to the former implementation when the CLI is missing.

Remove the tooling dependency and corresponding lockfile edges. The temporary package-manager-specific Git installation concern ends here; it does not justify broadening the migration into support for arbitrary package-manager versions.

Audit inline workflow/task-runner bodies as well as executable files. Moving an algorithm into YAML or a generated wrapper does not satisfy the ownership boundary.

The existing generated-plugin exception stays narrow: generated output is allowed; product-owned builder source and handwritten/generated governance implementations are not.

T17 hold point: one consumer change switches all required callers and removes the superseded implementations without an intermediate split-authority state.

T18 — Demonstrate enforcement through the real installed path

T18 must be more than a final green run.

Record exact consumer/package revisions, installed release identity and digests, environment/runtime versions, invoked executable path, baseline identities, and actual CI run/check results.

The deliberate regression should target the newly important seam. For example, create a schema-valid proof–ledger disagreement that leaves each record individually valid. Demonstrate that the designated required governance check runs the installed CLI, reports the relationship failure, and turns red.

Malformed JSON that only makes a linter fail would not establish this.

Exercise every independent enforcement path across T14–T18: parity failure, structured status failure handling, missing/wrong CLI, baseline drift without rewriting, and acquisition tampering. Not every mutation needs a separate live PR, but every boundary needs a durable test, and T18 must demonstrate the real required CI path.

Re-run T9’s recorded inventory passes against the final tree.

T18 hold point: passing and deliberately failing behavior are both demonstrated through the real installed CLI and the real enforcement configuration.

3. What else is under-specified—and where to inspect

The recurring pattern is not simply “the plan missed some files.” It missed ways behavior enters, leaves, or is indirectly depended upon.

Follow data consumers as well as imports

Finding (1) shows why searching imports of the known rail module is insufficient. Search readers of the ledger/proof paths, characteristic field names, report fields, generated artifacts, and configuration keys. A consumer can duplicate rail semantics without importing a rail module at all.

Add data-flow inspection to T9’s existing passes. Include dynamic subprocess calls, task aliases, hooks, skill instructions, and inline CI bodies.

Inspect failure consumers

For each caller, determine what it does with nonzero exit, empty stdout, invalid JSON, timeout, and unavailable inputs. A correctly failing CLI can still leave CI green if a wrapper swallows its error or treats missing output as an empty result.

This belongs jointly to T8’s contract and T17/T18’s caller tests.

Inspect ambient dependencies

Run from outside the repository, from a nested directory with an explicit root, and from an installation path containing spaces. Remove access to source checkouts and undeclared build tools.

Check resource lookup, current working directory assumptions, environment overrides, and hidden package-manager lifecycle dependencies. These are the installed-artifact counterparts of the hardcoded product constants you already found.

Inspect schema/runtime/profile disagreement

Your retirement touched multiple validators, a portable schema, fixtures, and error messages. That is evidence that allowed values and expectations exist in several representations.

T12 should test agreement among those representations. A second consumer must pass the portable schema and runtime validation; an obsolete mode must fail both. Do not let profile configurability become a route around portable prohibitions.

Inspect time and side effects

Staleness checks need explicit time semantics and deterministic test inputs. Status generation should evaluate a coherent set of inputs rather than rereading changing files at different stages.

Every command should declare what it reads, writes, serves, or launches. In particular, validation must not quietly update proof, ledger, baseline, or generated artifacts in order to pass.

4. What in the landed work is weaker than it looks?
   T6’s escaping claim needs another test

JSON encoding alone does not establish safety inside an HTML <script> element.

The HTML parser recognizes script-related sequences independently of JavaScript string quoting. The HTML standard specifically identifies </script, <script, and <!-- as problematic sequences in script literals.
HTML Living Standard

Therefore, if the helper only applies JSON.stringify to a raw value and inserts it into an inline script, “context-correct escaping” remains unproved. Escaping < as a JavaScript-compatible Unicode escape is one solution; a construction that avoids this parsing boundary is another.

Add hostile values containing those sequences. Inspect the resulting DOM and execute the intended script in a browser test, verifying that no additional element/script appears and the value survives correctly. Quotes, backslashes, and angle brackets in a separate HTML-text field do not exercise that boundary.

This is an inspection requirement, not a claim that the unprovided implementation definitely has the defect.

T6’s alternate-host test also needs functional permission coverage

A correctly substituted URL can still be unusable if the manifest permits only the original endpoint. Figma’s networkAccess configuration restricts plugin requests to declared allowed domains/patterns, including development-server configuration.
Figma Developer Docs

Test the generated endpoint together with manifest permissions and serve behavior. Preserve byte identity for the original configuration; do not use unchanged manifest bytes as the success criterion for every different network configuration.

T1 is strong regression evidence, but not an independent correctness oracle

Capturing the full mapping and verbatim diagnostics before migration was the right move. Preventing silent overwrite removes the worst self-comparison trap.

Still, the baseline demonstrates preservation of prior behavior, not that prior behavior was semantically correct. Keep a small set of directly asserted semantic examples alongside the historical reference.

The overwrite guard also needs durable tests for missing-reference verification, mixed drift across the three files, and no partial writes. A manual demonstration that --force works is not a substitute.

T2 proves narrower coverage than “the subtree is gated”

The measured classification is substantially better than the original premise. The six-case test makes test discovery real.

It does not establish complete correctness of the validator, nor does it establish that the package’s eventual type-check includes it. Prove the actual moved file is covered; do not infer coverage from directory names or a green aggregate check.

Keep the unrelated 35-file/27-error backlog separate. That separation is sensible, not an excuse to miss the one moving executable.

T3/T4 prove retirement progress, not complete live-surface absence

The fixture reconciliation and discovery of the second export gate are good evidence.

Preserve those checks as regressions. Ensure the retired mode is rejected by live configuration/schema/CLI paths, and that removed exports or instructions cannot remain operational through another entrypoint.

Do not require every historical occurrence of the retired string to disappear: frozen baselines and explicit rejection tests may need it. Distinguish inert historical evidence from live support.

T5 settles identity selection, not the entire delivery proof

Keep the release-asset design. But “the asset is the version” establishes selection identity only when later downloads cannot escape the binding.

GitHub immutability protects published assets and their associated tag; it does not make an unreviewed future release trusted, and release metadata such as the “latest” designation remains changeable. Your reviewed pin must remain authoritative.
GitHub Docs

The modified-asset-plus-modified-checksum test is the right negative test. Ensure it targets the whole bootstrap-to-payload chain, not just one layer.

T7 is transitional compatibility evidence

The fresh Git-dependency installation proves a useful current fact under the pinned package manager. It does not prove the new acquisition mechanism, and it need not support unrelated newer package-manager behavior before removal.

Keep the existing pin stable through cutover. Do not spend this migration repairing a dependency path T17 eliminates.

The grep incident also deserves a lasting correction: enumerate/exclude paths before inspecting file contents. Repeating a corrected one-shot grep is weaker than making the boundary audit use that method consistently.

Author-generated evidence is acceptable; circular evidence is not

The author running the tests is not inherently a problem. The important questions are whether expected and actual results have independent origins, whether the exact artifact is identified, and whether another person can replay the check.

A stored pre-change baseline, a hand-asserted fixture, and a required CI job that rejects a deliberately introduced contradiction are meaningful evidence. A verifier that regenerates its expectations, compares only mutually agreeing records, or exercises a different artifact from the one distributed is not.

Use separate completion claims: implemented, regression-tested, installed-artifact-tested, and consumer enforcement demonstrated. T5 can be contract-complete without delivery being proven; T7 can be rename-complete without acquisition being proven.

5. Order of execution

The revised critical path should be:

T8 plus early T16a → T10/T11 → T12/T13 → T14 with disposable cutover rehearsal → T15 approval and publication → T16b anonymous acquisition/provisioning → T17 atomic activation/removal → T18 enforcement evidence.

The first change should be to T8 and the task acceptance criteria—not another round of blind file movement.

The tradeoff is a larger contract and packaging phase now, in exchange for avoiding an immutable release with missing commands or a T17 cutover that discovers another stranded consumer. Retaining proof plus checked ledger projection adds a relationship gate, but avoids both throwing away source evidence and forcing an unnecessary record redesign.

Proceed with the single-CLI migration. Amend the remaining tasks so every retained caller, shared fact, installed resource, and enforcement path has an explicit owner and test. That is the adjustment the implementation evidence now requires.

(Conversation: chatgpt.com/c/6a9dbbe8-…; 604s to generate.)

## Locally verified before acceptance — round 4

Four checkable claims. Two clear, two land.

**"T6's escaping claim needs another test" — the escaper is correct; the test gap is real.**
They flagged this as an inspection requirement rather than a defect, and the inspection clears
the implementation:

```
jsString('a</script>b')  =>  "a</script>b"
```

`plugin/build.mjs` escapes `<` and `>` as `<`/`>` after `JSON.stringify`, so the HTML
parser never sees `</script`. Their premise — "if the helper only applies `JSON.stringify`" —
does not hold. Their conclusion still does: **no test pins this.** The T6 hostile config put
angle brackets in HTML-text fields, which does not exercise the script boundary.

Two further facts worth recording, because they change what the test should assert. The value
reaching `jsString` is `new URL(config.artifactUrl).origin`, and `new URL()` **rejects** a
hostname containing `<` or `>` (`ERR_INVALID_URL`, verified on two hostile inputs). So today the
escaper is defence in depth for a value that cannot carry the sequence. A test should pin the
escaper directly rather than route through a URL that will refuse the input.

**The `networkAccess` point lands, and differently than framed.** The manifest template is:

```json
"networkAccess": {
  "allowedDomains": ["none"],
  "devAllowedDomains": ["__RAIL_ARTIFACT_ORIGIN__"]
}
```

Figma's manifest documentation: `["none"]` means "the plugin cannot access any external network
resources", and `devAllowedDomains` lists domains permitted **during development** only. So the
substituted origin only takes effect in development mode, and the plugin has no production
network access at all. That is exactly right for Collider's manual local workflow and it is why
the T1 manifest baseline is byte-identical — but it means **T6's third-configuration test proved
substitution, not usability**. A consumer with a hosted artifact URL gets a correctly
substituted plugin that cannot fetch it. Undocumented constraint; T13 owns the fix.

**Annotated tag vs peeled commit** — already found independently at T7 and recorded there:
pnpm's lockfile field labelled `commit:` holds `b00a82d8…`, which `git cat-file -t` reports as
a **tag**, not a commit. Their T15 point that the two identities must be recorded separately is
the same fact applied to release approval, and is adopted.

**Immutable releases forbid post-publication asset changes** — accepted as an operational
constraint on T15 (stage a draft with every asset attached, then publish), not merely a security
property. Not independently re-verified beyond the enablement check already recorded.
