import { Box, Flex, Text, Tooltip, useColorModeValue } from '@chakra-ui/react';
import type { HobbsCalendarResponse } from '@/types/stats';

// Horizontal day-strip showing Hobbs's farm-visit density for the next N days.
// Each cell = one day; height-coloured by visit_count; today highlighted; weekends
// faded. Used on the Home page as the at-a-glance "what's in the diary".
interface CalendarStripProps {
  data: HobbsCalendarResponse | null;
  days?: number;
}

function dayOfWeekShort(iso: string): string {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1);
  } catch { return '?'; }
}

function isWeekend(iso: string): boolean {
  try {
    const d = new Date(iso + 'T00:00:00').getDay();
    return d === 0 || d === 6;
  } catch { return false; }
}

export function CalendarStrip({ data, days = 14 }: CalendarStripProps) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const cellBg = useColorModeValue('gray.50', 'gray.700');
  const cellBorder = useColorModeValue('gray.200', 'gray.600');
  const todayBorder = useColorModeValue('brand.500', 'brand.300');
  const visitBg1 = useColorModeValue('green.100', 'green.800');
  const visitBg2 = useColorModeValue('green.300', 'green.600');
  const visitBg3 = useColorModeValue('green.500', 'green.400');
  const weekendFade = 0.55;

  if (!data?.weeks) {
    return <Text fontSize="xs" color={subColor} fontStyle="italic">No calendar data.</Text>;
  }

  // Flatten weeks → days; keep only today + future, cap to `days`.
  const today = new Date().toISOString().slice(0, 10);
  const flat = data.weeks.flatMap((w) => w.days);
  const upcoming = flat.filter((d) => d.date >= today).slice(0, days);

  const colorFor = (count: number) =>
    count >= 3 ? visitBg3 : count === 2 ? visitBg2 : count === 1 ? visitBg1 : cellBg;

  return (
    <Flex gap={1} overflowX="auto" pb={1}>
      {upcoming.map((d) => {
        const visitNames = (d.visits || []).map((v) => v.name).slice(0, 4).join(' · ') || 'No visits';
        const weekend = isWeekend(d.date);
        return (
          <Tooltip key={d.date} label={`${d.date}${d.is_today ? ' · today' : ''} — ${d.visit_count} visit${d.visit_count === 1 ? '' : 's'}${d.visit_count ? `: ${visitNames}` : ''}`} placement="top" hasArrow>
            <Box
              minW="34px"
              h="46px"
              bg={colorFor(d.visit_count)}
              border="1.5px solid"
              borderColor={d.is_today ? todayBorder : cellBorder}
              rounded="md"
              opacity={weekend && d.visit_count === 0 ? weekendFade : 1}
              cursor="default"
              p={1}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text fontSize="2xs" color={subColor} lineHeight={1}>{dayOfWeekShort(d.date)}</Text>
              <Text fontSize="sm" fontWeight={d.is_today ? 800 : 600} lineHeight={1}>
                {d.day_of_month}
              </Text>
              {d.visit_count > 0 && (
                <Text fontSize="2xs" fontWeight={700} lineHeight={1}>{d.visit_count}</Text>
              )}
            </Box>
          </Tooltip>
        );
      })}
    </Flex>
  );
}
