# Collider Agent Native — new adjudication check record

This is a **new record of this bounded adjudication**, not the missing original machine-readable research ledger and not a reconstruction of it. It does not inherit that ledger's checksum or evidentiary status. No canonical document, dependency, integration, or source repository was modified. Only archive/integrity verification was executed; candidate tests, builds, installs, conformance, performance measurements, and real-agent evaluations were not run.

## 1. Input integrity and linkage

The current user instruction controls this task. Bundled START-HERE.md and RESEARCH-PROMPT.md were read as frozen context, not as renewed investigation or implementation authorization.

- ZIP filename: `collider-agent-native-research-bundle(1).zip`; 159254 bytes.
- ZIP SHA-256: `839a95c409eea9f54a9aace4d295224ecad88778a45f07deea1ee713b07abf53`.
- ZIP SHA-512: `1338cc57ccd08fd9fc82351aae0ce04cbec60f3854a0708e0fe48bb9e7aa54b7d8324557dba35453482456b94407a802346b2f601f4eb720f5878c452b44e238`.
- Both archive hashes match the corrected report's stated values.
- ZIP CRC/structure: PASS. Member paths: no absolute/traversal/duplicate paths or symlinks found.
- Extracted files were compared byte-for-byte with their ZIP entries at closeout: PASS.
- Bundled verifier: PASS. 12 payload files, 14 bundle files, 9 Markdown files, 27 Open questions, 57 invariant markers, no broken relative links.
- All 13 SHA256SUMS entries matched.
- Attached corrected report SHA-256, computed in this adjudication: `2e23d0d698e5023483292828648dbfda7a08d408f88b5cc06de8bf6697f180f8` (57077 bytes).
- The ZIP's `inputs/research-source-ledger.json` identifies `get-bb/bb` at `41e7132e817306e43f68f91bde0a6b9f79af99de`. It is BB comparison evidence, not the corrected Agent Native ledger.
- The corrected report's original machine-readable ledger is unavailable. Its purported digest was **not verified**. The report's old tool citations and sandbox links are not independently available provenance.

The integrity result establishes correspondence of the supplied baseline, not correctness of historical research, source implementation, current deployment, or package releases.

### Executed verifier output

```json
{
  "status": "PASS",
  "bundle_id": "collider-agent-native-research-2026-09-16",
  "payload_files_checked": 12,
  "total_bundle_files": 14,
  "markdown_files_checked": 9,
  "open_questions": 27,
  "foundation_invariants": 57,
  "broken_relative_links": [],
  "errors": [],
  "external_repository_access_tested": false,
  "note": "Integrity, completeness markers, and local links checked; not a source-code/build or historical-citation validation."
}
```

### Executed checksum output

```text
INPUTS.md: OK
MANIFEST.json: OK
REPOSITORIES.json: OK
RESEARCH-PROMPT.md: OK
START-HERE.md: OK
VERIFY-BUNDLE.py: OK
inputs/00-collider-v1-glossary.md: OK
inputs/01-collider-v1-foundations.md: OK
inputs/02-collider-v1-open-architecture-questions.md: OK
inputs/agent-native-original-evaluation.md: OK
inputs/bb-deepseek-collider-architecture-report.md: OK
inputs/deep-seek-harness-deep-research-report.md: OK
inputs/research-source-ledger.json: OK
```

## 2. Pinned rechecks

The following are **report-pinned** revisions, not newly selected current branch heads. Exact-ref GitHub reads were performed. Object IDs are the connector-returned Git blob IDs. They are not SHA-256 hashes and were not independently recomputed over downloaded remote bytes.

| Repository | Exact revision |
|---|---|
| `atomize-hq/substrate` | `92e87a0092b091f2cef5cf8ccfdc1431e7895b8f` |
| `atomize-hq/unified-agent-api` | `117995663435eaae89c952563c250045c6aade95` |
| `atomize-hq/collider` | `36ed748eaf613316339fd2d518906a40093294ef` |
| `BuilderIO/agent-native` | `c884b5cbe616fe8674586d23c7345d9661de81f5` |

**Source** means implementation text inspected, not behavior executed. **Contract/Documentation** means the source states a rule, not that the production path satisfies it. **Manifest/Config** means the declaration was read, not that a release artifact or build realizes it. The recommendation remains architectural inference; integration and deployment claims remain untested.

| ID | Pinned source and inspected range | Returned blob ID | Evidence class | Decision-relevant observation |
|---|---|---|---|---|
| S01 | [llm-last-mile/runtime-refactor/architecture/authority-map.md](https://github.com/atomize-hq/substrate/blob/92e87a0092b091f2cef5cf8ccfdc1431e7895b8f/llm-last-mile/runtime-refactor/architecture/authority-map.md); full | `36f60cbe707668af15f8ef32dacc87519bb4fda3` | Contract | Receipt after runtime acknowledgement; supervisor durable observation/closeout; surface nonownership. Document explicitly grants no implementation authority. |
| S02 | [crates/shell/src/lib.rs](https://github.com/atomize-hq/substrate/blob/92e87a0092b091f2cef5cf8ccfdc1431e7895b8f/crates/shell/src/lib.rs); full | `0f519439d67332044059d7f2f72df9c08dc3d75a` | Source | Public shell/CLI and selected lifecycle exports. Does not establish complete GUI agent-control facade. |
| S03 | [crates/shell/src/execution/mod.rs](https://github.com/atomize-hq/substrate/blob/92e87a0092b091f2cef5cf8ccfdc1431e7895b8f/crates/shell/src/execution/mod.rs); 1–240 | `b863bc5eac8741951719d11f953a1efce32affe8` | Source | Agent runtime and orchestration modules are pub(crate); public dev support is doc(hidden). |
| S04 | [crates/shell/src/execution/agent_runtime/mod.rs](https://github.com/atomize-hq/substrate/blob/92e87a0092b091f2cef5cf8ccfdc1431e7895b8f/crates/shell/src/execution/agent_runtime/mod.rs); full | `1a7bf008a4ec63089b8bf76af57c1c314c083033` | Source | Runtime authority/control/supervisor exports are crate-private. |
| S05 | [crates/shell/src/execution/agent_runtime/control.rs](https://github.com/atomize-hq/substrate/blob/92e87a0092b091f2cef5cf8ccfdc1431e7895b8f/crates/shell/src/execution/agent_runtime/control.rs); 1–220 | `d553f9aeb8c9e80df223d354da9910445d2b2aa5` | Source | Episode state and private helper channels; process/transport observations are not durable lifecycle truth. |
| S06 | [crates/shell/Cargo.toml](https://github.com/atomize-hq/substrate/blob/92e87a0092b091f2cef5cf8ccfdc1431e7895b8f/crates/shell/Cargo.toml); full | `bb31edcaffdfc1630a638828a5b89a9703ed8b6c` | Manifest | Exact UAA =0.3.7; codex/claude_code; Rust 1.89. Not released-byte/staging equivalence. |
| S07 | [docs/specs/unified-agent-api/run-protocol-spec.md](https://github.com/atomize-hq/unified-agent-api/blob/117995663435eaae89c952563c250045c6aade95/docs/specs/unified-agent-api/run-protocol-spec.md); full | `e17a7aa9992c8031b0d80425c13152e531bfd094` | Contract | Drop best-effort cancellation; explicit control and completion/finality ordering; no cross-run order. |
| S08 | [docs/specs/unified-agent-api/contract.md](https://github.com/atomize-hq/unified-agent-api/blob/117995663435eaae89c952563c250045c6aade95/docs/specs/unified-agent-api/contract.md); 1–160 | `43471136c7a81ffd8b6675a6f558c29f59a88580` | Contract | Rust public API; serde-friendly does not establish serialized cross-language protocol. |
| S09 | [src-tauri/src/lib.rs](https://github.com/atomize-hq/collider/blob/36ed748eaf613316339fd2d518906a40093294ef/src-tauri/src/lib.rs); full | `69f4491c2f250a466095ed325dcb342f63e38ebd` | Source | Tauri builder and debug logging; no application invoke-handler in inspected entrypoint. |
| S10 | [src-tauri/tauri.conf.json](https://github.com/atomize-hq/collider/blob/36ed748eaf613316339fd2d518906a40093294ef/src-tauri/tauri.conf.json); full | `640295e9a48878615610e5194eac417e4c139c89` | Config | csp null at frozen pin. No deployment/security validation. |
| S11 | [packages/agentkit/ARCHITECTURE.md](https://github.com/BuilderIO/agent-native/blob/c884b5cbe616fe8674586d23c7345d9661de81f5/packages/agentkit/ARCHITECTURE.md); full | `5362635afa95a3acd8318071d80cecbe35e9c7fd` | Contract | Alternative backend; one controller; subscriber-local abort; references not grants; v2 distinct replacement run; durable replay claims require restart survival. |
| S12 | [packages/agentkit/src/protocol/index.ts](https://github.com/BuilderIO/agent-native/blob/c884b5cbe616fe8674586d23c7345d9661de81f5/packages/agentkit/src/protocol/index.ts); 1–180; 525–785; 850–1240 | `662371524908328942b09a6b43d88380718bba6c` | Source/API | IDs and reference metadata, capabilities, request abort, snapshots/checkpoints, transport and continuation operations. |
| S13 | [packages/agentkit/src/client/client.ts](https://github.com/BuilderIO/agent-native/blob/c884b5cbe616fe8674586d23c7345d9661de81f5/packages/agentkit/src/client/client.ts); 1–300; 560–970; 1070–1750; 1950–end | `27a12ed847e809725132d3f1ffaa3d2553efe6b2` | Source | Actual start/cancel/consume lifecycle, message-history input, content fallback, leases, replay, automatic queue promotion. |
| S14 | [packages/agentkit/src/client/state.ts](https://github.com/BuilderIO/agent-native/blob/c884b5cbe616fe8674586d23c7345d9661de81f5/packages/agentkit/src/client/state.ts); 1–290 | `2e8d3043e46d73a7db561096b915a8740a53eed0` | Source | Per-thread/per-run state and sequence-gap rejection before cursor advancement. |
| S15 | [packages/agentkit/src/conformance/index.ts](https://github.com/BuilderIO/agent-native/blob/c884b5cbe616fe8674586d23c7345d9661de81f5/packages/agentkit/src/conformance/index.ts); 1–220; 650–1000; 1110–end | `3c2e86fb5fed94e4fcf160f7d237113b42ca19d5` | Inspected test source | Baseline/full profiles; transport scenarios; same-run compatibility branch; no executed acceptance evidence. |
| S16 | [packages/agentkit/package.json](https://github.com/BuilderIO/agent-native/blob/c884b5cbe616fe8674586d23c7345d9661de81f5/packages/agentkit/package.json); full | `ae2b7ac36faf4f5f488a1e1e33989c095cacec87` | Manifest | 0.2.3, MIT field, subpaths; package dependencies include Toolkit, AG-UI and React presentation dependencies. |
| S17 | [packages/toolkit/README.md](https://github.com/BuilderIO/agent-native/blob/c884b5cbe616fe8674586d23c7345d9661de81f5/packages/toolkit/README.md); full | `8c63ab3eb17971f0fe4e0f96042499267f425a8a` | Documentation | Core-free controlled presentation; substantial DataGrid/dashboard; public composition and source ownership documented. |
| S18 | [packages/toolkit/package.json](https://github.com/BuilderIO/agent-native/blob/c884b5cbe616fe8674586d23c7345d9661de81f5/packages/toolkit/package.json); 1–280 | `c87786dac673b84c7678469fb730abd8129cfc0e` | Manifest | 0.20.3, MIT field, granular browser exports, source/ejection manifest included in declared files. |
| S19 | [packages/toolkit/agent-native.eject.json](https://github.com/BuilderIO/agent-native/blob/c884b5cbe616fe8674586d23c7345d9661de81f5/packages/toolkit/agent-native.eject.json); 1–120 | `8a5dd1a41f31693876ecaef3f0de59928f954c84` | Manifest | Source-copy units root/app-shell/clipboard, root dependency list. Ejection execution and full manifest not audited. |
| S20 | [package.json](https://github.com/BuilderIO/agent-native/blob/c884b5cbe616fe8674586d23c7345d9661de81f5/package.json); 1–160 | `8dce99221794263bf924605951d01dbc588b0e09` | Manifest | Private root license field ISC; source-package metadata alone not distribution rights determination. |

The returned prefixes for S01, S06–S12 (where those files occur in the report table), S15, S17, S19, and S20 agree with the corresponding abbreviated blob IDs in the report. This re-establishes selected source links. It does not restore or validate the missing ledger's full contents.

A further read of Substrate's `llm-last-mile/runtime-refactor/00-README.md` found its explicit distinction between source/types and a landed production path, and a non-authoritative scheduling projection mentioning incomplete E3-E/undispatched E3-F. This adjudication did not follow every canonical task/status owner, audit those runtime slices, or certify any production gateway path. Those status projections are not deployment evidence.

## 3. Material qualifications and unresolved claims

1. **Frontend facade:** inspected Substrate runtime/control/supervisor modules are crate-private, and Collider's inspected Tauri entrypoint has no application invoke-handler. This does not prove there is no useful public CLI or other surface elsewhere. It does mean a complete, supported GUI observe/replay/cancel/approve facade has not been established by these reads. Its exact supported call chain remains an owner contract/readiness gate.
2. **Cancellation:** AgentKit client cancellation awaits transport cancellation and then marks locally nonterminal work cancelled, assigns a local completion time, and stops its reader. A transport that returns on mere cancellation-request acceptance is not sufficient. Owner completion/cancel races and terminal observation order must be proven, or the single behavioral controller must be adapted explicitly.
3. **Completion promise:** the client handle's `completed` promise follows subscription-consumption completion. That code also returns for intentional consumer stop and approval/input interruption, and for failed/cancelled terminal events. Promise settlement is not success or authoritative execution termination.
4. **Start semantics:** `sendMessage` creates an optimistic complete user message, passes the entire current transcript plus that message to `startRun`, and marks the returned run running. Those are not Substrate receipt, queued/running, or context-resolution semantics. Exact accepted-work correlation and loss-of-acknowledgement reconciliation are required.
5. **Approval ambiguity:** AgentKit architecture specifies a distinct replacement protocol run for v2 terminal interrupts. Its client and conformance helper retain same-run continuation branches. Passing that helper would not independently settle the intended v2 wire/lifecycle contract. Protocol-run segments must not create false owner Invocations or terminal receipts.
6. **Queue and identity:** the client can automatically promote queued messages after completion and contains content-based fallback reconciliation. Neither behavior can be credited as owner authorization, a durable orchestration scheduler, idempotency, or exact receipt association.
7. **Projection model:** the canonical Workstream is not necessarily an AgentKit thread. Shared CP/Lane infrastructure does not close whether Activity Item identities are shared; source histories and assembler topology remain open. Filter after sequence admission; do not erase events and pretend the remaining original per-run sequence is contiguous.
8. **Artifacts:** package-source versions and exports are verified declarations. Actual npm tarball bytes, bundled notices, registry release provenance, source-to-artifact equivalence, and production transitive graph were not established. A targeted exact-version registry/web retrieval did not supply the needed artifact evidence. Do not substitute unrelated AgentKit packages.
9. **Licensing:** MIT package fields and ISC private-root field are observed. Applicable grant/notice coverage for dependency, copying/ejection, or broad fork remains unresolved. No legal incompatibility or prohibition is inferred just from those two labels. Root LICENSE/NOTICE coverage and publish artifacts were not established in this adjudication.
10. **UAA version correspondence:** Substrate's manifest consumes =0.3.7, while the source contracts were read at the report's staging pin. These reads do not establish byte-for-byte equivalence with the consumed release or prove its production runtime behavior.
11. **Historical provenance:** REPOSITORIES.json separately records Agent Native historical inspection anchor `02608a482f053f00c7e1fdb78738c28a60c59143` and original-report pin `92e6aec8b26b68e870384009af2a4d40cc68e41d`. The original report states the latter. The corrected report's comparison against the former does not by itself establish what was introduced since the original report. No temporal novelty conclusion is needed to shortlist the rechecked current-pinned interfaces.
12. **Platform and economics:** no Vite/Tauri/WebView build, CSP exercise, startup/memory/bundle measurement, accessibility evaluation, upstream-merge cost measurement, or owner-integrated acceptance run was executed. Medium/high effort ratings are hypotheses, not measured findings.

## 4. Frozen canonical anchors

The excerpts below are exact, line-numbered reads of the verified extraction. They are included for provenance, not as proposed replacement text. The canonical files remain byte-identical to the ZIP.

### inputs/01-collider-v1-foundations.md, lines 72–106

```text
72: ## 3. System Authority Boundaries
73: 
74: Collider depends on a strict separation among semantic authority, execution authority, and presentation authority.
75: 
76: | System        | Primary authority                                                                                                                                                                                                                                 |
77: | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
78: | **Handbook**  | Canonical semantic artifacts, artifact kinds and schemas, Scope, Resolution, Projection, contracts, admitted Evidence, verdicts, gates, and owner-approved semantic mutation paths                                                                |
79: | **Substrate** | Workspace identity and policy, Lanes and execution environments, agents and processes, tools, accepted Invocations, execution lifecycle, runtime telemetry and Receipts, and runtime context assembly and delivery                                |
80: | **Collider**  | Human interaction, Presentation Actions, Workspace navigation, Control Plane presentation, Workstream and Activity Projection behavior, Activity Items, Blocks, Surfaces, Surface Placements, Sticky Placements, Tabs, and optional inspection UX |
81: 
82: ### 3.1 No competing authority
83: 
84: Collider MUST NOT become a second source of truth for Handbook or Substrate state.
85: 
86: Specifically:
87: 
88: - rendering a Handbook Artifact does not make Collider its semantic owner;
89: - displaying execution activity does not make a React component, Tab, or Surface its lifecycle owner;
90: - caching state does not grant authority to mutate that state independently;
91: - a backing file is not automatically the canonical user-facing meaning of a Handbook Artifact;
92: - a Workstream transcript is not the canonical source of Workspace semantics or execution truth.
93: 
94: Collider MAY initiate actions and mutations, but owner-system state changes MUST pass through the appropriate Handbook or Substrate boundary.
95: 
96: ### 3.2 Process topology does not redefine authority
97: 
98: Handbook may be integrated into Substrate through a process bridge, a direct Rust boundary, or another implementation topology. That physical arrangement MUST NOT blur the logical authority boundary.
99: 
100: Substrate consumes Handbook semantics. Collider consumes and presents both systems. Neither integration strategy authorizes duplicate interpretation of Handbook meaning inside Substrate or Collider.
101: 
102: ### 3.3 Reference architectures and extension neutrality
103: 
104: Collider MAY learn from and selectively emulate external reference architectures. External influence does not change Handbook, Substrate, or Collider authority, automatically import source terminology, schemas, APIs, lifecycle models, or package topology, or select a product dependency. Any adopted result must be stated in Collider's own canonical language and reconciled with existing owner-system boundaries.
105: 
106: Collider's protocol-neutral Surface and extension direction permits multiple implementation strategies. It does not commit Collider to MCP, Cordis, or any single extension or composition framework. The fact that higher-level capabilities may be extensible also does not require the core responsibilities of Handbook, Substrate, or Collider to become dynamically loaded plugins.
```

### inputs/01-collider-v1-foundations.md, lines 209–246

```text
209: The foundational rule is:
210: 
211: > **Persist or durably reference meaning and execution history; reconstruct the useful view.**
212: 
213: Collider MUST NOT assume that all durable activity is copied into one Collider-owned or Substrate-owned Workspace event store. Handbook, Substrate, MCP Apps, shell or PTY facilities, and Collider may each retain authoritative records appropriate to their domains.
214: 
215: Collider MAY create projection metadata, indexes, stable references, summaries, or caches needed to provide a coherent Workstream experience, but those mechanisms MUST NOT silently become competing semantic or execution authority.
216: 
217: The exact history architecture remains unresolved. Candidate shapes include:
218: 
219: - one canonical Workspace history;
220: - federated source histories plus a Workspace activity index;
221: - query-time federation;
222: - a hybrid of references, selected snapshots, and materialized projection items.
223: 
224: This document freezes the UX and ownership requirement, not the storage choice:
225: 
226: > **A durable or reconstructable Block must be traceable to sufficient Source Records, durable references, or owner-system objects to explain or reconstruct it, but the relationship need not be one Block to one event or one shared store.**
227: 
228: Closing a Tab or removing a Sticky Placement MUST NOT implicitly delete, retire, archive, stop, or mutate the underlying owner-system state.
229: 
230: Collider SHOULD be capable of reconstructing a current useful Surface from stable identities, owner-system records or references, Activity Projection metadata, and durable presentation references rather than requiring an old in-memory component tree to remain alive.
231: 
232: ### 5.1 Projection assembly and stable activity identity
233: 
234: Host-recognized Projection Definitions SHOULD transform eligible Source Records or references into stable Activity Items for a target Activity Projection. A Projection Definition may be built in or dynamically registered; the registration mechanism remains open. Workstream renderers SHOULD consume final Activity Items or bounded Surface models rather than repeatedly scan raw heterogeneous source collections.
235: 
236: Each Activity Item MUST have stable Business Identity independent of visual list position, page boundaries, arrival order, and renderer implementation. That identity may be supplied by an authoritative owner system or deterministically derived by the applicable Projection Definition from stable source fields. Intentionally ephemeral visual output may render as a Block without becoming an Activity Item. One Activity Item MAY correlate or fold several Source Records or revisions while retaining inspectable source references and projection-definition provenance.
237: 
238: An Activity Projection MUST provide deterministic presentation order sufficient for rendering and navigation for a given projection state and Projection Definition version. That presentation order does not imply that the underlying Source Records possess one authoritative total order; source causality may remain partial, concurrent, late-arriving, or owner-specific.
239: 
240: An Activity Assembler MAY own projection-specific fold state and Projection Indexes needed for efficient correlation, predecessor or ordering lookup, and incremental maintenance. That machinery MUST NOT become semantic, execution, or Source Record authority.
241: 
242: Projection assembly SHOULD be deterministic and replayable to the extent permitted by the participating source systems. Incremental append and older-history loading SHOULD update only affected projected objects and preserve unaffected Business Identity and fold state where possible. Pagination and replay are ordinary explicit operations; gap repair, projection invalidation, and full resynchronization SHOULD be explicit exceptional paths rather than hidden renderer behavior.
243: 
244: Different Workstream views MAY assemble or locate the same Source Records differently. Control Plane and Lane projections may share Source Record identity while producing view-specific Activity Items, ordering, visibility, or location. Whether they also share Activity Item identity remains open.
245: 
246: This projection architecture strengthens both federated and indexed history options but does not select one canonical Workspace event store, assembler process, database, language, or persistence topology.
```

### inputs/01-collider-v1-foundations.md, lines 276–323

```text
276: ### 6.2 Shared Control Plane and Lane infrastructure
277: 
278: The Control Plane and Lane views SHOULD use the same core:
279: 
280: - Workstream Surface;
281: - Activity Projection pipeline;
282: - Block renderer;
283: - Surface host;
284: - Composer;
285: - selection and branching primitives;
286: - Sticky Stack behavior;
287: - Tab Promotion behavior.
288: 
289: Their primary difference is projection and binding posture:
290: 
291: ```text
292: Control Plane
293:   Lane filter: none
294:   Default Lane: none unless explicitly established
295: 
296: Lane view
297:   Lane filter: selected Lane
298:   Default Lane: selected Lane
299: ```
300: 
301: This filtering may remain an internal implementation detail. The user does not need to manipulate raw filter expressions.
302: 
303: `Lane filter: none` means lane-unfiltered, not “display all raw internal telemetry.” The projection may still collapse, summarize, or progressively disclose low-level tool, provider, or internal execution detail.
304: 
305: Control Plane and Lane projections MAY reuse Source Records and Projection Definitions while producing view-specific Activity Items, ordering, visibility, or projected locations. Exact Activity Item identity sharing across those views remains an open decision.
306: 
307: ### 6.3 Unified Composer
308: 
309: The active Workstream SHOULD provide a unified Composer capable of accepting:
310: 
311: - raw shell input;
312: - Collider or Substrate commands;
313: - Handbook-oriented requests;
314: - natural-language agent instructions;
315: - structured actions from an existing Surface.
316: 
317: A user SHOULD NOT need to switch between separate terminal and chat applications merely because one Invocation is shell-shaped and the next is natural language.
318: 
319: The routing and execution semantics of different input dialects remain distinct even when they share one Composer.
320: 
321: ### 6.4 Terminal capability without terminal confinement
322: 
323: Collider MAY provide Terminal Surfaces and raw PTY behavior, but the Control Plane and Workstream MUST NOT be architecturally reduced to a single PTY or shell process.
```

### inputs/01-collider-v1-foundations.md, lines 574–652

```text
574: ## 10. Background Execution and Ambient Awareness
575: 
576: Collider is designed for execution that may continue while its associated Surface or Tab is not visible.
577: 
578: This requires two separate guarantees.
579: 
580: ### 10.1 Presentation-independent lifetime
581: 
582: No Collider component may implicitly own the lifetime of Substrate execution merely because it displays that execution.
583: 
584: Unmounting a component, closing a Tab, switching Workstreams, or closing a lane-related Surface MUST NOT implicitly stop background work.
585: 
586: Stop or cancel behavior MUST be an explicit action routed through Substrate.
587: 
588: ### 10.2 Persistent awareness
589: 
590: Because background work can outlive visible Surfaces, Collider V1 MUST provide minimum persistent awareness of ongoing execution and execution that requires user attention. A concrete implementation MAY distinguish states such as active, queued, blocked, failed, or completed; the detailed status vocabulary is not frozen here.
591: 
592: The first version does not require a full execution debugger. It does require:
593: 
594: - a lightweight Workspace-wide activity indicator;
595: - discoverable Lane-level activity state where applicable;
596: - a path to open a richer execution-status Surface;
597: - a clear explicit stop/cancel action for user-controllable work;
598: - the ability to reconnect a Surface to ongoing or completed execution state.
599: 
600: Internal execution detail SHOULD be progressively disclosed beneath user-meaningful activity rather than flooding the top-level UI. The exact execution hierarchy and vocabulary remain provisional.
601: 
602: Navigator customization MUST NOT remove all awareness of active or attention-requiring execution or all access to cancellation and recovery. No particular navigator row must be permanently locked merely to satisfy this rule; a persistent indicator and another discoverable route may provide access.
603: 
604: Inbox read or dismissal state MUST NOT be treated as approval, Gate satisfaction, unblocking, cancellation, or resolution of an owner-system obligation. An action that changes authoritative acknowledgment or work state must use the relevant owner-system boundary rather than masquerade as a local Presentation Action.
605: 
606: ## 11. Context and Continuity Model
607: 
608: Collider SHOULD be described as **resolution-reconstructed** or **session-independent by default**, not stateless.
609: 
610: The system is highly stateful. Its durable state exists in Handbook, Substrate, source systems, Workstream projection metadata, repositories, execution records, and Collider presentation preferences. What Collider avoids is making one long chat transcript the sole memory and authority for future work.
611: 
612: ### 11.1 Per-Invocation reconstruction
613: 
614: Each meaningful Invocation SHOULD be resolved and assembled against its current:
615: 
616: - Workspace;
617: - Scope and Resolution Posture;
618: - Work Item or target concern;
619: - Lane and repository state where applicable;
620: - current owner-system state;
621: - purpose and requested action.
622: 
623: A later Invocation may receive a newly reconstructed Context Pack rather than inheriting an unbounded transcript.
624: 
625: ### 11.2 Transcript and projection as history, not sole memory
626: 
627: A Workstream preserves or reconstructs useful interaction and activity continuity, but its visible Activity Projection is not automatically injected wholesale into future model context.
628: 
629: Prior interaction may be:
630: 
631: - selected through Handbook Resolution;
632: - distilled into durable Artifacts, decisions, Work Items, or state;
633: - referenced through Context Records, Source Records, execution records, or Receipts;
634: - omitted when irrelevant to the current Invocation.
635: 
636: This enables continuity without requiring conventional chat-session organization or one canonical Workspace event log.
637: 
638: ### 11.3 Explicit Qualified Session Continuity
639: 
640: Collider's default behavior SHOULD remain resolution-reconstructed. Each Invocation may receive newly resolved and assembled context appropriate to its current purpose even when it occurs in the same Workstream as a prior Invocation.
641: 
642: The architecture MUST nevertheless preserve room for an explicit request to bind to, resume, reuse, or continue a Qualified Session owned by a model provider, runtime, shell, PTY, or agent harness. Continuation MUST be intentional and visible; remaining in the same Workstream, Lane view, Tab, or adjacent message sequence MUST NOT silently continue a Qualified Session.
643: 
644: A Qualified Session is not a Workstream. One Workstream may project activity associated with zero, one, or several Qualified Sessions over time, and one Qualified Session's activity may appear in several Workstream projections where policy permits. A dedicated **Sessions** destination MUST be available when the Session Continuity capability is delivered. Its Surface may present another Activity Projection without replacing Workspace or Workstream identity.
645: 
646: Collider's default organization MUST NOT be Session-centric, but users MAY choose prominent or primarily Session-oriented navigation in their own Navigator Layout, including an ungrouped Sessions item. That user preference does not change the resolution-reconstructed default. Opening, regrouping, or highlighting the Sessions destination MUST NOT itself imply continuation. Actual Session entries MUST identify their provider or runtime, and continuation remains intentional and visible.
647: 
648: Session History may provide Source Records for Activity Projection and may support owner-scoped continuity, reconstruction, pagination, or resume. It is not the Workspace's canonical history and does not settle whether Workspace activity uses one history, federation, an index, query-time composition, or a hybrid.
649: 
650: Resuming a Qualified Session may preserve only the provider- or runtime-owned state that the Qualified Session explicitly promises. Before a new Invocation uses that continuity, current Handbook Scope or Resolution, Lane binding, Substrate policy, Capability Grants, permissions, and provider/model compatibility MUST be revalidated where applicable; stale values MUST NOT be silently inherited merely because a Qualified Session resumes.
651: 
652: A future capability may support one-Invocation continuation, a persistent session-oriented continuity mode, and an explicit return to resolution-reconstructed behavior. The exact commands, UI state, resume handles, provider guarantees, expiry, recovery, disconnection behavior, branching, lifecycle, and V1 delivery timing remain open.
```

### inputs/02-collider-v1-open-architecture-questions.md, lines 58–84

```text
58: ### 1.1 Research intake — BB and frontend-foundation evaluation (2026-09-16)
59: 
60: This intake extends research scope only. It does not adopt a dependency, revise the glossary or Foundations, select a Workspace-history architecture, or authorize an implementation spike. The preceding baseline and existing question decisions remain controlling within their stated authority.
61: 
62: **Evaluation constraints supplied by the product owner:** the target frontend is Tauri + React + TypeScript + Vite. Substrate, Handbook, and the Unified Agent API are the existing operational and semantic foundation to inspect, not missing infrastructure to recreate for a library. Existing AI Elements components are provisional and may be discarded entirely; their earlier use to refine ds-skills has already delivered value. Do not treat preservation of those components, their APIs, or their past curation cost as a decision criterion. Evaluate useful tooling and all remaining integration work prospectively.
63: 
64: A reusable framework or controller may implement an accepted Collider frontend role. Do not require a second custom controller, projection store, queue, or approval owner solely because the role has a Collider name. Equally, do not silently replace owner-system authority to accommodate a vendor. Any proposed semantic amendment requires separate adjudication.
65: 
66: ### 1.2 Research sources and evidence status
67: 
68: The following exact Library names identify supporting inputs. Names identify documents, not new canonical terms. Existing research is non-normative; source inspection, documentation claims, upstream-reported tests, and locally executed validation must remain distinguishable. Retrieve the named inputs in the evaluation session rather than assume a historical chat download link grants access.
69: 
70: | Input | Exact Library name or source | Evidence status and permitted use |
71: |---|---|---|
72: | Accepted Collider terms and direction | `00-collider-v1-glossary.md`; `01-collider-v1-foundations.md` | Use their latest verified Library versions, not older `(1)` copies or stale mounted copies. The current register adds questions, not new authority. |
73: | DeepSeek/Cordis research | `deep-seek-harness-deep-research-report.md` | Supporting composition and architecture research; not a dependency, terminology, or proof authority. |
74: | BB research | `bb-deepseek-collider-architecture-report.md` | September 15, 2026 report pinned to `41e7132e817306e43f68f91bde0a6b9f79af99de`. Provides hypotheses and failure cases; no build, test suite, or live provider workflow was executed by that review. |
75: | BB evidence ledger | `research-source-ledger.json` | The ledger identifies `get-bb/bb` and the same revision. Verify that identity rather than selecting an unrelated file with a generic ledger name. |
76: | Earlier Agent Native evaluation | `Agent-Native Architectural Evaluation for Collider and Substrate` | Native Deep Research report, pinned to `92e6aec8b26b68e870384009af2a4d40cc68e41d`. Preserve source observations; reassess fit/adoption conclusions against actual Substrate/UAA and the disposable-UI clarification. This is a report title, not an assumed Markdown filename. |
77: | Corrected evaluation instructions | `agent-native-collider-research-prompt-v2.md` | Active research brief. Supersedes earlier `agent-native-collider-grounded-research-prompt.md` and earlier reuse-prompt variants for this task. Includes the implementation-grounded context and disposable-UI instruction; not a completed evaluation. |
78: | Corrected Agent Native report | Not yet produced | A pending deliverable. Do not treat the prior reassessment or this intake as the result of the corrected investigation. |
79: 
80: **Live implementation entry points:** [Substrate implementation branch](https://github.com/atomize-hq/substrate/tree/feat/runtime-refactor-e3-ac1-projection-authority-correction), its [runtime-refactor control pack](https://github.com/atomize-hq/substrate/tree/feat/runtime-refactor-e3-ac1-projection-authority-correction/llm-last-mile/runtime-refactor), [Unified Agent API staging](https://github.com/atomize-hq/unified-agent-api/tree/staging), and [Collider](https://github.com/atomize-hq/collider). Follow current owner contracts and code; resolve branch heads once per evaluation and pin decisive reads. Distinguish canonical target documents, landed implementation, compatibility paths, non-authoritative indexes, and unexecuted proof claims.
81: 
82: **Candidate and comparison entry points:** [Agent Native repository](https://github.com/BuilderIO/agent-native), [website](https://www.agent-native.com/), [documentation](https://www.agent-native.com/docs/), and [BB repository](https://github.com/get-bb/bb). Repo source, published artifacts, and generated repository summaries may differ. Verify important claims against pinned primary sources; neither an attractive catalog nor a prior favorable recommendation selects the outcome.
83: 
84: Separate changes caused by corrected project understanding, upstream revision changes, and new execution evidence. The earlier implementation-grounded reassessment was conversation guidance; the active v2 brief carries its scope correction without inventing a separately saved report.
```

### inputs/02-collider-v1-open-architecture-questions.md, lines 149–165

```text
149: ### C-OQ-007 — Control Plane and Lane projection-association rules
150: 
151: **Status:** Open\
152: **Decision:** Define which Activity Items appear in the Lane-unfiltered Control Plane and each Lane-filtered Workstream.
153: 
154: **Must evaluate:** Workspace-level Invocations later dispatched to a Lane; cross-Lane orchestration; activity associated with several Lanes or Scopes; shared Handbook or MCP App Source Records; view-specific correlation, folding, ordering, visibility, and projected location; historical Lane rebinding; summaries; internal-detail disclosure; and whether Control Plane and Lane views share Activity Item Business Identity or only Source Record identity. Compare coordinated Control Plane and Lane views under a shared client controller or another projection arrangement without assuming one library thread equals one Lane, Workstream, or Qualified Session.
155: 
156: **Current direction:** Control Plane and Lane views reuse the same core Workstream Surface and differ primarily by internal projection and binding posture. They may assemble some of the same Source Records differently.
157: 
158: ### C-OQ-008 — Explicit Qualified Session Continuity
159: 
160: **Status:** Open\
161: **Decision:** Define how users intentionally create, resume, reuse, or continue an owner-specific model-provider, runtime, agent-harness, shell, or PTY Qualified Session while resolution-reconstructed behavior remains the default.
162: 
163: **Must evaluate:** one-Invocation continuation versus persistent continuity mode; Qualified Session creation; explicit resume handles; provider-specific identity and guarantees; expiration, recovery, disconnection, and reconnection; context compaction; provider or model changes; Handbook Scope or Resolution changes; Lane rebinding; Substrate policy, Capability Grant, permission, trust, and compatibility revalidation; termination; branching or cloning; Qualified-Session-to-Workstream cardinality; whether a Qualified Session may span several Lanes; how Qualified-Session-associated activity appears in the Lane-unfiltered Control Plane and Lane-filtered views; private, temporary, or hidden Qualified Sessions; Session History pagination, retention, privacy, redaction, deletion, and reconstruction; interaction with Projection Definitions, Activity Assemblers, Activity Items, and Context Records; the dedicated Sessions destination and its Session-oriented Surface; grouped, conditional, prominent, or user-selected root placement; the distinction between browsing Session resources and explicitly invoking continuation; coordination with Navigator Layout preferences under C-OQ-025; visible indication that continuity is active; fallback when a provider cannot resume; and the exact state promised by `continue`. Map library threads, provider-native resume resources, and Substrate durable orchestration sessions separately; inspect the actual UAA and Substrate semantics for detach versus cancellation and reconnect versus resubmission before assessing a candidate transport.
164: 
165: **Current constraints:** a dedicated Sessions destination is accepted product direction, while its delivery details remain open; users may prioritize it without changing the resolution-reconstructed default or automatically resuming a Session; remaining in one Workstream does not imply Session Continuity; a Workstream may span zero, one, or several Qualified Sessions; one Qualified Session's activity may appear in several Workstream projections where policy permits; Session History is one owner-scoped source history rather than the Workspace-wide canonical history; and resumption does not make a Qualified Session authoritative for Handbook semantics, Lane placement, Substrate policy, Collider Workstream identity, or unvalidated policy, capability, permission, provider, or model state. No universal cross-provider Session protocol, provider-specific resume API, automatic continuation rule, final Session UI, exact persistence schema, Activity Projection storage choice, or compaction algorithm is selected.
```

### inputs/02-collider-v1-open-architecture-questions.md, lines 201–208

```text
201: ### C-OQ-013 — Cordis feasibility and reference monitoring
202: 
203: **Status:** Open\
204: **Decision:** Determine whether Cordis merits a bounded prototype or integration spike, should remain a reference-only implementation study, or should be rejected for Collider or Substrate use.
205: 
206: **Must evaluate:** TypeScript and runtime fit with Rust, Tauri, Substrate, Handbook, and Collider; whether any plausible use is limited to trusted client-side composition; whether a Rust-native analogue would fit the architecture better; dependency footprint, upgrade burden, maturity, maintenance, coupling, and long-term compatibility risk; the evidence and criteria that would justify embedding Cordis later; explicit rejection criteria; and how to monitor DeepSeek Harness while it remains immature or rapidly changing without treating it as canonical authority.
207: 
208: **Current constraint:** Cordis is not a selected dependency or the canonical Collider or Substrate extension substrate. Any prototype or integration spike requires separate bounded authorization and MUST preserve the existing Handbook, Substrate, and Collider authority boundaries and Collider's protocol-neutral Surface model.
```

### inputs/02-collider-v1-open-architecture-questions.md, lines 336–345

```text
336: ### C-OQ-027 — Frontend foundation and reuse strategy
337: 
338: **Status:** Open\
339: **Decision:** Determine whether Collider should adopt, compose, adapt, selectively own, fork, or independently implement its frontend foundation, including presentation components and interaction controllers, over the existing Substrate/Handbook/UAA owner boundaries.
340: 
341: **Must evaluate:** substantial coherent framework adoption; selected package composition; controller/protocol reuse versus presentation-only reuse; supported customization and ejection; selective source ownership; a bounded frontend fork; a broader hard fork with explicit backend adaptation; a clean Collider-native implementation; and hybrids by layer. Compare all options against the same desired product rather than current AI Elements APIs. Trace actual public exports, imports, state ownership, network/process/credential access, providers, transports, and published package contents. Assess useful behavior retained, missing product behavior, common project work versus candidate-specific work, adapter and semantic mismatch, Tauri/WebView and Vite integration, theming, accessibility, testing/conformance fidelity, bundle/dependency footprint, release compatibility, maturity, upstream drift, patch burden, distribution, licensing/notices and copying/ejection rights, and exit strategy. Inspect one substantial agent-interaction region and one non-chat editor/grid/configuration region rather than using a token component demo as reuse evidence. Determine whether a candidate can implement the relevant client role without parallel behavioral ownership, fake execution truth, or an unnecessary replacement CLI-agent backend. Core-coupled modules are assessed by actual effects and ownership, not rejected by package name alone.
342: 
343: **Current constraints:** AI Elements curation is disposable, with no preservation preference or sunk-cost penalty. Tauri + React + TypeScript + Vite is the target; distinguish that target from the committed Next.js-era implementation. The Vite transition and any necessary Substrate frontend boundary are common project work, not automatically candidate-specific adoption penalties. Accepted product semantics and owner authority remain in force, while frontend implementation machinery can change. Direct use, coherent adoption, selective ownership, hard fork, hybrid, and reference-only outcomes remain possible. No Agent Native, AgentKit, Toolkit, BB, Cordis, protocol, controller, datastore, or dependency is selected by this question.
344: 
345: **Decision evidence:** a repository/authority baseline, per-layer and integrated-strategy comparison, actual public or private interface gaps, licensing evidence, a correction ledger for prior evaluations, disqualifiers, and the smallest meaningful separately authorized proof. That proof should test owner-routed actions, detach versus cancel, reconnect versus rerun, truthful terminal state and capability availability, coordinated views, and the retained value of a substantial UI region. Documentation or inspected tests are not executed acceptance evidence. Research, adjudication, proof, and canonical amendment remain separate steps; do not claim all open questions must close before stable Workspace Shell behavior can be drafted.
```

### inputs/02-collider-v1-open-architecture-questions.md, lines 391–407

```text
391: ### 5.1 Current frontend-evaluation sequence
392: 
393: The history/projection packet above remains a separate research cluster. The corrected Agent Native evaluation under C-OQ-027 need not wait for that cluster to be fully resolved.
394: 
395: 1. Use the active v2 brief and explicit Library inputs. First verify access, versions, and the requested GitHub branches; establish the Substrate/UAA/Collider implementation-and-authority baseline before candidate recommendations.
396: 2. Evaluate packages and coherent adoption/fork options, producing a cited, bounded recommendation and unresolved hypotheses. Keep every question Open unless separately adjudicated; commissioning or preparing research does not make it complete.
397: 3. Explicitly accept, reject, or defer material findings and identify any proposed semantic changes. Research reports do not become implementation directives through reference alone.
398: 4. Draft stable, implementation-neutral Workspace Shell behavior where sufficiently settled. Separately authorize a meaningful integration proof for consequential adoption assumptions; do not credit fixtures as Substrate production proof.
399: 5. Complete supported Execution and Binding contracts from real owner interfaces and amend canonical documents only through explicit decisions. Leave unfinished operational boundaries and unresolved history/identity mechanisms visible.
400: 
401: Deep Research is a research method, not an additional authority or permission grant. Use it only with verified access to the selected files and repository branches. If a delegated run lacks those inputs, obtain an authorized bounded snapshot or use a source-capable interactive research session; do not substitute public summaries for private implementation evidence.
402: 
403: ## 6. Closure Rule
404: 
405: An open item is not closed by implementation convenience, a UI mockup, or an undocumented local choice.
406: 
407: Closure requires an explicit decision record and coordinated updates to every normative Collider V1 document whose definitions or invariants change.
```
