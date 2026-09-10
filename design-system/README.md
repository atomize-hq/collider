# Collider's curated library inputs and installed outputs

The installed ds-skills workflow generated two project-specific skills:

- `ds-curated-collider-owned-primitives`: eight selected exports from the owned
  Button, Badge, Select and ButtonGroup modules.
- `ds-curated-collider-conversation-ui`: fourteen selected exports from the owned
  Message, Reasoning and Tool modules.

This is an explicit selection, not guidance for every API in either catalog. The
newer upstream primitive snapshot remains a migration target; it is not the source
of truth for these owned copies. No Plate/editor dependency is invented.

## Data and ownership

`libraries.json` selects actual local source/stories, manifest/convention evidence,
license notices, deviations and library relationships. Source versions are explicit
observation labels; immutable identity is the captured file digests. Content revision
mode avoids requiring historical Git objects in a shallow CI checkout. The evidence
was captured from the actual owned files, not obtained by executing source commands.

`library-evidence.json` is the accepted exact-byte evidence packet. `curation.json`
is the project-specific output of the product-owned agent curation workflow:
reviewable prose, worked examples, selected API references and source citations.
It is not another hand-maintained core skill implementation. `curation-bundle.json`
is the deterministic accepted output; `curation-review.json` records **author
self-review**, not independent or user approval. All four pins belong to the root
`ds-skills.project.json`; never format the sealed evidence/bundle files.

The product owns curation instructions, validators, rendering and installation.
To change project guidance, rerun that workflow against current selected evidence,
review the resulting bundle, update exact accepted/review pins, and explicitly
install. Never edit the generated `.agents` or `.claude` copies directly, and never
put Collider vocabulary in the shared installed product release.

## Refresh and checks

Use `node .ds-skills/project.mjs` with `--config ds-skills.project.json`:

1. `libraries evidence capture`, `libraries evidence diff`: explicitly collect and
   review changed sources before copying/pinning the accepted evidence.
2. Curate/update the project draft using the installed `curate-component-libraries`
   skill. `curation validate`, `curation build`, `curation diff` are deterministic
   structure/provenance checks—not a model call or semantic approval.
3. Typecheck/run the worked examples in an isolated real consumer. Review all prose,
   examples, citations, ownership and limitations. Record the real reviewer and
   exact accepted/review bytes; self-review must never impersonate independence.
4. `curation check`, `curation install`, `curation installed check`: accept only
   current evidence and install/check both discovery surfaces through the product.

`just ds-skills-check` now checks both core and custom assets without acquisition;
`just check` includes it, so preflight and the existing CI Quality job enforce it.
Edited outputs are refused, not overwritten. Missing owned output requires explicit
installation. A source change invalidates its dependent guidance until reviewed.

Both worked examples have been typechecked and run in actual dark/light Storybook
cases in an isolated Collider checkout, including labeled action callbacks, Select
interaction, Reasoning disclosure and Tool status/result display. The examples were
read back from installed guidance before a second successful run. No production
component or story was changed to make this proof pass.

The published v0.5.2 pin and installed core/custom integrity checks are verified.
Those checks do not establish component readiness or satisfy repository review, CI,
and landing requirements. Curated skill approval
is not recipe validity, component readiness, visual review or Figma publication.
