import {
  Box,
  Grid,
  SimpleGrid,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import type { CohortFunnelResponse } from '@/types/stats';

type LookupAny = Record<string, number | null | undefined>;
import { fmtPct, fmtPp } from '@/utils/statsFmt';

const COHORTS: Array<{ key: 'stormboy' | 'control' | 'lawrieco'; label: string; accent: string }> = [
  { key: 'stormboy', label: 'Stormboy', accent: '#2d6a4f' },
  { key: 'control', label: 'Direct control', accent: '#5a6878' },
  { key: 'lawrieco', label: 'LawrieCo (carved out)', accent: '#a16207' },
];

export function CohortFunnel({ data }: { data: CohortFunnelResponse | null }) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const cellBg = useColorModeValue('gray.50', 'gray.900');
  const barTrackBg = useColorModeValue('gray.100', 'gray.700');
  const calloutBg = useColorModeValue('orange.50', 'orange.900');
  const calloutColor = useColorModeValue('orange.700', 'orange.200');

  if (!data || data.empty) {
    return (
      <Text fontSize="sm" color={subColor} fontStyle="italic">
        {data?.reason || 'No funnel data yet.'}
      </Text>
    );
  }

  const since = (data.window.since_iso || '').slice(0, 10);
  const until = (data.window.until_iso || '').slice(0, 10);
  const summary = data.summary;
  const bd = data.biggest_delta;

  return (
    <Box>
      <Text fontSize="xs" color={subColor} mb={3}>
        Stage-by-stage cohort comparison · {since} → {until} · closed deals only. Bars normalised to each cohort's top-of-funnel.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mb={3}>
        {COHORTS.map((c) => {
          const s = (summary as Record<string, typeof summary.stormboy>)[c.key];
          if (!s) return null;
          return (
            <Box key={c.key} borderLeft="3px solid" borderLeftColor={c.accent} bg={cellBg} rounded="md" px={3} py={2}>
              <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor}>
                {c.label}
              </Text>
              <Text fontSize="sm" mt={1}>
                <strong>{s.entered_pipeline || 0}</strong> entered → <strong>{s.reached_won || 0}</strong> won
              </Text>
              <Text fontSize="xs" color={subColor}>
                {fmtPct(s.total_funnel_conversion_pct)} end-to-end · {fmtPct(s.overall_win_rate_pct)} of closed
              </Text>
            </Box>
          );
        })}
      </SimpleGrid>

      {bd?.stage_name && bd.delta_pp != null && (
        <Box bg={calloutBg} color={calloutColor} rounded="md" px={3} py={2} mb={3} fontSize="xs">
          <Text as="span" fontWeight={700} mr={2}>
            Biggest Stormboy-vs-control delta:
          </Text>
          {bd.stage_name} stage · Stormboy {fmtPp(bd.delta_pp)} {bd.delta_pp > 0 ? 'higher' : 'lower'} than control
        </Box>
      )}

      <Grid templateColumns={{ base: '1fr', md: '160px 1fr 1fr 1fr' }} gap={2} fontSize="xs">
        <Box />
        {COHORTS.map((c) => (
          <Text key={c.key} fontWeight={700} fontSize="2xs" textTransform="uppercase" letterSpacing="0.5px" color={c.accent}>
            {c.label}
          </Text>
        ))}
        {data.stages.map((stage, idx) => {
          const allZero = COHORTS.every((c) => (((stage as unknown) as LookupAny)[c.key] || 0) === 0);
          return (
            <ContextRow key={stage.name} stage={stage} idx={idx} summary={summary} allZero={allZero} cellBg={cellBg} barTrackBg={barTrackBg} subColor={subColor} labelColor={labelColor} />
          );
        })}
      </Grid>
    </Box>
  );
}

interface ContextRowProps {
  stage: CohortFunnelResponse['stages'][number];
  idx: number;
  summary: CohortFunnelResponse['summary'];
  allZero: boolean;
  cellBg: string;
  barTrackBg: string;
  subColor: string;
  labelColor: string;
}
function ContextRow({ stage, idx, summary, allZero, barTrackBg, subColor, labelColor }: ContextRowProps) {
  const stageLookup = (stage as unknown) as LookupAny;
  const summaryLookup = (summary as unknown) as Record<string, { entered_pipeline?: number } | undefined>;
  return (
    <>
      <Box opacity={allZero ? 0.5 : 1}>
        <Text fontSize="xs" fontWeight={600} color={labelColor}>
          {stage.name}
        </Text>
        {allZero && (
          <Text fontSize="2xs" color={subColor} fontStyle="italic">
            stage rarely recorded
          </Text>
        )}
      </Box>
      {COHORTS.map((c) => {
        const count = (stageLookup[c.key] as number | undefined) || 0;
        const conv = stageLookup[c.key + '_conversion_pct'];
        const top = (summaryLookup[c.key]?.entered_pipeline) || 1;
        const widthPct = Math.min(100, Math.max(2, (count / top) * 100));
        const isFirst = idx === 0;
        return (
          <Box key={c.key} opacity={allZero ? 0.5 : 1}>
            <Box position="relative" h="22px" bg={barTrackBg} rounded="sm" overflow="hidden">
              <Box position="absolute" left={0} top={0} bottom={0} bg={c.accent} w={`${widthPct}%`} transition="width 0.25s" />
              <Text position="absolute" right={1.5} top="50%" transform="translateY(-50%)" fontSize="2xs" fontWeight={700} color={widthPct > 60 ? 'white' : labelColor}>
                {count}
              </Text>
            </Box>
            {!isFirst && (
              <Text fontSize="2xs" color={subColor} mt={0.5}>
                {conv == null ? '—' : `${conv > 100 ? '↗' : '↓'} ${fmtPct(conv as number)}`}
              </Text>
            )}
          </Box>
        );
      })}
    </>
  );
}
