# Collider's installed ds-skills boundary

Status: local separation candidate; public release and final landing pending.

Collider pins the product in `ds-skills.release.json`. The current
`v0.0.0-p8-stream` candidate was independently acquired and verified locally;
it is **not available as a public GitHub release**. A fresh machine needs an
operator-provided verified release mirror until the final pin is published.
Do not substitute an ambient executable or a sibling source checkout.

## Installation and checking

- `just ds-skills-install` invokes the product-generated launcher with `--install`.
  Acquisition is explicit; the pin's bootstrap, payload and manifest digests remain
  authoritative, including when `DS_SKILLS_BASE_URL` selects a release mirror.
- `just ds-skills-check` checks the installed release and all managed project files.
  It does not acquire, repair, or silently upgrade anything.
- `DS_SKILLS_PREFIX` selects an installation location, not a different release.
  CI explicitly provisions a job-local prefix before installed commands run.
- `.ds-skills/project.mjs` and the files listed in `.ds-skills/installation.json`
  are product-generated outputs. Commit them without hand-editing or formatting.
  Their receipt checks both `.agents` and `.claude` discovery surfaces.
- Edited or unowned outputs are refused rather than overwritten. Review and resolve
  such changes before an explicit upgrade. No tracked home-directory links remain.

The product owns skill instructions, examples, schemas, templates, installation,
resolution and token tooling. To change them, change and release ds-skills, then
review the resulting pin and installed-output diff here. Custom library guidance
also belongs to the product's curation workflow, not manually authored skill trees.

## Consumer-owned inputs and behavior

`ds-skills.project.json` selects Collider's token inputs, build outputs, runtime
checks and publication evidence. `src/figma/validation-profile.json` contains
Collider's publication vocabulary; it is ordinary project data, not a skill asset.
Application components, stories, recipes, tokens and publication records stay here.

`pnpm validate:tokens`, `pnpm build:tokens` and `pnpm govern:tokens` now invoke the
installed product. The nine configured governance checks preserve intrinsic recipe
validity, runtime/artifact checks and the existing publication attestations. A
passing local attestation check is **not** evidence of a new live Figma publication.
Figma build, serve, verification and ledger/proof commands use the same launcher.

Storybook policy/proof, Chromatic and component-evidence commands also use the
installed product. Review outputs are no longer committed stale snapshots; absent
current visual review blocks the explicit CI policy. Source-policy, upstream
baseline and foundations callers are still being cut over. Older extraction
handoffs are not authority to restore local installers, authored skill copies or
local token implementations. The full cross-repository scope and evidence live in
the ds-skills repository's `docs/ds-skills-separation-scope.md` and adjacent progress
record. This checkpoint does not claim that the entire separation is complete.
