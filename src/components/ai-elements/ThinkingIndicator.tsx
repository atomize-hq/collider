import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import { forwardRef } from 'react';

import styles from './ThinkingIndicator.module.css';

export type ThinkingIndicatorIntent = 'primary' | 'secondary';
export type ThinkingIndicatorSize = 'sm' | 'md';

export type ThinkingIndicatorProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  intent?: ThinkingIndicatorIntent;
  label?: string;
  size?: ThinkingIndicatorSize;
};

const defaultLabel = 'Thinking';

export const ThinkingIndicator = forwardRef<HTMLDivElement, ThinkingIndicatorProps>(
  function ThinkingIndicator(
    { className, intent = 'primary', label, size = 'md', style, ...divProps },
    ref
  ) {
    const accessibleLabel = label?.trim() || defaultLabel;
    const classNames = [
      styles.root,
      intent === 'secondary' ? styles.intentSecondary : styles.intentPrimary,
      size === 'sm' ? styles.sizeSm : styles.sizeMd,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        {...divProps}
        ref={ref}
        aria-atomic="true"
        aria-label={accessibleLabel}
        aria-live="polite"
        className={classNames}
        data-intent={intent}
        data-size={size}
        role="status"
        style={style as CSSProperties}
      >
        <span aria-hidden="true" className={styles.glyph} data-slot="glyph">
          <span className={styles.dot} data-slot="dot" />
          <span className={styles.dot} data-slot="dot" />
          <span className={styles.dot} data-slot="dot" />
        </span>
        {label ? (
          <span className={styles.label} data-slot="label">
            {label}
          </span>
        ) : null}
      </div>
    );
  }
);
