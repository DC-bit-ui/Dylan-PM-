import {
  Badge,
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import type { CallAnalyticsResponse } from '@/types/stats';
import { fmtPct, fmtIsoDate } from '@/utils/statsFmt';

const HOURS = Array.from({ length: 24 }, (_, h) => h);

function heatColor(rate: number | null): string {
  if (rate == null) return '#f5f3df';
  if (rate >= 80) return '#2d6a4f';
  if (rate >= 50) return '#d8a040';
  return '#a4524a';
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 1;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx] || 1;
}

export function CallQuality({ data }: { data: CallAnalyticsResponse | null }) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const bodyColor = useColorModeValue('gray.700', 'gray.200');
  const cardBg = useColorModeValue('white', 'gray.900');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const headBg = useColorModeValue('gray.50', 'gray.800');
  const emptyCell = useColorModeValue('#f5f3df', '#2d3748');

  if (!data || !data.totals) {
    return (
      <Text fontSize="sm" color={subColor} fontStyle="italic">
        No call quality data.
      </Text>
    );
  }

  const topOutcomes = Object.entries(data.totals.by_outcome)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const grid = data.heatmap?.grid || [];
  const allTotals = grid.flatMap((row) => row.hours.map((c) => c.total)).filter((t) => t > 0);
  const p90 = percentile(allTotals, 90);
  const cellOpacity = (total: number) =>
    total === 0 ? 0.4 : Math.min(1, Math.max(0.25, total / p90));

  const dur = data.duration_connected_s;
  const bestWindows = data.heatmap?.best_windows || [];
  const leaderboard = data.leaderboard_30d.filter((r) => r.calls > 0);

  return (
    <Box>
      <Text fontSize="xs" color={subColor} mb={3}>
        Connect rate, when-to-call, and per-rep cadence. {data.window_days}-day window · all team
        outbound · {data.timezone}.
      </Text>

      {/* Headline cells */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mb={4}>
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderLeftWidth="3px" borderLeftColor="#2d6a4f" rounded="md" p={3}>
          <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
            Connect rate (overall)
          </Text>
          <Text fontSize="xl" fontWeight={800}>
            {fmtPct(data.totals.connect_rate_pct)}
          </Text>
          <Text fontSize="2xs" color={subColor} mb={2}>
            {data.totals.connected}/{data.totals.calls} calls
          </Text>
          <Flex wrap="wrap" gap={1}>
            {topOutcomes.map(([outcome, count]) => (
              <Text key={outcome} fontSize="2xs" color={subColor} mr={2}>
                <Text as="span" fontWeight={700} color={bodyColor}>{count}</Text> {outcome}
              </Text>
            ))}
          </Flex>
        </Box>
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderLeftWidth="3px" borderLeftColor="#5a6878" rounded="md" p={3}>
          <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
            Connected duration (median)
          </Text>
          <Text fontSize="xl" fontWeight={800}>{dur ? `${dur.median_s}s` : '—'}</Text>
          <Text fontSize="2xs" color={subColor}>
            {dur ? `p75 ${dur.p75_s}s · p90 ${dur.p90_s}s` : 'no connected calls'}
          </Text>
        </Box>
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderLeftWidth="3px" borderLeftColor="#a16207" rounded="md" p={3}>
          <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
            Sample window
          </Text>
          <Text fontSize="xl" fontWeight={800}>{data.window_days} days</Text>
          <Text fontSize="2xs" color={subColor}>
            Generated {fmtIsoDate(data.generated_at, { month: 'short', day: 'numeric' })}
          </Text>
        </Box>
      </SimpleGrid>

      {/* Heat map */}
      <Heading size="xs" textTransform="uppercase" letterSpacing="0.5px" color={subColor} mb={2}>
        Connect rate by day × hour ({data.timezone})
      </Heading>
      {grid.length === 0 ? (
        <Text fontSize="sm" color={subColor} fontStyle="italic" mb={4}>No heatmap data.</Text>
      ) : (
        <Box mb={2} overflowX="auto">
          <Box display="grid" gridTemplateColumns="34px repeat(24, minmax(12px, 1fr))" gap="2px" minW="520px">
            {/* Hour header */}
            <Box />
            {HOURS.map((h) => (
              <Text key={h} fontSize="2xs" color={subColor} textAlign="center">
                {h % 6 === 0 ? h : ''}
              </Text>
            ))}
            {/* Day rows */}
            {grid.map((row) => (
              <Box key={row.day_label} display="contents">
                <Text fontSize="2xs" color={subColor} alignSelf="center" pr={1}>
                  {row.day_label}
                </Text>
                {row.hours.map((cell) => (
                  <Box
                    key={cell.hour}
                    h="16px"
                    rounded="sm"
                    bg={cell.total === 0 ? emptyCell : heatColor(cell.connect_rate_pct)}
                    opacity={cellOpacity(cell.total)}
                    title={`${row.day_label} ${cell.hour}:00 — ${cell.connected}/${cell.total} connected (${fmtPct(cell.connect_rate_pct)})`}
                  />
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      )}
      <Flex gap={3} fontSize="2xs" color={subColor} mb={4} wrap="wrap" align="center">
        <Flex align="center" gap={1}><Box w="10px" h="10px" rounded="sm" bg="#a4524a" />&lt;50%</Flex>
        <Flex align="center" gap={1}><Box w="10px" h="10px" rounded="sm" bg="#d8a040" />50–80%</Flex>
        <Flex align="center" gap={1}><Box w="10px" h="10px" rounded="sm" bg="#2d6a4f" />80%+</Flex>
        <Text>· fainter = smaller sample</Text>
      </Flex>

      {/* Best windows + leaderboard */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
        <Box>
          <Heading size="xs" textTransform="uppercase" letterSpacing="0.5px" color={subColor} mb={2}>
            Best connect windows · top 5 (≥10 sample)
          </Heading>
          <Box border="1px solid" borderColor={cardBorder} rounded="md" overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead bg={headBg}>
                <Tr>
                  <Th>#</Th>
                  <Th>When</Th>
                  <Th isNumeric>Connect rate</Th>
                  <Th isNumeric>Sample</Th>
                </Tr>
              </Thead>
              <Tbody>
                {bestWindows.length === 0 ? (
                  <Tr><Td colSpan={4}><Text fontSize="xs" color={subColor} fontStyle="italic">Not enough data yet — need ≥10 calls per hour-cell.</Text></Td></Tr>
                ) : (
                  bestWindows.map((w, i) => (
                    <Tr key={`${w.day_of_week}-${w.hour_aest}`}>
                      <Td fontWeight={700}>{i + 1}</Td>
                      <Td fontSize="xs" color={bodyColor}>{w.day_label} {w.hour_aest}:00</Td>
                      <Td isNumeric fontWeight={700}>{fmtPct(w.connect_rate_pct)}</Td>
                      <Td isNumeric fontSize="xs" color={subColor}>{w.connected}/{w.total}</Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
        <Box>
          <Heading size="xs" textTransform="uppercase" letterSpacing="0.5px" color={subColor} mb={2}>
            Per-rep leaderboard · rolling 30 days
          </Heading>
          <Box border="1px solid" borderColor={cardBorder} rounded="md" overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead bg={headBg}>
                <Tr>
                  <Th>Rep</Th>
                  <Th isNumeric>Calls</Th>
                  <Th isNumeric>Per day</Th>
                  <Th isNumeric>Connect %</Th>
                </Tr>
              </Thead>
              <Tbody>
                {leaderboard.length === 0 ? (
                  <Tr><Td colSpan={4}><Text fontSize="xs" color={subColor} fontStyle="italic">No reps with calls in window.</Text></Td></Tr>
                ) : (
                  leaderboard.map((r) => (
                    <Tr key={r.owner_id}>
                      <Td>
                        <Text as="span" fontSize="xs" fontWeight={600} color={bodyColor}>{r.name}</Text>
                        {!r.is_sales_rep && <Badge ml={2} fontSize="2xs" colorScheme="gray">ops</Badge>}
                      </Td>
                      <Td isNumeric fontWeight={700}>{r.calls}</Td>
                      <Td isNumeric fontSize="xs">{r.per_day}</Td>
                      <Td isNumeric fontSize="xs">{fmtPct(r.connect_rate_pct)}</Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </SimpleGrid>

      {data.caveats && data.caveats.length > 0 && (
        <Box mt={3}>
          {data.caveats.map((c, i) => (
            <Text key={i} fontSize="2xs" color={subColor}>· {c}</Text>
          ))}
        </Box>
      )}
    </Box>
  );
}
