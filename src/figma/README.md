# Figma Publish Rail Contract

This README is the live implementation-facing `CT-7B` contract for the repo-to-Figma rail in Collider.

## Canonical Source Boundary

- Canonical design-system meaning may be edited only in `design-tokens/src/tokens/**/*.tokens.json`, `design-tokens/src/tokens/themes/registry.json`, and `design-tokens/src/recipes/*.recipe.json`.
- Figma, Storybook, generated CSS, typed artifacts, and sync ledgers are downstream-only surfaces.
- No Figma write-back, plugin edit, or importer state may redefine canonical repo values.

## Approved Source Artifact

- `design-tokens/dist/figma/tokens.json` is the only approved source artifact for the repo-to-Figma rail.
- No alternate hand-maintained JSON source, plugin-exported snapshot, or Figma-originated value dump may replace or supplement this artifact as rail input.
- All rail proofs and hardened publish attempts must point back to this exact artifact path.

## Allowed Publish Modes

- `plugin-import-manual` is the default proof target. A plugin or importer materializes the approved artifact into a Figma file without manual value transcription.
- `rest-variables-oauth` is the only approved hardening target. A repo-owned OAuth app writes the same approved artifact through the Figma Variables REST API.
- `tokens-studio-carried` is allowed only as optional temporary carriage. If used, it still carries the approved artifact and does not become a required or terminal rail.

## Rail Rules

- `plugin-import-manual` may be used to prove the rail before the hardened path exists.
- `rest-variables-oauth` is the only target that may later support required parity or long-term deterministic automation.
- `tokens-studio-carried` must be treated as temporary and replaceable. It cannot become the permanent harness dependency.
- Any future bidirectional sync or alternate artifact boundary requires an explicit new planning decision.

## Theme Baseline

- The theme baseline remains derived from `design-tokens/src/tokens/themes/registry.json`.
- `dark` is the required proof baseline for the current pilot path.
- Omitted theme selection falls back to `dark`.
- Unknown theme IDs are contract errors and must not silently remap.

## Publish-Proof Handoff

- `src/figma/publish-proof-contract.md` defines the seam-owned publish-proof facts that `SEAM-6B` may later embed into `CT-8B`.
- This handoff owns publish semantics only: mode, artifact identity, artifact revision, destination file reference, materialization outcome, and temporary-carrier state.
- This README does not define the `CT-8B` ledger root keys or promotion ladder.

## Related Docs

- `src/figma/pilot-setup.md` is the operator runbook for the current proof walkthrough.
- `src/figma/parity-policy.md` records parity posture and downstream governance ownership boundaries.
- `src/figma/sync-ledger.json` remains legacy branch-local evidence until `SEAM-6B` replaces it with the `CT-8B` ledger contract.

## Operational Rules

- Treat plugin settings as consumption details, not as source-of-truth switches.
- Canonical token changes still go through repo PRs.
- Prefer a repo-owned or OSS-backed importer/plugin for `plugin-import-manual` proof work.
- Keep rail semantics centralized in this README and link here instead of restating `CT-7B` elsewhere.
