# ChatGPT Pro consultation — release-readiness review (pre-T15)

**Date:** 2026-09-07
**Mode:** approach review (`chatgpt-pro-consult`), bounded — five questions, not a migration audit
**Model:** GPT-5.6, Pro power (5 of 5)
**Conversation:** https://chatgpt.com/c/6a9f3425-da54-83e9-983a-eedcb6de4a4a
**Task/spec:** [`SPEC.md`](../../SPEC.md) · [`tasks/todo.md`](../../tasks/todo.md), as committed at `0cfb140`; package at `ds-skills` `2e2b15f`
**Verdict:** ADJUST — do not cut the release immediately; close a bounded readiness delta first

> Advisory only; verify against local project truth and authoritative docs; do not
> reduce scope without user approval.

## Transmission incident — an unreviewed attachment rode along

**A file was sent with this prompt that this session did not attach.** The composer at
`chatgpt.com/` held a persisted draft attachment from an earlier, unrelated Codex run of the same
skill family — `codex-pro-repo-input(20260907-135604).zip`, staged at 09:54 — and ChatGPT's draft
persistence carried it into a freshly opened tab. `fill-file` writes the textbox; it does not
clear attachments. The send therefore included it.

Opening a controlled new tab is the playbook's defence against a stale draft, and it was
insufficient. The playbook says to snapshot and verify the chip _after uploading_; it has no rule
for verifying the **absence** of a chip nobody added — the same shape as this migration's own
recurring defect, a check that only tests for presence.

**Contents, read locally rather than taken from the response:**
`/private/tmp/pro-change-exchange.bpbIuG/codex-pro-repo-input.zip`, 1,614 bytes, five entries —
`bundle-manifest.json`, an empty `worktree.patch`, and a three-file "Widget Sorter" tree whose
README reads "synthetic smoke-test repo… Not real code. Exists only to verify the chatgpt-pro
upload pipeline." No Collider content, no package content, no keys, no identifiers. The single
path string in it, `.agents/chatgpt-project-sources.json`, appears only in an exclusion list and
is generic to the skill family.

**Disclosure impact: none.** The process defect is real regardless, and the fix is a
snapshot-and-assert-no-attachment step before every send.

ChatGPT read the ZIP, correctly identified it as a synthetic fixture, and said so unprompted:
it recorded that the repository facts below were accepted from the prompt rather than verified
from the attachment. That is the intended posture for an approach review, so the review stands.

## Locally verified before acceptance

**1. The digest arithmetic — my prompt was ambiguous, its numbers were right.**
ChatGPT inferred that byte-identical payloads must mean five identical SHA-256 values and asked
me to correct "four identical digests" to five. Staging `v0.4.2` from `2e2b15f` shows the record's
actual asset map: four `.tar.gz` assets sharing `c977e6a6…` and one `.zip` at `95e06f9e…`. The
**unpacked payloads** are identical across all five platforms; the **archives** are not, because
Windows ships a zip and the rest ship tar.gz. Four identical digests is correct.

The underlying recommendation still lands: the prompt's "the five platform payloads are now
byte-identical, so four of the five digests are the same value" is self-contradictory as written,
and `SPEC.md` §10.5 must not repeat that ambiguity. Payload identity and archive identity are
different claims and the spec should say which one it means.

**2. Byte identity must not be recorded as a permanent invariant.** Confirmed as a real hazard in
`scripts/release/stage.mjs`: the record is generated from the staged bytes, so a future release
with genuinely platform-specific payloads would produce five distinct digests. Nothing may treat
that as a regression, and nothing may collapse the five platform entries by digest.

**3. The zero-caller finding generalises, and the count is already two.** `pnpm validate:sync-ledger`
and `pnpm validate:publish-proof` both exist and neither is in `just check` or `just preflight`.
This is the evidence behind ChatGPT's Question-4 answer, and it was found here before being asked.

## Recommendation summary

- **Q1 platform matrix** — keep five named assets for this release. Distinguish _support_ (which
  targets are declared installable) from _packaging_ (which bytes back them). Assert the installer
  **selects its own asset**, not merely that installation succeeds — with identical bytes, a
  selector defect passes both installation and digest verification. Already covered by T14's
  matrix gate, which asserts on the reported asset name; the addition is to keep it that way.
  Qualification worth recording: immutability binds the _published release_, not future releases,
  so a later layout change is cheaper than argument (c) assumed.
- **Q2 stale-check inspection** — bounded, in four areas: every independently consumed affirmative
  projection; cross-record relationships and single-input shortcuts (one-factor counterexamples —
  swap the partners of two individually valid pairs); behaviour pins that span a contract change;
  and the new build boundary, specifically whether the **distributed prebuilt bundle after
  substitution** is what gets exercised. Explicitly warned against regenerating goldens from the
  successor, which swaps one circular oracle for another.
- **Q3 cutover ordering** — atomic is correct; do **not** add a grace release. The old
  representation lacks information the new contract requires, so a deprecation warning cannot
  supply it, and new-CLI tolerance would not help anyway because the _old validator still cannot
  read the new record_. Publishing the CLI may precede the consumer cutover: availability is not
  adoption.
- **Q4 caller proof** — yes, strengthen it, and phrase it as effective enforcement rather than
  "has a caller": a complete path from a mandatory gate through the installed CLI to the consumer
  data, with failure propagating back to the gate, plus a negative test that fails when the
  _integration edge_ is cut, not just when the validator is.
- **Q5 release judgement** — ADJUST. Five ordered steps; full text below.

## Prompt sent

```text
We are already working on this project task.

Task/spec: Extract every executable code path of a design-token publishing rail out of a product
repo into one installable CLI package, so the product repo contributes only JSON data. Phases 1
and 2 are complete and committed. The next step is cutting the first release, which is
irreversible in two ways: the release assets are immutable once published, and the package repo
is public with nothing pushed yet, so the first push is also a publication event.

This is a BOUNDED review. I want a go / adjust / hold judgement on cutting that release now, and
answers to the five specific questions below. Do not audit the whole migration.

Current approach (all statements below are repository-derived and verified locally unless marked
INFERENCE):

Delivery contract. The CLI is distributed as GitHub release assets plus a bootstrap installer
that is itself a release asset, not a file in the repo. There is deliberately no --version flag on
the bootstrap: the asset IS the version. Trust chain is: reviewed release record -> verified
bootstrap bytes -> verified payload bytes -> installed executable. Two deliberate divergences from
the reference implementation we copied the shape from: a missing SHA256SUMS is a hard failure
rather than a warning, and there is no fallback to a moving branch. Two environment variables
(install prefix, base URL) and no flags at all. The installer hard-fails on an empty or
placeholder baked identity.

Verification already done. Five-platform install matrix, both the POSIX and the PowerShell
installer executed for real (no "the bash one works so the PowerShell one does" substitution). The
decisive negative is tested: a modified payload accompanied by a MATCHING modified checksums file
is rejected, because the payload digests are baked into the bootstrap. Lifecycle: reinstall,
damage-free failure, paths with spaces, coexistence of versions. Two synthetic data-only consumers
outside both checkouts, differing in every profiled dimension, with their expected outputs
hand-computed rather than produced by the code under test. Filesystem reads are instrumented and
asserted to stay inside the install prefix and the consumer's own data. Every gate was proved by
injecting a deliberate fault and observing red before reverting.

Question 1 - the platform matrix, which the release makes immutable.
The plugin bundle used to be built per-install with a bundler, which made the bundler an optional
peer dependency and meant the tool only worked for consumers who already had one. We moved to
prebuilding the bundle once at package build time and substituting two free global identifiers
with JSON literals at command time. That removed the last native dependency. Consequence: the five
platform payloads are now BYTE-IDENTICAL, so four of the five digests in the reviewed release
record are the same value. We kept the five-asset matrix anyway, on three arguments: (a) an
unlisted OS/arch fails with an explicit list rather than silently installing something untested,
(b) the reviewed record is keyed on the platform matrix, and (c) an immutable release cannot gain
an asset later, so dropping to one asset now is hard to undo while keeping five is cheap. We
amended the spec in place so a reviewer who notices four identical digests reads the reason rather
than suspecting a staging bug. Is keeping five identical assets right, or is one asset plus an
explicit platform-support assertion the better contract? What breaks later under each choice?

Question 2 - a defect shape we keep finding, and whether the release is likely to carry more of it.
The recurring failure in this migration is "a check that keeps passing after its subject moves".
Six instances so far. The newest one, found today: when the moved implementation was lifted out of
the product repo, its behaviour was pinned against outputs captured from the predecessor. The
status projection it computes reads only one of the two records involved. A later schema version
added a cryptographic binding between those two records - which the predecessor could not have
consulted, because that binding did not exist in the old version. The projection was never updated
to consult it, and the behaviour pin preserved the gap by construction. Result: with a broken
binding the command exited non-zero and reported the failure in its diagnostics, but the
sub-object that one downstream consumer is contracted to read ON ITS OWN still said "satisfied"
with no reason codes. Fixed today, with a regression test whose fixture is specifically the case
that would otherwise report "satisfied" rather than a weaker one. Given that mechanism -
behaviour-pinning a moved implementation against a predecessor that could not have known about a
later invariant - where else would you look before cutting the release?

Question 3 - consumer cutover ordering.
A rehearsal against a disposable clone of the consumer found two data migrations. One was a purely
additive profile key set that no consumer code reads; it landed today and is inert. The other is a
record-format version bump plus a new required binding block. I tried landing it alone and reverted
it: the consumer's own validator pins the old version as a literal and its key spec has no slot
for the new block, so the migrated record fails the consumer's validator and five of its tests.
The consumer's validator is one of the modules the cutover deletes. So the data migration is the
data half of an atomic code-plus-data cutover, not an independent fix. I pre-computed and verified
the exact migrated record against the new CLI, then reverted it and recorded it in the cutover
task. Is atomic-only correct here, or should the released CLI accept the old record version for
one release with an explicit deprecation, to make the cutover reversible? Note the whole migration
exists to end a split-authority state where some callers use the CLI and some use a local copy.

Question 4 - a related discovery about where a check actually lives.
While reverting, I found that the consumer's record validator has ZERO gate callers: it is a
package.json script, it is in neither the fast check nor the pre-push gate, and the record is
guarded only incidentally by tests that happen to import it. This is the second zero-caller
validator found in this migration. Does that change what the cutover must assert - specifically,
should the cutover be required to prove each moved check has a caller after the move, rather than
proving the check exists?

Question 5 - release-time judgement.
Given the above, and that the first push publishes a public repo whose disclosure review is a gate
rather than a formality: cut the release now, adjust something first, or hold? If adjust, name the
specific changes and their order.

Constraints and validation expectations. Package gate is green end to end, including the full
installed-artifact gate. The consumer repo is untouched by this phase and green. Advisory answers
must be verifiable against local repository evidence; I will verify before acting.

Do not reduce the task or replace it with an easier alternative. Preserve the requested scope and
project conventions.

Is the current approach the best way forward? Give a direct keep, adjust, or pivot recommendation;
tradeoffs; what to keep/change first; inspections; validation; and pitfalls.
```

## Response

Recommendation: ADJUST, not pivot

Keep the delivery architecture, keep the five-platform asset contract for this release, and keep the record migration atomic with consumer cutover. Do not introduce a one-release legacy-format acceptance path merely for rollback.

Before the first push, I would close a bounded release-readiness delta: review the newer invariants that predecessor parity could not establish; verify that the final installed artifacts carry those corrections; strengthen the cutover’s caller requirements; and approve the exact public disclosure set. This does not require reopening the migration or merging the consumer cutover before releasing the CLI.

Evidence limitation: I inspected the attached ZIP. Its repo/README.md identifies it as a synthetic “Widget Sorter” upload fixture; it contains neither the release implementation nor the migration evidence. Consequently, the repository facts below are accepted from your report, not independently verified from that attachment. The local inspections I recommend are acceptance conditions, not claims that I found additional defects.

1. Platform matrix: keep five assets, but distinguish support from packaging

For this release, keep the five named assets. One asset with an enforced platform allowlist would also be sound, but it is not sufficiently better to justify changing the reviewed delivery contract at this point.

The important distinction is:

The platform matrix declares supported installation targets. The payload digest identifies content. Different supported targets may legitimately reference identical content.

Your argument (a) supports an explicit allowlist, not necessarily five files. A universal asset whose bootstrap rejects unsupported targets can provide the same behavior. Argument (b) is a practical reason to retain the current contract: the reviewed record, installers, and validation already use platform-keyed entries.

Argument (c) needs a qualification. An immutable release cannot acquire additional assets after publication, but a later release can use a different asset layout. GitHub’s restriction applies to the published release, not to every future version of the project.
GitHub Docs

The future tradeoffs are therefore:

Choice What remains straightforward later What can become inconvenient
Five platform-named assets Reintroducing genuinely platform-specific payloads while retaining the naming and selection contract. Five inventory entries, uploads, and availability checks must remain correct even when the bytes are identical.
One universal asset plus enforced support assertion Continuing to ship platform-independent content with less packaging duplication. A later native split requires changing the download contract or retaining a universal package containing the alternatives. Consumers that construct asset URLs directly may need changes.

Under your release-bound bootstrap design, neither choice forces an old bootstrap to understand a future release. That substantially limits the compatibility cost of changing the layout later. Equally, retaining five assets now does not reserve support for a sixth platform in this release: that still needs a new reviewed release.

Two concrete checks before freezing this matrix

First, verify selection, not just successful installation. With identical bytes, a platform-selector defect could request the wrong platform’s asset and still pass installation and digest verification. The five-platform test should observe the selected asset name or requested URL for each target. Existing HTTP request logs or equivalent installer instrumentation can establish this; you do not need to manufacture differences in the production payloads.

Second, preserve platform identity independently of digest identity. Neither the release builder nor the record validator should collapse entries by digest. The acceptance condition is five expected named assets, each matching its platform entry—not one unique digest and therefore one upload.

Describe byte identity as a fact about this release, not a permanent invariant. Future releases must be allowed to contain different platform digests without that alone becoming a regression.

Also make the wording exact: if the five downloadable asset files are byte-identical, all five SHA-256 values are identical. “Five platform entries sharing one payload digest” is clearer than “four identical digests.” If you actually mean identical unpacked contents but different archive bytes, document that distinction.

2. Recurring stale checks: inspect the changed contracts, not every migrated function

The mechanism you describe identifies a specific limitation of the evidence:

Predecessor parity establishes preservation only where the predecessor and successor are implementing the same contract.

It cannot establish a later invariant that the predecessor never evaluated. Your fix and deliberately strong regression fixture are the right response. In particular, choosing a case that otherwise produces satisfied is stronger than choosing one that already fails for another reason.

Six instances are enough to justify a focused check of this failure mechanism. They are not enough to estimate a meaningful probability that another defect remains, and they do not justify an unbounded re-audit.

I would inspect the following areas, in this order.

A. Every independently consumed affirmative projection

Start with all constructors, writers, and serializers of the standalone status object, then any other output contracted to make the same affirmative claim. Search for assignments of satisfied, assembly of its reason codes, and early-return paths that bypass the normal evaluation route.

For each such output, identify the necessary prerequisites of that particular claim. The acceptance rule should be:

The standalone affirmative result implies that every prerequisite required by its current contract was established.

That is stronger than “the command eventually reports an error somewhere.”

Test the output as its consumer actually uses it: extract only the contracted sub-object and assert its status and reasons, while separately checking process failure and diagnostics. A sibling diagnostic or nonzero exit must not be needed to reinterpret an apparently affirmative object.

Do not replace the bug with a blanket rule that any diagnostic makes every status fail. An unrelated failure need not invalidate an independent status. Propagate failures according to the status’s actual prerequisites, using the existing status vocabulary and reason-code conventions.

B. Cross-record relationships and single-input shortcuts

Your newest defect was a missing dependency on the other record. That makes relational counterexamples particularly valuable.

Where the binding contract permits these constructions, check an otherwise successful pair with only its binding broken, and two individually valid pairs whose partners are exchanged. The latter asks whether “both records are valid” has accidentally been substituted for “these exact records are validly bound together.”

Hold the status-producing record fixed while changing only its required partner or binding. That isolates the dependency the predecessor omitted.

If there are cached, persisted, or “already satisfied” shortcuts, inspect those same dependencies there. A cache keyed only by the first record could preserve the defect after the main evaluator is repaired. This is an inspection target, not a claim that such a cache exists.

Your two independently specified synthetic consumers remain valuable evidence. The additional point is that this failure mechanism needs one-factor counterexamples, not merely consumers that differ in many dimensions.

C. Behavior pins spanning a contract change

Use the existing schema/contract history and the six findings to enumerate the affected pins. For each, establish whether it asserts:

unchanged behavior under an unchanged contract; or

behavior governed by an invariant introduced after the predecessor baseline.

Keep the former. For the latter, retain historical comparison where useful, but give the current invariant its own independently specified expected result.

Do not regenerate every golden output from the successor and call that remediation. That would replace one potentially circular oracle with another. Record the intentional divergence: the older affirmative result is no longer acceptable because the current contract requires the binding.

The finite completion criterion is that each relevant newer invariant has its source clause, required inputs, authoritative output surfaces, and an independent negative case accounted for.

D. The newly changed build boundary and the final installed bytes

The prebuilt plugin is another place where the subject of a check moved. Inspect whether bundle tests exercise the distributed prebuilt bundle after substitution, rather than only the source entry point or an independently rebuilt test bundle.

For the two substituted globals, check exact substitution, preservation of supported JSON values, absence of unresolved identifiers, and avoidance of replacing identifier-like text inside data. Existing coverage counts; this is not a request to reintroduce per-install bundling.

Finally, establish that today’s status correction is present in the exact payloads to be uploaded, not merely in source tests or a newer local build than the staged release.

This is the release-critical question connecting all four areas: does the evidence refer to the current contract and the actual published subject?

3. Consumer ordering: atomic-only is correct here

Keep the record-format bump and binding block in the atomic code-plus-data cutover. Reverting the isolated migration was correct given the old validator’s literal version restriction and closed key specification.

The additive profile keys are a different case. On your stated evidence, they are inert and can remain landed independently.

The desired compatibility matrix is:

Consumer tooling Old record New record with required binding
Old local implementation Existing pre-cutover behavior Rejects; not an independently landable data change
New installed CLI Explicit unsupported-version/migration failure, without an authoritative affirmative result Validates and evaluates under the new contract
Why I would not add a grace release

Accepting two formats in one CLI does not inherently create two authorities. A single implementation can legitimately support multiple representations.

The problem here is more specific: the old representation lacks information required by the new contract. A deprecation warning does not supply that information or justify the new affirmative status.

A compatibility path would therefore need to do one of three things: establish a genuinely semantics-preserving conversion from authoritative inputs; refuse authoritative evaluation until migration; or relax the new invariant. The first requires additional proof, the second provides little cutover advantage over a clear version error, and the third undermines the correction you just made.

There is no demonstrated need for that additional path before this first public release.

Moreover, new-CLI acceptance of old records does not solve the reverse problem: the old consumer validator still cannot accept the new record. You still need coordinated removal of that validator when adopting the new data.

Make rollback a property of the cutover unit

The reversible unit is the consumer’s code, data, invocation wiring, and tool selection together—not the record alone.

Keep the precomputed migrated record, its exact predecessor identity, its new-CLI validation evidence, and the intended atomic changes in the cutover task. Revalidate the migration’s preconditions at execution time: a record computed against yesterday’s predecessor must not silently overwrite a predecessor that changed afterward.

Before new-format writes or external publishing effects occur, rollback can restore the complete previous state. That restores the predecessor’s behavior, not proof that the newer binding invariant was enforced.

After new records or external publishing effects exist, reverting Git alone is not sufficient evidence of semantic rollback. Specify that boundary rather than promising a universal reverse migration.

Publishing and installing the CLI can precede this atomic consumer change. Availability of the new tool is not adoption of its authority. The consumer should switch as one coherent state, with gate runs prevented from mixing old tooling and newly migrated data.

4. Caller proof: yes—require effective enforcement, not mere existence

Yes. Strengthen the cutover acceptance criteria.

For every retained enforcement check, require evidence of a complete path from the relevant mandatory gate through the installed CLI to the intended consumer data, with failure propagated back to the gate.

That is more precise than “each moved module has a caller.” Helpers do not each need an independent gate entry, and deliberately retired checks should have an explicit retirement disposition rather than an artificial caller.

The distinction exposed by your discovery is:

A validator being importable, unit-tested, or available as a package script does not establish that the intended workflow enforces it against the current record.

The check also need not run redundantly in both the fast check and pre-push gate. What matters is that it runs at the mandatory decision point where the project claims its guarantee.

What the cutover should prove

For each retained check, record its intended gate, installed CLI entry point, selected consumer input, expected failure, and negative-test evidence.

Exercise that actual gate path with otherwise-valid data containing a violation attributable to the check. Observe the relevant diagnostic and nonzero gate result, then restore the input and observe success.

The proof should also detect removal of the integration edge. In a disposable tree, disconnect the gate’s invocation: the enforcement regression must fail rather than remain green because it directly calls the validator or because an unrelated test happens to fail.

Likewise, a missing installed CLI must not silently select a surviving local implementation or turn into success. Use the project’s permitted invocation mechanism; keep validation, status composition, and failure semantics in the CLI rather than adding a new consumer-side rail wrapper.

Your existing fault-injection evidence counts wherever it already exercises this exact path. The adjustment is to account for every required check and its real subject, not to repeat all testing ceremonially.

Which boundary does this block?

This distinction matters for your current phase:

Before release, verify that every required retained check is reachable through the installed CLI’s intended public command path. Add the stronger caller-proof requirement to the cutover task now. A required check that cannot be invoked through the released CLI is a release blocker.

Before consumer cutover, prove the actual consumer gates invoke those paths and propagate their failures. That is a cutover blocker.

You do not need to merge the consumer’s future gate wiring merely to publish an otherwise complete CLI.

5. Release judgment and the exact order of changes

Do not cut the release immediately. Make the bounded adjustments below, then proceed when their evidence is complete. I would not change the distribution mechanism, add bootstrap flags, collapse the matrix, or introduce legacy evaluation compatibility.

Step 1 — Close the contract-delta review and strengthen the cutover task

Complete the focused inspection in Question 2, counting today’s regression and existing independent-oracle tests as evidence.

Add the retained-check caller mapping and effective-enforcement acceptance criteria from Question 4. Confirm that the installed CLI already exposes the necessary enforcement paths. Preserve the atomic migration decision and its verified data.

This step may discover a code correction. It should not presume one, nor expand into reviewing unaffected migration work.

Exit condition: no affected current invariant is supported only by predecessor parity, and no required retained check lacks a usable installed-CLI path.

Step 2 — Freeze and validate the actual release candidate

Build/stage the candidate containing all final corrections, render both bootstraps with their real identities and payload digests, and bind the existing release record and installed-artifact evidence to those exact bytes.

Include the platform-selection assertion discussed above. Preserve your existing tests for missing checksums, modified payload plus matching modified checksums, both installer implementations, lifecycle, and consumer isolation.

Keep the bootstrap contract unchanged: the asset selects the version; the base-URL override changes transport location, not trusted identity.

Check the trust chain’s first step as well as its payload step. The documented installation path must verify bootstrap bytes against the already trusted reviewed record before executing them. Do not let the reviewed record become synonymous with whatever mutable release description happens to be displayed. GitHub permits editing release titles and notes even when the assets and tag are immutable.
GitHub Docs

Exit condition: the approved record, staged assets, rendered bootstraps, and relevant test evidence identify the same candidate. A later artifact change invalidates that approval.

Step 3 — Approve the exact disclosure set before any public push

This approval must cover more than the current working tree.

Identify the exact branch/tag refs to publish and review their reachable history, including deleted content, captured predecessor outputs, fixtures, records, and metadata whose publication needs a deliberate decision. Review the staged assets separately, including generated bundles and source maps if present.

Use an explicit push scope and inspect configuration that could broaden it. Git pushes the data needed for the selected refs; --mirror covers all refs under refs/, and automatic tag-following can add annotated tags beyond an apparently simple branch push.
Git SCM

Also inspect first-push and tag-triggered automation so it cannot publish a release ahead of approval or disclose unreviewed material through its outputs.

Do not substitute “the first remote CI run will scan it.” That run is downstream of the publication event. GitHub documents that removing sensitive history afterward does not remove copies in other people’s clones or forks.
GitHub Docs

Exit condition: disclosure approval names the exact intended publication scope. Any sanitization or history rewrite requires the affected source identity, build evidence, and approval to be rebound before pushing.

Step 4 — Push only the approved scope; stage the complete release as a draft

After disclosure approval, perform the first push under the controlled publication sequence.

Confirm that release immutability is enabled. Create a draft for the exact reviewed tag, attach all five named payloads, both bootstrap assets, the required checksums file, and the other assets required by your existing release contract. GitHub recommends attaching the complete asset set to a draft before publishing an immutable release.
GitHub Docs

Verify exact names, sizes, digests, and completeness against the reviewed record, preferably by reading back the uploaded draft bytes rather than trusting upload success alone. Reject unexplained additional assets as well as missing ones.

A draft is staging for release assets. It does not undo or defer the source disclosure that already happened at first push.

Exit condition: the uploaded draft is the reviewed release set, not merely a locally equivalent build.

Step 5 — Publish, then verify public delivery before consumer adoption

Publish only after the draft comparison passes.

Then verify the exact public download paths and bytes through the intended unauthenticated consumer route. Exercise the bootstrap verification and installation path from that delivery surface before adopting it in the real consumer.

This last check establishes public delivery, which local staging alone cannot establish. It is not permission to publish incomplete assets and repair them afterward: GitHub does not permit adding, replacing, or deleting assets on the published immutable release.
GitHub Docs

If public delivery exposes a release-content mistake, leave the consumer uncut-over and issue a corrected new release rather than weakening verification or attempting to reuse the frozen asset identity.

Final decision boundary

GO once the focused current-invariant evidence, final-artifact identity, required CLI reachability, disclosure approval, and complete draft verification are all satisfied.

HOLD on an unresolved disclosure finding, an affirmative standalone result with an unmet required binding, a required check unavailable through the installed CLI, or a mismatch between reviewed and staged bytes.

The future consumer-gate integration proof remains a cutover requirement unless it reveals a capability missing from the CLI release.

The approach is the right one. Change the release evidence and cutover acceptance conditions—not the authority model. Keep five platform names, keep the strict new record contract, and publish only the exact candidate that those strengthened checks actually examined.
