import {
  Box,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import type { PropertySizeResponse, PropertySizeBucket } from '@/types/stats';
import { fmtPct, fmtDays, fmtHa } from '@/utils/statsFmt';

type Tone = 'good' | 'flat' | 'bad';
const WIN_BAR_COLOR: Record<Tone, string> = {
  good: '#2d6a4f',
  flat: '#a16207',
  bad: '#8a3024',
};

export function PropertySize({ data }: { data: PropertySizeResponse | null }) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const bodyColor = useColorModeValue('gray.700', 'gray.200');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const headBg = useColorModeValue('gray.50', 'gray.800');
  const readBg = useColorModeValue('gray.50', 'gray.800');
  const sampleBar = '#5a6878';
  const barTrack = useColorModeValue('gray.100', 'gray.700');

  if (!data || !data.buckets) {
    return (
      <Text fontSize="sm" color={subColor} fontStyle="italic">
        No property-size data.
      </Text>
    );
  }

  const maxN = Math.max(1, ...data.buckets.map((b) => b.n));
  const maxWin = Math.max(1, ...data.buckets.map((b) => b.win_rate_pct ?? 0));

  const bucketTone = (b: PropertySizeBucket): Tone => {
    if (data.sweet_spot && b.key === data.sweet_spot.key) return 'good';
    if (data.worst_bucket && b.key === data.worst_bucket.key) return 'bad';
    return 'flat';
  };

  return (
    <Box>
      <Text fontSize="xs" color={subColor} mb={3}>
        Closed deals over {data.window_months} months ({data.total_closed_deals} total), bucketed by
        estimated project size. {data.excluded}.
      </Text>

      <Box bg={readBg} color={bodyColor} rounded="md" px={3} py={2} mb={3} fontSize="xs">
        <Text as="span" fontWeight={700} mr={1}>Read:</Text>
        {data.headline}
      </Box>

      <Box border="1px solid" borderColor={cardBorder} rounded="md" overflowX="auto">
        <Table size="sm" variant="simple">
          <Thead bg={headBg}>
            <Tr>
              <Th>Size</Th>
              <Th>Sample</Th>
              <Th>W / L</Th>
              <Th>Win rate</Th>
              <Th isNumeric>Median cycle</Th>
              <Th isNumeric>Hectares won</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.buckets.map((b) => {
              const tone = bucketTone(b);
              return (
                <Tr key={b.key}>
                  <Td>
                    <Text fontSize="xs" fontWeight={600} color={bodyColor}>{b.label}</Text>
                    <Text fontSize="2xs" color={subColor}>{b.sub}</Text>
                  </Td>
                  <Td minW="110px">
                    <Flex align="center" gap={2}>
                      <Box bg={barTrack} rounded="sm" h="10px" flex={1} overflow="hidden">
                        <Box bg={sampleBar} h="100%" w={`${(b.n / maxN) * 100}%`} />
                      </Box>
                      <Text fontSize="2xs" color={subColor} minW="20px">{b.n}</Text>
                    </Flex>
                  </Td>
                  <Td fontSize="xs" color={subColor}>{b.won}w · {b.lost}l</Td>
                  <Td minW="110px">
                    <Flex align="center" gap={2}>
                      <Box bg={barTrack} rounded="sm" h="10px" flex={1} overflow="hidden">
                        <Box
                          h="100%"
                          bg={WIN_BAR_COLOR[tone]}
                          w={`${((b.win_rate_pct ?? 0) / maxWin) * 100}%`}
                        />
                      </Box>
                      <Text fontSize="2xs" fontWeight={700} minW="34px">
                        {fmtPct(b.win_rate_pct)}
                      </Text>
                    </Flex>
                  </Td>
                  <Td isNumeric fontSize="xs">{fmtDays(b.median_cycle_d)}</Td>
                  <Td isNumeric fontSize="xs">{fmtHa(b.total_hectares_won)}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
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
