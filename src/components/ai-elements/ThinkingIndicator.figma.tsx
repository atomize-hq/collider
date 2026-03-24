import figma from '@figma/code-connect';

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/ThinkingIndicator';

figma.connect(Reasoning, 'https://www.figma.com/design/23PLdynlRYoBYQx9teoC8A?node-id=2130:6', {
  props: {
    isStreaming: figma.boolean('Streaming'),
    open: figma.boolean('Open'),
  },
  example: ({ isStreaming, open }) => (
    <Reasoning isStreaming={isStreaming} open={open}>
      <ReasoningTrigger />
      <ReasoningContent>Let me think about this…</ReasoningContent>
    </Reasoning>
  ),
});
