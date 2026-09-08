'use client';

import { badgeVariants } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

export {
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationCarouselNext,
  InlineCitationCarouselPrev,
} from './inline-citation-carousel';
export type {
  InlineCitationCarouselContentProps,
  InlineCitationCarouselHeaderProps,
  InlineCitationCarouselIndexProps,
  InlineCitationCarouselItemProps,
  InlineCitationCarouselNextProps,
  InlineCitationCarouselPrevProps,
  InlineCitationCarouselProps,
} from './inline-citation-carousel';

export type InlineCitationProps = ComponentProps<'span'>;

export const InlineCitation = ({ className, ...props }: InlineCitationProps) => (
  <span className={cn('group inline items-center gap-1', className)} {...props} />
);

export type InlineCitationTextProps = ComponentProps<'span'>;

export const InlineCitationText = ({ className, ...props }: InlineCitationTextProps) => (
  <span className={cn('transition-colors group-hover:bg-accent', className)} {...props} />
);

export type InlineCitationCardProps = ComponentProps<typeof HoverCard>;

export const InlineCitationCard = (props: InlineCitationCardProps) => (
  <HoverCard closeDelay={0} openDelay={0} {...props} />
);

export type InlineCitationCardTriggerProps = ComponentProps<'button'> & {
  sources: string[];
};

export const InlineCitationCardTrigger = ({
  sources,
  className,
  ...props
}: InlineCitationCardTriggerProps) => (
  <HoverCardTrigger asChild>
    {/* Vendor rendered Badge (a div) inside HoverCardTrigger asChild, which
        leaves the trigger non-focusable — same pattern as Task's asChild-div
        collapsible trigger. Use a real <button> with badge styles so keyboard
        users can focus and open the hover card. */}
    <button
      type="button"
      className={cn(badgeVariants({ variant: 'secondary' }), 'ml-1 rounded-full', className)}
      {...props}
    >
      {sources[0] ? (
        <>
          {new URL(sources[0]).hostname} {sources.length > 1 && `+${sources.length - 1}`}
        </>
      ) : (
        'unknown'
      )}
    </button>
  </HoverCardTrigger>
);

export type InlineCitationCardBodyProps = ComponentProps<'div'>;

export const InlineCitationCardBody = ({ className, ...props }: InlineCitationCardBodyProps) => (
  <HoverCardContent className={cn('relative w-80 p-0', className)} {...props} />
);

export type InlineCitationSourceProps = ComponentProps<'div'> & {
  title?: string;
  url?: string;
  description?: string;
};

export const InlineCitationSource = ({
  title,
  url,
  description,
  className,
  children,
  ...props
}: InlineCitationSourceProps) => (
  <div className={cn('space-y-1', className)} {...props}>
    {title && <h4 className="truncate text-sm leading-tight font-medium">{title}</h4>}
    {url && <p className="truncate text-xs break-all text-muted-foreground">{url}</p>}
    {description && (
      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
    )}
    {children}
  </div>
);

export type InlineCitationQuoteProps = ComponentProps<'blockquote'>;

export const InlineCitationQuote = ({
  children,
  className,
  ...props
}: InlineCitationQuoteProps) => (
  <blockquote
    className={cn('border-l-2 border-muted pl-3 text-sm text-muted-foreground italic', className)}
    {...props}
  >
    {children}
  </blockquote>
);
