# Harness Completion — seam extraction

Source: `figma-ci-sync/target-state-harness.md`

This pack captures seam briefs, authoritative threading, pack-level review surfaces, seam-exit intent, and governance scaffolds. It is intentionally one level above seam-local decomposition.

- Start here: `scope_brief.md`
- Seam overview: `seam_map.md`
- Threading: `threading.md`
- Pack review surfaces: `review_surfaces.md`
- Governance: `governance/remediation-log.md`

Execution horizon:

- Active seam: `SEAM-11B`
- Next seam: `SEAM-12B`

Policy:

- only the active seam is eligible for authoritative downstream sub-slices by default
- the next seam may later receive seam-local review + slices, and only provisional candidate-subslice hints
- active and next seams must eventually terminate in a dedicated final `seam-exit-gate` slice once seam-local planning begins
- future seams remain seam briefs

## Upstream basis

This pack begins where `harness-future-rails` ended. SEAM-7B through SEAM-10B are landed and closed. The remaining gap is between the repo's current Figma-side posture (`C-consumption-valid`, parity deferred, proof not-run) and the full Level E target defined in `figma-ci-sync/target-state-harness.md`.

## Scope summary

| Seam     | Purpose                                                        | Horizon |
| -------- | -------------------------------------------------------------- | ------- |
| SEAM-11B | Refresh live Figma publish proof for current artifact revision | active  |
| SEAM-12B | Implement hardened OAuth/Variables API Figma rail              | next    |
| SEAM-13B | Ratchet parity to required and complete promotion to Level E   | future  |
| SEAM-14B | Finalize harness target-state attestation and pack closeout    | future  |
