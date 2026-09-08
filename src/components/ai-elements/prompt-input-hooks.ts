'use client';

import type { FileUIPart } from 'ai';
import { nanoid } from 'nanoid';
import type { FormEventHandler, RefObject } from 'react';
import { useCallback, useEffect } from 'react';

import type { PromptInputControllerProps } from './prompt-input-context';
import { convertBlobUrlToDataUrl } from './prompt-input-helpers';

export interface PromptInputMessage {
  text: string;
  files: FileUIPart[];
}

type ErrCode = 'max_files' | 'max_file_size' | 'accept';
type OnError = (err: { code: ErrCode; message: string }) => void;

export interface FileValidationArgs {
  accept?: string;
  maxFiles?: number;
  maxFileSize?: number;
  onError?: OnError;
}

export const useMatchesAccept = (accept: string | undefined) =>
  useCallback(
    (f: File) => {
      if (!accept || accept.trim() === '') return true;
      const patterns = accept
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      return patterns.some((p) =>
        p.endsWith('/*') ? f.type.startsWith(p.slice(0, -1)) : f.type === p
      );
    },
    [accept]
  );

export const validateFiles = (
  incoming: File[],
  {
    matchesAccept,
    maxFileSize,
    maxFiles,
    currentCount,
    onError,
  }: {
    matchesAccept: (f: File) => boolean;
    maxFileSize?: number;
    maxFiles?: number;
    currentCount: number;
    onError?: OnError;
  }
): File[] | null => {
  const accepted = incoming.filter(matchesAccept);
  if (incoming.length && accepted.length === 0) {
    onError?.({ code: 'accept', message: 'No files match the accepted types.' });
    return null;
  }
  const sized = accepted.filter((f) => (maxFileSize ? f.size <= maxFileSize : true));
  if (accepted.length > 0 && sized.length === 0) {
    onError?.({ code: 'max_file_size', message: 'All files exceed the maximum size.' });
    return null;
  }
  const capacity = typeof maxFiles === 'number' ? Math.max(0, maxFiles - currentCount) : undefined;
  const capped = typeof capacity === 'number' ? sized.slice(0, capacity) : sized;
  if (typeof capacity === 'number' && sized.length > capacity) {
    onError?.({ code: 'max_files', message: 'Too many files. Some were not added.' });
  }
  return capped;
};

export const toFileUIParts = (files: File[]): (FileUIPart & { id: string })[] =>
  files.map((file) => ({
    filename: file.name,
    id: nanoid(),
    mediaType: file.type,
    type: 'file',
    url: URL.createObjectURL(file),
  }));

export const useDropHandlers = ({
  formRef,
  globalDrop,
  add,
}: {
  formRef: RefObject<HTMLFormElement | null>;
  globalDrop: boolean | undefined;
  add: (files: File[] | FileList) => void;
}) => {
  useEffect(() => {
    const form = formRef.current;
    if (!form || globalDrop) return;

    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        add(e.dataTransfer.files);
      }
    };
    form.addEventListener('dragover', onDragOver);
    form.addEventListener('drop', onDrop);
    return () => {
      form.removeEventListener('dragover', onDragOver);
      form.removeEventListener('drop', onDrop);
    };
  }, [add, globalDrop, formRef]);

  useEffect(() => {
    if (!globalDrop) return;

    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        add(e.dataTransfer.files);
      }
    };
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('drop', onDrop);
    return () => {
      document.removeEventListener('dragover', onDragOver);
      document.removeEventListener('drop', onDrop);
    };
  }, [add, globalDrop]);
};

export const useSubmit = ({
  files,
  usingProvider,
  controller,
  onSubmit,
  clear,
}: {
  files: (FileUIPart & { id: string })[];
  usingProvider: boolean;
  controller: PromptInputControllerProps | null;
  onSubmit: (
    message: PromptInputMessage,
    event: React.FormEvent<HTMLFormElement>
  ) => void | Promise<void>;
  clear: () => void;
}): FormEventHandler<HTMLFormElement> =>
  useCallback(
    async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const text = usingProvider
        ? (controller?.textInput.value ?? '')
        : ((new FormData(form).get('message') as string) ?? '');
      if (!usingProvider) form.reset();

      try {
        const convertedFiles: FileUIPart[] = await Promise.all(
          files.map(async ({ id, ...item }) => {
            void id;
            if (item.url?.startsWith('blob:')) {
              const dataUrl = await convertBlobUrlToDataUrl(item.url);
              return { ...item, url: dataUrl ?? item.url };
            }
            return item;
          })
        );
        const result = onSubmit({ files: convertedFiles, text }, event);
        if (result instanceof Promise) {
          try {
            await result;
            clear();
            if (usingProvider) controller?.textInput.clear();
          } catch {
            /* keep state on error */
          }
        } else {
          clear();
          if (usingProvider) controller?.textInput.clear();
        }
      } catch {
        /* keep state on error */
      }
    },
    [usingProvider, controller, files, onSubmit, clear]
  );
