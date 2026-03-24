import { BrainIcon, ChevronUpIcon } from 'lucide-react';
import { createContext, forwardRef, useContext, useState } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Streamdown } from 'streamdown';
import { code } from '@streamdown/code';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import styles from './ThinkingIndicator.module.css';

type ReasoningCtx = {
  duration: number | undefined;
  isOpen: boolean;
  isStreaming: boolean;
  setIsOpen: (open: boolean) => void;
};

const Ctx = createContext<ReasoningCtx | null>(null);

export function useReasoning(): ReasoningCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useReasoning must be used inside <Reasoning>');
  return ctx;
}

export type ReasoningProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  children?: ReactNode;
  defaultOpen?: boolean;
  duration?: number;
  isStreaming?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

export const Reasoning = forwardRef<HTMLDivElement, ReasoningProps>(function Reasoning(
  {
    children,
    className,
    defaultOpen = true,
    duration,
    isStreaming = false,
    onOpenChange,
    open: controlledOpen,
    ...rest
  },
  ref
) {
  const isControlled = controlledOpen !== undefined;
  const [localOpen, setLocalOpen] = useState(() => controlledOpen ?? defaultOpen);
  const [prevIsStreaming, setPrevIsStreaming] = useState(isStreaming);

  // Derived-state pattern: sync isStreaming → localOpen during render (avoids effect cascade)
  if (!isControlled && prevIsStreaming !== isStreaming) {
    setPrevIsStreaming(isStreaming);
    setLocalOpen(isStreaming);
  }

  const isOpen = isControlled ? controlledOpen! : localOpen;

  function setIsOpen(next: boolean) {
    if (!isControlled) setLocalOpen(next);
    onOpenChange?.(next);
  }

  return (
    <Ctx.Provider value={{ duration, isOpen, isStreaming, setIsOpen }}>
      <Collapsible
        {...rest}
        ref={ref}
        asChild={false}
        className={[styles.root, className].filter(Boolean).join(' ')}
        data-streaming={String(isStreaming)}
        onOpenChange={setIsOpen}
        open={isOpen}
      >
        {children}
      </Collapsible>
    </Ctx.Provider>
  );
});

export type ReasoningTriggerProps = ComponentPropsWithoutRef<'button'> & {
  getThinkingMessage?: (isStreaming: boolean, duration?: number) => ReactNode;
};

const defaultMessage = (streaming: boolean, duration?: number): ReactNode =>
  streaming ? 'Thinking…' : duration !== undefined ? `Thought for ${duration}s` : 'Reasoning';

export const ReasoningTrigger = forwardRef<HTMLButtonElement, ReasoningTriggerProps>(
  function ReasoningTrigger({ className, getThinkingMessage = defaultMessage, ...rest }, ref) {
    const { duration, isOpen, isStreaming, setIsOpen } = useReasoning();
    return (
      <CollapsibleTrigger asChild>
        <button
          {...rest}
          ref={ref}
          aria-expanded={isOpen}
          className={[styles.trigger, className].filter(Boolean).join(' ')}
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <BrainIcon aria-hidden="true" className={styles.icon} size={16} />
          <span
            className={[styles.triggerLabel, isStreaming ? styles.triggerLabelStreaming : '']
              .filter(Boolean)
              .join(' ')}
          >
            {getThinkingMessage(isStreaming, duration)}
          </span>
          <ChevronUpIcon
            aria-hidden="true"
            className={[styles.chevron, isOpen ? '' : styles.chevronClosed]
              .filter(Boolean)
              .join(' ')}
            size={16}
          />
        </button>
      </CollapsibleTrigger>
    );
  }
);

const streamdownPlugins = { code };

export type ReasoningContentProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  children: string;
};

export const ReasoningContent = forwardRef<HTMLDivElement, ReasoningContentProps>(
  function ReasoningContent({ children, className, ...rest }, ref) {
    return (
      <CollapsibleContent>
        <div
          {...rest}
          ref={ref}
          className={[styles.contentInner, className].filter(Boolean).join(' ')}
        >
          <Streamdown plugins={streamdownPlugins}>{children}</Streamdown>
        </div>
      </CollapsibleContent>
    );
  }
);

// Legacy alias preserved for infrastructure compatibility pending rename migration
export const ThinkingIndicator = Reasoning;
export type ThinkingIndicatorProps = ReasoningProps;
