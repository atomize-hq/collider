# Agent Native for Collider — frontend foundation and reuse evaluation

**Status:** Fresh-session research brief; no adoption or implementation authorization.
**Revision:** 2 — incorporates the product owner's clarification that the existing AI Elements curation is disposable.
**Supersedes:** `agent-native-collider-grounded-research-prompt.md` as the research instructions for this evaluation. Earlier research remains evidence to reassess, not canonical authority.

## 1. Mission and the decision to support

Perform a very deep, repository-grounded investigation of BuilderIO/agent-native as a potential frontend library, SDK, interaction framework, source foundation, or hard-fork starting point for Collider.

Determine which strategy most effectively delivers Collider's desired product over its existing Substrate/Handbook/Unified Agent API foundation: substantial direct framework adoption, selected package adoption, public-interface composition, selective source ownership/ejection, a coherent frontend fork, a broader fork with backend adaptation, or Collider-native development informed by the reference.

The central question is:

> Starting from the product we want and the operational infrastructure we actually have, how much working UI and interaction behavior can Agent Native supply, what must change, and which ownership strategy offers the best forward-looking delivery and maintenance economics?

This is not a competition to preserve current Collider components. It is also not an assignment to prove that Agent Native is the winner. Substantial adoption and a hard fork are genuine options; so is rejecting some or all candidate layers after inspecting the evidence.

## 2. Controlling product-owner clarification — no incumbent UI preference

The existing Collider AI Elements components were provisional and also served as a testbed for developing and refining the separate ds-skills system. That work has already delivered value through ds-skills regardless of whether those components ship in Collider.

The owner explicitly permits scrapping the entire curated component set. Therefore:

- Do not assign architectural preference to AI Elements, current React components, their props, their internal state shape, or existing component-level stories merely because they are present.
- Do not score deleting those components as lost investment. Do not require backward compatibility with them unless a separately established product behavior or external contract actually requires it.
- Do not frame the primary comparison as "can Agent Native beat the components we already invested in?" Evaluate each strategy against the same desired Collider product and forward-looking costs.
- Existing code may be retained only if it independently helps the selected path. It is an optional source, not the incumbent architecture.
- Separate reusable ds-skills tooling, product-relevant quality gates, token assets, and learned development practices from the disposable component implementation used to exercise them.
- Assess the forward cost of integrating useful tooling or re-establishing equivalent checks. Do not assume that the exact current token shape, test fixtures, visual baselines, registry format, or component curation must remain unchanged.
- Do not force preservation of a temporary frontend abstraction merely because it appears in source. Conversely, do not discard unrelated useful tooling without identifying the reason and replacement cost.

The fixed destination technology is **Tauri + React + TypeScript + Vite**. At the previously inspected repository revision, the application used Next.js; distinguish committed implementation from the approved Vite target. Moving to Vite is not up for reversal through silent vendor adoption.

The frontend remains substantially designable. A robust external framework may supply a large portion of it, including its controller and interaction machinery where compatible. The goal is not necessarily maximal extraction into many tiny components: compare the integration cost of piecemeal reuse with preserving a coherent package or screen/controller stack.

## 3. Authorization and scope

This is a research and recommendation task, not authorization to modify canonical documents or implement an integration.

Do not modify product repositories or canonical Collider files, commit or push, publish a package, install a product dependency into the user's repository, launch real agents against personal workspaces, change host policy or credentials, run privileged Substrate installation/proof commands, or contact upstream maintainers.

Read-only source inspection, import tracing, inspection of published package artifacts, and static comparisons are in scope. Do not run unknown install hooks or ejection scripts merely to inspect their output. Propose consequential build/runtime experiments as a separately authorized bounded spike. Distinguish existing test source, upstream-reported test results, and tests actually executed; source presence is not a passing result.

Produce a finite decision package, not an invitation to research every open question before any product work can proceed.

## 4. Sources, branch pins, and evidence handling

Use connected GitHub access for repository data. Resolve each requested branch head once, record the full commit SHA and date, then inspect decisive files at that pin. Search results and generated summaries can reference older/default branches: re-fetch key files at the selected revision.

### Our implementation — inspect first

1. Substrate implementation branch:
   https://github.com/atomize-hq/substrate/tree/feat/runtime-refactor-e3-ac1-projection-authority-correction

   Runtime-refactor entry point:
   https://github.com/atomize-hq/substrate/tree/feat/runtime-refactor-e3-ac1-projection-authority-correction/llm-last-mile/runtime-refactor

2. Unified Agent API, current integration-development branch:
   https://github.com/atomize-hq/unified-agent-api/tree/staging

3. Collider:
   https://github.com/atomize-hq/collider

   Resolve and use the default branch unless the user supplies a different one. This repository is now public; an earlier access failure is not a reason to skip inspection. Do not silently choose a different branch to make a hypothesis fit.

### Candidate and supporting research

- Agent Native repository: https://github.com/BuilderIO/agent-native
- Website: https://www.agent-native.com/
- Documentation: https://www.agent-native.com/docs/
- BB comparison repository: https://github.com/get-bb/bb
- Supplied `deep-seek-harness-deep-research-report.md`.
- Supplied BB report, previously named `bb-deepseek-collider-architecture-report.md`, and its `research-source-ledger.json`.
- Initial Agent Native evaluation and the subsequent implementation-grounded reassessment, when supplied.

Use DeepWiki for pointed questions when it is available, but verify load-bearing answers against pinned primary sources. Do not claim DeepWiki supports a deep-research mode or a particular endpoint unless the available tool actually supports it. Do not substitute broad generated summaries for actual source inspection.

### Collider documents

Read the latest user-supplied versions of:

- `00-collider-v1-glossary.md`
- `01-collider-v1-foundations.md`
- `02-collider-v1-open-architecture-questions.md`

Record their filenames, hashes or other exact version identifiers. The most recent known Navigator register included `C-OQ-001` through `C-OQ-026`; a later research-intake edit may add a frontend-reuse question. Inspect the actual file rather than assuming which identifiers exist.

External research is non-normative. Existing canonical documents govern the current accepted product model; they are not proof of implemented code and do not require every frontend role to be custom-built. Recommend any semantic amendment explicitly rather than silently overruling it.

If an attachment or repository is inaccessible, identify the missing evidence and qualify affected conclusions. Continue with accessible material. Do not reconstruct an allegedly exact missing document from prior assistant summaries or invent download links.

### Historical anchors only

Prior inspections used these revisions; they are comparison points, not assertions of current heads:

| Repository | Previously inspected commit |
|---|---|
| Substrate implementation branch | `207a35896e229e6d870e956ecf7a932048dea7b5` |
| Unified Agent API staging | `117995663435eaae89c952563c250045c6aade95` |
| Collider main | `36ed748eaf613316339fd2d518906a40093294ef` |
| Agent Native main | `02608a482f053f00c7e1fdb78738c28a60c59143` |
| BB report anchor | `41e7132e817306e43f68f91bde0a6b9f79af99de` |

Separate changed upstream implementation from mistakes in prior analysis and from this newly clarified product preference.

## 5. Establish our actual integration baseline before recommending a candidate

Produce a compact implementation-and-authority matrix before the comparative analysis. This baseline concerns the backend, supported interfaces, target stack, and real integration obligations—not preservation of the provisional UI.

### Substrate

Start at the runtime-refactor entry point. Follow canonical architecture, contract, slice, and completion/proof owners. Non-authoritative indexes, historical rows, and high-level README summaries may be stale. Report contradictions instead of cherry-picking the one that makes adoption easiest or hardest.

Inspect relevant call sites and contracts for:

- durable orchestration/session authority and surface-neutral ingress;
- dispatch, accepted-work receipts, durable supervision/observation, and terminal truth;
- retained-worker and messaging lifecycle;
- obligations and derived Inbox views;
- policy composition/narrowing and effect enforcement;
- configuration projection and native harness realization;
- the already-existing credential gateway and secure handoff versus remaining adoption/integrated proof;
- World/environment dependency tooling, operation recovery, and cleanup;
- the public/internal distinction of candidate frontend-facing APIs.

Classify each relevant seam as implemented and connected, implemented but internal/unexposed, specified target, transitional compatibility, demonstrably unavailable, or unknown. A type existing does not prove an end-to-end path. A missing public UI bridge does not mean the underlying authority must be rebuilt.

Keep this read bounded to frontend integration needs. Do not turn the evaluation into a whole-platform security review or attempt to finish the runtime refactor.

### Unified Agent API

Inspect the public API, capability contract, event envelope, run protocol, runtime support/publication model, relevant backends, and selected conformance tests.

Compare current staging with the exact package version and features Substrate consumes. Do not assume every staging backend or capability is adopted by that Substrate branch.

Identify ownership of run handles, consumer streams, explicit cancellation, consumer drop/opt-out, completion versus event finality, and provider-specific continuation. Do not equate a Rust public type or "serde-friendly" API with an established frontend wire contract.

Do not propose a second TypeScript CLI-agent integration stack merely to satisfy a candidate UI. Identify any genuinely missing UAA/Substrate capability separately from duplicated work.

### Collider and the target frontend

At the historical anchor, Collider had a minimal page and Tauri entry point, Next.js build scripts, React 19, and substantial provisional AI Elements/Storybook/ds-skills work. Reverify the actual tree, but do not spend most of the research inventorying a component set the owner has explicitly authorized discarding.

Inspect enough to establish:

- the real Next.js-to-Vite migration boundary;
- Tauri initialization, configuration, capabilities, CSP, and current supported host calls;
- existing product integration versus a component demonstration;
- dependencies, styles, tokens, tests, and reusable tooling relevant to the proposed strategy;
- any actual end-user data, external interfaces, or policies that do need migration/preservation.

Known navigation hints, not a closed file fence:

- `package.json`, `src/app/page.tsx`, `src/components/ai-elements/`, `src/components/ui/`.
- `src-tauri/src/lib.rs`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`.
- Actual design-token, Storybook, ds-skills, test, and project configuration discovered in the tree.

Return: capability/operation; authoritative owner; implementation and exposure status; missing bridge or proof; relevance to frontend adoption. Note disposable scaffolding separately from actual migration obligations.

## 6. Product semantics to preserve and implementation freedom to evaluate

Preserve the accepted owner boundaries: Handbook semantic truth; Substrate operational authority, execution, credential separation, and policy enforcement; UAA's CLI-agent integration role; Collider presentation and interaction. Do not recommend changes that modify unrelated host programs' behavior or debugging permissions just to accommodate a frontend.

Distinguish these identities explicitly:

- Substrate durable orchestration/session authority;
- provider/runtime Qualified Session continuity;
- a candidate's thread/conversation and client projection identity;
- Collider Workstream, Lane, Invocation, Activity Item, Block, and Surface.

Resolution-reconstructed interaction is the default. Continuing a provider/runtime Session is intentional and visible, not inferred from remaining in one Workstream. Sessions may be user-prominent navigation, not compulsory organization for every interaction.

Surfaces remain protocol-neutral application/view abstractions. Inline, Sticky, and Tab placements do not own execution. A UI contribution is not an authority grant. Context mediation does not sandbox untrusted executable code. Spatiotemporal composability remains a bounded objective, not an existing proof. Workspace history architecture remains unresolved.

Navigator groups, item membership, order, visibility, and root placement are user-customizable. The one-word rule applies only to shipped highest-level default headings/labels, not nested labels, canonical names, or user-selected names. Preserve accepted terms such as Control Plane and Agent Profile rather than renaming them to satisfy that UI rule.

Evaluate frontend mechanisms freely: component library, controller, reducer, interaction model, internal store, data adapters, styling implementation, package organization, and code structure may all change. A candidate may implement a Collider architectural role directly. Do not first require a separate bespoke implementation of that role and then count the resulting duplicate state as unavoidable adoption cost.

A useful framework-owned live projection is not automatically competing source authority. Test which state is authoritative, which is derived, how it is recovered, and which operations mutate the owner. Avoid duplicate client reducers/queues/approval owners for the same behavioral scope, while recognizing that different owner domains and projections legitimately maintain different state.

If a candidate motivates changing an accepted product-semantic decision, present the exact decision, benefit, alternatives, risk, and required approval. Do not silently make the candidate's ontology canonical.

## 7. Investigate the actual reusable units and coherent adoption paths

Verify current package topology. Previous inspection identified Core, AgentKit, Toolkit, templates, and other packages, but names, exports, maturity, and publishing boundaries may have changed.

Evaluate both individual packages and integrated combinations:

| Candidate layer | Investigate |
|---|---|
| Toolkit or equivalent | Composer, app chrome, navigation, editors, grids, dashboards, selection/canvas helpers, context presentation, styling and accessibility mechanisms. |
| AgentKit or equivalent | Protocol, headless controller/reducer, transports, streaming, tool/activity display, approvals, queues, reconnect, collaboration display, React composition. |
| Integrated UI/screens/templates | Useful product behavior retained together; dependencies needed to separate it from Core; whether coherent adoption is cheaper than many small extractions. |
| Core or runtime-coupled modules | Actual useful behavior, overlap with existing owners, public substitution points, what could remain under explicit ownership, and what would need replacement. Do not reject by name alone. |
| Fork/ejection units | Exact retained files/regions, supported source ownership mechanisms, private imports, licenses/notices, upstream patch burden, and feasibility of maintaining a bounded fork. |

Trace real imports, not just the catalog. For each candidate, identify React providers, stores, browser/Node access, direct network calls, persistence, authentication/credentials, Core services, and runtime transport assumptions.

Compare repository source with exact published artifacts: package versions, dependencies, exports, included source, license text/notices, ejection manifests, and compatibility may differ. Do not mistake a public export, MIT field, or generated API page for demonstrated portability.

Investigate two end-to-end UI paths deeply: one meaningful agent-interaction region and one editor/grid/configuration/workspace region. A generic button demo is not sufficient evidence for the claimed jump start.

For each unit report: entry point and version; behaviors delivered; required providers/dependencies; controlled data/action interfaces; local state versus backend truth; runtime coupling; configuration/customization; changes needed; retained tests; direct-use/fork/reference disposition; confidence and disqualifiers.

## 8. Compare strategies without either incumbent or framework bias

Compare at least:

A. Substantial adoption of a coherent external frontend/interaction framework through supported interfaces.
B. Selected package composition above Substrate, including an external controller when useful.
C. Selective ejection or source ownership of coherent UI regions.
D. A bounded frontend fork, including controller/protocol modifications where justified.
E. A broader Agent Native fork with backend integration replaced or adapted to existing owners.
F. Collider-native frontend development from a clean implementation baseline, using existing components only when independently useful.
G. A hybrid selected by layer.

Use identical desired product scenarios, not identical current component APIs. Evaluate the strongest case for and against the recommended strategy. Include evidence that would reverse the recommendation.

Compare:

- useful product/interaction behavior delivered and still missing;
- time and work to the first coherent target experience, without unsupported numeric estimates;
- adapter and semantic mismatch costs;
- how much remains intact after backend adaptation;
- consistency and maintenance benefits of integrated components/controller versus fragmentation costs of piecemeal reuse;
- customization, accessibility, visual/theming integration, and actual Tauri/WebView suitability;
- required sidecars, network services, and runtime processes;
- import/bundle/dependency costs and test inheritance;
- API/version churn, fork divergence, patch tracking, team maintenance, and exit strategy;
- licensing/provenance and distribution readiness.

Count real future costs, not past curation effort. The chosen Vite migration and a necessary Substrate frontend boundary are common project work; count only additional candidate-specific requirements against the candidate. Rewriting an unimplemented proposed frontend abstraction is not the same as migrating a shipped public protocol or user data.

Do not treat a larger adoption as inherently better or a smaller dependency surface as inherently cheaper. A broad backend conflict does not disqualify separable UI. A beautiful demo does not prove a maintainable integration. Do not invent percent-reuse or delivery dates.

## 9. Operational and Activity Projection mapping

Trace request, acceptance, observation, completion, explicit cancellation, reconnection, approval, and owner mutation across the proposed integration. Identify existing supported entry points and exact gaps; do not assume React can call private Rust internals.

Evaluate these cases:

- Closing a Tab or unmounting UI detaches observation without cancelling accepted work, dropping backend-owned UAA resources, or changing durable authority.
- Cancellation is explicit and targets the correct active operation. Process exit, stream finality, receipt acceptance, and authoritative terminal status are not collapsed.
- Reconnect observes existing work rather than resubmitting an uncertain request; retry and idempotency are explicit.
- Optimistic UI and queued drafts do not assert accepted work or durable authorization.
- Controls distinguish declared support, negotiated support, authorization, readiness, temporary unavailability, and unknown facts.
- Approval cards preserve exact request identity and owner validation. Dismissing an Inbox item does not approve or resolve work.
- The candidate's chat/thread defaults do not silently enable provider Session continuation or alter Handbook context resolution.
- Execution-event normalization remains where Substrate/UAA own it; client assembly creates views without inventing execution truth.
- A candidate controller may implement the relevant client projection role, or its presentation can be used separately. Identify where it saves a bespoke implementation and where it creates semantic mismatch.
- Inline, Sticky, Tab, Control Plane, and Lane views can coordinate without accidental duplicate behavioral ownership.
- Older-page loading, source revisions, replay, partial reconstruction, late events, missing renderers/providers, and sequence gaps are represented honestly.
- Editors, grids, widgets, and generated UI send validated owner-approved operation intents rather than writing authority files or bypassing policy.
- Agent-authored UI/code does not gain host execution authority simply by being rendered.

Do not select a Workspace-wide event log or a universal Session protocol to satisfy a library's thread API. Show whether library identities can remain projection/adaptation identities, what guarantees would have to be restricted, and when a mismatch warrants a different strategy.

## 10. Security, legal evidence, and distribution

Inspect actual Tauri/WebView assumptions, CSP requirements, dynamic HTML/JS/Markdown/widget code, clipboard/browser integrations, Node imports, external fetches, credentials, telemetry, file access, and action/IPC entry points. Lifecycle cleanup and UI context/slot mechanisms are not isolation.

Evaluate no-secret presentation views, owner-revalidated references, action input validation, and hostile or stale UI inputs. Separate actual reusable security controls from responsibilities the host must supply. Do not re-audit unrelated Substrate security or propose new host-wide restrictions.

The original licensing concern was an MIT claim with no visible root LICENSE. Recheck exact current evidence rather than repeating that observation as a fact about a new commit.

Inspect repository and package license texts, SPDX declarations, headers, copyright notices, third-party copied source/assets, npm tarballs, source distribution, and generated/ejected output. Distinguish stated licensing intent, actual available grant/notice text, package-specific terms, and unresolved questions. Neither a README MIT label nor a missing root LICENSE alone resolves every copying/distribution question.

Report what must be clarified or retained before dependency distribution, vendoring, modification, or a fork can ship. Do not give legal assurances, infer missing copyright ownership, or contact maintainers. Keep the licensing gate independent from the technical recommendation.

## 11. Use BB and DeepSeek as evidence, not adoption templates

Read supplied reports and their scope/limitations. Follow pinned primary evidence for decisive comparisons. Do not expand this into a fresh exhaustive BB/DeepSeek review.

Use BB to identify concrete product tests: provider adaptation, capability truthfulness, renderer fallback, desired versus available Navigator state, history read boundaries, reconnect/retry differences, generation-scoped replacement, uncertain dispatch, environment resource cleanup, and executable conformance.

Use DeepSeek/Cordis for the composition reference: owner boundaries, dependency-reactive lifecycle, mediated effects, scoped contributions, and stable projection assembly. Do not import terminology, universal histories, full-trust assumptions, or formal guarantees into Collider by analogy.

Explain which Agent Native behaviors independently support a useful pattern, which are different but acceptable, and which conflict with established ownership or desired UX.

Provide a correction ledger with separate categories:

- earlier factual errors or insufficient repository grounding;
- changes caused by upstream revisions;
- changes caused by the owner's clarification that AI Elements is disposable;
- architectural hypotheses still awaiting technical proof.

## 12. Required deliverables and stopping conditions

Return a comprehensive decision report plus a pinned source/evidence ledger. Include:

1. Executive recommendation by reusable layer and coherent adoption strategy, with confidence, disqualifiers, and a serious counterargument.
2. Our actual implementation/authority and current-versus-target matrix. Explicitly classify current AI Elements as optional/disposable, not a preservation constraint.
3. Concrete package/component/controller inventory with import graphs, public extension seams, hidden runtime requirements, and published-artifact differences.
4. Forward-looking strategy comparison: retained useful behavior, future integration work, real migration obligations, maintenance, and exit costs. Do not score the value of past curation work.
5. Ownership, command, transport, identity, and Activity Projection mapping; missing supported APIs and semantic conflicts.
6. UI interaction value and Tauri/Vite feasibility, including what a coherent integrated adoption saves beyond a component collection.
7. Security/trust and licensing/distribution evidence, unresolved questions, and required clarification.
8. Decision-relevant BB/DeepSeek comparison and the prior-evaluation correction ledger.
9. A separately authorized, explicitly unexecuted spike proposal covering substantial interaction UI plus a non-chat Surface. Identify exact scenarios, required backend readiness, what can use fixtures, pass/fail criteria, measurements, and stop conditions.
10. Findings mapped to existing open-question identifiers. List potential canonical amendments separately and do not make them or resolve questions.
11. What stable Workspace Shell work can proceed independently, and which Execution and Binding commitments need actual owner-contract evidence or prototype proof.

Classify decisive statements as verified source implementation, documented contract/intent, inspected test source, actually executed test result, upstream-reported result, inference, recommendation, or unknown. Cite pinned primary files/symbols or inspected published artifacts.

Stop broad discovery once the decisive options, required adaptations, and unresolved technical hypotheses are clear. Do not make a prototype claim from documentation. Do not require all 26-plus architecture questions to close to shortlist a frontend strategy. End with the smallest next decision and proof needed to move from a research recommendation to a responsible adoption choice.
