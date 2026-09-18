# Collider V1 Open Architecture Questions

**Status:** Living non-normative decision and research register\
**Document role:** Track unresolved architecture, research needs, candidate shapes, and decision closure\
**Depends on:** [`00-collider-v1-glossary.md`](./00-collider-v1-glossary.md), [`01-collider-v1-foundations.md`](./01-collider-v1-foundations.md)\
**Implementation authorization:** None\
**Normative authority:** None; candidate options in this document are not decisions

## 1. Purpose

This register prevents attractive but unproven implementation shapes from becoming accidental Collider V1 architecture.

An item remains open until a bounded research or design packet:

1. identifies the affected owner systems and existing implementation truth;
2. compares viable options against explicit criteria;
3. records a decision and rejected alternatives;
4. updates the glossary and foundations when their language is affected;
5. places implementation authority in a separate bounded specification or plan.

The settled baseline is narrower than the open questions. It is a non-authoritative summary of constraints established by the glossary and Foundations; if this summary conflicts with either normative document, the glossary and Foundations control:

- Collider provides a coherent Workstream experience without becoming a competing source authority.
- A durable or reconstructable Block is traceable to sufficient Source Records, durable references, or owner-system objects.
- The Control Plane and Lane views should reuse the same core Workstream components.
- The Control Plane is Lane-unfiltered; a Lane view applies an internal Lane filter and default Lane binding.
- `Lane-unfiltered` does not mean raw, unrestricted internal telemetry.
- Sticky Placement and **Open as tab** are distinct presentation behaviors.
- Collider presentation does not own Lane, execution, Handbook, MCP App, shell, or provider state.
- Resolution-reconstructed interaction is the default.
- Qualified Session Continuity remains possible, but it must be explicit and visible rather than inferred from remaining in one Workstream.
- Session History may contribute to Activity Projection and owner-scoped reconstruction, but it is not the Workspace-wide canonical history. Default navigation is not Session-centric; users may prioritize a dedicated Sessions destination without making navigation imply continuation.
- Resuming a Qualified Session does not silently preserve Handbook Scope or Resolution, Lane binding, Substrate policy, Capability Grants, permissions, provider availability, or model identity and configuration without current validation.
- Context and capability mediation are not Isolation Boundaries.
- Untrusted executable extension code requires genuine isolation before it can execute.
- Cleanup and reversion claims are bounded to effects the host can observe, attribute, and control; a Revertible Contribution requires a declared recovery criterion, and compensation is not exact rollback.
- Spatiotemporal Composability is a dynamic-extension design objective, not a guarantee already provided by Collider.
- Temporal Composability is bounded to mediated and attributable Extension Contributions; Spatial Composability relies on declared requirements and provisions plus reactive lifecycle behavior.
- Extension capability access should use owner-mediated and attributable Capabilities where practical, without creating a cross-system source of truth.
- Extension Context is distinct from Handbook Scope, Resolution, and Projection; Substrate Context Packs and model-visible context; Activity Projections; Workstreams; and security Isolation Boundaries.
- Cross-process Capabilities must represent asynchronous and failure semantics honestly rather than pretending to be infallible synchronous local calls.
- Collider-owned layout declares valid Extension Points, while Surfaces remain the protocol-neutral typed application/view abstraction.
- UI Contributions remain distinct from inline, Sticky, Tab, overlay, and Inspector presentation behavior, and UI contribution permission does not imply runtime or semantic authority.
- `Extension Point` is the canonical public architecture term; `Slot` remains a non-canonical implementation or reference term unless separately adopted.
- Host-recognized Projection Definitions assemble eligible Source Records into stable Activity Items; one Activity Item may fold several correlated records or revisions.
- Activity Item Business Identity is mandatory and independent of visual list position, while exact identity sharing across Workstream projections remains open.
- Projection assembly should be deterministic and replayable where source systems permit it; projection-local presentation order does not imply one authoritative total Source Record order; and projection-specific indexes do not become source authority.
- Purely local Collider presentation changes are Presentation Actions rather than Substrate-owned Invocations.
- Work Items remain discoverable, while a populated dedicated `Work` Navigator section is secondary to the first coherent V1 slice.
- Collider's one-word naming rule applies only to its highest-level default navigator labels, not descendant labels, user-customized names, user-promoted entries, or canonical architectural terms.
- Navigator Items, Groups, and Layout are presentation concepts; users may rename groups, change displayed membership and ordering, and show eligible items ungrouped without changing owner identity, permissions, capability enablement, or execution.
- The expanded destination map includes Inbox, configuration/policy, Agent Profiles, Agent Harnesses, Environments, workspace capability/integration enablement, credential bindings, diagnostics, and actual Qualified Sessions; it is not a fixed top-level tree or an all-at-once first-slice requirement.
- Environment Dependency configuration feeds existing Substrate World dependency tooling; it is not a new Collider dependency engine or a synonym for package or Extension capability dependencies.
- Native harness, Substrate integration, and Collider presentation settings may share a Surface without sharing authority.
- Basic Navigator Layout customization is required within V1, distinct from a deferred general-purpose layout builder; hiding destinations must not remove all execution awareness or access to cancellation and recovery.
- Inbox read/dismiss state does not implicitly resolve owner-system obligations, approvals, gates, or execution state.

### 1.1 Research intake — BB and frontend-foundation evaluation (2026-09-16)

This intake extends research scope only. It does not adopt a dependency, revise the glossary or Foundations, select a Workspace-history architecture, or authorize an implementation spike. The preceding baseline and existing question decisions remain controlling within their stated authority.

**Evaluation constraints supplied by the product owner:** the target frontend is Tauri + React + TypeScript + Vite. Substrate, Handbook, and the Unified Agent API are the existing operational and semantic foundation to inspect, not missing infrastructure to recreate for a library. Existing AI Elements components are provisional and may be discarded entirely; their earlier use to refine ds-skills has already delivered value. Do not treat preservation of those components, their APIs, or their past curation cost as a decision criterion. Evaluate useful tooling and all remaining integration work prospectively.

A reusable framework or controller may implement an accepted Collider frontend role. Do not require a second custom controller, projection store, queue, or approval owner solely because the role has a Collider name. Equally, do not silently replace owner-system authority to accommodate a vendor. Any proposed semantic amendment requires separate adjudication.

### 1.2 Research sources and evidence status

The following exact Library names identify supporting inputs. Names identify documents, not new canonical terms. Existing research is non-normative; source inspection, documentation claims, upstream-reported tests, and locally executed validation must remain distinguishable. Retrieve the named inputs in the evaluation session rather than assume a historical chat download link grants access.

| Input | Exact Library name or source | Evidence status and permitted use |
|---|---|---|
| Accepted Collider terms and direction | `00-collider-v1-glossary.md`; `01-collider-v1-foundations.md` | Use their latest verified Library versions, not older `(1)` copies or stale mounted copies. The current register adds questions, not new authority. |
| DeepSeek/Cordis research | `deep-seek-harness-deep-research-report.md` | Supporting composition and architecture research; not a dependency, terminology, or proof authority. |
| BB research | `bb-deepseek-collider-architecture-report.md` | September 15, 2026 report pinned to `41e7132e817306e43f68f91bde0a6b9f79af99de`. Provides hypotheses and failure cases; no build, test suite, or live provider workflow was executed by that review. |
| BB evidence ledger | `research-source-ledger.json` | The ledger identifies `get-bb/bb` and the same revision. Verify that identity rather than selecting an unrelated file with a generic ledger name. |
| Earlier Agent Native evaluation | `Agent-Native Architectural Evaluation for Collider and Substrate` | Native Deep Research report, pinned to `92e6aec8b26b68e870384009af2a4d40cc68e41d`. Preserve source observations; reassess fit/adoption conclusions against actual Substrate/UAA and the disposable-UI clarification. This is a report title, not an assumed Markdown filename. |
| Corrected evaluation instructions | `agent-native-collider-research-prompt-v2.md` | Active research brief. Supersedes earlier `agent-native-collider-grounded-research-prompt.md` and earlier reuse-prompt variants for this task. Includes the implementation-grounded context and disposable-UI instruction; not a completed evaluation. |
| Corrected Agent Native report | `Corrected Agent Native Evaluation for Collider` | Completed Deep Research report; independently hashed during adjudication as SHA-256 `2e23d0d698e5023483292828648dbfda7a08d408f88b5cc06de8bf6697f180f8`. Its original machine-readable evidence ledger is unavailable and its claimed ledger digest was not verified; decision-relevant source links were selectively rechecked in the adjudication. |
| Adjudication decision coverage | `adjudication-decision-coverage.md` | Advisory extraction of 38 material recommendations and 14 stop/reversal conditions. Selects a proof direction, not adoption or implementation. |
| Adjudication check record | `adjudication-check-record.md` | New verification record for the bounded adjudication. Re-establishes selected pinned source links and bundle integrity; does not reconstruct or replace the missing original research ledger. |
| Owner-boundary/proof specification | `agentkit-owner-boundary-proof-spec.md` | Non-normative proof-planning contract produced after adjudication. Defines evidence gates and mapping obligations; does not authorize implementation or select a dependency. |

**Live implementation entry points:** [Substrate implementation branch](https://github.com/atomize-hq/substrate/tree/feat/runtime-refactor-e3-ac1-projection-authority-correction), its [runtime-refactor control pack](https://github.com/atomize-hq/substrate/tree/feat/runtime-refactor-e3-ac1-projection-authority-correction/llm-last-mile/runtime-refactor), [Unified Agent API staging](https://github.com/atomize-hq/unified-agent-api/tree/staging), and [Collider](https://github.com/atomize-hq/collider). Follow current owner contracts and code; resolve branch heads once per evaluation and pin decisive reads. Distinguish canonical target documents, landed implementation, compatibility paths, non-authoritative indexes, and unexecuted proof claims.

**Candidate and comparison entry points:** [Agent Native repository](https://github.com/BuilderIO/agent-native), [website](https://www.agent-native.com/), [documentation](https://www.agent-native.com/docs/), and [BB repository](https://github.com/get-bb/bb). Repo source, published artifacts, and generated repository summaries may differ. Verify important claims against pinned primary sources; neither an attractive catalog nor a prior favorable recommendation selects the outcome.

Separate changes caused by corrected project understanding, upstream revision changes, and new execution evidence. The earlier implementation-grounded reassessment was conversation guidance; the active v2 brief carries its scope correction without inventing a separately saved report.

### 1.3 Adjudication intake — Agent Native frontend proof direction (2026-09-16)

The corrected evaluation and bounded adjudication are complete as advisory evidence. They do **not** close `C-OQ-027`, authorize a dependency, authorize a fork, authorize a proof branch, or amend the glossary or Foundations. The accepted adjudication disposition is **ADJUST — retain the shortlist; defer adoption**.

The provisional shortlist for a separately authorized proof is:

1. public AgentKit controller/protocol plus suitable React regions, selective Toolkit, and one owner-routed bridge while preserving Collider-defined Workstream/Control Plane/Lane semantics;
2. a headless-first AgentKit variant when controller/protocol reuse proves sound but reference React composition does not;
3. substantial Toolkit reuse with another single controller when AgentKit lifecycle translation costs exceed demonstrated value;
4. a bounded coherent frontend fork when a small number of owned controller/composition changes preserve more useful behavior than a translation-heavy public adapter;
5. a broader owner-preserving framework/fork remains eligible but lower priority until retained-value and maintenance evidence justifies it.

The adjudication rejects **authority-displacing** Core adoption and a duplicate TypeScript CLI-agent backend. It does **not** reject every Core-labelled import, sidecar, fork, or source-owned path by name. Accepted Collider semantics constrain outcomes, but they do not require bespoke Collider implementations.

The most consequential unproved mappings are: pending command versus owner-accepted receipt; accepted/queued/running state; cancellation request versus authoritative terminal effect; client subscription completion versus owner terminal truth; approval protocol segments versus exact owner operations; library thread/run identities versus Workstream, Qualified Session, Invocation, Receipt, Source Record, and Activity Item identities; transcript state versus reconstructed model context; automatic queue promotion versus owner authorization; and AgentKit sequence/checkpoint state versus owner cursors and projection sequences.

Evidence must remain staged:

- **Contract gate:** establish exact supported owner entrypoints, call paths, schemas, policy checks, and field-by-field identity/cursor/approval/cancel mappings.
- **Fixture/client proof:** exercise the actual public AgentKit controller with controlled fixtures and coordinated Control Plane/Lane/placement views. This proves candidate expressiveness and client behavior only.
- **Owner-integrated proof:** repeat the same product scenario through the supported owner boundary and real declared execution path, preserving a traceable join from user intent through owner acceptance and terminal/approval truth.
- **Deployment/artifact/economics proof:** verify exact package artifacts and rights/notices, Tauri/Vite/CSP/a11y behavior, dependency and emitted bundle costs, startup/memory/replay/cleanup behavior, and measured maintenance tradeoffs.

The original corrected-evaluation machine-readable ledger remains unavailable. Its absence is an evidence limitation, not a reason to reconstruct a substitute or to erase the corrected report. The adjudication check record is new evidence and MUST NOT be represented as the recovered ledger.

## 2. Status Vocabulary

| Status | Meaning |
|---|---|
| **Open** | The problem and decision boundary are known; research or comparison is still required. |
| **Researching** | A bounded research packet is actively gathering implementation and ecosystem truth. |
| **Decision-ready** | Viable options and consequences are sufficiently documented for an explicit decision. |
| **Resolved** | An accepted decision exists and affected authority documents have been updated. |
| **Deferred** | The decision is intentionally postponed and the current architecture preserves more than one viable path. |

## 3. Open Decision Register

### C-OQ-001 — Workspace history and Workstream projection architecture

**Status:** Open\
**Decision:** Determine whether coherent Workspace activity is backed by:

- one canonical Workspace event history;
- federated owner-system histories plus a Workspace activity index;
- query-time federation;
- a hybrid using references, selected snapshots, summaries, and materialized projection items.

**Must evaluate:** source authority, duplication, cross-source ordering, causal relationships, Activity Assembler placement, projection-definition registration boundaries, materialized Activity Items versus indexes versus query-time computation, paging, replay, resynchronization, gap repair, reconstruction, offline behavior, snapshots, retention, compaction, performance, privacy, provider availability, and migration cost. Distinguish authoritative owner histories from view caches and retained audit evidence; compare immutable snapshots with read-boundary tokens over mutable history, and evaluate the recovery contract of each source rather than assuming one universal event log; owner-to-projection cursor mapping, projection version, snapshot cut, source completeness, and the distinction between complete source admission and view filtering; bounded library thread snapshots must not become a universal Workspace-history decision.

**Current constraint:** Neither the glossary nor foundations assumes one canonical event store. Projection machinery may own derived indexes and fold state but does not become source authority. Qualified Session Histories may participate as owner-scoped source histories without resolving this Workspace-wide choice.

### C-OQ-002 — Workstream identity and persistence

**Status:** Open\
**Decision:** Determine whether a Workstream is persisted as an independent entity, a durable projection definition, a materialized index, a reconstructable interaction context, or a hybrid.

**Must evaluate:** stable Workstream identity; whether Projection Definitions are part of Workstream identity or separately registered; branching; archival; reopening; Lane rebinding; association with zero, one, or several Qualified Sessions over time; whether one Qualified Session may appear through several Workstream projections; which Presentation Actions are retained as Collider Source Records, restored as presentation state, or intentionally omitted; selection provenance; deletion semantics; definition-version changes; and whether multiple UI placements share one Workstream identity. Evaluate whether a library controller can implement the client-side Workstream projection role without creating duplicate message, queue, approval, or optimistic-state ownership; keep library thread identity distinct from durable Substrate orchestration authority and provider-native continuity.

### C-OQ-003 — Source Record and Activity Item identity, ordering, and causality

**Status:** Open\
**Decision:** Define how records from Substrate, Handbook, MCP Apps, shell or PTY facilities, and Collider receive stable references; correlate into Activity Item Business Identity; and are ordered, located, or causally related inside an Activity Projection.

**Must evaluate:** owner-supplied versus derived Business Identity; correlation and fold rules; canonical owner-system and cross-source causal relationships where knowable; total versus partial source ordering; projection-local deterministic presentation ordering; tie-breaking; whether a chosen linearization is durable or recomputed; whether different projections may validly linearize the same concurrent records differently; predecessor or projected-location indexes; clock skew; concurrent Lane activity; parent/child relationships; deduplication; retries; revisions; tombstones; late-arriving records; cross-source identity collisions; and whether Control Plane, Lane, or other projections share Activity Item identity or only Source Record identity. Locate native harness event normalization in the existing Substrate/UAA integration versus target-view Activity Assembly; examine duplicate terminal events, reused provider identifiers, late child activity, and preservation of unknown, absent, or incomparable provider metrics.

### C-OQ-004 — Block backing and reconstruction contract

**Status:** Open\
**Decision:** Define the minimum durable information required to explain, reopen, or reconstruct an Activity Item, Block, or Surface.

**Must evaluate:** one-to-one versus composite backing; inspectable fold provenance; Projection Definition identity and version; materialized, indexed, or computed Activity Items; live provider objects versus snapshots; renderer- and definition-version changes; projection invalidation; unavailable providers or source objects; partial reconstruction; stale references; Presentation Action retention and provenance; selected text or projected-node provenance; and which Blocks may remain intentionally ephemeral. Evaluate whether rich Activity Items need bounded declarative fallback presentation when an executable renderer or source provider disappears; distinguish retained explanation from authoritative source state and from a fully reconstructable interactive Surface.

### C-OQ-005 — Shell and PTY capture boundary

**Status:** Open\
**Decision:** Determine which portions of shell and PTY activity become durable Source Records or structured summaries.

**Must evaluate:** command identity, working directory, environment, process and exit status, raw byte streams, ANSI state, interactive applications, `tail` or long-running output, storage volume, privacy and redaction, replay, pagination, compaction, and how large streams become stable summaries, references, or structured test and build Activity Items without treating every byte as a business object. Test how interrupted, buffered, and long-running streams retain truthful output and status through pagination or reconnect without causing replay of the underlying shell operation; library thread/controller identity versus Workstream identity and durable Substrate orchestration authority; one accepted work item must not acquire duplicate command, queue, approval, or optimistic-state owners merely because it appears in several views; exact user-command-to-owner-receipt correlation; lost-acknowledgement reconciliation; repeated identical content with different request identities; source-cursor to projection-sequence mapping; and filtering after complete source admission rather than fabricating sequence gaps; portable fallback or reconstruction behavior when a richer renderer is missing or incompatible, without promoting retained presentation metadata into source authority.

**Current constraint:** Normal raw shell and PTY semantics must remain truthful; every terminal byte need not become an individual Workspace activity item.

### C-OQ-006 — MCP App state, revision, and lifecycle integration

**Status:** Open\
**Decision:** Determine how Collider projects MCP App objects and events without copying or competing with provider-owned state.

**Must evaluate:** object identity; revision correlation and folding into Activity Items; snapshots; refresh; provider disappearance or unavailable source objects; partial reconstruction; permissions; credentials; caching; offline reconstruction; retention; app and Projection Definition upgrades; and whether an app supplies compact, inline, Sticky, and Tab-specific Surface representations. Evaluate portable identity, revision-aware fallback, and the separation of widget presentation from validated owner actions when an MCP App or its renderer is unavailable.

### C-OQ-007 — Control Plane and Lane projection-association rules

**Status:** Open\
**Decision:** Define which Activity Items appear in the Lane-unfiltered Control Plane and each Lane-filtered Workstream.

**Must evaluate:** Workspace-level Invocations later dispatched to a Lane; cross-Lane orchestration; activity associated with several Lanes or Scopes; shared Handbook or MCP App Source Records; view-specific correlation, folding, ordering, visibility, and projected location; historical Lane rebinding; summaries; internal-detail disclosure; and whether Control Plane and Lane views share Activity Item Business Identity or only Source Record identity. Compare coordinated Control Plane and Lane views under a shared client controller or another projection arrangement without assuming one library thread equals one Lane, Workstream, or Qualified Session; the same accepted owner work appearing coherently in Control Plane and Lane projections under one behavioral owner; complete per-run event admission before Lane filtering or an explicit projection-sequence remap; and coordinated inline, Sticky, and Tab placements without duplicated command or approval ownership.

**Current direction:** Control Plane and Lane views reuse the same core Workstream Surface and differ primarily by internal projection and binding posture. They may assemble some of the same Source Records differently.

### C-OQ-008 — Explicit Qualified Session Continuity

**Status:** Open\
**Decision:** Define how users intentionally create, resume, reuse, or continue an owner-specific model-provider, runtime, agent-harness, shell, or PTY Qualified Session while resolution-reconstructed behavior remains the default.

**Must evaluate:** one-Invocation continuation versus persistent continuity mode; Qualified Session creation; explicit resume handles; provider-specific identity and guarantees; expiration, recovery, disconnection, and reconnection; context compaction; provider or model changes; Handbook Scope or Resolution changes; Lane rebinding; Substrate policy, Capability Grant, permission, trust, and compatibility revalidation; termination; branching or cloning; Qualified-Session-to-Workstream cardinality; whether a Qualified Session may span several Lanes; how Qualified-Session-associated activity appears in the Lane-unfiltered Control Plane and Lane-filtered views; private, temporary, or hidden Qualified Sessions; Session History pagination, retention, privacy, redaction, deletion, and reconstruction; interaction with Projection Definitions, Activity Assemblers, Activity Items, and Context Records; the dedicated Sessions destination and its Session-oriented Surface; grouped, conditional, prominent, or user-selected root placement; the distinction between browsing Session resources and explicitly invoking continuation; coordination with Navigator Layout preferences under C-OQ-025; visible indication that continuity is active; fallback when a provider cannot resume; and the exact state promised by `continue`. Map library threads, provider-native resume resources, and Substrate durable orchestration sessions separately; inspect the actual UAA and Substrate semantics for detach versus cancellation and reconnect versus resubmission before assessing a candidate transport; library thread/run identities and protocol continuation segments versus provider Qualified Session identity and Substrate durable orchestration identity; approval continuation must not silently create false owner Invocations, Receipts, or Session continuation.

**Current constraints:** a dedicated Sessions destination is accepted product direction, while its delivery details remain open; users may prioritize it without changing the resolution-reconstructed default or automatically resuming a Session; remaining in one Workstream does not imply Session Continuity; a Workstream may span zero, one, or several Qualified Sessions; one Qualified Session's activity may appear in several Workstream projections where policy permits; Session History is one owner-scoped source history rather than the Workspace-wide canonical history; and resumption does not make a Qualified Session authoritative for Handbook semantics, Lane placement, Substrate policy, Collider Workstream identity, or unvalidated policy, capability, permission, provider, or model state. No universal cross-provider Session protocol, provider-specific resume API, automatic continuation rule, final Session UI, exact persistence schema, Activity Projection storage choice, or compaction algorithm is selected.

### C-OQ-009 — Sticky Stack behavior

**Status:** Open\
**Decision:** Define Sticky Stack capacity, ordering, persistence, compaction, and controls.

**Must evaluate:** likely two-or-three-item visible limit, compact summaries, manual ordering, per-Workstream versus per-placement state, restoration after restart, Surface updates, duplicate Activity Items, accessibility, and narrow-window behavior.

**Current constraint:** Making an item Sticky preserves its chronological placement and does not make it Sticky in every other projection.

### C-OQ-010 — Tab Promotion and Surface identity

**Status:** Open\
**Decision:** Determine whether `Open as tab` creates another placement of the same Surface identity or opens a provider-declared canonical expanded Surface.

**Must evaluate:** state sharing, concurrent interaction in inline and Tab placements, focus, close behavior, restoration, origin anchors, navigation, provider capabilities, and stale or incompatible views.

### C-OQ-011 — Execution-instance and agent-topology model

**Status:** Open\
**Decision:** Resolve or replace the provisional glossary vocabulary for Run, Root Run, Child Run, Run Node, Run Tree, Agent, Subagent, and Subtask.

**Must evaluate:** actual Substrate and harness models, orchestration-only versus environment-touching execution, Lane binding, nested and parallel work, cancellation, retries, user-meaningful versus internal activity, persistence, and cross-provider normalization. Start from current Substrate authority, dispatch, supervision, receipt, and runtime contracts plus the UAA version and features Substrate actually consumes; distinguish accepted work, process exit, event-stream finality, and owner-authoritative terminal closeout without freezing the provisional execution vocabulary; same-state multi-placement under one behavioral owner, including whether a shared controller is sufficient without forcing Surface, Workstream, or Activity Item identity equivalence; pending request, owner-accepted receipt, accepted-but-queued, actually running, cancellation-requested, authoritative terminal, and protocol-segment identities; library run completion or local timestamps must not define owner execution truth.

**Current constraint:** UI presentation never owns execution lifetime, and internal machinery should be progressively disclosed beneath user-meaningful activity.

### C-OQ-012 — Context lineage and provenance retention

**Status:** Open\
**Decision:** Define the stable identities and retention needed to support future inspection of Resolved, Injected, Acquired, and Produced material.

**Must evaluate:** model-visible exposure, file and line references, artifact snapshots, tool reads, context compaction, redaction, privacy, Evidence admission, Source Record references, and storage cost. Trace selected references through owner Resolution, admitted revisions, assembled Context Packs, delivered context, and provider acceptance; evaluate whether reusable context UI can display these distinctions without inventing missing telemetry or semantic authority; exact joins from user intent to owner acceptance, Source Records, projected events, Context Records, approval records, and terminal outcomes; transcript arrays and library metadata remain projection inputs rather than model-context or provenance authority.

**Current constraint:** Deferring the Inspector must not require discarding the records needed to build truthful context inspection later.

### C-OQ-013 — Cordis feasibility and reference monitoring

**Status:** Open\
**Decision:** Determine whether Cordis merits a bounded prototype or integration spike, should remain a reference-only implementation study, or should be rejected for Collider or Substrate use.

**Must evaluate:** TypeScript and runtime fit with Rust, Tauri, Substrate, Handbook, and Collider; whether any plausible use is limited to trusted client-side composition; whether a Rust-native analogue would fit the architecture better; dependency footprint, upgrade burden, maturity, maintenance, coupling, and long-term compatibility risk; the evidence and criteria that would justify embedding Cordis later; explicit rejection criteria; and how to monitor DeepSeek Harness while it remains immature or rapidly changing without treating it as canonical authority.

**Current constraint:** Cordis is not a selected dependency or the canonical Collider or Substrate extension substrate. Any prototype or integration spike requires separate bounded authorization and MUST preserve the existing Handbook, Substrate, and Collider authority boundaries and Collider's protocol-neutral Surface model.

### C-OQ-014 — Extension trust classes, isolation, and capability security

**Status:** Open\

**Decision:** Define the executable-extension trust classifications, determine which classes may run in process, and establish the Isolation Boundary and capability-security requirements for every other class.

**Must evaluate:** first-party, third-party, locally authored, user-installed, and remotely sourced code, including which classes may qualify as trusted; separate-process, WASM, sandboxed-runtime, and other isolation candidates without assuming one outcome; filesystem, network, process, credential, clipboard, browser, webview, Tauri, and host-object mediation; which authority may issue, enforce, delegate, attenuate, revoke, and audit each Capability Grant; prevention of consumer or provider self-authorization outside an owner or delegated authority role; secret injection, use, redaction, and lifetime; provider identity, package provenance, signing, update channels, rollback, and supply-chain trust; host/client split extensions and the trust boundary between their halves; crash containment and recovery after non-graceful termination; and whether UI-only contribution can remain structurally separate from host runtime execution. Evaluate the actual privileges exercised by candidate browser, Tauri, sidecar, host-process, and agent-authored UI paths; distinguish admitted trusted code from untrusted code and provider-package identity from authority, rather than relying on sandbox or lifecycle labels.

**Current constraint:** Context or capability mediation is not a sandbox. Untrusted executable extensions are not authorized to execute with the ambient authority of a trusted Collider, Substrate, or Handbook process by default. Surface rendering permission does not imply filesystem, process, network, credential, semantic, or other host authority. No concrete isolation technology is selected.

### C-OQ-015 — External effects, cleanup guarantees, and reversibility claims

**Status:** Open\

**Decision:** Define effect classes and the truthful cleanup, unloadability, recovery, and reversibility claims allowed for each extension trust class and host boundary.

**Must evaluate:** Mediated Effects versus External Effects; which registrations and resources can be observed, attributed, revoked, or unwound by the host; the declared recovery criterion for each claimable contribution class; exact equality versus declared observational equivalence; which observations and invariants are authoritative; which owner or policy authority defines the criterion; whether unrelated state must remain unchanged; how the criterion is evaluated after interleaved or ordering-sensitive contributions; what evidence proves it; what happens when it is untestable or unverifiable; transaction and copy-on-write candidates; Compensating Actions; idempotent cleanup and retry; irreversible or already-observed emissions; crash-time cleanup when graceful disposal does not run; orphaned resources and partial failure; audit evidence; and the exact user- and developer-facing claims permitted for unload, update, deactivation, rollback, compensation, and recovery. Compare guarantees by failure phase and component class; distinguish rollback of a registration set from reversal of candidate storage writes or external effects, and distinguish releasing a subscriber from cancelling owner-managed work.

**Current constraint:** Automatic tracking, cleanup, or reversion may be claimed only for effects within an observed and controlled mediation boundary. A Compensating Action is not an exact inverse, and the architecture MUST NOT claim complete unload or rollback when untracked External Effects may remain.

### C-OQ-016 — Extension contribution lifecycle and temporal composability

**Status:** Open\

**Decision:** Define the atomic unit and lifecycle semantics of an Extension Contribution, and determine what implementation evidence would justify a bounded Temporal Composability claim for a specific extension class.

**Must evaluate:** Extension and contribution granularity; local registration ownership; host-tracked disposers, inverses, and recovery operations; declared recovery criteria and their owner; exact equality versus observational equivalence; composition and ordering of cleanup; evaluation after interleaved contributions; preservation of unrelated state; asynchronous teardown; partial activation failure; failed update and update rollback; crash recovery when graceful cleanup does not run; configuration reconciliation; preservation of unaffected Extensions and host state; hot replacement across Rust, Tauri, React, Substrate, Handbook, and provider processes; External Effect and non-revertible-effect classification; idempotency and retry; conflicts or ordering-sensitive contributions; untestable or unverifiable criteria; and the tests, receipts, fault injection, or other evidence needed to substantiate a Temporal Composability claim. Investigate generation ownership, stale handles, candidate activation failure, bounded asynchronous teardown, and non-graceful failure; require contribution-class evidence rather than infer transactional hot replacement from a successful reload demonstration.

**Current constraint:** Temporal Composability is a design objective only. Any claim is limited to mediated, attributable contributions within an explicit system boundary and valid cleanup, recovery, or inverse behavior. A Compensating Action is not exact rollback, and composability does not replace trust or Isolation Boundaries.

### C-OQ-017 — Extension dependency topology and spatial composability

**Status:** Open\

**Decision:** Define the abstract required/provided dependency model and reactive lifecycle behavior needed to evaluate Spatial Composability without selecting a concrete dependency-resolution or capability-resolution interface.

**Must evaluate:** dependency and provider identity; activation only when requirements are satisfied; provider disappearance or material change; deactivation, inactivity, and reactivation behavior; dependent teardown before provider withdrawal when cleanup requires the provider; inspectable dependency topology; configuration reconciliation; extension and component granularity; dependency cycles and mutually dependent Extensions; cycle-breaking architecture; provider conflicts; independence, commutativity, and ordering-sensitive contributions; compatibility evolution; and the evidence or validation required to claim Spatial or Spatiotemporal Composability for a particular extension class and bounded system. Evaluate provider withdrawal, dependent teardown, capability compatibility changes, and mixed frontend/host generations under the existing bounded composability objective; a library lifecycle mechanism is not proof of the objective.

**Current constraint:** No concrete dependency-resolution interface, package format, hot-replacement mechanism, or formal guarantee is selected. Spatial Composability remains subject to the existing authority, trust, isolation, mediation, and External Effect constraints.

### C-OQ-018 — Extension Context and capability mediation model

**Status:** Open\

**Decision:** Define the bounded Extension Context and capability-composition model without creating a cross-system authority object or selecting a concrete runtime or protocol.

**Must evaluate:** typed capability keys, interface schemas, namespacing, compatibility, and versioning; capability identity and provider identity; Required Capability, Provided Capability, and Dependency Declaration representation; which owner or delegated authority issues and enforces Capability Grants for each capability seam; prevention of consumer or provider self-authorization outside that role; multiple providers, selection, multiplexing, replacement, and failover; hierarchical or derived Extension Contexts; Workspace, Lane, Workstream, Qualified Session, policy, trust, audit, instrumentation, and extension-instance specialization; Extension Context Mediation, Capability Interception, attenuation, approval, revocation, attribution, and audit metadata; inspectable dependency topology; relationship to Substrate policy without redefining it; relationship to Handbook Contracts, Scope, Resolution, and Projection without claiming equivalence; whether the Cordis evaluation in C-OQ-013 has value only for trusted client-side composition; and whether a Rust-native capability/context substrate is required for owner-aligned composition across Substrate and Handbook. Distinguish declared support, negotiated support, policy authorization, operational readiness, and unknown capability state; identify which owner supplies each fact and whether candidate adapters preserve it.

**Current constraint:** An Extension Context is an extension-facing capability environment, not Handbook Resolution, a Context Pack, an Activity Projection, a Workstream, an execution environment, a security sandbox, or a new source of truth. Required and Provided Capabilities remain owner-mediated, and providers retain authority for the state and services they expose. No concrete capability schema, key system, provider-selection algorithm, Cordis dependency, or Rust-native implementation is selected.

### C-OQ-019 — Local and cross-process capability contract semantics

**Status:** Open\

**Decision:** Define truthful local and cross-process capability contracts and bridge behavior across Rust, Tauri, React, Substrate, Handbook, Collider, and provider processes.

**Must evaluate:** which Capabilities may be synchronous and local; which MUST be explicitly asynchronous; serialization and compatibility boundaries; provider discovery and loss; error, cancellation, deadline, timeout, retry, idempotency, backpressure, and partial-failure semantics; replacement and failover; host/client split Extensions; attribution across process boundaries; trust, Capability Grant, and Isolation Boundary enforcement at the bridge; lifecycle coordination when either side crashes or disconnects; and how developer ergonomics can remain consistent without hiding remote execution or failure. Map candidate frontend transports to supported Substrate ingress and observation boundaries, not private Rust internals or a second CLI-agent backend; examine request abort, subscription release, explicit cancellation, disconnect, retry/idempotency, and conformance-test fidelity separately.

**Current constraint:** A remote Capability MUST NOT masquerade as an infallible synchronous local call. Capability bridges do not transfer owner authority or replace trust classification and Isolation Boundaries. No transport, RPC framework, serialization schema, or bridge topology is selected.

### C-OQ-020 — UI Extension Point declaration and contribution policy

**Status:** Open\

**Decision:** Define the host-owned Extension Point declaration and UI Contribution composition policy without selecting concrete React APIs, a package manifest, or an extension runtime.

**Must evaluate:** navigator contribution identity and admission; host-default placement versus user-selected group, order, visibility, or ungrouped placement; preservation of hidden-item preferences across provider reload; highest-level default labels versus unrestricted descendant and user naming; coordination with C-OQ-025; the exact Extension Point Declaration schema; identity, namespacing, and compatibility; whether `Slot` is useful only as an implementation term; accepted contribution kinds; zero, one, list, keyed, or other multiplicity; ordering and priority; owner-defined fallback entries; election, replacement, and conflict resolution; UI Contribution Scope across Workspace, Lane, Workstream, Qualified Session, Surface, and provider boundaries; contribution permissions and their relationship to Capability Grants; whether authorized Extensions may declare child Extension Points; and how Extension Points relate to inline, Sticky, Tab, overlay, and Inspector presentation locations without becoming those placements. Evaluate both controlled presentation components and coherent framework-supplied interaction regions through owner-approved contributions; no existing AI Elements component API is a preservation constraint, and a library may implement an accepted frontend role rather than wrap a duplicate bespoke implementation.

**Current constraint:** `Extension Point` is the canonical public architecture term. Collider-owned layout declares valid points and retains composition authority while users control supported Navigator Layout organization; a contribution cannot override user preferences or obtain runtime permissions by being displayed. Surfaces remain the typed rendered abstraction, placements remain separate, and permission to contribute UI does not imply runtime, filesystem, process, network, credential, or semantic authority. No declaration schema, registry API, multiplicity model, election algorithm, or manifest format is selected.

### C-OQ-021 — UI contribution rendering, nesting, failure, and restoration boundaries

**Status:** Open\

**Decision:** Define how contributed UI crosses client and host boundaries, survives or fails safely, and is reconstructed without moving authoritative state into Collider presentation.

**Must evaluate:** navigator item disappearance, user-hidden state, provider return, stale shortcuts, and default-layout upgrades without erasing user organization; accessibility and recovery when groups or items are hidden; navigation-specific restoration under C-OQ-025; React and Tauri rendering boundaries; client-only versus host/client-paired contributions; dynamic registration and hot replacement; lifecycle coordination with Extension and provider replacement; nested Extension Point lifetime; parent Surface replacement and descendant contribution behavior; provider failure, error boundaries, fallback, and host recovery; accessibility obligations including keyboard, focus, announcements, and fallback semantics; themes, layout constraints, styling, and CSS isolation; narrow props, handles, and owner-approved data access; contribution permissions; serialization and restoration of contributed Surface identity and presentation state; provider unavailability during restoration; and whether an Extension may expose child Extension Points without creating unowned layout authority. Investigate functional and accessible fallback, retained display explanation, safe owner-action callbacks, and renderer-loss behavior; assess Tauri/WebView and CSS integration through actual imports and contracts rather than equating a web demo with a proven desktop integration.

**Current constraint:** A UI Contribution retains its Contribution Provider identity and owner-system bindings. Authoritative state remains with the nearest owner, and absence, failure, replacement, or restoration of contributed UI must not silently transfer that state to Collider. No concrete React API, Tauri bridge, styling mechanism, hot-replacement design, serialization format, or restoration guarantee is selected.

### C-OQ-022 — Projection definition, assembler, replay, and repair lifecycle

**Status:** Open\

**Decision:** Define how Projection Definitions are registered, versioned, executed, incrementally maintained, replayed, invalidated, and repaired without selecting the final Workspace-history or persistence topology.

**Must evaluate:** who may register Projection Definitions and under what authority or Capability Grant; definition identity, compatibility, versioning, and migration; where an Activity Assembler runs across Rust, Tauri, React, Substrate, Handbook, Collider, or provider processes; projection-specific fold state and Projection Index ownership; predecessor and projected-location indexes; initial reconstruction; incremental append; prepend and older-page loading; pagination; replay; snapshots and compaction; gap detection and repair; explicit full resynchronization; definition and renderer changes; projection invalidation; provider disappearance; unavailable source objects; partial reconstruction; privacy, redaction, and retention; deterministic replay and fault-injection validation; and how MCP App revisions or large shell and PTY streams become correlated Activity Items, summaries, or references. Compare complete client-controller adoption with presentation-only reuse; inspect per-run sequence checkpoints, pagination read boundaries, invalidation, duplicate/gap handling, and partial reconstruction, and require incremental-versus-reconstructed equivalence tests without replaying external effects.

**Current constraint:** Projection Definitions, Activity Assemblers, Projection Indexes, Activity Items, and Blocks do not become semantic, execution, or Source Record authority. No canonical Workspace event store, assembler process, database, language, persistence schema, Lane or Control Plane inclusion predicate, cross-projection Activity Item identity rule, or concrete Session Continuity mechanism is selected.

### C-OQ-023 — Workspace environments and World dependencies

**Status:** Open\
**Decision:** Define Collider's configuration and status Surfaces over Substrate's existing World dependency tooling without creating a competing environment/dependency model.

**Must evaluate:** current Substrate owner contracts and tooling; Workspace configuration sources and inheritance; dependency declaration versus resolved/effective requirements versus realized or observed readiness where supported; toolchains, binaries, libraries, services, variables, and secret references; Environment Dependencies versus Repository/package dependencies and Extension Dependency Declarations; Workspace defaults, Lane relationships, and permitted overrides; provisioning, validation, readiness, drift, failure, and recovery; offline or unavailable tooling; change previews and effects on active environments or future execution; authorized mutation, credentials, and audit; and incremental delivery of the Environments destination. Inspect existing World-tooling support for durable operation intent, attempt ownership, stale-attempt fencing, uncertain dispatch, idempotent retry, and persistent cleanup obligations; classify landed, planned, and unverified behavior instead of introducing a parallel Collider provisioning state machine; frontend controller, renderer, registry, or package boundaries as non-security boundaries; adoption or source ownership does not grant filesystem, credential, process, network, or semantic authority; framework-supplied capability descriptors versus owner-supported capability truth; unknown, unsupported, unavailable, degraded, and available states must remain distinguishable; a possible Tauri-native AgentTransport or equivalent bridge, including supported owner entrypoints, authentication, restart, cancellation, backpressure, replay, and deployment semantics; do not force HTTP or a Node sidecar solely to imitate a first-party backend; functional fallback when contributed or framework-owned renderers are unavailable; Tauri/WebView CSP, IPC permissions, URL/Markdown/upload/clipboard handling, accessibility, and renderer failure containment; owner cursor to projection sequence mapping, mapping version, snapshot cut, retention limits, gap repair, and replay after process or renderer restart; a filtered view must not preserve source sequence numbers in a way that creates artificial gaps.

**Current constraint:** Substrate remains authoritative for World preparation, dependency realization, policy, and execution. Collider exposes owner-supported requirements and status rather than asserting that configured means installed or ready. No new World schema, environment state machine, dependency resolver, isolation technology, or Lane cardinality is selected.

### C-OQ-024 — Harness, profile, and Workspace configuration

**Status:** Open\
**Decision:** Define how Collider exposes and edits Workspace configuration/policy, Agent Harnesses, Agent Profiles, and related workspace enablement through their existing owner boundaries.

**Must evaluate:** current Substrate and native harness configuration truth; harness identity and adaptation; native settings versus Substrate launch/integration/policy settings versus Collider presentation settings; declared, inherited, overridden, and effective values with source provenance; owner-approved edit and validation paths; reusable Agent Profiles versus native harness profiles and Handbook profiles; harness/provider/model/profile relationships; compatibility and supported controls; version and update status; environment requirements and C-OQ-023; credential bindings without general secret disclosure; Workspace-enabled skills, tools, apps, Extensions, providers, and external connections; availability/installation versus enablement versus authorization versus readiness; Capability Grant authority under C-OQ-014 and C-OQ-018; whether a change applies to future Invocations, active work, or after restart; Qualified Session compatibility and revalidation under C-OQ-008; and diagnostics and delivery scope. Compare requested UAA staging capabilities with Substrate's consumed dependency version, enabled features, and proven runtime-family paths; separate native harness support, negotiated behavior, authorization, readiness, and UI affordances rather than credit a candidate framework for replacing an existing CLI-agent layer; truthful separation among declared support, negotiated/runtime support, policy authorization, credential/environment readiness, and observed health when presenting harness/profile/capability configuration.

**Current constraint:** One configuration Surface does not create one configuration authority. Native harness, Substrate, Handbook, provider, and Collider state retain their existing owners. An Agent Profile is not an Agent Harness, Qualified Session, or permission grant. Navigator visibility is not capability enablement. No config schema, precedence order, provider fallback algorithm, native resume API, or execution topology is selected.

### C-OQ-025 — Navigator identity, customization, and persistence

**Status:** Open\
**Decision:** Define the supported Navigator Layout and persistence contract for user-arranged navigation over host-approved destinations and contributions.

**Must evaluate:** stable Navigator Item and Group identities independent of display labels and position; shortcuts and aliases; grouped and ungrouped items; group creation, naming, membership, and ordering; item visibility, hiding, recovery, and restore defaults; one-word highest-level shipped/default labels only, with multiword descendants and unrestricted user labels or user-promoted items; a root alias such as Home without renaming Control Plane; preferred Inbox naming; qualified Sessions as a real destination that may be user-prioritized; final default groups and nested versus root Harnesses, Environments, Profiles, and setup destinations; keyboard, focus, drag, narrow-window, and accessibility behavior; app/user/Workspace preference scope, cross-device synchronization, explicit shared defaults, and precedence; retention of personal choices without silently changing another user's layout or Substrate policy; contributed item admission, disappearance, reappearance, and migration under C-OQ-020 and C-OQ-021; unavailable targets; required execution awareness, cancellation, diagnostics, and recovery access; and delivery of basic customization within V1 separately from a general layout builder. Distinguish desired user layout from currently available contributions, user-hidden items from unavailable or failed providers, and functional host fallback from an error placeholder; evaluate framework navigation using stable host-owned destinations/actions without preserving provisional component code.

**Current constraint:** Items, groups, and layout are presentation, not semantic scope, permissions, or execution placement. Users must be able to rename groups, change displayed membership and order, and show items outside groups. Removing an item or group from navigation does not delete, disable, stop, rebind, or resume the underlying resources. The naming restriction does not extend to every tree level or user organization. No layout schema, persistence backend, synchronization mechanism, exact default tree, or mandatory immutable sidebar row is selected.

### C-OQ-026 — Inbox and notification semantics

**Status:** Open\
**Decision:** Define an Inbox destination for informational notifications and actionable owner-system items without creating a new authority for obligations or their resolution.

**Must evaluate:** source systems and existing Substrate inbox/notification semantics where present; questions, approvals, gates, blocked work, failures, integration and credential warnings; actionable versus informational classification; correlation and deduplication; links to Work Items, Lanes, execution, Qualified Sessions, and diagnostics; local read/dismiss state versus owner-authoritative acknowledgment, approval, or resolution; required policy checks before actions; suppression, snoozing, reminders, escalation, badges, grouping, and delivery channels as candidate behavior; unavailable source objects and stale items; permissions, private items, secrets, retention, deletion, and audit; interaction with Activity Projection without selecting Workspace history; recovery when the user hides Inbox; and first-slice versus later delivery. Separate notification read/dismiss state, request/approval lifecycle, and authoritative obligation resolution; test exact request correlation, stale responses, provider-loss fallback, and owner-approved action handling in any borrowed interaction UI; exact owner approval/obligation request identity, revision, actor, decision, stale/duplicate/conflicting/wrong-work handling, and explicit separation from local read/dismiss state.

**Current constraint:** Inbox is the preferred default label; Notifications may be a user label. Reading, dismissing, or hiding a notification does not implicitly approve a request, satisfy a Gate, unblock work, cancel execution, or change source authority. Any owner-system action uses the appropriate authorized boundary. No notification store, universal status model, delivery service, badge algorithm, or canonical Workspace history is selected.

### C-OQ-027 — Frontend foundation and reuse strategy

**Status:** Open\
**Decision:** Determine whether Collider should adopt, compose, adapt, selectively own, fork, or independently implement its frontend foundation, including presentation components and interaction controllers, over the existing Substrate/Handbook/UAA owner boundaries.

**Adjudication disposition:** **ADJUST — retain the shortlist; defer adoption.** The corrected report establishes a credible frontend-reuse opportunity, but documentation and source inspection do not establish integrated lifecycle truth, a supported Substrate GUI boundary, deployment compatibility, published-artifact provenance, or measured economics.

**Provisional proof shortlist:**

1. public AgentKit controller/protocol plus suitable AgentKit React regions, selective Toolkit, one owner-routed bridge, and Collider-defined Workstream/Control Plane/Lane behavior;
2. headless-first AgentKit when lifecycle mapping succeeds but the reference React composition does not;
3. substantial Toolkit reuse with another single controller when AgentKit lifecycle translation costs exceed demonstrated value;
4. a bounded coherent frontend fork when explicit controller/composition ownership is cheaper and clearer than a translation-heavy public adapter;
5. a broader owner-preserving framework/fork remains eligible but unselected pending retained-value, distribution, and maintenance evidence;
6. Collider-native implementation remains a fair comparator rather than the automatic fallback after any package mismatch.

**Must evaluate:** all previously listed adoption, composition, ejection, fork, native, and hybrid options against the same desired product; the actual public and private package seams; controller/protocol behavior; published artifacts and notices; Tauri/Vite/WebView deployment; and the retained value of one substantial agent-interaction region plus one non-chat region. In addition, prove the actual controller semantics for pending versus owner-accepted work, accepted/queued/running representation, lost acknowledgement, exact request/receipt identity, detach versus cancel, cancellation acknowledgement versus authoritative terminal effect, completion/cancel races, subscription interruption versus terminal completion, approval protocol segmentation and exact owner approval identity, automatic queue promotion and current authorization, repeated identical content with distinct identities, transcript versus reconstructed model context, capability-state honesty, source-cursor to projection-sequence mapping, coordinated Control Plane/Lane/inline/Sticky/Tab views under one behavioral owner, renderer fallback, and restart/replay behavior. Assess sidecars, private APIs, and fork size as deployment/economic tradeoffs unless they require forbidden authority or privilege changes.

**Current constraints:** AI Elements curation is disposable, with no preservation preference or sunk-cost penalty. Tauri + React + TypeScript + Vite is the target. Substrate and Handbook retain their existing authority; UAA/provider execution is not to be recreated in a parallel TypeScript backend. Framework code or owned source may implement Collider-defined roles; accepted semantics do not mandate bespoke implementations. AgentKit thread/run/controller identities do not become Workstream, Qualified Session, Invocation, Receipt, Source Record, Activity Item, or owner terminal truth by name. Default Agent-Native Core authority over database, auth, execution, persistence, or deployment is not selected. A sidecar or fork is not rejected merely for existing, but any authority-displacing design, false acceptance/terminal reporting, or UI-owned execution lifetime is a hard semantic failure. No Agent Native, AgentKit, Toolkit, BB, Cordis, controller, datastore, sidecar, fork, or dependency is adopted by this question.

**Required proof evidence:**

- **Contract gate:** exact supported owner entrypoint and production call path; versioned schemas; authority and policy checks; field-by-field command/receipt/work/cursor/approval/cancel/session mapping; unknown fields remain unknown.
- **Fixture/client proof:** the actual public AgentKit client/controller, not only a transport-shaped double; full relevant transport conformance plus Collider-specific lifecycle, identity, queue, approval, sequence, coordinated-view, and substantial non-chat Surface cases. Fixture success remains fixture evidence.
- **Owner-integrated proof:** the same scenario through the supported owner boundary and declared real execution path, preserving a traceable join from user intent through owner acceptance, source observations, projected events, and authoritative terminal/approval records; demonstrate view/window release and restart without implicit provider cancellation or duplicate dispatch.
- **Deployment/artifact/economics proof:** exact package artifacts, notices, provenance and applicable rights; Vite/Tauri/CSP/accessibility behavior; production dependency graph versus emitted assets; startup, memory, event-burst, replay, focus/keyboard, cleanup, maintenance, sidecar, source-divergence and upgrade costs.

**Decision boundary:** this adjudication selects a proof direction, not implementation. Only a separately authorized, passing exact-path proof plus applicable artifact/licensing evidence can support a later adoption or dependency decision. Research, adjudication, proof, and canonical amendment remain separate steps.

## 4. Research Clusters and Preliminary Dependencies

The following grouping is non-normative research-ordering metadata. It does not resolve an item, create implementation authority, or claim that every dependency is complete. Per-question `Depends on` and `Blocks` fields SHOULD be added only when a bounded research packet establishes them with sufficient confidence.

| Cluster | Questions | Preliminary dependency or gating relationship |
|---|---|---|
| **History and projection** | `C-OQ-001`–`C-OQ-007`, `C-OQ-022` | Establishes source, identity, ordering, assembly, replay, and reconstruction boundaries needed by later Workstream persistence and history-sensitive UX contracts. |
| **Qualified Session continuity** | `C-OQ-008` | Depends partly on owner-history and Activity Projection findings and coordinates destination behavior with `C-OQ-025`; it MUST NOT resolve Workspace history or make navigation imply continuation. |
| **Presentation placements** | `C-OQ-009–010` | Can proceed against stable Surface and Activity Item identities; persistence and restoration details may depend on history/projection findings. |
| **Execution topology and context lineage** | `C-OQ-011–012` | Requires current Substrate implementation truth and later gates the detailed Execution and Binding contract. |
| **Reference-architecture evaluation** | `C-OQ-013` | May inform experiments, but does not gate canonical Collider terminology or select a dependency. |
| **Extension trust, effects, and lifecycle** | `C-OQ-014–017` | Trust and isolation boundaries constrain every later dynamic-extension mechanism; recovery criteria gate truthful composability claims. |
| **Capability composition** | `C-OQ-018–019` | Depends on owner and trust boundaries from `C-OQ-014` and dependency-lifecycle findings from `C-OQ-017`. |
| **UI extension composition** | `C-OQ-020–021` | Depends on trust and capability constraints from `C-OQ-014`, `C-OQ-018`, and `C-OQ-019`; it does not replace Surface or placement semantics. |
| **Environment realization** | `C-OQ-023` | Starts from existing Substrate World dependency tooling; coordinates Lane/environment changes with the execution contract rather than creating a Collider resolver. |
| **Workspace execution setup** | `C-OQ-024` | Requires owner-grounded configuration truth and coordinates environment, capability, policy, and Session behavior with `C-OQ-023`, `C-OQ-014`, `C-OQ-018`, and `C-OQ-008`. |
| **Navigator customization** | `C-OQ-025` | Builds on Presentation Actions and UI-contribution boundaries; informs the Workspace Shell contract without requiring every destination editor first. |
| **Inbox and notifications** | `C-OQ-026` | Depends on the source owners' acknowledgment and resolution semantics; coordinates discoverability with `C-OQ-025` without selecting a universal history. |
| **Frontend foundation and reuse** | `C-OQ-027` | Research and adjudication are complete enough to shortlist proof candidates, but adoption remains Open. The next gate is the non-authorizing owner-boundary/proof specification and separately authorized staged proof; coordinates with history/projection, continuity, execution, capability, UI, setup, and Inbox questions without requiring them all to close first. |

## 5. Recommended First Research Packet

The first research packet should address **C-OQ-001 through C-OQ-007 together with C-OQ-022**, because they share one architectural boundary.

It should inspect current implementation truth for:

- Substrate invocation, JSONL, Receipt, process, tool, Lane, and execution records;
- Handbook Artifact history, Projection, Snapshot Memory, deltas, Evidence, and SDK boundaries;
- MCP App object and lifecycle semantics used or contemplated by Collider;
- shell and PTY capture already available in Substrate;
- Collider and Tauri persistence, restoration, and Surface-host constraints.

The packet should return:

1. a source-of-truth inventory;
2. required user-visible queries, Projection Definitions, and Activity Item identity requirements;
3. payload-copy versus reference rules;
4. candidate Activity Assembler and Projection Index placements with failure modes;
5. append, prepend, pagination, replay, resynchronization, gap-repair, snapshot, and compaction requirements;
6. candidate history architectures with failure modes;
7. a recommended option or a reason to preserve a bounded hybrid;
8. migration and incremental-delivery implications;
9. the exact glossary, foundations, workspace-shell, and execution-contract edits required by the decision.

### 5.1 Current frontend-evaluation sequence

The corrected Agent Native evaluation and bounded adjudication are complete as advisory evidence. `C-OQ-027` remains Open.

1. Preserve the corrected report, adjudication decision coverage, adjudication check record, exact pins, and missing-original-ledger limitation as research provenance. Do not reconstruct the missing ledger or promote the new check record to that status.
2. Use `agentkit-owner-boundary-proof-spec.md` to ground the exact supported Substrate/Handbook/UAA owner surface and field-by-field mapping. Contract readiness is not runtime acceptance evidence.
3. After separate authorization, run the staged proof: actual-client fixture proof, owner-integrated proof, and deployment/artifact/economics proof. Keep their results separate.
4. Draft stable implementation-neutral Workspace Shell behavior in parallel where sufficiently settled. Do not silently choose controller identity, history storage, or execution truth while doing so.
5. Use the owner inventory and exact-path evidence to complete supported Execution and Binding contracts. Where a real owner path is unavailable, record the capability as unavailable or unproved rather than creating a candidate-shaped workaround.
6. After the proof, explicitly decide dependency/composition/source-ownership/fork/native strategy. Amend glossary or Foundations only when an accepted product-semantic decision actually changes.

Deep Research and adjudication are evidence processes, not additional authority or permission grants. Fixture success, inspected tests, source declarations, and package metadata do not become production evidence through repetition.

## 6. Closure Rule

An open item is not closed by implementation convenience, a UI mockup, or an undocumented local choice.

Closure requires an explicit decision record and coordinated updates to every normative Collider V1 document whose definitions or invariants change.
