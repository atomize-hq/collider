# Collider Frontend Landing Guide

## Purpose

This guide defines how to land the Collider frontend without accidentally pulling AI routing, policy, or orchestration responsibilities into the Tauri/React layer.

It is intended to keep frontend progress unblocked while preserving Substrate as the single owner of:

- AI/network egress
- backend/provider routing
- policy enforcement
- agent orchestration
- privileged tool gating
- trace/event attribution
- config/policy resolution

---

## Decision

**Recommended approach:**

Land the frontend in **two tracks**:

1. **Land the UI shell, layout, interaction patterns, and visual components first** using AI Elements where it helps.
2. **Land the Substrate-owned UI API + frontend adapters second**, once the relevant backend contracts are stable enough to target.

Do **not** block the frontend on the full AI/runtime integration layer.

Do **not** make Vercel AI SDK Core/providers/Gateway the primary transport or routing layer for Collider.

You may use **AI Elements for rendering** and optionally use **AI SDK UI hooks only behind a Collider adapter boundary** later, if they still fit once the Substrate stream contract settles.

---

## Why this sequencing is the right one

### 1. The frontend should not become a second control plane

Collider will render AI/agent state, but it should not become the place where provider routing, orchestration privilege, or policy decisions are implemented.

The frontend may initiate requests and render streams, but Substrate remains the authority.

### 2. Your backend ADRs are still defining canonical contracts

The backend work is establishing:

- the in-world LLM gateway
- normalized backend routing
- agent/session/event attribution
- orchestrator-only toolbox access
- config/policy gates and fail-closed posture

Those contracts should drive the integration layer, not the other way around.

### 3. UI progress does not require final transport contracts

You can build almost all of the expensive frontend work now:

- layout
- window structure
- sidebars/panels
- composer
- message/thread rendering
- run timeline UI
- tool call cards
- event log views
- settings screens
- placeholders/skeletons
- optimistic interaction patterns
- virtualized lists
- selection/annotation affordances

All of that can land with mock stores, fixtures, and fake stream drivers.

### 4. You need a Collider-native event model anyway

Collider will likely need to render more than simple chat text:

- assistant text
- reasoning summaries
- citations/sources
- tool calls
- command output
- artifacts
- approvals
- run state
- world/session metadata
- orchestration status
- policy denials
- structured traces

That means a Substrate-native UI model is the right canonical layer, even if parts of it can later be adapted into AI SDK UI primitives.

---

## What to build now vs later

## Build now

### A. Design system and app shell

Build the stable UI frame now:

- app shell
- navigation
- tabs/panes
- session list
- world/workspace context header
- command/composer area
- detail inspector
- right rail / metadata rail
- status bars
- resizable panes
- loading and empty states

### B. Render-only AI/message primitives

Use AI Elements selectively where they give you fast, good-looking primitives for:

- message containers
- assistant/user rows
- response blocks
- code blocks
- tool sections
- loaders
- input/composer pieces
- task/queue-like items

Treat them as **copied UI building blocks**, not architecture decisions.

### C. Mocked frontend domain model

Create a local frontend domain model now.

Suggested top-level entities:

- `WorkspaceViewModel`
- `SessionViewModel`
- `RunViewModel`
- `MessageViewModel`
- `ToolCallViewModel`
- `ArtifactViewModel`
- `AgentViewModel`
- `WorldStatusViewModel`
- `PolicyDecisionViewModel`
- `TraceEventViewModel`

This model should be **Collider-owned**, not borrowed directly from any vendor SDK.

### D. Fake transports / fixtures

Build with:

- static JSON fixtures
- local mock repositories
- deterministic fake streams
- replay logs
- storybook/demo states if useful

Create test states for:

- idle
- streaming
- buffered completion
- tool call started
- tool call completed
- denied by policy
- world unavailable
- retryable backend failure
- orchestration in progress
- multiple concurrent sessions

### E. State boundaries

Define interfaces now, even if the implementations are mocked:

- `ChatRepository`
- `RunsRepository`
- `AgentsRepository`
- `ToolboxRepository`
- `TraceRepository`
- `WorkspaceRepository`
- `GatewayRepository`

Then use mocks behind them until the real Substrate contracts land.

---

## Defer until backend contracts land

### A. Real `useColliderChat`

Do not finalize the real chat hook until the Substrate UI-facing stream/event contract is stable.

You can define the interface now, but keep the real transport implementation for later.

### B. Real `useColliderStream`

Do not lock into SSE/WebSocket/Tauri-event/channels semantics too early.

Wait until you decide the authoritative stream path from Substrate to the UI.

### C. Real `useColliderRuns`

The run/session model should align with Agent Hub, event attribution, and trace vocabulary. Build the UI now; bind the real repository later.

### D. Direct AI SDK ownership of protocol

Do not let `useChat` or Vercel transport shapes dictate your backend protocol unless you explicitly decide to support that as a compatibility adapter.

### E. Final approval / tool invocation flows

These should wait until toolbox auth, policy explanation, and orchestration tool schemas are stable.

---

## Recommended landing phases

## Phase 0 — Frontend contract posture

Create a small frontend architecture note in the Collider frontend package that states:

- Substrate is the sole owner of AI/provider routing and policy
- frontend repositories are adapter boundaries only
- vendor UI libraries are presentational unless explicitly wrapped
- frontend models are Collider-native
- mock-first development is expected until backend contracts settle

## Phase 1 — Shell and static views

Land:

- Tauri window shell
- page layout
- navigation structure
- panels
- empty states
- static screens for sessions/runs/messages/settings

No real AI transport required.

## Phase 2 — Interactive mocked experience

Land:

- composer interactions
- local message append behavior
- fake stream playback
- tool-call cards
- run timeline
- inspector side panel
- session switching
- search/filter UI if needed

Use fixture data and fake repositories.

## Phase 3 — Frontend domain/store stabilization

Land:

- normalized frontend types
- repositories
- store/query patterns
- mapping helpers from raw transport payloads into view models
- error state handling
- reconnect/resume UI semantics

Still mock-backed if necessary.

## Phase 4 — Backend integration slice 1

Once backend contracts are stable enough, connect read-mostly paths first:

- gateway status
- session list
- run list
- trace/event read views
- agent list/status

Prefer read-only integrations first because they validate shape without forcing control-plane decisions.

## Phase 5 — Backend integration slice 2

Then connect live chat/stream behavior:

- send request
- stream response
- cancel
- retry
- reconnect
- buffered fallback behavior
- policy denial rendering

## Phase 6 — Control-plane / privileged integrations

Last, connect privileged or role-sensitive surfaces:

- orchestration toolbox access
- approvals
- policy explainers
- orchestrator-only affordances

These should only land after auth/gating behavior is stable.

---

## The frontend adapter boundary

Create explicit adapters instead of coupling components directly to SDK hooks.

Recommended hooks/interfaces:

- `useColliderChat(sessionId)`
- `useColliderRuns(filters)`
- `useColliderAgents()`
- `useColliderTrace(query)`
- `useColliderWorldStatus()`
- `useColliderPolicyExplain()`

Internally, these should call repositories/services such as:

- `substrateChatTransport`
- `substrateRunsApi`
- `substrateAgentApi`
- `substrateTraceApi`
- `substrateToolboxApi`

That keeps the rest of the UI insulated from transport churn.

---

## How to use AI Elements safely

Use AI Elements as:

- composable message UI
- polished input/composer building blocks
- loading/streaming visual states
- chat/task/workflow visual atoms

Do **not** treat AI Elements as proof that your runtime should use the Vercel AI stack end-to-end.

Safe rule:

- **AI Elements may influence UI composition**
- **AI Elements must not dictate backend ownership or trust boundaries**

Because the components are copied into your codebase, you are free to reshape them around your own domain model.

---

## Where AI SDK UI may still fit later

AI SDK UI can still be useful later if one of these becomes true:

1. You want fast chat state wiring for a narrow subset of the app.
2. Your Substrate UI API exposes a compatible stream protocol.
3. You write a thin custom transport/adapter that maps Substrate events into AI SDK UI messages.

If you do this, keep it behind your own wrapper:

- good: `useColliderChat()` internally uses `useChat()`
- bad: app-wide components depend directly on `useChat()` shapes everywhere

That way you can remove or replace it later without a frontend rewrite.

---

## Transport guidance for Tauri

Prefer transport choices that match the data type:

### Good fits

- command/invoke style calls for request-response operations
- channel-like or stream-specific paths for high-frequency ordered streaming
- read-only polling or paginated fetches for status/history views

### Avoid as the primary long-stream protocol

- generic app-wide event emission for token-heavy/high-frequency streams

Use app events for lifecycle/state notifications, not as the main token stream if a better streaming primitive is available.

---

## Canonical frontend truth model

The frontend should distinguish at least these concepts:

- **control plane**
  - explicit actions requested by the user or orchestrator
  - examples: send prompt, cancel run, request approval, query policy explanation

- **event plane**
  - append-only observations rendered by the UI
  - examples: streamed text chunks, tool start/complete, run status changes, world restart alerts

Never let event-plane rendering become implicit execution logic in the frontend.

---

## Anti-patterns to avoid

### 1. Building against vendor message types directly

Do not make AI SDK message objects your core domain model.

### 2. Using frontend config as a second policy system

Do not put backend/routing/policy decisions into React app config or ad-hoc local files.

### 3. Letting the frontend choose providers directly

The frontend can request capabilities or preferences, but Substrate decides actual routing.

### 4. Shipping the chat hook before the event model is clear

That creates churn and accidental lock-in.

### 5. Treating tool-call events as permission to execute follow-up work

The frontend is a renderer and initiator, not an autonomous execution router.

---

## Minimum acceptance criteria for the first frontend landing

A good first landing should include:

- stable Tauri shell and panel layout
- session list and main conversation pane
- composer UI
- assistant/user/tool visual language
- deterministic mocked streams
- run timeline / status UI
- error/empty/loading states
- frontend repository interfaces
- no direct provider SDK ownership in the app shell
- no policy/routing logic implemented in frontend code

If you can meet those, the frontend is landing correctly even before the real backend integrations exist.

---

## Recommended short answer

**Do not wait for every backend API to land before building the frontend.**

Build the frontend now, but build it as a **mock-first, Collider-native UI** with adapter boundaries.

Then, once the Substrate gateway / agent hub / toolbox contracts settle, implement:

- `useColliderChat`
- `useColliderStream`
- `useColliderRuns`

against a **Substrate-owned UI API**, not directly against vendor SDK assumptions.

That gives you speed now and preserves your architecture later.

---

## Suggested implementation order

1. Tauri shell + panel layout
2. AI Elements-based message/composer primitives
3. Collider-native frontend domain types
4. Mock repositories + fake stream driver
5. Session/run/message rendering
6. Read-only backend status integrations
7. Real chat/stream transport
8. Toolbox/approval/policy explanation surfaces

---

## One-sentence rule

**Let AI Elements help you land the UI fast, but let Substrate remain the only system that owns AI execution, routing, policy, and orchestration.**
