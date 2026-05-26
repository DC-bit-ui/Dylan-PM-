import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Skeleton,
  Alert,
  AlertIcon,
  HStack,
  Progress,
  useColorModeValue,
} from '@chakra-ui/react';
import { useHeaderStats } from '@/hooks/useHeaderStats';

// First React page — proves the stack works end-to-end:
//   • Vite dev server
//   • Chakra UI v2 primitives
//   • Apollo-shape hook (useHeaderStats) calling REST via thin service
//   • Light + dark mode via useColorModeValue
//   • Strict TypeScript types
//
// When this ports into the main frontend, useHeaderStats() swaps to
// useQuery(HEADER_STATS_QUERY). Nothing else in this file changes.

export function HomePage() {
  const { data, loading, error } = useHeaderStats();
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');

  if (error) {
    return (
      <Alert status="error" rounded="md">
        <AlertIcon />
        Failed to load header stats: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Heading size="lg" letterSpacing="-0.5px" mb={1}>
        Home
      </Heading>
      <Text fontSize="sm" color="gray.500" mb={6}>
        Live snapshot of where we are against the 30k hectare target.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={4}>
          <Stat>
            <StatLabel color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="0.5px">
              Hectares registered
            </StatLabel>
            <Skeleton isLoaded={!loading}>
              <StatNumber color="brand.500" fontSize="3xl" letterSpacing="-1px">
                {data ? data.project_ha_since_target.toLocaleString() : '—'}
              </StatNumber>
            </Skeleton>
            <StatHelpText fontSize="xs">
              of {data?.project_ha_target.toLocaleString() ?? '—'} target
              {data ? ` · since ${data.target_set_date}` : ''}
            </StatHelpText>
            <Progress
              value={data?.project_ha_pct ?? 0}
              size="sm"
              colorScheme="brand"
              rounded="sm"
              mt={2}
            />
          </Stat>
        </Box>

        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={4}>
          <Stat>
            <StatLabel color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="0.5px">
              Farm visits this week
            </StatLabel>
            <Skeleton isLoaded={!loading}>
              <HStack align="baseline">
                <StatNumber fontSize="3xl" letterSpacing="-1px">
                  {data ? data.farm_visits.completed_this_week : '—'}
                </StatNumber>
                <Text color="gray.500" fontSize="lg">
                  / {data ? data.farm_visits.booked_this_week : '—'} booked
                </Text>
              </HStack>
            </Skeleton>
            <StatHelpText fontSize="xs">
              {data ? `w/c ${data.farm_visits.week_start} · ${data.farm_visits.lifetime_booked} lifetime` : ''}
            </StatHelpText>
          </Stat>
        </Box>

        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={4}>
          <Stat>
            <StatLabel color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="0.5px">
              Wins since target
            </StatLabel>
            <Skeleton isLoaded={!loading}>
              <StatNumber fontSize="3xl" letterSpacing="-1px">
                {data ? data.wins_since_target : '—'}
              </StatNumber>
            </Skeleton>
            <StatHelpText fontSize="xs">
              {data ? `${data.wins_lifetime} lifetime` : ''}
            </StatHelpText>
          </Stat>
        </Box>

        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={4}>
          <Stat>
            <StatLabel color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="0.5px">
              Most recent win
            </StatLabel>
            <Skeleton isLoaded={!loading}>
              <Text fontSize="md" fontWeight="bold" noOfLines={2} mt={1}>
                {data?.most_recent_win?.deal_name ?? '—'}
              </Text>
            </Skeleton>
            <StatHelpText fontSize="xs">
              {data?.most_recent_win
                ? `${data.most_recent_win.days_ago}d ago · ${data.most_recent_win.closedate.slice(0, 10)}`
                : ''}
            </StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      <Box mt={8} bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={5}>
        <Heading size="sm" mb={2} color="brand.500">
          React rewrite · status
        </Heading>
        <Text fontSize="sm" color="gray.500" lineHeight={1.6}>
          This is the foundation page for the React 18 + TS + Vite + Chakra UI v2 + Apollo-shape rewrite.
          The numbers above are live from the Express backend on <code>:3401</code> — proving the full stack
          works: <strong>service client → hook → page</strong>. Remaining pages will land tab-by-tab; the
          existing vanilla-JS dashboard at <code>/v2/</code> stays live until each surface is ported.
        </Text>
      </Box>
    </Box>
  );
}
