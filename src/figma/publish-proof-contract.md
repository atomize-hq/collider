# Collider publication record inputs

The proof/ledger schemas, validators and evaluation rules belong to the installed
ds-skills release. Collider supplies [validation vocabulary](validation-profile.json)
and actual records, not another schema or implementation.

`publish-proof.json` records the artifact path/revision, destination, actual attempted
publication outcome/time, and any temporary carrier use. Destination values must
match the configured Collider vocabulary. Do not copy a successful example and
change its timestamp; record only an observed attempt.

`sync-ledger.json` is version 3. Its `publication.proof` resolves the proof path and
`publication.sha256` pins the exact proof bytes. Artifact revision, mode, destination,
carrier usage and verification claims must agree with that proof. Preserve existing
attestations during extraction; an old successful attestation is not a new live run.

Run `pnpm validate:publish-proof`, `pnpm validate:sync-ledger` and
`pnpm validate:figma-parity` through the installed product. A malformed record,
wrong proof digest or contradictory claim must fail; unavailable tooling must not
be interpreted as a valid or empty result. Use [operator inputs](plugin-setup.md)
for an isolated proof attempt and [parity policy](parity-policy.md) for interpretation.
