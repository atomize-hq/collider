'use client';

import { cn } from '@/lib/utils';
import type { FileUIPart, SourceDocumentUIPart } from 'ai';
import {
  FileTextIcon,
  GlobeIcon,
  ImageIcon,
  Music2Icon,
  PaperclipIcon,
  VideoIcon,
} from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { createContext, useContext, useMemo } from 'react';

export type AttachmentData =
  | (FileUIPart & { id: string })
  | (SourceDocumentUIPart & { id: string });

export type AttachmentMediaCategory =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'source'
  | 'unknown';

export type AttachmentVariant = 'grid' | 'inline' | 'list';

export const mediaCategoryIcons: Record<AttachmentMediaCategory, typeof ImageIcon> = {
  audio: Music2Icon,
  document: FileTextIcon,
  image: ImageIcon,
  source: GlobeIcon,
  unknown: PaperclipIcon,
  video: VideoIcon,
};

export const getMediaCategory = (data: AttachmentData): AttachmentMediaCategory => {
  if (data.type === 'source-document') return 'source';
  const mediaType = data.mediaType ?? '';
  if (mediaType.startsWith('image/')) return 'image';
  if (mediaType.startsWith('video/')) return 'video';
  if (mediaType.startsWith('audio/')) return 'audio';
  if (mediaType.startsWith('application/') || mediaType.startsWith('text/')) return 'document';
  return 'unknown';
};

export const getAttachmentLabel = (data: AttachmentData): string => {
  if (data.type === 'source-document') return data.title || data.filename || 'Source';
  const category = getMediaCategory(data);
  return data.filename || (category === 'image' ? 'Image' : 'Attachment');
};

interface AttachmentsContextValue {
  variant: AttachmentVariant;
}

const AttachmentsContext = createContext<AttachmentsContextValue | null>(null);

export interface AttachmentContextValue {
  data: AttachmentData;
  mediaCategory: AttachmentMediaCategory;
  onRemove?: () => void;
  variant: AttachmentVariant;
}

export const AttachmentContext = createContext<AttachmentContextValue | null>(null);

export const useAttachmentsContext = () =>
  useContext(AttachmentsContext) ?? { variant: 'grid' as const };

export const useAttachmentContext = () => {
  const ctx = useContext(AttachmentContext);
  if (!ctx) throw new Error('Attachment components must be used within <Attachment>');
  return ctx;
};

export type AttachmentsProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AttachmentVariant;
};

export const Attachments = ({
  variant = 'grid',
  className,
  children,
  ...props
}: AttachmentsProps) => {
  const value = useMemo(() => ({ variant }), [variant]);
  return (
    <AttachmentsContext.Provider value={value}>
      <div
        className={cn(
          'flex items-start',
          variant === 'list' ? 'flex-col gap-2' : 'flex-wrap gap-2',
          variant === 'grid' && 'ml-auto w-fit',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AttachmentsContext.Provider>
  );
};

export type AttachmentProps = HTMLAttributes<HTMLDivElement> & {
  data: AttachmentData;
  onRemove?: () => void;
};

export const Attachment = ({ data, onRemove, className, children, ...props }: AttachmentProps) => {
  const { variant } = useAttachmentsContext();
  const mediaCategory = getMediaCategory(data);

  const value = useMemo<AttachmentContextValue>(
    () => ({ data, mediaCategory, onRemove, variant }),
    [data, mediaCategory, onRemove, variant]
  );

  return (
    <AttachmentContext.Provider value={value}>
      <div
        className={cn(
          'group relative',
          variant === 'grid' && 'size-24 overflow-hidden rounded-lg',
          variant === 'inline' && [
            'flex h-8 cursor-pointer items-center gap-1.5 select-none',
            'rounded-md border border-border px-1.5',
            'text-sm font-medium transition-all',
            'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
          ],
          variant === 'list' && [
            'flex w-full items-center gap-3 rounded-lg border p-3',
            'hover:bg-accent/50',
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AttachmentContext.Provider>
  );
};

export * from './attachment-parts';
