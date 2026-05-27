import {
  Badge,
  Box,
  Link,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import type { TicketSlaResponse } from '@/types/stats';
import { fmtDays } from '@/utils/statsFmt';

export function TicketSla({ data }: { data: TicketSlaResponse | null }) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const bodyColor = useColorModeValue('gray.700', 'gray.200');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const headBg = useColorModeValue('gray.50', 'gray.800');
  const noiseBg = useColorModeValue('gray.50', 'gray.800');
  const linkColor = useColorModeValue('brand.600', 'brand.300');
  const completionBg = useColorModeValue('green.50', 'green.900');
  const completionBorder = useColorModeValue('green.300', 'green.700');
  const rowEmptyOpacity = 0.5;

  // SLA-read callout tone driven by the headline text + open volume.
  const slaTone = (() => {
    if (data && /bottleneck/i.test(data.headline)) return 'bad';
    if (data && data.open_total > 20) return 'flat';
    return 'good';
  })();
  const slaBg = useColorModeValue(
    slaTone === 'bad' ? 'red.50' : slaTone === 'flat' ? 'orange.50' : 'green.50',
    slaTone === 'bad' ? 'red.900' : slaTone === 'flat' ? 'orange.900' : 'green.900',
  );
  const slaColor = useColorModeValue(
    slaTone === 'bad' ? 'red.700' : slaTone === 'flat' ? 'orange.700' : 'green.700',
    slaTone === 'bad' ? 'red.200' : slaTone === 'flat' ? 'orange.200' : 'green.200',
  );

  if (!data || !data.stages) {
    return (
      <Text fontSize="sm" color={subColor} fontStyle="italic">
        No ticket SLA data.
      </Text>
    );
  }

  return (
    <Box>
      <Text fontSize="xs" color={subColor} mb={3}>
        {data.total_tickets} total · {data.real_worked.total} real-worked (past auto-create) ·{' '}
        {data.automation_noise.new_count} in auto-create stage.
      </Text>

      <Box bg={noiseBg} color={subColor} rounded="md" px={3} py={2} mb={2} fontSize="xs">
        <Text as="span" fontWeight={700} mr={1}>⚠ Noise:</Text>
        {data.automation_noise.note}
      </Box>
      <Box bg={slaBg} color={slaColor} rounded="md" px={3} py={2} mb={3} fontSize="xs">
        <Text as="span" fontWeight={700} mr={1}>SLA read:</Text>
        {data.headline}
      </Box>

      <Box border="1px solid" borderColor={cardBorder} rounded="md" overflowX="auto">
        <Table size="sm" variant="simple">
          <Thead bg={headBg}>
            <Tr>
              <Th>Stage</Th>
              <Th isNumeric>Count</Th>
              <Th isNumeric>Median age</Th>
              <Th isNumeric>P75</Th>
              <Th isNumeric>Max</Th>
              <Th>Oldest currently stuck</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.stages.map((s) => (
              <Tr key={s.stage_id} opacity={s.is_open ? 1 : rowEmptyOpacity}>
                <Td>
                  <Text as="span" fontSize="xs" fontWeight={600} color={bodyColor}>
                    {s.stage_label}
                  </Text>
                  {!s.is_open && (
                    <Badge ml={2} fontSize="2xs" colorScheme="gray">closed</Badge>
                  )}
                </Td>
                <Td isNumeric fontWeight={700}>{s.count}</Td>
                <Td isNumeric>{fmtDays(s.median_age_d)}</Td>
                <Td isNumeric>{fmtDays(s.p75_age_d)}</Td>
                <Td isNumeric>{fmtDays(s.max_age_d)}</Td>
                <Td maxW="280px">
                  {s.oldest_stuck.length > 0 ? (
                    s.oldest_stuck.map((t, i) => (
                      <Text as="span" key={t.id} fontSize="2xs">
                        {i > 0 && ' · '}
                        <Link href={t.hubspot_url} isExternal color={linkColor}>
                          {t.subject.slice(0, 40)}
                        </Link>{' '}
                        {t.age_d}d
                      </Text>
                    ))
                  ) : (
                    <Text fontSize="xs" color={subColor}>—</Text>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Box bg={completionBg} border="1px solid" borderColor={completionBorder} rounded="md" px={3} py={2} mt={3}>
        <Text fontSize="sm" fontWeight={700}>
          {fmtDays(data.completion.median_d)} median · {fmtDays(data.completion.p75_d)} p75 ·{' '}
          {fmtDays(data.completion.p90_d)} p90
        </Text>
        <Text fontSize="2xs" color={subColor}>
          completion cycle · n={data.completion.count} · max {fmtDays(data.completion.max_d)}
        </Text>
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
