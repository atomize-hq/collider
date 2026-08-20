'use client';

import type { ComponentProps } from 'react';
import { memo, useCallback } from 'react';

import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

import { type StackFrame, useStackTrace } from './stack-trace';

const AT_PREFIX_REGEX = /^at\s+/;

export type StackTraceContentProps = ComponentProps<typeof CollapsibleContent> & {
  maxHeight?: number;
};

export const StackTraceContent = memo(
  ({ className, maxHeight = 400, children, ...props }: StackTraceContentProps) => {
    const { isOpen } = useStackTrace();
    return (
      <Collapsible open={isOpen}>
        <CollapsibleContent
          className={cn(
            'overflow-auto border-t bg-muted/30',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=open]:animate-in',
            className
          )}
          style={{ maxHeight }}
          {...props}
        >
          {children}
        </CollapsibleContent>
      </Collapsible>
    );
  }
);
StackTraceContent.displayName = 'StackTraceContent';

export type StackTraceFramesProps = ComponentProps<'div'> & {
  showInternalFrames?: boolean;
};

interface FilePathButtonProps {
  frame: StackFrame;
  onFilePathClick?: (filePath: string, lineNumber?: number, columnNumber?: number) => void;
}

const FilePathButton = memo(({ frame, onFilePathClick }: FilePathButtonProps) => {
  const handleClick = useCallback(() => {
    if (frame.filePath) {
      onFilePathClick?.(
        frame.filePath,
        frame.lineNumber ?? undefined,
        frame.columnNumber ?? undefined
      );
    }
  }, [frame, onFilePathClick]);

  return (
    <button
      className={cn(
        'underline decoration-dotted hover:text-primary',
        onFilePathClick && 'cursor-pointer'
      )}
      disabled={!onFilePathClick}
      onClick={handleClick}
      type="button"
    >
      {frame.filePath}
      {frame.lineNumber !== null && `:${frame.lineNumber}`}
      {frame.columnNumber !== null && `:${frame.columnNumber}`}
    </button>
  );
});
FilePathButton.displayName = 'FilePathButton';

export const StackTraceFrames = memo(
  ({ className, showInternalFrames = true, ...props }: StackTraceFramesProps) => {
    const { trace, onFilePathClick } = useStackTrace();
    const framesToShow = showInternalFrames
      ? trace.frames
      : trace.frames.filter((f) => !f.isInternal);

    return (
      <div className={cn('space-y-1 p-3', className)} {...props}>
        {framesToShow.map((frame) => (
          <div
            className={cn(
              'text-xs',
              frame.isInternal ? 'text-muted-foreground/50' : 'text-foreground/90'
            )}
            key={frame.raw}
          >
            <span className="text-muted-foreground">at </span>
            {frame.functionName && (
              <span className={frame.isInternal ? '' : 'text-foreground'}>
                {frame.functionName}{' '}
              </span>
            )}
            {frame.filePath && (
              <>
                <span className="text-muted-foreground">(</span>
                <FilePathButton frame={frame} onFilePathClick={onFilePathClick} />
                <span className="text-muted-foreground">)</span>
              </>
            )}
            {!(frame.filePath || frame.functionName) && (
              <span>{frame.raw.replace(AT_PREFIX_REGEX, '')}</span>
            )}
          </div>
        ))}
        {framesToShow.length === 0 && (
          <div className="text-xs text-muted-foreground">No stack frames</div>
        )}
      </div>
    );
  }
);
StackTraceFrames.displayName = 'StackTraceFrames';
