import { setProjectAnnotations } from '@storybook/nextjs-vite';
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import * as projectAnnotations from './preview';

// The a11y addon's preview annotations are what actually run axe inside the
// vitest browser project. Registering the addon in main.ts only wires the
// manual panel — without this import the `a11y: { test: 'error' }` parameter
// in preview.ts is silently inert and no accessibility check ever gates.
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
