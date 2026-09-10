# Collider component specs

These JSON files are consumer-owned contracts for actual component source and story
references. `ds-skills.project.json` selects this directory, the story inventory and
tier policy. Structural validation, reference checks and coverage generation belong
to the installed ds-skills release; there are no local seam-owned validators.

Use `pnpm govern:storybook-proof` and the installed
[Storybook workflow](../../.agents/skills/storybook-rigorous-spec-system/SKILL.md).
A spec's Figma node reference is distinct from token publication. Static coverage
is not executed interaction testing or current visual approval; see
[component evidence](../reusable-component-promotion-contract.md).
