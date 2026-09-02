import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import {
  createRuntimeCssParityDiagnostics,
  formatStorybookArtifactConformanceDiagnostics,
  loadGeneratedTokenArtifact,
  resolveGeneratedTokenStyleValue,
  type StorybookArtifactConformanceDiagnostic,
} from '@/lib/tokens/storybook-artifact-conformance';

function RuntimeCssParityProbe() {
  return (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        padding: '2rem',
      }}
    >
      <section
        data-testid="runtime-panel"
        style={{
          background: 'var(--color-background-surface)',
          border: '1px solid var(--color-background-overlay)',
          borderRadius: '1rem',
          boxShadow: 'inset 0 0 0 1px var(--color-background-white-10)',
          display: 'grid',
          gap: '0.5rem',
          maxWidth: '32rem',
          padding: '1.5rem',
        }}
      >
        <p
          style={{
            // text/tertiary is AA-large-only; this eyebrow is 14px normal.
            color: 'var(--color-text-secondary)',
            fontSize: '0.875rem',
            letterSpacing: '0.08em',
            margin: 0,
            textTransform: 'uppercase',
          }}
        >
          Shared runtime CSS
        </p>
        <h2
          style={{
            color: 'var(--color-text-primary)',
            fontSize: '1.5rem',
            margin: 0,
          }}
        >
          Storybook is reading the same token artifact as the app
        </h2>
        <p
          data-testid="runtime-copy"
          style={{
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          This probe resolves live CSS variables from the generated runtime artifact instead of
          copying token values into Storybook.
        </p>
      </section>
    </div>
  );
}

const meta = {
  title: 'Foundations/Runtime CSS Parity',
  component: RuntimeCssParityProbe,
  // Pinned to dark because that is the only theme this proof can speak for:
  // `design-tokens/dist/tokens.ts` ships a flat `tokenMap` whose 653 entries all
  // carry `themeId: 'dark'`. Light values exist in the generated CSS and in the
  // Figma export, but never in the TS artifact — so asserting runtime CSS
  // against it in light compares a light computed colour to a dark token value.
  // Widening this proof means teaching the token build to emit per-theme values,
  // not flipping the global here.
  globals: { theme: 'dark' },
  parameters: {
    layout: 'fullscreen',
  },
  render: () => <RuntimeCssParityProbe />,
} satisfies Meta<typeof RuntimeCssParityProbe>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BaselineTheme: Story = {
  play: async ({ canvasElement }) => {
    const { artifact, diagnostics } = await loadGeneratedTokenArtifact();
    if (artifact) {
      diagnostics.push(...createRuntimeCssParityDiagnostics(artifact));
    }
    assertNoConformanceDiagnostics(diagnostics);
    if (!artifact) {
      throw new Error('Storybook artifact conformance failed before runtime parity assertions.');
    }

    const canvas = within(canvasElement);
    const panel = await canvas.findByTestId('runtime-panel');
    const copy = await canvas.findByTestId('runtime-copy');
    const rootStyles = window.getComputedStyle(document.documentElement);
    const expectedPanelBackground = resolveGeneratedTokenStyleValue(
      artifact,
      'semantic.color.background.surface',
      'backgroundColor'
    );
    const expectedCopyColor = resolveGeneratedTokenStyleValue(
      artifact,
      'semantic.color.text.secondary',
      'color'
    );

    expect(rootStyles.getPropertyValue('--color-background-surface').trim()).not.toBe('');
    expect(rootStyles.getPropertyValue('--color-text-secondary').trim()).not.toBe('');

    expect(window.getComputedStyle(panel).backgroundColor).toBe(expectedPanelBackground);
    expect(window.getComputedStyle(copy).color).toBe(expectedCopyColor);
  },
};

function assertNoConformanceDiagnostics(diagnostics: StorybookArtifactConformanceDiagnostic[]) {
  if (diagnostics.length === 0) {
    return;
  }

  throw new Error(formatStorybookArtifactConformanceDiagnostics(diagnostics));
}
