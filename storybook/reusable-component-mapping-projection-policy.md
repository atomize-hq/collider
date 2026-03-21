# Reusable Component Mapping Projection Policy

`storybook/reusable-component-mapping-projection-policy.md` is the repo-owned projection policy for `CT-11B`.

## Shared Intermediate Boundary

- `CT-11B` is the only allowed shared intermediate boundary for `SEAM-9B`.
- The same shared record must feed both declared output surfaces:
  - `storybook/connect/<component-id>.json`
  - `figma/code-connect/<component-id>.json`
- The same shared top-level field set must be preserved verbatim in both output surfaces.
- Output adapters may add only `projectionKind` and one consumer namespace object (`storybook` or `figma`) on top of the shared top-level fields.
- Output adapters may reshape the shared record for consumer convenience, but they may not create new identity semantics, new provenance rules, or new link-derivation rules.

## Identity Preservation Rules

- Both output surfaces must preserve the same `componentId`.
- Both output surfaces must preserve the same repo-owned example references from `exampleStoryIds`.
- Both output surfaces must preserve the same repo-owned variant and slot sources from `supportedVariantsSource` and `slotNamesSource`.
- Both output surfaces must preserve the same Storybook-link provenance semantics: any published Storybook URL or reviewed proof scope must trace back to the allowed `CT-10B` fields named in `storybook/reusable-component-mapping-contract.md`.

## Adapter Boundary Rules

- Storybook and Figma adapters may change field arrangement, nesting, or consumer-facing labels only at the adapter edge.
- Storybook and Figma adapters may not change, drop, or rename shared top-level fields carried by `CT-11B`.
- Adapters may not rename the repo-owned identity concepts carried by `componentId`, `codeEntrypoint`, `figmaComponentRef`, `supportedVariantsSource`, `slotNamesSource`, or `exampleStoryIds`.
- Adapters may not infer missing code entrypoints, Figma refs, supported variants, slot names, or example story IDs from vendor metadata.
- Adapters may not derive Storybook URLs from host conventions, local URLs, vendor UI, or prose summaries. Storybook-link fields may come only from published `CT-10B`.
- Any shared top-level field change must update the contract module, generator, validator, fixtures, and both output adapters in one change.

## Incomplete-State Rules

- If a required `CT-11B` field remains provisional-nullable, the shared record stays incomplete instead of inventing a fallback value.
- Output adapters must preserve unresolved values as unresolved; they may not convert `null` Storybook-link fields into guessed URLs or guessed review scope IDs.
- `S1` declares output surfaces only. No generated `storybook/connect/**` or `figma/code-connect/**` records are published in this slice.

## Consumer Boundary

- Downstream consumers must reason from repo-owned `CT-11B` fields, not from vendor-specific payloads.
- `SEAM-10B` may later consume mapping completeness only after `CT-11B` records are published and inspected through the repo-owned boundary.
