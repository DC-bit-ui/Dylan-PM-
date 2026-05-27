import {
  Box,
  Flex,
  SimpleGrid,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import type { ProjectionResponse } from '@/types/stats';
import { fmtHa, fmtNum, fmtIsoDate } from '@/utils/statsFmt';

const RING_R = 100;
const RING_C = 2 * Math.PI * RING_R;

type PaceTone = 'good' | 'flat' | 'bad';
function paceTone(pace: number, needed: number): PaceTone {
  if (pace >= needed) return 'good';
  if (pace >= needed * 0.5) return 'flat';
  return 'bad';
}

function fmtEta(iso: string | null): string {
  return fmtIsoDate(iso, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function Projection({ data }: { data: ProjectionResponse | null }) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const bodyColor = useColorModeValue('gray.700', 'gray.200');
  const cardBg = useColorModeValue('white', 'gray.900');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const ringTrack = useColorModeValue('#ece8cd', '#2d3748');
  const goodColor = useColorModeValue('green.600', 'green.300');
  const flatColor = useColorModeValue('orange.600', 'orange.300');
  const badColor = useColorModeValue('red.600', 'red.300');

  if (!data || data.empty) {
    return (
      <Text fontSize="sm" color={subColor} fontStyle="italic">
        No projection yet — needs trajectory data.
      </Text>
    );
  }

  const toneColor = (t: PaceTone) =>
    t === 'good' ? goodColor : t === 'bad' ? badColor : flatColor;

  const pct = Math.max(0, Math.min(100, data.pct_of_target));
  const offset = RING_C * (1 - pct / 100);
  const needed = data.pace.needed_weekly_ha_by_fy_end;
  const shortTone = paceTone(data.pace.short_window_weekly_ha, needed);
  const longTone = paceTone(data.pace.long_window_weekly_ha, needed);

  return (
    <Box>
      <Text fontSize="xs" color={subColor} mb={3}>
        Hectares registered since {fmtIsoDate(data.target_set_date, { day: 'numeric', month: 'short', year: 'numeric' })} vs
        the {fmtNum(data.target_hectares)} ha goal. Pace windows project the hit-date.
      </Text>

      <Flex direction={{ base: 'column', md: 'row' }} gap={5} align="center">
        {/* Ring */}
        <Box position="relative" w="200px" h="200px" flexShrink={0}>
          <Box as="svg" viewBox="0 0 240 240" w="100%" h="100%">
            <circle cx={120} cy={120} r={RING_R} fill="none" stroke={ringTrack} strokeWidth={14} />
            <circle
              cx={120}
              cy={120}
              r={RING_R}
              fill="none"
              stroke="#2d6a4f"
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={RING_C}
              strokeDashoffset={offset}
              transform="rotate(-90 120 120)"
            />
          </Box>
          <Flex
            position="absolute"
            inset={0}
            direction="column"
            align="center"
            justify="center"
          >
            <Text fontSize="3xl" fontWeight={800} lineHeight={1}>
              {pct.toFixed(1)}%
            </Text>
            <Text fontSize="xs" color={subColor} mt={1}>
              {fmtNum(data.registered_hectares)} / {fmtNum(data.target_hectares)} ha
            </Text>
          </Flex>
        </Box>

        {/* Stat tiles */}
        <SimpleGrid columns={2} spacing={3} flex={1} w="100%">
          <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={3}>
            <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
              Remaining
            </Text>
            <Text fontSize="xl" fontWeight={800}>{fmtHa(data.remaining_hectares)}</Text>
            <Text fontSize="2xs" color={subColor}>to {fmtNum(data.target_hectares)} ha</Text>
          </Box>
          <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={3}>
            <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
              Needed by 30 Jun
            </Text>
            <Text fontSize="xl" fontWeight={800}>{fmtHa(needed)}/wk</Text>
            <Text fontSize="2xs" color={subColor}>{data.pace.weeks_to_fy_end} weeks left</Text>
          </Box>
          <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={3}>
            <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
              {data.pace.short_window_weeks}-week pace
            </Text>
            <Text fontSize="xl" fontWeight={800} color={toneColor(shortTone)}>
              {fmtHa(data.pace.short_window_weekly_ha)}/wk
            </Text>
            <Text fontSize="2xs" color={subColor}>ETA {fmtEta(data.projection.at_short_pace.eta)}</Text>
          </Box>
          <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={3}>
            <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
              {data.pace.long_window_weeks}-week pace
            </Text>
            <Text fontSize="xl" fontWeight={800} color={toneColor(longTone)}>
              {fmtHa(data.pace.long_window_weekly_ha)}/wk
            </Text>
            <Text fontSize="2xs" color={subColor}>ETA {fmtEta(data.projection.at_long_pace.eta)}</Text>
          </Box>
        </SimpleGrid>
      </Flex>

      <Text fontSize="xs" color={bodyColor} mt={4}>
        Since-anchor pace {fmtHa(data.pace.since_anchor_weekly_ha)}/wk across {data.weeks_since_anchor} weeks
        — projected hit {fmtEta(data.projection.at_since_anchor_pace.eta)}.
      </Text>

      {data.caveats && data.caveats.length > 0 && (
        <Box mt={2}>
          {data.caveats.map((c, i) => (
            <Text key={i} fontSize="2xs" color={subColor}>· {c}</Text>
          ))}
        </Box>
      )}
    </Box>
  );
}
