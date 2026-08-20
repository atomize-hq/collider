'use client';

import { AlertTriangleIcon, CheckIcon, ChevronDownIcon, CopyIcon } from 'lucide-react';
import type { ComponentProps, KeyboardEvent, MouseEvent } from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

import { useStackTrace } from './stack-trace';

export type StackTraceHeaderProps = ComponentProps<typeof CollapsibleTrigger>;

const activateOnEnterSpace = (event: KeyboardEvent<HTMLDivElement>) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    (event.currentTarget as HTMLDivElement).click();
  }
};

export const StackTraceHeader = memo(({ className, children, ...props }: StackTraceHeaderProps) => {
  const { isOpen, setIsOpen } = useStackTrace();

  return (
    <Collapsible onOpenChange={setIsOpen} open={isOpen}>
      <CollapsibleTrigger asChild {...props}>
        <div
          className={cn(
            'flex w-full cursor-pointer items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none',
            className
          )}
          onKeyDown={activateOnEnterSpace}
          tabIndex={0}
        >
          {children}
        </div>
      </CollapsibleTrigger>
    </Collapsible>
  );
});
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
