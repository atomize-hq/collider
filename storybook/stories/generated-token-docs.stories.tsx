import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { getTokenDocsModel, type TokenDocsEntry } from '../proof-surface-data';

const tokenDocsModel = getTokenDocsModel();
const firstColorToken = findFirstColorToken(tokenDocsModel.groups);

function GeneratedTokenDocs() {
  return (
    <main style={pageStyle}>
      <header style={heroStyle}>
        <p style={eyebrowStyle}>Artifact-backed token proof</p>
        <h1 data-testid="token-docs-heading" style={headingStyle}>
          Generated token registry
        </h1>
        <p style={ledeStyle}>
          This surface reads theme and token contract data directly from generated artifacts. Any
          grouping or labels here are derived from token IDs, not copied tables.
        </p>
        <div style={themeListStyle}>
          {tokenDocsModel.themes.map((theme) => (
            <article
              key={theme.id}
              data-testid={`theme-${toTestId(theme.id)}`}
              style={themeCardStyle}
            >
              <strong>{theme.label}</strong>
              <span>id: {theme.id}</span>
              <span>file: {theme.file}</span>
              <span>{theme.required ? 'required theme' : 'optional theme'}</span>
            </article>
          ))}
        </div>
        <p style={summaryStyle}>
          Default theme: <strong>{tokenDocsModel.defaultThemeId}</strong> · Total tokens:{' '}
          <strong>{tokenDocsModel.totalTokens}</strong>
        </p>
      </header>

      <section style={groupGridStyle}>
        {tokenDocsModel.groups.map((group) => (
          <article key={group.id} style={groupCardStyle}>
            <h2 style={groupHeadingStyle}>{group.label}</h2>
            <div style={tokenListStyle}>
              {group.tokens.map((token) => {
                const swatchStyle =
                  token.type === 'color'
                    ? { ...tokenSwatchStyle, backgroundColor: `var(${token.cssVariable})` }
                    : tokenSwatchStyle;

                return (
                  <div
                    key={token.id}
                    data-testid={`token-${toTestId(token.id)}`}
                    style={tokenRowStyle}
                  >
                    <div data-testid={`token-swatch-${toTestId(token.id)}`} style={swatchStyle} />
                    <div style={tokenTextStyle}>
                      <strong>{token.id}</strong>
                      <span>{token.cssVariable}</span>
                    </div>
                    <div style={tokenMetaStyle}>
                      <span>{token.value}</span>
                      <span>{token.themeId}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

const meta = {
  title: 'Contracts/Generated Tokens',
  component: GeneratedTokenDocs,
  parameters: {
    layout: 'fullscreen',
  },
  render: () => <GeneratedTokenDocs />,
} satisfies Meta<typeof GeneratedTokenDocs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TokenRegistry: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = await canvas.findByTestId('token-docs-heading');
    const firstTokenRow = await canvas.findByTestId(`token-${toTestId(firstColorToken.id)}`);
    const swatch = await canvas.findByTestId(`token-swatch-${toTestId(firstColorToken.id)}`);

    expect(heading.textContent).toContain('Generated token registry');
    expect(firstTokenRow.textContent).toContain(firstColorToken.id);
    expect(firstTokenRow.textContent).toContain(firstColorToken.value);
    expect(window.getComputedStyle(swatch).backgroundColor).toBe(
      resolveCssVariableValue(firstColorToken.cssVariable)
    );
  },
};

function findFirstColorToken(groups: Array<{ tokens: TokenDocsEntry[] }>) {
  const token = groups.flatMap((group) => group.tokens).find((entry) => entry.type === 'color');
  if (!token) {
    throw new Error('Generated token docs require at least one color token');
  }

  return token;
}

function resolveCssVariableValue(variableName: string) {
  const probe = document.createElement('div');
  probe.style.backgroundColor = `var(${variableName})`;
  document.body.appendChild(probe);

  const computedValue = window.getComputedStyle(probe).backgroundColor;
  probe.remove();
  return computedValue;
}

function toTestId(value: string) {
  return value.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
}

const pageStyle = {
  background: 'var(--color-background-base)',
  color: 'var(--color-text-primary)',
  display: 'grid',
  gap: '1.5rem',
  minHeight: '100vh',
  padding: '2rem',
};

const heroStyle = {
  background: 'var(--color-background-surface)',
  border: '1px solid var(--color-background-overlay)',
  borderRadius: '1.25rem',
  display: 'grid',
  gap: '0.75rem',
  padding: '1.5rem',
};

// text/tertiary is an AA-large-only step (3.36:1 on surface). This eyebrow is
// 16px at normal weight, so it needs 4.5:1 and has to use text/secondary.
const eyebrowStyle = {
  color: 'var(--color-text-secondary)',
  letterSpacing: '0.08em',
  margin: 0,
  textTransform: 'uppercase' as const,
};

const headingStyle = { fontSize: '2rem', margin: 0 };
const ledeStyle = {
  color: 'var(--color-text-secondary)',
  lineHeight: 1.6,
  margin: 0,
  maxWidth: '56rem',
};
const summaryStyle = { color: 'var(--color-text-secondary)', margin: 0 };
const themeListStyle = { display: 'flex', flexWrap: 'wrap' as const, gap: '0.75rem' };
const themeCardStyle = {
  background: 'var(--color-background-elevated)',
  borderRadius: '1rem',
  display: 'grid',
  gap: '0.25rem',
  minWidth: '14rem',
  padding: '1rem',
};
const groupGridStyle = {
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
};
const groupCardStyle = {
  background: 'var(--color-background-surface)',
  border: '1px solid var(--color-background-overlay)',
  borderRadius: '1rem',
  display: 'grid',
  gap: '0.75rem',
  padding: '1rem',
};
const groupHeadingStyle = { margin: 0 };
const tokenListStyle = { display: 'grid', gap: '0.75rem' };
// Grid items default to `min-width: auto`, so a `1fr`/`auto` pair cannot shrink
// below its content and the row spills past the card's right edge. That is not
// only a layout bug: text sitting outside its own card no longer has a painted
// background behind it, so axe measures it against the white page default and
// every value in the registry reads as a contrast failure.
const tokenRowStyle = {
  alignItems: 'center',
  display: 'grid',
  gap: '0.75rem',
  gridTemplateColumns: '2.5rem minmax(0, 1fr) minmax(0, auto)',
};
const tokenSwatchStyle = {
  border: '1px solid var(--color-background-overlay)',
  borderRadius: '999px',
  height: '2.5rem',
  width: '2.5rem',
};
const tokenTextStyle = {
  display: 'grid',
  gap: '0.2rem',
  minWidth: 0,
  overflowWrap: 'anywhere' as const,
};
const tokenMetaStyle = {
  color: 'var(--color-text-secondary)',
  display: 'grid',
  gap: '0.2rem',
  minWidth: 0,
  overflowWrap: 'anywhere' as const,
  textAlign: 'right' as const,
};
