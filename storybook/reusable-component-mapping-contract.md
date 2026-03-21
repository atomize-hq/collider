# Reusable Component Mapping Contract

`storybook/reusable-component-mapping-contract.md` is the repo-owned `CT-11B` contract for reusable-component mapping and link metadata.

## Scope

- This document freezes the shared repo-owned mapping record that `SEAM-9B` projects into `storybook/connect/<component-id>.json` and `figma/code-connect/<component-id>.json`.
- This document defines field ownership, provenance, and provisional-nullability rules for `CT-11B`.
- This document also freezes the required shared top-level fields that every emitted mapping projection must preserve.
- This document does not authorize promotion policy. That remains in `SEAM-10B`.

## Shared Record Shape

`CT-11B` v1 is a shared repo-owned JSON object with exactly these top-level keys and no extras:

1. `mappingVersion`
2. `componentId`
3. `componentSpecPath`
4. `storyInventoryPath`
5. `proofCoveragePath`
6. `chromaticStatusPath`
7. `codeEntrypoint`
8. `figmaComponentRef`
9. `supportedVariantsSource`
10. `slotNamesSource`
11. `exampleStoryIds`
12. `supportedVariants`
13. `slotNames`
14. `implementedStoryIds`
15. `publishedStorybookUrl`
16. `publishedStorybookRevisionGitSha`
17. `publishedStorybookComponentIds`
18. `publishedStorybookStoryIds`
19. `storyLinkStatus`
20. `blockingFields`
21. `sources`

The initial `mappingVersion` is the literal string `"1"`.

Each emitted projection must preserve those same shared top-level fields and add:

- `projectionKind`
- one adapter namespace object: `storybook` for Storybook projections or `figma` for Figma projections

## Field Groups

### Identity And Repo Source Fields

| Field                 | Type / literal                              | Notes                                                                |
| --------------------- | ------------------------------------------- | -------------------------------------------------------------------- |
| `componentId`         | `string`                                    | Stable repo-owned reusable-component identity copied from `CT-9B`.   |
| `componentSpecPath`   | `"storybook/component-specs/<id>.json"`     | Fixed repo-relative source path for the `CT-9B` component spec.      |
| `storyInventoryPath`  | `"storybook/story-inventory.json"`          | Fixed repo-relative source path for the `CT-9B` story inventory.     |
| `proofCoveragePath`   | `"artifacts/storybook/proof-coverage.json"` | Fixed repo-relative source path for proof-coverage evidence.         |
| `chromaticStatusPath` | `"artifacts/chromatic/status.json"`         | Fixed repo-relative source path for the published `CT-10B` artifact. |

### Repo-Owned Mapping Fields

| Field                     | Type               | Notes                                                                           |
| ------------------------- | ------------------ | ------------------------------------------------------------------------------- |
| `codeEntrypoint`          | `string` or `null` | Repo-owned code entrypoint reference. Required key; may be provisional in `S1`. |
| `figmaComponentRef`       | `string` or `null` | Repo-owned Figma component reference. Required key; may be provisional in `S1`. |
| `supportedVariantsSource` | `string`           | Repo-relative source for supported variant definitions.                         |
| `slotNamesSource`         | `string`           | Repo-relative source for slot definitions.                                      |
| `exampleStoryIds`         | `string[]`         | Repo-owned Storybook story IDs used as mapping examples.                        |

### Shared Resolved Mapping Fields

| Field                 | Type       | Notes                                                                                 |
| --------------------- | ---------- | ------------------------------------------------------------------------------------- |
| `supportedVariants`   | `object[]` | Repo-owned supported variant payload resolved from `supportedVariantsSource`.         |
| `slotNames`           | `string[]` | Repo-owned slot list resolved from `slotNamesSource`.                                 |
| `implementedStoryIds` | `string[]` | Repo-owned implemented Storybook story IDs copied from the current `CT-9B` inventory. |

### `CT-10B`-Derived Storybook Link Fields

| Field                              | Type                 | Notes                                                                                                       |
| ---------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `publishedStorybookUrl`            | `string` or `null`   | Derived only from `CT-10B` `build.url`. Required key; may be provisional in `S1`.                           |
| `publishedStorybookRevisionGitSha` | `string` or `null`   | Derived only from `CT-10B` `revision.gitSha`. Required key; may be provisional in `S1`.                     |
| `publishedStorybookComponentIds`   | `string[]` or `null` | Derived only from `CT-10B` `proofInventory.selectedComponentIds`. Required key; may be provisional in `S1`. |
| `publishedStorybookStoryIds`       | `string[]` or `null` | Derived only from `CT-10B` `proofInventory.selectedStoryIds`. Required key; may be provisional in `S1`.     |

### Conformance And Provenance Fields

| Field             | Type       | Notes                                                                                   |
| ----------------- | ---------- | --------------------------------------------------------------------------------------- |
| `storyLinkStatus` | `string`   | Repo-owned classification of the current Storybook link provenance.                     |
| `blockingFields`  | `string[]` | Repo-owned completeness blockers. Empty means the mapping is structurally complete.     |
| `sources`         | `object`   | Repo-owned manifest of the source paths and source references used to build the record. |

## Field Origins And Allowed Inputs

| `CT-11B` field(s)                  | Source                  | Rule                                                                         |
| ---------------------------------- | ----------------------- | ---------------------------------------------------------------------------- |
| `componentId`                      | `CT-9B` component spec  | Must equal `storybook/component-specs/<component-id>.json` `componentId`.    |
| `componentSpecPath`                | Repo-owned path         | Must point at the matching `CT-9B` component spec location.                  |
| `storyInventoryPath`               | Repo-owned path         | Must remain `"storybook/story-inventory.json"`.                              |
| `proofCoveragePath`                | Repo-owned path         | Must remain `"artifacts/storybook/proof-coverage.json"`.                     |
| `chromaticStatusPath`              | Repo-owned path         | Must remain `"artifacts/chromatic/status.json"`.                             |
| `codeEntrypoint`                   | `CT-9B` downstream hook | Carries the repo-owned code entrypoint reference without renaming the field. |
| `figmaComponentRef`                | `CT-9B` downstream hook | Carries the repo-owned Figma reference without renaming the field.           |
| `supportedVariantsSource`          | `CT-9B` downstream hook | Carries the repo-owned variant source without renaming the field.            |
| `slotNamesSource`                  | `CT-9B` downstream hook | Carries the repo-owned slot source without renaming the field.               |
| `exampleStoryIds`                  | `CT-9B` downstream hook | Carries the repo-owned example story IDs without renaming the field.         |
| `supportedVariants`                | Repo-owned resolution   | Must be resolved from `supportedVariantsSource`, not from vendor payloads.   |
| `slotNames`                        | Repo-owned resolution   | Must be resolved from `slotNamesSource`, not from vendor payloads.           |
| `implementedStoryIds`              | `CT-9B` story inventory | Must come from the current repo-owned story inventory.                       |
| `publishedStorybookUrl`            | `CT-10B`                | May be derived only from `build.url`.                                        |
| `publishedStorybookRevisionGitSha` | `CT-10B`                | May be derived only from `revision.gitSha`.                                  |
| `publishedStorybookComponentIds`   | `CT-10B`                | May be derived only from `proofInventory.selectedComponentIds`.              |
| `publishedStorybookStoryIds`       | `CT-10B`                | May be derived only from `proofInventory.selectedStoryIds`.                  |
| `storyLinkStatus`                  | Repo-owned evaluation   | Must be derived from repo-owned `CT-10B` validation and scope checks.        |
| `blockingFields`                   | Repo-owned evaluation   | Must be derived from the repo-owned completeness checks over this record.    |
| `sources`                          | Repo-owned manifest     | Must enumerate repo-owned source paths and source refs only.                 |

`SEAM-9B` may consume only these `CT-10B` fields for Storybook-link derivation:

- `build.url`
- `revision.gitSha`
- `proofInventory.selectedComponentIds`
- `proofInventory.selectedStoryIds`

No other `CT-10B` field may be copied into `CT-11B`.

## Provenance And Provisional Nullability Rules

- Every key listed in the shared record shape is required. Missing required keys are invalid.
- `codeEntrypoint`, `figmaComponentRef`, `publishedStorybookUrl`, `publishedStorybookRevisionGitSha`, `publishedStorybookComponentIds`, and `publishedStorybookStoryIds` are the only provisional-nullable fields in `S1`.
- A provisional-nullable field may be `null` only when the record is explicitly incomplete and the missing value has not yet been authored or derived through the repo-owned source contract.
- `supportedVariantsSource`, `slotNamesSource`, `exampleStoryIds`, `supportedVariants`, `slotNames`, `implementedStoryIds`, `storyLinkStatus`, `blockingFields`, and `sources` are required and may not be `null`.
- `componentId` and all repo source path fields are required and may not be `null`.
- A record that omits a required key is invalid even if the missing field would otherwise be provisional-nullable.

## Invalid Inputs And Forbidden Truth Sources

- Vendor-native IDs are never primary identity and may not appear as independent source-of-truth fields in `CT-11B`.
- Vendor URLs, host conventions, local preview URLs, and hand-authored Storybook links are forbidden as link sources. `publishedStorybookUrl` may come only from published `CT-10B`.
- Vendor payloads may not redefine `supportedVariants`, `slotNames`, `implementedStoryIds`, `storyLinkStatus`, `blockingFields`, or `sources`.
- Vendor metadata may not redefine `componentId`, supported variants, slot names, example stories, code entrypoints, or Figma component references.
- Extra top-level keys are invalid until a future contract version publishes them explicitly.

## Compatibility Rule

Future vendor-specific projection formats may evolve, but the repo-owned identity, mapping, and Storybook-link field names above must remain stable enough that downstream promotion can consume `CT-11B` without tool-specific parsing. If `SEAM-9B` must rename or reinterpret any existing key, bump `mappingVersion` instead of mutating the current `CT-11B` shape in place.

Any shared top-level field change must be implemented atomically across this contract, `scripts/lib/reusable-component-mapping-contract.mjs`, `scripts/lib/component-mapping.mjs`, `scripts/lib/reusable-component-mapping-validator.mjs`, the reusable-component-mapping fixtures, and the affected tests.
