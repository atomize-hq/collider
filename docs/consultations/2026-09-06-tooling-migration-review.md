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
