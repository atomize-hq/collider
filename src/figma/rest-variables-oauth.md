# OAuth Variables API Hardening Contract

> Historical path note: this document remains at `rest-variables-oauth.md`, but the canonical hardened mode string is `oauth-variables-api`.

This document defines the only approved long-term hardening target for the repo-to-Figma rail in Collider. It constrains how `SEAM-5B` may move beyond proof-only materialization without taking ownership of downstream `CT-8B` promotion or ledger policy.

## Approved Rail

- The hardening target is exactly `oauth-variables-api`.
- The source artifact remains exactly `design-tokens/dist/figma/tokens.json`.
- The transport is a repo-owned OAuth app writing approved variables through the Figma Variables REST API.
- No personal access token, designer-owned app, or user-provided credential may be treated as the hardened rail.

## Ownership And Tenancy

- The OAuth app must be owned and administered as shared repo/team infrastructure, not as an individual maintainer convenience.
- The destination must be a shared or team-owned Figma target. Personal sandbox files may be used only for isolated experiments and do not satisfy this contract.
- The active destination must always be identified in the publish proof for the attempt under review.
- Concrete file IDs, team IDs, and runtime secrets stay in runtime configuration or operator context. They do not become committed policy constants in this doc.

## Access Prerequisites

- Enterprise Figma support must be available for the destination tenancy.
- The shared app operator must have edit access to the destination file.
- The hardening rail must use an explicit shared app-owner model rather than unmanaged per-user credentials.
- The rail stays declarative until owned credentials and destination access actually exist.
- Runtime access tokens come from `FIGMA_OAUTH_ACCESS_TOKEN`; `src/figma/oauth-config.json` documents the non-secret credential model and required scopes.

## Required OAuth Scopes

- `file_variables:write` is required for the write path.
- `file_variables:read` is required for deterministic read-back and verification of the write attempt.
- If Figma changes scope names later, update this contract explicitly rather than silently broadening access expectations in implementation notes.

## Success Markers

- The attempt authenticates through the shared OAuth app rather than a personal or ad hoc credential.
- The attempt records an explicit destination file reference for the target under review.
- The attempt records the current artifact revision from `design-tokens/dist/figma/tokens.json`.
- The write path completes without manual value transcription or Figma-originated value edits becoming canonical.
- Deterministic completion evidence exists for the rail attempt, including a successful write outcome and read-back-capable verification path for the same destination.

## Publish-Proof Alignment

- Hardened attempts must reuse the seam-owned publish-proof contract in [`src/figma/publish-proof-contract.md`](./publish-proof-contract.md).
- For a hardened attempt, `mode` must be `oauth-variables-api`.
- Hardened attempts must keep `carrier.used=false`. If Tokens Studio is involved at all, the attempt falls under the carrier exception policy instead of the hardened rail.
- This contract constrains publish-proof values and ownership expectations only. It does not add a second schema surface.

## Non-Goals

- This document does not define `CT-8B` root keys, ledger ownership, promotion thresholds, or merge-gate behavior.
- This document does not implement the OAuth app, destination provisioning, or automated publish code.
- This document does not authorize bidirectional sync or any write-back path from Figma into canonical repo sources.
