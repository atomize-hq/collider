'use client';

import { ChevronRightIcon } from 'lucide-react';
import type { ComponentProps, HTMLAttributes } from 'react';
import { useContext } from 'react';

import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

import { SchemaDisplayContext, type SchemaDisplayParameterValue } from './schema-display';

export type SchemaDisplayParameterProps = HTMLAttributes<HTMLDivElement> &
  SchemaDisplayParameterValue;

export const SchemaDisplayParameter = ({
  name,
  type,
  required,
  description,
  location,
  className,
  ...props
}: SchemaDisplayParameterProps) => (
  <div className={cn('px-4 py-3 pl-10', className)} {...props}>
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">{name}</span>
      <Badge className="text-xs" variant="outline">
        {type}
      </Badge>
      {location && (
        <Badge className="text-xs" variant="secondary">
          {location}
        </Badge>
      )}
      {required && (
        <Badge
          className="bg-red-100 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400"
          variant="secondary"
        >
          required
        </Badge>
      )}
    </div>
    {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
  </div>
);

export type SchemaDisplayParametersProps = ComponentProps<typeof Collapsible>;

export const SchemaDisplayParameters = ({
  className,
  children,
  ...props
}: SchemaDisplayParametersProps) => {
  const { parameters } = useContext(SchemaDisplayContext);

  return (
    <Collapsible className={cn(className)} defaultOpen {...props}>
      <CollapsibleTrigger className="group flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/50">
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
        <span className="text-sm font-medium">Parameters</span>
        <Badge className="ml-auto text-xs" variant="secondary">
          {parameters?.length}
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="divide-y border-t">
          {children ??
            parameters?.map((param) => <SchemaDisplayParameter key={param.name} {...param} />)}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export type SchemaDisplayBodyProps = HTMLAttributes<HTMLDivElement>;

export const SchemaDisplayBody = ({ className, children, ...props }: SchemaDisplayBodyProps) => (
  <div className={cn('divide-y', className)} {...props}>
    {children}
  </div>
);

export type SchemaDisplayExampleProps = HTMLAttributes<HTMLPreElement>;

export const SchemaDisplayExample = ({
  className,
  children,
  ...props
}: SchemaDisplayExampleProps) => (
  <pre
    className={cn('mx-4 mb-4 overflow-auto rounded-md bg-muted p-4 font-mono text-sm', className)}
    {...props}
  >
    {children}
  </pre>
);

export * from './schema-display-property';
