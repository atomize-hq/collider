# Current Collider documentation

This is the maintained entry point for Collider as a ds-skills consumer. The original
`docs/README.md` and `docs/session-handoff-2026-09-08.md` are protected user work:
kept byte-for-byte, not current execution authority. Their old links and instructions
may reference removed files; consult Git for that history, not for today's workflow.

## Consumer operation

- [Installed product and pin](ds-skills-consumer.md)
- [Selected libraries and generated custom skills](../design-system/README.md)
- [Owned sources, upstream evidence and refresh](../src/components/upstream-sources.md)
- [Readiness and publication boundaries](stage1/sync-policy.md)
- [Token publication](../src/figma/README.md) and [operator inputs](../src/figma/plugin-setup.md)
- [Foundations model and presentation](../figma/foundations/README.md)
- [Application architecture](stage1/architecture.md) and [native boundary](stage1/native-boundary.md)
- [Remaining backlog](backlog.md)

The installed [stack orchestrator](../.agents/skills/stack-orchestrator/SKILL.md)
owns workflow routing. The installed Stage 1/2/3, Storybook, curation and quality
skills own reusable directions. Collider owns project data, application code and
integration tests, not a second instruction pack or tool implementation.

## Design-system vocabulary

Use these names consistently across Collider code, Figma, and planning:

| Name                      | Code boundary                                     | Meaning                                                                                                                                                                                                                                         |
| ------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Foundations**           | `design-tokens/` and generated token integrations | Color, type, spacing, radius, motion, and other shared design foundations.                                                                                                                                                                      |
| **UI Primitives**         | `src/components/ui/*`                             | Collider-owned low-level controls such as Badge, Card, Select, and ButtonGroup. AI Elements and product surfaces may compose them. This is the Figma page formerly named **Atoms**.                                                             |
| **AI Elements Reference** | `src/components/ai-elements/*`                    | Collider-owned copies and adaptations seeded from the AI Elements examples. They are an executable reference catalog and composition input, not an upstream-synced product specification. This is the Figma page formerly named **Primitives**. |
| **Product Compositions**  | `src/features/*`                                  | Canonical Collider workflows assembled from owned components. Add this Figma page only when the first real product composition is ready; do not maintain an empty placeholder page.                                                             |

Reserve the unqualified term **primitive** for `src/components/ui/*` in Collider
design discussions. The Storybook `primitive`, `interactive`, and `workflow` labels
remain proof tiers; they are not Figma page names. Production behavior stays
authoritative in code, while Figma records the corresponding visual and composition
intent.

## Planning, not completion evidence

[Component inventory](ai-elements-inventory.md), [primitive migration context](shadcn-v4-migration-handoff.md)
and the remaining Stage 1 design plans preserve product intent. Old counts, branch
names and proposed APIs are historical observations; verify actual source/specs and
the current installed status before claiming readiness. No plan overrides AGENTS.md.
[Historical records](../archive/README.md) explains how to retrieve removed plans.

Normal cross-repository authority is the public ds-skills release contract and the
immutable release record selected by `ds-skills.release.json` only after the matching
tag/assets are published and verified and the pin/core/custom installations are
rebound to that exact published identity. Until then, a staged pin and its
release-tagged links are prospective, not public operational authority. Use the
[consumer boundary](ds-skills-consumer.md) for Collider's pin and integration inputs.
Restricted author history and audit provenance are not operational documentation and
must not be inferred to be published. A release candidate or local test does not prove
release, live verification, CI, or merge completion.
