# Collider V1 Foundations — Product and Architecture Contract

**Status:** Draft — proposed foundational contract for landing\
**Document role:** Product direction, authority boundaries, foundational invariants, and V1 scope\
**Applies to:** Collider V1 product, UX, architecture, protocol, and implementation planning\
**Terminology dependency:** [`00-collider-v1-glossary.md`](./00-collider-v1-glossary.md)\
**Open architecture register:** [`02-collider-v1-open-architecture-questions.md`](./02-collider-v1-open-architecture-questions.md)\
**Implementation authorization:** None; this document establishes direction and constraints but does not authorize implementation\
**Provisional dependency:** The execution-instance and agent-topology vocabulary in glossary Sections 6.7–6.14 remains exploratory and non-canonical

## 1. Purpose and Authority

This document defines the foundational product and architecture contract for Collider V1.

It establishes:

- what Collider is;
- how Collider relates to Substrate and Handbook;
- the top-level Workspace interaction model;
- the role of the Control Plane, Workstreams, Blocks, Surfaces, and Tabs;
- the separation between durable owner-system state and temporary UI presentation;
- the context and continuity model;
- the minimum coherent V1 scope;
- the principles that later UX and execution contracts MUST preserve.

This document does not define detailed visual layout, application schemas, command routing, Lane dispatch, persistence formats, execution topology, a canonical Workspace event-history architecture, detailed extension-security mechanisms, trust-class schemas, isolation technologies, enforcement protocols, or package-provenance implementation. Those concerns belong to later bounded documents or the open architecture register.

Capitalized terms use the meanings defined by the glossary. Where this document and the glossary differ, the glossary controls terminology and this document controls the broader Collider product direction. Handbook and Substrate remain authoritative for the state and semantics they own.

### 1.1 Provisional execution vocabulary

The glossary currently marks **Run**, **Root Run**, **Child Run**, **Run Node**, **Run Tree**, **Agent**, **Subagent**, and **Subtask** as provisional.

This document intentionally does not freeze that execution ontology. It establishes only terminology-independent requirements such as:

- execution may continue without a visible UI Surface;
- Collider presentation MUST NOT own execution lifetime;
- background execution requires persistent user-visible awareness;
- stopping execution MUST be explicit rather than inferred from closing presentation;
- context and execution provenance SHOULD be retained for future inspection.

Later execution-design work may rename, merge, split, or replace the provisional concepts while preserving these foundational requirements.

## 2. Product Thesis

Collider is the human-facing Workspace application over Substrate and its integrated Handbook capabilities.

Collider V1 combines:

- terminal and process interaction;
- natural-language and agent interaction;
- Handbook semantic artifacts and projections;
- execution and Lane awareness;
- rich first-party applications;
- durable interaction history;
- focused working Surfaces with inline, Sticky, and Tab placements.

Collider SHOULD NOT be designed as:

- a conventional IDE with chat added to it;
- a chatbot with IDE panels attached to it;
- a terminal emulator whose architecture assumes every application is a PTY;
- a chronological collection of chat sessions as its imposed default organization;
- an independent semantic or execution authority.

The intended model is:

> **A Workspace-scoped, block-oriented control environment in which commands, natural-language requests, and application actions can produce interactive Surfaces inline, keep selected items visible within a Workstream, and open important Surfaces as Tabs without owning the durable state they display.**

The center of Collider is therefore not exclusively a terminal, editor, chat transcript, or dashboard. It is a Workstream-oriented interaction environment capable of hosting all of those forms.

## 3. System Authority Boundaries

Collider depends on a strict separation among semantic authority, execution authority, and presentation authority.

| System        | Primary authority                                                                                                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Handbook**  | Canonical semantic artifacts, artifact kinds and schemas, Scope, Resolution, Projection, contracts, admitted Evidence, verdicts, gates, and owner-approved semantic mutation paths                                                                |
| **Substrate** | Workspace identity and policy, Lanes and execution environments, agents and processes, tools, accepted Invocations, execution lifecycle, runtime telemetry and Receipts, and runtime context assembly and delivery                                |
| **Collider**  | Human interaction, Presentation Actions, Workspace navigation, Control Plane presentation, Workstream and Activity Projection behavior, Activity Items, Blocks, Surfaces, Surface Placements, Sticky Placements, Tabs, and optional inspection UX |

### 3.1 No competing authority

Collider MUST NOT become a second source of truth for Handbook or Substrate state.

Specifically:

- rendering a Handbook Artifact does not make Collider its semantic owner;
- displaying execution activity does not make a React component, Tab, or Surface its lifecycle owner;
- caching state does not grant authority to mutate that state independently;
- a backing file is not automatically the canonical user-facing meaning of a Handbook Artifact;
- a Workstream transcript is not the canonical source of Workspace semantics or execution truth.

Collider MAY initiate actions and mutations, but owner-system state changes MUST pass through the appropriate Handbook or Substrate boundary.

### 3.2 Process topology does not redefine authority

Handbook may be integrated into Substrate through a process bridge, a direct Rust boundary, or another implementation topology. That physical arrangement MUST NOT blur the logical authority boundary.

Substrate consumes Handbook semantics. Collider consumes and presents both systems. Neither integration strategy authorizes duplicate interpretation of Handbook meaning inside Substrate or Collider.

### 3.3 Reference architectures and extension neutrality

Collider MAY learn from and selectively emulate external reference architectures. External influence does not change Handbook, Substrate, or Collider authority, automatically import source terminology, schemas, APIs, lifecycle models, or package topology, or select a product dependency. Any adopted result must be stated in Collider's own canonical language and reconciled with existing owner-system boundaries.

Collider's protocol-neutral Surface and extension direction permits multiple implementation strategies. It does not commit Collider to MCP, Cordis, or any single extension or composition framework. The fact that higher-level capabilities may be extensible also does not require the core responsibilities of Handbook, Substrate, or Collider to become dynamically loaded plugins.

### 3.4 Extension trust, isolation, and bounded cleanup

Dynamic in-process composition is not a security boundary. A context object, registry, API façade, or Capability Grant may mediate and attenuate host access, but none of those mechanisms alone isolates executable code from ambient APIs, host objects, shared mutable state, faults, or unmediated capabilities.

Untrusted executable extensions MUST remain behind an actual Isolation Boundary. Capability mediation MAY supplement that boundary by constraining, revoking, and auditing what isolated code can request; it MUST NOT replace process, runtime, operating-system, or equivalently justified isolation.

Surface-provider identity, permission to render UI, and runtime execution authority are distinct. A provider allowed to create or contribute a Surface does not thereby receive filesystem, process, network, credential, clipboard, browser, host-object, Handbook mutation, or other host capability.

Automatic tracking, cleanup, or reversion claims MUST be limited to Mediated Effects and to the portion of those effects that the host can observe, attribute, and control. Unload, update, deactivation, or graceful disposal MUST NOT claim complete cleanup when untracked or External Effects may remain. External Effects require an explicit contract such as transactionality, copy-on-write, idempotent cleanup, a Compensating Action, or classification as non-revertible; compensation MUST NOT be represented as exact rollback.

Failure containment MUST NOT depend solely on extension-authored graceful cleanup. Crash and non-graceful termination paths require owner-system containment and recovery appropriate to the actual trust and isolation boundary. Every security, unloadability, cleanup, and reversibility claim MUST remain bounded by the system interfaces through which the relevant capabilities, dependencies, and effects are actually mediated.

### 3.5 Dynamic-extension composability objective

Collider adopts **Spatiotemporal Composability** as a design objective for dynamically loadable or reconfigurable Extensions. This direction does not claim that the current architecture, or any current extension class, already provides a formal or production-grade composability guarantee.

For Temporal Composability, Extension Contribution registration and cleanup SHOULD remain local, attributable, and associated with an Extension Lifecycle within the actual mediated boundary. The host SHOULD track mediated contributions and their valid cleanup, inverse, or recovery behavior under a declared recovery criterion. Partial activation and failed update paths SHOULD recover already-installed mediated contributions rather than knowingly leave half-installed host state, and deactivation or replacement SHOULD preserve unaffected functionality and state where feasible. Exact reversion claims require Revertible Contributions evaluated against their declared recovery criteria; External Effects, compensation, crashes, and non-graceful termination remain subject to Section 3.4.

For Spatial Composability, Extensions SHOULD declare the capabilities or services they require and provide. Activation SHOULD occur only while declared requirements are satisfied. Requirement disappearance or material provider change SHOULD cause orderly inactivity or deactivation, and restored requirements MAY permit reactivation. Where cleanup depends on a provider, dependent teardown SHOULD occur before provider withdrawal. Dependency topology SHOULD be inspectable, and configuration change SHOULD reconcile affected Extensions rather than require a blind restart of unrelated host functionality where feasible.

This objective remains bounded by actual mediation, trust, Isolation Boundaries, confinement, valid inverse or recovery behavior, dependency discipline, External Effects, and any required independence, commutativity, conflict, or ordering conditions. These documents do not select a concrete dependency-resolution interface, hot-replacement implementation, or proof method.

### 3.6 Mediated extension capability composition

Extension access to host functionality SHOULD use owner-mediated Capabilities where practical. When an owner-approved capability seam exists, Extensions SHOULD NOT depend on undocumented ambient globals, direct access to another owner's mutable state, or untracked host objects. Capability use and Extension Contributions SHOULD remain attributable to both the provider and the consuming Extension instance.

Extensions and providers SHOULD declare Required Capabilities and Provided Capabilities where feasible. Those Dependency Declarations SHOULD inform extension eligibility and reactive Extension Lifecycle behavior, and the resulting dependency topology SHOULD remain inspectable. A provider remains authoritative for the state, service, and lifecycle it exposes; neither a consumer nor an Extension Context becomes a copied source of truth.

Each Extension instance MAY receive a bounded Extension Context through which owner-approved Capabilities are resolved. Extension Context Mediation and Capability Interception MAY specialize access for a Workspace, Lane, Workstream, Qualified Session, policy, audit, instrumentation, or trust condition while preserving Handbook, Substrate, and Collider authority boundaries. An Extension Context MUST remain distinct from Handbook Scope, Resolution, and Projection; Substrate Context Packs and model-visible context; Activity Projections; Workstreams; and execution environments. It is not an Isolation Boundary, and capability mediation does not replace the trust and isolation requirements in Section 3.4.

Local and cross-process Capabilities MAY use different implementation mechanisms. Cross-process contracts MUST expose asynchronous execution, availability, failure, cancellation, timeout, retry, and provider-loss semantics honestly rather than pretending remote access has infallible synchronous local behavior. This document does not select capability keys, schemas, provider-selection rules, bridge protocols, or a concrete Extension Context implementation.

### 3.7 Host-declared UI extension composition

Collider SHOULD use one general, scoped UI contribution model where practical rather than create unrelated ad hoc registries for every extensible feature. Collider-owned layout declares valid Extension Points and retains authority over their location, accepted contribution contract, composition policy, accessibility requirements, and fallback behavior.

Host ownership of these rules does not require a fixed Navigator Layout. Users control supported grouping, group names, item order, visibility, and ungrouped placement of eligible Navigator Items. Contribution Providers MUST respect those preferences rather than reorganize the user's navigator or restore hidden items merely on reload. Eligibility, permissions, accessibility, and required recovery remain host-controlled; user arrangement does not change an Extension Point's capability or authority boundary.

Authorized Contribution Providers MAY register identity-bearing UI Contributions such as Surfaces, controls, renderers, actions, or related UI behavior through those Extension Points. Contributions SHOULD remain attributable, UI Contribution Scope-bounded, ordered or selected under an explicit Extension Point Policy, and tied to the applicable Extension or provider lifecycle. Zero, one, or several contributions may be valid depending on the host declaration.

Nested Extension Points MAY support compositional UI, but the declaring owner and lifetime of every nested point MUST remain explicit. Replacement, failure, or removal of a parent Surface must account for descendant point declarations and contributions rather than leave unowned UI state. The exact descendant-lifecycle and replacement mechanics remain open.

Contributed UI SHOULD receive only narrow owner-approved props, handles, or references and SHOULD retrieve authoritative data through owner-approved Capabilities or owner-system interfaces. State remains with the nearest authoritative owner. Surface identity, Contribution Provider identity, rendering permission, and runtime execution authority remain distinct.

The Surface model remains the protocol-neutral typed application/view abstraction. MCP Apps are one possible Contribution Provider or Surface Provider path, not the complete extension architecture. Extension Points do not redefine inline, Sticky, Tab, overlay, or Inspector presentation behavior, and the absence or failure of a contribution MUST NOT prevent host recovery, required accessibility behavior, or an owner-defined fallback where one is necessary.

## 4. Workspace-First Product Model

The canonical top-level entity opened by Collider V1 is a **Workspace**.

A Workspace is the Substrate configuration and policy boundary. It is not synonymous with a Repository, open window, terminal session, Workstream, Lane, or chat.

Collider V1 MUST use **Workspace** rather than **Project** for this entity. `Project` remains reserved for a future, explicitly distinct concept or for Handbook-owned semantics.

Opening a Workspace SHOULD make the following categories discoverable:

- Handbook semantic state;
- Work Items and related status through owner-defined Surfaces, even when a dedicated `Work` Navigator section is not present;
- Lanes;
- Repositories or other physical resources;
- active and historical execution activity;
- the canonical Control Plane;
- reconstructable Workstreams and Surfaces;
- Workspace configuration and policy, Agent Profiles, and Agent Harness configuration;
- environment requirements and readiness through Substrate's existing World dependency tooling;
- Workspace-enabled skills, tools, apps, Extensions, providers, integrations, and credential-binding status;
- a dedicated Qualified Session destination for explicit continuity and user-chosen Session navigation;
- Inbox items and diagnostics backed by their respective owners.

These are conceptual access requirements, not a requirement for a fixed top-level row or a fully populated editor for every destination in the first coherent slice; Section 15 preserves staged delivery.

The Workspace remains durable when Collider closes. Collider presentation is a view onto the Workspace, not the Workspace itself.

## 5. Durable Meaning, Federated Sources, and Reconstructed Presentation

Collider MUST distinguish durable owner-system state from the UI currently presenting it.

Durable or durably addressable source state may include:

- Handbook Artifacts, snapshots, Contracts, Work Items, decisions, and semantic relationships;
- Workspace configuration and policy;
- Lanes, worktrees, repositories, and execution environments;
- Substrate Invocations, Receipts, execution records, file changes, results, and errors;
- MCP App objects, revisions, or durable provider references;
- shell or PTY command records, output references, and structured summaries;
- Collider-owned Presentation Action records or presentation-state references when restoration, audit, provenance, or durable history requires them;
- Context Records, Evidence, verdicts, gates, and provenance relationships;
- Workstream identity, projection, indexing, or reconstruction metadata where the selected architecture requires it.

Presentation state may include:

- open Tabs;
- inline and Sticky Surface Placements;
- the Sticky Stack attached to a Workstream Surface;
- selected objects;
- collapsed or expanded Blocks;
- scroll position;
- local layout and display preferences;
- Navigator Layout group names, membership, ordering, visibility, and ungrouped item preferences;
- Collider-local Inbox read or dismissal markers, where those markers are not owner-system acknowledgments.

The foundational rule is:

> **Persist or durably reference meaning and execution history; reconstruct the useful view.**

Collider MUST NOT assume that all durable activity is copied into one Collider-owned or Substrate-owned Workspace event store. Handbook, Substrate, MCP Apps, shell or PTY facilities, and Collider may each retain authoritative records appropriate to their domains.

Collider MAY create projection metadata, indexes, stable references, summaries, or caches needed to provide a coherent Workstream experience, but those mechanisms MUST NOT silently become competing semantic or execution authority.

The exact history architecture remains unresolved. Candidate shapes include:

- one canonical Workspace history;
- federated source histories plus a Workspace activity index;
- query-time federation;
- a hybrid of references, selected snapshots, and materialized projection items.

This document freezes the UX and ownership requirement, not the storage choice:

> **A durable or reconstructable Block must be traceable to sufficient Source Records, durable references, or owner-system objects to explain or reconstruct it, but the relationship need not be one Block to one event or one shared store.**

Closing a Tab or removing a Sticky Placement MUST NOT implicitly delete, retire, archive, stop, or mutate the underlying owner-system state.

Collider SHOULD be capable of reconstructing a current useful Surface from stable identities, owner-system records or references, Activity Projection metadata, and durable presentation references rather than requiring an old in-memory component tree to remain alive.

### 5.1 Projection assembly and stable activity identity

Host-recognized Projection Definitions SHOULD transform eligible Source Records or references into stable Activity Items for a target Activity Projection. A Projection Definition may be built in or dynamically registered; the registration mechanism remains open. Workstream renderers SHOULD consume final Activity Items or bounded Surface models rather than repeatedly scan raw heterogeneous source collections.

Each Activity Item MUST have stable Business Identity independent of visual list position, page boundaries, arrival order, and renderer implementation. That identity may be supplied by an authoritative owner system or deterministically derived by the applicable Projection Definition from stable source fields. Intentionally ephemeral visual output may render as a Block without becoming an Activity Item. One Activity Item MAY correlate or fold several Source Records or revisions while retaining inspectable source references and projection-definition provenance.

An Activity Projection MUST provide deterministic presentation order sufficient for rendering and navigation for a given projection state and Projection Definition version. That presentation order does not imply that the underlying Source Records possess one authoritative total order; source causality may remain partial, concurrent, late-arriving, or owner-specific.

An Activity Assembler MAY own projection-specific fold state and Projection Indexes needed for efficient correlation, predecessor or ordering lookup, and incremental maintenance. That machinery MUST NOT become semantic, execution, or Source Record authority.

Projection assembly SHOULD be deterministic and replayable to the extent permitted by the participating source systems. Incremental append and older-history loading SHOULD update only affected projected objects and preserve unaffected Business Identity and fold state where possible. Pagination and replay are ordinary explicit operations; gap repair, projection invalidation, and full resynchronization SHOULD be explicit exceptional paths rather than hidden renderer behavior.

Different Workstream views MAY assemble or locate the same Source Records differently. Control Plane and Lane projections may share Source Record identity while producing view-specific Activity Items, ordering, visibility, or location. Whether they also share Activity Item identity remains open.

This projection architecture strengthens both federated and indexed history options but does not select one canonical Workspace event store, assembler process, database, language, or persistence topology.

## 6. Primary Interaction Model

### 6.1 Projection-oriented Workstreams

The primary center interaction model is a Workstream Surface rendering an ordered Activity Projection as Blocks.

A Block MAY represent:

- user input;
- shell output;
- an agent response;
- a Handbook Projection;
- a repository browser;
- an editor;
- a plan;
- a diff;
- test or gate results;
- execution status;
- a rich interactive Surface, including one supplied by a Collider-native, Substrate, Handbook, Extension, or MCP App Surface Provider.

When a Block hosts a contributed or externally provided Surface, the Block remains the inline presentation placement, the Surface remains the typed application or view, and the Extension, MCP App, or other Surface Provider remains the attributable provider. Rendering that Surface does not transfer provider-owned state, semantic authority, execution authority, or unrelated host capabilities to the Block or Collider.

The Workstream MAY look conversational, but it is more structured than a conventional chat transcript. Its visible sequence may combine stable Activity Items backed by several authoritative source systems, and one Activity Item may fold several correlated Source Records or revisions.

The Workstream renderer SHOULD receive final Activity Items or bounded Surface models from the Activity Projection pipeline. It SHOULD NOT rediscover business identity, correlation, or fold state by repeatedly scanning raw heterogeneous histories.

A Workstream MUST NOT be assumed to own one independent event history merely because it presents an ordered view. The underlying history, assembler placement, indexing, and persistence architecture remains open.

### 6.2 Shared Control Plane and Lane infrastructure

The Control Plane and Lane views SHOULD use the same core:

- Workstream Surface;
- Activity Projection pipeline;
- Block renderer;
- Surface host;
- Composer;
- selection and branching primitives;
- Sticky Stack behavior;
- Tab Promotion behavior.

Their primary difference is projection and binding posture:

```text
Control Plane
  Lane filter: none
  Default Lane: none unless explicitly established

Lane view
  Lane filter: selected Lane
  Default Lane: selected Lane
```

This filtering may remain an internal implementation detail. The user does not need to manipulate raw filter expressions.

`Lane filter: none` means lane-unfiltered, not “display all raw internal telemetry.” The projection may still collapse, summarize, or progressively disclose low-level tool, provider, or internal execution detail.

Control Plane and Lane projections MAY reuse Source Records and Projection Definitions while producing view-specific Activity Items, ordering, visibility, or projected locations. Exact Activity Item identity sharing across those views remains an open decision.

### 6.3 Unified Composer

The active Workstream SHOULD provide a unified Composer capable of accepting:

- raw shell input;
- Collider or Substrate commands;
- Handbook-oriented requests;
- natural-language agent instructions;
- structured actions from an existing Surface.

A user SHOULD NOT need to switch between separate terminal and chat applications merely because one Invocation is shell-shaped and the next is natural language.

The routing and execution semantics of different input dialects remain distinct even when they share one Composer.

### 6.4 Terminal capability without terminal confinement

Collider MAY provide Terminal Surfaces and raw PTY behavior, but the Control Plane and Workstream MUST NOT be architecturally reduced to a single PTY or shell process.

Normal shell semantics MUST be preserved when the user is operating in raw shell or PTY mode. Rich presentation MAY enhance a command result, but MUST NOT silently falsify the command, output, exit status, Receipt, or execution record.

The desired principle is:

> **Commands may produce applications; applications are not all terminals.**

### 6.5 Interactive Surfaces inline

Commands, agent responses, owner-system operations, and authorized Surface
Providers MAY cause rich typed Surfaces to appear directly inside the active
Workstream.

Such a Surface MAY be Collider-native, Substrate-provided, Handbook-provided,
or supplied by an authorized Extension or through an MCP App adapter. Its
provider path does not change the applicable Surface, placement, owner-authority,
trust, or capability boundaries.

A user should be able to:

1. request or discover an object;
2. receive a useful interactive Surface inline;
3. interact with it without leaving the Workstream;
4. keep it visible in the Workstream's Sticky Stack where supported;
5. expand or focus it where supported;
6. use **Open as tab** when it deserves durable visual attention.

An Extension- or MCP App-supplied Surface participates in the same presentation
model as other Surfaces, but only for the placement modes it declares and the
host authorizes.

Opening a richer representation MUST NOT require moving the application into the optional right sidebar.

## 7. Control Plane and Lane Workstream Foundation

Each Workspace SHOULD expose one canonical **Control Plane** as its default opening Workstream Surface.

The Control Plane is the broad Workspace-orchestration entry point. It is not itself a Lane and has no implicit execution environment merely because it is visible.

### 7.1 V1 presentation

The first V1 Control Plane SHOULD be intentionally minimal:

- a block-oriented Workstream Surface;
- a terminal-like Composer;
- the ability to submit shell-shaped and natural-language Invocations;
- the ability to render rich inline Surfaces;
- access to Workspace-level navigation and execution awareness.

A dashboard is not required for the initial version.

Later versions MAY add persistent Workspace-status, active-work, gate, or orchestration applications to the Control Plane without replacing its Workstream model.

### 7.2 Lane-unfiltered Control Plane projection

The Control Plane SHOULD present a Workspace-relevant Activity Projection with no Lane filter. This allows one coherent view to include eligible Workspace-level activity and eligible activity associated with individual Lanes.

This is a presentation contract, not a decision that all source systems must write into one canonical history.

The Control Plane projection MUST remain eligible for summarization, collapsing, progressive disclosure, permission filtering, and exclusion of low-level internal machinery from the default view.

### 7.3 Lane-filtered Workstream views

A Lane Workstream Surface SHOULD reuse the same core components as the Control Plane while applying an internal filter for the selected Lane and using that Lane as the normal default binding for new Invocations.

A Lane view is a projection onto the Lane, not the Lane itself. It may be closed while the Lane and its execution continue in the background.

The exact inclusion rules remain unresolved for:

- a Workspace-level Invocation that later dispatches into a Lane;
- cross-Lane orchestration;
- Activity Items associated with several Lanes or scopes;
- activity that begins in one projection and completes in another;
- historical Lane rebinding.

These rules belong to the open architecture register and later execution-and-binding contract.

### 7.4 Resolution posture

The Control Plane begins with a broad Workspace-orchestration Resolution Posture. That posture is a default orientation, not a static context package.

Each Invocation MUST be eligible for new Handbook Resolution appropriate to its actual purpose and target. A narrow request issued from the Control Plane may resolve narrowly, and an implementation request may need to dispatch into a specific Lane.

The Control Plane MUST NOT achieve apparent Workspace awareness by treating one ever-growing transcript as the sole source of context.

### 7.5 Lane neutrality

The Control Plane SHOULD remain Lane-neutral until an Invocation is explicitly or deterministically bound to a Lane.

Read-only Workspace inspection may be possible without a task-specific Lane. Environment-touching, mutating, or task-specific work MUST NOT silently execute in an arbitrary worktree or repository context.

The detailed binding and dispatch rules belong to the later execution-and-binding contract.

## 8. Workspace Navigator Foundation

Collider V1 MUST provide a persistent left-side **Workspace Navigator**. It exposes durable Workspace destinations through Navigator Items, presentation-only Navigator Groups, and a user-customizable Navigator Layout.

The default organization foregrounds Workspace structure rather than open windows or chronological chat titles. That default is not an imposed hierarchy: users may arrange eligible destinations differently, including prominent access to Qualified Sessions, without changing underlying identity or authority.

### 8.1 Conceptual destinations

The long-term navigator should provide the following destinations. This is a coverage map, not a fixed root-level hierarchy, final label set, or requirement to ship every populated Surface in the first slice.

| Destination | Purpose and boundary |
|---|---|
| **Control Plane** | Return to the canonical Lane-unfiltered Workstream home. A default root shortcut may use **Home** without renaming Control Plane. |
| **Inbox** | Notifications and actionable owner-system items, including questions, approvals, blocked work, and failures where available. It is not a new obligation or task authority. |
| **Handbook** | Semantic Artifacts and owner-defined projections; curated entries may include Charter, Architecture, Design, Contracts, Decisions, or Evidence & Gates without freezing Handbook's registry. |
| **Work** | Owner-defined Work Items and related status, not an independent Collider task database. |
| **Lanes** | Durable execution partitions and lightweight activity state, opening Lane-filtered Workstream Surfaces independently of Tab lifetime. |
| **Execution activity** | Active, queued, interrupted, attention-requiring, and historical Substrate activity as supported by its owner model. **Execution** may be a group heading and **Activity** a destination label; this does not settle execution topology. |
| **Sessions** | A dedicated destination for discovering and explicitly continuing actual Qualified Sessions. Users may place it in a group or at the root; opening the destination does not itself resume a Session. |
| **Harnesses** | Configured Agent Harnesses and their native, Substrate-integration, and Collider-presentation settings, with compatibility and health information where available. Root versus nested placement is not fixed. |
| **Environments** | Environment Dependency configuration feeding Substrate's World dependency tooling, plus effective requirements, realized resources, readiness, and drift where supported. |
| **Repositories** | Physical source, filesystem, and version-control resources; a Workspace may reference zero, one, or several Repositories. |
| **Agent Profiles** | Reusable Substrate-owned role and execution configuration, distinct from harnesses, model providers, and Qualified Sessions. |
| **Configuration & Policy** | Workspace configuration, effective values and their sources, overrides, operational policy, and validation through Substrate-owned interfaces. |
| **Capabilities & Integrations** | Workspace availability and enablement of skills, tools, apps, Extensions, providers, and connections. Their distinct types and owner systems remain visible. |
| **Credential bindings** | Authorized views of credential references, scope, availability, and connection status, not general-purpose disclosure of secret values. |
| **Diagnostics** | Owner-reported Workspace, Handbook, Substrate, environment, harness, provider, and projection health, with authorized recovery paths. |

Related destinations may be nested together or exposed ungrouped. A destination being discoverable does not grant permission to use its operations, and an unavailable capability MUST NOT be presented as ready merely because its entry is visible.

### 8.2 Configuration, environment, and enablement boundaries

Workspace configuration and policy Surfaces SHOULD show declared and effective values, their sources and overrides, validation, and the effect of proposed changes where the owner exposes that information. Substrate operational policy remains distinct from Handbook Charter, posture, Contracts, or other semantic governance. Collider application preferences remain presentation settings rather than Substrate Workspace policy.

Environment configuration MUST feed Substrate's existing World dependency tooling through owner-approved interfaces rather than a new Collider dependency engine. The UI SHOULD distinguish requirements from resolved/effective configuration and from actual realization or observed readiness where the source model supports those distinctions; these are explanatory views, not newly mandated lifecycle states. Environment Dependencies, Repository/package dependencies, and Extension capability dependencies MUST remain distinct.

A Harness Surface MAY bring native harness settings, Substrate adaptation and execution settings, and Collider presentation settings together, but MUST identify their owners and use the appropriate mutation boundary. Agent Profiles remain separate reusable configuration. Configuration precedence, profile/harness relationships, supported controls, and whether a change applies immediately, on the next Invocation, or after restart require owner-grounded design; no new schema or runtime capability is implied here.

Capability and integration Surfaces SHOULD distinguish availability or installation, Workspace enablement, authorization, and operational readiness where applicable. Enabling a skill, tool, app, Extension, or connection is not a navigator visibility change and MUST NOT implicitly issue a Capability Grant. Credential views SHOULD show authorized bindings and status rather than raw secrets. Diagnostics and Inbox views MUST preserve the authority of the systems whose state they report.

### 8.3 Default naming at the highest level only

**Collider-shipped labels at the highest level of the default navigator MUST be one word.** This covers root-level group headings and default ungrouped root-level destinations; it does not constrain every level of the tree.

Possible root headings include **Planning**, **Execution**, **Resources**, and **Setup**. These illustrate the naming rule, not a frozen hierarchy. Nested entries may use names such as **Agent Profiles**, **Configuration & Policy**, **Capabilities & Integrations**, or **Models & Providers**. **Inbox** is the preferred default destination label; users may choose **Notifications** or another name.

Canonical terminology is unchanged: **Control Plane**, **Qualified Session**, and **Agent Profile** remain those architectural concepts. A root display alias such as **Home** MAY refer to Control Plane. User-created group names and user-promoted items are not bound by the default naming rule, and promoting a multiword entry to the root MUST NOT automatically rename it.

### 8.4 User customization and host composition

Collider V1 MUST support basic Navigator Layout customization. Users MUST be able to:

- create and rename Navigator Groups;
- add or remove displayed eligible Navigator Items within groups;
- move and reorder groups and items, including displaying an item ungrouped at the root;
- recover hidden eligible destinations and restore a default arrangement.

These are Presentation Actions. Labels, membership, order, and visibility MUST NOT change underlying object identity, Handbook Scope, Lane binding, policy, permissions, capability enablement, or execution lifetime. **Remove from navigator** means hide or remove a presentation reference, not delete an object, retire a Lane, uninstall an app, or disable a harness. Removing a group MUST NOT remove the underlying destinations.

Collider retains authority over eligible built-in and contributed items, valid Extension Points, permissions, accessibility, and recovery. Providers may contribute through approved interfaces but MUST NOT overwrite the user's arrangement or reinsert hidden entries merely on reload. A Navigator Group is not itself a semantic scope or a new permission boundary.

Collider SHOULD retain user layout preferences. Such changes MUST NOT silently rewrite Substrate operational configuration or policy, or another user's arrangement. Preference storage, application/user/Workspace scoping, synchronization, explicit shared defaults, aliases, and provider-unavailability behavior remain open under C-OQ-025. Basic navigator customization is distinct from the deferred general-purpose pane/layout builder.

### 8.5 Discoverability and staged delivery

The following rules remain foundational:

1. a Lane remains discoverable when no Tab displays it, even when its navigator shortcut is hidden;
2. Workstreams and execution activity need not be represented as conventional chat titles, while users may prioritize the dedicated Sessions destination;
3. Handbook navigation exposes semantic objects and registered projections rather than requiring backing-file navigation;
4. Work remains a projection over owner-defined work state rather than a separate Collider task authority;
5. Repositories are resources of a Workspace, not replacements for it;
6. selecting a Navigator Item SHOULD open the appropriate center Surface without requiring another application mode;
7. customization MUST preserve a discoverable path to hidden eligible destinations, required execution awareness, cancellation, and recovery.

A populated dedicated **Work** section remains secondary to the first coherent slice until its Work Item kinds and projections are sufficiently defined. Work Items SHOULD remain discoverable through Handbook, the Control Plane, Lane or Artifact Surfaces, search, or other owner-defined paths; Collider SHOULD NOT render empty placeholder sections merely to satisfy this coverage map.

The expanded configuration, harness, environment, enablement, Inbox, and Sessions Surfaces are accepted product destinations with staged delivery under Section 15. The exact default hierarchy, interaction design, and first implementation of each belong to the Workspace Shell contract; operational behavior belongs to the appropriate owner and Execution and Binding work. Neither those details nor a concrete persistence mechanism are selected here.

## 9. Surfaces, Blocks, Sticky Placements, and Tabs

### 9.1 Protocol-neutral Surface model

Collider's core application model MUST be based on typed Surfaces rather than on one transport protocol.

A Surface may be:

- Collider-native;
- Substrate-provided;
- Handbook-provided;
- adapted from an MCP App or another extension mechanism.

MCP Apps are a possible provider mechanism. They are not the definition of all Collider applications.

### 9.2 Three presentation placements

Collider's Surface model SHOULD distinguish three principal placements:

```text
inline placement
    the Surface appears in chronological Workstream flow

Sticky Placement
    an additional Workstream-local placement remains visible while flow scrolls

Tab placement
    the Surface is opened in the center Tab bar for focused access
```

These placements may refer to the same Surface or to a provider-declared related expanded Surface. None of them owns the represented Handbook, Substrate, MCP App, repository, or shell state.

### 9.3 Sticky Stack

A Workstream Surface SHOULD support a small bounded Sticky Stack so that important items such as a plan, Contract, design reference, test status, or execution status can remain visible while new Blocks continue below.

Creating a Sticky Placement MUST:

- preserve the original chronological Block;
- create only additional presentation state;
- remain local to the relevant Workstream Surface or projection placement;
- avoid making the item sticky automatically in every other projection where it appears.

Collider SHOULD compact the Sticky Stack when it would consume excessive space. Two or three fully visible items is a plausible direction, but the exact capacity, persistence, compaction, ordering, and controls remain unresolved.

Sticky behavior MAY be deferred from the first vertical implementation slice, but the Surface and placement model SHOULD avoid making it impossible.

### 9.4 Open as tab

The preferred user-facing action for creating a Tab placement is **Open as tab**. Architecture documents may call this **Tab Promotion**.

The action may be initiated through:

- drag into the Tab bar;
- an `Open as tab` action;
- a context menu;
- a keyboard-accessible command.

Drag MUST NOT be the only available mechanism.

The originating Block SHOULD remain as a compact chronological anchor. The exact rule for whether the Tab shares the same Surface identity or opens a provider-declared canonical expanded Surface remains unresolved.

### 9.5 Tabs are apertures, not owners

A Tab is a center-workspace host for a focused Surface Placement.

Tabs SHOULD represent meaningful working Surfaces such as:

- the Control Plane;
- a Lane Workstream Surface;
- a Handbook Artifact or Contract browser;
- a design Surface;
- execution or test results.

Collider SHOULD avoid recreating file-tab overload as its primary navigation model. Files may open inside editor or repository Surfaces without automatically becoming top-level Workspace Tabs.

Closing a Tab removes a placement only. The underlying Lane, Workstream, execution, Artifact, Work Item, provider object, or repository state continues according to its owner.

## 10. Background Execution and Ambient Awareness

Collider is designed for execution that may continue while its associated Surface or Tab is not visible.

This requires two separate guarantees.

### 10.1 Presentation-independent lifetime

No Collider component may implicitly own the lifetime of Substrate execution merely because it displays that execution.

Unmounting a component, closing a Tab, switching Workstreams, or closing a lane-related Surface MUST NOT implicitly stop background work.

Stop or cancel behavior MUST be an explicit action routed through Substrate.

### 10.2 Persistent awareness

Because background work can outlive visible Surfaces, Collider V1 MUST provide minimum persistent awareness of ongoing execution and execution that requires user attention. A concrete implementation MAY distinguish states such as active, queued, blocked, failed, or completed; the detailed status vocabulary is not frozen here.

The first version does not require a full execution debugger. It does require:

- a lightweight Workspace-wide activity indicator;
- discoverable Lane-level activity state where applicable;
- a path to open a richer execution-status Surface;
- a clear explicit stop/cancel action for user-controllable work;
- the ability to reconnect a Surface to ongoing or completed execution state.

Internal execution detail SHOULD be progressively disclosed beneath user-meaningful activity rather than flooding the top-level UI. The exact execution hierarchy and vocabulary remain provisional.

Navigator customization MUST NOT remove all awareness of active or attention-requiring execution or all access to cancellation and recovery. No particular navigator row must be permanently locked merely to satisfy this rule; a persistent indicator and another discoverable route may provide access.

Inbox read or dismissal state MUST NOT be treated as approval, Gate satisfaction, unblocking, cancellation, or resolution of an owner-system obligation. An action that changes authoritative acknowledgment or work state must use the relevant owner-system boundary rather than masquerade as a local Presentation Action.

## 11. Context and Continuity Model

Collider SHOULD be described as **resolution-reconstructed** or **session-independent by default**, not stateless.

The system is highly stateful. Its durable state exists in Handbook, Substrate, source systems, Workstream projection metadata, repositories, execution records, and Collider presentation preferences. What Collider avoids is making one long chat transcript the sole memory and authority for future work.

### 11.1 Per-Invocation reconstruction

Each meaningful Invocation SHOULD be resolved and assembled against its current:

- Workspace;
- Scope and Resolution Posture;
- Work Item or target concern;
- Lane and repository state where applicable;
- current owner-system state;
- purpose and requested action.

A later Invocation may receive a newly reconstructed Context Pack rather than inheriting an unbounded transcript.

### 11.2 Transcript and projection as history, not sole memory

A Workstream preserves or reconstructs useful interaction and activity continuity, but its visible Activity Projection is not automatically injected wholesale into future model context.

Prior interaction may be:

- selected through Handbook Resolution;
- distilled into durable Artifacts, decisions, Work Items, or state;
- referenced through Context Records, Source Records, execution records, or Receipts;
- omitted when irrelevant to the current Invocation.

This enables continuity without requiring conventional chat-session organization or one canonical Workspace event log.

### 11.3 Explicit Qualified Session Continuity

Collider's default behavior SHOULD remain resolution-reconstructed. Each Invocation may receive newly resolved and assembled context appropriate to its current purpose even when it occurs in the same Workstream as a prior Invocation.

The architecture MUST nevertheless preserve room for an explicit request to bind to, resume, reuse, or continue a Qualified Session owned by a model provider, runtime, shell, PTY, or agent harness. Continuation MUST be intentional and visible; remaining in the same Workstream, Lane view, Tab, or adjacent message sequence MUST NOT silently continue a Qualified Session.

A Qualified Session is not a Workstream. One Workstream may project activity associated with zero, one, or several Qualified Sessions over time, and one Qualified Session's activity may appear in several Workstream projections where policy permits. A dedicated **Sessions** destination MUST be available when the Session Continuity capability is delivered. Its Surface may present another Activity Projection without replacing Workspace or Workstream identity.

Collider's default organization MUST NOT be Session-centric, but users MAY choose prominent or primarily Session-oriented navigation in their own Navigator Layout, including an ungrouped Sessions item. That user preference does not change the resolution-reconstructed default. Opening, regrouping, or highlighting the Sessions destination MUST NOT itself imply continuation. Actual Session entries MUST identify their provider or runtime, and continuation remains intentional and visible.

Session History may provide Source Records for Activity Projection and may support owner-scoped continuity, reconstruction, pagination, or resume. It is not the Workspace's canonical history and does not settle whether Workspace activity uses one history, federation, an index, query-time composition, or a hybrid.

Resuming a Qualified Session may preserve only the provider- or runtime-owned state that the Qualified Session explicitly promises. Before a new Invocation uses that continuity, current Handbook Scope or Resolution, Lane binding, Substrate policy, Capability Grants, permissions, and provider/model compatibility MUST be revalidated where applicable; stale values MUST NOT be silently inherited merely because a Qualified Session resumes.

A future capability may support one-Invocation continuation, a persistent session-oriented continuity mode, and an explicit return to resolution-reconstructed behavior. The exact commands, UI state, resume handles, provider guarantees, expiry, recovery, disconnection behavior, branching, lifecycle, and V1 delivery timing remain open.

### 11.4 Inspectable context lineage

The following distinctions SHOULD be retained in the underlying system even if their detailed UI is deferred:

```text
Resolved   what Handbook determined was applicable
Injected   what Substrate actually delivered
Acquired   what execution later observed
Produced   what execution created
```

Stable references among these stages and the relevant Source Records or Activity Items are important for future context inspection, debugging, Evidence workflows, and provenance.

Collider V1 does not require the complete right-side context X-ray, but implementation work SHOULD avoid discarding the records required to build it later.

## 12. Handbook Experience in Collider

Handbook should feel like an integrated semantic system, not a folder of configuration files.

Collider SHOULD be capable of presenting polished, purpose-specific Handbook Surfaces for concepts such as:

- Charter;
- architecture;
- Contracts;
- Work Items;
- decisions;
- future design artifacts;
- other registered Artifact kinds.

### 12.1 Semantic navigation before files

The Workspace Navigator SHOULD expose Handbook objects through owner-defined identity and Projection rather than requiring users to locate and edit their serialized backing files.

Physical files remain inspectable through Repository or filesystem Surfaces when useful, but they are not the primary UX contract for Handbook.

### 12.2 Owner-approved editing

A displayed Projection is not automatically a lossless editable source.

Collider MUST only present an Artifact as directly editable when Handbook exposes a valid mutation path. Depending on Artifact capabilities, editing may use:

- structured field mutation;
- a candidate or patch workflow;
- validation and promotion;
- a source-backed lossless editor;
- a read-only Projection.

Chat-based editing MUST also use Handbook-owned mutation semantics rather than directly rewriting arbitrary projected text or backing files.

### 12.3 Registry-driven growth

Collider SHOULD consume Handbook's registered Artifact kinds, instances, capabilities, and Projections. It MUST NOT hardcode the assumption that the currently named Charter, Contract, architecture, or design categories are the complete future Handbook model.

Curated shortcuts are allowed. Semantic ownership remains Handbook-driven.

## 13. Right-Side Inspector

The optional right-side Inspector is lower priority than:

1. the Workspace Navigator;
2. the center Control Plane and Workstream model;
3. inline rich Surfaces;
4. inline, Sticky, and Tab Surface placements;
5. minimum persistent execution awareness.

V1 essential work MUST remain possible with the Inspector hidden or absent.

When later implemented, the Inspector MAY provide selection-driven views for:

- an Artifact, file, Contract, Work Item, or design object;
- execution activity;
- context lineage;
- relationships, history, tests, Evidence, or provenance.

The Inspector SHOULD NOT become the mandatory destination for expanded applications, and this document does not freeze its idle-state behavior.

## 14. Accessibility and Progressive Disclosure

Collider is a developer tool, but its semantic and conversational interaction model should make it usable by people who are not expert terminal or IDE users.

Collider V1 SHOULD provide:

- natural-language access to the same Workspace capabilities exposed through commands;
- semantic Handbook views rather than requiring direct file manipulation;
- progressive disclosure of advanced runtime and execution detail;
- keyboard-accessible alternatives to drag interactions;
- explicit raw-output and execution details for users who need them;
- clear distinction between view changes and destructive or execution-stopping actions.

Accessibility MUST NOT be achieved by hiding execution truth or silently changing shell behavior. Simplicity should come from structured presentation and good defaults, not from removing inspectability.

## 15. V1 Product Scope

### 15.1 Required first coherent vertical slice

The smallest coherent Collider V1 SHOULD include:

1. opening a Substrate Workspace;
2. a persistent Workspace Navigator with identity-bearing Navigator Items and the highest-level-only default naming rule;
3. Handbook, Lanes, and Repository navigation;
4. a canonical Control Plane Workstream Surface;
5. a unified terminal-like Composer;
6. shell-shaped and natural-language Invocations in the same center environment;
7. typed Blocks and a protocol-neutral Surface host;
8. a Workstream and Activity Projection boundary that produces stable Activity Items through at least one recognized, built-in Projection Definition without requiring one canonical event store or a dynamic projection-registration system;
9. at least one first-party Handbook Surface;
10. at least one first-party Lane or execution-status Surface;
11. inline rendering of eligible Surfaces;
12. opening an eligible Surface as a center Tab;
13. closing and reopening Surface placements without destroying owner-system state;
14. background execution independent of visible Tabs;
15. minimum persistent execution awareness and explicit stop or cancel access;
16. stable Source Record references and Activity Item Business Identities sufficient to incrementally update, reconnect, trace, and reconstruct projected Surfaces;
17. Handbook mutations routed through Handbook-owned capabilities.

### 15.2 Secondary V1 work

Basic Navigator Layout customization under Section 8.4 is a V1 requirement, although it need not block the first coherent vertical slice. Its delivery must support group creation and renaming, membership and ordering changes, ungrouped items, hiding/restoration, and recovery without altering owner-system state.

Additional secondary work includes:

- first-party configuration and policy, Agent Profile, Agent Harness, environment/dependency, and capability/integration Surfaces through supported owner interfaces;
- Inbox, credential-binding status, and broader diagnostics Surfaces;
- Sticky Placements and a bounded Sticky Stack;
- richer Handbook structured editing;
- a rich Repository browser;
- source editing Blocks;
- saved Tab and presentation layouts across application restarts;
- richer Lane status summaries;
- a populated `Work` section in the Workspace Navigator;
- additional first-party Surface types;
- user-facing Workstream branching and reprocessing;
- deeper activity and execution-history navigation;
- explicit Qualified Session Continuity and the dedicated Sessions destination, including user-chosen prominent or ungrouped access.

### 15.3 Deferred beyond the first shell

The following are explicitly deferred:

- a full Control Plane dashboard;
- pipelines and visual workflow construction;
- arbitrary pane docking or general-purpose layout composition beyond basic Navigator Layout customization;
- detailed public third-party extension security and isolation implementation;
- broad external MCP App support;
- production-grade dynamic-extension loading, hot replacement, and composability guarantees;
- a full context X-ray or agent debugger UI;
- a complete internal execution-tree visualization;
- detailed right-side Inspector behavior;
- Storybook or Open Design integration;
- comprehensive design-system management;
- user-authored UI layout commands;
- multi-Workspace Project orchestration.

These deferrals do not include basic Navigator Layout customization or the dedicated Sessions destination. Their staged V1 scope remains in Section 15.2; default organization remains non-Session-centric while user-selected Session navigation is supported.

Deferred features MUST layer onto the foundational model rather than redefine the ownership and lifecycle boundaries established here.

## 16. Foundational Invariants

The following are the primary Collider V1 foundations:

1. **Workspace is the canonical top-level Substrate configuration and policy boundary.**
2. **Workspace is not a synonym for Repository or Project.**
3. **Handbook owns semantic truth; Substrate owns execution truth; Collider owns projection, presentation, and interaction.**
4. **Collider MUST NOT become a competing Handbook, Substrate, MCP App, shell, or provider authority.**
5. **A Lane is independent of every Tab or Surface that displays it.**
6. **A Workstream is an interaction context and ordered Activity Projection, not an execution environment or assumed independent event log.**
7. **The Control Plane is a Workspace-level Workstream Surface, not a Lane or a single PTY.**
8. **The Control Plane SHOULD be Lane-unfiltered, while Lane views SHOULD reuse the same core Workstream components with an internal Lane filter.**
9. **Lane-unfiltered does not mean raw or unrestricted internal telemetry.**
10. **The center Workstream is the primary place where terminal, agent, Handbook, and application interaction converge.**
11. **Commands MAY produce interactive applications rather than only text.**
12. **A durable or reconstructable Block SHOULD be traceable to sufficient Source Records, references, or owner-system objects without becoming their authority.**
13. **The UX may present one coherent activity flow without requiring one canonical Workspace event store.**
14. **A Surface may have inline, Sticky, and Tab placements.**
15. **A Sticky Placement is local presentation state and preserves the chronological Block.**
16. **Open as tab creates focused presentation; it is distinct from making an item Sticky.**
17. **Closing a Tab, removing a Sticky Placement, or unmounting presentation MUST NOT implicitly stop work or delete durable state.**
18. **Background execution requires persistent user-visible awareness.**
19. **Each Invocation may be resolved anew; a Workstream Activity Projection is not the sole context authority.**
20. **The default interaction model is resolution-reconstructed; Qualified Session Continuity is explicit and optional, and remaining in one Workstream MUST NOT imply it.**
21. **Projection is not automatically canonical or editable Artifact source.**
22. **Handbook mutation MUST use Handbook-owned semantics.**
23. **Collider's Surface model is protocol-neutral; MCP is one possible provider mechanism.**
24. **In-process composition and capability mediation are not security isolation; untrusted executable extensions require an actual Isolation Boundary.**
25. **Permission to render or contribute UI does not imply host execution authority or unrelated host capabilities.**
26. **Automatic cleanup and reversion claims are limited to Mediated Effects; a Compensating Action is not exact rollback.**
27. **Crash and non-graceful failure safety MUST NOT depend solely on graceful extension cleanup.**
28. **Raw terminal and shell semantics remain available and truthful.**
29. **The right-side Inspector is additive, hideable, and nonessential to the first coherent V1.**
30. **Execution-instance and agent-topology vocabulary remains provisional until separately resolved.**
31. **Durable meaning and execution history survive independently from the UI currently displaying them.**
32. **Dynamically reconfigurable Extensions SHOULD aim for Spatiotemporal Composability, but the current architecture does not claim that guarantee.**
33. **Temporal Composability claims are limited to mediated and attributable contributions with valid cleanup, recovery, or inverse behavior evaluated under a declared recovery criterion; External Effects and Compensating Actions do not imply exact reversion.**
34. **Spatial Composability is driven by declared requirements and provisions, reactive Extension Lifecycle behavior, and orderly dependent teardown before provider withdrawal where required.**
35. **Extension access to host functionality SHOULD use owner-mediated and attributable Capabilities where practical rather than undocumented ambient globals.**
36. **Required and Provided Capability declarations SHOULD inform Extension eligibility and lifecycle while providers retain authority for the state and services they expose.**
37. **An Extension Context and Extension Context Mediation MUST NOT become a cross-system source of truth, replace Handbook Resolution or Substrate Context Packs, or substitute for an Isolation Boundary.**
38. **Cross-process Capabilities MUST represent asynchronous, availability, failure, cancellation, timeout, retry, and provider-loss semantics honestly where they apply.**
39. **Collider-owned layout declares valid Extension Points; authorized Contribution Providers contribute through scoped host-approved interfaces.**
40. **Extension Points compose Surfaces and controls without replacing the Surface abstraction or inline, Sticky, Tab, overlay, and Inspector presentation semantics.**
41. **UI Contributions remain provider-attributable, lifecycle-bound, and owner-system-bound; permission to contribute UI does not grant runtime or semantic authority.**
42. **Host accessibility, fallback, and recovery behavior MUST remain possible when a UI Contribution is absent, removed, replaced, or fails.**
43. **Workstream renderers SHOULD consume final Activity Items or bounded Surface models rather than repeatedly scan raw heterogeneous source histories.**
44. **Activity Items MUST have stable Business Identity independent of visual list position; that identity may be owner-supplied or deterministically projection-derived, and an Activity Item MAY fold multiple correlated Source Records or revisions while retaining inspectable provenance.**
45. **Projection assembly SHOULD be deterministic and replayable where source semantics permit, and incremental append or older-history loading SHOULD preserve unaffected projected identity and state where possible.**
46. **Projection Definitions, Activity Assemblers, and Projection Indexes own view-specific assembly rules and derived state, not semantic, execution, or Source Record authority.**
47. **Different Workstream projections MAY assemble the same Source Records differently; deterministic presentation order does not establish one authoritative total Source Record order, and this projection architecture does not select one canonical Workspace event store or require shared Activity Item identity across views.**
48. **A Workstream may span zero, one, or several Qualified Sessions; Session History may source Activity Projections without becoming the Workspace's canonical history or Workstream identity. Default navigation is not Session-centric, but users may prioritize Qualified Sessions in their own Navigator Layout.**
49. **Resuming a Qualified Session MUST NOT silently carry forward stale Handbook Scope or Resolution, Lane binding, Substrate policy, Capability Grants, permissions, provider availability, or model identity and configuration without applicable revalidation.**
50. **Purely local Collider presentation changes are Presentation Actions, not Invocations; a Surface action becomes an Invocation only when it requests owner-system behavior.**
51. **The one-word naming rule applies only to Collider-shipped labels at the highest level of the default navigator; descendant labels, user names, user-promoted items, and canonical architectural terminology are not constrained by it.**
52. **Users control supported Navigator Group names, membership, ordering, visibility, and ungrouped placement; stable Navigator Item identity and owner-system authority do not change with that arrangement.**
53. **Collider declares eligible navigation contributions and safe composition rules; providers MUST respect user layout choices, and customization MUST preserve required execution awareness, cancellation, and recovery.**
54. **Removing an item from navigation is not disabling a capability, deleting an object, changing policy, resuming a Session, or stopping execution.**
55. **Environment Dependency configuration feeds Substrate's World dependency tooling; Repository/package dependencies and Extension capability dependencies remain distinct.**
56. **A unified configuration Surface does not merge native harness, Substrate integration/policy, Agent Profile, or Collider presentation authority, and visible or enabled capability does not imply authorization or readiness.**
57. **Inbox read or dismissal state does not approve requests, satisfy gates, or resolve owner-system obligations; authoritative actions use the relevant owner boundary.**

## 17. V1 Acceptance Scenario

The foundational direction is proven when a user can complete the following flow:

1. open a Substrate Workspace in Collider;
2. see its durable Handbook, Lane, and Repository structure in the Workspace Navigator;
3. begin in the canonical Control Plane Workstream Surface;
4. submit both a shell-shaped command and a natural-language request through the same Composer;
5. see a coherent Lane-unfiltered activity view without requiring every provider to share one canonical event store;
6. request a Handbook Artifact and receive a typed inline Surface rather than being forced into its backing file;
7. use **Open as tab** on that Surface through drag, menu, or keyboard interaction;
8. open a Lane Workstream Surface that reuses the same core Workstream components with a Lane-filtered projection;
9. initiate Lane-bound work;
10. close the Lane-related Tab while the underlying execution continues;
11. retain visible Workspace-level awareness that background work remains active or needs attention;
12. reopen the Lane or execution Surface and reconstruct its current state from durable owner-system records or references;
13. explicitly stop or cancel work without confusing that action with closing presentation;
14. make any Handbook change through a Handbook-owned mutation path;
15. complete the flow without depending on a right-side Inspector, a dashboard, a giant chat-history list, or file tabs as the primary information architecture.

Before the V1 navigator capability is complete, a secondary acceptance path MUST demonstrate creating and renaming a group, moving an eligible item between groups and to the ungrouped root, reordering, hiding and restoring it, and restoring defaults. A multiword descendant or user-promoted item must keep its valid display name, and its identity, target state, permissions, and execution behavior must remain unchanged. Required execution awareness and controls must remain reachable.

As expanded destinations are delivered, acceptance must verify that environment edits use Substrate World dependency tooling, harness/profile and enablement changes reach the correct owner, Inbox dismissal does not resolve authoritative work, and users may prioritize Sessions without implicitly resuming one.

A later secondary slice may additionally prove that a Block can be made Sticky in one Workstream projection without becoming Sticky in another projection or being removed from chronological history.

If this flow is coherent, the initial Collider shell has established the intended product foundation.

## 18. Matters This Document Does Not Freeze

This document does not settle:

- whether the Workspace has one canonical event history, federated source histories plus an activity index, query-time federation, or a hybrid;
- whether Workstreams are stored entities, projection definitions, materialized indexes, or hybrids;
- Projection Definition registration authority, identity, versioning, compatibility, and invalidation;
- Activity Assembler location, process boundaries, incremental maintenance, replay, resynchronization, and gap repair;
- Projection Index persistence, snapshots, compaction, privacy, retention, and reconstruction;
- Business Identity formation, correlation, cross-source identity, causal relationships, deterministic presentation ordering, tie-breaking, paging, and cross-projection Activity Item identity sharing;
- the boundary between Source Records, Activity Items, Blocks, and large shell or PTY output streams;
- MCP App object, revision, snapshot, and provider-unavailability behavior;
- exact Control Plane and Lane Activity Projection inclusion rules;
- Qualified Session creation and identity, explicit resume handles, one-Invocation continuation versus persistent continuity mode, provider guarantees, Session History retention and pagination, expiry and recovery, disconnection and reconnection, branching or cloning, Session-to-Workstream cardinality, Lane-spanning behavior, revalidation, fallback, and future Session-oriented Surface behavior;
- Sticky Stack capacity, ordering, persistence, and compaction;
- whether Tab Promotion shares one Surface identity or opens a provider-declared expanded Surface;
- the final execution-instance or agent-topology vocabulary;
- exact execution-tree cardinalities;
- protocol or persistence schemas;
- command parsing and dispatch algorithms;
- Lane creation, rebinding, retirement, or worktree lifecycle details;
- the exact Work Item kind system and the populated dedicated `Work` Navigator projection;
- final navigator labels and grouping below the highest-level default naming constraint, item/shortcut identity, customization gestures, preference storage and sharing, migration, and provider-restoration behavior;
- Environment Dependency configuration sources, effective requirements, realization, readiness, drift, Lane relationships, and the concrete interface to existing Substrate World tooling;
- native harness, Substrate integration, Agent Profile, and Collider presentation configuration schemas, precedence, compatibility, and effects on active execution or Qualified Sessions;
- workspace capability/integration enablement mechanics, credential-binding views, and diagnostics contracts;
- Inbox aggregation, notification/read/dismiss semantics, owner-system acknowledgments, delivery, and retention;
- detailed status vocabularies;
- exact visual dimensions, styling, or component design;
- right-side Inspector modes or idle behavior;
- detailed extension trust classifications, isolation technology, capability-security mechanisms, and External Effect cleanup contracts;
- capability keys, identity, schemas, compatibility, versioning, provider identity and selection, multiple-provider behavior, failover, and Dependency Declaration format;
- Extension Context hierarchy and derivation, Workspace/Lane/Workstream/qualified-Session scoping, Extension Context Mediation and Capability Interception mechanics, relationship to Substrate policy and Handbook semantics, and local versus cross-process capability bridges;
- Extension Contribution atomicity and granularity, lifecycle state transitions, declared recovery criteria, exact equality versus observational equivalence, disposer or inverse composition and ordering, asynchronous teardown, partial-activation recovery, configuration reconciliation, dependency cycles, hot replacement, update rollback, and evidence required for composability claims;
- Extension Point declaration schemas and identity, `Slot` as a possible implementation term, UI Contribution Scope, multiplicity, ordering, fallback, election, replacement and conflict policy, nested-point and descendant lifetimes, React and Tauri rendering boundaries, styling isolation, accessibility enforcement, provider failure handling, client/host pairing, and contributed-Surface serialization or restoration;
- multi-Workspace Project semantics.

These matters are tracked in [`02-collider-v1-open-architecture-questions.md`](./02-collider-v1-open-architecture-questions.md). Later documents may define them, but MUST preserve the foundational ownership, continuity, traceability, and presentation-independence rules established here unless this document is explicitly amended.

## 19. Downstream Document Boundaries

This foundations document is accompanied by the following decision register and should be followed by two bounded contracts.

### `02-collider-v1-open-architecture-questions.md`

Tracks unresolved architectural decisions, research requirements, candidate shapes, and closure criteria. It is non-normative and MUST NOT be treated as implementation authority.

### `03-collider-v1-workspace-shell.md`

Owns the concrete user-facing shell, including:

- overall layout;
- Workspace Navigator destination delivery, default hierarchy and labels, grouping, visibility, keyboard/drag interaction, and restore-default behavior;
- Navigator Layout preferences, contributed-item presentation, and user-selected Sessions prominence;
- Inbox, configuration, harness, profile, environment, enablement, credential-status, and diagnostics presentation;
- Control Plane and Lane Workstream presentation;
- Workstream and Composer interaction;
- local Presentation Actions and their boundary from Invocations;
- Block and Surface presentation modes;
- Sticky Stack behavior when included;
- **Open as tab** behavior;
- minimum execution-awareness placement;
- optional Inspector placement.

### `04-collider-v1-execution-and-binding.md`

Owns the operational path from Invocation to execution, including:

- command and request routing;
- Workspace-bound versus Lane-bound operations;
- Lane selection and binding;
- owner-approved application of configuration and policy changes, Environment Dependencies through Substrate World tooling, Agent Harness and Agent Profile settings, and workspace capability enablement;
- Qualified Session resumption and revalidation, authoritative Inbox actions, and the effects of operational changes on active work;
- background execution and reconnection;
- stop and cancellation behavior;
- execution hierarchy once its vocabulary is resolved;
- Context Record and provenance requirements;
- source-record and Activity Projection synchronization boundaries selected through the open-question process.

Neither downstream document should redefine the canonical terms in the glossary or weaken the foundations established here without an explicit coordinated revision.
