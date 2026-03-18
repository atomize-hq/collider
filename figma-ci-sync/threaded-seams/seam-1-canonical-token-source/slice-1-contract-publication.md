### S1 — Contract Publication

- **Audit result**: decomposed. The original slice bundled three contract-publication concerns and at least six planned deliverable files (`core`, `semantic`, `motion`, `themes/dark`, `README.md`, `themes/registry.json`), which pushes it past the single-session budget for this seam.
- **Archived original**: `archive/slice-1-contract-publication.md`
- **Sub-slice directory**: `slice-1-contract-publication/`

#### Sub-slices

- `slice-1-contract-publication/subslice-1-canonical-token-tree-scaffold.md`
  Create the concrete `CT-1` file tree and representative family files. Covers original `S1.T1`.
- `slice-1-contract-publication/subslice-2-token-id-and-family-rules.md`
  Publish stable token-ID grammar, family ownership rules, and CSS-variable trace examples. Covers original `S1.T2`.
- `slice-1-contract-publication/subslice-3-theme-registry-contract.md`
  Publish the file-backed `CT-2` theme registry and `dark` fallback semantics. Covers original `S1.T3`.

#### Sequencing

- `S1a` should land first so the canonical file tree exists before policy docs point at it.
- `S1b` and `S1c` can proceed once `S1a` is in place, because they publish distinct contract surfaces under the same token root.
