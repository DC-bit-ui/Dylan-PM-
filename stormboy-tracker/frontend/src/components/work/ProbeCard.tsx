import { Badge, Box, HStack, Link, Tag, Text, useColorModeValue } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import type { OpenProbe } from '@/types/work';

export function ProbeCard({ probe: p }: { probe: OpenProbe }) {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.200', 'gray.700');
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const ctxBg = useColorModeValue('gray.50', 'gray.900');

  const stale = (p.days_open ?? 0) >= 7;

  return (
    <Box bg={bg} border="1px solid" borderColor={border} rounded="md" p={3}>
      <HStack justify="space-between" mb={1} flexWrap="wrap">
        <HStack spacing={1.5}>
          {p.rep_name && (
            <Tag size="sm" colorScheme="brand" variant="subtle" fontSize="2xs">
              {p.rep_name}
            </Tag>
          )}
          <Badge fontSize="2xs" colorScheme={stale ? 'red' : 'gray'}>
            {p.days_open ?? 0}d open
          </Badge>
          {p.source_kind && (
            <Badge fontSize="2xs" colorScheme="purple" variant="subtle">
              {p.source_kind}
            </Badge>
          )}
        </HStack>
        {p.source_url && (
          <Link href={p.source_url} isExternal fontSize="xs">
            <ExternalLinkIcon />
          </Link>
        )}
      </HStack>
      <Text fontSize="sm" fontWeight={600} mb={p.context ? 1.5 : 0} lineHeight={1.45}>
        {p.question}
      </Text>
      {p.context && (
        <Box bg={ctxBg} fontSize="xs" color={subColor} p={2} rounded="sm">
          {p.context}
        </Box>
      )}
    </Box>
  );
}
