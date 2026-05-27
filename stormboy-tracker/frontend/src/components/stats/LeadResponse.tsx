import { Box, SimpleGrid, Text, useColorModeValue } from '@chakra-ui/react';
import type { LeadResponseResponse } from '@/types/stats';

const FAST_BUCKETS = new Set(['<1h', '1-24h', '1-3d']);

function bucketColor(label: string): string {
  if (label === 'no-touch') return '#8a2a2a';
  if (FAST_BUCKETS.has(label)) return '#2d6a4f';
  return '#a16207';
}

function calloutTone(headline: string): 'good' | 'bad' | 'flat' {
  if (/never had|far above/i.test(headline)) return 'bad';
  if (/correlates/i.test(headline)) return 'good';
  return 'flat';
}

export function LeadResponse({ data }: { data: LeadResponseResponse | null }) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const trackBg = useColorModeValue('gray.100', 'gray.700');
  const cellBg = useColorModeValue('gray.50', 'gray.900');
  const calloutToneBg = {
    good: useColorModeValue('green.50', 'green.900'),
    bad: useColorModeValue('red.50', 'red.900'),
    flat: useColorModeValue('gray.50', 'gray.900'),
  };
  const calloutToneColor = {
    good: useColorModeValue('green.700', 'green.200'),
    bad: useColorModeValue('red.700', 'red.200'),
    flat: useColorModeValue('gray.700', 'gray.200'),
  };

  if (!data?.buckets) {
    return <Text fontSize="sm" color={subColor} fontStyle="italic">No lead-response data.</Text>;
  }

  const tone = calloutTone(data.headline);
  const maxCount = Math.max(...data.buckets.map((b) => b.count), 1);
  const bk = data.by_outcome.booked_visit;
  const nb = data.by_outcome.no_visit;
  const delta = bk.median_h != null && nb.median_h != null ? nb.median_h - bk.median_h : null;

  return (
    <Box>
      <Text fontSize="xs" color={subColor} mb={3}>
        Time from contact creation to first outbound touch. Speed-to-lead is a leading indicator for booking rate.
      </Text>
      <Box bg={calloutToneBg[tone]} color={calloutToneColor[tone]} rounded="md" px={3} py={2} mb={3} fontSize="xs">
        <Text as="span" fontWeight={700} mr={2}>
          Headline:
        </Text>
        {data.headline}
      </Box>
      <Box mb={4}>
        {data.buckets.map((b) => {
          const widthPct = Math.max(2, (b.count / maxCount) * 100);
          return (
            <Box key={b.label} display="grid" gridTemplateColumns="80px 1fr 56px" gap={2} alignItems="center" mb={1.5}>
              <Text fontSize="xs" fontWeight={600} color={labelColor}>{b.label}</Text>
              <Box position="relative" h="20px" bg={trackBg} rounded="sm" overflow="hidden">
                <Box position="absolute" left={0} top={0} bottom={0} w={`${widthPct}%`} bg={bucketColor(b.label)} transition="width 0.3s" />
                <Text position="absolute" left={2} top="50%" transform="translateY(-50%)" fontSize="2xs" fontWeight={700} color={widthPct > 30 ? 'white' : labelColor}>
                  {b.count}
                </Text>
              </Box>
              <Text fontSize="xs" textAlign="right" color={labelColor}>{b.pct}%</Text>
            </Box>
          );
        })}
      </Box>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
        <Box borderLeft="3px solid" borderLeftColor="#5a6878" bg={cellBg} rounded="md" px={3} py={2}>
          <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor}>Overall (touched)</Text>
          <Text fontSize="sm" mt={1}><strong>{data.overall.median_h}h</strong> median · {data.overall.p75_h}h p75</Text>
          <Text fontSize="xs" color={subColor}>n={data.overall.n} · p90 {data.overall.p90_h}h</Text>
        </Box>
        <Box borderLeft="3px solid" borderLeftColor="#2d6a4f" bg={cellBg} rounded="md" px={3} py={2}>
          <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor}>Booked a visit</Text>
          <Text fontSize="sm" mt={1}><strong>{bk.median_h != null ? `${bk.median_h}h` : '—'}</strong> median response</Text>
          <Text fontSize="xs" color={subColor}>n={bk.n}</Text>
        </Box>
        <Box borderLeft="3px solid" borderLeftColor="#8a3024" bg={cellBg} rounded="md" px={3} py={2}>
          <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor}>No visit booked</Text>
          <Text fontSize="sm" mt={1}><strong>{nb.median_h != null ? `${nb.median_h}h` : '—'}</strong> median response</Text>
          <Text fontSize="xs" color={subColor}>n={nb.n}{delta != null ? ` · Δ ${delta}h` : ''}</Text>
        </Box>
      </SimpleGrid>
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
