'use client';

import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export type PackageInfoDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const PackageInfoDescription = ({
  className,
  children,
  ...props
}: PackageInfoDescriptionProps) => (
  <p className={cn('mt-2 text-sm text-muted-foreground', className)} {...props}>
    {children}
  </p>
);

export type PackageInfoContentProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoContent = ({ className, children, ...props }: PackageInfoContentProps) => (
  <div className={cn('mt-3 border-t pt-3', className)} {...props}>
    {children}
  </div>
);

export type PackageInfoDependenciesProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoDependencies = ({
  className,
  children,
  ...props
}: PackageInfoDependenciesProps) => (
  <div className={cn('space-y-2', className)} {...props}>
    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
      Dependencies
    </span>
    <div className="space-y-1">{children}</div>
  </div>
);

export type PackageInfoDependencyProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  version?: string;
};

export const PackageInfoDependency = ({
  name,
  version,
  className,
  children,
  ...props
}: PackageInfoDependencyProps) => (
  <div className={cn('flex items-center justify-between text-sm', className)} {...props}>
    {children ?? (
      <>
        <span className="font-mono text-muted-foreground">{name}</span>
        {version && <span className="font-mono text-xs">{version}</span>}
      </>
    )}
  </div>
);
