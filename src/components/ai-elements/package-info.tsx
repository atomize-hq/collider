'use client';

import { ArrowRightIcon, MinusIcon, PackageIcon, PlusIcon } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type PackageInfoChangeType = 'major' | 'minor' | 'patch' | 'added' | 'removed';

export interface PackageInfoContextType {
  name: string;
  currentVersion?: string;
  newVersion?: string;
  changeType?: PackageInfoChangeType;
}

export const PackageInfoContext = createContext<PackageInfoContextType>({ name: '' });

const changeTypeStyles: Record<PackageInfoChangeType, string> = {
  added: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  major: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  minor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  patch: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  removed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const changeTypeIcons: Record<PackageInfoChangeType, ReactNode> = {
  added: <PlusIcon className="size-3" />,
  major: <ArrowRightIcon className="size-3" />,
  minor: <ArrowRightIcon className="size-3" />,
  patch: <ArrowRightIcon className="size-3" />,
  removed: <MinusIcon className="size-3" />,
};

export type PackageInfoHeaderProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoHeader = ({ className, children, ...props }: PackageInfoHeaderProps) => (
  <div className={cn('flex items-center justify-between gap-2', className)} {...props}>
    {children}
  </div>
);

export type PackageInfoNameProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoName = ({ className, children, ...props }: PackageInfoNameProps) => {
  const { name } = useContext(PackageInfoContext);
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      <PackageIcon className="size-4 text-muted-foreground" />
      <span className="font-mono text-sm font-medium">{children ?? name}</span>
    </div>
  );
};

export type PackageInfoChangeTypeBadgeProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoChangeTypeBadge = ({
  className,
  children,
  ...props
}: PackageInfoChangeTypeBadgeProps) => {
  const { changeType } = useContext(PackageInfoContext);
  if (!changeType) return null;
  return (
    <Badge
      className={cn('gap-1 text-xs capitalize', changeTypeStyles[changeType], className)}
      variant="secondary"
      {...props}
    >
      {changeTypeIcons[changeType]}
      {children ?? changeType}
    </Badge>
  );
};

export type PackageInfoVersionProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoVersion = ({ className, children, ...props }: PackageInfoVersionProps) => {
  const { currentVersion, newVersion } = useContext(PackageInfoContext);
  if (!(currentVersion || newVersion)) return null;
  return (
    <div
      className={cn(
        'mt-2 flex items-center gap-2 font-mono text-sm text-muted-foreground',
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          {currentVersion && <span>{currentVersion}</span>}
          {currentVersion && newVersion && <ArrowRightIcon className="size-3" />}
          {newVersion && <span className="font-medium text-foreground">{newVersion}</span>}
        </>
      )}
    </div>
  );
};

export type PackageInfoProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  currentVersion?: string;
  newVersion?: string;
  changeType?: PackageInfoChangeType;
};

export const PackageInfo = ({
  name,
  currentVersion,
  newVersion,
  changeType,
  className,
  children,
  ...props
}: PackageInfoProps) => {
  const contextValue = useMemo(
    () => ({ changeType, currentVersion, name, newVersion }),
    [changeType, currentVersion, name, newVersion]
  );
  return (
    <PackageInfoContext.Provider value={contextValue}>
      <div className={cn('rounded-lg border bg-background p-4', className)} {...props}>
        {children ?? (
          <>
            <PackageInfoHeader>
              <PackageInfoName />
              {changeType && <PackageInfoChangeTypeBadge />}
            </PackageInfoHeader>
            {(currentVersion || newVersion) && <PackageInfoVersion />}
          </>
        )}
      </div>
    </PackageInfoContext.Provider>
  );
};

export * from './package-info-parts';
