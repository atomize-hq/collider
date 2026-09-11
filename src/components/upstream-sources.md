# Collider's upstream evidence and owned components

Collider owns its copied components and local splits. Captured upstream sources are
comparison/curation inputs, not instructions to overwrite those components.

- `upstream-registries.json` explicitly selects the registry endpoints, items and
  license documents. Version labels describe an observation, not verified npm versions.
- `upstream-evidence.json` retains exact payload, index and license bytes plus hashes.
  Its SHA-256 pin is in the root `ds-skills.project.json`. Do not format this file.
- `upstream-ownership.json` maps actual copied files and the 30 explicit local splits
  to source items. `migration-target` still means a comparison target: the primitive
  sources are not claimed to have completed the newer-style migration. `current-source`
  identifies the acquisition lineage, not continuous upstream ownership or parity.
- `upstream-policy.json` is Collider's chosen invariants/deviations/API obligations.
  The installed product evaluates those rules and the configured source import/slot
  contract. Application typechecks and browser tests remain separate obligations.

All 23 primitive source items and 33 AI Elements source items are captured. Their
56 payload digests match the former baseline; the richer snapshot now preserves the
bytes themselves, full file paths, dependency declarations, licenses and observed
index membership. This is not a three-component demonstration or a new adoption.

## Explicit refresh

1. Review changes to selections, endpoints and any owned-file provenance.
2. `pnpm baseline:upstream` explicitly captures a candidate under
   `.codex-artifacts/upstream/candidate.json`. It does not accept or install it.
3. `pnpm baseline:upstream:diff` compares that candidate against accepted evidence
   without another network request. Review the sources, metadata, licenses and diff.
4. After approval, copy exact candidate bytes to `upstream-evidence.json` and update
   its SHA-256 in `ds-skills.project.json` together. Run
   `pnpm baseline:upstream:check`, the source checks and applicable app tests.

`pnpm baseline:upstream:check` is offline and required by `just check` and CI. It
verifies the accepted pin and current selection, **not current remote freshness**.
Capture failure or missing index membership does not establish upstream deletion.
No source scripts, dependency installers, implicit registry traversal or application
rewrites occur. `--dry-run` is not supported: capture already writes only a candidate;
use the separate diff command to inspect it.

`pnpm validate:consumer-contract --json` reports actual selected imports and literal
slot ownership. `just check-contract` is now enforced in `just check`. The Select
trigger slot has been repaired, with dark/light browser tests proving the ButtonGroup
trailing corners; no other Select migration or unrelated component redesign is implied.
These checks establish neither recipe eligibility nor Figma publication/readiness.

Product command semantics, supported source syntax and acquisition limits belong to
ds-skills. This document records only Collider's inputs and invocation policy.
