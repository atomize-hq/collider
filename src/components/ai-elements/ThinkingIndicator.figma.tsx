import figma from '@figma/code-connect';

import { ThinkingIndicator } from '@/components/ai-elements/ThinkingIndicator';

figma.connect(
  ThinkingIndicator,
  'https://www.figma.com/design/23PLdynlRYoBYQx9teoC8A?node-id=1:1',
  {
    props: {
      intent: figma.enum('Intent', {
        primary: 'primary',
        secondary: 'secondary',
      }),
      label: figma.string('Label'),
      size: figma.enum('Size', {
        md: 'md',
        sm: 'sm',
      }),
    },
    example: ({ intent, label, size }) => (
      <ThinkingIndicator intent={intent} label={label} size={size} />
    ),
  }
);
