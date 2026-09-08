'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { BookIcon, ChevronDownIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

// Upstream typed this as `ComponentProps<'div'>`, but it renders a Collapsible
// and forwards props to it — so open/defaultOpen/onOpenChange belong here, as
// with Tool/Reasoning. Type it against the primitive it actually is.
export type SourcesProps = ComponentProps<typeof Collapsible>;

export const Sources = ({ className, ...props }: SourcesProps) => (
  // Upstream uses `text-primary`; in Collider's bridge `--primary` is the accent
  // (button/ring blue), so as a text color it would tint the whole block blue and
  // fail AA at text-xs. ai-elements' intent here is prominent *neutral* text, so
  // we resolve to `text-foreground` (white) — matches intent, binds to text/primary.
  <Collapsible className={cn('not-prose mb-4 text-xs text-foreground', className)} {...props} />
);

export type SourcesTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  count: number;
};

export const SourcesTrigger = ({ className, count, children, ...props }: SourcesTriggerProps) => (
  <CollapsibleTrigger className={cn('flex items-center gap-2', className)} {...props}>
    {children ?? (
      <>
        <p className="font-medium">Used {count} sources</p>
        <ChevronDownIcon className="h-4 w-4" />
      </>
    )}
  </CollapsibleTrigger>
);

export type SourcesContentProps = ComponentProps<typeof CollapsibleContent>;

export const SourcesContent = ({ className, ...props }: SourcesContentProps) => (
  <CollapsibleContent
    className={cn(
      'mt-3 flex w-fit flex-col gap-2',
      'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=open]:animate-in outline-none',
      className
    )}
    {...props}
  />
);

export type SourceProps = ComponentProps<'a'>;

export const Source = ({ href, title, children, ...props }: SourceProps) => (
  <a className="flex items-center gap-2" href={href} rel="noreferrer" target="_blank" {...props}>
    {children ?? (
      <>
        <BookIcon className="h-4 w-4" />
        <span className="block font-medium">{title}</span>
      </>
    )}
  </a>
);
