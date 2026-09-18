# BB, DeepSeek Harness, and Collider: Architectural Research and Adjudication

**Status:** Non-normative research and recommendations; no implementation or dependency authorization  
**Research date:** September 15, 2026  
**Repository:** `get-bb/bb`  
**Pinned source revision:** `41e7132e817306e43f68f91bde0a6b9f79af99de`  
**Snapshot commit time:** September 15, 2026, 18:29:20 UTC  
**Comparison basis:** The supplied DeepSeek Harness/Cordis research report, the attached Collider glossary/Foundations/open register, and subsequently accepted Navigator decisions in this conversation  
**Canonical-document changes:** None

## 1. Executive assessment

**BB should become a second, complementary architectural reference for Collider and Substrate. It should not replace DeepSeek/Cordis as the composition reference, and this review does not recommend forking BB or adopting its runtime as a dependency.**

The references answer different questions. The supplied DeepSeek report is particularly valuable for lifecycle-owned contributions, declared dependencies, context mediation, conditional composability, UI extension locations, and owner-backed conversation assembly. BB is particularly valuable for making those broad goals work in a multi-harness product: explicit server/host/provider contracts, agent-operable interfaces, programmable UI, normalized provider events, concrete reload behavior, pagination under streaming, resource provisioning, and testable plugin contracts. [^D01] [^B02] [^B04] [^B05]

My strongest conclusion is not that Collider needs a new plugin framework. It is that our accepted principles now need **observable acceptance contracts at the boundaries where they will be implemented**. BB contains both useful implementations and unusually informative limitations for that work.

| Question | Recommended disposition |
|---|---|
| Add BB as an architectural reference? | **Yes.** Particularly for multi-harness integration, programmable UI, recovery, and extension conformance. |
| Replace the DeepSeek/Cordis reference? | **No.** BB does not supply evidence equivalent to the conditional composability model described in the DeepSeek report. |
| Fork BB into Collider? | **No.** Its Project/Thread/Environment product model and central product server do not preserve Collider's authority decomposition automatically. |
| Adopt BB packages or Cordis now? | **No selection.** Evaluate a bounded dependency only after its owner boundary, compatibility, trust, and maintenance cost are established. |
| Let agents create UI beyond a predefined widget catalog? | **Architecturally plausible and concretely demonstrated by BB's authoring surface.** Authoring executable code must remain distinct from admitting and activating it. |
| Adopt BB's central database as Workspace truth? | **No.** It is evidence about BB's own product-state boundary, not a resolution of Collider's federated-history question. |
| Treat hot reload as proof of reversible extensions? | **No.** BB's reload contracts differ by component and failure stage. |
| Edit the canonical Collider documents immediately from this report? | **No.** Adjudicate the recommended results first; extend existing open questions rather than import BB nouns or schemas. |

The highest-value additions to our thinking are:

1. Separate **provider-protocol normalization** from **Collider Activity Projection assembly**.
2. Separate **declared support**, **negotiated runtime behavior**, **policy authorization**, and **observed health**.
3. Provide **portable, declarative activity fallbacks** independently from optional executable renderers.
4. Define **failure-phase-specific replacement contracts**, not one blanket promise of atomic hot reload.
5. Persist **operation intent and ownership before external work**, and represent uncertain dispatch rather than blindly retrying it.
6. Make agent-facing operations, examples, SDK tests, and test-fidelity limits part of the product contract.

These are recommendations derived from the evidence below, not newly accepted Collider invariants.

## 2. Evidence basis and limits

I used DeepWiki for pointed questions about architecture, UI expressiveness, provider/runtime boundaries, plugin lifecycle, timeline persistence, and recovery. I then checked load-bearing claims against repository documentation, public SDK declarations, implementation files, and a frontend reload test file at the pinned revision. This is a targeted source-and-contract review, not a claim to have read every file. [^B00]

**No BB build, installed application, test suite, or live provider workflow was executed for this review.** Test results reported in BB's own verification documents are identified as the project's reported results, not reproduced measurements. A source checkout could not be obtained in the execution environment; source inspection used the GitHub connector. That does not prevent architectural analysis, but it limits completeness and runtime validation.

The comparison with DeepSeek is based on the supplied research report. I did not redo the underlying paper proof or a fresh exhaustive DeepSeek code audit. The report's assertions remain supporting evidence; they do not become normative Collider authority. Its historical external citation markers are not treated as new independently verified citations in this report. [^D01]

The attached Collider documents establish the seven-packet direction and subsequent corrective distinctions. The newest Navigator expansion was accepted in the conversation; its previously linked output directory was not available in this runtime. Consequently, this report uses the accepted decisions—Inbox, customizable groups/items, highest-level-only one-word defaults, Sessions, Harnesses, Environments/World tooling—without claiming to have inspected that unavailable output's exact bytes. [^C01] [^C02] [^C03]

### DeepWiki was useful, but required adjudication

Two examples materially affected this review:

- A runtime answer described old per-provider adapters. The current provider-plugin and bridge documents instead describe the generic bridge/narrow-grammar boundary. The current source contract controls the analysis, not the older narrative. [^B04] [^B05]
- A timeline answer stated that there was no explicit prepend operation. The inspected `packages/client-core/src/timeline/timeline-merge.ts` directly implements `prependOlderTimelineRows`, including recursive merging of partially loaded turn and delegation children. [^B12]

This is why the recommendations below rely on pinned source contracts rather than treating a generated repository summary as implementation proof.

## 3. What BB is actually organizing

BB's documented product architecture has four primary runtime roles. Its **server** owns central product persistence, HTTP APIs, and change notifications. A **host daemon** on an execution machine provisions workspaces, supervises agent/provider processes, and reports progress. The **web/desktop/mobile clients** present that product state. The **CLI/SDK** expose scriptable control for users and agents. The repository uses explicit server-client and server-daemon contract packages. [^B02] [^B03]

The desktop implementation is Electron, and the phone client is an Expo application. Those are implementation choices, not recommendations for Collider's Tauri client. The useful principle is that the runtime and product interfaces are usable independently of a particular rendering process. [^B03]

### BB nouns must not be imported one-to-one

| BB concept | What the source says | Collider interpretation |
|---|---|---|
| Project | Top-level product container, usually repository-related, with host-specific sources. | Not automatically a Substrate Workspace or a Handbook Project. |
| Thread | Conversation and unit of work, possibly a manager or child thread, with execution and history. | Overlaps several of Work Item, Workstream, Qualified Session association, and execution. **Do not rename Workstream to Thread.** |
| Environment | A directory/workspace bound to a host; managed or unmanaged; may be shared by threads. | Useful reference for execution-resource lifecycle, not the complete Lane or Workspace authority model. |
| Host | Enrolled execution-machine identity. | Useful substrate-side execution-target concept where supported; not a UI tab or environment profile. |
| Provider | A coding-agent backend exposed through a plugin and bridge contract. | Closest to an Agent Harness adapter, not a model vendor, Profile, or individual execution instance. |
| Plugin | Backend, frontend, host, provider, or related optional functionality. | Closest to an Extension/provider implementation, not an Artifact, Block, Surface instance, or Lane. |

The BB definitions are source-derived; the Collider mappings are architectural interpretation. [^B02] [^B05]

BB's central server is not an analogue of Handbook. It owns its own product's operational state. It does not demonstrate a separate semantic-authority system for Contracts, Evidence admission, Scope, or Resolution. We should therefore borrow its boundary mechanics without relocating Handbook semantics into a new Collider control server. [^B02] [^C01]

## 4. How BB complements DeepSeek

| Area | DeepSeek reference, as documented in the supplied report | BB evidence | Collider implication |
|---|---|---|---|
| Dynamic composition | Declared requirements/provisions, context mediation, lifecycle-owned effects. | Explicit SDK namespaces, registration sets, provider contracts, cleanup and reload handling. | Keep the general composition objective; use BB for concrete acceptance/failure cases. |
| UI extensions | Typed, scoped, nested Slots and contributions. | Typed UI insertion/replacement surfaces, arbitrary contributed React components, host data/action hooks, fallback implementations. | Keep **Extension Point** and **Surface** separate; study explicit replacement and fallback policy. |
| Rendering and history | Owner histories become stable target-specific conversation nodes. | Runtime normalization, durable events, query-time timeline projection, client merge/recovery. | Distinguish runtime normalization from UI projection; avoid raw-history scanning in renderers. |
| Agent programmability | Opt-in temporary plugin/self-modifying-runtime work, with strong trust warnings. | CLI/SDK control plus plugin-authoring skill and executable frontend/backend/host plugins. | Support agent-authored candidates, not implicit authority to activate arbitrary code. |
| Reconfiguration guarantees | Conditional formal objective with author obligations and boundary limits. | Concrete but nonuniform backend/frontend/host lifecycles. | Require evidence by extension class and transition; do not infer formal composability. |
| Provider integration | Harness-oriented composition and model/tool services. | Multi-provider bridge protocol, declarations, handshake, semantic grammar, conformance kit. | Strong input to the existing Substrate/UAA harness boundary. |
| History authority | Separate Session, Workspace, control, and feature state. | Central BB product database plus native provider continuity, plugin storage, ephemeral signals. | Neither reference selects Collider's Workspace-history architecture. |
| Security | Context is not a hostile-code sandbox. | Same-origin content scripts and Node-capable host code; explicit trust assumptions. | Reinforces, rather than replaces, Substrate's isolation and credential boundaries. |

The DeepSeek column is drawn from the supplied report; BB claims are supported by its SDK, lifecycle, bridge, and timeline contracts. The final column is my recommendation. [^D01] [^B04] [^B05] [^B06] [^B07] [^B13]

## 5. The key UI question: is BB limited to predefined elements?

**No—but its official extension locations and its arbitrary executable code are different things.**

A precise answer requires distinguishing four levels:

### 5.1 Operating existing product capabilities

The CLI/SDK and host actions let an agent operate existing BB functionality. This is not necessarily new UI or new code. BB's vision explicitly treats users and agents as operators of the same product rather than making the CLI a secondary interface. Its guide maintenance rules require CLI commands, configuration, and agent skills to stay aligned. [^B01] [^B21]

**Collider recommendation:** Agent-operable versions of important owner-system actions should use the same admission and authorization boundaries as user-operated versions. Do not implement a second, privileged agent-only backend merely to avoid the UI.

### 5.2 Contributing new code through declared UI locations

The public app contract includes typed locations and actions for navigation panels, settings, message and code rendering, thread panels, composer controls, and overlays. A provider supplies real React components or behavior, not only values chosen from a closed visual widget catalog. The plugin-authoring skill explicitly guides creation and modification of TypeScript packages with backend, frontend, provider, and agent capabilities. [^B07] [^B20]

Thus, the insertion point can be predefined while the application rendered there is newly authored. A new planning board or design viewer does not require that BB already contain that complete application's visual implementation.

**Collider recommendation:** Preserve the same separation:

```text
host-declared Extension Point
        accepts
an authorized UI Contribution
        may supply
a newly authored Surface implementation
        rendered through
an allowed inline, Sticky, or Tab placement
```

A Surface is not limited to a closed list of native widgets merely because the host controls its admission point.

### 5.3 Adding backend and execution-host behavior

BB plugins can expose backend RPC, tools, configuration, storage, services, and separately delivered host logic. Host modules use typed contracts, explicit target hosts, and process-lifetime rules. The plugin provider contract also allows coding-agent backends to be shipped through plugin artifacts. [^B05] [^B08]

That is a much broader capability than decorating chat messages. It is also a much larger trust decision.

**Collider recommendation:** New frontend capability and new host execution capability must be reviewed separately. Producing a useful UI does not justify issuing filesystem, credential, process, or semantic-mutation authority to its author.

### 5.4 Escaping normal UI composition through trusted content scripts

BB additionally supports content scripts that execute as trusted same-origin JavaScript and can enhance the app shell without a React slot. Its documentation explicitly says that these scripts are not sandboxed. The host manages mount/dispose generations, but that is lifecycle management, not prevention of arbitrary DOM access or ambient page behavior. [^B06]

**Do not transfer this escape hatch into Collider's default extension trust model.** It may be a separately authorized trusted-development capability later. It is not a safe implementation of arbitrary untrusted agent-generated UI.

### The useful product distinction

For Collider, I recommend two separately governed abilities:

- **Agent-directed customization:** operate supported settings and Presentation Actions, such as arranging available Navigator Items.
- **Agent-authored extension development:** produce new code, schemas, tests, and manifests as a candidate, then pass it through explicit review, trust classification, and activation.

Authoring, packaging, installation, permission approval, and activation are different transitions. BB makes the product potential concrete; Substrate and Handbook must continue to govern which transitions are actually allowed.

## 6. UI composition patterns worth borrowing

### 6.1 Host-owned action data, replaceable presentation

BB's sidebar contract exposes bounded thread data, already-resolved status indicators, and host action hooks to replacement renderers. Its app declaration also provides structured navigation items with stable identities and activation callbacks. Replacement presentation does not require reimplementing every host mutation or interpreting private internal objects. [^B07] [^B11]

This aligns directly with the accepted customizable Collider Navigator. We should aim for stable Navigator Item identity, owner-backed actions, and personal layout preferences that remain separate from domain resources. A user hiding a shortcut should not disable a harness, and an extension providing a different list renderer should not become the owner of the objects listed.

### 6.2 Preserve preferences across provider absence

The sidebar reference documents an explicit selection policy: automatic choice, built-in choice, or a selected provider. When a selected provider disappears, the built-in implementation renders while the preference is retained. If the provider returns, the preference can take effect again. A crashing replacement receives a functional built-in fallback instead of stranding the user behind an error chip. [^B11]

**Collider recommendation:** Separate desired user layout/provider preference from currently realizable rendering. Distinguish hidden-by-user, unavailable-provider, unauthorized, failed, and incompatible states. Do not erase customization as a recovery shortcut.

This does not imply copying BB's thread-centric sidebar. It supplies a recovery pattern for the Workspace Navigator we already chose.

### 6.3 Safe delegation to the built-in renderer

Several BB renderer contracts supply an `Original` component bound to the current request so a replacement can delegate without re-entering replacement selection recursively. Already-resolved props prevent each renderer from repeating defaults or reading ambient context. [^B07]

The generic pattern is valuable: a contributed Surface renderer should be able to decline, augment, or fall back without creating recursive election or duplicate source loading. The exact API is still an open Collider Extension Point decision.

### 6.4 Opening a Surface is a host-accepted intent

BB panel-open functions report whether the host accepted the request. A missing location, unavailable registered action, or invalid JSON target can result in a clean decline. File targets carry explicit workspace/host/thread-storage identity instead of inferring an ambient workspace. [^B06] [^B07]

For Collider, this suggests distinguishing three events: request to present, host acceptance of a placement, and actual render/readiness. **Open as tab** remains a Presentation Action, not evidence that provider state was created or that runtime work succeeded.

Do not copy BB's exact preference for a right-side thread panel. Our center-focused Surface and Sticky model remains the product constraint.

### 6.5 Persistence must be declared per presentation contract

BB's SDK documents different persistence semantics for different targets: thread-panel JSON parameters can be restored from persistence, while some fixed-tab targets survive remounts only within the current app session and persist selection rather than target payload. [^B06] [^B07]

That difference is healthy when explicit. It is a warning against saying all Surfaces restore identically. Collider needs separate answers for persistent Surface references, transient target arguments, owner data, and local presentation state. This informs C-OQ-010 and C-OQ-021; it does not close them.

## 7. The most important new runtime distinction: two assembly layers

BB's provider architecture separates provider-specific dialect parsing from shared timeline construction. Bridges emit a narrow semantic delta grammar; the generic runtime assembler mints internal IDs, correlates provider keys, enforces turn/item lifecycle, accumulates streams, and emits normalized BB ThreadEvents. Later timeline projection and client rendering consume that owner-normalized history. [^B04] [^B05]

This should sharpen our architecture, not collapse it.

```text
Native harness / provider traffic
              │
              ▼
Substrate-owned adapter and execution normalization
  native IDs + lifecycle facts + capability behavior
              │
              ▼
Substrate Source Records and Receipts
              │
              ├── Handbook-owned records
              ├── MCP / external owner references
              ├── retained Presentation Actions
              ▼
Collider Activity Assembly
  target-specific correlation / folding / visibility
              │
              ▼
Activity Items → Blocks and Surfaces
```

This is a proposed owner-aligned mapping, not a new crate layout. The existing Substrate and unified-agent-API boundaries must be inspected before adding anything; a second parallel harness-normalization system would be a mistake.

### What belongs below presentation

The bridge/runtime boundary is the right reference for accepting provider input, assigning runtime identity, resolving native join keys, recognizing actual completion, rejecting incompatible protocol versions, and reporting unsupported provider behavior. BB explicitly centralizes these operations rather than asking every renderer or every provider implementation to improvise the same lifecycle rules. [^B04]

A Collider renderer must not repair a missing authoritative completion by deciding that the last visible tool row looks finished. View assembly can fold authoritative records; it cannot invent execution truth.

### Keep runtime identity distinct from projection identity

BB's assembler can mint IDs from entropy and a serial counter and maintain provider-to-BB mappings. Those are runtime-assigned identities carried into persisted records. This is different from deterministically re-deriving all runtime IDs by replaying raw native traffic. [^B04]

Collider's stable Business Identity rule remains intact: Activity Items consume stable owner references or derive projection identity from stable fields. A normalized execution record's owner-issued ID and a view-specific Activity Item ID are different layers even if a particular implementation reuses a value.

### Streaming correctness belongs in the shared contract

BB documents first-delta responsiveness, bounded text coalescing, full terminal item shapes, duplicate closure handling, provider key reuse rules, and nonbatchable ordering barriers. It treats resets differently from ordinary text concatenation. [^B04]

These are excellent conformance cases for our existing harness boundary. The lesson is not to adopt BB's exact grammar, timing window, or enums. The lesson is to specify and test the cases that otherwise become provider-specific UI bugs.

## 8. Capability truth is not one boolean

BB separates provider declarations used before a process/session is active from runtime handshake facts. Its bridge documentation says the handshake can narrow a declared affordance, not widen it. It also negotiates protocol and semantic grammar versions and refuses incompatible combinations visibly. [^B04] [^B05]

For Collider, I recommend explicitly distinguishing:

```text
Declared support
    what the installed harness integration describes

Negotiated support
    what this runtime/provider instance reports now

Authorized capability
    what current Substrate policy and grants permit

Operational readiness
    what health, credentials, environment, and current state permit
```

These are related facts, not interchangeable authority. A provider advertising a feature does not authorize its use. A model appearing in a cached list does not prove current availability. A successful JSON schema validation does not prove correct behavior.

There is an instructive caution in the current provider API: `steerMode` records whether a bridge injects live steering or queues it, but the document explicitly says the runtime/server/clients do not yet use that distinction to alter their routing. Therefore the mere presence of a handshake field is not evidence that the product exposes its semantics correctly. [^B05]

The provider protocol also preserves uncertainty in usage accounting: omitted counters do not mean zero, and provider totals have different legacy cache semantics. That supports a more general rule for Harness and Diagnostics Surfaces: normalized display must not manufacture comparability or completeness that the source did not supply. [^B04]

## 9. History, projection, pagination, and replay

### 9.1 Borrow explicit operations, not a universal database

BB persists normalized ThreadEvents and projects timeline rows from them. The client merge module treats identity, current window boundaries, older cursors, display settings, and snapshots as explicit inputs. It recursively joins partially loaded turn and delegation children instead of merely concatenating pages or discarding duplicate parent IDs. [^B12] [^B13] [^B15]

This is directly relevant to C-OQ-003/004/022. A user viewing old history while a Lane streams new activity needs more than stable React keys: cursor compatibility, nested partial objects, late records, stale responses, changed definitions, and reliable repair all need contracts.

### 9.2 Distinguish identity from content revision and read boundary

The inspected client implementation preserves unchanged object references when row identity and content match. It detects whether windows are contiguous using source sequence coverage rather than only visible row adjacency. It replaces or repairs incompatible loaded state rather than pretending every new page can be merged. [^B12]

The pagination document is unusually explicit about its limits. `historySnapshot` identifies a read boundary, grouping version, and display surface; it is **not a retained immutable snapshot of history**. Existing events can be edited, deleted, or replaced during a walk. Previously loaded pages may then disagree, and parity across edits is intentionally not guaranteed. Some cursor anchors fail explicitly while other edits do not invalidate every outstanding cursor. [^B13]

**Collider recommendation:** Keep separate identities for source objects, source revision/watermark, Projection Definition version, target-view presentation, Activity Item Business Identity, and read continuity. Decide what a pagination token actually promises. Do not label a token a snapshot and infer isolation it does not implement.

### 9.3 Do not copy an absolute append-only claim

BB's system overview describes append-style Thread history, but its database implementation contains `deleteThreadEventSuffixInTransaction`, which deletes history suffixes and related derived records. The same source path includes output-retention preparation and rewrite-generation handling. [^B02] [^B15]

That can be a valid product choice for BB. It is not an immutable audit-ledger guarantee and should not silently become the model for Substrate provenance or Handbook Evidence. Our contracts need to distinguish operational history, retained source evidence, editable presentation, and explicit derived/branch operations.

Similarly, replaying a timeline means reconstructing its view from retained data. It is not permission to rerun tools, resend messages, or replay external mutations.

### 9.4 Separate ephemeral signals from recoverable state

BB's client responds to change notifications through entity-specific cache invalidation/refetch. It can delay work while the document is hidden and treat terminal transitions differently from routine streaming churn. Host-plugin signals are explicitly ephemeral; the guide tells consumers to use them as invalidations/progress rather than durable state, and to reconcile after reconnect. [^B16] [^B08]

The transferable principle is not that Collider must use React Query. It is that each source model must declare what can be replayed, what is only a hint, how loss is detected, and what read repairs it. A single universal resynchronization mechanism is not automatically correct for every owner system.

### 9.5 Performance evidence should remain honest

BB's pagination verification documents paired runs through the real endpoint, serialization, validation, and actual client merge against a canonical content/order oracle. Its examples include copied threads containing tens of thousands of events, and it describes the bugs and overhead of earlier attempts. It expressly declines to turn four sampled threads into a general latency claim and documents unverified platforms/workflows. [^B14]

We should borrow that methodology, not its measured milliseconds. This review did not reproduce those measurements. Collider's federation, Handbook access, and payload mix will differ.

## 10. Lifecycle: useful engineering without magical rollback

The supplied DeepSeek report makes lifecycle ownership and conditional recovery a core paradigm. BB provides concrete transition contracts, but those contracts are not uniform across all extension code. [^D01] [^B06] [^B09]

| Boundary | Documented or inspected behavior | What must not be inferred |
|---|---|---|
| Backend registration reload | Factory evaluated against a candidate set; factory failure preserves the old registration set. | Every storage write or external action during candidate execution was reversed. |
| Backend teardown | Abort services, bounded waits, LIFO cleanup, continue after a failing disposer, invalidate stale API handles. | Graceful cleanup always succeeds, or arbitrary native references cannot escape. |
| Frontend content-script generation | Old generation is disposed before candidate mounts; ordered setup/disposal and candidate cleanup are tracked. | Failed new mounting automatically resurrects the old generation. |
| Frontend presentation | Hash-based reload, compatibility checks, slot recovery, CSS lifetime, component-specific failure behavior. | React error boundaries or DOM guards are hostile-code isolation. |
| Host RPC worker | Per-call signal versus worker-lifetime signal, retained leases, idle eviction, persistent data versus temporary paths, typed reconnect signals. | All process placement is a security sandbox, or all worker resources are automatically invertible. |

Backend lifecycle behavior is documented in the authoring references; frontend mechanisms and regression expectations are visible in the loader and reload test; host lifecycle is documented in the backend guide. [^B08] [^B09] [^B10] [^B17]

### A particularly important distinction: registration rollback versus side effects

The backend factory's load-safe interfaces include settings and storage, and plugins can own persistent databases and migrations. Preserving the previous registration set after a candidate fails is not proof that persistent or external actions performed by that candidate were rolled back. [^B08]

For Collider, the declared recovery criterion should identify which registrations, host-owned resources, durable state changes, and external effects are covered. Failed activation may require compensation, retained diagnostic state, or human intervention. We should not attach the word transactional to the whole extension merely because the registry replacement is staged.

### Stale-handle rejection is worth studying

BB documents stale API objects throwing after a load is invalidated. This is useful evidence for generation-scoped mediated handles and explicit teardown ownership. But a generation check can invalidate the mediated API, not revoke an arbitrary object, network connection, secret copy, or ambient Node capability that escaped it. [^B09] [^B08]

### Security choices that must not be copied by default

BB explicitly permits trusted same-origin frontend content scripts and Node-capable host code. Its development README also warns that direct remote development listeners expose an unauthenticated API capable of command execution and file reads, and require a trusted network boundary. These are scoped documented operating assumptions, not a statement that every BB deployment path has identical authentication. [^B06] [^B08] [^B01]

They are not suitable defaults to import into a system whose purpose includes isolating agents from a workstation. Collider should keep genuine untrusted-code isolation, explicit grants, credential separation, and current-policy revalidation. Process supervision, API validation, content hashes, and lifecycle cleanup each solve useful problems; none independently proves sandboxing or trustworthiness.

## 11. Environment operations: durable intent before external work

The environment-provisioning design is one of the most relevant new references for Substrate World tooling. BB creates a durable environment reservation before provider-side creation, records the current attempt, claims a path before mutation, and uses conditional writes to prevent older attempts from overwriting newer state. It separates workspace creation failure from setup retry and cleanup retry. [^B18]

The source contract also specifies that cancellation waits for active creation to settle before removing resources; failed cleanup retains claims; existing foreign paths are not simply handed to deletion; shared environments remain while still used; and pending cleanup survives restart/provider unavailability. [^B18]

Most importantly, startup state distinguishes pending, provisioning, and dispatched. Recovery does **not** automatically resend an agent start whose execution is uncertain. [^B18]

For Collider/Substrate, I would carry forward these proposed invariants:

- Record the owner, resource/attempt identity, and intended operation before external provisioning.
- Fence stale completion and retry callbacks against the active attempt.
- Separate presentation cancellation from confirmed process/provisioning termination.
- Do not release a resource claim until its cleanup contract permits it.
- Represent uncertain dispatch explicitly instead of treating lack of acknowledgement as proof of non-execution.
- Keep desired environment state and realized environment state distinct.

This should feed **existing Substrate World dependency and realization tooling**, not introduce a second environment authority inside Collider. BB's environment retention policy is coupled to its thread model; Collider should not adopt cleanup merely because a Tab closes, a Workstream is hidden, or a UI item is archived. [^B02] [^C01]

The provider-installation contract offers a related useful split: a bridge discovers provider-specific requirements and proposes a typed executable/argument plan, while the daemon selects execution conditions, supervises the install, and verifies postconditions. The user-visible display command is not the authoritative executable contract. [^B04]

## 12. Input assembly, configuration, and Inbox

### 12.1 Resolve references at the operation boundary

BB's mention-provider reference resolves selected items at send time and can block sending on failure rather than silently dropping required context. Provider options can also be derived for each command rather than frozen permanently into one UI component. [^B09] [^B05]

This reinforces Collider's default per-Invocation reconstruction, but it is not an implementation of Handbook Resolution. A mention selection, an owner-resolved Artifact revision, a serialized Context Pack, and a model-visible input remain different records.

I recommend testing the boundary explicitly: what the user selected, what was resolved at dispatch, which revisions were admitted, what the provider actually accepted, and what remains only a presentation hint. Candidate inputs from tools or external pages must not become authority by being displayed attractively.

### 12.2 Build settings from provider contracts without merging owners

BB's plugin settings descriptors support both host settings UI and CLI mutation, with validation performed server-side across write paths. Secret settings are documented as server-side, rather than ordinary browser values. Provider installation/model discovery and current command options remain provider-specific behind shared interfaces. [^B08] [^B05]

This is a useful Harnesses/Profiles/Capabilities Navigator pattern: shared discovery and editing ergonomics, distinct owner identities and validation. Collider should not create one generic settings object that silently mixes native harness configuration, Substrate policy, Handbook semantics, and personal layout.

### 12.3 Separate Inbox notification state from policy-bearing interaction

BB distinguishes closed policy-bearing approval subjects from open interaction/request types and records interaction lifecycle transitions with correlated ask/answer data. Custom presentation is not a license to invent permission semantics. It also renders agent-authored approval details cautiously—for example, images in those details become text rather than triggering unsolicited fetches. [^B05]

For Collider's Inbox, this supports an explicit separation:

```text
read / unread / dismissed notification
               ≠
owner request answered / approved / denied / expired
               ≠
execution successfully resumed or completed
```

An extension may contribute a renderer or answer form through authorized interfaces. Handbook still owns semantic gate meaning; Substrate still owns operational approval and dispatch where applicable. Losing the rich renderer should not erase the obligation or silently answer it.

## 13. Testing and API evolution are architectural features

BB's plugin SDK ships executable backend and frontend test harnesses. The interface separates simulated behavior, inspected registrations/state, and lifecycle control. It also documents where these fakes are not faithful: authentication enforcement, live timers, multi-plugin arbitration, browser layout/CSS, routing, persistence, and certain crash boundaries require live tests. [^B06]

This is stronger than merely publishing type declarations. It creates an authoring contract that can be tested by a plugin author without importing private application internals.

BB also keeps public SDK declarations, plugin-authoring skills, example inventories, and API-audit entries coordinated. The provider-plugin reference describes a test that checks its code blocks against real types. New public surfaces begin experimental; compatibility aliases can be temporary. [^B20] [^B05]

For Collider, I recommend:

1. A harness conformance suite at the existing Substrate/provider boundary.
2. Activity Assembly corpus tests comparing incremental and reconstructed results.
3. Extension lifecycle fixtures for partial activation, stale handles, failed replacement, asynchronous teardown, and provider loss.
4. Surface/Extension Point fixtures with explicit fidelity limits and live fallback/accessibility tests.
5. Versioned agent-facing documentation generated or checked against the same owner contracts used by user-facing interfaces.

These are recommendations for testing architecture, not a selection of BB's TypeScript harness, React test libraries, database, or SDK packages.

A useful migration technique is to compare old and new normalized traces against a bounded provider corpus and classify every difference. However, preserving a legacy trace is not enough if the legacy behavior was wrong: the oracle must also encode actual owner invariants and retained uncertainty. [^B04] [^B14]

## 14. Recommended architectural direction for Collider

### Preserve the existing decomposition

The desirable combined picture is:

```text
Handbook                         Substrate
semantic authority               operational authority
Artifacts / Resolution           Worlds / Lanes / policy
Contracts / Evidence             Harnesses / Invocations / Receipts
        │                               │
        │ owner-backed references       │ normalized runtime records
        └───────────────┬───────────────┘
                        │
              Collider Activity Assembly
              stable items, provenance,
              replay and recovery contracts
                        │
              protocol-neutral Surfaces
              and host Extension Points
                        │
              Workstream / Navigator / Inbox
              inline / Sticky / Tab placements
```

BB contributes examples for many arrows in this picture. It does not replace the owners at the top. DeepSeek contributes the composition and lifecycle principles below the extension/provider boundary. Neither reference determines the final process topology.

### Adopt as design directions after adjudication

| Direction | Why it is worth adopting | Owner-aligned destination |
|---|---|---|
| Separate native dialect translation from shared execution invariants | Prevent provider-specific lifecycle bugs from leaking into every renderer. | Existing Substrate/harness integration boundary. |
| Separate runtime normalization from Activity Assembly | Prevent UI projections from becoming execution authority. | Substrate Source Records → Collider projection seam. |
| Runtime capability negotiation may narrow declarations; policy independently authorizes | Avoid advertising unsupported actions or treating support as permission. | Harness configuration, grants, and dispatch. |
| Portable declarative history fallback plus optional richer renderer | Preserve readable history after provider loss or on another client. | Activity Item / Surface reconstruction contracts. |
| Host actions and stable destination identity beneath replaceable navigation | Preserve customization and recovery without moving ownership into a plugin. | Navigator / Extension Point composition. |
| Transition-specific lifecycle and rollback claims | Replace misleading universal hot-reload guarantees with testable contracts. | Extension lifecycle and trust classes. |
| Durable operation intent, attempt fencing, and explicit dispatch uncertainty | Avoid duplicate mutations and orphaned resource cleanup. | Substrate World/harness operations. |
| SDK conformance and explicit fake/live fidelity boundaries | Make extension contracts observable, not only typed. | Cross-cutting validation strategy. |

### Study in bounded prototypes; do not canonize the mechanism yet

Prototype durable fallback rendering for a provider-specific activity type; a stale/disappearing provider during Navigator restoration; a failed frontend replacement after old disposal; and a provider-session restart with an uncertain accepted request. These are narrow demonstrations that can expose missing contracts without implementing a complete extension platform.

A future agent-authored Surface development loop is worth pursuing. Its safe shape is candidate generation, verification, explicit admission, and controlled activation—not evaluating arbitrary model output as trusted frontend or backend code.

### Reject or avoid copying

Do not import BB's Thread as the universal unit of work, its central product database as cross-owner truth, its particular sidebar or mandatory side-panel UX, its full-trust content-script posture for untrusted code, its package/runtime topology, or its provider-specific permission defaults. Do not assume history is immutable, all pagination is snapshot-consistent, or every hot replacement preserves the previous generation. [^B02] [^B06] [^B13] [^B15]

No evidence in this review justifies weakening the existing provisional execution ontology, selecting a sandbox, equating an MCP App with all extension mechanisms, or making Sessions the default Workspace hierarchy.

## 15. Implications for the document program

This research does not warrant another wholesale rewrite of the glossary and Foundations. Most findings either strengthen existing invariants or add precision to existing open questions.

| Existing decision area | BB-derived questions to add or sharpen |
|---|---|
| C-OQ-001–004, C-OQ-022: history/projection | Separate runtime normalization from UI assembly; cursor promises; declared read boundary versus immutable snapshot; retained fallback representation; source revision and projection revision; mutation-aware replay. |
| C-OQ-005–007: source families and target views | Stream batching without losing order; summary/reference retention; provider extension kinds; display-specific pagination; unknown source preservation. |
| C-OQ-008, C-OQ-011, C-OQ-024: Sessions and Harnesses | Native session identity versus invocation/turn identity; negotiated support; stale provider handles; explicit failover/resume guarantees; uncertainty after dispatch. |
| C-OQ-014–019: trust/lifecycle/capabilities | Per-boundary reload guarantees; staged registration versus irreversible effects; stale-handle rejection; worker leases; auth and policy revalidation; test-fidelity matrix. |
| C-OQ-020–021, C-OQ-025: contributed UI/Navigator | Host-owned action identities; selected-provider fallback preserving preferences; declined presentation intents; typed target/persistence distinctions; declarative fallback without executing plugin code. |
| C-OQ-023: environments/World dependencies | Durable reservation before mutation, attempt fencing, path/resource claims, ownership-safe cleanup, restart recovery, typed provider installation proposals. |
| C-OQ-026: Inbox | Durable policy-bearing request lifecycle distinct from notification read state; failure-safe renderer absence; explicit answer/dispatch/completion distinction. |

C-OQ-023–026 refer to the accepted Navigator expansion from the preceding conversation. This table is proposed research routing, not a declaration that any question is now resolved or that its final document text has been inspected in an unavailable output file.

### Suggested first validation packet

I would prioritize **harness events → normalized Source Records → stable Activity Items**, because it connects existing Substrate functionality to the shell without requiring a production plugin marketplace.

The packet should establish the existing owner map first, then exercise at least these cases: text arriving before a complete item, duplicate completion, provider-native key reuse, late child activity, provider restart, reconnect after lost notification, history pagination during new activity, and unreadable/unavailable rich renderer. Pass conditions should distinguish runtime correctness, view reconstruction, source provenance, and user-visible degradation.

A second bounded packet should investigate **agent-operable UI customization and extension admission**. Its aim would be to distinguish normal Presentation Actions from generated code; preserve owner-backed navigation and built-in recovery; and document the trust required for each action. It need not ship arbitrary content scripts.

These recommendations add no new permanent canonical nouns or question identifiers. They make the next research and implementation plans more falsifiable.

## 16. Final disposition

**DeepSeek/Cordis remains the composition reference. BB becomes the practical multi-harness, agent-operable product and recovery reference. Collider retains its own authority model.**

BB makes the user's original vision more concrete: agents can do more than emit text into fixed chat widgets; they can help create useful applications and operating workflows inside a host-owned environment. But the responsible architectural form is **programmable contributions behind explicit contracts**, with attributable source state, bounded permissions, recoverable presentation, and honest lifecycle guarantees.

The best next step is not to copy BB's framework. It is to turn its most instructive success and failure cases into tests and adjudicated requirements at the boundaries we already own.

---

## Appendix A. Source ledger

All BB source links below are pinned to the inspected commit. “Implementation” means source was inspected, not executed. “Contract/document” means repository-authored behavior was read and should still be verified by the relevant implementation tests before adoption.

| Ref | Source | Evidence level | Principal use |
|---|---|---|---|
| B00 | [Snapshot commit](https://github.com/get-bb/bb/commit/41e7132e817306e43f68f91bde0a6b9f79af99de) | Metadata | Inspection boundary; not a claim that every later upstream change is included. |
| B01 | [README.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/README.md) | Repository contract | Programmable product direction; development-runtime split; remote-development trust warning. |
| B02 | [docs/system-overview.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/system-overview.md) | Repository contract | Server/daemon/client/CLI responsibilities; Project, Thread, Environment, Host. |
| B03 | [docs/repository-overview.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/repository-overview.md) | Repository contract | Package/process map; Electron and Expo are implementation choices. |
| B04 | [docs/provider-bridge-protocol.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/provider-bridge-protocol.md) | Protocol contract | Semantic grammar; native-to-normalized IDs; timeline invariants; capabilities; conformance; typed installation boundary. |
| B05 | [docs/provider-plugin-api.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/provider-plugin-api.md) | Public API contract | Provider declaration/handshake; narrow core vocabulary; extension kinds; declarative presentation; interaction lifecycle; steerMode limitation. |
| B06 | [packages/plugin-sdk/README.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/packages/plugin-sdk/README.md) | SDK contract/test guidance | Public entrypoints; full-trust scripts; placement targets; fake-host and frontend test fidelity limits. |
| B07 | [packages/plugin-sdk/src/app-contract.ts](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/packages/plugin-sdk/src/app-contract.ts) | Type declarations inspected | Bounded props; host-owned actions; Original fallback; explicit file sources; panel restoration parameters. |
| B08 | [plugins/bb-guide/skills/bb-plugin-authoring/references/backend-foundation.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/plugins/bb-guide/skills/bb-plugin-authoring/references/backend-foundation.md) | Authoring contract | Candidate-safe registration limits; settings/secrets; durable storage; typed host RPC; worker leases and lifetimes; ephemeral signals. |
| B09 | [plugins/bb-guide/skills/bb-plugin-authoring/references/backend-ui-lifecycle.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/plugins/bb-guide/skills/bb-plugin-authoring/references/backend-ui-lifecycle.md) | Authoring contract | Send-time mention resolution; staged backend replacement; LIFO cleanup; bounded drains; stale API objects. |
| B10 | [apps/app/src/lib/plugin-frontend.ts](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/apps/app/src/lib/plugin-frontend.ts) | Implementation inspected | Hash/generation state; reconciliation; content-script disposal; CSS lifetime; diagnostics; shared host runtime. |
| B11 | [docs/plugin-sidebar-thread-list.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/plugin-sidebar-thread-list.md) | Implemented API reference | Host chrome versus replacement; user preference retained on provider loss; safe original fallback; host action/data hooks. |
| B12 | [packages/client-core/src/timeline/timeline-merge.ts](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/packages/client-core/src/timeline/timeline-merge.ts) | Implementation inspected | prependOlderTimelineRows; mergeLoadedTimelineWithLatest; stale-cursor recovery; recursive child merging; row-reference preservation. |
| B13 | [docs/timeline-pagination.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/timeline-pagination.md) | Current pagination contract | Opaque cursors, grouping/display versions, partial groups, snapshot limits, best-effort edited-history behavior. |
| B14 | [docs/timeline-pagination-verification.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/timeline-pagination-verification.md) | Project-reported verification | Paired endpoint/client corpus methodology; performance limits; unchanged-history parity versus edit limitations. Not reproduced here. |
| B15 | [packages/db/src/data/events.ts](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/packages/db/src/data/events.ts) | Implementation inspected | Normalized stored events, scope fields, retained output, insertion rules, deleteThreadEventSuffixInTransaction. |
| B16 | [apps/app/src/hooks/realtime-cache-effects.ts](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/apps/app/src/hooks/realtime-cache-effects.ts) | Implementation inspected | Per-entity invalidation, visibility deferral, terminal flush, reconnect repair hooks. |
| B17 | [apps/app/src/lib/plugin-frontend-reload.test.ts](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/apps/app/src/lib/plugin-frontend-reload.test.ts) | Test source inspected, not run | Registration replacement, CSS publication/lifetime, generations, content-script and rendering regression cases. |
| B18 | [docs/environment-provisioning.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/environment-provisioning.md) | Current lifecycle contract | Durable reservation, attempt fencing, claimPath, cancel/cleanup ordering, restart, uncertain dispatched start. |
| B19 | [apps/server/src/services/plugins/plugin-runtime.ts](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/apps/server/src/services/plugins/plugin-runtime.ts) | Implementation inspected | Keyed lifecycle/operation locks; mutable module generations; build/status handling; artifact registry; bounded lifecycle settings. |
| B20 | [plugins/bb-guide/skills/bb-plugin-authoring/SKILL.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/plugins/bb-guide/skills/bb-plugin-authoring/SKILL.md) | Agent-authoring instructions | Agent-created TypeScript plugins, source/type grounding, build/reload loop, experimental API audit, contract validation. |
| B21 | [docs/cli-guide-and-skill.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/cli-guide-and-skill.md) | Contributor contract | Keep CLI, agent skills, and configuration references synchronized; owner-defined environment lifecycle hooks. |
| B22 | [docs/VISION.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/VISION.md) | Design intention | Users and agents as operators; extensibility without forking; local usability and remote-capable boundaries. |
| D01 | Supplied `deep-seek-harness-deep-research-report.md` | Existing non-normative research | DeepSeek/Cordis comparison; not a fresh paper-proof or repository audit. |
| C01–C03 | Attached Collider glossary, Foundations, and open register | User-provided design basis | Owner boundaries and seven-packet decisions, supplemented by later accepted Navigator decisions in the conversation. |

## Appendix B. DeepWiki reconnaissance

DeepWiki was used for six tasks: repository structure, architecture and UI expressiveness, provider execution and durability, plugin lifecycle and trust, an implementation-file map including stale adapter material, and timeline persistence/recovery. Its answers were useful navigation aids but not accepted as a substitute for the pinned sources above.

Two corrections are recorded in Section 2: legacy provider adapters must not be described as current after the provider-plugin cutover, and explicit timeline prepend support exists in source despite an answer saying otherwise. Broad reload claims were also narrowed by consulting the separate backend and frontend lifecycle contracts.

No `mode: deep` argument was available in the discovered DeepWiki question interface used here. The depth of this report comes from multiple targeted questions followed by source verification, not a claim to have invoked an unexposed DeepWiki mode.

## Appendix C. Validation checklist for future prototypes

These are proposed checks, not tests executed in this review.

| Boundary | Cases to exercise | Required observation |
|---|---|---|
| Harness protocol | Unsupported grammar, changed negotiated capabilities, unknown native event | Legible failure/degradation; no invented event or widened permission. |
| Execution normalization | Delta before open, repeated close, key reuse, simultaneous child activity | Stable owner identities; lifecycle settlement and causal attribution match the declared contract. |
| Activity Assembly | Live append versus complete reconstruction, older pages, changed renderer | Stable Business Identity and correct source provenance; renderer change does not recreate runtime truth. |
| Pagination | Group crossing page boundary, stale response, omitted row changes, edited anchor | Explicit compatible merge or repair; never claim an immutable snapshot without one. |
| UI contribution | Provider disappears, selected renderer crashes, native fallback used | Navigation, accessibility, current user preferences, and owner actions remain recoverable. |
| Replacement | Candidate factory fails; new mount fails after old teardown; hanging disposer | Transition-specific result reported; no false global rollback or cleanup claim. |
| Capability/permission | Cached support changes, provider advertises extra access, policy revoked | Declaration, negotiation, readiness, and authorization remain separate. |
| World/environment work | Cancellation during create, stale attempt completion, cleanup failure, restart | Ownership claims and attempt fencing prevent stale mutation or unsafe resource removal. |
| Dispatch | Disconnect after submit before acknowledgement | Uncertain outcome represented; no blind duplicate external mutation. |
| Session Continuity | Native resume unavailable, model/policy/environment changes | Explicit revalidation and honest continuity/fallback indication. |
| Input/Inbox | Reference changes before dispatch; renderer missing; duplicate answer; notification dismissed | Accepted context and request lifecycle remain owner-backed; dismiss does not approve. |
| Test harness | Compare fake versus live auth, lifecycle, routing, persistence, and multi-plugin behavior | Fidelity gaps documented rather than silently treated as passing production guarantees. |

## References

[^B00]: [Snapshot commit](https://github.com/get-bb/bb/commit/41e7132e817306e43f68f91bde0a6b9f79af99de). Metadata. Inspection boundary; not a claim that every later upstream change is included.

[^B01]: [README.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/README.md). Repository contract. Programmable product direction; development-runtime split; remote-development trust warning.

[^B02]: [docs/system-overview.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/system-overview.md). Repository contract. Server/daemon/client/CLI responsibilities; Project, Thread, Environment, Host.

[^B03]: [docs/repository-overview.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/repository-overview.md). Repository contract. Package/process map; Electron and Expo are implementation choices.

[^B04]: [docs/provider-bridge-protocol.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/provider-bridge-protocol.md). Protocol contract. Semantic grammar; native-to-normalized IDs; timeline invariants; capabilities; conformance; typed installation boundary.

[^B05]: [docs/provider-plugin-api.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/provider-plugin-api.md). Public API contract. Provider declaration/handshake; narrow core vocabulary; extension kinds; declarative presentation; interaction lifecycle; steerMode limitation.

[^B06]: [packages/plugin-sdk/README.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/packages/plugin-sdk/README.md). SDK contract/test guidance. Public entrypoints; full-trust scripts; placement targets; fake-host and frontend test fidelity limits.

[^B07]: [packages/plugin-sdk/src/app-contract.ts](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/packages/plugin-sdk/src/app-contract.ts). Type declarations inspected. Bounded props; host-owned actions; Original fallback; explicit file sources; panel restoration parameters.

[^B08]: [plugins/bb-guide/skills/bb-plugin-authoring/references/backend-foundation.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/plugins/bb-guide/skills/bb-plugin-authoring/references/backend-foundation.md). Authoring contract. Candidate-safe registration limits; settings/secrets; durable storage; typed host RPC; worker leases and lifetimes; ephemeral signals.

[^B09]: [plugins/bb-guide/skills/bb-plugin-authoring/references/backend-ui-lifecycle.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/plugins/bb-guide/skills/bb-plugin-authoring/references/backend-ui-lifecycle.md). Authoring contract. Send-time mention resolution; staged backend replacement; LIFO cleanup; bounded drains; stale API objects.

[^B10]: [apps/app/src/lib/plugin-frontend.ts](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/apps/app/src/lib/plugin-frontend.ts). Implementation inspected. Hash/generation state; reconciliation; content-script disposal; CSS lifetime; diagnostics; shared host runtime.

[^B11]: [docs/plugin-sidebar-thread-list.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/plugin-sidebar-thread-list.md). Implemented API reference. Host chrome versus replacement; user preference retained on provider loss; safe original fallback; host action/data hooks.

[^B12]: [packages/client-core/src/timeline/timeline-merge.ts](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/packages/client-core/src/timeline/timeline-merge.ts). Implementation inspected. prependOlderTimelineRows; mergeLoadedTimelineWithLatest; stale-cursor recovery; recursive child merging; row-reference preservation.

[^B13]: [docs/timeline-pagination.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/timeline-pagination.md). Current pagination contract. Opaque cursors, grouping/display versions, partial groups, snapshot limits, best-effort edited-history behavior.

[^B14]: [docs/timeline-pagination-verification.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/timeline-pagination-verification.md). Project-reported verification. Paired endpoint/client corpus methodology; performance limits; unchanged-history parity versus edit limitations. Not reproduced here.

[^B15]: [packages/db/src/data/events.ts](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/packages/db/src/data/events.ts). Implementation inspected. Normalized stored events, scope fields, retained output, insertion rules, deleteThreadEventSuffixInTransaction.

[^B16]: [apps/app/src/hooks/realtime-cache-effects.ts](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/apps/app/src/hooks/realtime-cache-effects.ts). Implementation inspected. Per-entity invalidation, visibility deferral, terminal flush, reconnect repair hooks.

[^B17]: [apps/app/src/lib/plugin-frontend-reload.test.ts](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/apps/app/src/lib/plugin-frontend-reload.test.ts). Test source inspected, not run. Registration replacement, CSS publication/lifetime, generations, content-script and rendering regression cases.

[^B18]: [docs/environment-provisioning.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/environment-provisioning.md). Current lifecycle contract. Durable reservation, attempt fencing, claimPath, cancel/cleanup ordering, restart, uncertain dispatched start.

[^B19]: [apps/server/src/services/plugins/plugin-runtime.ts](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/apps/server/src/services/plugins/plugin-runtime.ts). Implementation inspected. Keyed lifecycle/operation locks; mutable module generations; build/status handling; artifact registry; bounded lifecycle settings.

[^B20]: [plugins/bb-guide/skills/bb-plugin-authoring/SKILL.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/plugins/bb-guide/skills/bb-plugin-authoring/SKILL.md). Agent-authoring instructions. Agent-created TypeScript plugins, source/type grounding, build/reload loop, experimental API audit, contract validation.

[^B21]: [docs/cli-guide-and-skill.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/cli-guide-and-skill.md). Contributor contract. Keep CLI, agent skills, and configuration references synchronized; owner-defined environment lifecycle hooks.

[^B22]: [docs/VISION.md](https://github.com/get-bb/bb/blob/41e7132e817306e43f68f91bde0a6b9f79af99de/docs/VISION.md). Design intention. Users and agents as operators; extensibility without forking; local usability and remote-capable boundaries.

[^D01]: User-supplied **DeepSeek Harness and Cordis: Architectural Implications for Collider**, `deep-seek-harness-deep-research-report.md`. Used as supporting comparison evidence, not canonical authority or a newly reproduced verification.

[^C01]: User-supplied `00-collider-v1-glossary(1).md`, with accepted subsequent decisions in this conversation. Source terminology and authority constraints remain controlling; this research does not edit them.

[^C02]: User-supplied `01-collider-v1-foundations(1).md`, with accepted subsequent Navigator decisions in this conversation. The newer previously linked output was not available in this runtime.

[^C03]: User-supplied `02-collider-v1-open-architecture-questions(1).md`, through C-OQ-022, supplemented by the accepted Navigator questions C-OQ-023–026 in this conversation. No question is resolved by this report.
