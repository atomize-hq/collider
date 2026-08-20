'use client';

import { FileIcon, MinusIcon, PlusIcon } from 'lucide-react';
import type { ComponentProps, HTMLAttributes } from 'react';

import { CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export type CommitContentProps = ComponentProps<typeof CollapsibleContent>;

export const CommitContent = ({ className, children, ...props }: CommitContentProps) => (
  <CollapsibleContent className={cn('border-t p-3', className)} {...props}>
    {children}
  </CollapsibleContent>
);

export type CommitFilesProps = HTMLAttributes<HTMLDivElement>;

export const CommitFiles = ({ className, children, ...props }: CommitFilesProps) => (
  <div className={cn('space-y-1', className)} {...props}>
    {children}
  </div>
);

export type CommitFileProps = HTMLAttributes<HTMLDivElement>;

export const CommitFile = ({ className, children, ...props }: CommitFileProps) => (
  <div
    className={cn(
      'flex items-center justify-between gap-2 rounded px-2 py-1 text-sm hover:bg-muted/50',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type CommitFileInfoProps = HTMLAttributes<HTMLDivElement>;

export const CommitFileInfo = ({ className, children, ...props }: CommitFileInfoProps) => (
  <div className={cn('flex min-w-0 items-center gap-2', className)} {...props}>
    {children}
  </div>
);

export type CommitFileStatusKind = 'added' | 'modified' | 'deleted' | 'renamed';

const fileStatusStyles: Record<CommitFileStatusKind, string> = {
  added: 'text-green-600 dark:text-green-400',
  deleted: 'text-red-600 dark:text-red-400',
  modified: 'text-yellow-600 dark:text-yellow-400',
  renamed: 'text-blue-600 dark:text-blue-400',
};

const fileStatusLabels: Record<CommitFileStatusKind, string> = {
  added: 'A',
  deleted: 'D',
  modified: 'M',
  renamed: 'R',
};

export type CommitFileStatusProps = HTMLAttributes<HTMLSpanElement> & {
  status: CommitFileStatusKind;
};

export const CommitFileStatus = ({
  status,
  className,
  children,
  ...props
}: CommitFileStatusProps) => (
  <span
    className={cn('font-mono text-xs font-medium', fileStatusStyles[status], className)}
    {...props}
  >
    {children ?? fileStatusLabels[status]}
  </span>
);

export type CommitFileIconProps = ComponentProps<typeof FileIcon>;

export const CommitFileIcon = ({ className, ...props }: CommitFileIconProps) => (
  <FileIcon className={cn('size-3.5 shrink-0 text-muted-foreground', className)} {...props} />
);

export type CommitFilePathProps = HTMLAttributes<HTMLSpanElement>;

export const CommitFilePath = ({ className, children, ...props }: CommitFilePathProps) => (
  <span className={cn('truncate font-mono text-xs', className)} {...props}>
    {children}
  </span>
);

export type CommitFileChangesProps = HTMLAttributes<HTMLDivElement>;

export const CommitFileChanges = ({ className, children, ...props }: CommitFileChangesProps) => (
  <div className={cn('flex shrink-0 items-center gap-1 font-mono text-xs', className)} {...props}>
    {children}
  </div>
);

export type CommitFileAdditionsProps = HTMLAttributes<HTMLSpanElement> & {
  count: number;
};

export const CommitFileAdditions = ({
  count,
  className,
  children,
  ...props
}: CommitFileAdditionsProps) => {
  if (count <= 0) {
    return null;
  }

  return (
    <span className={cn('text-green-600 dark:text-green-400', className)} {...props}>
      {children ?? (
        <>
          <PlusIcon className="inline-block size-3" />
          {count}
        </>
      )}
    </span>
  );
};

export type CommitFileDeletionsProps = HTMLAttributes<HTMLSpanElement> & {
  count: number;
};

export const CommitFileDeletions = ({
  count,
  className,
  children,
  ...props
}: CommitFileDeletionsProps) => {
  if (count <= 0) {
    return null;
  }

  return (
    <span className={cn('text-red-600 dark:text-red-400', className)} {...props}>
      {children ?? (
        <>
          <MinusIcon className="inline-block size-3" />
          {count}
        </>
      )}
    </span>
  );
};
