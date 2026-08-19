'use client';

import { PaperclipIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type QueueItemProps = ComponentProps<'li'>;

export const QueueItem = ({ className, ...props }: QueueItemProps) => (
  <li
    className={cn(
      'group flex flex-col gap-1 rounded-md px-3 py-1 text-sm transition-colors hover:bg-muted',
      className
    )}
    {...props}
  />
);

export type QueueItemIndicatorProps = ComponentProps<'span'> & {
  completed?: boolean;
};

export const QueueItemIndicator = ({
  completed = false,
  className,
  ...props
}: QueueItemIndicatorProps) => (
  <span
    className={cn(
      'mt-0.5 inline-block size-2.5 rounded-full border',
      completed
        ? 'border-muted-foreground/20 bg-muted-foreground/10'
        : 'border-muted-foreground/50',
      className
    )}
    {...props}
  />
);

export type QueueItemContentProps = ComponentProps<'span'> & {
  completed?: boolean;
};

export const QueueItemContent = ({
  completed = false,
  className,
  ...props
}: QueueItemContentProps) => (
  <span
    className={cn(
      'line-clamp-1 grow break-words',
      completed ? 'text-muted-foreground/50 line-through' : 'text-muted-foreground',
      className
    )}
    {...props}
  />
);

export type QueueItemDescriptionProps = ComponentProps<'div'> & {
  completed?: boolean;
};

export const QueueItemDescription = ({
  completed = false,
  className,
  ...props
}: QueueItemDescriptionProps) => (
  <div
    className={cn(
      'ml-6 text-xs',
      completed ? 'text-muted-foreground/40 line-through' : 'text-muted-foreground',
      className
    )}
    {...props}
  />
);

export type QueueItemActionsProps = ComponentProps<'div'>;

export const QueueItemActions = ({ className, ...props }: QueueItemActionsProps) => (
  <div className={cn('flex gap-1', className)} {...props} />
);

export type QueueItemActionProps = Omit<ComponentProps<typeof Button>, 'variant' | 'size'>;

export const QueueItemAction = ({ className, ...props }: QueueItemActionProps) => (
  <Button
    className={cn(
      'size-auto rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted-foreground/10 hover:text-foreground',
      className
    )}
    size="icon"
    type="button"
    variant="ghost"
    {...props}
  />
);

export type QueueItemAttachmentProps = ComponentProps<'div'>;

export const QueueItemAttachment = ({ className, ...props }: QueueItemAttachmentProps) => (
  <div className={cn('mt-1 flex flex-wrap gap-2', className)} {...props} />
);

export type QueueItemImageProps = ComponentProps<'img'>;

export const QueueItemImage = ({ className, ...props }: QueueItemImageProps) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    alt=""
    className={cn('h-8 w-8 rounded border object-cover', className)}
    height={32}
    width={32}
    {...props}
  />
);

export type QueueItemFileProps = ComponentProps<'span'>;

export const QueueItemFile = ({ children, className, ...props }: QueueItemFileProps) => (
  <span
    className={cn('flex items-center gap-1 rounded border bg-muted px-2 py-1 text-xs', className)}
    {...props}
  >
    <PaperclipIcon size={12} />
    <span className="max-w-[100px] truncate">{children}</span>
  </span>
);
