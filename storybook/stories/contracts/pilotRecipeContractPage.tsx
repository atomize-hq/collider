import type { ReactNode } from 'react';
import type { PilotRecipeDocsModel } from '../../../src/lib/tokens/pilotRecipeDocs';
import {
  codeBlockStyle,
  definitionLabelStyle,
  definitionListStyle,
  definitionRowStyle,
  definitionValueStyle,
  eyebrowStyle,
  headerStyle,
  ledeStyle,
  pageStyle,
  sectionStyle,
  sectionTitleStyle,
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
  titleStyle,
} from './pilotRecipeContractStyles';

export function PilotRecipeContractPage({ model }: { model: PilotRecipeDocsModel }) {
  return (
    <article style={pageStyle}>
      <header style={headerStyle}>
        <p style={eyebrowStyle}>Pilot Recipe Contract</p>
        <h1 style={titleStyle}>{model.componentId}</h1>
        <p style={ledeStyle}>
          Storybook renders this contract from the source-owned pilot selector and generated recipe
          artifact.
        </p>
      </header>
      <Section heading="Canonical Source">
        <DefinitionList
          rows={[
            ['Component ID', model.componentId],
            ['Source file', model.sourceFile],
            ['Status', model.status],
            ['Recipe version', model.recipeVersion],
          ]}
        />
      </Section>
      <Section heading="Variant Axes">
        <Table
          columns={['Axis', 'Values']}
          rows={model.variantAxes.map((axis) => [axis.name, axis.values.join(', ')])}
        />
      </Section>
      <Section heading="Defaults">
        <DefinitionList
          rows={[
            [
              'Variants',
              Object.entries(model.defaults.variants)
                .map(([name, value]) => `${name}=${value}`)
                .join(', '),
            ],
            ['State', model.defaults.state],
          ]}
        />
      </Section>
      <Section heading="Slots">
        <JsonPanel value={model.slots} />
      </Section>
      <Section heading="States">
        <JsonPanel value={model.states} />
      </Section>
      <Section heading="Fallbacks">
        <DefinitionList
          rows={[
            ['Missing variant behavior', model.fallbacks.missingVariantBehavior],
            [
              'State fallbacks',
              Object.entries(model.fallbacks.stateFallbacks)
                .map(([state, fallback]) => `${state} -> ${fallback}`)
                .join(', '),
            ],
          ]}
        />
      </Section>
    </article>
  );
}

function Section({ children, heading }: { children: ReactNode; heading: string }) {
  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>{heading}</h2>
      {children}
    </section>
  );
}

function DefinitionList({ rows }: { rows: ReadonlyArray<readonly [string, string]> }) {
  return (
    <dl style={definitionListStyle}>
      {rows.map(([label, value]) => (
        <div key={label} style={definitionRowStyle}>
          <dt style={definitionLabelStyle}>{label}</dt>
          <dd style={definitionValueStyle}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Table({
  columns,
  rows,
}: {
  columns: ReadonlyArray<string>;
  rows: ReadonlyArray<ReadonlyArray<string>>;
}) {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} style={tableHeaderStyle}>
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.join('|')}>
            {row.map((cell) => (
              <td key={cell} style={tableCellStyle}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function JsonPanel({ value }: { value: Record<string, unknown> }) {
  return <pre style={codeBlockStyle}>{JSON.stringify(value, null, 2)}</pre>;
}
