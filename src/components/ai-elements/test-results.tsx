'use client';

import { CheckCircle2Icon, CircleIcon, XCircleIcon } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { createContext, useContext, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type TestStatus = 'passed' | 'failed' | 'skipped' | 'running';

export type TestResultsSummary = {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  duration?: number;
};

type TestResultsContextValue = {
  summary?: TestResultsSummary;
};

const TestResultsContext = createContext<TestResultsContextValue>({});

const formatDuration = (milliseconds: number) =>
  milliseconds < 1000 ? `${milliseconds}ms` : `${(milliseconds / 1000).toFixed(2)}s`;

export type TestResultsHeaderProps = HTMLAttributes<HTMLDivElement>;

export const TestResultsHeader = ({ className, children, ...props }: TestResultsHeaderProps) => (
  <div className={cn('flex items-center justify-between border-b px-4 py-3', className)} {...props}>
    {children}
  </div>
);

export type TestResultsDurationProps = HTMLAttributes<HTMLSpanElement>;

export const TestResultsDuration = ({
  className,
  children,
  ...props
}: TestResultsDurationProps) => {
  const { summary } = useContext(TestResultsContext);
  if (!summary?.duration) return null;

  return (
    <span className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children ?? formatDuration(summary.duration)}
    </span>
  );
};

export type TestResultsSummaryProps = HTMLAttributes<HTMLDivElement>;

export const TestResultsSummary = ({ className, children, ...props }: TestResultsSummaryProps) => {
  const { summary } = useContext(TestResultsContext);
  if (!summary) return null;

  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      {children ?? (
        <>
          <Badge className="gap-1 bg-success/10 text-success" variant="secondary">
            <CheckCircle2Icon className="size-3" />
            {summary.passed} passed
          </Badge>
          {summary.failed > 0 && (
            <Badge className="gap-1 bg-destructive/10 text-destructive" variant="secondary">
              <XCircleIcon className="size-3" />
              {summary.failed} failed
            </Badge>
          )}
          {summary.skipped > 0 && (
            <Badge className="gap-1 bg-warning/10 text-warning" variant="secondary">
              <CircleIcon className="size-3" />
              {summary.skipped} skipped
            </Badge>
          )}
        </>
      )}
    </div>
  );
};

export type TestResultsProps = HTMLAttributes<HTMLDivElement> & {
  summary?: TestResultsSummary;
};

export const TestResults = ({ summary, className, children, ...props }: TestResultsProps) => {
  const contextValue = useMemo(() => ({ summary }), [summary]);

  return (
    <TestResultsContext.Provider value={contextValue}>
      <div className={cn('rounded-lg border bg-background', className)} {...props}>
        {children ??
          (summary && (
            <TestResultsHeader>
              <TestResultsSummary />
              <TestResultsDuration />
            </TestResultsHeader>
          ))}
      </div>
    </TestResultsContext.Provider>
  );
};

export type TestResultsProgressProps = HTMLAttributes<HTMLDivElement>;

export const TestResultsProgress = ({
  className,
  children,
  ...props
}: TestResultsProgressProps) => {
  const { summary } = useContext(TestResultsContext);
  if (!summary) return null;

  const passedPercent = (summary.passed / summary.total) * 100;
  const failedPercent = (summary.failed / summary.total) * 100;

  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children ?? (
        <>
          <div className="flex h-2 overflow-hidden rounded-full bg-muted">
            <div className="bg-success transition-all" style={{ width: `${passedPercent}%` }} />
            <div className="bg-destructive transition-all" style={{ width: `${failedPercent}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {summary.passed}/{summary.total} tests passed
            </span>
            <span>{passedPercent.toFixed(0)}%</span>
          </div>
        </>
      )}
    </div>
  );
};

export type TestResultsContentProps = HTMLAttributes<HTMLDivElement>;

export const TestResultsContent = ({ className, children, ...props }: TestResultsContentProps) => (
  <div className={cn('space-y-2 p-4', className)} {...props}>
    {children}
  </div>
);

export * from './test-results-suite';
export * from './test-results-test';
