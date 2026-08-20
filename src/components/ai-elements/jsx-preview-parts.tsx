'use client';

import { AlertCircle } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { memo, useCallback, useState } from 'react';
import JsxParser from 'react-jsx-parser';

import { cn } from '@/lib/utils';

import { useJSXPreview } from './jsx-preview';

export type JSXPreviewContentProps = Omit<ComponentProps<'div'>, 'children'>;

export const JSXPreviewContent = memo(({ className, ...props }: JSXPreviewContentProps) => {
  const { processedJsx, isStreaming, components, bindings, setError, setLastGoodJsx, onErrorProp } =
    useJSXPreview();
  const [errorReportedFor, setErrorReportedFor] = useState<string | null>(null);
  const [lastGoodJsx, setLocalLastGoodJsx] = useState('');
  const [hadError, setHadError] = useState(false);
  const [prevProcessedJsx, setPrevProcessedJsx] = useState(processedJsx);

  if (processedJsx !== prevProcessedJsx) {
    setPrevProcessedJsx(processedJsx);
    setErrorReportedFor(null);
    setHadError(false);
    setLocalLastGoodJsx(processedJsx);
    setLastGoodJsx(processedJsx);
  }

  const handleError = useCallback(
    (err: Error) => {
      if (errorReportedFor === processedJsx) {
        return;
      }
      setErrorReportedFor(processedJsx);

      if (isStreaming) {
        setHadError(true);
        return;
      }

      setError(err);
      onErrorProp?.(err);
    },
    [processedJsx, errorReportedFor, isStreaming, onErrorProp, setError]
  );

  const displayJsx = isStreaming && hadError ? lastGoodJsx : processedJsx;

  return (
    <div className={cn('jsx-preview-content', className)} {...props}>
      <JsxParser
        bindings={bindings}
        components={components}
        jsx={displayJsx}
        onError={handleError}
        renderInWrapper={false}
      />
    </div>
  );
});
JSXPreviewContent.displayName = 'JSXPreviewContent';

export type JSXPreviewErrorProps = ComponentProps<'div'> & {
  children?: ReactNode | ((error: Error) => ReactNode);
};

const renderChildren = (
  children: ReactNode | ((error: Error) => ReactNode),
  error: Error
): ReactNode => {
  if (typeof children === 'function') {
    return children(error);
  }
  return children;
};

export const JSXPreviewError = memo(({ className, children, ...props }: JSXPreviewErrorProps) => {
  const { error } = useJSXPreview();

  if (!error) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive',
        className
      )}
      {...props}
    >
      {children ? (
        renderChildren(children, error)
      ) : (
        <>
          <AlertCircle className="size-4 shrink-0" />
          <span>{error.message}</span>
        </>
      )}
    </div>
  );
});
JSXPreviewError.displayName = 'JSXPreviewError';
