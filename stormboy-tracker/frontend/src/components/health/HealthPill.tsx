import { Tag, type TagProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface HealthPillProps extends Omit<TagProps, 'children'> {
  children: ReactNode;
  tone?: 'neutral' | 'low' | 'moderate' | 'high';
}

const TONE_SCHEME: Record<NonNullable<HealthPillProps['tone']>, string> = {
  neutral: 'gray',
  low: 'red',
  moderate: 'orange',
  high: 'green',
};

export function HealthPill({ children, tone = 'neutral', ...rest }: HealthPillProps) {
  return (
    <Tag
      size="sm"
      variant="subtle"
      colorScheme={TONE_SCHEME[tone]}
      fontSize="2xs"
      fontWeight={600}
      {...rest}
    >
      {children}
    </Tag>
  );
}
