import {
  Box,
  Flex,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import type {
  CallMonitoringResponse,
  CallAnalyticsResponse,
} from '@/types/stats';

// Rich call-volume breakdown for Home: bar chart with daily-target line,
// efficacy tiles (Storm Boy share / connect rate / visits per 100), and the
// top-3 reps leaderboard from call-analytics. Combines two endpoints so the
// breakdown reads as a single "where the calls are going" picture.

interface CallVolumeCardProps {
  cm: CallMonitoringResponse | null;
  ca: CallAnalyticsResponse | null;
}

function weekdayShort(iso: string): string {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' });
  } catch { return ''; }
}

export function CallVolumeCard({ cm, ca }: CallVolumeCardProps) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const bodyColor = useColorModeValue('gray.700', 'gray.200');
  const barTrack = useColorModeValue('gray.100', 'gray.700');
  const barFill = useColorModeValue('green.500', 'green.400');
  const targetColor = useColorModeValue('orange.400', 'orange.300');
  const todayDot = useColorModeValue('brand.500', 'brand.300');

  if (!cm) {
    return <Text fontSize="xs" color={subColor} fontStyle="italic">Loading…</Text>;
  }

  const last7 = (cm.days || []).slice(-7);
  const today = new Date().toISOString().slice(0, 10);
  const maxCalls = Math.max(1, ...last7.map((d) => d.date_called_count || 0));
  const weeklyTarget = cm.this_week.target || 0;
  // Per-day target ≈ weekly target / 5 weekdays (the team works calling Mon-Fri).
  const perDayTarget = weeklyTarget > 0 ? Math.round(weeklyTarget / 5) : 0;
  const chartMax = Math.max(maxCalls, perDayTarget || 0);

  const sbShare = cm.this_week.total_connected > 0
    ? (cm.this_week.storm_boy_connected / cm.this_week.total_connected) * 100
    : 0;
  const visitsPer100 = cm.efficacy_tiles.visits_per_100_calls;
  const connectRate = ca?.totals?.connect_rate_pct;

  const topReps = (ca?.leaderboard_30d || [])
    .filter((r) => r.calls > 0 && r.is_sales_rep)
    .slice(0, 3);

  return (
    <Stack spacing={5}>
      {/* 7-day bar chart with daily target reference */}
      <Box>
        <Flex justify="space-between" align="baseline" mb={2}>
          <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
            7-day call volume
          </Text>
          {perDayTarget > 0 && (
            <Flex align="center" gap={1.5}>
              <Box w="14px" h="1px" bg={targetColor} borderTop="1.5px dashed" borderColor={targetColor} />
              <Text fontSize="2xs" color={subColor}>daily target ≈ {perDayTarget}</Text>
            </Flex>
          )}
        </Flex>
        <Box position="relative" h="96px">
          <Flex gap={1} h="100%" align="flex-end">
            {last7.map((d, i) => {
              const count = d.date_called_count || 0;
              const h = chartMax > 0 ? (count / chartMax) * 70 : 0; // bar zone is ~70% of card height
              const isToday = d.day === today;
              return (
                <Box key={i} flex={1} display="flex" flexDirection="column" alignItems="center" h="100%" justifyContent="flex-end">
                  <Text fontSize="2xs" fontWeight={isToday ? 800 : 600} mb={1} color={isToday ? todayDot : bodyColor}>
                    {count}
                  </Text>
                  <Box w="100%" h="60px" bg={barTrack} rounded="sm" display="flex" alignItems="flex-end" overflow="hidden">
                    <Box bg={barFill} w="100%" h={`${Math.max(2, h * (60 / 70))}px`} rounded="sm" />
                  </Box>
                  <Text fontSize="2xs" color={isToday ? todayDot : subColor} mt={1} fontWeight={isToday ? 700 : 400}>
                    {weekdayShort(d.day)}
                  </Text>
                </Box>
              );
            })}
          </Flex>
          {/* Dashed target line overlay over the 60px bar zone */}
          {perDayTarget > 0 && chartMax > 0 && (
            <Box
              position="absolute"
              left={0}
              right={0}
              h="0"
              borderTop="1.5px dashed"
              borderColor={targetColor}
              pointerEvents="none"
              top={`calc(${100 - 60 / 96 * (perDayTarget / chartMax) * 100}% - ${(perDayTarget / chartMax) * 60}px + 18px)`}
            />
          )}
        </Box>
      </Box>

      {/* Efficacy tiles */}
      <Box>
        <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px" mb={2}>
          Efficacy
        </Text>
        <SimpleGrid columns={3} spacing={3}>
          <Box>
            <Text fontSize="xl" fontWeight={800} lineHeight={1}>{sbShare.toFixed(0)}%</Text>
            <Text fontSize="2xs" color={subColor} mt={1}>Storm Boy share</Text>
          </Box>
          <Box>
            <Text fontSize="xl" fontWeight={800} lineHeight={1}>
              {connectRate != null ? `${connectRate.toFixed(0)}%` : '—'}
            </Text>
            <Text fontSize="2xs" color={subColor} mt={1}>Connect rate</Text>
          </Box>
          <Box>
            <Text fontSize="xl" fontWeight={800} lineHeight={1}>
              {visitsPer100 != null ? visitsPer100.toFixed(1) : '—'}
            </Text>
            <Text fontSize="2xs" color={subColor} mt={1}>Visits / 100 calls</Text>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Top reps leaderboard */}
      {topReps.length > 0 && (
        <Box>
          <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px" mb={2}>
            Top reps · last 30 days
          </Text>
          <Stack spacing={1.5}>
            {topReps.map((r, i) => (
              <Flex key={r.owner_id} justify="space-between" align="baseline" fontSize="xs" gap={2}>
                <Text noOfLines={1}>
                  <Text as="span" color={subColor} mr={1}>#{i + 1}</Text>
                  <Text as="span" fontWeight={700}>{r.name}</Text>
                </Text>
                <HStack spacing={3} color={subColor} flexShrink={0}>
                  <Text><Text as="span" color={bodyColor} fontWeight={700}>{r.calls}</Text> calls</Text>
                  <Text>{r.per_day}/day</Text>
                  {r.connect_rate_pct != null && (
                    <Text>{r.connect_rate_pct.toFixed(0)}% connect</Text>
                  )}
                </HStack>
              </Flex>
            ))}
          </Stack>
        </Box>
      )}

      {/* Caveats */}
      {cm.caveats && cm.caveats.length > 0 && (
        <Box>
          {cm.caveats.slice(0, 2).map((c, i) => (
            <Text key={i} fontSize="2xs" color={subColor}>· {c}</Text>
          ))}
        </Box>
      )}
    </Stack>
  );
}
