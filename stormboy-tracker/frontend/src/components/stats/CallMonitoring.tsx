import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import type { CallMonitoringResponse } from '@/types/stats';
import { fmtIsoDate, fmtNum } from '@/utils/statsFmt';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

interface TileProps {
  label: string;
  value: string;
  sub?: string;
}

function Tile({ label, value, sub }: TileProps) {
  const bg = useColorModeValue('white', 'gray.900');
  const border = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const subColor = useColorModeValue('gray.600', 'gray.300');
  return (
    <Box bg={bg} border="1px solid" borderColor={border} rounded="md" p={3}>
      <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor}>
        {label}
      </Text>
      <Heading size="sm" mt={1} mb={sub ? 0.5 : 0}>
        {value}
      </Heading>
      {sub && (
        <Text fontSize="2xs" color={subColor}>
          {sub}
        </Text>
      )}
    </Box>
  );
}

export function CallMonitoring({ data }: { data: CallMonitoringResponse | null }) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const heroBg = useColorModeValue('white', 'gray.900');
  const heroBorder = useColorModeValue('gray.200', 'gray.700');
  const barTrackBg = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('#374151', '#d1d5db');
  const gridColor = useColorModeValue('#e2e8f0', '#374151');

  const chart = useMemo(() => {
    if (!data?.days?.length) return null;
    const labels = data.days.map((d) => d.day);
    return {
      labels,
      datasets: [
        {
          type: 'line' as const,
          label: 'Cumulative unique contacts',
          data: data.days.map((d) => d.cumulative_unique_contacts),
          borderColor: '#2d6a4f',
          backgroundColor: 'rgba(45,106,79,0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          yAxisID: 'y',
        },
        {
          type: 'line' as const,
          label: 'Date Called (daily)',
          data: data.days.map((d) => d.date_called_count),
          borderColor: '#5e8a5c',
          backgroundColor: '#5e8a5c',
          pointRadius: 2,
          yAxisID: 'y1',
        },
        {
          type: 'line' as const,
          label: 'Last Contacted only (daily)',
          data: data.days.map((d) => d.last_contacted_only_count),
          borderColor: '#a16207',
          backgroundColor: '#a16207',
          pointRadius: 2,
          yAxisID: 'y1',
          borderDash: [4, 3],
        },
      ],
    };
  }, [data]);

  const options: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index' as const, intersect: false },
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColor, maxRotation: 0, autoSkipPadding: 16 }, grid: { color: gridColor } },
        y: { position: 'left', title: { display: true, text: 'Cumulative', color: textColor }, ticks: { color: textColor }, grid: { color: gridColor } },
        y1: { position: 'right', title: { display: true, text: 'Daily', color: textColor }, ticks: { color: textColor }, grid: { display: false } },
      },
    }),
    [textColor, gridColor],
  );

  if (!data) {
    return (
      <Text fontSize="sm" color={subColor} fontStyle="italic">
        No call-monitoring data yet.
      </Text>
    );
  }

  const tw = data.this_week;
  const vt = data.volume_tiles;
  const et = data.efficacy_tiles;
  const barPct = Math.min(100, tw.pct_of_target);
  const tone = tw.pct_of_target >= 100 ? 'green' : tw.pct_of_target >= 75 ? 'yellow' : 'red';
  const toneColor = tone === 'green' ? '#2d6a4f' : tone === 'yellow' ? '#a16207' : '#a64545';

  return (
    <Box>
      {/* Hero */}
      <Box bg={heroBg} border="1px solid" borderColor={heroBorder} rounded="md" p={4} mb={3}>
        <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor} mb={1}>
          This week vs target · team total
        </Text>
        <Flex align="baseline" gap={3} flexWrap="wrap" mb={1}>
          <Heading size="2xl" letterSpacing="-1.5px" color={toneColor}>
            {tw.storm_boy_connected}
          </Heading>
          <Text fontSize="md" color={subColor}>
            / {tw.target}
          </Text>
          <Text fontSize="sm" color={subColor}>
            ({tw.pct_of_target}% of Storm Boy target · {tw.remaining} remaining)
          </Text>
        </Flex>
        <Text fontSize="xs" color={subColor} mb={2}>
          Total outbound connected this week: <strong>{tw.total_connected}</strong> ({tw.other_campaigns_connected} on other campaigns)
        </Text>
        <Box position="relative" h="10px" bg={barTrackBg} rounded="full" overflow="hidden">
          <Box position="absolute" left={0} top={0} bottom={0} w={`${barPct}%`} bg={toneColor} transition="width 0.3s" />
        </Box>
      </Box>

      {/* Volume tiles */}
      <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor} mb={2}>
        Volume
      </Text>
      <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} spacing={2} mb={4}>
        <Tile label="Unique contacts engaged" value={fmtNum(vt.unique_contacts_engaged)} />
        <Tile label="Via date called" value={fmtNum(vt.via_date_called)} />
        <Tile label="Via last-contacted only" value={fmtNum(vt.via_last_contacted_only)} />
        <Tile label="Storm Boy calls" value={fmtNum(vt.storm_boy_call_volume)} />
        <Tile label="All outbound" value={fmtNum(vt.all_outbound_volume)} />
        <Tile label="Other campaigns" value={fmtNum(vt.other_campaigns_volume)} />
      </SimpleGrid>

      {/* Efficacy tiles */}
      <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor} mb={2}>
        Efficacy
      </Text>
      <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} spacing={2} mb={4}>
        <Tile label="Visits booked" value={fmtNum(et.visits_booked)} />
        <Tile label="Calls / visit booked" value={et.calls_per_visit_booked != null ? String(et.calls_per_visit_booked) : '—'} />
        <Tile label="Visits per 100 calls" value={et.visits_per_100_calls != null ? String(et.visits_per_100_calls) : '—'} />
        <Tile label="Tasks completed" value={fmtNum(et.tasks_completed)} />
        <Tile label="Avg touches / contact" value={et.avg_touches_per_contact != null ? String(et.avg_touches_per_contact) : '—'} />
        <Tile label="First / last engagement" value={`${fmtIsoDate(et.first_engagement)} → ${fmtIsoDate(et.last_engagement)}`} />
      </SimpleGrid>

      {/* Chart */}
      <Box h="280px" mb={2}>
        {chart && <Line data={chart} options={options} />}
      </Box>
      {data.caveats && data.caveats.length > 0 && (
        <Box mt={2}>
          {data.caveats.map((c, i) => (
            <Text key={i} fontSize="2xs" color={subColor}>
              · {c}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
}
