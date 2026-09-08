'use client';

import type { ComponentProps, HTMLAttributes } from 'react';
import { createContext, useContext, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import {
  SchemaDisplayParameters,
  SchemaDisplayRequest,
  SchemaDisplayResponse,
} from './schema-display-parts';

export type SchemaDisplayHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface SchemaDisplayParameterValue {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  location?: 'path' | 'query' | 'header';
}

export interface SchemaDisplayPropertyValue {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  properties?: SchemaDisplayPropertyValue[];
  items?: SchemaDisplayPropertyValue;
}

export interface SchemaDisplayContextValue {
  method: SchemaDisplayHttpMethod;
  path: string;
  description?: string;
  parameters?: SchemaDisplayParameterValue[];
  requestBody?: SchemaDisplayPropertyValue[];
  responseBody?: SchemaDisplayPropertyValue[];
}

export const SchemaDisplayContext = createContext<SchemaDisplayContextValue>({
  method: 'GET',
  path: '',
});

export const schemaDisplayMethodStyles: Record<SchemaDisplayHttpMethod, string> = {
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  GET: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PATCH: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PUT: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export type SchemaDisplayHeaderProps = HTMLAttributes<HTMLDivElement>;

export const SchemaDisplayHeader = ({
  className,
  children,
  ...props
}: SchemaDisplayHeaderProps) => (
  <div className={cn('flex items-center gap-3 border-b px-4 py-3', className)} {...props}>
    {children}
  </div>
);

export type SchemaDisplayMethodProps = ComponentProps<typeof Badge>;

export const SchemaDisplayMethod = ({
  className,
  children,
  ...props
}: SchemaDisplayMethodProps) => {
  const { method } = useContext(SchemaDisplayContext);

  return (
    <Badge
      className={cn('font-mono text-xs', schemaDisplayMethodStyles[method], className)}
      variant="secondary"
      {...props}
    >
      {children ?? method}
    </Badge>
  );
};

export type SchemaDisplayPathProps = HTMLAttributes<HTMLSpanElement>;

export const SchemaDisplayPath = ({ className, children, ...props }: SchemaDisplayPathProps) => {
  const { path } = useContext(SchemaDisplayContext);
  const highlightedPath = path.replaceAll(
    /\{([^}]+)\}/g,
    '<span class="text-blue-600 dark:text-blue-400">{$1}</span>'
  );

  if (children !== undefined) {
    return (
      <span className={cn('font-mono text-sm', className)} {...props}>
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn('font-mono text-sm', className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: developer-supplied API path template
      dangerouslySetInnerHTML={{ __html: highlightedPath }}
      {...props}
    />
  );
};

export type SchemaDisplayDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const SchemaDisplayDescription = ({
  className,
  children,
  ...props
}: SchemaDisplayDescriptionProps) => {
  const { description } = useContext(SchemaDisplayContext);

  return (
    <p className={cn('border-b px-4 py-3 text-sm text-muted-foreground', className)} {...props}>
      {children ?? description}
    </p>
  );
};

export type SchemaDisplayContentProps = HTMLAttributes<HTMLDivElement>;

export const SchemaDisplayContent = ({
  className,
  children,
  ...props
}: SchemaDisplayContentProps) => (
  <div className={cn('divide-y', className)} {...props}>
    {children}
  </div>
);

export type SchemaDisplayProps = HTMLAttributes<HTMLDivElement> & {
  method: SchemaDisplayHttpMethod;
  path: string;
  description?: string;
  parameters?: SchemaDisplayParameterValue[];
  requestBody?: SchemaDisplayPropertyValue[];
  responseBody?: SchemaDisplayPropertyValue[];
};

export const SchemaDisplay = ({
  method,
  path,
  description,
  parameters,
  requestBody,
  responseBody,
  className,
  children,
  ...props
}: SchemaDisplayProps) => {
  const contextValue = useMemo(
    () => ({ description, method, parameters, path, requestBody, responseBody }),
    [description, method, parameters, path, requestBody, responseBody]
  );

  return (
    <SchemaDisplayContext.Provider value={contextValue}>
      <div className={cn('overflow-hidden rounded-lg border bg-background', className)} {...props}>
        {children ?? <SchemaDisplayDefaultLayout />}
      </div>
    </SchemaDisplayContext.Provider>
  );
};

const SchemaDisplayDefaultLayout = () => {
  const { description, parameters, requestBody, responseBody } = useContext(SchemaDisplayContext);

  return (
    <>
      <SchemaDisplayHeader>
        <div className="flex items-center gap-3">
          <SchemaDisplayMethod />
          <SchemaDisplayPath />
        </div>
      </SchemaDisplayHeader>
      {description && <SchemaDisplayDescription />}
      <SchemaDisplayContent>
        {parameters && parameters.length > 0 && <SchemaDisplayParameters />}
        {requestBody && requestBody.length > 0 && <SchemaDisplayRequest />}
        {responseBody && responseBody.length > 0 && <SchemaDisplayResponse />}
      </SchemaDisplayContent>
    </>
  );
};

export * from './schema-display-parts';
