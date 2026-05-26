import {
  Box,
  Heading,
  HStack,
  Text,
  useColorModeValue,
  type BoxProps,
} from '@chakra-ui/react';
import type { ReactNode } from 'react';

export type HealthStatus = 'ok' | 'warn' | 'bad' | 'neutral';

interface HealthCardProps extends BoxProps {
  title: string;
  status: HealthStatus;
  big?: ReactNode;
  sub?: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
}

const STATUS_COLOR: Record<HealthStatus, string> = {
  ok: 'green.500',
  warn: 'orange.400',
  bad: 'red.500',
  neutral: 'gray.400',
};

const STATUS_BORDER_LIGHT: Record<HealthStatus, string> = {
  ok: 'green.200',
  warn: 'orange.200',
  bad: 'red.200',
  neutral: 'gray.200',
};

const STATUS_BORDER_DARK: Record<HealthStatus, string> = {
  ok: 'green.700',
  warn: 'orange.700',
  bad: 'red.700',
  neutral: 'gray.700',
};

export function HealthCard({
  title,
  status,
  big,
  sub,
  meta,
  children,
  ...rest
}: HealthCardProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue(
    STATUS_BORDER_LIGHT[status],
    STATUS_BORDER_DARK[status],
  );
  const subColor = useColorModeValue('gray.600', 'gray.400');
  const titleColor = useColorModeValue('gray.700', 'gray.300');
  const metaColor = useColorModeValue('gray.500', 'gray.500');
  const dotColor = STATUS_COLOR[status];

  return (
    <Box
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      rounded="md"
      p={4}
      {...rest}
    >
      <HStack spacing={2} mb={2}>
        <Box w="8px" h="8px" rounded="full" bg={dotColor} />
        <Heading
          size="xs"
          textTransform="uppercase"
          letterSpacing="0.5px"
          color={titleColor}
        >
          {title}
        </Heading>
      </HStack>
      {big != null && (
        <Text fontSize="2xl" fontWeight={700} letterSpacing="-0.5px" lineHeight={1.1}>
          {big}
        </Text>
      )}
      {sub != null && (
        <Text fontSize="sm" color={subColor} mt={1}>
          {sub}
        </Text>
      )}
      {meta != null && (
        <Box mt={2} fontSize="xs" color={metaColor}>
          {meta}
        </Box>
      )}
      {children}
    </Box>
  );
}
