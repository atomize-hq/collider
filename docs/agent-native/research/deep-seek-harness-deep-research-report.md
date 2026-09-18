# DeepSeek Harness and Cordis: Architectural Implications for Collider

## Executive assessment

**Recommendation: DeepSeek Harness should materially influence Collider’s architecture, but Collider should not fork DeepSeek Harness, and I would not make Cordis itself a foundational dependency yet.** The strongest value is not the Harness product structure as a whole; it is the **composition paradigm underneath it** and several concrete implementation patterns DeepSeek has built on top of that paradigm. DeepSeek Harness explicitly describes itself as an agent harness in which “everything is a plugin,” powered by Cordis, and its current README still labels the project a rapidly changing developer preview with compatibility-breaking changes expected. citeturn13search1turn13search2

The paper linked by the Harness, **“A Programming Paradigm for Spatiotemporal Composability,”** was submitted to arXiv on August 26, 2026. Its authors are Yifan Shi, Wei Zhang, and Tianyi Cui, with affiliations to Peking University and DeepSeek-AI. It formalizes two properties that are unusually relevant to Collider: **temporal composability**, meaning a component can be removed while its mediated effects are unwound, and **spatial composability**, meaning dependencies are declared and reactively resolved as the runtime changes. The two are unified through a first-class context abstraction and implemented in Cordis. citeturn16academia29 fileciteturn0file0

My overall judgment is:

| Question | Recommendation |
|---|---|
| Should we study the paper as an architectural input? | **Yes — strongly.** |
| Should it influence Collider’s extension/plugin model? | **Yes — materially.** |
| Should it influence Blocks/Surfaces? | **Yes, but indirectly.** Its closest analogues are Conversation Nodes, Slots, projections, and providers—not Cordis components themselves. |
| Should it influence the open Workstream/history question? | **Yes.** In fact, DeepSeek’s implementation argues *against* prematurely forcing one canonical Workspace event log. |
| Should Collider fork DeepSeek Harness? | **No.** The product/state model is too session-centric and Harness-specific. |
| Should Collider adopt Cordis wholesale? | **Not yet.** Its semantics are worth adopting; the library dependency deserves a separate spike if our client stack makes that attractive. |
| Should Collider reproduce Cordis-like semantics natively around Substrate? | **Very likely yes**, particularly declared capabilities, lifecycle-scoped registrations, reversible cleanup, derived capability contexts, and provider/consumer seams. |
| Should we freeze the three Collider documents exactly as they stand? | **Not quite.** They are directionally validated, but this research exposes several extension-architecture questions that should be recorded before we call the foundation closed. |

The most important insight is that the DeepSeek work **does not require us to replace our Block/Surface model**. It actually gives us a stronger architecture *underneath* that model:

```text
Authoritative domain/runtime state
         │
         │ durable records / observable state
         ▼
target-neutral projection / assembly
         │
         ▼
Activity Item / Block data
         │
         ├───────────────┐
         ▼               ▼
Block renderer        Surface
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
            inline     sticky      tab
```

And independently:

```text
Extension / Provider
       │
       ├── declares required capabilities
       ├── provides capabilities
       ├── registers renderers / projections / commands
       ├── owns lifecycle-scoped effects
       └── unload => registrations/effects unwind
```

That separation—**extension/provider is behavior; Block/Surface is presentation**—is, in my view, the most important thing to preserve.

## What the paper actually contributes

The paper is much more ambitious than a conventional plugin-API proposal. It is trying to formalize what it means for a running system to be safely reconfigurable without restarting the whole process. Its motivating examples explicitly include conventional plugin systems and **self-evolving agent harnesses**, where tools, policies, adapters, and capabilities may change while useful runtime state should remain alive. citeturn16academia29 fileciteturn0file0

### Revertible effects are the temporal half

The first idea is that a component should not merely have an informal `dispose()` callback that an author hopefully writes correctly. Effects are performed through a context, and each effect supplies an inverse that the runtime accumulates. On teardown, the accumulated inverses execute in reverse order. Cordis exposes this concretely through `ctx.effect(...)`; its implementation uses effect iterators so a multi-stage component activation can be interrupted at step boundaries and only the effects already installed need to be recovered. fileciteturn0file0

Conceptually:

```text
component activation

register tool      -> inverse: unregister tool
subscribe event    -> inverse: unsubscribe event
start timer        -> inverse: stop timer
provide service    -> inverse: withdraw service
install UI entry   -> inverse: remove UI entry

                ↓

component lifetime owns the accumulated inverses

                ↓ unload

remove UI entry
withdraw service
stop timer
unsubscribe event
unregister tool
```

This is directly relevant to a future Collider extension model. A Surface Provider, Block renderer, command provider, MCP adapter, context contributor, or Inspector extension should not be able to casually leave “zombie” registrations behind because someone forgot one cleanup call.

There is, however, an essential qualification that prevents us from saying the paper has “solved reversible plugins.” The Cordis runtime **does not verify that the inverse supplied by a component really reverses its effect**, nor does it verify all of the commutativity assumptions required by the formal theory. The paper explicitly calls those author obligations. The metatheory applies when those witnesses and independence conditions hold. fileciteturn0file0

So the transferable lesson is:

> **Make lifecycle ownership and recovery structural rather than ad hoc—but do not mistake a disposer abstraction for automatic transactionality over arbitrary external side effects.**

### Reactive coeffects are the spatial half

The second half is dependency management. Components declare what capabilities they require; providers publish those capabilities through the context; and the runtime activates, deactivates, or reloads consumers as the resolved providers change. This is more dynamic than ordinary constructor-time dependency injection. The paper calls these requirements **reactive coeffects**. citeturn16academia29 fileciteturn0file0

Cordis additionally has two mechanisms that deserve particular Collider attention:

**Isolation** lets the same logical capability key resolve to a different binding in different derived contexts. That is potentially useful for Collider/Substrate because a logical capability such as filesystem, shell, repository, tool registry, credentials, or execution policy may need to resolve differently depending on a Workspace, Lane, Session Continuity context, or other runtime realm. fileciteturn0file0

**Interception** changes how a capability is used without changing which provider satisfies it. The paper gives access-control style examples such as attaching path restrictions to a filesystem capability. That maps remarkably well onto our existing notion that execution conditions and policy/capability projection may differ by Lane without requiring every consumer to know the implementation details. fileciteturn0file0

A Collider-oriented form might eventually look like:

```text
logical capability: filesystem
             │
             ├── Workspace context -> workspace filesystem broker
             │
             ├── Lane A context    -> worktree A
             │                         read/write allowed
             │
             └── Lane B context    -> worktree B
                                       read-only interception
```

That is much cleaner than passing working directories, policy objects, filesystem implementations, and permission flags independently through every layer.

### The formal result is important, but conditional

The paper builds a component calculus around **components** and runtime **fibers**, including loading, active, unloading, and inactive transitions. Provider teardown is ordered around dependent teardown, and the authors prove recovery, preservation, progress, and confluence properties under the assumptions of the formal system. The intended result is that legal dynamic reconfiguration converges, observationally, to the same result as starting the final configuration from scratch. fileciteturn0file0

That is compelling for Collider because our long-term problem is precisely:

> “Can capabilities, views, adapters, agents, plugins, and policies enter and leave a running Workspace without destabilizing unrelated work?”

But this is an **active preprint**, not a settled software-engineering standard. The paper repository explicitly warns that it is under active revision and may change substantially. The paper’s own Koishi case study is an existence/adoption case study rather than a controlled comparison; the authors explicitly identify quantitative overhead and productivity comparison as future work. citeturn22search0turn16search3 fileciteturn0file0

### The paper’s limitations matter a lot for Collider

The discussion section is arguably as valuable as the formalism.

First, reversibility ends at the **system boundary**. Opening a file handle can be reversibly tracked; bytes already emitted to an externally visible file or network destination generally cannot simply be “unwritten” by context cleanup. The paper distinguishes acquisition from emission and discusses withholding output or application-specific compensating actions for effects that cross the boundary. fileciteturn0file0

Second, **Cordis is not a hostile-code sandbox**. Capability declarations constrain context-mediated access, but code that can escape through ambient Node APIs or underlying objects can bypass those restrictions. The paper says untrusted components require an external boundary such as a sandboxed process, separate runtime, software-fault isolation, or virtualized environment, with host capabilities bridged into it. fileciteturn0file0

Third, dependency cycles are deliberately awkward. A direct A-requires-B/B-requires-A cycle cannot activate; the suggested architecture is to factor the bidirectional relationship into smaller core and integration components. The paper acknowledges this can increase component count and cognitive/configuration overhead. fileciteturn0file0

Fourth, **dependency typing and versioning are explicitly unsolved at the general level**. Key identity alone does not prevent independently developed providers from drifting in interface shape or accidentally colliding. Cordis currently leans on package-manager peer dependencies; the paper discusses namespacing and structural compatibility but calls a unified solution an open problem. fileciteturn0file0

Those limitations should directly shape any Collider plugin architecture we derive from this work.

## What DeepSeek Harness actually implements

The repository is more relevant to Collider than the phrase “everything is a plugin” initially suggests. DeepSeek has already worked through several of the exact architectural boundaries we have been discussing.

### Cordis is the composition kernel, not the business domain

DeepSeek’s architecture documentation says every major piece of Harness is a Cordis plugin—including the model adapter, tool registry, session log, and agent loop. Plugins contribute **services, typed events, and reversible effects to a shared context**, and registrations unwind when their owning plugin unloads. A running application is composed from profiles, bundles, and patch layers rather than from one privileged monolithic core. citeturn13search1 fileciteturn4file0L2-L5

This distinction matters:

```text
Cordis
  = composition/lifecycle substrate

DeepSeek Harness
  = agent-harness domain built from Cordis components

Web UI
  = another Cordis application with UI-specific capabilities
```

That argues for us to think about a **Collider extension kernel** as a level *below* Blocks and Surfaces.

### DeepSeek separates code arrival from plugin lifecycle

The browser client has a lower-level module system responsible for discovering, fetching, versioning, and materializing client packages, while Cordis separately owns whether the corresponding plugin can activate based on its declared service dependencies and lifecycle. The host builds a `WebBootGraph`; packages declaring `dsh.client` contribute browser bundles; HMR can revise individual package artifacts; and Cordis activation remains a separate concern from module graph arrival. fileciteturn8file0L2-L6

This is a subtle but excellent architectural pattern:

```text
Can I load the code?
        ≠
May/should this component activate?
```

For Collider, that suggests we should not make “plugin download/import” and “plugin capability activation” the same operation. That becomes especially important once MCP Apps, local first-party extensions, potentially signed third-party packages, or remote/WASM components coexist.

### The web client’s ownership model strongly validates ours

DeepSeek’s web architecture is explicitly layered:

```text
Host authoritative state
        ↓
Remote/API transport
        ↓
React-free Client model
        ↓
UI adapter / Conversation projection
        ↓
Slots
        ↓
React
```

The Host owns authoritative state, persistence, mutation ordering, access policy, and stream production. Client models maintain identity-stable local projections. UI adapters do not assume ownership of business state. React components are at the edge of the pipeline rather than being lifecycle or persistence authorities. fileciteturn6file0L2-L6

That is exceptionally close to what we have been asserting in Collider:

> **Surface ≠ State Owner**  
> **Tab ≠ State Owner**  
> **Block = presentation**

I would now regard that part of our foundations as **strengthened rather than challenged** by the DeepSeek work.

### Slots are much closer to our extensibility problem than Cordis components are

DeepSeek’s Web Client has a typed **Slot** system specifically for UI composition. Feature plugins call `ctx.slots.register()` instead of runtime-importing another feature plugin’s components. A component that owns a render location declares its child slots; contributions into those slots follow Cordis effect lifetimes, so removing an owner recursively removes the child structure and removing a contributor removes only that contribution. fileciteturn7file0L2-L6

Slots support multiple composition semantics—single, list, keyed, and chain—and have explicit root/session scoping. The current hierarchy includes extension locations for the sidebar, settings, conversation views, chat nodes, tool views, composer elements, details, and overlays. fileciteturn7file0L2-L6

This is likely one of the most important systems for us to study in detail.

A Collider translation would **not** necessarily mean exposing arbitrary “slots” in exactly the same way. But I would adopt the underlying law:

> **The owner of a presentation location declares the extension point. Contributors register typed contributions into that location without importing or taking ownership of the owner’s implementation.**

This provides a potential architecture for:

```text
Workspace Navigator contributions
Workstream Block renderers
Surface providers
Composer actions
Tab actions
Sticky-stack chrome
Inspector panels
Artifact-specific actions
Run/execution presentations
```

DeepSeek has even had to reason explicitly about the lifecycle intersection between **slot declaration lifetime** and **contribution lifetime**: a contribution may exist before or after the plugin that declares a particular slot, and removing either party must cleanly unwind only what that party owns. Their implemented slot-injection design handles exactly that problem. citeturn13search4

That is the sort of edge case a serious Collider extension model will eventually hit.

### Conversation assembly is the closest analogue to Blocks

This is the biggest direct connection to our recent discussion.

DeepSeek’s `ui-conversation` layer does **not** let every UI node become canonical history. Instead:

```text
Session event window
        ↓
ConversationNodeDefinitions
        ↓
stable per-business-object Context
        ↓
target-specific view node
        ↓
Chat / Trajectory snapshot
        ↓
Slot renderer
```

An Event Definition matches durable events, correlates them using a stable `(kind, id)`, deterministically folds state, and optionally materializes a target node. Different targets such as Chat and Trajectory can interpret the **same underlying event family independently** while owning their own view-specific node payloads. fileciteturn5file0L2-L6

DeepSeek specifically warns against assigning an update to “the latest unfinished” object. The event producer must supply or independently derive a stable business identity; replay, pagination, live append, and reconstruction then converge against that identity. fileciteturn5file0L2-L6

That maps extremely well onto our direction:

```text
Collider terminology                   DeepSeek closest analogue

Durable Source Record          ≈       SessionEvent / model record
Activity Projection            ≈       Conversation assembly
Activity Item                  ≈       Conversation Node
Block                          ≈       rendered target node
Block renderer/provider        ≈       keyed Slot renderer
Workstream rendering mode      ≈       Chat / Trajectory target
```

The analogy is not exact, but the architectural pattern is excellent.

The lesson I would carry into Collider is:

> **Do not make Blocks themselves canonical records. Define stable producer-owned identities and deterministic projection definitions that turn owner records into Block-ready view models.**

That is stronger and more specific than the principle we had before this research.

### DeepSeek’s own “Surface” is not our Surface

There is a potentially dangerous vocabulary collision. DeepSeek’s session subsystem uses **`SessionSurface`** for the ordered message-producing projection from which model history is derived. It is not an interactive application Surface in our sense. The underlying `Session` is an append-only log of typed events; only particular events join the current model “surface,” and replacements can shadow earlier surface entries while retaining raw history. citeturn19search0turn19search2

So we should **not** infer that their `Surface` abstraction validates the name or semantics of our `Surface`. Their UI analogue to our Surface is distributed across Conversation Views, Slot entries, feature components, and owner-backed client models.

Our terminology remains coherent, but any future architectural research note should explicitly flag this collision to prevent accidental copying of semantics.

### Their session architecture informs—but does not settle—our Workspace history question

This may be the most consequential finding for our open architecture register.

DeepSeek does indeed make a `Session` an append-only event log and the single source of truth for that **agent interaction**. Model history is derived from the log rather than stored separately; plugin-defined durable event types can extend the event vocabulary. citeturn19search0

But DeepSeek **does not make that session log the one universal history of the entire product**.

Its Web Client architecture separately maintains:

- durable Session history;
- transient Session-control baseline/update streams;
- Workspace state baseline/update streams;
- ordinary forwarded events that are not replayed;
- feature-specific client models with their own reconciliation semantics. fileciteturn6file0L2-L6

The documentation explicitly rejects a monolithic universal client runtime/resynchronization stream and says each model should define recovery according to its data semantics. fileciteturn6file0L2-L6

That is very important evidence for our unresolved question:

> **Does Collider need one canonical Workspace event history?**

DeepSeek provides a compelling example of the alternative:

```text
Owner-specific authoritative histories/state
              │
     ┌────────┼─────────┐
     │        │         │
 Session   Workspace   live control ...
     │        │         │
     └────────┼─────────┘
              ▼
     target-neutral projections
              ▼
       coherent user experience
```

This strengthens the direction we arrived at immediately before this research: **unified projection does not require unified persistence authority**.

I would therefore keep our Workspace-history question explicitly unresolved, but after studying DeepSeek I would assign a higher prior probability to:

> **federated authoritative source state + projection/index layer**

than to:

> **one canonical Workspace event log containing everything.**

That is an inference from DeepSeek’s implementation combined with Collider’s additional authorities—Substrate, Handbook, MCP Apps, shell/PTY, repositories—not a claim that DeepSeek proves the federated approach is always superior. fileciteturn6file0L2-L6 fileciteturn5file0L2-L6

### Sessions are also a very useful precedent for our deferred Session Continuity mode

DeepSeek’s rule is effectively: **if something becomes model-visible, the durable Session log must contain enough information to reconstruct it**. Model history, resume, fork, transcripts, and related behavior derive from that log. fileciteturn4file0L2-L5 citeturn19search0

That is a strong design for the **explicit session mode** we recently discussed for Collider.

I would not make it Collider’s default Workstream architecture. But when a user says:

> “Continue this exact conversational/model session rather than reconstructing context anew,”

then a session-local continuity log with a strict **model-visible ⇒ reconstructable** invariant is extremely attractive.

That gives us two complementary modes:

```text
Collider default
──────────────────────────────────────
Workstream Invocation
      ↓
fresh Resolution
      ↓
fresh Context Pack
      ↓
execution


Explicit Session Continuity
──────────────────────────────────────
Invocation
      ↓
continuing Session
      ↓
reconstruct exact model-visible history
      ↓
next request
```

DeepSeek demonstrates that the second model can be rigorous without requiring it to become the top-level organization system. citeturn19search0

## Where the ideas map to Collider

The correct mapping is not “Cordis plugin = Collider Block.” That would collapse runtime behavior and presentation.

The more useful mapping is:

| DeepSeek / Cordis concept | Collider analogue or lesson | Assessment |
|---|---|---|
| Cordis **Component** | Extension/provider definition | Strong analogue |
| Cordis **Fiber** | One mounted runtime instance of an extension | Useful internal concept; do not adopt name yet |
| Cordis **Context** | Extension/capability context | Strong architectural inspiration |
| `inject` / reactive coeffect | Declared required capability | Strongly adopt concept |
| `provide` / service | Typed capability provider | Strongly adopt concept |
| isolation realm | Per-Workspace/Lane/Session capability resolution | Strongly investigate |
| interception metadata | Policy/capability attenuation | Strongly investigate |
| `ctx.effect` + disposer | Lifecycle-owned reversible registration | Strongly adopt concept |
| Service broker | Stable multiplexer over multiple providers | Very relevant to MCP/tool/surface/provider registries |
| Profile / bundle / patches | Composable extension configuration | Useful, secondary |
| SessionEvent log | Exact Session Continuity history | Strong pattern for optional sessions, **not** Workspace history |
| Conversation Definition | Source-record → Activity Item projection definition | **Extremely relevant** |
| Conversation Node | Block-ready activity/view node | Closest Block analogue |
| Chat / Trajectory target | Alternate projection/view of same source family | Relevant to Workstream projections |
| UI Slot | Typed extension location | **Extremely relevant** |
| Slot contribution | Registered Block/Surface/chrome renderer/action | Strong analogue |
| Client model | React-free owner-backed state mirror | Strongly aligns with Surface ownership |
| Cordis temporary plugin | Privileged dynamic/self-modifying extension | Interesting later, not safe default |
| DeepSeek `SessionSurface` | No direct Collider Surface analogue | **Do not conflate** |

The implementation evidence behind this mapping comes from DeepSeek’s architecture, Conversation, Slots, Session, and Web Client documents rather than merely from the paper’s theory. fileciteturn4file0L2-L5 fileciteturn5file0L2-L6 fileciteturn6file0L2-L6 fileciteturn7file0L2-L6 citeturn19search0

### One particularly strong Collider architecture emerges

I would now investigate a layered architecture approximately like this:

```text
┌──────────────────────────────────────────────────────────────┐
│                    OWNER SYSTEMS                             │
│                                                              │
│  Handbook         Substrate       MCP / external systems     │
│  semantic truth   runtime truth   provider-owned state       │
└──────────┬──────────────┬────────────────┬───────────────────┘
           │              │                │
           │ records / services / commands / streams
           ▼              ▼                ▼
┌──────────────────────────────────────────────────────────────┐
│             COLLIDER EXTENSION / CAPABILITY KERNEL           │
│                                                              │
│  Extension instance                                          │
│    requires: typed capabilities                              │
│    provides: typed capabilities                              │
│    effects: lifecycle-scoped registrations                   │
│    realm: workspace / lane / continuity context              │
│                                                              │
│  Registries / brokers                                        │
│    commands · source adapters · projectors · surfaces        │
│    block renderers · actions · inspectors                    │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    PROJECTION LAYER                          │
│                                                              │
│  Authoritative Source Record(s)                              │
│            ↓                                                 │
│  registered deterministic projector                         │
│            ↓                                                 │
│  Activity Item / Surface reference                           │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    COLLIDER CLIENT                           │
│                                                              │
│  Workstream projection                                      │
│       ↓                                                      │
│  Block renderer                                              │
│       ↓                                                      │
│  inline / sticky / tab Surface Placements                    │
└──────────────────────────────────────────────────────────────┘
```

This preserves every important boundary we already wanted while adding a principled extension substrate beneath them.

## What I think Collider should borrow

### Borrow lifecycle-scoped registration as a first-class law

The strongest idea to adopt is:

> **An extension should not perform an unowned registration. Every dynamically introduced capability, listener, renderer, action, provider, subscription, timer, or other host-visible effect should belong to an extension lifetime and have a deterministic teardown path.**

DeepSeek applies this all the way into the browser Slot system: when the contributing plugin goes away, its UI contribution disappears through the same effect lifecycle rather than through bespoke cleanup logic. fileciteturn7file0L2-L6

For Collider this could eventually mean:

```text
extension.effect(registerSurfaceProvider(...))
extension.effect(registerBlockRenderer(...))
extension.effect(registerActivityProjector(...))
extension.effect(registerCommand(...))
extension.effect(subscribe(...))
```

The API does not need to resemble Cordis syntactically. The **ownership invariant** is what matters.

### Borrow capability seams, not implementation imports

DeepSeek’s architecture consistently separates a service definition, one or more providers, and consumers. For example, its web capability has a provider-independent service through which distinct search/fetch implementations register, while the model-facing tool remains a consumer rather than binding itself directly to a backend implementation. citeturn19search3

Collider has many natural seams:

```text
Filesystem
Shell / PTY
Repository
Process execution
MCP transport
Surface provider
Activity projection
Handbook access
Artifact mutation
Context resolution
Credential access
Browser / web
Source editing
Diff
Testing
```

The value is not “everything must be abstract.” The value is that **things intended to be replaceable are mediated through an explicit seam**.

### Borrow derived contexts/realms, but do not rename Handbook Scope

The Cordis context/realm model could be extremely useful for resolving capabilities differently by execution environment.

I would not use the word `Scope`, because we have already reserved **Scope** for Handbook semantic meaning.

Instead, a future internal term such as **Extension Context**, **Capability Context**, or **Capability Realm** could describe:

```text
Root
  └── Workspace capability context
       ├── Control Plane context
       ├── Lane A context
       │    └── Session S1 context
       └── Lane B context
```

A component can then request `filesystem` without carrying a hard-coded Lane object through its entire API; the derived context determines which filesystem capability it sees.

This is exactly the kind of architectural simplification the paper’s isolation mechanism is intended to enable. fileciteturn0file0

### Borrow target-neutral projection definitions

I would go further here than our current documents do.

DeepSeek’s Conversation subsystem suggests that a **Block type should ideally have a producer/projector contract**, not merely a React renderer.

For example:

```text
Test activity source records
     │
     ▼
TestResultProjector
     │
     ├── stable identity
     ├── match relevant records
     ├── deterministic state fold
     ├── visibility
     ├── display model
     └── optional Surface reference
          │
          ▼
      TestResultBlock
```

The renderer should receive a bounded, renderer-ready view model rather than scan arbitrary Workspace history. DeepSeek explicitly imposes this discipline on its Conversation Definitions and optimizes live append around stable keyed contexts rather than repeated whole-history scans. fileciteturn5file0L2-L6

That gives us a much stronger future `Activity Projection` abstraction.

### Borrow typed UI extension locations

We should seriously study a Collider equivalent of DeepSeek Slots.

I would not necessarily expose all layout as public plugin slots in V1. But internally, a typed location system is much healthier than every plugin reaching into a React tree or registering global components.

For example:

```text
collider.workspace.navigator.section
collider.workstream.block
collider.block.actions
collider.composer.action
collider.surface.actions
collider.tab.actions
collider.sticky.chrome
collider.inspector.section
```

Each could define:

```text
cardinality
allowed scope/realm
owner props
contribution payload
replacement semantics
ordering
capability requirements
lifecycle ownership
```

DeepSeek’s Slot system already demonstrates why these details matter, including declaration ownership, replacement semantics, independently reloadable contributors, and recursive teardown. fileciteturn7file0L2-L6 citeturn13search4

### Borrow “React is projection,” almost verbatim as a principle

DeepSeek’s browser architecture deliberately keeps authoritative state in host services, mirrors it in React-free client models, and keeps presentation components from receiving the framework context directly. fileciteturn6file0L2-L6

That is precisely the discipline Collider needs to keep this true:

```text
closing a Tab
closing a Block
unmounting React
HMR replacing a renderer

             ≠

stopping execution
deleting semantic state
destroying a Lane
losing an MCP application object
losing a Workstream
```

This is one of the strongest external validations of our current foundation.

### Borrow their session rigor specifically for Session Continuity

When we eventually implement the explicit Session/continuation behavior you raised, I would study DeepSeek’s invariant very closely:

> model-visible material must be reconstructable from durable session history.

Their append-only log preserves raw events while a derived message surface determines what the model currently sees, including replacement/compaction behavior. citeturn19search0

I would not import their entire Session abstraction, but the **auditability requirement** is excellent.

### Study—but do not yet adopt—the self-referential plugin mechanism

DeepSeek has already implemented a particularly advanced idea: a model-facing toolset that can **inspect the live Cordis runtime, mount an in-memory temporary plugin, and later unmount it to quiescence**. The design specifically relies on ordinary Cordis provider/injection and cleanup semantics so temporary agent-created extensions participate in the same lifecycle as authored plugins. fileciteturn13file0L2-L6

This is directly relevant to the long-term possibility that a Collider/Substrate agent could synthesize a temporary capability or specialized application during work.

But DeepSeek is explicit that its `node:vm` layer is **not a security boundary**. Temporary plugins have effectively bash-equivalent trust, can reach real host capabilities exposed through the façade, share the Harness process, and may affect other sessions. The feature is opt-in development functionality rather than a product-default sandbox. fileciteturn13file0L2-L6

So for Collider:

```text
self-authored temporary component
```

is a fascinating future capability;

```text
arbitrary model-generated JavaScript inside the trusted Collider/Substrate process
```

should absolutely **not** become our default extensibility model.

## What Collider should not copy

### Do not copy “everything is a plugin” too literally

The slogan is useful for DeepSeek because Cordis is its composition substrate. It would be a mistake to turn every Collider concept into an extension.

A **Lane is not a plugin**.

A **Workstream is not a plugin**.

A **Block is not a plugin**.

A **Surface instance is not a plugin**.

A **Handbook Artifact is not a plugin**.

Instead:

```text
Artifact viewer provider     may be an extension
Block renderer               may be an extension
Surface provider             may be an extension
Lane activity projector      may be an extension
MCP bridge                   may be an extension

Artifact instance            is domain state
Block instance               is presentation
Surface instance             is presentation/application state
Lane                         is execution state
```

That distinction keeps our ontology clean.

### Do not use DeepSeek’s Session log as the Collider Workspace truth

DeepSeek’s Session log is excellent for exactly what it claims to be: one agent interaction’s authoritative log. citeturn19search0

Collider has a different integration problem:

```text
Handbook semantic history
Substrate execution records
PTY streams
repositories/filesystems
MCP application state
possibly Session Continuity histories
Collider-local interaction/presentation references
```

Trying to push all of those into a DeepSeek-style SessionEventMap would likely recreate the authority duplication we have been trying to avoid.

Indeed, DeepSeek’s own Workspace state is outside the Session log and follows a different baseline/incremental model. fileciteturn6file0L2-L6

So this research **reinforces our decision not to settle the canonical Workspace-history question yet**.

### Do not treat reversible effects as distributed transactions

Cordis can cleanly undo **mediated local registrations**. That does not mean an extension can retract an email it sent, arbitrary bytes another process observed, a remote API mutation, or an irreversible external side effect. The paper is explicit about this boundary and discusses compensation or deferred commitment for such cases. fileciteturn0file0

For Collider, we should eventually distinguish something like:

```text
reversible host registration
    unregister renderer
    detach event listener
    release PTY handle
    unregister provider

owned resource teardown
    stop process
    release sandbox
    close transport

compensatable domain action
    revert patch
    delete created resource

irreversible emission
    external message sent
    remote side effect already observed
```

Those categories must not be collapsed into one magical `dispose()` concept.

### Do not use capability context as the security boundary for third-party extensions

The paper says not to, and DeepSeek’s own self-modifying plugin feature says not to. Untrusted code needs process/WASM/container-style isolation beyond language-level capability mediation. fileciteturn0file0 fileciteturn13file0L2-L6

That leads to an important Collider design principle:

```text
Trusted first-party extension
    ↓
may run in-process against capability context


Untrusted / third-party / remotely sourced extension
    ↓
sandboxed process / WASM / MCP-style boundary
    ↓
trusted bridge component
    ↓
attenuated host capabilities
```

The **bridge itself** can still participate in the reversible component lifecycle. That gives us the best of both models.

### Do not copy Cordis key identity without a stronger extension contract

The paper itself identifies dependency-versioning and key-collision issues as an open problem. fileciteturn0file0

A Collider plugin API should probably not start life with anonymous global string keys like:

```text
"filesystem"
"surface"
"editor"
```

and assume independent packages will never collide or evolve incompatibly.

We should investigate an identity model containing some combination of:

```text
namespace
capability id
interface/schema version
provider identity
required compatibility range
trust/provenance
```

This belongs in the open architecture work, not in the glossary yet.

### Do not fork Harness

A fork would inherit a large set of assumptions that are specifically DeepSeek Harness assumptions: Session-centered agent history, its agent loop, its configuration model, its Node/TypeScript package topology, its web transport, its current UI organization, and its own rapidly evolving developer-preview APIs. citeturn13search1turn13search2

Collider already has a fundamentally different authority decomposition:

```text
Handbook
    semantic authority

Substrate
    Workspace / execution authority

Collider
    interaction / presentation authority
```

The DeepSeek architecture is most valuable **as a source of reusable laws and design patterns beneath that decomposition**, not as the base application we should mutate into Collider.

## Implications for the Collider documents before we lock them

The good news is that I do **not** think this research invalidates the glossary or Foundations we just produced. Quite a lot of it validates them.

### The parts I would now consider more strongly supported

These current principles look better after studying DeepSeek:

> **Surface ≠ State Owner**

DeepSeek deliberately separates host authority, client models, conversation projection, slots, and React presentation. fileciteturn6file0L2-L6

> **Block is presentation rather than canonical source state.**

DeepSeek’s Conversation Nodes are deterministic target-specific projections over durable events rather than the underlying event source itself. fileciteturn5file0L2-L6

> **One coherent Workstream UI does not require one canonical backing event history.**

DeepSeek itself uses separate durable Session, Workspace, and transient-control models, with target-specific projection and recovery semantics. fileciteturn6file0L2-L6

> **Session Continuity should be optional rather than the top-level Collider information architecture.**

DeepSeek demonstrates how rigorous a Session can be when exact history continuity is desired, while Collider can still make Workspace/Workstream the surrounding UX abstraction. citeturn19search0

> **Surface Providers should remain protocol-neutral.**

DeepSeek’s own extension model has separate service capabilities, browser modules, slots, target renderers, and transport boundaries rather than equating the extension abstraction with a single protocol. fileciteturn6file0L2-L6 fileciteturn8file0L2-L6

### I would not add Cordis terminology to the glossary yet

In particular, I would **not** add `Component`, `Fiber`, `Effect`, `Coeffect`, or `Realm` as canonical Collider nouns yet.

Those are implementation-architecture candidates, not settled product ontology.

That is analogous to why we marked the Run/Agent topology provisional.

### I would add a new unresolved architecture cluster before approving the register

The new open-questions document should gain a high-priority research/decision area approximately titled:

> **Extension Kernel and Spatiotemporal Composition**

It should track at least these questions:

**Extension lifecycle.** Should Collider/Substrate require every dynamic registration to belong to a lifecycle scope with deterministic cleanup? How do asynchronous effects, failures during activation, reloads, and partial activation unwind?

**Capability graph.** How are required/provided capabilities declared? Which capability families deserve formal seams rather than direct imports?

**Derived capability contexts.** Do Workspace, Lane, explicit Session Continuity, Surface providers, or other runtime boundaries receive derived capability contexts? Can this replace ad hoc propagation of execution environment objects?

**Isolation versus security.** Which extensions may execute in-process, and which require process/WASM/MCP isolation? What is the bridge contract?

**Capability identity and compatibility.** How are keys namespaced/versioned, and how are provider/consumer compatibility errors surfaced?

**Client extension composition.** Should the Collider client adopt a typed Slot-like system for presentation extension points?

**Activity projection providers.** Should a registered projector be the canonical mechanism for turning one or more Source Records into stable Activity Items/Blocks?

**Module arrival versus activation.** Should plugin acquisition/loading be a distinct layer from capability activation and lifecycle?

**Self-modifying runtime.** Is there ever a supported path for an agent to construct a temporary extension? If so, what trust tier and sandbox apply?

Those are now sufficiently important that I would not call the extensibility architecture “settled” without resolving at least the first six.

### The Workspace-history research item should be sharpened, not closed

DeepSeek gives us a useful reference architecture to add to that research question:

```text
Option A
One canonical Workspace event history

Option B
Federated authoritative histories
+ Workspace activity/index projection

Option C
Fully query-time federation

DeepSeek reference pattern
Per-domain authoritative histories/models
+ target-neutral deterministic projection
+ domain-specific replay/recovery
```

The DeepSeek pattern does not exactly equal Option B, but it gives us a mature implementation to study when researching it. fileciteturn6file0L2-L6

I would therefore leave the question unresolved.

### Sticky placement and Tab Promotion remain unaffected

Nothing in the Harness contradicts our presentation-state model.

In fact, DeepSeek’s strict separation between business state, client models, target nodes, and Slot-rendered React makes the placement model look even cleaner:

```text
Source state
    │
projection
    ▼
Block / Surface identity
    │
    ├── chronological placement
    ├── sticky placement
    └── tab placement
```

Stickiness and tab presence remain presentation state; they do not migrate ownership of the underlying source object.

DeepSeek’s Slot model could later help us define where sticky-stack controls and tab actions are extensible, but it does not change their meaning. fileciteturn7file0L2-L6

## Recommended architectural direction

After reading the paper and examining the current Harness architecture, I would make the following architectural call:

> **Collider should adopt the principles of spatiotemporal composability as a design influence for its extension kernel, while retaining Collider’s existing owner-state, Workstream, Block, Surface, Lane, and presentation ontology.**

More concretely, I think our target should become:

```text
                        COLLIDER / SUBSTRATE

             ┌───────────────────────────────┐
             │      Authority systems        │
             │                               │
             │ Handbook   Substrate   MCP    │
             └───────────────┬───────────────┘
                             │
                             ▼
             ┌───────────────────────────────┐
             │       Capability kernel       │
             │                               │
             │ requires / provides           │
             │ lifecycle-owned effects       │
             │ derived capability contexts   │
             │ interception / policy         │
             │ provider brokers              │
             └───────────────┬───────────────┘
                             │
                   source records/state
                             │
                             ▼
             ┌───────────────────────────────┐
             │      Projection registry      │
             │                               │
             │ stable identity               │
             │ deterministic folding         │
             │ Activity Items                │
             │ Surface references            │
             └───────────────┬───────────────┘
                             │
                             ▼
             ┌───────────────────────────────┐
             │       Workstream shell        │
             │                               │
             │ Control Plane projection      │
             │ Lane-filtered projection      │
             │ Session projection later      │
             └───────────────┬───────────────┘
                             │
                             ▼
             ┌───────────────────────────────┐
             │      Presentation layer       │
             │                               │
             │ Blocks                        │
             │ Surfaces                      │
             │ sticky placements             │
             │ Tabs                          │
             │ Inspector                     │
             └───────────────────────────────┘
```

For trusted internal extensions, I would seriously pursue a Cordis-inspired rule set:

```text
ExtensionDefinition
    requires capabilities
    provides capabilities
    installs effects only through lifecycle ownership

ExtensionInstance
    runs within a derived capability context
    becomes active only when requirements are satisfied

Dispose
    removes dependents safely
    unwinds registrations in owned order
    does not pretend to undo external irreversible emissions
```

For external/untrusted extensions:

```text
Untrusted extension
       │
       ▼
process / WASM / MCP boundary
       │
       ▼
trusted bridge ExtensionInstance
       │
       ▼
attenuated capability context
```

For client presentation:

```text
Extension Provider
       │
       ├── ActivityProjector
       ├── BlockRenderer
       ├── SurfaceProvider
       ├── NavigatorContribution
       ├── ComposerContribution
       └── InspectorContribution

all lifecycle-owned
all typed
none own Handbook/Substrate domain state merely by rendering it
```

This is where I think the DeepSeek work can have a **substantial positive influence on Collider without distorting Collider into DeepSeek Harness**.

The paper also explicitly discusses Rust procedural macros as one possible way a host language can provide typed dependency declarations and mediated access, reinforcing that the paradigm itself is not tied to TypeScript or JavaScript Proxy mechanics. fileciteturn0file0

My recommendation regarding the three documents is therefore:

**Do not throw them out and do not hold them hostage to a complete plugin design.** Their product ontology is still sound. But **before we mark them approved/frozen**, I would make one small revision pass that records the new extension-kernel research area and avoids wording that could accidentally preclude deterministic projection providers, capability-scoped extensions, or federated source histories.

The decision status I would record today is:

> **DeepSeek Harness: reference architecture, not fork target.**  
> **Cordis: high-value paradigm and possible implementation reference, not yet a committed dependency.**  
> **Spatiotemporal composability: adopt as a design objective for dynamic Collider extensions.**  
> **Conversation assembly + Slots: directly study for Activity Projection/Block and UI-extension architecture.**  
> **Session event sourcing: study for explicit Session Continuity, not adopt as Workspace-wide canonical history.**  
> **Workspace history architecture: remains open; DeepSeek strengthens the federated/projection alternative.**  
> **Untrusted plugins: must remain behind a genuine isolation boundary; Cordis-style contexts alone are insufficient.**

That is enough, in my view, to proceed with the Collider documents after one targeted update to the unresolved-architecture register rather than redesigning the glossary or Foundations around DeepSeek’s vocabulary.