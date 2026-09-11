import type { CSSProperties } from 'react';
import { expect, within } from 'storybook/test';
import { loadRecipeDocsModel } from '../src/lib/tokens/recipeDocs';

const recipes = loadRecipeDocsModel();

export function GeneratedRecipeDocs({
  style,
  paragraphStyle,
}: {
  style: CSSProperties;
  paragraphStyle: CSSProperties;
}) {
  return (
    <section style={style} aria-labelledby="recipe-docs-heading">
      <h2 id="recipe-docs-heading" data-testid="recipe-docs-heading" style={{ margin: 0 }}>
        Generated component recipes
      </h2>
      <p style={paragraphStyle}>
        These contracts come from the same generated map as the build. Their presence does not
        assert component readiness or Figma publication.
      </p>
      {recipes.length === 0 && <p>No generated recipes.</p>}
      {recipes.map(({ componentId, sourceFile, ...contract }) => (
        <article key={componentId} data-testid={`recipe-${componentId}`}>
          <h3>{componentId}</h3>
          <p>
            Source: <code>{sourceFile}</code>
          </p>
          <pre
            role="region"
            aria-label={`${componentId} recipe contract`}
            tabIndex={0}
            style={{ overflow: 'auto', maxHeight: '24rem', whiteSpace: 'pre-wrap' }}
          >
            {JSON.stringify(contract, null, 2)}
          </pre>
        </article>
      ))}
    </section>
  );
}

export async function assertRecipeDocs(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  expect(await canvas.findByTestId('recipe-docs-heading')).toHaveTextContent(
    'Generated component recipes'
  );
  for (const recipe of recipes) {
    const entry = await canvas.findByTestId(`recipe-${recipe.componentId}`);
    expect(entry).toHaveTextContent(recipe.sourceFile);
    expect(entry).toHaveTextContent(recipe.defaults.state);
    const contract = within(entry).getByRole('region', {
      name: `${recipe.componentId} recipe contract`,
    });
    expect(contract).toHaveAttribute('tabindex', '0');
    contract.focus();
    expect(contract).toHaveFocus();
  }
}
