---
slice_id: S2
seam_id: SEAM-7B
execution_horizon: active
status: exec-ready
plan_version: v1
basis_ref: seam.md#seam-brief-restated
threads:
  - THR-01
  - THR-04
  - THR-08
contracts_produced:
  - CT-9B
contracts_consumed:
  - CT-H1
  - CT-H2
open_remediations:
  - REM-001
---

### S2 — Pilot Proof Adoption

- **User/system value**: the contract stops being theoretical because one pilot reusable-component family proves that component specs, inventory entries, and proof-story ownership can work against real Storybook surfaces.
- **Scope (in/out)**:
  - **In**: selecting one pilot reusable-component family; authoring component specs for that family; registering its proof stories in the inventory; ensuring token docs, recipe docs, and runtime parity proofs are linked as generated artifacts instead of copied.
  - **Out**: broad backfill across every component; validator ratcheting to required CI failure; downstream mapping or visual-review publication.
- **Acceptance criteria**:
  - A pilot family has committed component-spec files and matching inventory entries.
  - The pilot family’s required proof kinds are implemented or explicitly marked missing by the new contract, not left ambiguous.
  - Proof stories continue to consume generated docs or parity artifacts instead of restating token or recipe values inside story files.
  - The pilot backfill reveals any schema or tier-policy gaps before the validator becomes required.
- **Dependencies**: `S1`; inherited `SEAM-4`; `CT-H1`; `CT-H2`; `THR-01`; `THR-04`; `THR-08`
- **Verification**: run the draft validator in informational mode on the pilot family; confirm each component spec resolves to actual story IDs and generated artifact refs; confirm reviewers can identify missing proof kinds from the pilot data set without prose.
- **Rollout/safety**: keep the pilot narrow enough for one PR series; prefer a family that exercises reusable-component identity plus at least one generated-doc proof surface and one behavior-oriented proof surface.
- **Review surface refs**: `review.md#r1--proof-contract-authoring-and-review-flow`, `review.md#r4--sequence-for-informational-to-required-gating`

#### S2.T1 — Select the pilot family and author component-spec records

- **Outcome**: one bounded reusable-component family becomes the proving ground for `CT-9B`.
- **Inputs/outputs**:
  - **Inputs**: `S1.T2`, current reusable-component Storybook stories, component exports, generated token or recipe docs used by that family
  - **Outputs**: committed pilot spec files under `storybook/component-specs/<component-id>.json`
- **Thread/contract refs**: consumes `CT-9B`; advances `THR-04`
- **Implementation notes**: choose a family that is representative but still small enough for one PR. The pilot should exercise stable component identity, tier classification, and at least one reserved downstream hook without requiring `SEAM-9B` to exist yet.
- **Acceptance criteria**:
  - Every component in the pilot family has a spec file with stable `componentId`, tier, required kinds, owned story refs, and generated artifact refs.
  - The pilot family does not rely on folder name inference or ad hoc reviewer knowledge to define identity.
  - The chosen family stays within `SEAM-7B` touch surfaces and does not require mapping or visual-review implementation to be considered complete.
- **Test notes**: review the pilot specs with one maintainer who did not author them and confirm they can identify the required proof set without opening the story source.
- **Risk/rollback notes**: choosing a family that is too large will bury schema feedback inside migration noise; re-scope to a smaller family if the first PR starts mixing unrelated story cleanup.

Checklist:

- Implement: pick the pilot family and author its component-spec records.
- Test: validate each pilot spec against the schema from `S1.T2`.
- Validate: confirm the pilot family exercises both generated-doc and behavior proof surfaces.
- Cleanup: note any schema gaps discovered during pilot authoring before broad rollout begins.

#### S2.T2 — Backfill inventory entries and proof-story references for the pilot

- **Outcome**: the pilot family appears in `storybook/story-inventory.json` with explicit proof-story coverage and generated artifact refs.
- **Inputs/outputs**:
  - **Inputs**: `S1.T1`, `S1.T3`, pilot component specs, current Storybook story IDs, generated token docs, generated recipe docs, runtime parity stories
  - **Outputs**: updated `storybook/story-inventory.json` plus any necessary pilot-story metadata changes under `storybook/stories/**`
- **Thread/contract refs**: consumes `CT-H1`, `CT-H2`, `CT-9B`; revalidates `THR-01`; advances `THR-08`
- **Implementation notes**: register proof coverage through references, not copied content. If a required proof kind is genuinely absent, leave it missing in a validator-visible way rather than hiding the gap in prose.
- **Acceptance criteria**:
  - Each pilot component resolves to concrete story refs or generated-doc refs for every required kind.
  - Generated token docs, recipe docs, and runtime parity proofs remain upstream artifacts and are only referenced from the inventory.
  - Any missing required proof kind is machine-visible in the inventory and validator output.
  - Story IDs and artifact refs are stable enough for later `SEAM-8B` selection logic to consume.
- **Test notes**: run the draft validator in informational mode and verify the pilot entries either pass or surface concrete missing-kind failures.
- **Risk/rollback notes**: avoid mass story renames in the same PR; if existing story IDs are too unstable, first add stable aliases or notes inside the seam-local contract rather than widening the pilot.

Checklist:

- Implement: register pilot coverage in the inventory and update any pilot story metadata needed to make refs stable.
- Test: run informational validation against the pilot entries and record every missing-kind failure.
- Validate: confirm all generated artifact refs remain references, not copied data.
- Cleanup: collect any unstable story-ID issues for follow-up before broad component backfill.
