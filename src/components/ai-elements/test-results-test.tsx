'use client';

import type { HTMLAttributes } from 'react';
import { createContext, useContext, useMemo } from 'react';

import { cn } from '@/lib/utils';

import { TestStatusIcon } from './test-results-suite';
import type { TestStatus as TestResultStatus } from './test-results';

type TestContextValue = {
  name: string;
  status: TestResultStatus;
  duration?: number;
};

const TestContext = createContext<TestContextValue>({ name: '', status: 'passed' });

export type TestNameProps = HTMLAttributes<HTMLSpanElement>;

export const TestName = ({ className, children, ...props }: TestNameProps) => {
  const { name } = useContext(TestContext);
  return (
    <span className={cn('flex-1', className)} {...props}>
      {children ?? name}
    </span>
  );
};

export type TestDurationProps = HTMLAttributes<HTMLSpanElement>;

export const TestDuration = ({ className, children, ...props }: TestDurationProps) => {
  const { duration } = useContext(TestContext);
  if (duration === undefined) return null;

  return (
    <span className={cn('ml-auto text-xs text-muted-foreground', className)} {...props}>
      {children ?? `${duration}ms`}
    </span>
  );
};

export type TestStatusProps = HTMLAttributes<HTMLSpanElement>;

export const TestStatus = ({ className, children, ...props }: TestStatusProps) => {
  const { status } = useContext(TestContext);
  return (
    <span className={cn('shrink-0', className)} {...props}>
      {children ?? <TestStatusIcon status={status} />}
    </span>
  );
};

export type TestProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  status: TestResultStatus;
  duration?: number;
};

export const Test = ({ name, status, duration, className, children, ...props }: TestProps) => {
  const contextValue = useMemo(() => ({ duration, name, status }), [duration, name, status]);

  return (
    <TestContext.Provider value={contextValue}>
      <div className={cn('flex items-center gap-2 px-4 py-2 text-sm', className)} {...props}>
        {children ?? (
          <>
            <TestStatus />
            <TestName />
            {duration !== undefined && <TestDuration />}
          </>
        )}
      </div>
    </TestContext.Provider>
  );
};

export type TestErrorProps = HTMLAttributes<HTMLDivElement>;

export const TestError = ({ className, children, ...props }: TestErrorProps) => (
  <div className={cn('mt-2 rounded-md bg-destructive/10 p-3', className)} {...props}>
    {children}
  </div>
);

export type TestErrorMessageProps = HTMLAttributes<HTMLParagraphElement>;

export const TestErrorMessage = ({ className, children, ...props }: TestErrorMessageProps) => (
  <p className={cn('text-sm font-medium text-destructive', className)} {...props}>
    {children}
  </p>
);

export type TestErrorStackProps = HTMLAttributes<HTMLPreElement>;

export const TestErrorStack = ({ className, children, ...props }: TestErrorStackProps) => (
  <pre
    className={cn('mt-2 overflow-auto font-mono text-xs text-destructive', className)}
    {...props}
  >
    {children}
  </pre>
);
