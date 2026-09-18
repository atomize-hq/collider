# Collider V1 Glossary and Concept Model

**Status:** Proposed canonical terminology for Collider V1\
**Document role:** Terminology and relationship authority\
**Applies to:** Collider V1 product, UX, architecture, protocol, and implementation documents\
**Implementation authorization:** None; this document defines vocabulary and conceptual boundaries only\
**Provisional sections:** 6.7–6.14 — execution-instance and agent-topology vocabulary\
**Open architecture register:** [`02-collider-v1-open-architecture-questions.md`](./02-collider-v1-open-architecture-questions.md)

## 1. Purpose and Authority

This document defines the canonical terms used by the Collider V1 program. Its purpose is to prevent the product, UI, Substrate runtime, and Handbook integration from assigning different meanings to the same words.

All later Collider V1 documents SHOULD reference this glossary rather than redefine its terms. When a later document requires a narrower rule, it MAY refine a term for that bounded context, but it MUST NOT contradict this document without explicitly updating or superseding the affected definition here.

External research, reference architectures, and implementation studies are non-normative inputs unless an authorized Collider document explicitly adopts a result. Reusing an external architectural pattern does not automatically import the source project's terminology, schemas, APIs, lifecycle model, package boundaries, or authority assumptions. A term originating outside Collider becomes canonical only through an explicit change to this glossary that defines its Collider meaning and reconciles it with existing terms and owner-system boundaries.

Capitalized terms such as **Workspace**, **Lane**, **Workstream**, **Invocation**, **Run**, **Surface**, and **Tab** refer to the definitions in this document.

Any section or term explicitly marked **Provisional Draft** is excluded from this document's canonical authority. It records current design thinking only. Normative keywords inside a provisional section express candidate constraints rather than settled protocol, schema, persistence, compatibility, or implementation requirements. References elsewhere in this document to a provisional term inherit that provisional status unless the surrounding text explicitly identifies a terminology-independent invariant.

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative:

- **MUST / MUST NOT** identify required invariants.
- **SHOULD / SHOULD NOT** identify strong defaults that require an explicit reason to violate.
- **MAY** identifies permitted but optional behavior.

Where this glossary summarizes a term whose canonical semantic authority belongs to Handbook, Handbook's own definition remains authoritative. Collider MUST consume and present that meaning; it MUST NOT create a competing definition.

## 2. Compact Concept Model

The shortest useful distinction among the primary terms is:

| Primitive | Question it answers | Primary authority |
|---|---|---|
| **Workspace** | Within what Substrate configuration and policy boundary are we operating? | Substrate |
| **Scope** | Semantically, what does this work concern? | Handbook |
| **Work Item** | What durable outcome or obligation is being pursued? | Handbook |
| **Lane** | Where and under what execution conditions does work run? | Substrate |
| **Workstream** | Through which interaction context and ordered activity projection is work directed, observed, and revisited? | Collider for projection and presentation; source systems retain record authority |
| **Qualified Session** | Which owner-specific provider or runtime continuity resource may be explicitly resumed? | The relevant provider or runtime |
| **Session History** | Which owner-scoped records support reconstruction, resumption, audit, or explanation of a Qualified Session? | The relevant provider or runtime |
| **Presentation Action** | What local Collider presentation-state change was requested? | Collider |
| **Invocation** | What owner-system action was accepted through Collider? | Substrate |
| **Run** *(provisional)* | What execution occurred? | Substrate |
| **Source Record** | What durable or durably addressable owner-system record supports reconstruction or explanation? | The producing source system |
| **Projection Definition** | By what host-recognized rules are eligible Source Records correlated and assembled for a target view? | Collider projection machinery; source systems retain record authority |
| **Activity Projection** | Which stable projected activity is assembled for a particular Workstream view? | Collider projection over owner-system records and references |
| **Activity Item** | What stable projected business object may be rendered in the Workstream? | Collider projection metadata; backing authority remains with source systems |
| **Block** | How is an Activity Item, response, or application currently rendered inline? | Collider |
| **Surface** | What typed application or view is being rendered? | Collider, backed by owner-system state |
| **Sticky Placement** | What Workstream-local placement remains visible while chronological activity scrolls? | Collider presentation state |
| **Tab** | Where is a Surface opened for focused center-workspace access? | Collider |

A simplified presentation model is:

```text
Workspace owner systems and providers
├── Handbook Artifacts, snapshots, and semantic records
├── Substrate Invocations, Receipts, and execution records
├── MCP App objects, revisions, or references
├── shell / PTY command and output records
└── Collider Presentation Actions and presentation references
                         │
                         │ host-recognized Projection Definitions
                         ▼
                 Activity Assembler
                  + Projection Index
                         │
                         ▼
                 Activity Projection
                         │
          Activity Items with stable Business Identity
                         │
                rendered as Blocks
                         │
                   may host Surfaces
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       inline         sticky           Tab
      placement      placement       placement
```

The Control Plane and Lane views SHOULD be capable of using the same core Workstream, Block, Surface, and Composer components:

```text
Workspace-relevant Activity Projection
├── Control Plane Workstream Surface
│   └── no Lane filter
└── Lane Workstream Surface
    └── internal filter = selected Lane
```

`No Lane filter` means **lane-unfiltered**, not “show every raw byte, internal tool event, provider callback, or telemetry record.” Projection eligibility, progressive disclosure, and internal-detail policy still apply.

This glossary intentionally does **not** select a canonical Workspace event-store architecture. The visible Workstream may ultimately be backed by one Workspace history, federated owner-system histories plus an activity index, query-time federation, or a hybrid. That decision is tracked in the open architecture register.

The durable invariant is narrower:

> **A Block is presentation derived from one or more traceable Source Records, durable references, or reconstructable owner-system objects; the Block does not become their authority.**

## 3. System Authorities

### 3.1 Handbook

**Handbook** is the semantic-authority system integrated into the broader Substrate product stack.

Handbook owns the canonical meaning and lifecycle of structured semantic artifacts, including applicable schema and artifact-kind semantics, Scope and Resolution, Projection, contracts, admitted Evidence, verdicts, gates, and related semantic relationships.

Collider MAY render, inspect, and initiate owner-approved mutations of Handbook state. Substrate MAY resolve and consume Handbook semantics during execution. Neither system becomes a second Handbook authority.

### 3.2 Substrate

**Substrate** is the workspace, policy, runtime, execution, agent, tool, process, and orchestration engine beneath Collider.

Substrate owns Workspace identity, Lane and provisional Run execution state, tool and process authority, accepted Invocation records, Substrate execution records and Receipts, raw runtime telemetry, and the runtime assembly and delivery of context.

Substrate consumes Handbook Resolution and Projection results. It does not redefine their semantic meaning.

### 3.3 Collider

**Collider** is the human-facing application and interaction layer over Substrate and integrated Handbook capabilities.

Collider owns the presentation and interaction model, including Presentation Actions, the Workspace Navigator, Control Plane presentation, Workstream and Activity Projection behavior, Activity Items, Blocks, Surfaces, Surface Placements, Tabs, Sticky Placements, and optional Inspector behavior.

Collider MUST NOT own the authoritative lifecycle of a Lane, provisional Run, Handbook Artifact, Contract, Work Item, Source Record, provider object, or other owner-system state merely because it displays that state.

### 3.4 Authority

**Authority** means the system that determines the canonical meaning, accepted state transitions, and durable identity of an object.

A system that renders, caches, indexes, or requests a mutation of an object is not necessarily that object's authority.

### 3.5 Trusted Extension

A **Trusted Extension** is executable extension code explicitly authorized by the host's deployment and policy model to run within a designated trusted process or runtime.

`Trusted` is an execution-trust classification. It does not grant Handbook semantic authority, Substrate execution authority, unrestricted host access, or permission to bypass Capability Grants and mediation. Permission to contribute UI does not by itself grant filesystem, process, network, credential, clipboard, browser, host-object, or semantic-mutation capability.

### 3.6 Untrusted Extension

An **Untrusted Extension** is executable extension code that is not authorized to execute with the ambient authority of a trusted host process or runtime.

Untrusted Extensions MUST remain behind an Isolation Boundary before they execute or receive any mediated host capability. They MUST NOT receive trusted-process authority merely because their requested capabilities appear limited.

### 3.7 Isolation Boundary

An **Isolation Boundary** is an enforceable process, runtime, operating-system, or equivalent containment boundary intended to limit unauthorized access, fault propagation, and ambient capability use by executable code.

An Isolation Boundary is distinct from a context object, registry, API wrapper, or Capability Grant. Capability mediation may narrow what isolated code can request, but it does not itself establish isolation. This glossary does not select a specific isolation technology.

### 3.8 Capability Grant

A **Capability Grant** is an explicit, scoped authorization allowing an identified extension or provider to request or use a particular host capability under defined constraints.

A Capability Grant MAY be issued and enforced only by the authority governing the relevant capability and policy seam, or by an explicitly delegated authority. A consumer cannot self-authorize. A provider may issue or enforce a grant only when it is itself the governing authority or has been explicitly delegated that role. A Capability Grant MAY be attenuated, revoked, and audited according to owner policy. It does not create an Isolation Boundary and does not transfer owner-system authority. A grant to render or contribute UI does not imply a grant to execute host code or access unrelated host resources.

### 3.9 Mediated Effect

A **Mediated Effect** is an effect initiated through a host-controlled interface that allows the host to observe it, attribute it to an owner or lifetime, and control the portion of its lifecycle that remains within that interface's boundary.

Only Mediated Effects may support claims of automatic host tracking, cleanup, or reversion, and only to the extent actually controlled by the mediation boundary.

### 3.10 External Effect

An **External Effect** is an effect that crosses the host-controlled mediation boundary or becomes observably committed in another system, process, filesystem, network destination, credential store, or other external state.

An External Effect is not automatically reversible. Its contract may require transactionality, copy-on-write, idempotent cleanup, a Compensating Action, or explicit classification as non-revertible.

### 3.11 Compensating Action

A **Compensating Action** is a later action intended to offset or mitigate the consequences of an earlier effect when an exact inverse is unavailable or inappropriate.

Compensation is not exact rollback. It may fail, may create additional observable history, and may not restore the prior state precisely.

### 3.12 Extension

An **Extension** is a bounded unit of optional or dynamically reconfigurable functionality that contributes behavior or integration through host-recognized seams.

An Extension MAY be first-party or third-party. Its permitted execution placement depends on its trust classification and host policy: a Trusted Extension may be authorized to run in a trusted process, while an Untrusted Extension remains subject to Section 3.6 and MUST execute behind an Isolation Boundary. Being an Extension does not grant Handbook semantic authority, Substrate execution authority, ambient host access, a Capability Grant, or any particular trust classification. Its loading mechanism, implementation language, package structure, and isolation mechanism are separate concerns.

### 3.13 Extension Contribution

An **Extension Contribution** is an attributable capability, service, UI contribution, renderer, tool, command, configuration contribution, subscription, or other bounded host-visible behavior made available by an Extension.

An Extension Contribution remains subject to the authority and capability boundaries of the systems it interacts with. Permission to contribute UI does not imply permission to execute host code or use unrelated runtime capabilities.

### 3.14 Extension Lifecycle

An **Extension Lifecycle** is the host-observed progression through which an Extension becomes eligible, activates, remains active or inactive, deactivates, is replaced or updated, fails, and may recover.

The final lifecycle state machine is not defined by this glossary. A lifecycle claim is meaningful only to the extent that the host can observe and control the relevant Extension Contributions and effects. Graceful deactivation MUST NOT be assumed to run after every failure or crash.

### 3.15 Revertible Contribution

A **Revertible Contribution** is an Extension Contribution for which the host has a valid, attributable, host-tracked inverse or restoration path that restores the relevant observable host state under a declared recovery criterion, within a declared mediated boundary and under stated preconditions.

Best-effort cleanup, resource abandonment, retry, and a Compensating Action do not make a contribution revertible. A Revertible Contribution does not imply that related External Effects can be exactly reversed.

### 3.16 Temporal Composability

**Temporal Composability** is a design objective for dynamically reconfigurable Extensions: within the actual mediated and attributable system boundary, removing, deactivating, replacing, or recovering an Extension should remove or restore its attributable contributions without restarting unrelated host functionality, disturbing unrelated host state, or leaving attributable residual state behind.

Temporal Composability is not an automatic guarantee. It is bounded by the host's ability to track contributions, execute valid inverse or recovery behavior, contain failures, and distinguish External Effects or non-revertible behavior.

### 3.17 Spatial Composability

**Spatial Composability** is a design objective under which Extensions declare the capabilities or services they require and provide, and their Extension Lifecycles react to dependency availability and identity.

The objective favors activation only when declared requirements are satisfied; orderly inactivity or deactivation when requirements disappear or materially change; reactivation when requirements become satisfied again; and dependent teardown before provider withdrawal when cleanup requires the provider. This definition does not select a concrete dependency-resolution API or implementation.

### 3.18 Spatiotemporal Composability

**Spatiotemporal Composability** is the combined design objective of Temporal Composability and Spatial Composability for a bounded class of dynamically reconfigurable Extensions.

It MUST NOT be presented as a formal or system-wide guarantee without evidence for the specific extension class, mediated boundary, lifecycle behavior, dependency discipline, confinement, valid recovery or inversion behavior, and any required independence, commutativity, or ordering conditions. The current Collider V1 documents adopt the objective; they do not claim that it has been proved or fully implemented.

### 3.19 Capability

A **Capability** is an owner-mediated interface through which an identified consumer may request bounded functionality or service behavior from an identified provider.

A Capability exposes access without transferring the provider's authority or copying its canonical state into the consumer. The provider remains authoritative for the state, behavior, lifecycle, and constraints it exposes. A Capability may be local or remote, and its contract MUST represent synchronous, asynchronous, failure, cancellation, and availability semantics honestly where they apply. Capability access remains subject to trust classification, Capability Grants, policy, and any required Isolation Boundary.

### 3.20 Required Capability

A **Required Capability** is a declared dependency that an Extension instance needs in order to become or remain eligible for a particular Extension Lifecycle state.

A Required Capability describes the needed interface, identity, and compatibility constraints rather than granting ambient access or transferring authority. Its absence, withdrawal, or material provider change may affect activation, inactivity, deactivation, or reactivation under the Spatial Composability objective.

### 3.21 Provided Capability

A **Provided Capability** is a Capability made available by an identified provider within a declared lifecycle and compatibility boundary.

The provider remains authoritative for the underlying state and service. Provision does not copy that authority into an Extension Context or consumer. Provider identity, availability, replacement, and withdrawal may affect dependent Extension Lifecycles.

### 3.22 Dependency Declaration

A **Dependency Declaration** is an inspectable statement of the Required Capabilities and Provided Capabilities associated with an Extension or provider, together with any declared identity or compatibility constraints.

A Dependency Declaration supports eligibility, dependency-topology inspection, and reactive lifecycle behavior. It is not automatically a Capability Grant, Handbook Contract, Substrate policy decision, package format, or concrete capability-resolution protocol.

### 3.23 Extension Context

An **Extension Context** is a bounded extension-facing capability environment associated with one Extension instance or another explicitly scoped composition environment.

An Extension Context resolves access to owner-approved Provided Capabilities subject to Dependency Declarations, Capability Grants, policy, trust classification, and provider availability. It MAY be derived or specialized for a Workspace, Lane, Workstream, Qualified Session, policy, audit, instrumentation, or trust condition, but it does not copy provider state or become a new cross-system source of truth.

An Extension Context is not Handbook Scope or Resolution, a Handbook Projection, a Substrate Context Pack, Injected Context, an Activity Projection, a Workstream, a React context, or a Workspace or Lane execution environment. It is also not an Isolation Boundary.

### 3.24 Extension Context Mediation

**Extension Context Mediation** is the routing of Extension capability access through an Extension Context and owner-approved provider interfaces so that access can be selected, attributed, constrained, observed, revoked, or audited.

Extension Context Mediation preserves the authority of the provider and the owner systems involved. It does not create semantic authority, copy canonical state, or establish security isolation.

### 3.25 Capability Interception

**Capability Interception** is host- or owner-approved augmentation of capability access to apply policy, audit, telemetry, instrumentation, attenuation, or other declared constraints without changing which system remains authoritative for the capability's state and service.

Interception MUST preserve the capability contract and MUST NOT disguise a remote or failure-prone operation as an infallible synchronous local call. Capability Interception is not an Isolation Boundary.

### 3.26 Contribution Provider

A **Contribution Provider** is an identified Extension, Surface Provider, or host-owned module authorized to register one or more UI Contributions through declared Extension Points.

A Contribution Provider remains attributable for the contributions it registers. Authorization to contribute UI does not make it authoritative for the owner-system state displayed by that UI and does not grant unrelated runtime Capabilities.

### 3.27 Extension Point

An **Extension Point** is a named, scoped, host-declared UI composition location through which authorized Contribution Providers may register UI Contributions.

Collider retains authority over the surrounding layout, the accepted contribution contract, and the policy governing the point. An Extension Point does not replace a Surface and is not itself an inline, Sticky, Tab, overlay, or Inspector placement. An Extension Point MAY be nested within another host-recognized Surface, but its declaring owner and lifecycle MUST remain explicit.

### 3.28 Extension Point Declaration

An **Extension Point Declaration** is the host-owned contract that identifies an Extension Point and describes which UI Contributions it may accept.

A declaration MAY constrain accepted contribution kinds, UI Contribution Scope, narrow props or handles, supported presentation modes, multiplicity, ordering, fallback, election, replacement, and conflict behavior. The concrete declaration schema is not defined by this glossary.

### 3.29 UI Contribution

A **UI Contribution** is an attributable, lifecycle-bound registration of a Surface, control, renderer, action, or related UI behavior into an authorized Extension Point.

A UI Contribution is not the Extension Point itself. A contributed Surface retains its Contribution Provider identity and all owner-system bindings. Cleanup follows the applicable Extension or provider lifecycle within the mediated boundary, and UI contribution permission does not imply filesystem, process, network, credential, semantic, or other host execution authority.

### 3.30 UI Contribution Scope

A **UI Contribution Scope** is the bounded set of host locations or composition conditions in which a UI Contribution is eligible to appear.

It MAY constrain a contribution by Workspace, Lane, Workstream, Qualified Session, Surface, provider, policy, trust condition, or another explicitly declared UI-composition dimension. UI Contribution Scope is not Handbook Scope and does not change semantic authority, execution placement, or Capability Grants.

### 3.31 Extension Point Policy

An **Extension Point Policy** is the host-defined policy governing admission and composition of UI Contributions at an Extension Point.

It MAY permit zero, one, or several contributions and MAY define keyed identity, ordering, priority, fallback, election, replacement, or conflict behavior. The policy governs presentation composition only; it does not transfer owner-system state or runtime authority to the selected Contribution Provider.

## 4. Workspace and Structural Terms

### 4.1 Workspace

A **Workspace** is a directory or root governed by its own Substrate configuration and policy boundary.

**Authority:** Substrate.

A Workspace MAY contain or reference:

- one or more repositories;
- Handbook state;
- Work Items and Scopes;
- Lanes and worktrees;
- Workstream identities, projection definitions, or reconstructable interaction contexts;
- provisional Runs and agents;
- tools and execution environments;
- Substrate-owned environment dependency configuration and Agent Profiles;
- Agent Harness configuration and Workspace-enabled skills, tools, apps, Extensions, and connections through their respective owners;
- Collider presentation state associated with that Workspace, including Navigator Layout preferences.

A Workspace is the canonical top-level entity that Collider opens in V1.

A Workspace is not defined by an open window, tab, terminal process, chat transcript, or repository. Closing Collider does not destroy the Workspace.

### 4.2 Project

**Project** is a reserved term and MUST NOT be used as a Collider synonym for Workspace.

A future system MAY define Project as:

- a Handbook semantic entity;
- a product-level grouping spanning multiple Workspaces;
- another explicitly owned higher-order concept.

Until such a definition exists, Collider V1 documentation and UI SHOULD use **Workspace** for the Substrate configuration and policy boundary.

### 4.3 Repository

A **Repository** is a version-controlled resource contained in or referenced by a Workspace.

A Workspace MAY contain zero, one, or multiple Repositories. Repository and Workspace are therefore not interchangeable.

A Repository MAY expose branches, commits, diffs, status, and tracked resources. Execution against a Repository still occurs under the containing Workspace and, when applicable, a Lane.

### 4.4 Worktree

A **Worktree** is a concrete checkout or working-tree resource used by a Lane.

A Worktree is one possible part of a Lane's execution binding. A Lane MAY use another isolation mechanism, and the Lane remains the canonical Collider/Substrate execution concept.

A Worktree does not own Workstreams, Runs, or Tabs.

### 4.5 Agent Harness

An **Agent Harness** is an agent-execution backend or runtime with which Substrate integrates. The term identifies an integration role, not an Agent Profile, model provider, Lane, Qualified Session, or the provisional Agent execution identity.

Native harness behavior and configuration remain governed by that harness. Substrate owns its adaptation, launch, execution-policy, and integration settings; Collider owns its presentation settings. One configuration Surface may expose these settings together without merging their authorities. **Harnesses** is a possible navigator label, not a new execution owner.

The exact configuration schemas, supported controls, compatibility model, and relationships among harnesses, profiles, models, Lanes, and Qualified Sessions require Substrate-grounded design under C-OQ-024. This definition does not establish a new harness protocol or settle the provisional execution topology.

### 4.6 Agent Profile

An **Agent Profile** is a reusable Substrate-owned configuration for an agent role or purpose. It may select or reference harness, model, instruction, skill, tool, environment, and execution defaults where the owner model supports them.

An Agent Profile is not an Agent Harness or a Qualified Session. It does not grant capabilities, override Substrate policy, or define Handbook Scope or Resolution merely by declaring defaults. Handbook profiles and native harness configuration retain their own meanings and owners.

The profile schema, inheritance, configuration precedence, compatibility, and application to active work remain owner-defined or open under C-OQ-024; this term does not canonize the provisional Agent model.

### 4.7 Environment Dependencies

**Environment Dependencies** are the execution-environment requirements consumed by Substrate's World dependency tooling, such as required toolchains, binaries, libraries, or services where that tooling supports them.

Collider may expose configuration and status for these requirements, but preparation, validation, and realization remain Substrate-owned. A declaration is not proof that a dependency has been realized or is ready. The existing World tooling's terminology and contracts control; Collider MUST NOT introduce a competing environment dependency engine.

Environment Dependencies are distinct from Repository/package dependencies and Extension Required Capabilities or Dependency Declarations. Relationships may be surfaced without merging their authority. Exact configuration sources, effective requirements, Lane relationships, realization, and readiness behavior remain open under C-OQ-023.

## 5. Handbook Semantic Terms

### 5.1 Handbook Artifact

A **Handbook Artifact** is a canonical structured semantic object governed by Handbook.

A Handbook Artifact MAY have one or more backing files or serialized representations, but it is not semantically equivalent to any one physical file.

Collider MUST interact with a Handbook Artifact through Handbook-owned identity, validation, and mutation semantics whenever those are available.

### 5.2 Scope

A **Scope** identifies the semantic subject, concern, or location to which work, context, or an artifact applies.

**Authority:** Handbook.

Examples may include a Workspace-wide concern, architectural area, feature, design area, contract family, Work Item, or task-level concern. The exact hierarchy and allowed dimensions are Handbook-owned.

Scope answers:

> What does this concern semantically?

Scope does not answer where execution occurs. That is the role of a Lane.

### 5.3 Resolution

**Resolution** is the Handbook-owned process that determines what semantic material is applicable for a given subject, purpose, posture, and bounded request.

Resolution does not mean “load the entire Workspace.” It may narrow, expand, omit, or project material according to Handbook rules.

A Resolution result is not automatically the exact content delivered to a model. Substrate may subsequently assemble a bounded runtime Context Pack from the applicable Handbook output and other authorized runtime material.

### 5.4 Resolution Posture

A **Resolution Posture** is a default semantic orientation associated with a Workstream, Surface, or Invocation.

Examples may include workspace orchestration, implementation, review, design, or contract remediation.

A Resolution Posture guides a new Resolution request. It is not a frozen context package and does not cause every Invocation in a Workstream to receive identical material.

### 5.5 Projection

A **Projection** is a Handbook-produced representation of canonical semantic state for a particular purpose, audience, Resolution, or interface.

A Projection MAY be filtered, composed, normalized, condensed, or otherwise purpose-specific.

Therefore:

> **Projection is not the canonical Artifact.**

Displayability does not imply editability. Collider MUST NOT assume that arbitrary edits to rendered Projection text can be round-tripped into canonical Handbook state.

A Projection is editable only when Handbook exposes an appropriate structured mutation, candidate, patch, or promotion path.

### 5.6 Work Item

A **Work Item** is a durable semantic object representing an outcome, obligation, task, packet, goal, remediation, or other unit of work.

**Primary authority:** Handbook, or another explicitly designated semantic owner surfaced through Handbook.

Specific Work Item kinds and lifecycle states are outside this glossary and SHOULD be defined by their owner.

A Work Item answers:

> What durable outcome is being pursued?

A Work Item does not define an execution environment and is not an interaction transcript.

One Work Item MAY be associated with multiple Workstreams and multiple Runs.

### 5.7 Work

**Work** is an aggregate UI or documentation label for Work Items and related status. It is not, by itself, a separate canonical entity.

A `Work` section in the Workspace Navigator SHOULD be a projection over owner-defined Work Items and relevant execution state. Collider MUST NOT create a competing informal task system merely to populate that section. The architecture reserves this section, but a populated dedicated `Work` Navigator section is secondary to the first coherent V1 slice until its Work Item kinds and projections are sufficiently defined.

### 5.8 Contract

A **Contract** uses Handbook's canonical contract-membrane meaning.

Collider may render Contract definitions, applicability, claims, status, associated Work Items, Evidence, verdicts, and gates. Collider does not define or evaluate Contract semantics independently.

### 5.9 Evidence

**Evidence** is proof admitted or normalized under Handbook's evidence semantics.

Raw logs, tool outputs, diffs, test output, and execution receipts are not automatically admitted Evidence. They may be candidates or inputs from which Handbook accepts or derives Evidence.

### 5.10 Verdict

A **Verdict** is a Handbook-owned evaluation result produced under the applicable Contract, claim, Evidence, and gate semantics.

Collider may display a Verdict but MUST NOT infer one from visual status or raw execution output.

### 5.11 Gate

A **Gate** is a Handbook-owned enforcement or promotion condition evaluated from authoritative semantic state.

A failed test, blocked execution, or warning in Collider is not automatically a Handbook Gate unless Handbook identifies it as one.

### 5.12 Receipt

A **Receipt** is a durable record that an operation, tool call, process, mutation, or other execution event occurred.

**Primary authority:** Substrate for execution receipts.

A Receipt may become input to Handbook Evidence admission, but:

> **Receipt is not automatically admitted Evidence.**

## 6. Lane, Workstream, and Execution Terms

### 6.1 Lane

A **Lane** is a durable, Substrate-owned execution partition within a Workspace.

A Lane determines where and under what operational conditions environment-touching work executes.

A Lane MAY define or reference:

- a purpose;
- a Worktree, branch, checkout, or repository binding;
- a working directory;
- an execution environment;
- runtime and tool configuration;
- a policy or capability projection;
- active and historical execution;
- relevant Scope or Work Item associations.

A Lane MAY exist and continue operating with no open Tab, Surface, or Workstream view.

A Lane does not own:

- an interaction transcript or Activity Projection;
- a Workstream;
- a Tab;
- a Block;
- a Surface;
- Handbook semantic authority.

A Lane answers:

> Where and under what conditions does execution happen?

### 6.2 Workstream

A **Workstream** is a durable or reconstructable interaction context through which users and applications direct, observe, and revisit work. Its visible sequence is an ordered **Activity Projection** rendered through a shared Workstream Surface.

A Workstream MAY have or reference:

- a stable identity or reconstruction key;
- a Resolution Posture;
- one or more associated Work Items or Scopes;
- an optional mutable default Lane binding;
- an internal Lane, Scope, Work Item, Qualified Session association, purpose, or other projection filter;
- Invocations and Activity Items relevant to the projection;
- Surfaces used to present or interact with projected activity.

A Workstream does **not** imply ownership of one independent event log. Its visible activity may be derived from records and references owned by Substrate, Handbook, MCP Apps, shell or PTY facilities, Collider, or other authorized providers.

Whether a Workstream is persisted as an independent entity, a projection definition, a materialized index, or a hybrid is unresolved. That persistence choice MUST NOT change its product-level role.

A Workstream does not own:

- a Worktree;
- an execution environment;
- an agent or process lifecycle;
- provisional Run state;
- a Lane;
- the canonical Source Records it projects;
- canonical Handbook state.

A Workstream answers:

> Through which interaction context and activity projection is this work being directed, observed, and revisited?

The Control Plane is the canonical Lane-unfiltered Workstream Surface. A Lane view SHOULD use the same core Workstream implementation with an internal filter and default binding for the selected Lane.

### 6.3 Lane versus Workstream

The operational difference is:

> **A Lane is where execution happens. A Workstream is where interaction and projected activity unfold.**

| Dimension | Lane | Workstream |
|---|---|---|
| Primary purpose | Establish execution conditions | Provide interaction continuity and an ordered Activity Projection |
| Primary authority | Substrate | Collider for projection and presentation; source systems retain record authority |
| Defines or references | Worktree, branch, working directory, environment, policy/capability projection, execution | Projection posture and filters, Invocations, Activity Items, Surfaces, Work Items, Scopes, and execution references |
| Executes work | Hosts environment-touching execution | Dispatches, observes, or links to execution |
| Owns a transcript | No | Presents a coherent ordered view; does not necessarily own the underlying source histories |
| Requires a visible Tab | No | No |
| May exist without the other | Yes | Yes |
| Typical example | `auth-refactor` execution partition | Control Plane or `Authentication` Lane-filtered interaction view |

The relationship is not one-to-one:

- one Lane MAY appear in multiple Workstream projections;
- one Workstream MAY observe or orchestrate activity associated with multiple Lanes;
- the Control Plane MAY show Lane-associated and Workspace-level Activity Items together;
- an individual environment-touching execution MUST still bind to exactly one Lane under the eventual execution model.

The exact association rules that determine when a Workspace-level Invocation and its later Lane-bound activity appear in one or more Workstream projections remain open.

### 6.4 Lane Binding

A **Lane Binding** associates an Invocation or execution instance with a specific Lane.

Three bindings MUST be distinguished conceptually:

1. **Workstream default Lane** — a mutable convenience used when new Invocations do not specify another target.
2. **Invocation target Lane** — the Lane resolved or selected for a particular accepted action.
3. **Execution Lane Binding** — the immutable execution record identifying where environment-touching work actually executed.

Changing a Workstream's default Lane MUST NOT rewrite historical Invocation or execution bindings.

An execution that reads from or mutates an execution environment MUST have exactly one Lane Binding before that environment access occurs. The final execution-instance vocabulary and orchestration topology remain provisional.

### 6.5 Invocation

An **Invocation** is one accepted request initiated through a Workstream or Surface and admitted by Substrate for routing to semantic, runtime, repository, provider, or other owner-system behavior.

Examples include:

- a shell command;
- a natural-language agent request;
- a Collider or Substrate command that requests owner-system behavior;
- a Handbook query or mutation request;
- an action initiated from a Surface that requests owner-system behavior.

An Invocation SHOULD record or reference:

- stable identity;
- origin Workstream or Surface;
- user or application input;
- time and actor;
- applicable Scope and Resolution request/reference;
- selected or resolved Lane Binding, if any;
- resulting Source Records, Activity Items, outputs, or references;
- an optional execution reference using the eventual execution vocabulary;
- provenance when derived from an earlier selection or Invocation.

An Invocation MAY produce no provisional Run or other execution instance, but it MUST cross an owner-system boundary. Purely local UI changes are Presentation Actions rather than Invocations. Editing or reissuing an earlier Invocation MUST create a new derived Invocation rather than rewrite the historical one.

### 6.6 Command

A **Command** is an Invocation payload expressed in a recognized command dialect.

Possible dialects include raw shell syntax, Collider commands, Substrate commands, or Handbook-oriented commands.

Collider MAY enhance the presentation of a Command's result, but it MUST preserve the command's actual execution semantics, output, exit status, and Receipt when the Command is executed as shell or Substrate work.

### Provisional status of Sections 6.7–6.14

> **Exploratory draft — non-canonical.**
>
> Sections 6.7–6.14 record the current working model for execution instances, execution hierarchy, and agent participation. The names, boundaries, cardinalities, ownership, nesting, and lifecycle relationships among **Run**, **Root Run**, **Child Run**, **Run Node**, **Run Tree**, **Agent**, **Subagent**, and **Subtask** are not frozen. They MUST NOT yet be treated as settled schemas, protocol types, persistence entities, compatibility commitments, or implementation authority. Later design work may rename, merge, split, redefine, or replace these concepts.
>
> Surrounding Collider invariants—such as presentation not owning execution lifetime and closing UI not implicitly cancelling background work—may remain valid independently. This draft cluster does not settle the execution model or vocabulary that will ultimately realize those invariants.

### 6.7 Run *(Provisional Draft)*

A **Run** is a durable execution instance managed or observed by Substrate.

A Run MAY execute an agent, workflow, process, tool sequence, gate evaluation, or orchestration operation.

A Run has a lifecycle independent of any Collider component displaying it. Unmounting a React component, closing a Tab, closing a Surface, or leaving a Workstream MUST NOT implicitly stop the Run.

A Run MAY produce:

- Child Runs or other Run Nodes;
- tool and process activity;
- file or artifact changes;
- logs and Receipts;
- candidate Evidence;
- results and errors;
- Source Records or references eligible for one or more Activity Projections.

A Run is not a chat session and is not an Agent identity.

### 6.8 Root Run *(Provisional Draft)*

A **Root Run** is the top execution node associated with one Invocation.

A Root Run may directly execute work or may orchestrate Child Runs. A Root Run that is not Lane-bound MUST NOT directly access an execution environment.

### 6.9 Child Run *(Provisional Draft)*

A **Child Run** is a Run whose parent is another Run.

Child Runs support delegation, parallelism, review, verification, or other bounded execution beneath a user-meaningful Root Run.

Child Runs SHOULD remain nested under their parent in default Collider views unless they become independently meaningful to the user.

### 6.10 Run Node *(Provisional Draft)*

A **Run Node** is any addressable node in a Run Tree.

A Run Node may represent:

- an agent execution;
- a Child Run;
- a tool operation;
- a process;
- a review step;
- a gate evaluation;
- another typed execution activity.

Not every Run Node needs to appear as a top-level user-facing agent or Workspace object.

### 6.11 Run Tree *(Provisional Draft)*

A **Run Tree** is the parent/child execution topology rooted at a Root Run.

A Run Tree preserves the relationship among a user-meaningful execution and its internal agents, subtasks, tools, reviews, and verification steps.

Default Collider views SHOULD emphasize the Root Run and progressively disclose internal Run Nodes.

### 6.12 Agent *(Provisional Draft)*

An **Agent** is an execution actor or harness capable of participating in one or more Runs.

An Agent is not itself a Run, Workstream, Lane, Tab, or Work Item.

A single Agent identity MAY participate in multiple Runs. A Run Tree MAY contain multiple Agent-backed nodes.

### 6.13 Subagent *(Provisional Draft)*

A **Subagent** is an Agent-backed Child Run or Run Node delegated by another Run.

Subagents SHOULD normally remain nested under the user-meaningful parent Run. Collider MUST NOT create a new top-level Tab, Lane, or Workstream for every internal Subagent by default.

### 6.14 Subtask *(Provisional Draft)*

**Subtask** SHOULD be reserved for a semantic child Work Item when the governing work model defines one.

Ephemeral internal execution should instead use **Child Run**, **Run Node**, **operation**, or another precise runtime term. This prevents semantic work decomposition from being confused with internal agent machinery.

### 6.15 Source Record

A **Source Record** is a durable record, durable object revision, or durably addressable reference produced and governed by an authorized source system.

Examples may include:

- a Substrate Invocation, Receipt, execution record, or structured result;
- a Handbook Artifact, snapshot, delta, verdict, or Evidence reference;
- an MCP App object identity or revision reference;
- a shell or PTY command record, output reference, or structured summary;
- a Collider Presentation Action or presentation-state reference.

Source Records do not need to share one schema or storage engine. Their meaning, lifecycle, and mutation authority remain with their producing systems.

A Source Record SHOULD expose stable owner-system identity, revision, ordering, or causal metadata where its source model provides those concepts. The same Source Record or durable reference MAY participate in more than one Projection Definition or Activity Projection without transferring authority to the projection machinery.

Not every transient terminal byte, UI callback, or internal telemetry item must become an individually durable Source Record. The capture and retention boundary remains open.

### 6.16 Activity Projection

An **Activity Projection** is a user-facing view with deterministic presentation order, produced by applying one or more host-recognized Projection Definitions to eligible Source Records, durable references, or reconstructable owner-system objects for a particular target view.

Its presentation order MUST be sufficient for deterministic rendering and navigation for a given projection state and Projection Definition version. That order does not imply that the underlying Source Records possess one authoritative total order; source ordering and causality may remain partial, concurrent, late-arriving, or owner-specific.

An Activity Projection MAY be shaped by:

- Workspace;
- Lane association or Lane filter;
- Scope or Work Item;
- purpose or Resolution Posture;
- Qualified Session association;
- user visibility and progressive-disclosure rules;
- another declared projection dimension.

The Control Plane uses a Workspace-relevant, Lane-unfiltered Activity Projection. A Lane Workstream Surface uses the same general model with an internal Lane filter and default Lane binding.

Different Activity Projections MAY consume some of the same Source Records while applying different Projection Definitions, filters, correlation rules, visibility rules, Business Identities, or projected locations. Exact Activity Item identity sharing across projections remains unresolved.

Projection assembly SHOULD be deterministic and replayable to the extent that the contributing source systems provide stable identity, revision, ordering, and reconstruction semantics. Incremental append and older-history loading SHOULD preserve unaffected projected identity and fold state where possible. Pagination, replay, resynchronization, and gap repair are explicit projection operations rather than renderer-side rescans of raw heterogeneous history.

An Activity Projection does not become the authority for the Source Records it selects. It also does not imply one canonical Workspace event log.

The persistence, indexing, ordering, federation, retention, compaction, and invalidation model for Activity Projections is unresolved.

### 6.17 Activity Item

An **Activity Item** is an addressable projected business object within an Activity Projection.

An Activity Item MUST have or derive stable Business Identity within its applicable Projection Definition and target view. That identity is independent of visual list position, page boundaries, current renderer, and the order in which records happen to arrive. An object without stable Business Identity is not an Activity Item; intentionally ephemeral output may render directly as a Block without becoming one.

An Activity Item MAY be backed by:

- one Source Record;
- several correlated Source Records or revisions folded into one projected object;
- a stable reference plus a reconstruction recipe;
- a provider-owned object and revision;
- a structured summary derived from a larger output stream.

An Activity Item may carry projection metadata such as Workspace, Lane, Scope, Work Item, Qualified Session association, causal relationship, ordering information, visibility, display hints, Projection Definition identity or version, and inspectable references to its contributing Source Records.

Where the source and Projection Definition semantics permit it, an Activity Item SHOULD preserve its Business Identity through incremental append, older-page loading, pagination, replay, and renderer changes. A Block is the current visual rendering of an Activity Item. Changing the Block renderer does not change the Activity Item's Business Identity or the underlying Source Records.

Whether Activity Items themselves are materialized, indexed, or computed on demand, and whether equivalent items share identity across different Activity Projections, remain open.

### 6.18 Chat, Conversation, Qualified Session, and Session History

**Chat** and **Conversation** describe interaction styles, not the canonical durable architecture.

A **Qualified Session** is an owner-specific continuity resource whose type is identified by the relevant provider or runtime, such as a `model-provider session`, `agent-harness session`, `shell session`, or `PTY session`. Its identity, lifecycle, resumability, and continuity guarantees belong to that provider or runtime.

**Session** MUST NOT be used unqualified as a synonym for Workstream, Lane, Invocation, Activity Projection, or provisional Run. A Qualified Session does not become authority for Handbook semantic truth, Lane execution placement, Substrate policy, or Collider Workstream identity.

A **Session History** is an owner-scoped record or reconstructable history sufficient to support the continuity guarantees of a Qualified Session. A Session History MAY use event sourcing when the owning provider or runtime supplies those semantics, and MAY contribute Source Records to one or more Activity Projections where policy permits. It is one possible source history, not the canonical Workspace history, and it does not decide the Workspace-history architecture.

Collider's default interaction model is resolution-reconstructed: each Invocation may receive newly resolved and assembled context rather than automatically continuing a prior Qualified Session. Qualified Session association SHOULD remain traceable on relevant Source Records, Activity Items, and Context Records where the owning system and policy permit it.

### 6.19 Session Continuity

**Session Continuity** is an explicit, user-visible request to bind one or more Invocations to a Qualified Session by creating, resuming, reusing, or continuing it.

Remaining in the same Workstream, Lane view, Tab, or adjacent message sequence MUST NOT by itself imply Session Continuity. A Workstream may project activity associated with zero, one, or several Qualified Sessions over time, and one Qualified Session's activity MAY appear in several Workstream projections where policy and visibility rules permit.

Session Continuity may preserve provider- or runtime-owned state only to the extent promised by the Qualified Session. It MUST NOT silently preserve or bypass current validation of Handbook Scope or Resolution, Lane binding, Substrate policy, Capability Grants, permissions, provider availability, or model identity and configuration.

Collider SHOULD preserve room for one-Invocation continuation and a future session-oriented continuity mode while keeping resolution-reconstructed behavior as the default. A dedicated **Sessions** navigator destination is part of the product direction; users MAY prioritize it in their own Navigator Layout. Its entries MUST identify the relevant provider or runtime, and opening or moving that destination MUST NOT itself resume a Qualified Session. The exact continuation commands, UI states, provider guarantees, resume handles, rebinding rules, failure behavior, and delivery slice remain open.

### 6.20 Projection Definition

A **Projection Definition** is a host-recognized, version-addressable declaration describing how eligible Source Records or references become stable projected business objects for a target Activity Projection.

A Projection Definition MAY be built into the host or dynamically registered through an authorized mechanism. Dynamic registration authority, lifecycle, compatibility, and migration remain open.

A Projection Definition MAY declare:

- source eligibility and matching;
- correlation and Business Identity formation;
- deterministic fold or update behavior;
- target-view visibility and materialization rules;
- ordering or projected-location metadata;
- Activity Item kind and renderer-facing output shape;
- source-reference and fold-provenance requirements.

A Projection Definition does not own the Source Records it consumes and does not become semantic or execution authority. Its registration authority, compatibility rules, versioning, and invalidation behavior remain open.

### 6.21 Business Identity

**Business Identity** is the stable domain identity used by a Projection Definition to correlate records or revisions that represent the same projected business object.

Business Identity MUST be independent of visual list position. It MAY be supplied by an owner system or deterministically derived from stable source fields. It is projection identity, not owner-system authority, and it does not by itself imply that two Activity Projections share one Activity Item identity.

### 6.22 Activity Assembler

An **Activity Assembler** is the technology-neutral projection mechanism that applies host-recognized Projection Definitions to eligible Source Records or references and produces or updates Activity Items.

An Activity Assembler MAY maintain projection-specific fold state and Projection Indexes for initial reconstruction, incremental append, older-history loading, pagination, replay, resynchronization, and gap repair. It does not own source-system meaning or lifecycle, and its process, language, placement, and persistence topology remain unresolved.

### 6.23 Projection Index

A **Projection Index** is derived, projection-specific state used to correlate Source Records, locate existing Activity Items, maintain fold state, preserve predecessor or ordering relationships, and update only affected projected objects.

A Projection Index SHOULD remain rebuildable or otherwise reconcilable from its declared source and snapshot inputs to the extent permitted by the chosen source and persistence architecture. It is not a source of semantic or execution authority. Its materialization, storage, snapshot, compaction, privacy, and retention behavior remain open.

## 7. Presentation and Interaction Terms

### 7.1 Block

A **Block** is an inline visual unit rendered within a Workstream Surface.

A Block MAY present:

- user input;
- command or shell output;
- an agent response;
- an execution update;
- a file or diff;
- a static summary;
- a rich interactive Surface.

A Block is a presentation object. It does not own the Activity Item, Artifact, Lane, provisional Run, Work Item, Source Record, provider object, or other durable state it displays.

Intentionally ephemeral visual output MAY render directly as a Block without becoming an Activity Item. A durable or reconstructable projected object MUST be represented as an Activity Item with stable Business Identity before it is rendered as a Block. A durable or reconstructable Block SHOULD be traceable to one or more Activity Items, Source Records, durable references, or owner-system objects sufficient to explain or reconstruct it. The relationship need not be one Block to one Source Record, and one Activity Item may have different Block renderings or placements over time.

A Workstream Block renderer SHOULD consume a final Activity Item or bounded Surface view model. It SHOULD NOT repeatedly scan arbitrary raw heterogeneous source collections to rediscover correlation and fold state that belongs to a Projection Definition and Activity Assembler.

### 7.2 Surface

A **Surface** is a typed, addressable application or view rendered by Collider.

A Surface SHOULD have or reference:

- a stable identity;
- a provider or application kind;
- its Workspace binding;
- optional Scope, Work Item, Lane, Workstream, Invocation, provisional Run, Artifact, Repository, Qualified Session, or Activity Item bindings;
- a durable state reference or reconstruction recipe;
- supported presentation modes and actions;
- declared capabilities.

Examples include:

- a Handbook Artifact viewer;
- a Contract browser;
- a Lane overview;
- a Workstream view;
- a repository browser;
- a source editor;
- a plan;
- test results;
- an active-execution view;
- a terminal or PTY.

A Surface renders owner-system state but MUST NOT become the owner of that state merely because it is interactive.

### 7.3 Surface Provider

A **Surface Provider** is the implementation that creates or renders a type of Surface.

A Surface Provider may be:

- Collider-native;
- Substrate-provided;
- Handbook-provided;
- adapted from an MCP App or another extension protocol.

Collider's core Surface model MUST remain protocol-neutral. MCP is one possible provider or transport mechanism, not the definition of a Surface.

### 7.4 Surface Placement

A **Surface Placement** is one presentation of a Surface in a particular UI host.

The principal placement types are:

- an inline placement in the chronological Workstream flow;
- a Sticky Placement in the Workstream's Sticky Stack;
- a focused placement in a center-workspace Tab.

A Surface MAY have more than one placement. Creating or removing a placement does not create, duplicate, or destroy the owner-system state represented by the Surface.

### 7.5 Tab

A **Tab** is a center-workspace host for a focused Surface Placement.

A Tab is not a Lane, Workstream, file, process, Agent, provisional Run, or state owner.

Closing a Tab MUST remove only that placement. It MUST NOT implicitly:

- stop execution;
- retire a Lane;
- archive a Workstream;
- delete an Artifact;
- remove a Work Item;
- terminate a worktree or process;
- erase Source Records or interaction history.

A Tab MAY display a Workstream Surface, Lane Surface, Handbook Surface, result Surface, or another application type.

### 7.6 Tab Promotion / Open as tab

**Tab Promotion** is the Presentation Action that creates a Tab placement for an eligible Surface currently shown inline or discovered elsewhere.

The preferred user-facing label is **Open as tab**. Dragging a Surface into the Tab bar MAY invoke the same action, but drag MUST NOT be the only available mechanism.

Tab Promotion is not ownership transfer and need not physically remove the originating Block. The originating Block SHOULD remain as a compact chronological anchor or reference.

The Tab placement SHOULD refer to the same Surface identity or to a provider-declared canonical expanded Surface. The exact identity and state-sharing contract remains open.

### 7.7 Sticky Placement

A **Sticky Placement** is a Workstream-local placement that keeps an eligible Block or Surface visible while the chronological activity flow scrolls beneath it.

Creating a Sticky Placement MUST NOT remove or relocate the original chronological Block. It creates an additional presentation reference.

Stickiness is local to the relevant Workstream Surface or projection placement. If the same Activity Item appears in both the Control Plane and a Lane-filtered Workstream, it may be sticky in one and not the other.

A Sticky Placement is not a Tab placement and does not change Source Record, Lane, execution, Work Item, or Handbook state.

### 7.8 Sticky Stack

A **Sticky Stack** is the small ordered collection of Sticky Placements attached to a Workstream Surface.

Collider SHOULD keep the Sticky Stack deliberately bounded and SHOULD compact it when its contents would consume excessive center-workspace space. A likely design range is two or three fully visible items, but the exact capacity, compaction behavior, persistence, and user controls are not frozen.

### 7.9 Workstream Surface

A **Workstream Surface** is the shared Collider Surface that renders an Activity Projection as Blocks and provides a Composer for new Invocations.

The Control Plane and Lane views SHOULD use the same core Workstream Surface implementation, Block renderer, Surface host, selection behavior, Sticky Stack, and Composer infrastructure. Their principal difference is projection and binding posture rather than a separate application architecture.

### 7.10 Control Plane

The **Control Plane** is the canonical Workspace-level Workstream Surface opened by default in Collider V1.

The Control Plane:

- begins with a broad Workspace-orchestration Resolution Posture;
- uses a Workspace-relevant Activity Projection with no Lane filter;
- has no implicit default Lane unless one is explicitly selected or established;
- may inspect, coordinate, and dispatch work across Lanes;
- may host terminal, chat-like, Handbook, execution, and other rich Blocks;
- is not itself a Lane;
- is not required to be a dashboard;
- is not architecturally equivalent to one shell or PTY session.

`No Lane filter` does not require exposing every low-level or internal record. Default projection rules MAY collapse or omit internal machinery while preserving inspectability.

For V1, the Control Plane SHOULD initially appear as a minimal block-oriented Workstream Surface with a terminal-like Composer.

### 7.11 Lane Workstream Surface

A **Lane Workstream Surface** is a Workstream Surface whose Activity Projection is internally filtered to a selected Lane and whose Composer normally uses that Lane as its default binding.

It SHOULD reuse the same core components as the Control Plane. The Lane filter does not need to be exposed as public query syntax.

A Lane Workstream Surface is not the Lane itself. Closing it does not stop or retire the Lane or its execution.

The exact inclusion rules for Workspace-level Invocations that later dispatch into the Lane, cross-Lane orchestration, shared Activity Items, and historical rebinding remain open.

### 7.12 Composer

The **Composer** is the input surface through which a user submits a new Invocation to the active Workstream.

The Composer MAY accept shell commands, Collider or Substrate commands, natural-language requests, structured actions, or application-generated input.

The Composer's routing behavior does not change the definitions of Invocation, Lane Binding, Activity Projection, or provisional Run.

### 7.13 Terminal Surface

A **Terminal Surface** is a Surface that provides raw or enhanced shell or PTY interaction.

A Terminal Surface is one application type inside Collider; it is not the architectural definition of the Control Plane or Workstream.

When operating in raw shell or PTY mode, normal shell semantics MUST be preserved.

### 7.14 Workspace Navigator

The **Workspace Navigator** is the persistent left-side Collider Surface for discovering Workspace destinations and arranging access to them through Navigator Items and Navigator Groups.

Its conceptual destinations include the Control Plane, Inbox, Handbook, Work, Lanes, execution activity, Qualified Sessions, Agent Harnesses, environments and Environment Dependencies, Repositories, Agent Profiles, Workspace configuration and policy, capabilities and integrations, credential bindings, and diagnostics. This is destination coverage, not a fixed root-level tree or a requirement to deliver every destination in the first slice; Foundations Section 8 governs product scope and defaults.

Collider defines eligible items and safe composition rules. Users control supported grouping, group labels, item ordering and visibility, and whether an item appears ungrouped. These Presentation Actions MUST NOT change underlying identity, ownership, permissions, capability enablement, execution binding, or lifecycle.

The default organization SHOULD foreground durable Workspace structure rather than chronological chat titles. Users MAY prominently expose the Sessions destination, including at the root, without making a Qualified Session a Workstream or changing the resolution-reconstructed default. The highest-level default naming rule is defined in Section 12; it does not constrain every descendant or user-customized label.

### 7.15 Inspector

The **Inspector** is an optional, selection-driven contextual surface, typically rendered in the right sidebar.

It may inspect objects, provisional Runs, Context Records, Source Records, or activity. It is not the primary owner or canonical list of active execution, and V1 essential behavior MUST NOT depend on it.

### 7.16 Active Execution Indicator

An **Active Execution Indicator** is a persistent, lightweight Collider presentation of Workspace-wide execution status.

It may summarize running, queued, blocked, failed, or attention-requiring user-meaningful execution and provide access to a richer execution Surface.

The indicator displays Substrate state; it does not own that state. The final execution terminology remains provisional.

### 7.17 Reopen and Reconstruct

To **Reopen** a Surface means to create a new placement for an existing or reconstructable Surface identity.

To **Reconstruct** a Surface means to render its current useful view from owner-system state, Source Records or durable references, Activity Projection metadata, and saved presentation references.

Reconstruction does not require restoring the exact in-memory component tree, copying every provider payload into Collider, or treating an old chat transcript as the sole source of context.

### 7.18 Presentation Action

A **Presentation Action** is a Collider-owned interaction that changes only Collider presentation state and does not request semantic, runtime, repository, provider, or other owner-system behavior.

Examples include making or removing a Sticky Placement, using **Open as tab**, collapsing or expanding a Block, changing focus, changing a local selection, and creating or renaming Navigator Groups or regrouping, reordering, showing, or hiding Navigator Items. These changes affect Collider presentation only. Enabling a Workspace integration, changing an Agent Profile or Substrate policy, realizing Environment Dependencies, or resuming a Qualified Session requests owner-system behavior and therefore requires an Invocation rather than a mere layout change.

A Presentation Action MAY be retained as a Collider-owned Source Record when restoration, audit, provenance, or durable user history requires it. Recording the action does not transfer its presentation-state authority to Substrate or another source system.

### 7.19 Navigator Item

A **Navigator Item** is an identity-bearing destination or reference offered through the Workspace Navigator. It may open an appropriate Surface or browse owner-defined resources. Its identity MUST remain independent of its display label, group membership, ordering, and visibility.

An item may appear in a Navigator Group or ungrouped at the root. Moving or hiding its presentation does not rename, disable, delete, authorize, or rebind the target object. **Remove from navigator** removes or hides the presentation reference; it is not an owner-system deletion or capability-disable operation. Eligible hidden destinations MUST remain recoverable through a discoverable host path.

A Navigator Item is not itself the target Surface or owner-system object. Whether multiple shortcuts share one item identity or use separate references remains an implementation question under C-OQ-025.

### 7.20 Navigator Group

A **Navigator Group** is a user-visible presentation container for organizing Navigator Items. It is not a Handbook Scope, execution partition, permission boundary, or configuration owner.

Collider supplies default groups; users MUST be able to create and rename groups and change their displayed membership within supported navigation rules. Removing a group MUST NOT delete or disable the destinations it previously displayed. User-defined names are not subject to the one-word default naming convention.

### 7.21 Navigator Layout

A **Navigator Layout** is the Collider-owned presentation arrangement of Navigator Groups, grouped and ungrouped Navigator Items, display labels, ordering, visibility, and related local view preferences.

Users MUST be able to customize that arrangement and recover hidden eligible items or restore a default arrangement without modifying represented owner-system state. Layout changes MUST NOT silently change another user's arrangement or be written as Substrate operational configuration or policy. Preference persistence, app/user/Workspace scoping, synchronization, and explicitly shared defaults remain open under C-OQ-025.

Host-declared Extension Points still govern eligible contributions and safe composition. Contribution Providers MUST NOT overwrite user organization or restore hidden items merely because a contribution reloads. Navigation customization does not grant capabilities and MUST preserve access to required execution awareness, cancellation, and recovery.

### 7.22 Inbox

**Inbox** is the preferred default destination label for notifications and actionable items drawn from their owner systems. It is a presentation and access point, not a new authority for approvals, obligations, Work Items, gates, or execution status. Users may choose a display label such as **Notifications**.

Collider-local read or dismissal state is presentation state and MUST NOT implicitly approve a request, satisfy a Gate, unblock execution, or resolve an owner-system obligation. Any acknowledgment or resolution that changes owner-system state must use that owner's authorized operation. Source selection, delivery, grouping, retention, and exact read/dismiss semantics remain open under C-OQ-026.

## 8. Context and Inspection Terms

### 8.1 Resolved Set

A **Resolved Set** is the semantic material Handbook identifies as applicable to a bounded Resolution request.

The Resolved Set may be broader than the material ultimately delivered to a model or agent.

### 8.2 Context Pack

A **Context Pack** is the Substrate-assembled runtime payload prepared for a specific model or agent invocation.

A Context Pack may contain:

- Handbook Projections or references;
- current Work Item and Scope state;
- Lane and repository state;
- authorized runtime instructions;
- selected prior results, decisions, or Receipts;
- other bounded execution material.

A Context Pack is specific to a particular execution step. It is not the permanent memory of a Workstream.

### 8.3 Injected Context

**Injected Context** is the exact content and metadata made model-visible for a particular model invocation.

Injected Context is a subset or transformation of the available Resolved Set and runtime material.

### 8.4 Acquired Context

**Acquired Context** is material observed after execution begins through authorized tools, file reads, queries, browser operations, agent messages, or other runtime interactions.

Acquired Context MUST be distinguished from Injected Context because it entered execution through a different provenance path.

### 8.5 Produced Material

**Produced Material** is output created by execution, including responses, patches, files, decisions, test results, Receipts, candidate Evidence, or other artifacts.

Produced Material does not become canonical Handbook state or admitted Evidence merely because execution created it.

### 8.6 Context Record

A **Context Record** is the durable linkage needed to explain what an execution step or model invocation was resolved against, what was injected, what was acquired, and what it produced. It SHOULD be traceable to the relevant Source Records and Activity Items without requiring Collider to own their canonical payloads.

The detailed Collider Inspector for Context Records may be deferred, but the underlying identities and references SHOULD be captured from the first V1 implementation.

The canonical distinctions are:

```text
Resolved   what Handbook determined was applicable
Injected   what Substrate actually delivered to the model
Acquired   what execution later observed
Produced   what execution created
```

## 9. Lifecycle Verbs

The following verbs MUST remain distinct.

### 9.1 Open

**Open** creates or focuses a presentation of an existing entity or Surface.

Opening does not create a new Lane, Workstream, or execution instance unless the invoked action explicitly requires one.

### 9.2 Close

**Close** removes or hides a UI placement such as a Tab, drawer, Sticky Placement, or Surface placement.

Close does not stop execution or delete durable state.

### 9.3 Stop or Cancel

**Stop** or **Cancel** requests that Substrate end active execution according to its runtime cancellation semantics.

Closing its UI does not imply cancellation. The exact parent/child cancellation topology remains provisional.

### 9.4 Archive

**Archive** removes a durable or reconstructable interaction context such as a Workstream from normal active navigation while retaining required identity, history, references, or reconstruction metadata.

Archiving a Workstream does not delete its historical Invocations or owner-system Source Records.

### 9.5 Retire

**Retire** transitions a Lane out of normal availability for new execution while preserving its identity and historical bindings.

The exact treatment of its Worktree and other resources is an execution-policy concern and MUST be explicit.

### 9.6 Delete

**Delete** is an explicit destructive operation against an owner-system entity or presentation record.

Delete MUST NOT be inferred from Close, Archive, Retire, removal from the Sticky Stack, Tab closure, or navigation changes.

### 9.7 Make Sticky

**Make Sticky** is a Presentation Action that creates a Sticky Placement for an eligible Block or Surface in the current Workstream Surface.

It does not remove the chronological placement or create a Tab.

### 9.8 Remove Sticky

**Remove Sticky** is a Presentation Action that removes only the Sticky Placement from the current Workstream Surface.

It does not delete the original Activity Item, Block history, Surface, or owner-system state.

### 9.9 Open as tab

**Open as tab** is a Presentation Action that creates or focuses a Tab placement for an eligible Surface.

It does not make the Surface sticky in a Workstream and does not transfer ownership of the underlying state.

## 10. Cardinality and Relationship Rules

> Relationships in this section that depend on the execution-instance or agent-topology vocabulary from Sections 6.7–6.14 are also **Provisional Draft**. Their presence here does not promote those terms or relationships to canonical status.
>
> This section also does not select a canonical Workspace event-history architecture or a Workstream persistence model.

Collider V1 uses the following conceptual relationships:

1. A Workspace has zero or more Lanes.
2. A Workspace exposes one canonical Control Plane Workstream Surface.
3. A Workspace may expose zero or more Lane Workstream Surfaces and other Workstream projections.
4. A Lane may appear in zero or more Workstream projections.
5. A Workstream may observe or orchestrate activity associated with zero or more Lanes.
6. A Workstream has zero or more Invocations, may retain zero or more Presentation Actions, and projects zero or more Activity Items.
7. An Activity Projection may select from one or more authorized source systems or provider histories through one or more Projection Definitions.
8. The same Source Record may contribute to multiple Activity Projections without transferring authority to any Activity Assembler or Projection Index.
9. An Activity Item has stable Business Identity within its Projection Definition and target view.
10. An Activity Item may fold or correlate one or more Source Records, revisions, durable references, or reconstructable owner-system objects.
11. An Activity Item may render as one or more Blocks or Surface placements over time.
12. A Block MAY host a Surface.
13. A Surface may have zero or more inline, Sticky, or Tab placements.
14. A Sticky Placement belongs to one Workstream Surface placement and does not automatically apply to another projection of the same Activity Item.
15. A Tab hosts one primary focused Surface Placement.
16. Removing every presentation placement MUST NOT destroy the underlying Lane, execution, Workstream identity or reconstruction data, Activity Item, Artifact, Work Item, Source Record, or provider object.
17. Every environment-touching execution MUST bind to exactly one Lane under the final execution model.
18. A Workstream may project activity associated with zero, one, or several Qualified Sessions over time.
19. One Qualified Session's activity may appear in more than one Workstream projection where policy and visibility rules permit.
20. Session Continuity MAY associate multiple Invocations with one Qualified Session, but remaining in the same Workstream does not imply continuity.
21. Session History may serve as one Source Record family or owner history for Activity Projection, but it is not the canonical Workspace history.

Whether Activity Items and Workstreams are materialized, indexed, or computed on demand remains open.

## 11. Foundational Non-Equivalences

The following distinctions are normative except where a term is explicitly provisional:

```text
Workspace  ≠ Project
Workspace  ≠ Repository
Scope      ≠ Lane
Work Item  ≠ Workstream
Lane       ≠ Workstream
Lane       ≠ Tab
Workstream ≠ Tab
Workstream ≠ Canonical Workspace Event Store
Presentation Action ≠ Invocation
Navigator Item ≠ target Surface or owner-system object
Navigator Group ≠ Handbook Scope or Lane
Navigator Layout ≠ Substrate Workspace configuration or policy
Remove from navigator ≠ disable or Delete
Inbox dismissal ≠ owner-system resolution
Agent Harness ≠ Agent Profile
Environment Dependencies ≠ Repository/package dependencies or Extension Dependency Declarations
Invocation ≠ Run
Agent      ≠ Run
Run        ≠ Chat Session
Qualified Session ≠ Workstream
Qualified Session ≠ Lane
Qualified Session ≠ Invocation
Qualified Session ≠ Activity Projection
Qualified Session ≠ Run
Session History ≠ Canonical Workspace Event Store
Same Workstream ≠ implicit Session Continuity
Session Continuity ≠ automatic Scope, Lane, policy, capability, permission, or model inheritance
Source Record ≠ Activity Item
Projection Definition ≠ Source Authority
Activity Assembler ≠ Source Authority
Projection Index ≠ Source Authority
Activity Projection ≠ Source Authority
Activity Projection presentation order ≠ authoritative total Source Record order
Business Identity ≠ Visual List Position
Activity Item identity ≠ Block identity
Activity Item ≠ Block
Block      ≠ Surface
Surface    ≠ State Owner
Extension ≠ Semantic or Execution Authority
Trusted Extension ≠ Semantic Authority
UI contribution permission ≠ host runtime authority
Capability Grant ≠ Isolation Boundary
Capability mediation ≠ Isolation Boundary
Extension Context Mediation ≠ Isolation Boundary
Capability Interception ≠ Isolation Boundary
Extension Point ≠ Surface
Extension Point ≠ Surface Placement
UI Contribution ≠ Extension Point
UI Contribution Scope ≠ Handbook Scope
Contribution Provider ≠ Owner-System Authority
UI contribution permission ≠ Capability Grant or runtime authority
Extension Context ≠ Handbook Scope or Resolution
Extension Context ≠ Context Pack or Injected Context
Extension Context ≠ Activity Projection or Workstream
Extension Context Mediation ≠ Authority Transfer
Required Capability ≠ Capability Grant
Provided Capability ≠ copied owner state
Spatiotemporal Composability ≠ Isolation Boundary
Mediated Effect ≠ guaranteed exact reversion
Revertible Contribution ≠ Compensating Action
Compensating Action ≠ Exact Rollback
Temporal Composability objective ≠ complete unload guarantee
Spatiotemporal Composability objective ≠ formal proof
Sticky Placement ≠ Tab
Open as tab ≠ Make Sticky
Projection ≠ Canonical Artifact
Receipt    ≠ Admitted Evidence
Resolved Set ≠ Injected Context
Close      ≠ Stop
Remove Sticky ≠ Delete
```

## 12. Naming and Usage Rules

1. Collider documents MUST use **Workspace**, not Project, for the Substrate configuration and policy boundary.
2. **Lane** MUST refer to execution placement and conditions, not merely a work category or visible terminal.
3. **Workstream** MUST refer to an interaction context and ordered Activity Projection, not a parallel execution partition or an assumed independent event log.
4. UI copy MAY shorten Workstream to **Stream** where a visible label is useful, but architecture and protocol documents SHOULD use Workstream.
5. A phrase such as `Lane tab` means “a Tab displaying a Lane Workstream Surface”; it does not mean the Tab is the Lane.
6. **Qualified Session** MUST identify its provider or runtime type. Unqualified **Session** MUST NOT replace Workstream, Lane, Invocation, Activity Projection, or provisional Run.
7. **App** SHOULD refer to a provider or implementation. **Surface** refers to the typed rendered instance exposed through Collider.
8. **MCP App** MUST refer only to an app delivered through the MCP App mechanism. Core Collider and Handbook Surfaces are not automatically MCP Apps.
9. The preferred user-facing action for creating a Tab placement is **Open as tab**. Architecture documents MAY use **Tab Promotion**.
10. **Sticky** means keep a Block or Surface visible within a Workstream Surface while activity scrolls. It MUST NOT be used as a synonym for creating a Tab.
11. **Pin** SHOULD NOT be used unqualified in normative V1 documents because it is ambiguous between Sticky Placement and Tab Promotion.
12. **Dock** SHOULD NOT be used unqualified for Collider UI placement because Handbook's contract membrane may use Dock as a semantic term.
13. Handbook-owned terms MUST retain Handbook's canonical capitalization and meaning where available.
14. `Lane-unfiltered` describes the absence of a Lane predicate in an Activity Projection; it does not mean raw, unrestricted, or uncollapsed telemetry.
15. Unless a bounded implementation has supplied explicit evidence, assumptions, and a system boundary, Collider documents MUST describe Temporal, Spatial, and Spatiotemporal Composability as design objectives rather than proven guarantees.
16. **Extension Context** MUST remain qualified in architecture and protocol documents. Unqualified `Context` MUST NOT collapse Extension Context, Handbook Scope or Resolution, Handbook Projection, Substrate Context Pack, Injected Context, Activity Projection, Workstream, or React context into one concept.
17. **Required Capability**, **Provided Capability**, and **Dependency Declaration** are extension-composition terms. They do not by themselves create a Capability Grant, Handbook Contract, Substrate policy decision, or owner-system authority.
18. Cross-process or remote Capabilities MUST expose asynchronous, availability, failure, cancellation, timeout, and retry semantics honestly where those semantics apply; they MUST NOT masquerade as infallible synchronous local access.
19. **Extension Point** is the canonical public architecture term for a host-declared UI composition location. `Slot` remains a non-canonical implementation or reference-architecture term unless an explicit future glossary decision adopts it.
20. **UI Contribution Scope** MUST remain qualified and MUST NOT be shortened to `Scope` where it could be confused with Handbook Scope.
21. Inline, Sticky, Tab, overlay, and Inspector are presentation locations or modes; none is automatically an Extension Point merely because it can display contributed UI.
22. A Contribution Provider's right to register UI MUST NOT be interpreted as a Capability Grant, trust elevation, or owner-system authority.
23. A Projection Definition that emits an Activity Item MUST preserve owner-supplied Business Identity or deterministically derive stable Business Identity from domain or source semantics; visual list position, current page, and renderer order MUST NOT serve as business identity.
24. An Activity Projection's deterministic presentation order MUST NOT be interpreted as one authoritative total order over its underlying Source Records.
25. Workstream renderers SHOULD consume final Activity Items or bounded Surface models rather than repeatedly scan raw heterogeneous source collections.
26. Projection Definitions, Activity Assemblers, and Projection Indexes are projection machinery; none becomes semantic, execution, or Source Record authority.
27. A purely local Collider presentation-state change is a **Presentation Action**, not an Invocation. A Surface action becomes an Invocation only when it requests owner-system behavior.
28. **Session Continuity** MUST be explicit and visible; remaining in the same Workstream MUST NOT be interpreted as continuation of a Qualified Session.
29. Resuming a Qualified Session MUST NOT bypass current validation of Handbook Scope or Resolution, Lane binding, Substrate policy, Capability Grants, permissions, provider availability, or model identity and configuration.

30. Collider-shipped labels at the **highest level** of the default Workspace Navigator MUST be one word. This applies to default root-level group headings and default ungrouped root-level destinations only. Descendant labels, user-defined names, and user-promoted items are not subject to this rule; moving an item to the root MUST NOT automatically rename it.
31. Navigator display labels are not canonical terminology or identity. Architectural terms such as **Control Plane**, **Qualified Session**, and **Agent Profile** retain their names. A root display alias such as **Home** for Control Plane MAY be used without renaming that architectural concept; a nested entry may retain the full name.
32. **Sessions** is permitted as a navigator label for Qualified Session resources. It does not make Sessions the default Workspace organization, imply Session Continuity, or remove provider/runtime qualification from the represented objects.
33. **Inbox** is the preferred default destination label rather than Attention. **Notifications** remains an acceptable user label; local read/dismiss state is distinct from owner-system acknowledgment and resolution.

## 13. Deferred or Reserved Concepts

The following concepts are intentionally not fully defined by this V1 glossary and are tracked in [`02-collider-v1-open-architecture-questions.md`](./02-collider-v1-open-architecture-questions.md):

- canonical Workspace event history versus federated histories or a hybrid;
- Workstream persistence and identity;
- Projection Definition registration, ownership, versioning, compatibility, and invalidation;
- Activity Assembler placement, incremental update, pagination, replay, resynchronization, and gap-repair mechanics;
- Projection Index materialization, snapshots, compaction, privacy, retention, and reconstruction;
- Activity Projection indexing, ordering, retention, and compaction;
- Source Record normalization, Business Identity formation, cross-source identity, correlation, and cross-projection identity sharing;
- shell and PTY capture boundaries;
- MCP App object, revision, and reconstruction behavior;
- Qualified Session creation, explicit resume handles, one-Invocation continuation, persistent continuity mode, provider guarantees, Session History retention, expiry and recovery, branching or cloning, rebinding and revalidation, and session-oriented views;
- exact Control Plane and Lane projection-association rules;
- Sticky Stack capacity, persistence, and compaction;
- Tab Promotion identity and state-sharing behavior;
- final execution-instance and agent-topology vocabulary;
- a multi-Workspace Project grouping;
- pipelines and visual workflow composition;
- detailed public third-party Surface extension trust, isolation, capability, provenance, and effect-cleanup mechanisms;
- Capability identity, typed keys or schemas, compatibility and versioning, provider identity, multiple-provider selection or multiplexing, failover, and Dependency Declaration format;
- Extension Context derivation and scoping, Extension Context Mediation and Capability Interception mechanics, relationship to Substrate policy and Handbook semantics, and local versus cross-process capability bridges;
- Extension Contribution granularity, Extension Lifecycle state transitions, declared recovery criteria, exact equality versus observational equivalence, inverse or disposer composition, asynchronous teardown, partial-activation recovery, configuration reconciliation, dependency cycles, hot replacement, update rollback, and evidence required for composability claims;
- Extension Point declaration schemas, identity and naming, `Slot` as a possible implementation term, contribution kinds and scopes, multiplicity, ordering, fallback, election and replacement, nested-point lifetimes, parent replacement, rendering boundaries, styling isolation, accessibility, failure recovery, and contributed-Surface restoration;
- detailed Inspector and context-debugger UX;
- Navigator Item identity and shortcuts, default grouping, preference persistence and sharing, contribution restoration, and customization interactions under C-OQ-025;
- Environment Dependency configuration, effective requirements, World realization, readiness, and Lane relationships under C-OQ-023;
- Agent Harness and Agent Profile schemas, configuration sources and precedence, compatibility, and application to active work under C-OQ-024;
- Inbox source ownership, read/dismiss behavior, owner-system acknowledgment, delivery, and retention under C-OQ-026;
- design-system and Storybook or Open Design artifact semantics.

Later documents MAY define these concepts, but they MUST preserve the ownership and lifecycle boundaries established here.

## 14. Canonical Summary

The Collider V1 model can be summarized as:

```text
Workspace          the Substrate config/policy boundary
Agent Harness      an integrated agent-execution backend or runtime
Agent Profile      reusable Substrate-owned agent configuration
Environment Dependencies  requirements consumed by Substrate World dependency tooling
Navigator Item     an identity-bearing navigation destination or reference
Navigator Group    a presentation-only grouping of navigation items
Navigator Layout   the user's supported arrangement of navigation presentation
Extension          bounded optional or dynamically reconfigurable functionality
Extension Contribution   an attributable bounded contribution made by an Extension
Extension Point    a host-declared location for authorized UI composition
UI Contribution    a lifecycle-bound provider contribution to an Extension Point
Scope              what the work means
Work Item          what durable outcome is pursued
Lane               where execution occurs
Workstream         the interaction context and activity projection
Qualified Session  an owner-specific provider or runtime continuity resource
Session History    the owner-scoped history supporting Qualified Session continuity
Presentation Action a local Collider presentation-state change
Invocation         the accepted request for owner-system behavior
Run                what executed (provisional vocabulary)
Source Record      the owner-system record or durable reference
Projection Definition the host-recognized rules for assembling projected business objects
Business Identity  the stable projected domain identity independent of list position
Activity Assembler the mechanism that applies Projection Definitions
Projection Index   derived projection-specific correlation and fold state
Activity Projection the deterministically ordered eligible view across source records
Activity Item      one stable projected business object
Block              the current rendering of an Activity Item or app inline
Surface            the typed app/view being rendered
Sticky Placement   a Workstream-local always-visible placement
Tab                a focused center-workspace Surface placement
```

The central lifecycle rule is:

> **Collider presents and controls durable Handbook and Substrate state; its Activity Projections, Blocks, Surfaces, Sticky Placements, and Tabs do not become the authority for that state.**

The central Lane/Workstream rule is:

> **A Lane is where execution happens. A Workstream is where interaction and projected activity around the work unfold.**

The central history rule is:

> **Collider should provide one coherent interaction experience without presupposing one canonical underlying event store or duplicating owner-system authority.**

The central continuity rule is:

> **Resolution-reconstructed behavior is the default; Qualified Session Continuity is explicit, owner-specific, and does not make Session History the Workspace's canonical history or bypass current Scope, Lane, policy, capability, permission, or model validation.**

The central dynamic-extension rule is:

> **Dynamically reconfigurable Extensions should aim for Spatiotemporal Composability, but every composability claim remains bounded to a specific mediated, attributable, and validated extension class and does not replace authority, trust, or isolation boundaries.**
