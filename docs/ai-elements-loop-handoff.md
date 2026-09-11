# Collider component work: project inputs

The reusable loop is the installed
[Stage 2 skill](../.agents/skills/stage-2-component-roundtrip-loop/SKILL.md), not an
authored recipe maintained here. Use the installed
[library builder](../.agents/skills/library-component-builder/SKILL.md) and current
[curated conversation guidance](../.agents/skills/ds-curated-collider-conversation-ui/SKILL.md)
for the selected APIs. That guide covers Message, Reasoning and Tool, not every
module in the directory; curate additional selections before relying on them.

## Collider-owned inputs

- Source: `src/components/ai-elements/` and `src/components/ui/`.
- Ownership/deviations and accepted upstream evidence:
  [source inputs](../src/components/upstream-sources.md).
- Actual contracts: `storybook/component-specs/`, `storybook/story-inventory.json`
  and `storybook/component-tier-policy.json`.
- Work planning: [component inventory](ai-elements-inventory.md). Its historical
  counts are not current review or publication evidence.
- Figma component reference: `downstreamHooks.figmaComponentRef` in the relevant
  spec. Inspect that destination before changing it; preserve existing nodes/bindings.
- Token artifact and publication records: [Figma guidance](../src/figma/README.md).
  Do not insert component state into the token ledger.
- Readiness: [current consumer policy](stage1/sync-policy.md).

These are owned copies, not continuously overwritten vendor wrappers. Review
upstream acquisition explicitly; never run a registry install over edited source
merely because a historical handoff recommends it. UI remains presentational;
transport, privileged operations and canonical application models stay at the
application/native boundary. Do not create personal-memory files as a loop side effect.

Current app checks are in the [justfile](../justfile). Keep component/story changes
bounded; pass actual interactions in both themes and inspect the relevant visual
states. A local green result is not external visual approval or a completed release.
