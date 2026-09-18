# Adjudication: **ADJUST — retain the shortlist; defer adoption**

The corrected report identifies a credible frontend reuse opportunity. **AgentKit and Toolkit deserve serious consideration, including coherent adoption and source ownership—not merely reference status.** The rechecked AgentKit architecture explicitly accommodates another backend and assigns durable truth to that backend rather than to React or its client controller.

However, **“conditional adopt” is ahead of the evidence**. The actual controller introduces consequential start, cancellation, completion, approval, and queue semantics that the report’s “strong match” assessment does not adequately resolve. The supported Substrate frontend boundary also remains unestablished by the inspected entry points.

My decision is therefore:

> **Make public AgentKit controller/protocol adoption, suitable AgentKit React regions, and selective Toolkit reuse the first proof candidate. Preserve Collider-defined semantics and owner-system authority, not bespoke implementations. Keep bounded frontend forks and broader owner-preserving adaptations as genuine alternatives. Do not approve dependencies, integration, or canonical adoption yet.**

The complete extraction is available in the [decision matrix: 38 recommendations and all 14 explicit stop/reversal conditions](sandbox:/mnt/data/collider-adjudication-outputs/adjudication-decision-coverage.md). The separate [new verification and pinned-source check record](sandbox:/mnt/data/collider-adjudication-outputs/adjudication-check-record.md) contains hashes, source locations, returned Git blob IDs, limitations, and exact frozen-canonical excerpts. **Neither attachment reconstructs or replaces the missing research ledger.**

## 1. Bundle verification and evidence linkage

### Integrity result

| CheckResult                         |                                                                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Supplied ZIP SHA-256                | `839a95c409eea9f54a9aace4d295224ecad88778a45f07deea1ee713b07abf53` — **matches the report**                                     |
| ZIP SHA-512                         | **Matches the report**; full value is in the check record                                                                       |
| ZIP structure and extraction safety | CRC check passed; no duplicate, absolute, traversal, or symlink entries found                                                   |
| Bundled verifier                    | **PASS:** 12 payload files, 14 total files, 9 Markdown files, 27 Open questions, 57 invariant markers, no broken relative links |
| `SHA256SUMS.txt`                    | All 13 entries matched                                                                                                          |
| Preservation                        | Extracted files were compared byte-for-byte with their ZIP entries at closeout; unchanged                                       |
| Attached corrected report           | Independently hashed as SHA-256 `2e23d0d698e5023483292828648dbfda7a08d408f88b5cc06de8bf6697f180f8`                              |

These results establish that the supplied archive corresponds to the report’s stated baseline. They do **not** establish correctness of the historical research or any runtime integration.

**The original corrected-evaluation ledger is unavailable, and its checksum was not verified.** The ZIP’s `inputs/research-source-ledger.json` identifies **BB**, not this corrected Agent Native investigation. The report’s references to an “authoritative appendix” therefore cannot carry evidentiary weight here. Its embedded historical tool citations are also not substitutes for accessible original evidence.

### Source linkage that was re-established

I used the report’s exact revisions, not refreshed branch heads:

| RepositoryRechecked revision |                                            |
| ---------------------------- | ------------------------------------------ |
| Substrate                    | `92e87a0092b091f2cef5cf8ccfdc1431e7895b8f` |
| Unified Agent API            | `117995663435eaae89c952563c250045c6aade95` |
| Collider                     | `36ed748eaf613316339fd2d518906a40093294ef` |
| Agent Native                 | `c884b5cbe616fe8674586d23c7345d9661de81f5` |

Fresh reads re-established the consequential authority-map, protocol, controller, conformance, manifest, Toolkit, and Tauri-config evidence. Selected returned blob IDs match the report’s abbreviated source-table identifiers. That verifies **those particular links**, not the completeness of the missing ledger.

One provenance correction is necessary: the bundle distinguishes Agent Native’s historical inspection anchor, `02608a48…`, from the **original report’s actual pin,** **`92e6aec8…`**. The corrected report’s comparison against the former does not establish what was introduced after the latter. The current-pin shortlist is supportable without asserting that unverified historical development sequence.

Throughout this adjudication:

- **Verified fact** means bytes, declarations, or implementation text directly inspected—not executed behavior.
- **Documented contract** means a source specifies a rule—not that its production path satisfies it.
- **Inference** means an architectural judgment drawn from those sources.
- **Untested/unresolved** means the integration, artifact, deployment, or mapping claim still needs evidence.

Only integrity checks were executed.

## 2. Decision matrix

The report’s seven strategy families remain useful, but they are not all mutually exclusive: ejection is a source-ownership choice, and a sidecar is a deployment choice.

| RecommendationDecisionBasis and qualification                           |                                            |                                                                                                                                                                                                |
| ----------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hybrid AgentKit + Toolkit + Collider composition**                    | **Priority shortlist**                     | Plausible division of responsibilities; not yet demonstrated end-to-end. Replace “conditional adoption” with “preferred proof candidate.”                                                      |
| **AgentKit protocol/headless controller**                               | **Priority proof**                         | Real behavioral machinery exists. Receipt, cancellation, completion, approval, queue, and projection mappings must be proved against the actual controller—not just its architecture document. |
| **AgentKit React regions**                                              | **Retain as an adoption option**           | Prefer public composition where it delivers the required experience. It may implement substantial Workstream behavior; it must not redefine Workstream identity.                               |
| **Toolkit presentation/editor/grid/composer/app-shell**                 | **Retain as a substantial reuse option**   | Controlled DataGrid/dashboard contracts are credible non-chat candidates. Exact imports, artifacts, behavior, and deployment remain untested.                                                  |
| **Selective Toolkit ejection**                                          | **Retain conditionally**                   | Documented and represented in source manifests. Verify the chosen unit, dependency closure, notices, and local maintenance responsibility before copying or distribution.                      |
| **Default Core as a replacement or competing authority**                | **Reject that architecture**               | Do not duplicate or displace existing execution, semantic, acceptance, or obligation authority. This is not a ban on every Core-labelled module.                                               |
| **Bounded coherent frontend fork**                                      | **Keep genuine**                           | May be better than a complicated public adapter or bespoke rewrite. Require a named mismatch, bounded owned surface, maintenance responsibility, and exit policy.                              |
| **Broader owner-preserving framework fork/adaptation**                  | **Defer selection, not eligibility**       | The report’s categorical rejection is too broad. Retained product behavior must justify backend adaptation and continuing maintenance. No such economic proof exists yet.                      |
| **Collider-native clean implementation**                                | **Keep as a fair comparator**              | Not automatically the winner when a library mismatch appears. Compare the same product scenarios and long-term ownership costs.                                                                |
| **“Retain Collider-native infrastructure”**                             | **Correct the wording**                    | Retain **Collider-defined semantics and shared infrastructure**, implemented through whichever framework, composition, or owned source proves suitable.                                        |
| **One supported Substrate frontend boundary**                           | **Accept the need; defer the exact shape** | Owner API work is common work across applicable candidates. The report’s diagram must not be mistaken for a currently available GUI contract.                                                  |
| **No second TypeScript CLI-agent backend**                              | **Accept**                                 | A frontend adapter must use the existing execution owners, not rebuild Codex/Claude execution to accommodate a UI framework.                                                                   |
| **Disposable AI Elements; common Vite transition**                      | **Accept without preservation preference** | No sunk-cost penalty against replacement. Existing tokens and tooling are reusable where useful, not protected incumbents.                                                                     |
| **Package pinning, deployment, security, artifact and licensing gates** | **Accept; presently unresolved**           | Source declarations are not published-artifact, WebView, security, performance, or distribution evidence.                                                                                      |

The package separation, public exports, and controlled Toolkit design support the shortlist. They do not support measured effort ratings or adoption approval.

## 3. Consequential corrections to the report

### A. The owner map is not a supported frontend API

The rechecked Substrate authority map is strong evidence of **intended ownership**. It explicitly assigns accepted-work identity to the receipt registry after runtime acknowledgement, and durable observation/reconciliation/terminal closeout to the supervisor. The document also explicitly says it does not grant implementation authority.

The implementation reads establish a narrower practical boundary:

- Substrate’s agent-runtime, orchestration, authority, control, and supervisor modules inspected here are `pub(crate)`.
- Collider’s pinned Tauri entrypoint initializes the application and logging but contains no application command handler connecting those operations.
- Private helper channels and observational episode types are not, by their existence, supported GUI contracts.

**Adjudication:** the proposed bridge remains a design hypothesis. This is not proof that no useful CLI or other public surface exists elsewhere; it is a finding that the complete supported GUI boundary has **not been established**.

Before owner-integrated proof, identify the exact supported entry points for submission, acceptance reconciliation, observation, replay, cancellation, approvals, capabilities, and continuity. Do not work around missing exports by reading private stores, using hidden development helpers, or attaching the UI directly to UAA.

Substrate’s manifest does pin UAA `=0.3.7`; UAA’s checked contract also distinguishes its Rust API from an explicitly pinned cross-language serialization contract. Neither fact provides the missing frontend API. Released `0.3.7` byte-for-byte correspondence with the inspected staging revision remains unverified.

### B. Start, cancellation, and completion need stronger mapping than the report proposes

Three implementation facts materially qualify the claimed lifecycle fit.

**First, submission is optimistic and the returned run becomes locally “running.”** `sendMessage()` constructs an optimistic user message, submits the previous messages plus that message, and calls `markRunStarted()` after `startRun()` returns. A complete-looking user message or locally running protocol run is not proof of Substrate acceptance—or of actual execution rather than accepted-but-queued work.

**Second, cancellation return is treated as cancellation success.** After `transport.cancelRun()` resolves, the client marks a still-nonterminal run cancelled, assigns a local completion timestamp, and stops its consumer. Therefore a transport returning after merely accepting a cancellation request can produce false terminal presentation.

**Third,** **`AgentRunHandle.completed`** **is not owner-terminal truth.** Its promise follows consumption of the subscription. That code also returns after intentional consumer teardown and approval/input interruption, and after failed or cancelled terminal events. Promise settlement is neither success nor necessarily termination of the underlying owner operation.

These are integration hazards, not proof that AgentKit is unusable.

The required mapping must distinguish:

| State/evidenceWhat must not be substituted for it |                                              |
| ------------------------------------------------- | -------------------------------------------- |
| Pending user command                              | Optimistic message appearance                |
| Owner-accepted work                               | Generated AgentKit run ID                    |
| Actually running versus accepted/queued           | Unqualified client `running` state           |
| Cancellation requested                            | Cancellation completed                       |
| Authoritative terminal outcome and time           | Client promise settlement or local timestamp |
| Unknown outcome after lost acknowledgement        | Automatic retry or inferred rejection        |

For cancellation, simply delaying the transport promise is not enough. The proof must establish that **the correct owner terminal outcome is incorporated before the controller can falsely mark cancellation**, including a completion-versus-cancel race. Otherwise a bounded change to the single controller is a legitimate alternative.

### C. Approval continuation has a contract/compatibility ambiguity

AgentKit’s architecture states that v2 approvals use terminal interrupts: the original protocol run closes and `resumeRun()` returns a **distinct replacement run**. However, the inspected client and conformance helper retain same-run continuation branches.

**Adjudication:** do not use the permissive helper as proof that any same-run Substrate mapping satisfies the intended v2 contract. Establish the selected supported lifecycle explicitly.

A viable mapping might associate several AgentKit protocol segments with one continuing owner operation. That is an **untested integration hypothesis**, not authorization to mint additional canonical Invocations or terminal receipts.

The owner boundary must bind an explicit approve/deny decision to the exact request and applicable revision, scope, actor, and operation. Test stale, expired, duplicated, conflicting, and wrong-work answers—not just the happy approval path. Inbox dismissal remains unrelated to authorization or obligation resolution.

### D. Shared Control Plane/Lane behavior is more demanding than “two views share a controller”

The frozen Foundations require shared core Workstream, Activity Projection, Block, Surface-host, Composer, selection, Sticky, and Tab Promotion infrastructure. They also expressly leave open whether different views share **Activity Item identity**, even when they share **Source Record identity**. Workstream and Qualified Session identities are not interchangeable. See the [unchanged frozen Foundations, §§5.1, 6.2, and 11.3](sandbox:/mnt/data/collider-adjudication-inputs/collider-agent-native-research/inputs/01-collider-v1-foundations.md).

AgentKit supports host-owned controller injection, thread leases, multiple thread states, and per-run consumer deduplication. Those are useful mechanisms—not a completed mapping of Collider’s federated projections.

The mapping must preserve these distinctions:

| IdentityProposed treatment—not a canonical selection |                                                                                                         |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| AgentKit thread                                      | Stable interaction/projection identity; not automatically a Workstream, Lane, or Qualified Session      |
| AgentKit run                                         | Protocol execution/continuation segment associated with exact owner work                                |
| Owner receipt                                        | Owner-accepted identity, never inferred from candidate IDs                                              |
| Qualified Session                                    | Explicit provider/runtime continuity with current binding and policy revalidation                       |
| Source Record / Activity Item                        | Source identity and projection identity remain distinct                                                 |
| AgentKit sequence/checkpoint                         | Projection replay position with an explicit relationship to owner cursors—not universal Workspace order |

A durable projection cache or ID map is permissible; a competing source of accepted-work truth is not.

**Single behavioral owner does not mean one global controller or datastore for the whole Workspace.** It means that the same accepted work must not acquire independent command, queue, approval, or optimistic-state owners merely because it appears in Control Plane, a Lane, and a promoted Tab.

There is also a concrete sequencing implication: **apply view filtering after complete per-run event admission**, or define a separately mapped projection sequence. Removing Lane-ineligible events while retaining their original sequence numbers conflicts with the checked reducer’s contiguous-sequence requirement. Gap rejection is implemented before cursor advancement, but gap repair and federated cursor mapping remain integration responsibilities.

### E. Context, queue, and identity behavior cannot be treated as neutral plumbing

The checked client passes accumulated messages to `startRun()`, automatically promotes queued messages after completion under certain conditions, and contains content-based fallback reconciliation for unmatched messages.

Accordingly:

**Context:** extract the current intent and explicitly selected references; let the appropriate owners reconstruct invocation context. Do not forward the transcript as model context merely because the interface supplies it.

**Queue:** promotion must remain an authorized owner operation with current bindings and policy. Do not let a frontend queue become a competing durable scheduler. Disable capabilities whose semantics cannot yet be supplied truthfully.

**Identity:** use exact command/receipt correlation and owner-defined idempotency. Matching identical text is not acceptance reconciliation; repeated identical prompts with different identities require explicit tests.

The report is right to emphasize capability honesty and reference re-resolution. The source distinguishes unknown, unsupported, unavailable, degraded, and available capabilities and states that metadata references are not grants. Whether the actual owner path supplies each advertised capability is still unproved.

### F. Package separation is not deployment or cost evidence

The source manifest declares AgentKit `0.2.3` and separate import subpaths, but the package itself depends on Toolkit and presentation-related packages. **A narrow runtime import graph is not the same as a narrow installation graph.**

The current Collider config contains `csp: null`. That is a verified configuration fact, not a completed security assessment. Tauri/WebView compatibility, rich rendering policy, IPC permissions, accessibility, bundle size, startup, memory, and cleanup all remain untested.

Package manifests declare MIT while the private root declares ISC. Those declarations do **not** by themselves establish either complete distribution rights or a legal incompatibility. Actual tarballs, notice coverage, source-to-artifact correspondence, and mode-specific copying/fork rights remain unresolved. The targeted package retrieval did not supply the necessary artifact evidence.

## 4. Adjudication of every explicit stop/reversal condition

The report lists seven stops and seven reversal conditions. Its qualification—**intrinsic rather than adaptational failure**—should be retained. What should change is the tendency to jump from a failed public-package path to a Collider-native implementation.

| IDReport conditionAdjudicated consequence |                                                                |                                                                                                                                                 |
| ----------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| T01                                       | Second durable execution owner required                        | **Reject that authority design**, whether framework, fork, or bespoke.                                                                          |
| T02                                       | Subscriber teardown cannot be separated from execution         | **Hard semantic gate.** Determine whether the fault is the adapter, selected controller, or owner boundary before rejecting the broader option. |
| T03                                       | Truthful receipts cannot fit `startRun`                        | **Stop that mapping.** Consider public composition or bounded controller ownership; never fabricate acceptance.                                 |
| T04                                       | One controller cannot support coordinated views                | **Stop that client architecture.** Test the same owner work across views, not merely two independently functional chats.                        |
| T05                                       | Node sidecar needed solely for the library                     | **Cost/deployment gate, not automatic veto.** Require explicit benefit versus packaging, security, lifecycle, startup, and memory cost.         |
| T06                                       | Private APIs required for core scenarios                       | **Stop the unsupported public-dependency approach.** A licensed, explicitly owned fork remains eligible.                                        |
| T07                                       | Normal customization requires a large fork                     | **Economic gate.** Compare maintained divergence with behavior retained and replacement cost; size alone does not prove bespoke is cheaper.     |
| T08                                       | No supported owner observe/replay/cancel/approval boundary     | **Defer owner-integrated conclusions across candidates.** Fixtures and native code cannot substitute for missing owner evidence.                |
| T09                                       | Start/terminal/approval cannot represent owner truth           | **Hard gate for the chosen mapping.** Include the newly identified cancellation, completion-promise, and protocol-segment hazards.              |
| T10                                       | Threads force Session-centric Workstreams                      | **Reject the forced semantic change**, not automatically every composition or fork.                                                             |
| T11                                       | Server/Node dependencies enter the real client build           | **Reassess actual imports and deployment.** Forbidden authority/privilege requirements are hard stops; process presence alone is not.           |
| T12                                       | Workstream composition repeatedly needs private implementation | **Choose deliberately among bounded fork, headless-only, presentation-only, and replacement.**                                                  |
| T13                                       | Churn makes a small wrapper unsustainable                      | **Upgrade/exit gate.** Use measured maintenance burden; pinning does not remove security and backport obligations.                              |
| T14                                       | Adequate rights/notices cannot be established                  | **Hold distribution for the affected adoption mode.** Do not convert metadata uncertainty into an asserted prohibition.                         |

## 5. Recommended shortlist and economic comparison

**First: public AgentKit behavioral stack plus suitable React regions and selective Toolkit.** This tests the report’s strongest proposition: substantial reusable behavior without transferring owner authority.

**Second: headless-first AgentKit.** Keep the controller/protocol and use different composition when the lifecycle mapping succeeds but the reference React experience does not fit shared Workstreams.

**Third: substantial Toolkit reuse with another single controller.** This is the fair fallback when AgentKit’s lifecycle translation costs exceed its demonstrated savings. It need not retain AI Elements.

**Fourth: a bounded coherent frontend fork.** Keep this available when a small number of controller or composition changes preserve substantially more useful behavior than public adaptation. A broader owner-preserving fork remains eligible but currently lacks enough retained-value evidence to rank ahead of these options.

The economic comparison should use the same product slice:

> **Compare behavior retained and bespoke work avoided against candidate translation, source divergence, upgrades/security backports, deployment overhead, and eventual replacement cost.**

Charge the Vite transition and necessary owner frontend API to all applicable candidates. Charge AgentKit-specific protocol mapping or a library-only sidecar only to the options that introduce them. Do not claim the report’s qualitative “medium/high” burdens are measured estimates.

A sidecar or fork is justified only when that comparison favors it—not because it preserves an upstream architecture, and not rejected merely because Collider’s semantics have distinctive names.

## 6. Proposed document and register changes

**No canonical amendment is needed merely to permit framework implementation.** The frozen register already allows replacement, coherent adoption, controller reuse, ejection, and forks without selecting them.

| Document/register areaProposed change |                                                                                                                                                                                                                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Research intake/reference record**  | Record the attached corrected report and its computed digest. Explicitly identify the unavailable original ledger and unchecked checksum. Distinguish `02608a48…` from original-report pin `92e6aec8…`. Reference this adjudication as a new record, not recovered evidence.   |
| **C-OQ-027**                          | Keep **Open**. Add the provisional shortlist, actual interface gaps, concrete controller hazards, differentiated stop scopes, and separate fixture/owner/platform/artifact gates. Replace adoption-sounding wording with shortlist/proof wording.                              |
| **Foundations and Glossary**          | Preserve authority and product semantics. Do not introduce canonical AgentKit thread/run identities or resolve provisional execution vocabulary. Clarify implementation freedom only where wording could imply bespoke machinery.                                              |
| **C-OQ-001–007 and C-OQ-022**         | Add the omitted history/projection consequences: Workstream/thread cardinality, shared Source Records versus Activity Items, sequence translation, snapshot cuts, replay, and bounded history. Do not select or prohibit a universal history architecture through this review. |
| **C-OQ-008, 010–012**                 | Attach exact continuity, multi-placement, protocol-segment/owner-operation, and provenance proof questions.                                                                                                                                                                    |
| **C-OQ-014–021, 024, 026**            | Record rendering trust, lifecycle, owner-action validation, configuration/capability truth, and approval/obligation requirements. Controller injection and renderer registries do not establish isolation or authorization.                                                    |
| **C-OQ-013**                          | Preserve its actual **Cordis feasibility/reference-monitoring** scope. AgentKit resemblance does not close it.                                                                                                                                                                 |
| **Workspace Shell direction**         | Proceed with implementation-neutral shared Control Plane/Lane behavior, unified Composer routing, placements/focus, Navigator preferences, and persistent awareness. Do not silently choose history storage or controller identity.                                            |
| **Execution and Binding direction**   | Base future contracts on supported owner operations and their actual call paths: acceptance/reconciliation, observation/replay, cancel/terminal, approval, capabilities, continuity, and owner-authorized mutation.                                                            |

The report’s open-question mapping is useful but incomplete, particularly around history and shared projections. Its proposal that stable shell work can proceed without closing every question is correct; that does not authorize implementation or settle unfinished Execution and Binding boundaries.

## 7. Bounded proof plan

The proof should remain **one substantial agent-interaction region and one non-chat region**, with lifecycle variants—not another broad framework investigation. The report’s two-region proposal is sound, but its evidence levels need stricter separation.

### Gate A — owner contract and mapping readiness

Before claiming owner integration, produce a field-by-field map identifying:

- exact supported entry point and production call path;
- pending command, accepted receipt, owner operation, and protocol-segment identities;
- owner cursor, projection sequence, snapshot cut, mapping version, and completeness limits;
- cancellation-request versus terminal-response semantics;
- approval identity/revision/decision and explicit Qualified Session continuity.

Unknown fields stay unknown. A private module name, serialized Rust type, or architecture ownership table cannot fill the gap. Readiness should be established for the **chosen actual path**, not inferred from broad scheduling summaries or made dependent on every unrelated runtime task.

### Gate B — fixture and actual-client proof

Use the public AgentKit controller with fixture-backed transport, not only a transport-shaped test double.

The upstream harness has different **baseline** and **full** **`createTransport`** profiles. Its transport tests are valuable, but they do not exercise every client-side behavior or establish process-restart survival. The cancellation helper, for example, drains transport events after cancellation; that does not prove the client’s own cancellation short-circuit is safe.

Add these grouped cases:

| Fixture areaRequired demonstration |                                                                                                                                                                       |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Acceptance and identity            | Pending versus accepted/queued/running; lost acknowledgement; repeated identical prompts with different IDs; exact reconciliation; no implicit resubmission           |
| Lifecycle                          | Detach versus cancel; cancellation acknowledgement versus terminal effect; completion/cancel races; local timestamps; `completed` promise after interruption/teardown |
| Approvals and queue                | Approve/deny, stale/conflicting/wrong-actor responses, exact continuation identities, current authorization on promotion                                              |
| Replay and capabilities            | Duplicate/gap/reorder cases, source-to-projection sequence mapping, retention limits, unavailable versus unsupported versus unknown                                   |
| Shared product experience          | Same owner-work fixture in Control Plane and Lane; inline/Sticky/Tab placements; one behavioral owner; unified Composer with distinct routing                         |
| Non-chat Surface                   | Substantial Toolkit DataGrid/editor/configuration interaction producing validated owner-operation intents, not direct authority                                       |

**Passing this establishes candidate expressiveness and controlled client behavior. It does not establish real receipts, authorization, provider survival, durable replay, or actual approval continuation.**

### Gate C — actual owner-integrated evidence

Repeat the same product scenario through the supported owner boundary and the declared real execution path. Capture a traceable, non-secret join:

**user intent → owner acceptance/receipt → owner work → source observations → projected events → authoritative terminal or approval records.**

Demonstrate that closing/releasing the view does not cancel provider work, reopening does not dispatch duplicate work, cancellation targets the exact operation and handles races, and approval continuation is authorized against current owner state. Test restart survival where resumability is advertised.

For the non-chat region, perform an actual owner-backed read and authorized edit, including stale-revision rejection and readback.

**A fixture behind a real endpoint remains fixture evidence.** When the real path cannot supply a feature—especially approval continuation—record that feature as unavailable or unproved rather than silently simulating it.

### Gate D — deployment, artifacts, and economics

Inspect exact package artifacts and notice/provenance coverage. Measure emitted JavaScript/CSS separately from installed dependencies, then test target WebView startup, memory, event bursts, populated-history replay, keyboard/focus behavior, CSP and IPC restrictions, and subscription/resource cleanup.

Establish comparable baselines and acceptable deltas before running the option comparison. Test the same product slice across public composition and whichever alternative addresses a demonstrated mismatch; do not build every strategy exhaustively.

---

**Bottom line:** the report is right to reopen serious frontend adoption. It is not yet entitled to conclude that AgentKit’s lifecycle is a strong integrated match, that a supported Substrate GUI boundary already exists, or that forks and sidecars lose by definition. The next defensible decision is a bounded, separately authorized proof of **the actual controller plus the actual owner boundary**, with accepted Collider semantics preserved and implementation choices genuinely open.