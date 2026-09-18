# Collider AgentKit Owner-Boundary and Proof Specification

**Status:** Proposed non-normative proof contract; no implementation authorization  
**Purpose:** Define the evidence boundary and staged proof required before any AgentKit/Toolkit dependency, source-ownership, fork, sidecar, or native-controller adoption decision  
**Canonical dependencies:** [`../canonical/00-collider-v1-glossary.md`](../canonical/00-collider-v1-glossary.md), [`../canonical/01-collider-v1-foundations.md`](../canonical/01-collider-v1-foundations.md), [`../canonical/02-collider-v1-open-architecture-questions.md`](../canonical/02-collider-v1-open-architecture-questions.md)  
**Research basis:** [`../research/corrected-agent-native-evaluation.md`](../research/corrected-agent-native-evaluation.md)  
**Adjudication basis:** [`../adjudication/adjudication-result.md`](../adjudication/adjudication-result.md), [`../adjudication/adjudication-decision-coverage.md`](../adjudication/adjudication-decision-coverage.md), [`../adjudication/adjudication-check-record.md`](../adjudication/adjudication-check-record.md)  
**Implementation authorization:** None. This document defines proof requirements only.

## 1. Purpose and decision boundary

The corrected Agent Native research and subsequent adjudication justify a **preferred proof candidate**, not an adoption decision.

The first candidate to prove is:

> **Public AgentKit controller/protocol plus suitable AgentKit React regions, selective Toolkit, one owner-routed bridge, and Collider-defined Workstream/Control Plane/Lane behavior.**

The proof MUST preserve the possibility of:

- a headless-first AgentKit path;
- Toolkit with another single behavioral controller;
- selective source ownership/ejection;
- a bounded coherent frontend fork;
- a broader owner-preserving framework/fork where retained product behavior justifies it;
- a Collider-native implementation.

A failed public-package mapping MUST NOT automatically choose bespoke implementation. A successful fixture MUST NOT automatically choose AgentKit.

Only a separately authorized, passing **owner-integrated exact-path proof** plus applicable deployment/artifact/licensing evidence may support a later dependency or architecture decision.

## 2. Controlling authority model

This proof MUST preserve the current owner boundaries.

| Concern | Authority / role during proof |
|---|---|
| Handbook semantic state, Scope, Resolution, Contracts, Evidence, verdicts and gates | **Handbook** |
| Workspace policy, Lanes, execution environments, accepted work, execution lifecycle, Receipts, supervision, obligations, runtime context delivery | **Substrate** |
| Provider-runtime integration consumed by Substrate | **Unified Agent API through the actual Substrate-owned path** |
| Workstream presentation, Activity Projection, Blocks, Surfaces, placements, Navigator and Presentation Actions | **Collider** |
| Candidate live interaction/controller state | **AgentKit only as a derived client/projection role if proven truthful** |
| Candidate presentation/editor/grid behavior | **Toolkit only as presentation/interaction implementation if proven suitable** |

No proof result may transfer owner authority merely because a library stores client state, exposes a thread/run identifier, renders an approval, or provides a controller.

## 3. Non-equivalences required by the proof

The proof MUST keep these identities distinct unless a later explicit decision establishes a narrower mapping:

```text
AgentKit thread
    ≠ Collider Workstream by definition
    ≠ Lane
    ≠ provider Qualified Session
    ≠ Substrate durable orchestration/session authority

AgentKit run
    ≠ accepted Invocation receipt by definition
    ≠ owner operation by definition
    ≠ authoritative terminal record

AgentKit message list
    ≠ Handbook Resolution
    ≠ Substrate Context Pack
    ≠ model-context authority

AgentKit task/activity/widget
    ≠ Work Item
    ≠ Obligation
    ≠ canonical Source Record
    ≠ admitted Evidence

AgentKit sequence/checkpoint
    ≠ universal Workspace order
    ≠ owner cursor unless explicitly mapped
```

A mapping MAY associate these identities. It MUST NOT collapse them merely for adapter convenience.

## 4. Proof stages and evidence classes

Evidence MUST be reported in four separate stages.

| Stage | Required activity | May establish | MUST NOT be represented as |
|---|---|---|---|
| **A — Contract gate** | Identify supported owner entrypoints, call chain, versioned schema, policy/authority checks, field-by-field mappings and readiness | A testable proposed owner contract | Runtime acceptance or production proof |
| **B — Fixture/client proof** | Exercise the actual public AgentKit client/controller against controlled fixtures, plus substantial Toolkit UI | Candidate expressiveness, controller behavior, protocol/client sequencing | Real Receipts, real provider survival, real owner authorization or production replay |
| **C — Owner-integrated proof** | Repeat the same product scenarios through the supported owner boundary and real declared execution/mutation path | Exact-path owner behavior for the tested features | Untested providers/platforms or general production readiness |
| **D — Deployment/artifact/economics proof** | Inspect exact artifacts/notices/provenance and measure target desktop behavior/cost | Distribution inputs, target deployment behavior and measured option tradeoffs | Canonical adoption without a separate decision |

A fixture served through a real endpoint remains **fixture evidence**.

## 5. Gate A — supported owner-surface inventory

Before any result may be called owner-integrated, produce an `owner-surface-inventory.md` that identifies the exact supported path for every exercised operation.

For each operation record:

1. public/supported entrypoint;
2. implementation owner;
3. production call path used by the proof;
4. version or commit/release identity;
5. request schema and response/event schema;
6. policy, authentication and authorization checks;
7. durable identity created, if any;
8. observation/replay interface;
9. terminal or closeout authority;
10. cancellation semantics;
11. retry/idempotency semantics;
12. capability/readiness conditions;
13. current implementation/proof status;
14. unsupported or unavailable behavior.

At minimum inventory these feature families where the chosen proof exercises them:

- command/request submission;
- accepted-work reconciliation / Receipt identity;
- durable observation and replay;
- cancellation request and authoritative terminal effect;
- approval/interactive request lifecycle;
- capability discovery/readiness;
- Qualified Session continuation where used;
- non-chat owner-backed read and mutation;
- stale-revision handling/readback;
- connection/restart behavior.

### 5.1 Forbidden shortcuts

The owner-integrated proof MUST NOT treat any of the following as a supported owner API merely because it exists:

- crate-private Substrate modules or stores;
- hidden development helpers;
- direct UI ownership of UAA run handles or event streams;
- architecture ownership tables without a callable path;
- serialized Rust types without a supported cross-process contract;
- fixture endpoints that mimic owner behavior.

If a required owner capability is unavailable, report that feature **unavailable or unproved**. Do not create a candidate-shaped authority workaround.

### 5.2 UAA correspondence requirement

The proof MUST identify whether the exercised path uses:

- the exact UAA release consumed by Substrate;
- staging source behavior;
- another pinned build.

Do not claim staging/release equivalence without evidence.

## 6. Field-by-field identity and lifecycle map

Before Gate C, produce a machine-readable mapping ledger and human-readable table for the exercised scenario.

The map MUST include, where applicable:

| Proof concept | Required mapping question |
|---|---|
| User command / intent identity | What stable identity exists before owner acceptance? |
| AgentKit thread ID | What client/projection scope does it identify? |
| AgentKit run ID / protocol segment | What exact owner work or continuation segment does it reference? |
| Substrate Invocation identity | When and by whom is it accepted? |
| Accepted-work Receipt | What proves owner acceptance and exact correlation? |
| Owner operation/execution identity | What actually runs or remains queued? |
| Qualified Session identity | Which provider/runtime continuity resource, if any, is explicitly resumed? |
| Approval/request identity | Which exact owner request, revision, actor and work item may be answered? |
| Source observation cursor | How is source completeness/replay represented? |
| AgentKit sequence/checkpoint | How does it relate to owner cursor and projection sequence? |
| Activity Item identity | How is stable Business Identity derived and versioned? |
| Surface identity / placement | Which presentation identity is shared across inline/Sticky/Tab? |
| Capability status | What is declared, owner-supported, authorized, ready and observed? |

Unknown fields MUST remain unknown. Text equality, list position, client-generated IDs, or local timestamps MUST NOT fill an owner identity gap.

## 7. Lifecycle truth requirements

### 7.1 Submission and acceptance

The proof MUST distinguish:

```text
pending local intent
    → owner request transmitted
    → owner accepted work / Receipt
    → accepted-but-queued or otherwise admitted
    → actually running where separately observable
    → terminal owner outcome
```

An optimistic AgentKit message or generated AgentKit run ID MUST NOT be presented as owner acceptance.

If `startRun()` can only return after owner acceptance, prove that exact relationship. If it cannot, the selected controller/composition MUST represent pre-acceptance state without lying.

Lost acknowledgement MUST NOT cause implicit resubmission. Repeated identical prompts with different request identities MUST remain distinguishable.

### 7.2 View detachment

Closing a Tab, unmounting React, changing Workstreams, releasing an AgentKit lease, or terminating the Tauri window MUST NOT implicitly cancel owner work.

Substrate MUST retain ownership of provider/UAA execution resources beyond every UI lifetime used in the proof.

### 7.3 Cancellation

The proof MUST distinguish:

```text
cancel requested
    ≠ cancel request accepted
    ≠ operation actually cancelled
    ≠ operation completed before cancellation took effect
```

Because the inspected AgentKit client may mark a run cancelled after `cancelRun()` resolves, the selected mapping MUST ensure the controller cannot report cancellation before the correct owner terminal outcome is known—or explicitly own a bounded controller change that fixes that behavior.

A completion-versus-cancel race is mandatory.

### 7.4 Completion

`AgentRunHandle.completed`, subscription end, local completion timestamps, stream teardown, approval interruption, or view teardown MUST NOT be treated as authoritative owner completion.

The proof MUST identify the exact owner terminal source and map it to the UI.

### 7.5 Approval and interactive continuation

Every approval/interactive decision MUST bind to:

- exact owner request identity;
- relevant revision/version;
- exact owner work;
- current actor/authorization context;
- explicit approve/deny/other supported decision;
- current policy and capability state.

Test stale, expired, duplicate, conflicting, wrong-actor and wrong-work responses.

If AgentKit v2 uses distinct replacement protocol runs after terminal interrupts, map protocol segments to owner operations explicitly. Protocol segmentation MUST NOT create false canonical Invocations, Receipts or Qualified Sessions.

Inbox dismissal/read state remains unrelated to owner authorization.

### 7.6 Queue behavior

If AgentKit queue machinery is enabled, queue promotion MUST remain an authorized owner operation under current bindings and policy.

The frontend queue MUST NOT become an independent durable execution scheduler.

Unsupported queue semantics MUST be disabled rather than approximated.

### 7.7 Context reconstruction

AgentKit message arrays, transcript snapshots, or client thread state MAY be UI/projection inputs. They MUST NOT become the model-context authority.

The owner path MUST reconstruct current context from the applicable Handbook/Substrate sources, selected references, current Scope, Lane, policy, Capability Grants and explicit Qualified Session continuation.

### 7.8 Capability honesty

The proof MUST preserve distinctions among:

- unknown;
- unsupported;
- unavailable;
- degraded;
- available;
- authorized;
- ready.

Library feature presence alone does not establish owner support or authorization.

## 8. Projection, replay and coordinated-view requirements

### 8.1 One behavioral owner for the same work

The same accepted work may appear in:

- Control Plane;
- one or more Lane-filtered views;
- inline Blocks;
- Sticky placements;
- Tabs.

Those placements MUST NOT create independent command, queue, approval or optimistic-state owners for the same work.

This does not require one global controller or one global datastore for unrelated work.

### 8.2 Control Plane and Lane proof

The fixture and owner-integrated proofs MUST show one accepted work item coherently in both:

- Lane-unfiltered Control Plane projection;
- appropriate Lane-filtered projection.

The proof MUST preserve the possibility that the views share Source Records while having different Activity Item identity, ordering, visibility or location.

### 8.3 Sequence and filtering

If AgentKit requires contiguous per-run sequences, view filtering MUST occur after complete source admission, or an explicit projection-sequence remap MUST be defined.

Removing Lane-ineligible source events while retaining original sequence numbers MUST NOT manufacture a false gap.

The mapping MUST identify:

- owner source cursor;
- completeness boundary;
- projection sequence;
- projection version;
- snapshot/read cut;
- retention limits;
- gap detection and repair behavior.

### 8.4 Reconnect and restart

The proof MUST distinguish:

```text
resubscribe / replay same work
    ≠ retry original request
    ≠ new owner dispatch
```

Test view reopen, frontend restart where supported, and process restart where resumability is claimed. No implicit provider redispatch is permitted.

## 9. Gate B — actual-client fixture proof

The fixture proof MUST use the **actual public AgentKit client/controller**, not only an object shaped like `AgentTransport`.

Where relevant, run the upstream conformance factory/profiles and add Collider-specific cases. Inspected upstream tests are not preexisting passing evidence for this project.

### 9.1 Mandatory fixture cases

| Area | Mandatory demonstration |
|---|---|
| Acceptance | pending vs accepted/queued/running; lost acknowledgement; no implicit retry; identical prompt content with different IDs |
| Lifecycle | detach vs cancel; cancellation acknowledgement vs terminal effect; completion/cancel race; interruption/teardown vs `completed` promise |
| Approval | approve/deny; stale/expired/duplicate/conflicting/wrong-actor/wrong-work; exact continuation identities |
| Queue | explicit current owner authorization for promotion; unsupported capability disabled |
| Replay | duplicate, gap, reorder and replay; cursor/sequence mapping; snapshot cut; retention limits |
| Capabilities | unknown vs unsupported vs unavailable vs degraded vs available; owner support and authorization separate |
| Shared product experience | same work in Control Plane and Lane; inline/Sticky/Tab; one behavioral owner; unified Composer with distinct routing |
| Missing UI/provider | stale reference, missing renderer, provider unavailable and fallback behavior |
| Non-chat Surface | substantial Toolkit grid/editor/configuration interaction producing validated owner-operation intents rather than direct authority |

### 9.2 Fixture evidence limit

A passing fixture MAY establish:

- candidate expressiveness;
- controller sequencing under controlled stimuli;
- UI composition feasibility;
- whether public APIs are sufficient for the tested scenario.

It MUST NOT be represented as proof of:

- Substrate Receipt semantics;
- production authorization;
- provider survival;
- durable restart;
- real approval continuation;
- production replay;
- shipping security.

## 10. Gate C — owner-integrated proof

Repeat the same core scenarios through the supported owner boundary and real declared execution/mutation path.

Capture a traceable, non-secret join:

```text
user intent
  → owner request
  → owner acceptance / Receipt
  → exact owner work
  → source observations
  → projected events / Activity Items
  → authoritative terminal or approval records
```

The owner-integrated proof MUST demonstrate:

- view/window release does not cancel provider work;
- reopening does not dispatch duplicate work;
- explicit cancellation targets the exact work and handles completion races;
- replay/reconnect uses owner truth and does not implicitly retry;
- approval continuation validates current owner state and authorization;
- current capability/readiness state is represented truthfully;
- a substantial non-chat owner-backed read and authorized edit, including stale-revision rejection and readback;
- any advertised Qualified Session continuation revalidates current Scope/Lane/policy/capability/model conditions.

If the selected owner path does not support a feature, record it as **unsupported/unavailable/unproved**. Do not silently simulate it in the owner-integrated result.

## 11. Gate D — deployment, artifact, licensing and economics proof

Before a shipping/adoption decision, inspect the exact artifacts and distribution mode actually proposed.

### 11.1 Artifact and rights evidence

For dependency, source-copy/ejection and fork modes separately, record:

- exact package/source revision;
- registry tarball or distributed artifact hash where applicable;
- included license/notice files;
- source-to-artifact correspondence where required;
- retained copyright notices;
- provenance/publish metadata;
- applicable copying/ejection/fork rights and unresolved legal questions.

Package manifest license fields alone are insufficient to close this gate.

### 11.2 Desktop/security validation

Test the actual target stack:

- Vite build;
- Tauri/WebView on supported platforms selected for the proof;
- deliberate CSP rather than relying on the current null policy;
- IPC permissions;
- navigation/external URLs;
- Markdown/rich content;
- uploads/files;
- clipboard;
- keyboard/focus;
- accessibility;
- renderer failure containment;
- subscription/resource cleanup.

### 11.3 Measurements

Establish a Collider baseline **before** comparing options. Measure at least:

- production dependency graph;
- emitted JavaScript/CSS separately from installed dependency graph;
- cold WebView startup;
- steady-state and burst memory for the tested region;
- event-burst update behavior;
- populated-history replay/reconnect behavior;
- cleanup/leak behavior;
- source divergence and local patch surface;
- expected upgrade/security-backport workflow.

Do not invent target numbers before baselines exist.

### 11.4 Cost attribution

Charge common work to every applicable strategy, including:

- Next-to-Vite transition;
- required supported Substrate frontend boundary;
- settled Collider shell semantics.

Charge candidate-specific work only where introduced, including:

- AgentKit protocol translation;
- library-only sidecar;
- private-API workaround;
- fork/source divergence;
- candidate-specific upgrade and security backport burden.

## 12. Stop, reversal and alternative-selection rules

### 12.1 Hard semantic stops for a selected mapping

Reject or stop the **selected mapping/design** when it requires:

- a second durable execution owner;
- UI/subscriber lifetime to own execution lifetime;
- false accepted-work or terminal reporting;
- a forced Session-centric Workstream semantic change;
- bypass of Substrate/Handbook authority, policy or authorization;
- forbidden privilege expansion to make the library work.

These findings do not automatically reject every other AgentKit/Toolkit/fork/native variant.

### 12.2 Public-dependency stop / fork assessment

If core scenarios require unsupported/private APIs, stop the unsupported public-dependency route and compare:

- bounded source ownership;
- headless-only reuse;
- presentation-only reuse;
- bounded coherent fork;
- native alternative.

### 12.3 Economic gates

A Node sidecar, sizable frontend fork, or pinned local source tree is an economic/deployment gate rather than an automatic architectural veto unless it also violates authority or security constraints.

Select only after comparing retained behavior against packaging, startup, memory, patch, backport, update and eventual replacement costs.

### 12.4 Distribution hold

If adequate rights/notices/provenance cannot be established for the selected adoption mode, hold distribution of that mode. Do not infer either permission or prohibition solely from repository/package metadata.

## 13. Required proof outputs

A separately authorized proof packet SHOULD return these artifacts:

1. `owner-surface-inventory.md` — supported owner entrypoints and readiness;
2. `identity-lifecycle-map.md` — field-by-field human-readable mapping;
3. `identity-lifecycle-map.json` — machine-readable mappings and unresolved fields;
4. `fixture-client-proof-results.md` — actual-client fixture results with exact versions;
5. `owner-integrated-proof-results.md` — exact owner path, traces and unsupported features;
6. `deployment-artifact-economics-results.md` — artifacts, notices, desktop/security/performance and option costs;
7. `proof-evidence-ledger.json` — hashes, pins, commands/tests actually executed, source refs and result classification;
8. `adoption-decision-input.md` — evidence-backed comparison of public composition, headless/presentation variants, source ownership/fork and native alternative.

Every result MUST state whether it is:

- inspected source/contract evidence;
- fixture evidence;
- owner-integrated evidence;
- deployment/artifact evidence;
- inference/recommendation.

## 14. Document implications

This proof specification does not amend the glossary or Foundations.

The updated open register keeps `C-OQ-027` Open and records the shortlist and evidence gates. Related open questions remain unresolved unless a later decision explicitly closes them.

Stable Workspace Shell behavior may continue to be drafted without selecting AgentKit or another framework. Execution and Binding must consume real owner contracts and the owner inventory rather than invent candidate-shaped semantics.

## 15. Final proof decision boundary

A passing proof does not itself adopt AgentKit, Toolkit, a fork, sidecar, or native alternative.

After the staged evidence exists, a separate decision must select one strategy or explicitly preserve more than one path. Only that decision may authorize dependency/fork adoption and any necessary coordinated canonical amendments.
