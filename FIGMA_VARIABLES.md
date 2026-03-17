# Figma Variables & Styles Setup

## Context

The Primitives canvas (`401:1042`) on the **Primitives** page is the visual token reference for the Collider design system. It contains color swatches and typography definitions that are currently hardcoded into components. This work converts those into proper Figma variables and text styles so that:

- Component fills/strokes/text colors reference variables (change once, update everywhere)
- The Primitives canvas itself becomes the live source of truth (swatch rectangles bound to their own variables)
- Future theming or token-level changes require editing variables only, not hunting through components

---

## Step 1 — Create Color Variables

**Goal:** Create a `Colors` variable collection with two groups matching the Primitives canvas sections.

### Variable Collection: `Colors`

**Group: `Background`**
| Variable name | Value |
|---|---|
| `Background/base` | `#171717` |
| `Background/surface` | `#202020` |
| `Background/elevated` | `#2A2A2A` |
| `Background/overlay` | `#303030` |
| `Background/white-10` | `#111111` *(represents rgba(white,.1))* |

**Group: `Text`**
| Variable name | Value |
|---|---|
| `Text/primary` | `#FFFFFF` |
| `Text/secondary` | `#6A7282` |
| `Text/tertiary` | `#B0BAC8` |
| `Text/white-30` | `#333333` *(represents rgba(white,.3))* |
| `Text/success` | `#48DF3A` |
| `Text/error` | `#FB2C36` |
| `Text/warning` | `#E8D1A2` |
| `Text/accent` | `#F08000` |
| `Text/purple` | `#8A38F5` |

**Notes:**
- Confirm final variable names with user before creating — the names above are inferred from the swatch labels
- Need to audit remaining Primitives sections for additional color groups (e.g., borders, status strips, git status colors)
- Git status colors used in GitFileRow/TreeRow components (`#48DF3A`, `#FB2C36`, `#F08000`, `#6A7282`) — may want a `Status/*` group

**Figma API:**
```js
const collection = figma.variables.createVariableCollection("Colors");
const mode = collection.modes[0];
collection.renameMode(mode.modeId, "Default");
// Create each variable with figma.variables.createVariable(name, collection, "COLOR")
// then variable.setValueForMode(mode.modeId, { r, g, b, a })
```

---

## Step 2 — Bind Variables to Swatch Rectangles

**Goal:** Make the Primitives canvas live — swatch rectangles reference their own variables so editing a variable updates the swatch.

- Iterate over each swatch frame in `COLOR / BACKGROUNDS` (401:1062) and `COLOR / TEXT & STATUS`
- For each swatch, bind the rectangle's fill to the corresponding variable using `setBoundVariable`
- Verify visually that swatches still look correct after binding

---

## Step 3 — Bind Variables to Components

**Goal:** Replace hardcoded hex fills in all M&A components with variable references.

Components to sweep (M&A page, `78:2268`):
- **ToolbarButton** — fills `#202020` / `#2A2A2A` / `#303030`, icon fills `#6A7282` / `#B0BAC8` / `#FFFFFF`
- **GitFileRow / TreeRow** — status colors, selected state fills
- **OutputLine** variants — text colors (`#FFFFFF`, `#FB2C36`, `#E8D1A2`, `#48DF3A`)
- **BlockHeader / BlockFooter** — fill `#171717`
- **CommandBody** — background, padding fill
- **BranchIndicator / DiffCount / DiffStats** — text colors and fills
- **StatusStrip** variants — state colors
- **Keycap, RunBadge, CollapseIndicator, etc.** — fill / stroke colors

**Approach:**
1. Query all nodes with hardcoded fills matching known palette values
2. For each match, identify the correct variable and apply `setBoundVariable('fills', variable)`
3. Run a post-sweep audit to confirm no hardcoded hex values remain for palette colors

---

## Step 4 — Create Typography Text Styles

**Goal:** Define reusable Figma text styles for all font/size/weight combos used in components.

**Observed type combos** (from component audit):
| Style name | Font | Size | Weight | Color variable |
|---|---|---|---|---|
| `Label/XS` | Poppins | 9px | Regular | `Text/secondary` |
| `Label/SM` | Poppins | 10px | Regular | `Text/secondary` |
| `Label/MD` | Poppins | 12px | Regular | `Text/secondary` |
| `Code/SM` | Roboto Mono | 12px | Regular | `Text/primary` |
| `Code/MD` | Roboto Mono | 14px | Regular | `Text/primary` |
| `Code/LG` | Roboto Mono | 16px | Regular | `Text/primary` |
| `Code/LG/Medium` | Roboto Mono | 16px | Medium | `Text/primary` |

**Notes:**
- Need full typography audit of components before finalizing — above is inferred from known atoms
- Text styles in Figma don't include color, so color binding stays on the text node via variable (Step 3)
- Use `figma.createTextStyle()` and apply via `node.textStyleId`

---

## Step 5 — Audit & Verify

**Goal:** Confirm no hardcoded values remain for palette colors or font combos.

- Run `figma-use analyze colors` to surface any remaining hardcoded fills
- Run `figma-use analyze typography` to surface any unstyled text
- Spot-check key components (BlockHeader, GitFileRow, ToolbarButton) by exporting screenshots before/after
- Confirm Primitives canvas swatches still visually match their variable values

---

## Step 6 — (Optional) Spacing / Sizing Tokens

If desired after colors and typography are done:
- Define number variables for common gap values (`4`, `7`, `8`, `10`, `12`) and padding values
- Bind auto-layout gap/padding properties in components to these variables
- Lower priority than colors/type — the visual impact is smaller

---

## File References

| File / Page | ID | Notes |
|---|---|---|
| Primitives page | `401:1040` | Token reference canvas |
| Primitives Canvas | `401:1042` | 1440×3024, 16 sections |
| COLOR / BACKGROUNDS swatches | `401:1043` | 5 swatches |
| Molecules and Atoms page | `78:2268` | All components live here |
| Organisms page | `105:382` | Source only, do not modify |
