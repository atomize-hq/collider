'use client';

import {
  CheckCircle2Icon,
  ChevronRightIcon,
  CircleDotIcon,
  CircleIcon,
  XCircleIcon,
} from 'lucide-react';
import type { ComponentProps, HTMLAttributes, ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

import type { TestStatus } from './test-results';

type TestSuiteContextValue = {
  name: string;
  status: TestStatus;
};

const TestSuiteContext = createContext<TestSuiteContextValue>({ name: '', status: 'passed' });

const statusStyles: Record<TestStatus, string> = {
  failed: 'text-destructive',
  passed: 'text-success',
  running: 'text-info',
  skipped: 'text-warning',
};

const statusIcons: Record<TestStatus, ReactNode> = {
  failed: <XCircleIcon className="size-4" />,
  passed: <CheckCircle2Icon className="size-4" />,
  running: <CircleDotIcon className="size-4 animate-pulse" />,
  skipped: <CircleIcon className="size-4" />,
};

export const TestStatusIcon = ({ status }: { status: TestStatus }) => (
  <span className={cn('shrink-0', statusStyles[status])}>{statusIcons[status]}</span>
);

export type TestSuiteProps = ComponentProps<typeof Collapsible> & {
  name: string;
  status: TestStatus;
};

export const TestSuite = ({ name, status, className, children, ...props }: TestSuiteProps) => {
  const contextValue = useMemo(() => ({ name, status }), [name, status]);

  return (
    <TestSuiteContext.Provider value={contextValue}>
      <Collapsible className={cn('rounded-lg border', className)} {...props}>
        {children}
      </Collapsible>
    </TestSuiteContext.Provider>
  );
};

export type TestSuiteNameProps = ComponentProps<typeof CollapsibleTrigger>;

export const TestSuiteName = ({ className, children, ...props }: TestSuiteNameProps) => {
  const { name, status } = useContext(TestSuiteContext);

  return (
    <CollapsibleTrigger
      className={cn(
        'group flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/50',
        className
      )}
      {...props}
    >
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
      <TestStatusIcon status={status} />
      <span className="text-sm font-medium">{children ?? name}</span>
    </CollapsibleTrigger>
  );
};

export type TestSuiteStatsProps = HTMLAttributes<HTMLDivElement> & {
  passed?: number;
  failed?: number;
  skipped?: number;
};

export const TestSuiteStats = ({
  passed = 0,
  failed = 0,
  skipped = 0,
  className,
  children,
  ...props
}: TestSuiteStatsProps) => (
  <div className={cn('ml-auto flex items-center gap-2 text-xs', className)} {...props}>
    {children ?? (
      <>
        {passed > 0 && <span className="text-success">{passed} passed</span>}
        {failed > 0 && <span className="text-destructive">{failed} failed</span>}
        {skipped > 0 && <span className="text-warning">{skipped} skipped</span>}
      </>
    )}
  </div>
);

export type TestSuiteContentProps = ComponentProps<typeof CollapsibleContent>;

export const TestSuiteContent = ({ className, children, ...props }: TestSuiteContentProps) => (
  <CollapsibleContent className={cn('border-t', className)} {...props}>
    <div className="divide-y">{children}</div>
  </CollapsibleContent>
);
