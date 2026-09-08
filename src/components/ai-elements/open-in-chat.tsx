'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ChevronDownIcon, ExternalLinkIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { createContext, useContext, useMemo } from 'react';

import { openInProviders, type OpenInProviderKey } from './open-in-chat-providers';

const OpenInContext = createContext<{ query: string } | undefined>(undefined);

const useOpenInContext = () => {
  const ctx = useContext(OpenInContext);
  if (!ctx) throw new Error('OpenIn components must be used within an OpenIn provider');
  return ctx;
};

export type OpenInProps = ComponentProps<typeof DropdownMenu> & { query: string };

export const OpenIn = ({ query, ...props }: OpenInProps) => {
  const value = useMemo(() => ({ query }), [query]);
  return (
    <OpenInContext.Provider value={value}>
      <DropdownMenu {...props} />
    </OpenInContext.Provider>
  );
};

export type OpenInContentProps = ComponentProps<typeof DropdownMenuContent>;

export const OpenInContent = ({ className, ...props }: OpenInContentProps) => (
  <DropdownMenuContent align="start" className={cn('w-[240px]', className)} {...props} />
);

export type OpenInItemProps = ComponentProps<typeof DropdownMenuItem>;
export const OpenInItem = (props: OpenInItemProps) => <DropdownMenuItem {...props} />;

export type OpenInLabelProps = ComponentProps<typeof DropdownMenuLabel>;
export const OpenInLabel = (props: OpenInLabelProps) => <DropdownMenuLabel {...props} />;

export type OpenInSeparatorProps = ComponentProps<typeof DropdownMenuSeparator>;
export const OpenInSeparator = (props: OpenInSeparatorProps) => (
  <DropdownMenuSeparator {...props} />
);

export type OpenInTriggerProps = ComponentProps<typeof DropdownMenuTrigger>;

export const OpenInTrigger = ({ children, ...props }: OpenInTriggerProps) => (
  <DropdownMenuTrigger {...props} asChild>
    {children ?? (
      <Button type="button" variant="outline">
        Open in chat
        <ChevronDownIcon className="size-4" />
      </Button>
    )}
  </DropdownMenuTrigger>
);

type ProviderItemProps = ComponentProps<typeof DropdownMenuItem> & { provider: OpenInProviderKey };

const OpenInProviderItem = ({ provider, ...props }: ProviderItemProps) => {
  const { query } = useOpenInContext();
  const p = openInProviders[provider];
  return (
    <DropdownMenuItem asChild {...props}>
      <a
        className="flex items-center gap-2"
        href={p.createUrl(query)}
        rel="noopener"
        target="_blank"
      >
        {/* The menu item's own `[&>svg]:size-4` cannot reach through this
            wrapper, which left every provider mark unsized: five collapsed to
            0x0 and Scira rendered at its intrinsic 910x934. */}
        <span className="size-4 shrink-0 [&>svg]:size-full">{p.icon}</span>
        <span className="flex-1">{p.title}</span>
        <ExternalLinkIcon className="size-4 shrink-0" />
      </a>
    </DropdownMenuItem>
  );
};

export type OpenInChatGPTProps = ComponentProps<typeof DropdownMenuItem>;
export const OpenInChatGPT = (props: OpenInChatGPTProps) => (
  <OpenInProviderItem provider="chatgpt" {...props} />
);

export type OpenInClaudeProps = ComponentProps<typeof DropdownMenuItem>;
export const OpenInClaude = (props: OpenInClaudeProps) => (
  <OpenInProviderItem provider="claude" {...props} />
);

export type OpenInCursorProps = ComponentProps<typeof DropdownMenuItem>;
export const OpenInCursor = (props: OpenInCursorProps) => (
  <OpenInProviderItem provider="cursor" {...props} />
);

export type OpenInSciraProps = ComponentProps<typeof DropdownMenuItem>;
export const OpenInScira = (props: OpenInSciraProps) => (
  <OpenInProviderItem provider="scira" {...props} />
);

export type OpenInT3Props = ComponentProps<typeof DropdownMenuItem>;
export const OpenInT3 = (props: OpenInT3Props) => <OpenInProviderItem provider="t3" {...props} />;

export type OpenInv0Props = ComponentProps<typeof DropdownMenuItem>;
export const OpenInv0 = (props: OpenInv0Props) => <OpenInProviderItem provider="v0" {...props} />;
