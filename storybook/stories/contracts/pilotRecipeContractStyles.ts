export const pageStyle = {
  color: 'var(--color-text-primary)',
  display: 'grid',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  gap: '1.25rem',
  margin: '0 auto',
  maxWidth: '72rem',
} as const;

export const headerStyle = {
  background: 'var(--color-background-surface)',
  border: '1px solid var(--color-background-overlay)',
  borderRadius: '1rem',
  padding: '1.25rem',
} as const;

export const eyebrowStyle = {
  color: 'var(--color-text-secondary)',
  fontSize: '0.75rem',
  letterSpacing: '0.08em',
  margin: 0,
  textTransform: 'uppercase',
} as const;

export const titleStyle = {
  fontSize: '2rem',
  margin: '0.35rem 0 0',
} as const;

export const ledeStyle = {
  color: 'var(--color-text-secondary)',
  margin: '0.75rem 0 0',
  maxWidth: '44rem',
} as const;

export const sectionStyle = {
  background: 'var(--color-background-surface)',
  border: '1px solid var(--color-background-overlay)',
  borderRadius: '1rem',
  padding: '1.25rem',
} as const;

export const sectionTitleStyle = {
  fontSize: '1rem',
  margin: '0 0 0.75rem',
} as const;

export const definitionListStyle = {
  display: 'grid',
  gap: '0.75rem',
  margin: 0,
} as const;

export const definitionRowStyle = {
  display: 'grid',
  gap: '0.35rem',
} as const;

export const definitionLabelStyle = {
  color: 'var(--color-text-secondary)',
  fontSize: '0.8rem',
} as const;

export const definitionValueStyle = {
  margin: 0,
} as const;

export const tableStyle = {
  borderCollapse: 'collapse',
  width: '100%',
} as const;

export const tableHeaderStyle = {
  borderBottom: '1px solid var(--color-background-overlay)',
  color: 'var(--color-text-secondary)',
  fontSize: '0.8rem',
  padding: '0.5rem 0',
  textAlign: 'left',
} as const;

export const tableCellStyle = {
  borderBottom: '1px solid var(--color-background-overlay)',
  padding: '0.75rem 0',
  verticalAlign: 'top',
} as const;

export const codeBlockStyle = {
  background: 'var(--color-background-base)',
  border: '1px solid var(--color-background-overlay)',
  borderRadius: '0.75rem',
  margin: 0,
  overflowX: 'auto',
  padding: '1rem',
  whiteSpace: 'pre-wrap',
} as const;
