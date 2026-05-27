import {
  Badge,
  Box,
  Flex,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import type { FunnelVelocityResponse } from '@/types/stats';
import { fmtPct } from '@/utils/statsFmt';

export function FunnelVelocity({ data }: { data: FunnelVelocityResponse | null }) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const bodyColor = useColorModeValue('gray.700', 'gray.200');
  const cardBg = useColorModeValue('white', 'gray.900');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const barTrack = useColorModeValue('gray.100', 'gray.700');
  const barFill = useColorModeValue('brand.500', 'brand.400');
  const dropBg = useColorModeValue('red.50', 'red.900');
  const dropColor = useColorModeValue('red.700', 'red.200');
  const arrowColor = useColorModeValue('gray.400', 'gray.500');
  const warnColor = useColorModeValue('red.500', 'red.300');

  if (!data || !data.stages) {
    return (
      <Text fontSize="sm" color={subColor} fontStyle="italic">
        No funnel velocity data.
      </Text>
    );
  }

  const total = data.total_ever_entered_funnel || 1;
  const lastIndex = data.stages.length - 1;

  return (
    <Box>
      <Text fontSize="xs" color={subColor} mb={3}>
        {data.total_ever_entered_funnel} contacts have entered the outreach funnel (of{' '}
        {data.total_contacts} total). Bars show how many ever reached each stage.
      </Text>

      {data.biggest_dropoff && (
        <Box bg={dropBg} color={dropColor} rounded="md" px={3} py={2} mb={3} fontSize="xs">
          <Text as="span" fontWeight={700} mr={1}>Biggest dropoff:</Text>
          {data.biggest_dropoff.from_stage} → {data.biggest_dropoff.to_stage} · only{' '}
          {fmtPct(data.biggest_dropoff.conversion_pct)} convert ·{' '}
          {data.biggest_dropoff.dropoff_count} not making it past {data.biggest_dropoff.from_stage}.
        </Box>
      )}

      <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={3}>
        {data.stages.map((s, i) => {
          const widthPct = Math.max(2, (s.ever_reached / total) * 100);
          const isWarnArrow =
            data.biggest_dropoff && data.biggest_dropoff.from_stage === s.stage;
          return (
            <Box key={s.stage}>
              <Flex align="center" gap={3} py={1}>
                <Box flex={1} minW={0}>
                  <Flex align="center" gap={2} mb={1}>
                    <Text fontSize="xs" fontWeight={600} color={bodyColor}>
                      {s.stage}
                    </Text>
                    {s.stuck_count > 0 && (
                      <Badge colorScheme="orange" fontSize="2xs">
                        {s.stuck_count} stuck &gt;28d
                      </Badge>
                    )}
                  </Flex>
                  <Box bg={barTrack} rounded="sm" h="18px" overflow="hidden" position="relative">
                    <Box bg={barFill} h="100%" w={`${widthPct}%`} minW="2%" />
                    <Text
                      position="absolute"
                      left={2}
                      top="50%"
                      transform="translateY(-50%)"
                      fontSize="2xs"
                      fontWeight={700}
                      color={bodyColor}
                    >
                      {s.ever_reached} ever reached
                    </Text>
                  </Box>
                </Box>
                <Box textAlign="right" flexShrink={0} minW="90px">
                  <Text fontSize="xs" fontWeight={700}>{s.currently_at} now</Text>
                  <Text fontSize="2xs" color={subColor}>
                    median {s.median_days_in_stage == null ? '—' : `${s.median_days_in_stage}d`} dwell
                  </Text>
                </Box>
              </Flex>
              {i < lastIndex && (
                <Text
                  fontSize="2xs"
                  fontWeight={isWarnArrow ? 700 : 400}
                  color={isWarnArrow ? warnColor : arrowColor}
                  pl={1}
                  py={0.5}
                >
                  ↓ {fmtPct(s.conversion_to_next_pct)} convert ({s.dropoff_count ?? 0} dropped off)
                </Text>
              )}
            </Box>
          );
        })}
      </Box>

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
