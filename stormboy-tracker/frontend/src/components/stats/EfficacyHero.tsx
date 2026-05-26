import {
  Box,
  Heading,
  SimpleGrid,
  Tag,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState } from 'react';
import type { EfficacyResponse, StatsDelta } from '@/types/stats';
import { fmtPct, fmtPp, fmtDays, fmtHa, fmtNum, trendTone, trendArrow } from '@/utils/statsFmt';

interface HeroCardProps {
  label: string;
  value: string;
  compare: string;
  delta?: StatsDelta | null;
  deltaText?: string;
  note?: string;
}

function HeroCard({ label, value, compare, delta, deltaText, note }: HeroCardProps) {
  const bg = useColorModeValue('white', 'gray.900');
  const border = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const subColor = useColorModeValue('gray.600', 'gray.300');
  const tone = trendTone(delta?.trend);
  return (
    <Box bg={bg} border="1px solid" borderColor={border} rounded="md" p={4}>
      <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor} mb={1}>
        {label}
      </Text>
      <Heading size="lg" letterSpacing="-1px" mb={1}>
        {value}
      </Heading>
      {delta && deltaText && (
        <Tag size="sm" mt={1} mb={2} colorScheme={tone === 'gray' ? 'gray' : tone}>
          {trendArrow(delta.trend)} {deltaText}
        </Tag>
      )}
      <Text fontSize="xs" color={subColor} mb={note ? 1 : 0}>
        {compare}
      </Text>
      {note && (
        <Text fontSize="2xs" color={labelColor} lineHeight={1.4}>
          {note}
        </Text>
      )}
    </Box>
  );
}

export function EfficacyHero({ data }: { data: EfficacyResponse | null }) {
  const [caveatsOpen, setCaveatsOpen] = useState(false);
  const subColor = useColorModeValue('gray.500', 'gray.400');
  if (!data || data.empty) {
    return (
      <Text fontSize="sm" color={subColor} fontStyle="italic">
        {data?.reason || 'No efficacy data available yet.'}
      </Text>
    );
  }
  const sb = data.cohorts.stormboy;
  const ct = data.cohorts.control;
  const lc = data.cohorts.lawrieco;
  const since = (data.window.since_iso || '').slice(0, 10);
  const until = (data.window.until_iso || '').slice(0, 10);
  const lawriecoNote = lc && lc.total_closed
    ? ` · LawrieCo n=${lc.total_closed} carved out (closes ~3x faster, biases comparison)`
    : '';
  const pe = data.pipeline_entry;
  const peSb = pe?.stormboy_era;
  const pePre = pe?.pre_stormboy;
  const peDelta = data.deltas?.pipeline_entry_direct_per_week;
  return (
    <Box>
      <Text fontSize="xs" color={subColor} mb={3}>
        Cohort comparison · {since} → {until} ({data.window.months}mo window) · Stormboy n={sb.total_closed}, direct control n={ct.total_closed}{lawriecoNote} · Stormboy launched {data.stormboy_launch_date}
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={3}>
        <HeroCard
          label="Win rate"
          value={fmtPct(sb.win_rate_pct)}
          compare={`${fmtPct(ct.win_rate_pct)} direct control`}
          delta={data.deltas?.win_rate_pp}
          deltaText={data.deltas?.win_rate_pp ? fmtPp(data.deltas.win_rate_pp.absolute) : undefined}
          note={`${sb.won_count} won / ${sb.lost_count} lost · vs ${ct.won_count} won / ${ct.lost_count} lost`}
        />
        <HeroCard
          label="Median days to decision"
          value={fmtDays(sb.median_days_to_decision)}
          compare={`${fmtDays(ct.median_days_to_decision)} direct control`}
          delta={data.deltas?.median_days_to_decision}
          deltaText={
            data.deltas?.median_days_to_decision
              ? (data.deltas.median_days_to_decision.absolute > 0 ? '+' : '') + fmtDays(data.deltas.median_days_to_decision.absolute)
              : undefined
          }
          note={`won-only: ${fmtDays(sb.median_days_to_close_won)} vs ${fmtDays(ct.median_days_to_close_won)} · n=${sb.n_with_decision_days} vs ${ct.n_with_decision_days}`}
        />
        <HeroCard
          label="Hectares per won deal"
          value={fmtHa(sb.hectares_per_won_deal_mean)}
          compare={`${fmtHa(ct.hectares_per_won_deal_mean)} direct control`}
          delta={data.deltas?.hectares_per_won_deal_mean}
          deltaText={
            data.deltas?.hectares_per_won_deal_mean
              ? (data.deltas.hectares_per_won_deal_mean.absolute > 0 ? '+' : '') + fmtHa(data.deltas.hectares_per_won_deal_mean.absolute)
              : undefined
          }
          note={`total enrolled: ${fmtHa(sb.hectares_won)} vs ${fmtHa(ct.hectares_won)}`}
        />
        <HeroCard
          label="Direct deals to pipeline / week"
          value={peSb?.direct_per_week != null ? `${peSb.direct_per_week}/wk` : '—'}
          compare={pePre?.direct_per_week != null ? `${pePre.direct_per_week}/wk pre-Stormboy` : '—'}
          delta={peDelta}
          deltaText={
            peDelta
              ? `${peDelta.absolute > 0 ? '+' : ''}${peDelta.absolute}/wk${peDelta.pct_change != null ? ` · ${peDelta.pct_change > 0 ? '+' : ''}${peDelta.pct_change}%` : ''}`
              : undefined
          }
          note={peSb && pePre ? `${peSb.direct_count} direct in ${peSb.weeks}wk Stormboy era · vs ${pePre.direct_count} in ${pePre.weeks}wk · LawrieCo excluded (${fmtNum(peSb.excluded_lawrieco)} + ${fmtNum(pePre.excluded_lawrieco)})` : undefined}
        />
      </SimpleGrid>
      {data.caveats && data.caveats.length > 0 && (
        <Box mt={3}>
          <Text
            as="button"
            fontSize="xs"
            color={subColor}
            onClick={() => setCaveatsOpen((s) => !s)}
            textDecoration="underline"
            cursor="pointer"
          >
            {caveatsOpen ? 'Hide' : 'How to read this'}
          </Text>
          {caveatsOpen && (
            <Box as="ul" mt={2} pl={4} fontSize="xs" color={subColor}>
              {data.caveats.map((c, i) => (
                <Box as="li" key={i} mb={0.5}>{c}</Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
