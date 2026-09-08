'use client';

import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import { type ImageIcon, XIcon } from 'lucide-react';
import type { ComponentProps, HTMLAttributes, ReactNode } from 'react';
import { useCallback } from 'react';

import { getAttachmentLabel, mediaCategoryIcons, useAttachmentContext } from './attachments';

const renderAttachmentImage = (url: string, filename: string | undefined, isGrid: boolean) =>
  isGrid ? (
    <img
      alt={filename || 'Image'}
      className="size-full object-cover"
      height={96}
      src={url}
      width={96}
    />
  ) : (
    <img
      alt={filename || 'Image'}
      className="size-full rounded object-cover"
      height={20}
      src={url}
      width={20}
    />
  );

export type AttachmentPreviewProps = HTMLAttributes<HTMLDivElement> & {
  fallbackIcon?: ReactNode;
};

export const AttachmentPreview = ({
  fallbackIcon,
  className,
  ...props
}: AttachmentPreviewProps) => {
  const { data, mediaCategory, variant } = useAttachmentContext();
  const iconSize = variant === 'inline' ? 'size-3' : 'size-4';

  const renderIcon = (Icon: typeof ImageIcon) => (
    <Icon className={cn(iconSize, 'text-muted-foreground')} />
  );

  const renderContent = () => {
    if (mediaCategory === 'image' && data.type === 'file' && data.url) {
      return renderAttachmentImage(data.url, data.filename, variant === 'grid');
    }
    if (mediaCategory === 'video' && data.type === 'file' && data.url) {
      return <video className="size-full object-cover" muted src={data.url} />;
    }
    const Icon = mediaCategoryIcons[mediaCategory];
    return fallbackIcon ?? renderIcon(Icon);
  };

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden',
        variant === 'grid' && 'size-full bg-muted',
        variant === 'inline' && 'size-5 rounded bg-background',
        variant === 'list' && 'size-12 rounded bg-muted',
        className
      )}
      {...props}
    >
      {renderContent()}
    </div>
  );
};

export type AttachmentInfoProps = HTMLAttributes<HTMLDivElement> & {
  showMediaType?: boolean;
};

export const AttachmentInfo = ({
  showMediaType = false,
  className,
  ...props
}: AttachmentInfoProps) => {
  const { data, variant } = useAttachmentContext();
  const label = getAttachmentLabel(data);

  if (variant === 'grid') return null;

  return (
    <div className={cn('min-w-0 flex-1', className)} {...props}>
      <span className="block truncate">{label}</span>
      {showMediaType && data.mediaType && (
        <span className="block truncate text-xs text-muted-foreground">{data.mediaType}</span>
      )}
    </div>
  );
};

export type AttachmentRemoveProps = ComponentProps<typeof Button> & {
  label?: string;
};

export const AttachmentRemove = ({
  label = 'Remove',
  className,
  children,
  ...props
}: AttachmentRemoveProps) => {
  const { onRemove, variant } = useAttachmentContext();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    },
    [onRemove]
  );

  if (!onRemove) return null;

  return (
    <Button
      aria-label={label}
      className={cn(
        variant === 'grid' && [
          'absolute top-2 right-2 size-6 rounded-full p-0',
          'bg-background/80 backdrop-blur-sm',
          'opacity-0 transition-opacity group-hover:opacity-100',
          'hover:bg-background',
          '[&>svg]:size-3',
        ],
        variant === 'inline' && [
          'size-5 rounded p-0',
          'opacity-0 transition-opacity group-hover:opacity-100',
          '[&>svg]:size-2.5',
        ],
        variant === 'list' && ['size-8 shrink-0 rounded p-0', '[&>svg]:size-4'],
        className
      )}
      onClick={handleClick}
      type="button"
      variant="ghost"
      {...props}
    >
      {children ?? <XIcon />}
      <span className="sr-only">{label}</span>
    </Button>
  );
};

export type AttachmentHoverCardProps = ComponentProps<typeof HoverCard>;

export const AttachmentHoverCard = ({
  openDelay = 0,
  closeDelay = 0,
  ...props
}: AttachmentHoverCardProps) => (
  <HoverCard closeDelay={closeDelay} openDelay={openDelay} {...props} />
);

export type AttachmentHoverCardTriggerProps = ComponentProps<typeof HoverCardTrigger>;

export const AttachmentHoverCardTrigger = (props: AttachmentHoverCardTriggerProps) => (
  <HoverCardTrigger {...props} />
);

export type AttachmentHoverCardContentProps = ComponentProps<typeof HoverCardContent>;

export const AttachmentHoverCardContent = ({
  align = 'start',
  className,
  ...props
}: AttachmentHoverCardContentProps) => (
  <HoverCardContent align={align} className={cn('w-auto p-2', className)} {...props} />
);

export type AttachmentEmptyProps = HTMLAttributes<HTMLDivElement>;

export const AttachmentEmpty = ({ className, children, ...props }: AttachmentEmptyProps) => (
  <div
    className={cn('flex items-center justify-center p-4 text-sm text-muted-foreground', className)}
    {...props}
  >
    {children ?? 'No attachments'}
  </div>
);
