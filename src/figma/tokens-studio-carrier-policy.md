# Tokens Studio Carrier Policy

This document defines the only allowed exception path for Tokens Studio within `SEAM-5B`. Tokens Studio may temporarily carry the repo-approved artifact, but it is never the canonical source, the permanent rail, or the hardening target.

## Entry Rule

- Tokens Studio may be used only when it carries the approved artifact from `design-tokens/dist/figma/tokens.json`.
- Tokens Studio usage is allowed only as an exception path when `plugin-import-manual` or `rest-variables-oauth` is not yet sufficient for the target under review.
- The exception does not change the approved artifact boundary, the downstream-only rule, or the long-term hardening target.

## Recording Rule

- Every carrier-assisted attempt must reuse the seam-owned publish-proof contract in [`src/figma/publish-proof-contract.md`](./publish-proof-contract.md).
- Carrier-assisted attempts must record `mode` as `tokens-studio-carried`.
- Carrier-assisted attempts must set `carrier.used=true`.
- Carrier-assisted attempts must fill `carrier.reason` with the exact blocker that required temporary carriage.
- Carrier-assisted attempts must fill `carrier.exitExpectation` with the concrete retirement path back to `plugin-import-manual` or forward to `rest-variables-oauth`.

## Exit Rule

- Carrier usage must be retired once `plugin-import-manual` can satisfy the same target without the carrier.
- Carrier usage must also be retired once `rest-variables-oauth` can satisfy the same target as the hardened path.
- Repeated carrier usage without an updated exit expectation is policy drift and must be treated as unresolved exception debt.

## Forbidden Interpretations

- Tokens Studio cannot become the canonical source of token meaning.
- Tokens Studio cannot become the terminal publish mode for this seam.
- Tokens Studio cannot become a required steady-state dependency for publish validity or parity.
- Tokens Studio cannot, by itself, justify required parity or promotion-safe automation.

## Relationship To Proof And Hardening

- `tokens-studio-carried` may support proof-only materialization while parity remains deferred.
- `tokens-studio-carried` does not replace `plugin-import-manual` as the default proof rail.
- `tokens-studio-carried` does not replace `rest-variables-oauth` as the only approved hardening target.
