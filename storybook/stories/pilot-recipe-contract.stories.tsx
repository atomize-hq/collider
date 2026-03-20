import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { getPilotRecipeDocsModel } from '../proof-surface-data';

const recipeDocsModel = getPilotRecipeDocsModel('button');

function PilotRecipeContractDocs() {
  return (
    <main style={pageStyle}>
      <header style={heroStyle}>
        <p style={eyebrowStyle}>Artifact-backed recipe proof</p>
        <h1 data-testid="recipe-docs-heading" style={headingStyle}>
          {recipeDocsModel.componentId} recipe contract
        </h1>
        <p style={ledeStyle}>
          Variant axes, slots, state overrides, and fallback behavior are rendered directly from the
          generated recipe artifact for the pilot component.
        </p>
      </header>

      <section style={summaryGridStyle}>
        <article style={cardStyle}>
          <h2 style={sectionHeadingStyle}>Defaults</h2>
          <p style={summaryTextStyle}>Recipe version: {recipeDocsModel.recipeVersion}</p>
          <p data-testid="recipe-default-state" style={summaryTextStyle}>
            Default state: {recipeDocsModel.defaults.state}
          </p>
          <div style={pillRowStyle}>
            {recipeDocsModel.defaults.variants.map((variant) => (
              <span key={variant.axis} style={pillStyle}>
                {variant.axis}: {variant.value}
              </span>
            ))}
          </div>
        </article>
        <article style={cardStyle}>
          <h2 style={sectionHeadingStyle}>Variant axes</h2>
          <div style={listStyle}>
            {recipeDocsModel.variantAxes.map((axis) => (
              <div key={axis.name}>
                <strong>{axis.name}</strong>: {axis.values.join(', ')}
              </div>
            ))}
          </div>
        </article>
        <article style={cardStyle}>
          <h2 style={sectionHeadingStyle}>Fallbacks</h2>
          <p data-testid="recipe-missing-variant" style={summaryTextStyle}>
            Missing variant behavior: {recipeDocsModel.fallbacks.missingVariantBehavior}
          </p>
          <div style={listStyle}>
            {recipeDocsModel.fallbacks.stateFallbacks.map((fallback) => (
              <div key={fallback.state}>
                <strong>{fallback.state}</strong> → {fallback.fallbackState}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section style={twoColumnGridStyle}>
        <article style={cardStyle}>
          <h2 style={sectionHeadingStyle}>Slots</h2>
          <div style={listStyle}>
            {recipeDocsModel.slots.map((slot) => (
              <section key={slot.name}>
                <h3 style={subHeadingStyle}>{slot.name}</h3>
                {slot.bindings.map((binding) => (
                  <div
                    key={`${slot.name}-${binding.property}`}
                    data-testid={`slot-${slot.name}-${binding.property}`}
                    style={bindingRowStyle}
                  >
                    <span
                      style={{
                        ...bindingSwatchStyle,
                        backgroundColor: `var(${binding.cssVariable})`,
                      }}
                    />
                    <span>
                      <strong>{binding.property}</strong>: {binding.tokenId}
                    </span>
                    <span style={bindingValueStyle}>{binding.value}</span>
                  </div>
                ))}
              </section>
            ))}
          </div>
        </article>

        <article style={cardStyle}>
          <h2 style={sectionHeadingStyle}>State overrides</h2>
          <div style={listStyle}>
            {recipeDocsModel.states.map((state) => (
              <section key={state.name}>
                <h3 style={subHeadingStyle}>{state.name}</h3>
                {state.slots.map((slot) => (
                  <div key={`${state.name}-${slot.name}`} style={stateSlotStyle}>
                    <strong>{slot.name}</strong>
                    {slot.bindings.map((binding) => (
                      <div
                        key={`${state.name}-${slot.name}-${binding.property}`}
                        style={bindingRowStyle}
                      >
                        <span
                          style={{
                            ...bindingSwatchStyle,
                            backgroundColor: `var(${binding.cssVariable})`,
                          }}
                        />
                        <span>
                          {binding.property}: {binding.tokenId}
                        </span>
                        <span style={bindingValueStyle}>{binding.value}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </section>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

const meta = {
  title: 'Legacy/Pilot Recipe Contract',
  component: PilotRecipeContractDocs,
  parameters: {
    layout: 'fullscreen',
  },
  render: () => <PilotRecipeContractDocs />,
} satisfies Meta<typeof PilotRecipeContractDocs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ButtonRecipe: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = await canvas.findByTestId('recipe-docs-heading');
    const defaultState = await canvas.findByTestId('recipe-default-state');
    const missingVariant = await canvas.findByTestId('recipe-missing-variant');
    const slotBinding = await canvas.findByTestId('slot-root-background');

    expect(heading.textContent).toContain('button recipe contract');
    expect(defaultState.textContent).toContain(recipeDocsModel.defaults.state);
    expect(missingVariant.textContent).toContain(recipeDocsModel.fallbacks.missingVariantBehavior);
    expect(slotBinding.textContent).toContain('semantic.color.background.surface');
  },
};

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

const eyebrowStyle = {
  color: 'var(--color-text-tertiary)',
  letterSpacing: '0.08em',
  margin: 0,
  textTransform: 'uppercase' as const,
};

const headingStyle = { fontSize: '2rem', margin: 0 };
const ledeStyle = {
  color: 'var(--color-text-secondary)',
  lineHeight: 1.6,
  margin: 0,
  maxWidth: '52rem',
};
const summaryGridStyle = {
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
};
const twoColumnGridStyle = {
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))',
};
const cardStyle = {
  background: 'var(--color-background-surface)',
  border: '1px solid var(--color-background-overlay)',
  borderRadius: '1rem',
  display: 'grid',
  gap: '0.75rem',
  padding: '1rem',
};
const sectionHeadingStyle = { margin: 0 };
const subHeadingStyle = { margin: '0 0 0.5rem 0' };
const summaryTextStyle = { color: 'var(--color-text-secondary)', margin: 0 };
const pillRowStyle = { display: 'flex', flexWrap: 'wrap' as const, gap: '0.5rem' };
const pillStyle = {
  background: 'var(--color-background-elevated)',
  borderRadius: '999px',
  padding: '0.35rem 0.7rem',
};
const listStyle = { display: 'grid', gap: '0.85rem' };
const stateSlotStyle = { display: 'grid', gap: '0.5rem' };
const bindingRowStyle = {
  alignItems: 'center',
  display: 'grid',
  gap: '0.6rem',
  gridTemplateColumns: '1.5rem 1fr auto',
};
const bindingSwatchStyle = {
  border: '1px solid var(--color-background-overlay)',
  borderRadius: '999px',
  height: '1.5rem',
  width: '1.5rem',
};
const bindingValueStyle = { color: 'var(--color-text-secondary)', textAlign: 'right' as const };
