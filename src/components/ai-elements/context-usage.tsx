'use client';

import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';
import { getUsage } from 'tokenlens';

import { useContextValue } from './context';

const formatCompact = (n: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact' }).format(n);

const formatUSD = (n: number) =>
  new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format(n);

const TokensWithCost = ({ tokens, costText }: { tokens?: number; costText?: string }) => (
  <span>
    {tokens === undefined ? '—' : formatCompact(tokens)}
    {costText ? <span className="ml-2 text-muted-foreground">• {costText}</span> : null}
  </span>
);

export type ContextContentFooterProps = ComponentProps<'div'>;

export const ContextContentFooter = ({
  children,
  className,
  ...props
}: ContextContentFooterProps) => {
  const { modelId, usage } = useContextValue();
  const costUSD = modelId
    ? getUsage({
        modelId,
        usage: { input: usage?.inputTokens ?? 0, output: usage?.outputTokens ?? 0 },
      }).costUSD?.totalUSD
    : undefined;
  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-3 bg-secondary p-3 text-xs',
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <span className="text-muted-foreground">Total cost</span>
          <span>{formatUSD(costUSD ?? 0)}</span>
        </>
      )}
    </div>
  );
};

export type ContextInputUsageProps = ComponentProps<'div'>;

export const ContextInputUsage = ({ className, children, ...props }: ContextInputUsageProps) => {
  const { usage, modelId } = useContextValue();
  const inputTokens = usage?.inputTokens ?? 0;
  if (children) return children;
  if (!inputTokens) return null;
  const inputCost = modelId
    ? getUsage({ modelId, usage: { input: inputTokens, output: 0 } }).costUSD?.totalUSD
    : undefined;
  return (
    <div className={cn('flex items-center justify-between text-xs', className)} {...props}>
      <span className="text-muted-foreground">Input</span>
      <TokensWithCost costText={formatUSD(inputCost ?? 0)} tokens={inputTokens} />
    </div>
  );
};

export type ContextOutputUsageProps = ComponentProps<'div'>;

export const ContextOutputUsage = ({ className, children, ...props }: ContextOutputUsageProps) => {
  const { usage, modelId } = useContextValue();
  const outputTokens = usage?.outputTokens ?? 0;
  if (children) return children;
  if (!outputTokens) return null;
  const outputCost = modelId
    ? getUsage({ modelId, usage: { input: 0, output: outputTokens } }).costUSD?.totalUSD
    : undefined;
  return (
    <div className={cn('flex items-center justify-between text-xs', className)} {...props}>
      <span className="text-muted-foreground">Output</span>
      <TokensWithCost costText={formatUSD(outputCost ?? 0)} tokens={outputTokens} />
    </div>
  );
};

export type ContextReasoningUsageProps = ComponentProps<'div'>;

export const ContextReasoningUsage = ({
  className,
  children,
  ...props
}: ContextReasoningUsageProps) => {
  const { usage, modelId } = useContextValue();
  const reasoningTokens = usage?.outputTokenDetails?.reasoningTokens ?? 0;
  if (children) return children;
  if (!reasoningTokens) return null;
  const reasoningCost = modelId
    ? getUsage({ modelId, usage: { reasoningTokens } }).costUSD?.totalUSD
    : undefined;
  return (
    <div className={cn('flex items-center justify-between text-xs', className)} {...props}>
      <span className="text-muted-foreground">Reasoning</span>
      <TokensWithCost costText={formatUSD(reasoningCost ?? 0)} tokens={reasoningTokens} />
    </div>
  );
};

export type ContextCacheUsageProps = ComponentProps<'div'>;

export const ContextCacheUsage = ({ className, children, ...props }: ContextCacheUsageProps) => {
  const { usage, modelId } = useContextValue();
  const cacheTokens = usage?.inputTokenDetails?.cacheReadTokens ?? 0;
  if (children) return children;
  if (!cacheTokens) return null;
  const cacheCost = modelId
    ? getUsage({ modelId, usage: { cacheReads: cacheTokens, input: 0, output: 0 } }).costUSD
        ?.totalUSD
    : undefined;
  return (
    <div className={cn('flex items-center justify-between text-xs', className)} {...props}>
      <span className="text-muted-foreground">Cache</span>
      <TokensWithCost costText={formatUSD(cacheCost ?? 0)} tokens={cacheTokens} />
    </div>
  );
};
