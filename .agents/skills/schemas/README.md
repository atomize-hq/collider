# Schemas

Five JSON Schemas describing the artifacts this skill pack's workflow produces. They are the
portable half of the pack: the shapes travel to any repo, the values do not.

| Schema                                  | Artifact it describes                     | Collider's copy                                 |
| --------------------------------------- | ----------------------------------------- | ----------------------------------------------- |
| `storybook-version-policy.schema.json`  | The declared Storybook baseline           | `.storybook/storybook-version-policy.json`      |
| `storybook-tier-policy.schema.json`     | Which tiers exist and what each owes      | `storybook/component-tier-policy.json`          |
| `storybook-component-spec.schema.json`  | Per-component contract + design↔code link | `storybook/component-specs/<component-id>.json` |
| `storybook-story-inventory.schema.json` | Repo-wide registry of implemented stories | `storybook/story-inventory.json`                |
| `sync-ledger.schema.json`               | State of the token → Figma publish rail   | `src/figma/sync-ledger.json`                    |

## The portability contract

A schema here describes **shape**. Anything that is one repo's vocabulary is marked
`"x-repo-profile": "<name>"` and left deliberately loose — an open string, or an enum a repo is
expected to extend. `../profiles/collider.json` supplies Collider's values for those names.

```bash
# shape only — what any repo must satisfy
node ../scripts/validate-artifact.mjs sync-ledger.schema.json ../../../src/figma/sync-ledger.json

# shape + Collider's vocabulary
node ../scripts/validate-artifact.mjs sync-ledger.schema.json ../../../src/figma/sync-ledger.json \
  --profile ../profiles/collider.json
```

Current extension points:

| `x-repo-profile`      | Where                                  | What a new repo changes                 |
| --------------------- | -------------------------------------- | --------------------------------------- |
| `tier-policy`         | component spec `tier`                  | The tier names it uses                  |
| `tier-names`          | tier policy `tierOrder`                | Same list, machine-readable             |
| `consumer-ids`        | tier policy `consumerScope`            | How it names downstream consumers       |
| `generated-artifacts` | component spec `generatedArtifactRefs` | Its own set of generated proof surfaces |
| `artifact-path`       | ledger `artifact.path`                 | The artifact its publish rail moves     |
| `publish-modes`       | ledger `publish.mode`                  | The rails it actually has               |
| `promotion-levels`    | ledger `promotion.highestEarnedLevel`  | Its own promotion ladder                |

Porting the pack means writing a new file in `../profiles/`. It should not mean editing anything
in this directory.

## What these schemas do not check

Shape is not the whole contract. Rules that need more than one field, the filesystem, or another
file are documented in `description` here but enforced only by a repo's own validators:

- story-inventory `validatorKinds` must be in canonical `storyKind` order, and its set must equal
  the set of `implementedStoryRefs[].kind`
- component-spec `componentId` must equal the spec's filename stem
- component-spec `requiredStoryKinds` must be a superset of the tier policy's minimum for that tier
- every `storyId` in a spec must exist in the story inventory, and vice versa
- tier-policy `tiers` keys must match `tierOrder` exactly
- ledger `verification.lastVerifiedRevision` must equal `artifact.revision` to count as current

In Collider those live in `scripts/lib/*.mjs` with contract tests in `storybook/`, and they are
the authority. **These schemas are a second opinion, never the gate.** If one disagrees with a
repo validator, the repo validator is right and the schema needs updating.
