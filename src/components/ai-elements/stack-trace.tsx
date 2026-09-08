'use client';

import { useControllableState } from '@radix-ui/react-use-controllable-state';
import type { ComponentProps } from 'react';
import { createContext, memo, useContext, useMemo } from 'react';

import { Collapsible } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const STACK_FRAME_WITH_PARENS_REGEX = /^at\s+(.+?)\s+\((.+):(\d+):(\d+)\)$/;
const STACK_FRAME_WITHOUT_FN_REGEX = /^at\s+(.+):(\d+):(\d+)$/;
const ERROR_TYPE_REGEX = /^(\w+Error|Error):\s*(.*)$/;

export interface StackFrame {
  raw: string;
  functionName: string | null;
  filePath: string | null;
  lineNumber: number | null;
  columnNumber: number | null;
  isInternal: boolean;
}

export interface ParsedStackTrace {
  errorType: string | null;
  errorMessage: string;
  frames: StackFrame[];
  raw: string;
}

export interface StackTraceContextValue {
  trace: ParsedStackTrace;
  raw: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onFilePathClick?: (filePath: string, line?: number, column?: number) => void;
}

export const StackTraceContext = createContext<StackTraceContextValue | null>(null);

export const useStackTrace = () => {
  const context = useContext(StackTraceContext);
  if (!context) {
    throw new Error('StackTrace components must be used within StackTrace');
  }
  return context;
};

const parseStackFrame = (line: string): StackFrame => {
  const trimmed = line.trim();

  const withParensMatch = trimmed.match(STACK_FRAME_WITH_PARENS_REGEX);
  if (withParensMatch) {
    const [, functionName, filePath, lineNum, colNum] = withParensMatch;
    const isInternal =
      filePath.includes('node_modules') ||
      filePath.startsWith('node:') ||
      filePath.includes('internal/');
    return {
      columnNumber: colNum ? Number.parseInt(colNum, 10) : null,
      filePath: filePath ?? null,
      functionName: functionName ?? null,
      isInternal,
      lineNumber: lineNum ? Number.parseInt(lineNum, 10) : null,
      raw: trimmed,
    };
  }

  const withoutFnMatch = trimmed.match(STACK_FRAME_WITHOUT_FN_REGEX);
  if (withoutFnMatch) {
    const [, filePath, lineNum, colNum] = withoutFnMatch;
    const isInternal =
      (filePath?.includes('node_modules') ?? false) ||
      (filePath?.startsWith('node:') ?? false) ||
      (filePath?.includes('internal/') ?? false);
    return {
      columnNumber: colNum ? Number.parseInt(colNum, 10) : null,
      filePath: filePath ?? null,
      functionName: null,
      isInternal,
      lineNumber: lineNum ? Number.parseInt(lineNum, 10) : null,
      raw: trimmed,
    };
  }

  return {
    columnNumber: null,
    filePath: null,
    functionName: null,
    isInternal: trimmed.includes('node_modules') || trimmed.includes('node:'),
    lineNumber: null,
    raw: trimmed,
  };
};

const parseStackTrace = (trace: string): ParsedStackTrace => {
  const lines = trace.split('\n').filter((line) => line.trim());

  if (lines.length === 0) {
    return { errorMessage: trace, errorType: null, frames: [], raw: trace };
  }

  const firstLine = lines[0].trim();
  let errorType: string | null = null;
  let errorMessage = firstLine;

  const errorMatch = firstLine.match(ERROR_TYPE_REGEX);
  if (errorMatch) {
    const [, type, msg] = errorMatch;
    errorType = type;
    errorMessage = msg || '';
  }

  const frames = lines
    .slice(1)
    .filter((line) => line.trim().startsWith('at '))
    .map(parseStackFrame);

  return { errorMessage, errorType, frames, raw: trace };
};

export type StackTraceProps = ComponentProps<'div'> & {
  trace: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onFilePathClick?: (filePath: string, line?: number, column?: number) => void;
};

export const StackTrace = memo(
  ({
    trace,
    className,
    open,
    defaultOpen = false,
    onOpenChange,
    onFilePathClick,
    children,
    ...props
  }: StackTraceProps) => {
    const [isOpen = false, setIsOpen] = useControllableState({
      defaultProp: defaultOpen,
      onChange: onOpenChange,
      prop: open,
    });

    const parsedTrace = useMemo(() => parseStackTrace(trace), [trace]);

    const contextValue = useMemo(
      () => ({
        isOpen,
        onFilePathClick,
        raw: trace,
        setIsOpen: (next: boolean) => setIsOpen(next),
        trace: parsedTrace,
      }),
      [parsedTrace, trace, isOpen, setIsOpen, onFilePathClick]
    );

    // ONE Collapsible root for the whole component. Header and content used to
    // mount a Collapsible each, so Radix minted two content ids and the
    // trigger's `aria-controls` pointed at an element that never rendered.
    return (
      <StackTraceContext.Provider value={contextValue}>
        <Collapsible asChild onOpenChange={setIsOpen} open={isOpen}>
          <div
            className={cn(
              'not-prose w-full overflow-hidden rounded-lg border bg-background font-mono text-sm',
              className
            )}
            {...props}
          >
            {children}
          </div>
        </Collapsible>
      </StackTraceContext.Provider>
    );
  }
);

StackTrace.displayName = 'StackTrace';

export * from './stack-trace-header';
