'use client';

import { EyeIcon, EyeOffIcon } from 'lucide-react';
import type { ComponentProps, HTMLAttributes } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type EnvironmentVariablesContextValue = {
  showValues: boolean;
  setShowValues: (show: boolean) => void;
};

export const EnvironmentVariablesContext = createContext<EnvironmentVariablesContextValue>({
  setShowValues: () => undefined,
  showValues: false,
});

export type EnvironmentVariablesProps = HTMLAttributes<HTMLDivElement> & {
  showValues?: boolean;
  defaultShowValues?: boolean;
  onShowValuesChange?: (show: boolean) => void;
};

export const EnvironmentVariables = ({
  showValues: controlledShowValues,
  defaultShowValues = false,
  onShowValuesChange,
  className,
  children,
  ...props
}: EnvironmentVariablesProps) => {
  const [internalShowValues, setInternalShowValues] = useState(defaultShowValues);
  const showValues = controlledShowValues ?? internalShowValues;
  const setShowValues = useCallback(
    (show: boolean) => {
      setInternalShowValues(show);
      onShowValuesChange?.(show);
    },
    [onShowValuesChange]
  );
  const contextValue = useMemo(() => ({ setShowValues, showValues }), [setShowValues, showValues]);

  return (
    <EnvironmentVariablesContext.Provider value={contextValue}>
      <div className={cn('rounded-lg border bg-background', className)} {...props}>
        {children}
      </div>
    </EnvironmentVariablesContext.Provider>
  );
};

export type EnvironmentVariablesHeaderProps = HTMLAttributes<HTMLDivElement>;

export const EnvironmentVariablesHeader = ({
  className,
  children,
  ...props
}: EnvironmentVariablesHeaderProps) => (
  <div className={cn('flex items-center justify-between border-b px-4 py-3', className)} {...props}>
    {children}
  </div>
);

export type EnvironmentVariablesTitleProps = HTMLAttributes<HTMLHeadingElement>;

export const EnvironmentVariablesTitle = ({
  className,
  children,
  ...props
}: EnvironmentVariablesTitleProps) => (
  <h3 className={cn('text-sm font-medium', className)} {...props}>
    {children ?? 'Environment Variables'}
  </h3>
);

export type EnvironmentVariablesToggleProps = ComponentProps<typeof Switch>;

export const EnvironmentVariablesToggle = ({
  className,
  ...props
}: EnvironmentVariablesToggleProps) => {
  const { showValues, setShowValues } = useContext(EnvironmentVariablesContext);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs text-muted-foreground">
        {showValues ? <EyeIcon size={14} /> : <EyeOffIcon size={14} />}
      </span>
      <Switch
        aria-label="Toggle value visibility"
        checked={showValues}
        onCheckedChange={setShowValues}
        {...props}
      />
    </div>
  );
};

export type EnvironmentVariablesContentProps = HTMLAttributes<HTMLDivElement>;

export const EnvironmentVariablesContent = ({
  className,
  children,
  ...props
}: EnvironmentVariablesContentProps) => (
  <div className={cn('divide-y', className)} {...props}>
    {children}
  </div>
);

type EnvironmentVariableContextValue = {
  name: string;
  value: string;
};

export const EnvironmentVariableContext = createContext<EnvironmentVariableContextValue>({
  name: '',
  value: '',
});

export * from './environment-variables-parts';
