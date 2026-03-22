# Harness Completion — seam extraction

Source: `figma-ci-sync/target-state-harness.md`

This pack captures seam briefs, authoritative threading, pack-level review surfaces, seam-exit intent, and governance scaffolds. It is intentionally one level above seam-local decomposition.

- Start here: `scope_brief.md`
- Seam overview: `seam_map.md`
- Threading: `threading.md`
- Pack review surfaces: `review_surfaces.md`
- Governance: `governance/remediation-log.md`

Execution horizon:

- Active seam: `SEAM-13B` (exec-ready)
- Next seam: `SEAM-14B`

Policy:

- only SEAM-13B (active) is eligible for authoritative downstream sub-slices by default
- SEAM-14B (next) may receive seam-local review + slices once SEAM-13B lands, with only provisional candidate-subslice hints
- active and next seams must eventually terminate in a dedicated final `seam-exit-gate` slice once seam-local planning begins
- future seams remain seam briefs

## Upstream basis

This pack begins where `harness-future-rails` ended. SEAM-7B through SEAM-10B are landed and closed. SEAM-11B is now landed with proof verified at revision `2ee89e27306a1caa846d904ad6229370f371b1b3`, earning `D-publish-valid`. The remaining gap is between the repo's current posture (`D-publish-valid`, parity deferred) and the full Level E target defined in `figma-ci-sync/target-state-harness.md`.

## Scope summary

| Seam     | Purpose                                                        | Horizon |
| -------- | -------------------------------------------------------------- | ------- |
| SEAM-11B | Refresh live Figma publish proof for current artifact revision | landed  |
| SEAM-12B | Implement hardened OAuth/Variables API Figma rail              | landed  |
| SEAM-13B | Ratchet parity to required and complete promotion to Level E   | active  |
| SEAM-14B | Finalize harness target-state attestation and pack closeout    | next    |
