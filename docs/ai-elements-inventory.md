# AI Elements Inventory

Local reference for every component in the [ai-elements registry](https://elements.ai-sdk.dev), tracked against
our Stage-2 loop progress. Refresh this file whenever a loop lands or the registry churns; do not treat
memory notes or old snapshots as canonical.

- **Registry total:** 48 components
- **Fresh as of:** 2026-08-19
- **Progress:** 27/48 done via Stage-2 (all 27 loops committed)
- **Source of truth:** <https://elements.ai-sdk.dev/api/registry/registry.json>
- **Per-component source:** `https://elements.ai-sdk.dev/api/registry/<name>.json`
- **Refresh:** fetch the two URLs above, diff against the alphabetical index at the bottom, update statuses,
  update the header dates and totals

## Legend

| Marker    | Meaning                                                                    |
| --------- | -------------------------------------------------------------------------- |
| ✅ done   | Stage-2 loop complete — code + stories + governance + Figma seed committed |
| 🧩 folded | Present in the repo via another loop (no dedicated loop needed)            |
| 🎯 queue  | Planned for the next Stage-2 loops, ordered by intended sequence           |
| 🌉 bridge | Stage-3 assembly primitive, not a Stage-2 loop target                      |
| ⏸️ parked | Out of the current transcript + coding-agent scope                         |

## ✅ Done (27) — Tier A + Tier B + composer + coding-agent (8/12)

Ordered by loop number.

| #   | Component             | Cluster      | Commit  | Notes                                                                     |
| --- | --------------------- | ------------ | ------- | ------------------------------------------------------------------------- |
| 1   | message               | Tier A       | 1d6445b | First component; established the loop shape                               |
| 2   | reasoning             | Tier A       | 17cf091 | Introduced shimmer                                                        |
| 3   | code-block            | Tier A       | a395f0c | shiki-backed; split into 4 files                                          |
| 4   | tool                  | Tier A       | 3759598 | Interactive tier baseline                                                 |
| 5   | sources               | Tier A       | 744ca96 | First primitive tier                                                      |
| 6   | task                  | Tier A       | f118a9b | asChild-button reconcile                                                  |
| 7   | chain-of-thought      | Tier A       | 39cd15d | Compound flow steps                                                       |
| 8   | suggestion            | Tier A       | 80379f9 | Chip strip                                                                |
| 9   | inline-citation       | Tier A       | 2b4c5b4 | Hover-card + carousel deps                                                |
| 10  | prompt-input          | Tier B       | b138a6d | 1464→8 files; 6 new ui prims                                              |
| 11  | context               | Tier B       | ff3a259 | tokenlens + progress                                                      |
| 12  | snippet               | Tier B       | 1729d41 | Monospace copy pill                                                       |
| 13  | image                 | Tier B       | 059a6ab | 17 LOC wrapper                                                            |
| 14  | open-in-chat          | Tier B       | 5310d51 | Dropdown with 6 providers                                                 |
| 15  | artifact              | Tier B       | 3583c43 | Bordered file card                                                        |
| 16  | web-preview           | Tier B       | 65437e9 | LOC-split; Figma rebuilt to v3 (d384303)                                  |
| 17  | confirmation          | Tier B       | b5e16bc | New alert ui prim                                                         |
| 18  | plan                  | Tier B       | fd21718 | New card ui prim; closed Tier B                                           |
| 19  | attachments           | Composer     | 0f9e385 | 3 variants (grid/inline/list); LOC-split into 2 files                     |
| 20  | agent                 | Coding-agent | a6f9012 | New accordion ui prim; 7 memo'd exports; composes CodeBlock               |
| 21  | queue                 | Coding-agent | 8afecba | 15 exports, LOC-split (queue + queue-item); zero new deps                 |
| 22  | checkpoint            | Coding-agent | 713f580 | Primitive tier, 62 LOC, 3 exports; zero new deps                          |
| 23  | package-info          | Coding-agent | b5348ea | 9 exports LOC-split; 5 change-type variants; zero new deps                |
| 24  | environment-variables | Coding-agent | d673bc1 | Visibility toggle, masked values, copy affordance; new switch prim        |
| 25  | test-results          | Coding-agent | 890da56 | Collapsible suite results, progress, status and error states; no new deps |
| 26  | file-tree             | Coding-agent | 77f560b | Controlled/uncontrolled hierarchy, selection, keyboard and workflow proof |
| 27  | schema-display        | Coding-agent | 486f813 | HTTP endpoint card, 5 method colors, 3-file split (471→162/90/133 LOC)    |

## 🎯 Queue (5) — coding-agent workspace

Ordered small→big so we know the new-dep surface before touching the heaviest primitives
(`terminal`, `sandbox`). Dep column reflects registry probe (2026-08-19).

| Loop | Component   | Cluster      | Rough scope  | New deps this loop                                                     |
| ---- | ----------- | ------------ | ------------ | ---------------------------------------------------------------------- |
| 28   | commit      | Coding-agent | medium       | shadcn `avatar` prim                                                   |
| 29   | stack-trace | Coding-agent | small–medium | npm `@radix-ui/react-use-controllable-state`                           |
| 30   | jsx-preview | Coding-agent | medium       | npm `react-jsx-parser`                                                 |
| 31   | terminal    | Coding-agent | medium       | npm `ansi-to-react` (NOT xterm.js — vendor uses ansi-to-react wrapper) |
| 32   | sandbox     | Coding-agent | large        | shadcn `tabs` prim; composes existing Tool                             |

**Not in queue anymore:** `controls` — registry probe (2026-08-19) revealed it is a wrapper around
`@xyflow/react`'s `Controls` (zoom/fit-view/lock buttons for a react-flow canvas), not a generic
button cluster. Moved to the flow-graph parked cluster below.

## 🌉 Stage-3 bridge (1)

- **conversation** — stick-to-bottom scroll container that assembles the 18 done primitives into a real
  transcript surface. Not a Stage-2 loop; queue for Stage-3 once the coding-agent cluster lands.

## 🧩 Folded (1)

- **shimmer** — `src/components/ai-elements/shimmer.tsx`. Landed with the reasoning loop and reused by
  task, chain-of-thought, plan. No dedicated loop needed.

## ⏸️ Parked — flow-graph (7)

Out of scope for the current transcript + coding-agent direction. Would bring `@xyflow/react` as a
heavyweight dep for the first component; the rest are cheap once installed.

- canvas
- connection
- controls (zoom/fit-view/lock buttons for a react-flow canvas)
- edge
- node
- panel
- toolbar

## ⏸️ Parked — voice/config (7)

Out of scope unless we take on voice/audio surfaces.

- audio-player
- mic-selector
- model-selector
- persona
- speech-input
- transcription
- voice-selector

## Alphabetical index (48)

Sorted alphabetically for lookup. Status column mirrors the sections above.

| Component             | Status    | Cluster      | Loop |
| --------------------- | --------- | ------------ | ---- |
| agent                 | ✅ done   | Coding-agent | 20   |
| artifact              | ✅ done   | Tier B       | 15   |
| attachments           | ✅ done   | Composer     | 19   |
| audio-player          | ⏸️ parked | Voice/config | —    |
| canvas                | ⏸️ parked | Flow-graph   | —    |
| chain-of-thought      | ✅ done   | Tier A       | 7    |
| checkpoint            | ✅ done   | Coding-agent | 22   |
| code-block            | ✅ done   | Tier A       | 3    |
| commit                | 🎯 queue  | Coding-agent | 28   |
| confirmation          | ✅ done   | Tier B       | 17   |
| connection            | ⏸️ parked | Flow-graph   | —    |
| context               | ✅ done   | Tier B       | 11   |
| controls              | ⏸️ parked | Flow-graph   | —    |
| conversation          | 🌉 bridge | Stage-3      | —    |
| edge                  | ⏸️ parked | Flow-graph   | —    |
| environment-variables | ✅ done   | Coding-agent | 24   |
| file-tree             | ✅ done   | Coding-agent | 26   |
| image                 | ✅ done   | Tier B       | 13   |
| inline-citation       | ✅ done   | Tier A       | 9    |
| jsx-preview           | 🎯 queue  | Coding-agent | 30   |
| message               | ✅ done   | Tier A       | 1    |
| mic-selector          | ⏸️ parked | Voice/config | —    |
| model-selector        | ⏸️ parked | Voice/config | —    |
| node                  | ⏸️ parked | Flow-graph   | —    |
| open-in-chat          | ✅ done   | Tier B       | 14   |
| package-info          | ✅ done   | Coding-agent | 23   |
| panel                 | ⏸️ parked | Flow-graph   | —    |
| persona               | ⏸️ parked | Voice/config | —    |
| plan                  | ✅ done   | Tier B       | 18   |
| prompt-input          | ✅ done   | Tier B       | 10   |
| queue                 | ✅ done   | Coding-agent | 21   |
| reasoning             | ✅ done   | Tier A       | 2    |
| sandbox               | 🎯 queue  | Coding-agent | 32   |
| schema-display        | ✅ done   | Coding-agent | 27   |
| shimmer               | 🧩 folded | Utility      | —    |
| snippet               | ✅ done   | Tier B       | 12   |
| sources               | ✅ done   | Tier A       | 5    |
| speech-input          | ⏸️ parked | Voice/config | —    |
| stack-trace           | 🎯 queue  | Coding-agent | 29   |
| suggestion            | ✅ done   | Tier A       | 8    |
| task                  | ✅ done   | Tier A       | 6    |
| terminal              | 🎯 queue  | Coding-agent | 31   |
| test-results          | ✅ done   | Coding-agent | 25   |
| tool                  | ✅ done   | Tier A       | 4    |
| toolbar               | ⏸️ parked | Flow-graph   | —    |
| transcription         | ⏸️ parked | Voice/config | —    |
| voice-selector        | ⏸️ parked | Voice/config | —    |
| web-preview           | ✅ done   | Tier B       | 16   |
