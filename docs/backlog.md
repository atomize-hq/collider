# Collider backlog

Current consumer operation is governed by the public ds-skills release contracts and
this repository's reviewed pin, not the superseded extraction task list. Historical backlog details remain in Git
at `3f5c8c024237dff8ffb73782c06337a75c001383`. Preserve the decisions below; remeasure
before implementation rather than treating old counts or CI observations as current.

## BL-1 — Preserve both Figma component-reference forms

Component specs contain both `fileKey#nodeId` and Figma web URLs. The decision is to
support both, not mass-normalize the stored values. A future parser should convert
colon/hyphen node separators at the boundary and reject malformed third grammars.
This is component-reference handling, not a publication-ledger requirement. Any
reusable parser/validator belongs to ds-skills; actual references stay in Collider.
Do not claim automated live-node or pixel-parity validation exists merely because
a spec carries a link.

## BL-2 — Current visual review remains an external gate

The historical rail did publish again: the prior record links run
[34248843764](https://github.com/atomize-hq/collider/actions/runs/34248843764) and build 23,
with 224 visual changes. That historical green job was not approval of those changes.
It is not evidence for today's branch.

The separation now uses installed Chromatic tooling, current-revision artifacts and
explicit blocking `component-review/ci` policy. Required current visual review,
credential/access validity and actual CI success still need live verification. Do
not restore committed stale review snapshots, automatically accept baselines, or
make a required job advisory to get a green result. Check snapshot budget before
publication; real changes require review by an authorized reviewer.

## BL-3 / BL-4 — Maintain the public consumer boundary

Reusable tooling and all skill authoring belong to ds-skills. Collider holds inputs,
pinned installed outputs, and thin invocations. The pin in `ds-skills.release.json`
is public operational authority only after its matching immutable tag/assets are
published and verified and the pin/core/custom installations are rebound to that
exact published identity. Until then, the staged pin and release-tagged links are
prospective, not public install targets. The original separation landed
with ds-skills v0.5.3 and Collider PR2; later upgrades must bind the actual immutable
published release record and pass current review, CI, and landing gates. See the
[consumer boundary](ds-skills-consumer.md). Do not restore a Git/SSH package
dependency, local resolver, or mirrored skill source.

## BL-5 — Remeasure the remaining application tooling typecheck gap

The old count of untyped design-system scripts is obsolete: that implementation
moved to ds-skills. Collider's remaining `scripts/validate-loc.mjs` is an
application-wide engineering guard; `scripts/token-runtime-compatibility-surface.json`
is data. Assess any separate JS typecheck need against actual remaining application
configuration/tooling. Do not recreate checks for deleted code or imply that product
ESLint/tests automatically provide full JS type coverage.

## BL-6 — Keep behavior tests independent of timing

Earlier sandbox coverage asserted against the loading DOM before syntax highlighting
settled; the fix waited for the intended state. The token-doc browser audit also had
an explicitly measured cost. Preserve meaningful whole-surface accessibility tests;
do not hide failures with broad timeouts or reduce axe scope for a green run. Any
future bounded rendering optimization needs its own coverage/evidence review.

## BL-7 — Coordinate syntax-highlighter dependency upgrades

Collider's CodeBlock and its Streamdown code plugin share syntax-highlighter types.
The direct shiki 3.x choice avoids the previously observed incompatible two-major
combination. Before raising it, inspect the actual lockfile and plugin's declared
range, then validate both renderers and a genuinely fresh typecheck. Do not force
the plugin outside its supported range just because an upstream installer selects
latest. This is application dependency work, not part of the separation release.
