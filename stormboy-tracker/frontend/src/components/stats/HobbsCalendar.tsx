import {
  Badge,
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Link,
  SimpleGrid,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import type { HobbsCalendarResponse, HobbsVisit, HobbsVisitState } from '@/types/stats';

const STATE_TONE: Record<HobbsVisitState, { bg: string; border: string; color: string }> = {
  completed:                  { bg: '#2d6a4f',  border: '#2d6a4f',  color: '#ffffff' },
  confirmed_via_transcript:   { bg: '#2d6a4f',  border: '#2d6a4f',  color: '#ffffff' },
  likely_happened:            { bg: '#a16207',  border: '#a16207',  color: '#ffffff' },
  no_show:                    { bg: '#8a3024',  border: '#8a3024',  color: '#ffffff' },
  booked:                     { bg: '#3a6ea5',  border: '#3a6ea5',  color: '#ffffff' },
  canceled:                   { bg: '#7a7a7a',  border: '#7a7a7a',  color: '#ffffff' },
  rescheduled:                { bg: '#7a7a7a',  border: '#7a7a7a',  color: '#ffffff' },
};

const DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function HobbsCalendar({ data }: { data: HobbsCalendarResponse | null }) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const cellBg = useColorModeValue('gray.50', 'gray.900');
  const dayBg = useColorModeValue('white', 'gray.800');
  const dayBorder = useColorModeValue('gray.200', 'gray.700');
  const dayPastBg = useColorModeValue('gray.50', 'gray.900');
  const todayBorder = useColorModeValue('brand.500', 'brand.300');
  const dowHeadBg = useColorModeValue('gray.100', 'gray.700');

  if (!data?.weeks) {
    return <Text fontSize="sm" color={subColor} fontStyle="italic">No farm visit data.</Text>;
  }

  const t = data.totals;
  const completedTotal = (t.completed || 0) + (t.confirmed_via_transcript || 0);

  return (
    <Box>
      <Text fontSize="xs" color={subColor} mb={3}>
        {data.window.since_iso.slice(0, 10)} → {data.window.until_iso.slice(0, 10)} · 2 weeks past + {data.window.future_weeks ?? '?'} weeks forward. How the on-the-ground motion is positioned.
      </Text>
      <Box bg={cellBg} rounded="md" px={3} py={2} mb={3} fontSize="xs" color={labelColor}>
        <Text as="span" fontWeight={700} mr={2}>Read:</Text>
        {data.headline}
      </Box>

      {/* Totals strip */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2} mb={4}>
        <TotalCell accent="#2d6a4f" label="Completed" value={completedTotal} sub={`${t.completed || 0} marked · ${t.confirmed_via_transcript || 0} via transcript`} labelColor={labelColor} subColor={subColor} />
        <TotalCell accent="#3a6ea5" label="Booked forward" value={t.booked || 0} labelColor={labelColor} subColor={subColor} />
        <TotalCell accent="#a16207" label="Past, unconfirmed" value={t.likely_happened || 0} sub="Verify with Hobbs" labelColor={labelColor} subColor={subColor} />
        {((t.no_show || 0) + (t.canceled || 0)) > 0 && (
          <TotalCell accent="#8a3024" label="No-show / canceled" value={(t.no_show || 0) + (t.canceled || 0)} labelColor={labelColor} subColor={subColor} />
        )}
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 200px' }} gap={4}>
        <GridItem minW={0}>
          {/* Day-of-week header */}
          <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={1}>
            {DOW_LABELS.map((d) => (
              <Box key={d} bg={dowHeadBg} px={2} py={1} rounded="sm" fontSize="2xs" fontWeight={700} textTransform="uppercase" letterSpacing="0.5px" color={labelColor} textAlign="center">
                {d}
              </Box>
            ))}
          </Grid>
          {/* Weeks */}
          {data.weeks.map((w, wi) => (
            <Grid key={w.week_start || wi} templateColumns="repeat(7, 1fr)" gap={1} mb={1} bg={w.is_current_week ? useColorModeValue('brand.50', 'brand.900') : undefined} p={w.is_current_week ? 0.5 : 0} rounded="sm">
              {w.days.map((d) => (
                <Box
                  key={d.date}
                  bg={d.is_past ? dayPastBg : dayBg}
                  border="1px solid"
                  borderColor={d.is_today ? todayBorder : dayBorder}
                  rounded="sm"
                  minH="64px"
                  p={1}
                  display="flex"
                  flexDir="column"
                  gap={0.5}
                >
                  <Flex justify="space-between" align="center">
                    <Text fontSize="2xs" fontWeight={d.is_today ? 800 : 500} color={d.is_today ? todayBorder : labelColor}>
                      {d.day_of_month}
                    </Text>
                    {d.visit_count > 0 && (
                      <Badge fontSize="2xs" colorScheme="brand" variant="solid">
                        {d.visit_count}
                      </Badge>
                    )}
                  </Flex>
                  <Box display="flex" flexDir="column" gap={0.5}>
                    {(d.visits || []).map((v, i) => (
                      <VisitChip key={i} visit={v} />
                    ))}
                  </Box>
                </Box>
              ))}
            </Grid>
          ))}
        </GridItem>
        {/* Upcoming sidebar */}
        <GridItem display={{ base: 'none', lg: 'block' }}>
          <Heading size="xs" textTransform="uppercase" letterSpacing="0.5px" color={labelColor} mb={2}>
            Booked / wk forward
          </Heading>
          {(data.visits_per_upcoming_week || []).map((u) => {
            const widthPct = Math.min(100, Math.max(8, (u.booked / 5) * 100));
            return (
              <Flex key={u.week_start} align="center" gap={2} mb={1.5} fontSize="xs">
                <Text minW="60px" color={labelColor}>{u.week_start.slice(5)}</Text>
                <Box position="relative" h="16px" flex={1} bg={cellBg} rounded="sm" overflow="hidden">
                  <Box position="absolute" left={0} top={0} bottom={0} w={`${widthPct}%`} bg="#2d6a4f" transition="width 0.3s" />
                  <Text position="absolute" right={1} top="50%" transform="translateY(-50%)" fontSize="2xs" fontWeight={700} color={widthPct > 50 ? 'white' : labelColor}>
                    {u.booked}
                  </Text>
                </Box>
              </Flex>
            );
          })}
          <Text mt={1} fontSize="2xs" color={subColor}>Bar at 5 = healthy weekly cadence</Text>
        </GridItem>
      </Grid>

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

function VisitChip({ visit: v }: { visit: HobbsVisit }) {
  const tone = STATE_TONE[v.state] || { bg: '#5a6878', border: '#5a6878', color: '#ffffff' };
  const sub = [v.start_local_time, v.nrm_region || v.state_au || v.city].filter(Boolean).join(' · ');
  const tooltipBase = `${v.name} · ${sub} · ${v.state_label}`;
  const tooltip = v.transcript_match
    ? `${tooltipBase}\nTranscript: ${v.transcript_match.slug} (${v.transcript_match.confidence})`
    : tooltipBase;
  const href = v.hubspot_url || v.meeting_url;
  const badge =
    v.state === 'confirmed_via_transcript' && v.transcript_match
      ? `✓${v.transcript_match.confidence === 'high' ? '' : v.transcript_match.confidence === 'medium' ? '?' : '·'}`
      : v.state === 'likely_happened'
        ? '?'
        : null;
  return (
    <Tooltip label={tooltip} placement="top" hasArrow openDelay={300}>
      <Link
        href={href || '#'}
        isExternal={Boolean(href)}
        bg={tone.bg}
        color={tone.color}
        rounded="sm"
        px={1}
        py={0.5}
        fontSize="2xs"
        lineHeight={1.2}
        _hover={{ textDecoration: 'none', filter: 'brightness(1.1)' }}
        display="block"
      >
        <Flex justify="space-between" align="center" gap={1}>
          <Text noOfLines={1} fontWeight={600}>{v.name}</Text>
          {badge && <Text flexShrink={0}>{badge}</Text>}
        </Flex>
        {sub && (
          <Text fontSize="2xs" opacity={0.85} noOfLines={1}>
            {sub}
          </Text>
        )}
      </Link>
    </Tooltip>
  );
}

interface TotalCellProps {
  accent: string;
  label: string;
  value: number;
  sub?: string;
  labelColor: string;
  subColor: string;
}
function TotalCell({ accent, label, value, sub, labelColor, subColor }: TotalCellProps) {
  const bg = useColorModeValue('gray.50', 'gray.900');
  return (
    <Box borderLeft="3px solid" borderLeftColor={accent} bg={bg} rounded="md" px={3} py={2}>
      <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor}>
        {label}
      </Text>
      <Heading size="md" mt={1}>{value}</Heading>
      {sub && (
        <Text fontSize="2xs" color={subColor} mt={0.5}>
          {sub}
        </Text>
      )}
    </Box>
  );
}
