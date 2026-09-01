# Foundations page builders

Generates the **Foundations** page in the Collider Figma file (`23PLdynlRYoBYQx9teoC8A`)
from `design-tokens/dist/figma/tokens.json`.

## Why this is generated

The page is a _specimen_ surface, not a static mockup. Swatches, type samples and
scale bars are **variable-bound**, so they follow Figma's mode switcher for free.
But names, hex values and contrast ratios are baked as static text — **a contrast
ratio cannot be variable-bound**, so both modes are printed side by side.

That means the page goes stale the moment a token value changes. Regenerating is
cheap; hand-maintaining 176 annotated rows is not.

## Usage

```
pnpm build:tokens            # artifact must be current
pnpm figma:foundations:build # writes build/foundations/*.run.js
```

Then, with Figma open on the remote-debug port
(`open -a Figma --args --remote-debugging-port=9222`):

```
figma-use eval --json --timeout 180000 "$(cat build/foundations/color.run.js)"
figma-use eval --json --timeout 180000 "$(cat build/foundations/type.run.js)"
figma-use eval --json --timeout 180000 "$(cat build/foundations/rest.run.js)"
```

Each run is **idempotent** — `shell()` removes any existing frame of the same
name before rebuilding, so re-running replaces rather than duplicates.

## Files

| File             | Builds                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `lib-frame.js`   | Shared helpers — `frame`, `txt`, `shell`, `section`, `bindFill`/`bindStroke`. Injected into each builder as `__LIB__`. |
| `build-color.js` | `Foundations · Colour`                                                                                                 |
| `build-type.js`  | `Foundations · Type`                                                                                                   |
| `build-rest.js`  | `Space & Shape`, `Elevation`, `Motion`, `Layout`                                                                       |

## Gotchas worth keeping

- **`figma-use eval` resolves a returned promise.** Top-level `await` breaks the
  bridge, but `return Promise.all([...]).then(...)` works — which is the only way
  to `loadFontAsync` before creating text.
- **Width is the primary axis for a horizontal frame, the counter axis for a
  vertical one.** Pinning the wrong one fixes the _height_ and locks every row to
  Figma's default 100px.
- **Wipe by the same name you create.** The wipe used to live in each builder and
  drifted from `shell()` (`Color` vs `Colour`), silently leaving a duplicate.
- Elevation tokens are CSS strings, not Figma effect variables, so those cards
  carry a hand-parsed effect and do **not** follow the mode switcher. The frame
  says so on its face.
- **A parser that returns `null` on failure hides a total failure.** The first
  shadow regex required a literal `p` on the x offset, but every elevation token
  starts with a bare `0`, so nothing matched — and the `null` path meant all ten
  cards shipped with no effect and no error. `parseShadow` now throws on
  unparsable input, and the builder asserts that every non-`none` token produced
  a shadow before it returns.
- **A shadow paints outside its node's box, and a Figma frame clips by default.**
  Once the effects rendered, the row hugged the card exactly and sheared off
  everything past level/1. Each card sits in a `stage` padded by the furthest
  reach of any elevation token — `blur + spread ± offset`, measured from the
  tokens rather than guessed. Keep that padding **symmetric on the vertical**: a
  shadow reaches further below than above, and padding each side to its exact
  reach pushes the card off the row's centre and leaves every label 12px low.
