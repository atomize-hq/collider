# `SEAM-4` — App and Storybook Consumption

- Name: App and Storybook Consumption
- Type: platform
- Goal / user value: ensure the running app and Storybook both consume the same generated token artifacts, making design contracts visible in the two places engineers actually use them.

## Scope

- In: importing generated CSS into runtime and Storybook; token-doc visibility in Storybook; recipe visibility for pilot components; removal of hand-maintained token duplication.
- Out: token authoring; Figma sync transport; CI policy details.

## Primary Interfaces (Contracts)

- Inputs: generated CSS and typed outputs from `SEAM-3`; recipe metadata from `SEAM-2`.
- Outputs: stable imports in `src/app/globals.css` and `.storybook/preview.ts`; Storybook-visible token and recipe docs; runtime components that consume generated variables rather than redefining them.

## Key Invariants / Rules

- App and Storybook must render from the same generated values.
- Storybook is a contract surface, not a parallel source of token truth.
- Any token-doc addon or docs block must read generated artifacts, not bespoke JSON copies.

## Dependencies

- Blocks: `SEAM-6`
- Blocked by: `SEAM-2`, `SEAM-3`

## Touch Surface

- `src/app/globals.css`
- `.storybook/preview.ts`
- `.storybook/main.ts`
- `storybook/**`

## Verification

- The app boots with generated tokens through the existing CSS import path.
- Storybook renders the same baseline theme values as the app.
- A pilot story or docs surface makes at least one recipe visible and reviewable.

## Risks / Unknowns

- Risk: Storybook token documentation can drift into static prose if it is not wired directly to generated artifacts.
- De-risk plan: treat Storybook token docs as generated or artifact-backed and fail builds when they drift.

## Rollout / Safety

- Keep the import path stable where possible.
- Roll in Storybook token visibility before making recipe validation mandatory for all components.
