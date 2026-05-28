import {
  Box,
  Flex,
  HStack,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import type { HobbsCalendarResponse, HobbsCalendarDay } from '@/types/stats';

// Hobbs's farm-visit diary as a proper calendar grid: weekday columns
// (Mon→Sun), week rows (current week + next N-1). Each cell shows the
// day number, visit-count badge, and the first visitor's name. Visit-density
// gradient (green) makes the busy days pop; today is brand-bordered; past
// empty days fade. Tooltip lists every visit on the day.

const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface HobbsHomeGridProps {
  data: HobbsCalendarResponse | null;
  weeks?: number;
}

type GridCell = HobbsCalendarDay | {
  date: string;
  day_of_month: number;
  visit_count: 0;
  visits: [];
  is_past?: boolean;
  is_today?: boolean;
  is_future?: boolean;
};

export function HobbsHomeGrid({ data, weeks = 3 }: HobbsHomeGridProps) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const headColor = useColorModeValue('gray.600', 'gray.400');
  const cellBg = useColorModeValue('gray.50', 'gray.700');
  const cellBorder = useColorModeValue('gray.200', 'gray.600');
  const todayBorder = useColorModeValue('brand.500', 'brand.300');
  const visitBg1 = useColorModeValue('green.100', 'green.800');
  const visitBg2 = useColorModeValue('green.300', 'green.700');
  const visitBg3 = useColorModeValue('green.500', 'green.500');
  const bodyColor = useColorModeValue('gray.700', 'gray.200');
  const badgeBg = useColorModeValue('whiteAlpha.700', 'blackAlpha.500');

  if (!data?.weeks) {
    return <Text fontSize="xs" color={subColor} fontStyle="italic">No calendar data.</Text>;
  }

  // Build a date→day map from the server's nested weeks/days.
  const dayMap = new Map<string, HobbsCalendarDay>();
  for (const w of data.weeks) for (const d of w.days) dayMap.set(d.date, d);

  // Anchor on this week's Monday so the grid starts on a stable column.
  const today = new Date().toISOString().slice(0, 10);
  const todayDate = new Date(today + 'T00:00:00');
  const todayDow = (todayDate.getDay() + 6) % 7; // 0=Mon..6=Sun
  const weekStart = new Date(todayDate);
  weekStart.setDate(todayDate.getDate() - todayDow);

  // Lay out `weeks` rows of 7 days, filling missing days with empty cells.
  const grid: GridCell[][] = [];
  const cursor = new Date(weekStart);
  for (let w = 0; w < weeks; w++) {
    const row: GridCell[] = [];
    for (let d = 0; d < 7; d++) {
      const iso = cursor.toISOString().slice(0, 10);
      const existing = dayMap.get(iso);
      if (existing) row.push(existing);
      else row.push({
        date: iso,
        day_of_month: cursor.getDate(),
        visit_count: 0,
        visits: [],
        is_past: iso < today,
        is_today: iso === today,
        is_future: iso > today,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    grid.push(row);
  }

  const colorFor = (count: number) =>
    count >= 3 ? visitBg3 : count === 2 ? visitBg2 : count === 1 ? visitBg1 : cellBg;

  return (
    <Box>
      {/* Weekday header */}
      <Flex gap={1} mb={1}>
        {WEEKDAYS_SHORT.map((wd) => (
          <Box key={wd} flex={1} textAlign="center">
            <Text fontSize="2xs" color={subColor} fontWeight={700} textTransform="uppercase" letterSpacing="0.3px">
              {wd}
            </Text>
          </Box>
        ))}
      </Flex>

      {/* Week rows */}
      <Box>
        {grid.map((row, wi) => (
          <Flex key={wi} gap={1} mb={1}>
            {row.map((d) => {
              const visitNames = (d.visits || []).map((v) => v.name);
              const tooltipBase = d.is_today ? `${d.date} · today` : d.date;
              const tooltip = d.visit_count > 0
                ? `${tooltipBase} — ${d.visit_count} visit${d.visit_count === 1 ? '' : 's'}: ${visitNames.join(', ')}`
                : tooltipBase;
              const isWeekend = ((new Date(d.date + 'T00:00:00').getDay() + 6) % 7) >= 5;
              return (
                <Tooltip key={d.date} label={tooltip} placement="top" hasArrow>
                  <Box
                    flex={1}
                    minH="58px"
                    bg={colorFor(d.visit_count)}
                    border="1.5px solid"
                    borderColor={d.is_today ? todayBorder : cellBorder}
                    rounded="md"
                    opacity={d.is_past && d.visit_count === 0 ? 0.45 : isWeekend && d.visit_count === 0 ? 0.7 : 1}
                    p={1.5}
                    display="flex"
                    flexDirection="column"
                    cursor={d.visit_count > 0 ? 'default' : 'default'}
                    overflow="hidden"
                  >
                    <Flex justify="space-between" align="center" mb={0.5}>
                      <Text fontSize="xs" fontWeight={d.is_today ? 800 : 600} lineHeight={1}>
                        {d.day_of_month}
                      </Text>
                      {d.visit_count > 0 && (
                        <Text fontSize="2xs" fontWeight={800} bg={badgeBg} px={1.5} rounded="sm" lineHeight={1.4}>
                          {d.visit_count}
                        </Text>
                      )}
                    </Flex>
                    {visitNames.length > 0 && (
                      <Text fontSize="2xs" color={bodyColor} noOfLines={1}>
                        {visitNames[0]}{visitNames.length > 1 ? ` +${visitNames.length - 1}` : ''}
                      </Text>
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </Flex>
        ))}
      </Box>

      {/* Totals chips */}
      {data.totals && (
        <HStack spacing={3} mt={3} fontSize="2xs" color={headColor} flexWrap="wrap">
          {data.totals.booked != null && (
            <Text><Text as="span" fontWeight={800} color={bodyColor}>{data.totals.booked}</Text> booked</Text>
          )}
          {data.totals.completed != null && (
            <Text><Text as="span" fontWeight={800} color={bodyColor}>{data.totals.completed}</Text> completed</Text>
          )}
          {(data.totals.confirmed_via_transcript ?? 0) > 0 && (
            <Text><Text as="span" fontWeight={800} color={bodyColor}>{data.totals.confirmed_via_transcript}</Text> transcript-confirmed</Text>
          )}
          {(data.totals.no_show ?? 0) > 0 && (
            <Text color="red.400"><Text as="span" fontWeight={800}>{data.totals.no_show}</Text> no-show</Text>
          )}
          {(data.totals.canceled ?? 0) > 0 && (
            <Text><Text as="span" fontWeight={800} color={bodyColor}>{data.totals.canceled}</Text> canceled</Text>
          )}
          {(data.totals.rescheduled ?? 0) > 0 && (
            <Text><Text as="span" fontWeight={800} color={bodyColor}>{data.totals.rescheduled}</Text> rescheduled</Text>
          )}
        </HStack>
      )}
    </Box>
  );
}
