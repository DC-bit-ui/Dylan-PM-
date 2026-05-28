import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import type { StormboySummaryResponse } from '@/types/stormboy';

// Storm Boy contact funnel — counts at each stage from Identified → Exited.
// Bars normalised to the largest stage so the shape is immediately legible.
export function StormboyFunnel({ data }: { data: StormboySummaryResponse | null }) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const bodyColor = useColorModeValue('gray.700', 'gray.200');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const barTrack = useColorModeValue('gray.100', 'gray.700');

  if (!data?.funnel) {
    return <Text fontSize="sm" color={subColor} fontStyle="italic">No funnel data.</Text>;
  }

  const max = Math.max(1, ...data.funnel.map((s) => s.count));

  return (
    <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={4}>
      <Text fontSize="xs" color={subColor} mb={3}>
        {data.total_contacts.toLocaleString()} total contacts · {data.unstaged} unstaged ·{' '}
        {data.not_eligible} not eligible (LawrieCo / partner channels).
      </Text>
      <Box>
        {data.funnel.map((s) => {
          const pct = (s.count / max) * 100;
          return (
            <Box key={s.stage} mb={2}>
              <Flex justify="space-between" align="baseline" mb={1}>
                <Text fontSize="xs" fontWeight={600} color={bodyColor}>{s.stage}</Text>
                <Text fontSize="xs" fontWeight={700}>{s.count}</Text>
              </Flex>
              <Box bg={barTrack} rounded="sm" h="12px" overflow="hidden">
                <Box bg="brand.500" h="100%" w={`${Math.max(2, pct)}%`} opacity={s.count === 0 ? 0.3 : 1} />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
