# Collider primitive migration completion record

The original spike and decisions remain available at commit `8916c0e` and in the
full pre-cleanup handoff at `3f5c8c024237dff8ffb73782c06337a75c001383`.
This document records the completed application migration and the local contracts
that remain after reconciliation.

## Completed scope

All 23 Collider-owned UI primitive selections were reconciled against the pinned
`new-york-v4` registry evidence. The root `components.json` now names
`new-york-v4`, and the ownership manifest treats the pinned registry as an upstream
reference rather than unfinished application work.

The migration landed in the planned batches:

1. Card, Select and ButtonGroup.
2. Button, Badge, HoverCard and Command.
3. Accordion, Alert, Avatar, Carousel, Collapsible, Dropdown Menu, Input,
   Input Group, Progress, Scroll Area, Separator, Spinner, Switch, Tabs, Textarea
   and Tooltip.

Carousel and Dropdown Menu retain small internal modules solely to satisfy the
repository's current TSX-200 limit. Their public import paths and exports remain
unchanged.

## Preserved Collider contracts

- CardHeader uses the v4 grid layout, so CardAction shares the header row in Plan
  instead of being forced beneath the title. The Card story now asserts the desired
  layout rather than characterizing the old defect.
- Select retains `data-slot="select-trigger"`, the explicit full-width trigger and
  popper positioning. ButtonGroup retains the hidden-Radix-select corner repair and
  does not override that explicit width.
- Button retains the readable `text-info` link treatment, the dedicated
  `bg-destructive-surface` fill and the Collider `icon-sm` size.
- Badge retains the dedicated destructive surface and the tonal success, warning
  and error variants while adopting the v4 span/asChild API.
- HoverCard content remains portalled. Command deliberately omits the unused
  CommandDialog dependency.
- The directory-wide `focus-visible:focus-ring` policy replaces upstream
  accent-derived focus rings. Invalid controls retain their destructive border and
  ring treatment.
- Scroll Area's viewport is explicitly keyboard focusable so keyboard scrolling
  and its visible focus treatment are available without an additional wrapper.
- Collider continues to use the individually declared `@radix-ui/react-*`
  packages rather than the aggregate upstream import.

## Evidence and verification

The registry snapshot, source policy, ownership map and license records remain the
comparison evidence. Collider owns the reconciled copies; no registry overwrite or
ongoing automatic synchronization is implied.

Source changes that feed `ds-curated-collider-owned-primitives` require a fresh
library-evidence capture, semantic curation, independent exact-bundle review and
explicit installation. Those gates are part of the same migration closeout rather
than edits to generated skills.

Use the installed component/library workflows and
[readiness policy](stage1/sync-policy.md). Run both Storybook themes, the actual
Card/Select/ButtonGroup interactions, `just preflight` before pushing and
`just sweep` before opening or merging a pull request. These checks do not imply
Chromatic approval, Figma publication or reusable-component promotion.
