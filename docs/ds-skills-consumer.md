# Collider's installed ds-skills boundary

**Pin selection:** `ds-skills.release.json` records the selected release, full source
commit, and reviewed asset digests. It becomes public operational authority only
after the matching immutable tag and assets are published and verified, and the
consumer pin, core installation, and custom installation are rebound to that exact
published identity. An unpublished staged pin is prospective, not a public install
target. Do not substitute an ambient executable or sibling source checkout.

## Collider installation and checks

Collider is a consumer of the product runbooks; use the public ds-skills release
[installation contract](https://github.com/atomize-hq/ds-skills/blob/v0.5.4/src/project-host/README.md)
for first-trust bootstrap, platform-specific verification, upgrades, and recovery.
Release-tagged links are prospective until the same publication and rebinding
conditions above are satisfied. This document records only Collider's pin and
integration boundary.

- `just ds-skills-install` first runs the release-pinned core installation, then the
  separately accepted custom-curation installation for both discovery surfaces.
  It is explicit provisioning, not an implicit preflight action.
- `just ds-skills-check` verifies the sealed release, core managed project files,
  curation inputs, and installed custom assets. It does not acquire, repair, or
  silently upgrade anything.
- `DS_SKILLS_PREFIX` selects the installation location, not a release. CI provisions
  a job-local prefix before installed commands run. `DS_SKILLS_BASE_URL` may select a
  reviewed release mirror without changing the pin's bootstrap, payload, or manifest
  digest requirements.
- `.ds-skills/project.mjs` and files named by `.ds-skills/installation.json` are
  product-generated and receipt-checked. Commit them exactly as emitted; do not hand
  edit or format them. Their receipt covers both `.agents` and `.claude` discovery
  surfaces.
- Edited or unowned outputs are refused rather than overwritten. Review the diff,
  recover through the product's documented explicit upgrade path, then rerun both
  installation and checking. No tracked home-directory links are part of this setup.

The product owns skill instructions, schemas, templates, installation, resolution,
token tooling, and custom-curation generation. Collider owns project configuration,
application source, stories, recipes, tokens, and publication records. To change a
product contract, release ds-skills and adopt the resulting reviewed pin/output diff
here; do not recreate a local instruction tree.

## Custom curation provenance

Collider installs [two focused custom library skills](../design-system/README.md) from
pinned owned-source evidence. `curation-review.json` records an **independent,
exact-bundle source-evidence/citation refresh review** of bundle
`bba45037…`. It was not new runtime or example execution, Figma publication, final
CI, landing proof, or user approval. `just ds-skills-check` verifies both core and
custom discovery assets; verification does not expand that review's scope.

## Consumer-owned inputs and behavior

`ds-skills.project.json` selects Collider's token inputs, build outputs, runtime
checks, and publication evidence. `src/figma/validation-profile.json` contains
Collider's publication vocabulary; it is ordinary project data, not a skill asset.

`pnpm validate:tokens`, `pnpm build:tokens`, and `pnpm govern:tokens` invoke the
installed product. The configured governance checks preserve intrinsic recipe
validity, runtime/artifact checks, and existing publication attestations. A passing
local attestation check is **not** evidence of a new live Figma publication. Figma
build, serve, verification, ledger/proof, Storybook policy/proof, Chromatic, and
component-evidence commands use the same pinned launcher.

Foundations [model and presentation data](../figma/foundations/README.md) use the
installed build/check commands; no authored renderer or token tooling remains here.
Older extraction handoffs are historical only and do not authorize restoring local
installers, authored skill copies, or local token implementations. Normal operational
authority, once the publication and rebinding conditions above are satisfied, is
the public release contract, its immutable release record, and this consumer
pin—not restricted author history or audit records.
