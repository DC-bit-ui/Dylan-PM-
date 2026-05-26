import { Box, Heading, SimpleGrid, Text, useColorModeValue } from '@chakra-ui/react';
import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import type { TrajectoryResponse } from '@/types/stats';
import { fmtPct, fmtPp } from '@/utils/statsFmt';

ChartJS.register(CategoryScale, LinearScale, TimeScale, PointElement, LineElement, Filler, Tooltip, Legend);

export function TrajectoryChart({ data }: { data: TrajectoryResponse | null }) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const gridColor = useColorModeValue('#e2e8f0', '#374151');
  const textColor = useColorModeValue('#374151', '#d1d5db');

  const stats = useMemo(() => {
    if (!data?.weeks?.length) return null;
    const launch = data.stormboy_launch_date;
    let latestWr: typeof data.weeks[number] | null = null;
    let preLaunchWr: typeof data.weeks[number] | null = null;
    for (let i = data.weeks.length - 1; i >= 0; i--) {
      if (data.weeks[i].rolling_win_rate_pct != null) {
        latestWr = data.weeks[i];
        break;
      }
    }
    const launchIdx = data.weeks.findIndex((w) => w.week_start >= launch);
    if (launchIdx > 0) {
      for (let i = launchIdx - 1; i >= 0; i--) {
        if (data.weeks[i].rolling_win_rate_pct != null) {
          preLaunchWr = data.weeks[i];
          break;
        }
      }
    }
    const wrDelta = latestWr?.rolling_win_rate_pct != null && preLaunchWr?.rolling_win_rate_pct != null
      ? Math.round((latestWr.rolling_win_rate_pct - preLaunchWr.rolling_win_rate_pct) * 10) / 10
      : null;
    const postWeeks = data.weeks.filter((w) => w.week_start >= launch);
    const postHa = postWeeks.reduce((s, w) => s + (w.hectares || 0), 0);
    const haPerWk = postWeeks.length ? Math.round(postHa / postWeeks.length) : 0;
    return { latestWr, preLaunchWr, wrDelta, postHa, postWeeks: postWeeks.length, haPerWk };
  }, [data]);

  const chart = useMemo(() => {
    if (!data?.weeks?.length) return null;
    const labels = data.weeks.map((w) => w.week_start);
    return {
      labels,
      datasets: [
        {
          label: 'Trailing win rate (%)',
          data: data.weeks.map((w) => w.rolling_win_rate_pct),
          borderColor: '#2d6a4f',
          backgroundColor: '#2d6a4f',
          yAxisID: 'y',
          tension: 0.3,
          pointRadius: 0,
          spanGaps: true,
        },
        {
          label: 'Hectares enrolled / week',
          data: data.weeks.map((w) => Math.round(w.hectares || 0)),
          borderColor: '#a16207',
          backgroundColor: 'rgba(161,98,7,0.15)',
          yAxisID: 'y1',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
        },
        {
          label: 'Direct pipeline entries / wk',
          data: data.weeks.map((w) => w.direct_pipeline_entries ?? 0),
          borderColor: '#5a6878',
          backgroundColor: '#5a6878',
          yAxisID: 'y1',
          tension: 0.3,
          pointRadius: 0,
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
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: {
          ticks: { color: textColor, maxRotation: 0, autoSkipPadding: 16 },
          grid: { color: gridColor },
        },
        y: {
          position: 'left',
          title: { display: true, text: 'Win rate (%)', color: textColor },
          ticks: { color: textColor },
          grid: { color: gridColor },
        },
        y1: {
          position: 'right',
          title: { display: true, text: 'Hectares / pipeline', color: textColor },
          ticks: { color: textColor },
          grid: { display: false },
        },
      },
    }),
    [textColor, gridColor],
  );

  if (!data?.weeks?.length) {
    return (
      <Text fontSize="sm" color={subColor} fontStyle="italic">
        No trajectory data yet.
      </Text>
    );
  }

  const since = (data.window.since_iso || '').slice(0, 10);
  const until = (data.window.until_iso || '').slice(0, 10);

  return (
    <Box>
      <Text fontSize="xs" color={subColor} mb={3}>
        Trailing {data.rolling_window_weeks}-week win rate and weekly hectares enrolled · {since} → {until} · LawrieCo excluded.
      </Text>
      {stats && (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mb={4}>
          <SummaryCell
            accent="#2d6a4f"
            heading={`${data.rolling_window_weeks}-week rolling win rate now`}
            primary={stats.latestWr ? fmtPct(stats.latestWr.rolling_win_rate_pct) : '—'}
            secondary={stats.latestWr ? `${stats.latestWr.rolling_won}/${stats.latestWr.rolling_closed} in window` : '0/0 in window'}
            tertiary={`vs pre-launch ${stats.preLaunchWr ? fmtPct(stats.preLaunchWr.rolling_win_rate_pct) : '—'}${stats.wrDelta != null ? ` · ${fmtPp(stats.wrDelta)}` : ''}`}
            labelColor={labelColor}
            subColor={subColor}
          />
          <SummaryCell
            accent="#5a6878"
            heading="Hectares enrolled post-launch"
            primary={`${Math.round(stats.postHa).toLocaleString()} ha`}
            secondary={`across ${stats.postWeeks} weeks`}
            tertiary={`≈ ${stats.haPerWk.toLocaleString()} ha/week average since ${data.stormboy_launch_date.slice(5)}`}
            labelColor={labelColor}
            subColor={subColor}
          />
          <SummaryCell
            accent="#a16207"
            heading="Annotation"
            primary={data.stormboy_launch_date}
            secondary="Stormboy launch"
            tertiary="Chart axis shows this as the inflection point"
            labelColor={labelColor}
            subColor={subColor}
          />
        </SimpleGrid>
      )}
      <Box h="320px" mb={2}>
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

interface SummaryCellProps {
  accent: string;
  heading: string;
  primary: string;
  secondary: string;
  tertiary: string;
  labelColor: string;
  subColor: string;
}
function SummaryCell({ accent, heading, primary, secondary, tertiary, labelColor, subColor }: SummaryCellProps) {
  const cellBg = useColorModeValue('gray.50', 'gray.900');
  return (
    <Box borderLeft="3px solid" borderLeftColor={accent} bg={cellBg} rounded="md" px={3} py={2}>
      <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor}>
        {heading}
      </Text>
      <Heading size="sm" mt={1}>
        {primary}
      </Heading>
      <Text fontSize="xs" color={labelColor}>
        {secondary}
      </Text>
      <Text fontSize="2xs" color={subColor} mt={0.5}>
        {tertiary}
      </Text>
    </Box>
  );
}
