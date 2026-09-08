'use client';

import { cn } from '@/lib/utils';
import { InputGroup } from '@/components/ui/input-group';
import type { FileUIPart, SourceDocumentUIPart } from 'ai';
import { nanoid } from 'nanoid';
import type { ChangeEventHandler, HTMLAttributes } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  type AttachmentsContext,
  LocalAttachmentsContext,
  LocalReferencedSourcesContext,
  type ReferencedSourcesContext,
  useOptionalPromptInputController,
} from './prompt-input-context';
import {
  type PromptInputMessage,
  toFileUIParts,
  useDropHandlers,
  useMatchesAccept,
  useSubmit,
  validateFiles,
} from './prompt-input-hooks';

export type { PromptInputMessage };
export * from './prompt-input-context';
export * from './prompt-input-parts';
export * from './prompt-input-controls';
export * from './prompt-input-actions';
export * from './prompt-input-select';

export type PromptInputProps = Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit' | 'onError'> & {
  accept?: string;
  multiple?: boolean;
  globalDrop?: boolean;
  syncHiddenInput?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  onError?: (err: { code: 'max_files' | 'max_file_size' | 'accept'; message: string }) => void;
  onSubmit: (
    message: PromptInputMessage,
    event: React.FormEvent<HTMLFormElement>
  ) => void | Promise<void>;
};

export const PromptInput = ({
  className,
  accept,
  multiple,
  globalDrop,
  syncHiddenInput,
  maxFiles,
  maxFileSize,
  onError,
  onSubmit,
  children,
  ...props
}: PromptInputProps) => {
  const controller = useOptionalPromptInputController();
  const usingProvider = !!controller;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const [items, setItems] = useState<(FileUIPart & { id: string })[]>([]);
  const files = usingProvider ? controller.attachments.files : items;

  const [referencedSources, setReferencedSources] = useState<
    (SourceDocumentUIPart & { id: string })[]
  >([]);

  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const matchesAccept = useMatchesAccept(accept);

  const add = useCallback(
    (fileList: File[] | FileList) => {
      const capped = validateFiles([...fileList], {
        matchesAccept,
        maxFileSize,
        maxFiles,
        currentCount: files.length,
        onError,
      });
      if (!capped || capped.length === 0) return;
      if (usingProvider) controller?.attachments.add(capped);
      else setItems((prev) => [...prev, ...toFileUIParts(capped)]);
    },
    [matchesAccept, maxFiles, maxFileSize, onError, files.length, usingProvider, controller]
  );

  const removeLocal = useCallback(
    (id: string) =>
      setItems((prev) => {
        const found = prev.find((f) => f.id === id);
        if (found?.url) URL.revokeObjectURL(found.url);
        return prev.filter((f) => f.id !== id);
      }),
    []
  );

  const remove = usingProvider ? controller.attachments.remove : removeLocal;
  const openFileDialogLocal = useCallback(() => inputRef.current?.click(), []);
  const openFileDialog = usingProvider
    ? controller.attachments.openFileDialog
    : openFileDialogLocal;

  const clearAttachments = useCallback(
    () =>
      usingProvider
        ? controller?.attachments.clear()
        : setItems((prev) => {
            for (const f of prev) if (f.url) URL.revokeObjectURL(f.url);
            return [];
          }),
    [usingProvider, controller]
  );

  const clearReferencedSources = useCallback(() => setReferencedSources([]), []);

  const clear = useCallback(() => {
    clearAttachments();
    clearReferencedSources();
  }, [clearAttachments, clearReferencedSources]);

  useEffect(() => {
    if (!usingProvider) return;
    controller.__registerFileInput(inputRef, () => inputRef.current?.click());
  }, [usingProvider, controller]);

  useEffect(() => {
    if (syncHiddenInput && inputRef.current && files.length === 0) {
      inputRef.current.value = '';
    }
  }, [files, syncHiddenInput]);

  useDropHandlers({ formRef, globalDrop, add });

  useEffect(
    () => () => {
      if (!usingProvider) {
        for (const f of filesRef.current) if (f.url) URL.revokeObjectURL(f.url);
      }
    },
    [usingProvider]
  );

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (event.currentTarget.files) add(event.currentTarget.files);
      event.currentTarget.value = '';
    },
    [add]
  );

  const attachmentsCtx = useMemo<AttachmentsContext>(
    () => ({ add, clear: clearAttachments, fileInputRef: inputRef, files, openFileDialog, remove }),
    [files, add, remove, clearAttachments, openFileDialog]
  );

  const refsCtx = useMemo<ReferencedSourcesContext>(
    () => ({
      add: (incoming) => {
        const array = Array.isArray(incoming) ? incoming : [incoming];
        setReferencedSources((prev) => [...prev, ...array.map((s) => ({ ...s, id: nanoid() }))]);
      },
      clear: clearReferencedSources,
      remove: (id) => setReferencedSources((prev) => prev.filter((s) => s.id !== id)),
      sources: referencedSources,
    }),
    [referencedSources, clearReferencedSources]
  );

  const handleSubmit = useSubmit({ files, usingProvider, controller, onSubmit, clear });

  return (
    <LocalAttachmentsContext.Provider value={attachmentsCtx}>
      <LocalReferencedSourcesContext.Provider value={refsCtx}>
        <input
          accept={accept}
          aria-label="Upload files"
          className="hidden"
          multiple={multiple}
          onChange={handleChange}
          ref={inputRef}
          title="Upload files"
          type="file"
        />
        <form className={cn('w-full', className)} onSubmit={handleSubmit} ref={formRef} {...props}>
          <InputGroup className="overflow-hidden">{children}</InputGroup>
        </form>
      </LocalReferencedSourcesContext.Provider>
    </LocalAttachmentsContext.Provider>
  );
};
