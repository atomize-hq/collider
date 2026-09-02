'use client';

import { ChevronRightIcon, FileIcon, FolderIcon, FolderOpenIcon } from 'lucide-react';
import type { HTMLAttributes, KeyboardEvent, ReactNode, SyntheticEvent } from 'react';
import { useCallback, useContext } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

import { FileTreeContext, FileTreeIcon, FileTreeName } from './file-tree';

export type FileTreeFolderProps = HTMLAttributes<HTMLDivElement> & {
  path: string;
  name: string;
};

export const FileTreeFolder = ({
  path,
  name,
  className,
  children,
  ...props
}: FileTreeFolderProps) => {
  const { expandedPaths, togglePath, selectedPath, onSelect } = useContext(FileTreeContext);
  const isExpanded = expandedPaths.has(path);
  const isSelected = selectedPath === path;

  const handleSelect = useCallback(() => onSelect?.(path), [onSelect, path]);

  // `asChild` collapses Radix's own wrapper onto the treeitem. Without it the
  // treeitem sits inside a generic div, which reads as the `generic` role and
  // breaks the `tree`/`group` ownership chain axe checks.
  return (
    <Collapsible asChild onOpenChange={() => togglePath(path)} open={isExpanded}>
      <div
        aria-expanded={isExpanded}
        aria-selected={isSelected}
        className={className}
        role="treeitem"
        {...props}
      >
        <div
          className={cn(
            'flex w-full items-center gap-1 rounded px-2 py-1 text-left transition-colors hover:bg-muted/50',
            isSelected && 'bg-muted'
          )}
        >
          <CollapsibleTrigger asChild>
            <button
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${name}`}
              className="flex shrink-0 items-center rounded focus-visible:focus-ring"
              type="button"
            >
              <ChevronRightIcon
                className={cn(
                  'size-4 shrink-0 text-muted-foreground transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            </button>
          </CollapsibleTrigger>
          <button
            aria-current={isSelected ? 'true' : undefined}
            className="flex min-w-0 flex-1 items-center gap-1 rounded text-left focus-visible:focus-ring"
            onClick={handleSelect}
            type="button"
          >
            <FileTreeIcon>
              {isExpanded ? (
                <FolderOpenIcon className="size-4 text-blue-500" />
              ) : (
                <FolderIcon className="size-4 text-blue-500" />
              )}
            </FileTreeIcon>
            <FileTreeName>{name}</FileTreeName>
          </button>
        </div>
        <CollapsibleContent>
          {/* Nested treeitems need an explicit `group` owner. */}
          <div className="ml-4 border-l pl-2" role="group">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export type FileTreeFileProps = HTMLAttributes<HTMLDivElement> & {
  path: string;
  name: string;
  icon?: ReactNode;
};

export const FileTreeFile = ({
  path,
  name,
  icon,
  className,
  children,
  ...props
}: FileTreeFileProps) => {
  const { selectedPath, onSelect } = useContext(FileTreeContext);
  const isSelected = selectedPath === path;
  const handleSelect = useCallback(() => onSelect?.(path), [onSelect, path]);
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleSelect();
      }
    },
    [handleSelect]
  );

  return (
    <div
      aria-selected={isSelected}
      className={cn(
        'flex cursor-pointer items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-muted/50 focus-visible:focus-ring',
        isSelected && 'bg-muted',
        className
      )}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      role="treeitem"
      tabIndex={0}
      {...props}
    >
      {children ?? (
        <>
          <span aria-hidden="true" className="size-4 shrink-0" />
          <FileTreeIcon>
            {icon ?? <FileIcon className="size-4 text-muted-foreground" />}
          </FileTreeIcon>
          <FileTreeName>{name}</FileTreeName>
        </>
      )}
    </div>
  );
};

export type FileTreeActionsProps = HTMLAttributes<HTMLDivElement>;

const stopPropagation = (event: SyntheticEvent) => event.stopPropagation();

export const FileTreeActions = ({ className, children, ...props }: FileTreeActionsProps) => (
  <div
    className={cn('ml-auto flex items-center gap-1', className)}
    onClick={stopPropagation}
    onKeyDown={stopPropagation}
    role="group"
    {...props}
  >
    {children}
  </div>
);
