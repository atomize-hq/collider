# Figma Sync Policy

This directory defines the v1 Figma sync posture for Collider.

## Canonical Source

- The repo remains the only canonical source of token values.
- `design-tokens/src/**` is the editable source tree.
- `design-tokens/dist/figma/tokens.json` is the only Figma-facing artifact.
- Figma consumes repo-approved values. It does not author canonical values in v1.

## V1 Transport

- The only supported v1 transport is `pull-url-readonly`.
- In this mode, Tokens Studio pulls `design-tokens/dist/figma/tokens.json` from a repo-hosted URL or equivalent published artifact path.
- No Figma write-back path, write credentials, or automation is configured in v1.
- Any future bidirectional sync requires an explicit policy override and a separate governance change.

## Theme Baseline

- The theme baseline comes from `design-tokens/src/tokens/themes/registry.json`.
- `dark` is the required imported theme baseline for v1.
- Omitted theme selection falls back to `dark`.
- Unknown theme IDs are contract errors and must not silently remap.

## Parity Posture

- `src/figma/parity-policy.md` is the canonical parity-policy document.
- `src/figma/sync-ledger.json` is the machine-readable status for the current branch.
- This README is operator guidance for the pull flow and pilot file, not a second source of parity policy.

## Operational Rules

- Treat plugin settings as a consumption detail, not a source-of-truth switch.
- Canonical token changes still go through repo PRs.
- Keep parity-branch decisions centralized in `src/figma/parity-policy.md` and link downstream docs there instead of duplicating branch logic.
