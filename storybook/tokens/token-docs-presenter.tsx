import { useEffect, useState } from 'react';
import { loadTokenDocsModel, type TokenDocsModel, type TokenRecord } from './token-docs-loader';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; model: TokenDocsModel }
  | { status: 'error'; error: Error };

export function TokenDocsPage() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    void loadTokenDocsModel().then(
      (model) => {
        if (active) {
          setState({ status: 'ready', model });
        }
      },
      (error) => {
        if (!active) {
          return;
        }

        setState({
          status: 'error',
          error: error instanceof Error ? error : new Error('Failed to load token docs.'),
        });
      }
    );

    return () => {
      active = false;
    };
  }, []);

  if (state.status === 'error') {
    throw state.error;
  }

  if (state.status === 'loading') {
    return (
      <div
        data-testid="token-docs-loading"
        style={{
          color: '#d6d6d6',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          padding: '2rem',
        }}
      >
        Loading generated token artifacts...
      </div>
    );
  }

  return <TokenDocsView model={state.model} />;
}

export function TokenDocsView({ model }: { model: TokenDocsModel }) {
  return (
    <div
      data-testid="token-docs-root"
      style={{
        background: 'linear-gradient(180deg, rgba(14, 15, 18, 1) 0%, rgba(23, 24, 29, 1) 100%)',
        color: '#f5f7fa',
        minHeight: '100vh',
        padding: '2rem',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '1.5rem',
          margin: '0 auto',
          maxWidth: '72rem',
        }}
      >
        <header
          style={{
            display: 'grid',
            gap: '0.75rem',
          }}
        >
          <p
            style={{
              color: '#9aa3b2',
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            Contract surface
          </p>
          <h1
            style={{
              fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
              fontSize: '2.5rem',
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            Generated token docs
          </h1>
          <p
            style={{
              color: '#c2cad6',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '44rem',
            }}
          >
            Storybook is rendering token categories and theme metadata from generated artifacts, not
            a local mirror.
          </p>
        </header>

        <section
          style={{
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '1rem',
            display: 'grid',
            gap: '0.75rem',
            padding: '1.25rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.1rem',
              margin: 0,
            }}
          >
            Theme contract
          </h2>
          <div
            data-testid="token-docs-themes"
            style={{
              display: 'grid',
              gap: '0.75rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
            }}
          >
            {model.themes.map((theme) => (
              <article
                key={theme.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '0.875rem',
                  display: 'grid',
                  gap: '0.5rem',
                  padding: '1rem',
                }}
              >
                <div
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: '0.5rem',
                    justifyContent: 'space-between',
                  }}
                >
                  <strong style={{ fontSize: '1rem' }}>{theme.id}</strong>
                  {theme.isDefault ? <ThemeBadge label="Default" tone="#77d6a5" /> : null}
                </div>
                <MetaLine label="Required" value={theme.required ? 'yes' : 'no'} />
                <MetaLine label="Extends" value={theme.extends ?? 'none'} />
              </article>
            ))}
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gap: '1rem',
          }}
        >
          <div
            style={{
              alignItems: 'baseline',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'space-between',
            }}
          >
            <h2
              style={{
                fontSize: '1.1rem',
                margin: 0,
              }}
            >
              Token groups
            </h2>
            <div
              style={{
                color: '#9aa3b2',
                display: 'grid',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '0.8rem',
                gap: '0.25rem',
                textAlign: 'right',
              }}
            >
              <span data-testid="token-docs-source-path">Source: {model.artifactPath}</span>
              <span data-testid="token-docs-runtime-css-path">
                Runtime CSS: {model.runtimeCssPath}
              </span>
            </div>
          </div>
          {model.groups.map((group) => (
            <section
              key={group.family}
              data-testid={`token-group-${group.family}`}
              style={{
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '1rem',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '1rem',
                    margin: 0,
                    textTransform: 'capitalize',
                  }}
                >
                  {group.family}
                </h3>
                <span
                  style={{
                    color: '#9aa3b2',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: '0.8rem',
                  }}
                >
                  {group.tokens.length} tokens
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gap: '0.75rem',
                  padding: '1rem',
                }}
              >
                {group.tokens.map((token) => (
                  <TokenCard key={token.id} token={token} />
                ))}
              </div>
            </section>
          ))}
        </section>
      </div>
    </div>
  );
}

function TokenCard({ token }: { token: TokenRecord }) {
  const isColor = token.type === 'color';

  return (
    <article
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '0.875rem',
        display: 'grid',
        gap: '0.75rem',
        gridTemplateColumns: isColor ? '5rem minmax(0, 1fr)' : 'minmax(0, 1fr)',
        padding: '1rem',
      }}
    >
      {isColor ? (
        <div
          role="img"
          aria-label={`${token.id} swatch`}
          style={{
            background: token.value,
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '0.75rem',
            boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.24)',
            minHeight: '5rem',
          }}
        />
      ) : null}
      <div
        style={{
          display: 'grid',
          gap: '0.5rem',
          minWidth: 0,
        }}
      >
        <code
          style={{
            color: '#ffffff',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '0.95rem',
            overflowWrap: 'anywhere',
          }}
        >
          {token.id}
        </code>
        <div
          style={{
            color: '#c2cad6',
            display: 'grid',
            gap: '0.4rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
          }}
        >
          <MetaLine label="Theme" value={token.themeId} />
          <MetaLine label="Type" value={token.type} />
          <MetaLine label="CSS var" value={token.cssVar} />
          <MetaLine label="Value" value={token.value} />
        </div>
      </div>
    </article>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: '0.2rem',
      }}
    >
      <span
        style={{
          color: '#9aa3b2',
          fontSize: '0.72rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '0.88rem',
          overflowWrap: 'anywhere',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ThemeBadge({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      style={{
        background: `${tone}1f`,
        border: `1px solid ${tone}55`,
        borderRadius: '999px',
        color: tone,
        fontSize: '0.72rem',
        letterSpacing: '0.06em',
        padding: '0.25rem 0.5rem',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
  );
}
