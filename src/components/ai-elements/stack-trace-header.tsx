'use client';

import { AlertTriangleIcon, CheckIcon, ChevronDownIcon, CopyIcon } from 'lucide-react';
import type { ComponentProps, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

import { useStackTrace } from './stack-trace';

export type StackTraceHeaderProps = ComponentProps<typeof CollapsibleTrigger> & {
  actions?: ReactNode;
};

// The trigger is a real <button>: `aria-expanded` is not a permitted attribute
// on a role-less div, and a div needs a hand-rolled Enter/Space handler that a
// button gets for free. Row-level controls are rendered as a SIBLING of the
// trigger rather than inside it — nesting a focusable control inside a button
// is invalid, so `actions` cannot travel through `children`.
export const StackTraceHeader = memo(
  ({ className, children, actions, ...props }: StackTraceHeaderProps) => (
    <div className="flex w-full items-center gap-3 pr-3">
      <CollapsibleTrigger asChild {...props}>
        <button
          className={cn(
            'flex flex-1 cursor-pointer items-center gap-3 overflow-hidden p-3 text-left transition-colors hover:bg-muted/50 focus-visible:focus-ring',
            className
          )}
          type="button"
        >
          {children}
        </button>
      </CollapsibleTrigger>
      {actions}
    </div>
  )
);
StackTraceHeader.displayName = 'StackTraceHeader';

export type StackTraceErrorProps = ComponentProps<'div'>;

export const StackTraceError = memo(({ className, children, ...props }: StackTraceErrorProps) => (
  <div className={cn('flex flex-1 items-center gap-2 overflow-hidden', className)} {...props}>
    <AlertTriangleIcon className="size-4 shrink-0 text-destructive" />
    {children}
  </div>
));
StackTraceError.displayName = 'StackTraceError';

export type StackTraceErrorTypeProps = ComponentProps<'span'>;

export const StackTraceErrorType = memo(
  ({ className, children, ...props }: StackTraceErrorTypeProps) => {
    const { trace } = useStackTrace();
    return (
      <span className={cn('shrink-0 font-semibold text-destructive', className)} {...props}>
        {children ?? trace.errorType}
      </span>
    );
  }
);
StackTraceErrorType.displayName = 'StackTraceErrorType';

export type StackTraceErrorMessageProps = ComponentProps<'span'>;

export const StackTraceErrorMessage = memo(
  ({ className, children, ...props }: StackTraceErrorMessageProps) => {
    const { trace } = useStackTrace();
    return (
      <span className={cn('truncate text-foreground', className)} {...props}>
        {children ?? trace.errorMessage}
      </span>
    );
  }
);
StackTraceErrorMessage.displayName = 'StackTraceErrorMessage';

export type StackTraceActionsProps = ComponentProps<'div'>;

const stopMouse = (e: MouseEvent) => e.stopPropagation();
const stopKey = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.stopPropagation();
  }
};

export const StackTraceActions = memo(
  ({ className, children, ...props }: StackTraceActionsProps) => (
    <div
      className={cn('flex shrink-0 items-center gap-1', className)}
      onClick={stopMouse}
      onKeyDown={stopKey}
      role="group"
      {...props}
    >
      {children}
    </div>
  )
);
StackTraceActions.displayName = 'StackTraceActions';

export type StackTraceCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export const StackTraceCopyButton = memo(
  ({
    onCopy,
    onError,
    timeout = 2000,
    className,
    children,
    ...props
  }: StackTraceCopyButtonProps) => {
    const [isCopied, setIsCopied] = useState(false);
    const timeoutRef = useRef<number>(0);
    const { raw } = useStackTrace();

    const copyToClipboard = useCallback(async () => {
      if (typeof window === 'undefined' || !navigator?.clipboard?.writeText) {
        onError?.(new Error('Clipboard API not available'));
        return;
      }

      try {
        await navigator.clipboard.writeText(raw);
        setIsCopied(true);
        onCopy?.();
        timeoutRef.current = window.setTimeout(() => setIsCopied(false), timeout);
      } catch (error) {
        onError?.(error as Error);
      }
    }, [raw, onCopy, onError, timeout]);

    useEffect(
      () => () => {
        window.clearTimeout(timeoutRef.current);
      },
      []
    );

    const Icon = isCopied ? CheckIcon : CopyIcon;

    return (
      <Button
        aria-label={children ? undefined : 'Copy stack trace'}
        className={cn('size-7', className)}
        onClick={copyToClipboard}
        size="icon"
        variant="ghost"
        {...props}
      >
        {children ?? <Icon size={14} />}
      </Button>
    );
  }
);
StackTraceCopyButton.displayName = 'StackTraceCopyButton';

export type StackTraceExpandButtonProps = ComponentProps<'div'>;

export const StackTraceExpandButton = memo(
  ({ className, ...props }: StackTraceExpandButtonProps) => {
    const { isOpen } = useStackTrace();
    return (
      <div className={cn('flex size-7 items-center justify-center', className)} {...props}>
        <ChevronDownIcon
          className={cn(
            'size-4 text-muted-foreground transition-transform',
            isOpen ? 'rotate-180' : 'rotate-0'
          )}
        />
      </div>
    );
  }
);
StackTraceExpandButton.displayName = 'StackTraceExpandButton';

export * from './stack-trace-frames';
