'use client';

import { CheckIcon, CopyIcon, GitCommitIcon } from 'lucide-react';
import type { ComponentProps, HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export type CommitProps = ComponentProps<typeof Collapsible>;

export const Commit = ({ className, children, ...props }: CommitProps) => (
  <Collapsible className={cn('rounded-lg border bg-background', className)} {...props}>
    {children}
  </Collapsible>
);

export type CommitHeaderProps = ComponentProps<typeof CollapsibleTrigger> & {
  actions?: ReactNode;
};

// The trigger is a real <button>: `aria-expanded` is not a permitted attribute
// on a role-less div, and a div needs a hand-rolled Enter/Space handler that a
// button gets for free. Row-level controls are rendered as a SIBLING of the
// trigger rather than inside it — nesting a focusable control inside a button
// is invalid, so `actions` cannot travel through `children`.
export const CommitHeader = ({ className, children, actions, ...props }: CommitHeaderProps) => (
  <div className="flex items-center justify-between gap-4 pr-3">
    <CollapsibleTrigger asChild {...props}>
      <button
        className={cn(
          'group flex flex-1 cursor-pointer items-center gap-4 p-3 text-left transition-colors hover:opacity-80 focus-visible:focus-ring',
          className
        )}
        type="button"
      >
        {children}
      </button>
    </CollapsibleTrigger>
    {actions}
  </div>
);

export type CommitHashProps = HTMLAttributes<HTMLSpanElement>;

export const CommitHash = ({ className, children, ...props }: CommitHashProps) => (
  <span className={cn('font-mono text-xs', className)} {...props}>
    <GitCommitIcon className="mr-1 inline-block size-3" />
    {children}
  </span>
);

export type CommitMessageProps = HTMLAttributes<HTMLSpanElement>;

export const CommitMessage = ({ className, children, ...props }: CommitMessageProps) => (
  <span className={cn('text-sm font-medium', className)} {...props}>
    {children}
  </span>
);

export type CommitMetadataProps = HTMLAttributes<HTMLDivElement>;

export const CommitMetadata = ({ className, children, ...props }: CommitMetadataProps) => (
  <div
    className={cn('flex items-center gap-2 text-xs text-muted-foreground', className)}
    {...props}
  >
    {children}
  </div>
);

export type CommitSeparatorProps = HTMLAttributes<HTMLSpanElement>;

export const CommitSeparator = ({ className, children, ...props }: CommitSeparatorProps) => (
  <span className={className} {...props}>
    {children ?? '•'}
  </span>
);

export type CommitInfoProps = HTMLAttributes<HTMLDivElement>;

export const CommitInfo = ({ className, children, ...props }: CommitInfoProps) => (
  <div className={cn('flex flex-1 flex-col', className)} {...props}>
    {children}
  </div>
);

export type CommitAuthorProps = HTMLAttributes<HTMLDivElement>;

export const CommitAuthor = ({ className, children, ...props }: CommitAuthorProps) => (
  <div className={cn('flex items-center', className)} {...props}>
    {children}
  </div>
);

export type CommitAuthorAvatarProps = ComponentProps<typeof Avatar> & {
  initials: string;
};

export const CommitAuthorAvatar = ({ initials, className, ...props }: CommitAuthorAvatarProps) => (
  <Avatar className={cn('size-8', className)} {...props}>
    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
  </Avatar>
);

export type CommitTimestampProps = HTMLAttributes<HTMLTimeElement> & {
  date: Date;
};

const relativeTimeFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const formatRelativeDate = (date: Date) => {
  const days = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return relativeTimeFormat.format(days, 'day');
};

export const CommitTimestamp = ({ date, className, children, ...props }: CommitTimestampProps) => {
  const [formatted, setFormatted] = useState('');

  useEffect(() => {
    setFormatted(formatRelativeDate(date));
  }, [date]);

  return (
    <time className={cn('text-xs', className)} dateTime={date.toISOString()} {...props}>
      {children ?? formatted}
    </time>
  );
};

export type CommitActionsProps = HTMLAttributes<HTMLDivElement>;

const stopMouse = (e: MouseEvent) => e.stopPropagation();
const stopKey = (e: KeyboardEvent) => e.stopPropagation();

export const CommitActions = ({ className, children, ...props }: CommitActionsProps) => (
  <div
    className={cn('flex items-center gap-1', className)}
    onClick={stopMouse}
    onKeyDown={stopKey}
    role="group"
    {...props}
  >
    {children}
  </div>
);

export type CommitCopyButtonProps = ComponentProps<typeof Button> & {
  hash: string;
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export const CommitCopyButton = ({
  hash,
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: CommitCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number>(0);

  const copyToClipboard = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator?.clipboard?.writeText) {
      onError?.(new Error('Clipboard API not available'));
      return;
    }

    try {
      if (!isCopied) {
        await navigator.clipboard.writeText(hash);
        setIsCopied(true);
        onCopy?.();
        timeoutRef.current = window.setTimeout(() => setIsCopied(false), timeout);
      }
    } catch (error) {
      onError?.(error as Error);
    }
  }, [hash, onCopy, onError, timeout, isCopied]);

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    []
  );

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <Button
      aria-label={children ? undefined : 'Copy commit hash'}
      className={cn('size-7 shrink-0', className)}
      onClick={copyToClipboard}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <Icon size={14} />}
    </Button>
  );
};

export * from './commit-files';
