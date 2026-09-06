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
