import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import type { GeographicResponse, GeographicRegion } from '@/types/stats';
import { fmtPct, fmtNum, fmtHa, fmtDays } from '@/utils/statsFmt';

export function Geographic({ data }: { data: GeographicResponse | null }) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const rowBg = useColorModeValue('white', 'gray.900');
  const border = useColorModeValue('gray.200', 'gray.700');
  const trackBg = useColorModeValue('gray.100', 'gray.700');
  const divider = useColorModeValue('gray.100', 'gray.700');

  if (!data?.regions || data.regions.length === 0) {
    return <Text fontSize="sm" color={subColor} fontStyle="italic">No geographic data.</Text>;
  }

  const regions = data.regions;
  const maxClosed = Math.max(...regions.map((r) => r.closed_deals), 1);
  const maxHa = Math.max(...regions.map((r) => r.won_hectares), 1);
  const isNrm = regions.some((r) => r.region_kind === 'nrm') || /NRM|catchment/i.test(regions[0].region_name || '');

  return (
    <Box>
      <Text fontSize="xs" color={subColor} mb={3}>
        {isNrm
          ? 'Per-NRM-region performance. Postcodes mapped to natural resource management regions; deals with no postcode aggregated as Unknown.'
          : 'Per-state performance. Closed deals, won hectares, and active pipeline by Australian state.'}
        {data.unknown_count != null && data.unknown_count > 0
          ? ` · ${data.unknown_count} deals with unmapped location.`
          : ''}
      </Text>

      {data.headline && (
        <Box bg={useColorModeValue('gray.50', 'gray.900')} rounded="md" px={3} py={2} mb={3} fontSize="xs" color={labelColor}>
          <Text as="span" fontWeight={700} mr={2}>Read:</Text>
          {data.headline}
        </Box>
      )}

      <Box bg={rowBg} border="1px solid" borderColor={border} rounded="md" overflow="hidden">
        <SimpleGrid columns={{ base: 1, md: 6 }} spacing={2} px={3} py={2} bg={useColorModeValue('gray.50', 'gray.800')} fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor}>
          <Text>Region</Text>
          <Text>Closed deals</Text>
          <Text>Won hectares</Text>
          <Text>Win rate</Text>
          <Text>Median cycle</Text>
          <Text>Active pipeline</Text>
        </SimpleGrid>
        {regions.map((r) => (
          <RegionRow
            key={r.region_name}
            region={r}
            maxClosed={maxClosed}
            maxHa={maxHa}
            labelColor={labelColor}
            subColor={subColor}
            trackBg={trackBg}
            divider={divider}
          />
        ))}
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

interface RegionRowProps {
  region: GeographicRegion;
  maxClosed: number;
  maxHa: number;
  labelColor: string;
  subColor: string;
  trackBg: string;
  divider: string;
}
function RegionRow({ region, maxClosed, maxHa, labelColor, subColor, trackBg, divider }: RegionRowProps) {
  const widthClosed = (region.closed_deals / maxClosed) * 100;
  const widthHa = (region.won_hectares / maxHa) * 100;
  const sample = (region.sample_won_deals || []).slice(0, 2).join(' · ');
  return (
    <SimpleGrid
      columns={{ base: 1, md: 6 }}
      spacing={2}
      px={3}
      py={2}
      borderTop="1px solid"
      borderColor={divider}
      alignItems="center"
      fontSize="xs"
    >
      <Box>
        <Heading size="xs" letterSpacing="-0.2px" mb={sample ? 0.5 : 0}>
          {region.region_name}
        </Heading>
        {sample && (
          <Text fontSize="2xs" color={subColor} noOfLines={1}>
            {sample}
          </Text>
        )}
      </Box>
      <Box>
        <BarCell value={region.closed_deals} widthPct={widthClosed} accent="#5a6878" trackBg={trackBg} labelColor={labelColor} />
      </Box>
      <Box>
        <BarCell value={fmtHa(region.won_hectares).replace('ha', '')} widthPct={widthHa} accent="#2d6a4f" trackBg={trackBg} labelColor={labelColor} suffix="ha" />
      </Box>
      <Text fontWeight={700}>{fmtPct(region.win_rate_pct)}</Text>
      <Text>{region.median_cycle_d != null ? fmtDays(region.median_cycle_d) : '—'}</Text>
      <Text>{fmtNum(region.active_pipeline)}</Text>
    </SimpleGrid>
  );
}

interface BarCellProps {
  value: string | number;
  widthPct: number;
  accent: string;
  trackBg: string;
  labelColor: string;
  suffix?: string;
}
function BarCell({ value, widthPct, accent, trackBg, labelColor, suffix }: BarCellProps) {
  return (
    <Flex align="center" gap={2}>
      <Box position="relative" h="14px" flex={1} bg={trackBg} rounded="sm" overflow="hidden">
        <Box position="absolute" left={0} top={0} bottom={0} w={`${Math.max(2, widthPct)}%`} bg={accent} transition="width 0.3s" />
      </Box>
      <Text fontSize="xs" fontWeight={700} color={labelColor} minW="60px" textAlign="right">
        {value}{suffix ? ` ${suffix}` : ''}
      </Text>
    </Flex>
  );
}
