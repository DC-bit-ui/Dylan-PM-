import {
  Box,
  Heading,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import type { ForecastResponse, ForecastCohort } from '@/types/stats';
import { fmtHa, fmtNum, fmtPct } from '@/utils/statsFmt';

const COHORT_LABELS: Record<ForecastCohort, string> = {
  stormboy: 'Stormboy',
  control: 'Direct control',
  lawrieco: 'LawrieCo',
};
const COHORT_ACCENT: Record<ForecastCohort, string> = {
  stormboy: '#2d6a4f',
  control: '#5a6878',
  lawrieco: '#a16207',
};

function fillPct(expected: number, total: number): number {
  if (!total) return 0;
  return (expected / total) * 100;
}

export function Forecast({ data }: { data: ForecastResponse | null }) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const bodyColor = useColorModeValue('gray.700', 'gray.200');
  const cardBg = useColorModeValue('white', 'gray.900');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const headBg = useColorModeValue('gray.50', 'gray.800');
  const riskBg = useColorModeValue('red.50', 'red.900');
  const riskColor = useColorModeValue('red.700', 'red.200');

  if (!data || !data.by_stage) {
    return (
      <Text fontSize="sm" color={subColor} fontStyle="italic">
        No forecast data.
      </Text>
    );
  }

  const overTarget = data.gap_to_30k_hectares < 0;
  const headlineAccent = overTarget ? '#2d6a4f' : '#8a3024';

  return (
    <Box>
      <Text fontSize="xs" color={subColor} mb={3}>
        Open pipeline weighted by historical stage-win probability (per cohort) — the leading
        indicator paired with the trailing trajectory.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mb={4}>
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderLeftWidth="3px" borderLeftColor={headlineAccent} rounded="md" p={3}>
          <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
            Already registered
          </Text>
          <Text fontSize="xl" fontWeight={800}>{fmtHa(data.already_registered_hectares)}</Text>
          <Text fontSize="2xs" color={subColor}>won since target set</Text>
        </Box>
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderLeftWidth="3px" borderLeftColor="#5a6878" rounded="md" p={3}>
          <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
            Expected from open pipeline
          </Text>
          <Text fontSize="xl" fontWeight={800}>{fmtHa(data.expected_to_register_hectares)}</Text>
          <Text fontSize="2xs" color={subColor}>{fmtHa(data.open_pipeline_hectares)} open total</Text>
        </Box>
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderLeftWidth="3px" borderLeftColor={headlineAccent} rounded="md" p={3}>
          <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
            Projected total vs {fmtNum(data.target_hectares)}
          </Text>
          <Text fontSize="xl" fontWeight={800}>
            {fmtHa(data.projected_total_hectares)} · {fmtPct(data.pct_covered_by_pipeline)}
          </Text>
          <Text fontSize="2xs" color={subColor}>
            {overTarget
              ? `${fmtHa(Math.abs(data.gap_to_30k_hectares))} buffer`
              : `${fmtHa(data.gap_to_30k_hectares)} gap`}
          </Text>
        </Box>
      </SimpleGrid>

      {data.at_risk.count > 0 && (
        <Box bg={riskBg} color={riskColor} rounded="md" px={3} py={2} mb={4} fontSize="xs">
          <Text as="span" fontWeight={700} mr={1}>At risk:</Text>
          {data.at_risk.count} open deals ({fmtHa(data.at_risk.hectares)}) have been in current stage
          {' >'} {data.at_risk.threshold_days} days.
        </Box>
      )}

      <Heading size="xs" textTransform="uppercase" letterSpacing="0.5px" color={subColor} mb={2}>
        Expected hectares by current stage
      </Heading>
      <Box border="1px solid" borderColor={cardBorder} rounded="md" overflowX="auto" mb={4}>
        <Table size="sm" variant="simple">
          <Thead bg={headBg}>
            <Tr>
              <Th>Stage</Th>
              <Th isNumeric>Open deals</Th>
              <Th isNumeric>Open ha</Th>
              <Th isNumeric>Expected ha</Th>
              <Th isNumeric>Weighted by</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.by_stage.map((s) => (
              <Tr key={s.stage_id}>
                <Td fontSize="xs" color={bodyColor}>{s.stage_name}</Td>
                <Td isNumeric>{s.count}</Td>
                <Td isNumeric>{fmtHa(s.hectares)}</Td>
                <Td isNumeric fontWeight={700}>{fmtHa(s.expected_hectares)}</Td>
                <Td isNumeric fontSize="xs" color={subColor}>{fmtPct(fillPct(s.expected_hectares, s.hectares))}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Heading size="xs" textTransform="uppercase" letterSpacing="0.5px" color={subColor} mb={2}>
        Expected hectares by cohort
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
        {data.by_cohort.map((c) => (
          <Box
            key={c.cohort}
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            borderLeftWidth="3px"
            borderLeftColor={COHORT_ACCENT[c.cohort]}
            rounded="md"
            p={3}
          >
            <Text fontSize="2xs" fontWeight={800} color={COHORT_ACCENT[c.cohort]} textTransform="uppercase" letterSpacing="0.5px" mb={1}>
              {COHORT_LABELS[c.cohort]}
            </Text>
            <Text fontSize="lg" fontWeight={800}>{fmtHa(c.expected_hectares)} expected</Text>
            <Text fontSize="2xs" color={subColor}>
              {c.count} open deals · {fmtHa(c.hectares)} total · {fmtPct(fillPct(c.expected_hectares, c.hectares))} weighted
            </Text>
          </Box>
        ))}
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
