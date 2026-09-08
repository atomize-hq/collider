'use client';

import type { ComponentProps } from 'react';
import { createContext, memo, useContext, useMemo, useState } from 'react';
import type { TProps as JsxParserProps } from 'react-jsx-parser';

import { cn } from '@/lib/utils';

export interface JSXPreviewContextValue {
  jsx: string;
  processedJsx: string;
  isStreaming: boolean;
  error: Error | null;
  setError: (error: Error | null) => void;
  setLastGoodJsx: (jsx: string) => void;
  components: JsxParserProps['components'];
  bindings: JsxParserProps['bindings'];
  onErrorProp?: (error: Error) => void;
}

export const JSXPreviewContext = createContext<JSXPreviewContextValue | null>(null);

const TAG_REGEX = /<\/?([a-zA-Z][a-zA-Z0-9]*)\s*([^>]*?)(\/)?>/;

export const useJSXPreview = () => {
  const context = useContext(JSXPreviewContext);
  if (!context) {
    throw new Error('JSXPreview components must be used within JSXPreview');
  }
  return context;
};

const matchJsxTag = (code: string) => {
  if (code.trim() === '') {
    return null;
  }

  const match = code.match(TAG_REGEX);
  if (!match || match.index === undefined) {
    return null;
  }

  const [fullMatch, tagName, attributes, selfClosing] = match;

  let type: 'self-closing' | 'closing' | 'opening';
  if (selfClosing) {
    type = 'self-closing';
  } else if (fullMatch.startsWith('</')) {
    type = 'closing';
  } else {
    type = 'opening';
  }

  return {
    attributes: attributes.trim(),
    endIndex: match.index + fullMatch.length,
    startIndex: match.index,
    tag: fullMatch,
    tagName,
    type,
  };
};

const stripIncompleteTag = (text: string) => {
  const lastOpen = text.lastIndexOf('<');
  if (lastOpen === -1) {
    return text;
  }

  const afterOpen = text.slice(lastOpen);
  if (!afterOpen.includes('>')) {
    return text.slice(0, lastOpen);
  }

  return text;
};

const completeJsxTag = (code: string) => {
  const stack: string[] = [];
  let result = '';
  let currentPosition = 0;

  while (currentPosition < code.length) {
    const match = matchJsxTag(code.slice(currentPosition));
    if (!match) {
      result += stripIncompleteTag(code.slice(currentPosition));
      break;
    }
    const { tagName, type, endIndex } = match;

    result += code.slice(currentPosition, currentPosition + endIndex);

    if (type === 'opening') {
      stack.push(tagName);
    } else if (type === 'closing') {
      stack.pop();
    }

    currentPosition += endIndex;
  }

  return (
    result +
    stack
      .toReversed()
      .map((tag) => `</${tag}>`)
      .join('')
  );
};

export type JSXPreviewProps = ComponentProps<'div'> & {
  jsx: string;
  isStreaming?: boolean;
  components?: JsxParserProps['components'];
  bindings?: JsxParserProps['bindings'];
  onError?: (error: Error) => void;
};

export const JSXPreview = memo(
  ({
    jsx,
    isStreaming = false,
    components,
    bindings,
    onError,
    className,
    children,
    ...props
  }: JSXPreviewProps) => {
    const [prevJsx, setPrevJsx] = useState(jsx);
    const [error, setError] = useState<Error | null>(null);
    const [, setLastGoodJsx] = useState('');

    if (jsx !== prevJsx) {
      setPrevJsx(jsx);
      setError(null);
    }

    const processedJsx = useMemo(
      () => (isStreaming ? completeJsxTag(jsx) : jsx),
      [jsx, isStreaming]
    );

    const contextValue = useMemo(
      () => ({
        bindings,
        components,
        error,
        isStreaming,
        jsx,
        onErrorProp: onError,
        processedJsx,
        setError,
        setLastGoodJsx,
      }),
      [bindings, components, error, isStreaming, jsx, onError, processedJsx]
    );

    return (
      <JSXPreviewContext.Provider value={contextValue}>
        <div className={cn('relative', className)} {...props}>
          {children}
        </div>
      </JSXPreviewContext.Provider>
    );
  }
);
JSXPreview.displayName = 'JSXPreview';

export * from './jsx-preview-parts';
