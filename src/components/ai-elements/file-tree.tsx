'use client';

import type { HTMLAttributes } from 'react';
import { createContext, useCallback, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';

type FileTreeContextValue = {
  expandedPaths: Set<string>;
  togglePath: (path: string) => void;
  selectedPath?: string;
  onSelect?: (path: string) => void;
};

const noop = () => undefined;

export const FileTreeContext = createContext<FileTreeContextValue>({
  expandedPaths: new Set(),
  togglePath: noop,
});

export type FileTreeProps = Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> & {
  expanded?: Set<string>;
  defaultExpanded?: Set<string>;
  selectedPath?: string;
  onSelect?: (path: string) => void;
  onExpandedChange?: (expanded: Set<string>) => void;
};

export const FileTree = ({
  expanded: controlledExpanded,
  defaultExpanded = new Set(),
  selectedPath,
  onSelect,
  onExpandedChange,
  className,
  children,
  ...props
}: FileTreeProps) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expandedPaths = controlledExpanded ?? internalExpanded;

  const togglePath = useCallback(
    (path: string) => {
      const nextExpanded = new Set(expandedPaths);
      if (nextExpanded.has(path)) {
        nextExpanded.delete(path);
      } else {
        nextExpanded.add(path);
      }

      if (controlledExpanded === undefined) {
        setInternalExpanded(nextExpanded);
      }
      onExpandedChange?.(nextExpanded);
    },
    [controlledExpanded, expandedPaths, onExpandedChange]
  );

  const contextValue = useMemo(
    () => ({ expandedPaths, onSelect, selectedPath, togglePath }),
    [expandedPaths, onSelect, selectedPath, togglePath]
  );

  return (
    <FileTreeContext.Provider value={contextValue}>
      {/* The padding lives on the tree element itself. A wrapper div between
          `tree` and its `treeitem`s reads as a generic role, which breaks the
          ownership chain axe checks for aria-required-parent. */}
      <div
        className={cn('rounded-lg border bg-background p-2 font-mono text-sm', className)}
        role="tree"
        {...props}
      >
        {children}
      </div>
    </FileTreeContext.Provider>
  );
};

export type FileTreeIconProps = HTMLAttributes<HTMLSpanElement>;

export const FileTreeIcon = ({ className, children, ...props }: FileTreeIconProps) => (
  <span className={cn('shrink-0', className)} {...props}>
    {children}
  </span>
);

export type FileTreeNameProps = HTMLAttributes<HTMLSpanElement>;

export const FileTreeName = ({ className, children, ...props }: FileTreeNameProps) => (
  <span className={cn('truncate', className)} {...props}>
    {children}
  </span>
);

export * from './file-tree-items';
