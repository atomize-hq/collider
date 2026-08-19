'use client';

import { CheckIcon, CopyIcon } from 'lucide-react';
import type { ComponentProps, HTMLAttributes } from 'react';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { EnvironmentVariableContext, EnvironmentVariablesContext } from './environment-variables';

export type EnvironmentVariableGroupProps = HTMLAttributes<HTMLDivElement>;

export const EnvironmentVariableGroup = ({
  className,
  children,
  ...props
}: EnvironmentVariableGroupProps) => (
  <div className={cn('flex items-center gap-2', className)} {...props}>
    {children}
  </div>
);

export type EnvironmentVariableNameProps = HTMLAttributes<HTMLSpanElement>;

export const EnvironmentVariableName = ({
  className,
  children,
  ...props
}: EnvironmentVariableNameProps) => {
  const { name } = useContext(EnvironmentVariableContext);
  return (
    <span className={cn('font-mono text-sm', className)} {...props}>
      {children ?? name}
    </span>
  );
};

export type EnvironmentVariableValueProps = HTMLAttributes<HTMLSpanElement>;

export const EnvironmentVariableValue = ({
  className,
  children,
  ...props
}: EnvironmentVariableValueProps) => {
  const { value } = useContext(EnvironmentVariableContext);
  const { showValues } = useContext(EnvironmentVariablesContext);
  const displayValue = showValues ? value : '•'.repeat(Math.min(value.length, 20));

  return (
    <span
      className={cn(
        'font-mono text-sm text-muted-foreground',
        !showValues && 'select-none',
        className
      )}
      {...props}
    >
      {children ?? displayValue}
    </span>
  );
};

export type EnvironmentVariableProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  value: string;
};

export const EnvironmentVariable = ({
  name,
  value,
  className,
  children,
  ...props
}: EnvironmentVariableProps) => {
  const contextValue = useMemo(() => ({ name, value }), [name, value]);

  return (
    <EnvironmentVariableContext.Provider value={contextValue}>
      <div
        className={cn('flex items-center justify-between gap-4 px-4 py-3', className)}
        {...props}
      >
        {children ?? (
          <>
            <EnvironmentVariableName />
            <EnvironmentVariableValue />
          </>
        )}
      </div>
    </EnvironmentVariableContext.Provider>
  );
};

export type EnvironmentVariableRequiredProps = ComponentProps<typeof Badge>;

export const EnvironmentVariableRequired = ({
  className,
  children,
  ...props
}: EnvironmentVariableRequiredProps) => (
  <Badge className={cn('text-xs', className)} variant="secondary" {...props}>
    {children ?? 'Required'}
  </Badge>
);

export type EnvironmentVariableCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
  copyFormat?: 'name' | 'value' | 'export';
};

export const EnvironmentVariableCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  copyFormat = 'value',
  children,
  className,
  ...props
}: EnvironmentVariableCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number>(0);
  const { name, value } = useContext(EnvironmentVariableContext);
  const getTextToCopy = useCallback(() => {
    const formats = {
      export: () => `export ${name}="${value}"`,
      name: () => name,
      value: () => value,
    };
    return formats[copyFormat]();
  }, [copyFormat, name, value]);
  const copyToClipboard = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.clipboard?.writeText) {
      onError?.(new Error('Clipboard API not available'));
      return;
    }

    try {
      await navigator.clipboard.writeText(getTextToCopy());
      setIsCopied(true);
      onCopy?.();
      timeoutRef.current = window.setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [getTextToCopy, onCopy, onError, timeout]);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const Icon = isCopied ? CheckIcon : CopyIcon;
  return (
    <Button
      className={cn('size-6 shrink-0', className)}
      onClick={copyToClipboard}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <Icon size={12} />}
    </Button>
  );
};
