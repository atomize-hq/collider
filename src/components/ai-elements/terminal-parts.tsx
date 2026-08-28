'use client';

import { CheckIcon, CopyIcon, TerminalIcon, Trash2Icon } from 'lucide-react';
import type { ComponentProps, HTMLAttributes } from 'react';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TerminalContext } from './terminal';

export type TerminalHeaderProps = HTMLAttributes<HTMLDivElement>;

export const TerminalHeader = ({ className, children, ...props }: TerminalHeaderProps) => (
  <div className={cn('flex items-center justify-between border-b px-4 py-2', className)} {...props}>
    {children}
  </div>
);

export type TerminalTitleProps = HTMLAttributes<HTMLDivElement>;

export const TerminalTitle = ({ className, children, ...props }: TerminalTitleProps) => (
  <div
    className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}
    {...props}
  >
    <TerminalIcon className="size-4" />
    {children ?? 'Terminal'}
  </div>
);

export type TerminalStatusProps = HTMLAttributes<HTMLDivElement>;

export const TerminalStatus = ({ className, children, ...props }: TerminalStatusProps) => {
  const { isStreaming } = useContext(TerminalContext);

  if (!isStreaming) {
    return null;
  }

  return (
    <div
      className={cn('flex items-center gap-2 text-xs text-muted-foreground', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export type TerminalActionsProps = HTMLAttributes<HTMLDivElement>;

export const TerminalActions = ({ className, children, ...props }: TerminalActionsProps) => (
  <div className={cn('flex items-center gap-1', className)} {...props}>
    {children}
  </div>
);

export type TerminalCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export const TerminalCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: TerminalCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number>(0);
  const { output } = useContext(TerminalContext);

  const copyToClipboard = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator?.clipboard?.writeText) {
      onError?.(new Error('Clipboard API not available'));
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setIsCopied(true);
      onCopy?.();
      timeoutRef.current = window.setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [output, onCopy, onError, timeout]);

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    []
  );

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <Button
      className={cn('size-7 shrink-0 text-muted-foreground', className)}
      onClick={copyToClipboard}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <Icon size={14} />}
    </Button>
  );
};

export type TerminalClearButtonProps = ComponentProps<typeof Button>;

export const TerminalClearButton = ({
  children,
  className,
  ...props
}: TerminalClearButtonProps) => {
  const { onClear } = useContext(TerminalContext);

  if (!onClear) {
    return null;
  }

  return (
    <Button
      className={cn('size-7 shrink-0 text-muted-foreground', className)}
      onClick={onClear}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <Trash2Icon size={14} />}
    </Button>
  );
};
