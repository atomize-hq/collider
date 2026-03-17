# Collider Design System

Extracted from the **Collider** Figma file (`BSb9QaMzwE2mv0GQ63buQK`), pages: Molecules and Atoms, Organisms, Primitives.

---

## Atomic Design Hierarchy

```
Atoms → Molecules → Organisms
```

| Level          | Figma Page          | Section ID | Role                                                                                                                                                                                |
| -------------- | ------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Atoms**      | Molecules and Atoms | `174:543`  | Primitive building blocks — StatusStrip, TreeRow, GitFileRow, ToolbarButton, OutputLine, Keycap, BadgeChip, BranchIndicator, PathText, DurationText, VerbToken, SeverityToken, etc. |
| **Molecules**  | Molecules and Atoms | `174:544`  | Composed atoms — BlockHeader, BlockFooter, ActionToolbar, KeyboardHintsBar, CommandBody, GitDetailsDecorators, FailureStack, FileTreeList, SplitPane                                |
| **Primitives** | Primitives          | `401:1040` | Visual token reference — color swatches, type scale, spacing, radius, opacity samples. Source of truth for variable values. Canvas: `401:1042` (1440×3830, 20 sections).            |
| **Organisms**  | Organisms           | `105:382`  | Full composed layouts — reference only, do not modify.                                                                                                                              |

---

## Figma Variable System

All design tokens are bound as Figma variables. Use the canonical `$Group/name` paths throughout — the old `bg-*` / `text-*` / `status-*` aliases are retired.

### Background Variables

| Variable               | Hex                     | Notes                                                                   |
| ---------------------- | ----------------------- | ----------------------------------------------------------------------- |
| `$Background/base`     | `#171717`               | BlockHeader/BlockFooter chrome surface (intended; see BlockHeader note) |
| `$Background/surface`  | `#202020`               | ToolbarButton default, Keycap, BadgeChip default fill                   |
| `$Background/elevated` | `#2A2A2A`               | ToolbarButton hovered, BadgeChip hovered                                |
| `$Background/overlay`  | `#303030`               | ToolbarButton active (layering semantics, used for active state)        |
| `$Background/white-10` | `rgba(255,255,255,0.1)` | Selected GitFileRow / TreeRow row highlight                             |
| `$Background/hover`    | `#FFFFFF`               | Hover state references (undocumented in legacy)                         |

### Text Variables

| Variable          | Hex                     | Notes                                                                                                      |
| ----------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| `$Text/primary`   | `#FFFFFF`               | OutputLine default/info text, file names (default selected), primary content                               |
| `$Text/secondary` | `#6A7282`               | Path labels, duration, branch name, hints, badge text, error detail annotations                            |
| `$Text/tertiary`  | `#B0BAC8`               | BadgeChip hovered text, ToolbarButton hovered icon                                                         |
| `$Text/dim`       | `rgba(255,255,255,0.3)` | Gitignored file names                                                                                      |
| `$Text/success`   | `#48DF3A`               | OutputLine success, Git Added file name, Added letter "A"                                                  |
| `$Text/error`     | `#FB2C36`               | OutputLine error, Git Deleted file name (strikethrough), Deleted letter "D"                                |
| `$Text/warning`   | `#E8D1A2`               | OutputLine warning, Git Modified file name, Modified letter "M"                                            |
| `$Text/caution`   | `#F08000`               | Git Untracked file name, Untracked letter "U"                                                              |
| `$Text/info`      | `#51A2FF`               | VerbToken info-severity verbs, SeverityToken/info — distinct from OutputLine/info which is `$Text/primary` |
| `$Text/ai`        | `#8A38F5`               | StatusStrip AI state, BadgeChip AI icon                                                                    |

### StatusStrip Variables

| Variable               | Hex       |
| ---------------------- | --------- |
| `$StatusStrip/success` | `#0E5E2E` |
| `$StatusStrip/failure` | `#5B1D20` |
| `$StatusStrip/info`    | `#1F4174` |
| `$StatusStrip/running` | `#FFFFFF` |
| `$StatusStrip/neutral` | `#FFFFFF` |
| `$StatusStrip/ai`      | `#8A38F5` |

### Borders

| Token            | Value                                    | Usage                                |
| ---------------- | ---------------------------------------- | ------------------------------------ |
| `border-default` | `0.25px solid $Text/secondary` (#6A7282) | BadgeChip default, BlockFooter badge |
| `border-keycap`  | `0.5px solid $Text/secondary` (#6A7282)  | Keycap                               |
| `border-hovered` | `0.25px solid #8A9AAF`                   | BadgeChip hovered                    |
| `border-copied`  | `0.25px solid $Text/success` (#48DF3A)   | BadgeChip copied state               |

---

## Typography

### Typefaces

| Font                    | Usage                                                                         |
| ----------------------- | ----------------------------------------------------------------------------- |
| **Poppins Regular**     | Primary UI font — paths, labels, branch names, keyboard hints, badges         |
| **Roboto Mono Regular** | Code output (default/success), file names in tree and git rows, error details |
| **Roboto Mono Medium**  | Code output (info, error, warning variants), VerbToken, SeverityToken         |

### Type Scale

| Size | Line Height | Font                | Usage                                                                |
| ---- | ----------- | ------------------- | -------------------------------------------------------------------- |
| 16px | 16px        | Poppins Regular     | Path text (HeaderPath)                                               |
| 16px | 16px        | Roboto Mono Regular | OutputLine default/success, ErrorDetail                              |
| 16px | 16px        | Roboto Mono Medium  | OutputLine info/error/warning                                        |
| 14px | normal      | Roboto Mono Regular | File names in GitFileRow, TreeRow                                    |
| 14px | normal      | Roboto Mono Medium  | VerbToken                                                            |
| 12px | 12px        | Roboto Mono Medium  | SeverityToken                                                        |
| 12px | 12px        | Poppins Regular     | Secondary labels — duration, branch name, keyboard hints, badge text |
| 10px | normal      | Poppins Regular     | Git status letter indicators (A, M, D, U)                            |

### Letter Spacing

- Branch name text: `tracking-[-0.1504px]`

---

## Spacing & Layout

### Grid / Block Width

- Standard block content width: **866px**
- Block with label offset: **901px** (content at x=15 inside wrapper)

### Gaps

| Context                                        | Gap               |
| ---------------------------------------------- | ----------------- |
| ActionToolbar between buttons                  | `7px`             |
| KeyboardHintsBar between hint groups           | `15px`            |
| KeyboardHintsBar all hint groups (key + label) | `6px`             |
| GitFileRow: icon + filename                    | `8px`             |
| GitFileRow: filename + status indicator        | `justify-between` |
| HeaderPath: path + duration                    | `12px`            |
| BranchIndicator internals                      | `5px`             |
| BadgeChip internals (icon + text)              | `4px`             |
| DiffStats internals                            | `~5px`            |
| CommandBody OutputLines                        | `8px`             |
| CommandBody padding                            | `10px`            |
| GitDetailsDecorators rows                      | `2px`             |

### Padding

| Component                 | Padding                     |
| ------------------------- | --------------------------- |
| BlockHeader / BlockFooter | `pl-[10px] py-[5px]`        |
| HeaderPath inner          | `py-[5px]`                  |
| KeyboardHintsBar          | `px-[10px] py-[6px]`        |
| BadgeChip / badge         | `px-[10.25px] py-[6.25px]`  |
| Keycap                    | `px-[5px]`                  |
| GitFileRow                | `pl-[4px]`                  |
| GitFileRow selected       | `pl-[4px]`, `rounded-[4px]` |

---

## Border Radius

| Component                          | Radius |
| ---------------------------------- | ------ |
| ToolbarButton                      | `3px`  |
| GitFileRow (selected state)        | `4px`  |
| SeverityToken (error/warning/info) | `3px`  |
| BadgeChip                          | `5px`  |
| KeyboardHintsBar                   | `5px`  |
| BlockFooter badge                  | `5px`  |
| Keycap                             | `2px`  |

---

## Component Dimensions

### Atoms

| Component                              | Size (w×h)                                    |
| -------------------------------------- | --------------------------------------------- |
| StatusStrip                            | 4×100px                                       |
| ToolbarButton                          | 21×21px                                       |
| CollapseIndicator                      | 14×14px                                       |
| TruncationIndicator                    | 14×18px                                       |
| FolderIcon                             | 16×16px                                       |
| ChevronToggle (expanded)               | 16×16px                                       |
| ChevronToggle (collapsed, not hovered) | 0×16px _(zero-width — layout shift intended)_ |
| FileIcon                               | 16×16px                                       |
| GitStatusIndicator (letter or dot)     | 16×20px                                       |
| DurationText                           | 32×20px                                       |
| PathText/truncation=false              | 141×20px                                      |
| PathText/truncation=true               | 199×20px                                      |
| OutputLine                             | 356×21px                                      |
| ErrorDetail                            | 866×126px                                     |
| Keycap (up-down)                       | 19×13px                                       |
| Keycap (left-right)                    | 18×13px                                       |
| Keycap (enter)                         | 27×13px                                       |
| BadgeChip                              | 60×33px                                       |
| BranchIndicator                        | 120×20px                                      |
| DiffStats                              | 94×18px                                       |
| BranchStatus                           | 150×42px                                      |
| FileCount                              | 25–26×18px                                    |
| DiffCount/added                        | 24×18px                                       |
| DiffCount/deleted                      | 22×18px                                       |
| DiffCount/neutral                      | 8×18px                                        |
| Scrollbar (vertical)                   | 6×52px                                        |
| Scrollbar (horizontal)                 | 52×6px                                        |
| VerbToken                              | 34–76×18px _(width varies by verb)_           |
| SeverityToken                          | varies×18px                                   |

### Molecules

| Component                        | Size (w×h)                              |
| -------------------------------- | --------------------------------------- |
| ActionToolbar (5 buttons)        | 133×21px                                |
| KeyboardHintsBar                 | 356×30px                                |
| HintGroup                        | 80–137×18px _(width varies by content)_ |
| GitFileRow                       | 370×24px                                |
| BlockHeader                      | 866×55px                                |
| BlockHeader/variant=with-command | 866×55px                                |
| BlockHeader/label                | 901×55px                                |
| BlockFooter                      | 866×55px                                |
| BlockFooter/variant=with-hints   | 866×55px                                |
| BlockFooter/label                | 901×55px                                |
| GitDetailsDecorators             | 838×50px                                |
| CommandBody                      | 866×132px                               |
| CommandBody/collapsed-middle     | 866×122px                               |
| CommandBody/collapsed-tail       | 866×116px                               |
| CommandBody/collapsed-head       | 866×116px                               |
| FailureStack                     | 866×378px                               |
| FileTreeList                     | ~838×362px                              |
| SplitPane                        | ~846×336px                              |

### TreeRow Variants

All TreeRow components are **838×24px** wide (legacy atom section dimensions).

| Variant            | States                     |
| ------------------ | -------------------------- |
| CollapsedFolder    | default, hovered, expanded |
| ExpandedFolder     | (single)                   |
| File               | default, hovered           |
| GitIgnored         | default, hovered, expanded |
| Level2Folder       | default                    |
| GitFile-Added      | default, hovered           |
| GitFile-Deleted    | default, hovered           |
| GitFile-Untracked  | default, hovered           |
| GitFile-Modified   | default, hovered           |
| GitFolder-Modified | default, hovered, expanded |
| Selected           | default                    |
| GitSubmodule       | default, hovered, expanded |

---

## Component States & Interactions

### ToolbarButton (21×21, radius 3px)

5 icons: `filter`, `copy`, `add-context`, `edit`, `ellipsis`

| State      | Background                           | Icon Color                                 |
| ---------- | ------------------------------------ | ------------------------------------------ |
| `default`  | `$Background/surface` (#202020)      | `$Text/secondary` (#6A7282)                |
| `hovered`  | `$Background/elevated` (#2A2A2A)     | `$Text/tertiary` (#B0BAC8)                 |
| `active`   | `$Background/overlay` (#303030)      | `$Text/primary` (#FFFFFF)                  |
| `inactive` | `$Background/surface` at 35% opacity | `$Text/secondary` (#6A7282) at 35% opacity |

### BadgeChip (60×33px, radius 5px)

_(Previously called RunBadge — BadgeChip is the canonical Figma component name.)_

2D ComponentSet `246:451`: icon=`run/copy/ai/cube` × state=`default/hovered/copied/inactive`

| State      | Background                           | Border                                 | Text              |
| ---------- | ------------------------------------ | -------------------------------------- | ----------------- |
| `default`  | `$Background/surface` (#202020)      | `0.25px $Text/secondary` (#6A7282)     | `$Text/secondary` |
| `hovered`  | `$Background/elevated` (#2A2A2A)     | `0.25px #8A9AAF`                       | `$Text/tertiary`  |
| `copied`   | `$Background/surface` (#202020)      | `0.25px $Text/success` (#48DF3A solid) | `$Text/success`   |
| `inactive` | `$Background/surface` at 35% opacity | `0.25px $Text/secondary`               | `$Text/secondary` |

### Scrollbar

| State     | Appearance        |
| --------- | ----------------- |
| `default` | Low opacity       |
| `hover`   | Increased opacity |
| `active`  | Full opacity      |

Orientations: `vertical` (6×52px), `horizontal` (52×6px)

### BranchIndicator (120×20px, opacity 70%)

| Sync State | Extra Text |
| ---------- | ---------- |
| `synced`   | —          |
| `ahead`    | `↑2`       |
| `behind`   | `↓3`       |
| `diverged` | `↑1 ↓2`    |

Font: Poppins Regular 12px `$Text/secondary`

---

## Atomic Components Detail

### VerbToken (ComponentSet `444:1960`)

1D ComponentSet — 8 variants. Font: 14px Roboto Mono Medium. No background fill.

| Variant     | Size (w×h) | Color Variable              |
| ----------- | ---------- | --------------------------- |
| `compiling` | 76×18px    | `$Text/info` (#51A2FF)      |
| `checking`  | 68×18px    | `$Text/info`                |
| `running`   | 59×18px    | `$Text/info`                |
| `finished`  | 68×18px    | `$Text/success` (#48DF3A)   |
| `blocking`  | 68×18px    | `$Text/warning` (#E8D1A2)   |
| `warning`   | 59×18px    | `$Text/warning`             |
| `error`     | 43×18px    | `$Text/error` (#FB2C36)     |
| `note`      | 34×18px    | `$Text/secondary` (#6A7282) |

### SeverityToken (ComponentSet `444:1977`)

1D ComponentSet — 5 variants. Font: 12px Roboto Mono Medium. Radius 3px where bg present.

| Variant   | Color Variable              | Background  | Radius |
| --------- | --------------------------- | ----------- | ------ |
| `error`   | `$Text/error` (#FB2C36)     | `#FB2C361A` | 3px    |
| `warning` | `$Text/warning` (#E8D1A2)   | `#E8D1A21A` | 3px    |
| `info`    | `$Text/info` (#51A2FF)      | `#51A2FF1A` | 3px    |
| `note`    | `$Text/secondary` (#6A7282) | none        | —      |
| `help`    | `$Text/tertiary` (#B0BAC8)  | none        | —      |

---

## OutputLine Variants (ComponentSet `297:551`)

Size: **356×21px**. Font: Roboto Mono 16px.

| Variant   | Color                     | Weight  |
| --------- | ------------------------- | ------- |
| `default` | `$Text/primary` (#FFFFFF) | Regular |
| `info`    | `$Text/primary` (#FFFFFF) | Medium  |
| `error`   | `$Text/error` (#FB2C36)   | Medium  |
| `warning` | `$Text/warning` (#E8D1A2) | Medium  |
| `success` | `$Text/success` (#48DF3A) | Regular |

Note: OutputLine/info uses `$Text/primary` (white), not `$Text/info`. The `$Text/info` (#51A2FF) variable is used by VerbToken and SeverityToken for compiler severity semantics.

---

## Molecular Components Detail

### BlockHeader

> **Known drift:** The canonical BlockHeader (`174:739`) currently has a hardcoded fill `#27272A` in Figma. The intended value per the variable system is `$Background/base` (`#171717`). BlockFooter (`174:1473`) correctly binds `$Background/base`. Treat `#171717` as the authoritative spec until the binding is repaired.

Layout: SPACE_BETWEEN (not justify-between). HeaderPath/CommandText must have `grow=1`.

### FailureStack (`452:5579`, 866×378px)

Layout: VERTICAL, gap=0. Composition: 3× ErrorDetail instances stacked. Lives in Molecules section at y=2230.

---

## Git Status Semantics

| Status     | Letter | Color Variable                          | Strip Variable                   |
| ---------- | ------ | --------------------------------------- | -------------------------------- |
| Added      | `A`    | `$Text/success` (#48DF3A)               | `$StatusStrip/success` (#0E5E2E) |
| Modified   | `M`    | `$Text/warning` (#E8D1A2)               | —                                |
| Deleted    | `D`    | `$Text/error` (#FB2C36) (strikethrough) | `$StatusStrip/failure` (#5B1D20) |
| Untracked  | `U`    | `$Text/caution` (#F08000)               | —                                |
| Gitignored | —      | `$Text/dim` (rgba(255,255,255,0.3))     | —                                |
| Submodule  | `S`    | —                                       | —                                |

Selected row background: `$Background/white-10` (rgba(255,255,255,0.1))

---

## Keycap

- Background: `$Background/surface` (#202020)
- Border: `0.5px solid $Text/secondary` (#6A7282)
- Radius: `2px`
- Height: `13px`
- Padding: `px-[5px]`
- Keys: `up-down` (19px wide), `left-right` (18px wide), `enter` (27px wide)
- Icon color: `$Text/secondary` stroke

---

## Opacity Modifiers

| Context                      | Opacity                |
| ---------------------------- | ---------------------- |
| ToolbarButton inactive       | 35% on whole component |
| BranchIndicator              | 70% on inner container |
| BadgeChip inactive           | 35%                    |
| DiffCount/neutral (zero)     | 35% on icon + text     |
| FileCount/zero               | 35% on icon + text     |
| BlockFooter branch container | 70%                    |
| Dot separator in DiffStats   | 50%                    |

---

## Variant Naming Convention

ComponentSet variant properties use the format:

```
ComponentName/property=value, property=value
```

Comma-space (`, `) separates properties. Slash separates the component group name from the property list.

Example: `ToolbarButton/icon=filter, state=default`

---

## Figma Node IDs (Key Components)

| Component                                       | Figma ID   |
| ----------------------------------------------- | ---------- |
| Atoms section                                   | `174:543`  |
| Molecules section                               | `174:544`  |
| Primitives canvas                               | `401:1042` |
| ToolbarButton ComponentSet (state=default only) | `221:1337` |
| GitFileRow ComponentSet (status × selected)     | `256:565`  |
| OutputLine ComponentSet                         | `297:551`  |
| BranchIndicator ComponentSet                    | `303:553`  |
| FileIcon ComponentSet                           | `284:980`  |
| PathText ComponentSet                           | `297:550`  |
| Keycap ComponentSet                             | `243:945`  |
| BadgeChip ComponentSet                          | `246:451`  |
| StatusStrip ComponentSet                        | `222:505`  |
| TreeRow ComponentSet                            | `280:644`  |
| ChevronToggle ComponentSet                      | `268:466`  |
| FolderIcon ComponentSet                         | `268:465`  |
| VerbToken ComponentSet                          | `444:1960` |
| SeverityToken ComponentSet                      | `444:1977` |
| ActionToolbar                                   | `211:764`  |
| BlockHeader                                     | `174:739`  |
| BlockFooter                                     | `174:1473` |
| KeyboardHintsBar                                | `174:1979` |
| ErrorDetail                                     | `319:1033` |
| FailureStack                                    | `452:5579` |
| DiffStats                                       | `303:563`  |
| BranchStatus                                    | `303:595`  |
