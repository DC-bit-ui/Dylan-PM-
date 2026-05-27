import {
  Box,
  Code,
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
import type {
  FrictionMapResponse,
  FrictionRankedItem,
  FrictionCohortLossTop,
} from '@/types/stats';
import { fmtPct, fmtPp } from '@/utils/statsFmt';

const COHORT_META: { key: 'stormboy' | 'control' | 'lawrieco'; label: string; accent: string }[] = [
  { key: 'stormboy', label: 'Stormboy', accent: '#2d6a4f' },
  { key: 'control', label: 'Direct control', accent: '#5a6878' },
  { key: 'lawrieco', label: 'LawrieCo', accent: '#a16207' },
];

function dirIcon(direction: string): string {
  if (direction === 'stormboy_winning') return '↑';
  if (direction === 'stormboy_lagging') return '↓';
  return '→';
}

function HeadlineCard({
  item,
  kicker,
  accent,
}: {
  item: FrictionRankedItem | null;
  kicker: string;
  accent: string;
}) {
  const cardBg = useColorModeValue('white', 'gray.900');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const bodyColor = useColorModeValue('gray.700', 'gray.200');
  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      borderLeftWidth="3px"
      borderLeftColor={accent}
      rounded="md"
      p={3}
    >
      <Text fontSize="2xs" fontWeight={800} color={accent} textTransform="uppercase" letterSpacing="0.5px" mb={1}>
        {kicker}
      </Text>
      {item ? (
        <>
          <Heading size="xs" mb={1}>
            {item.lost_at_prev_stage} → {item.stage_name}
          </Heading>
          <Text fontSize="xs" color={bodyColor}>
            Stormboy {fmtPct(item.stormboy_conversion_pct)} vs control{' '}
            {fmtPct(item.control_conversion_pct)} · {fmtPp(item.gap_pp_vs_control)} ·{' '}
            ~{item.estimated_impact_n.toFixed(1)} deal-impact
          </Text>
        </>
      ) : (
        <Text fontSize="xs" color={subColor} fontStyle="italic">
          No transition crosses the threshold yet.
        </Text>
      )}
    </Box>
  );
}

function LossReasonCard({
  label,
  accent,
  reasons,
}: {
  label: string;
  accent: string;
  reasons: FrictionCohortLossTop[];
}) {
  const cardBg = useColorModeValue('white', 'gray.900');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const bodyColor = useColorModeValue('gray.700', 'gray.200');
  return (
    <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={3}>
      <Text fontSize="2xs" fontWeight={800} color={accent} textTransform="uppercase" letterSpacing="0.5px" mb={2}>
        {label}
      </Text>
      {reasons.length > 0 ? (
        <Box as="ul" listStyleType="none" m={0} p={0}>
          {reasons.map((r, i) => (
            <Text as="li" key={i} fontSize="xs" color={bodyColor} mb={1}>
              {fmtPct(r.pct_of_losses)} {r.reason}{' '}
              <Text as="span" color={subColor}>
                (n={r.count})
              </Text>
            </Text>
          ))}
        </Box>
      ) : (
        <Text fontSize="xs" color={subColor} fontStyle="italic">
          No losses recorded.
        </Text>
      )}
    </Box>
  );
}

export function FrictionMap({ data }: { data: FrictionMapResponse | null }) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const bodyColor = useColorModeValue('gray.700', 'gray.200');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const headBg = useColorModeValue('gray.50', 'gray.800');
  const goodColor = useColorModeValue('green.600', 'green.300');
  const badColor = useColorModeValue('red.600', 'red.300');
  const hygieneBg = useColorModeValue('orange.50', 'orange.900');
  const hygieneColor = useColorModeValue('orange.700', 'orange.200');
  const linkColor = useColorModeValue('brand.600', 'brand.300');

  if (!data || data.empty || !data.items_ranked) {
    return (
      <Text fontSize="sm" color={subColor} fontStyle="italic">
        {data?.reason || 'No friction data yet.'}
      </Text>
    );
  }

  const toneColor = (dir: string) =>
    dir === 'stormboy_winning' ? goodColor : dir === 'stormboy_lagging' ? badColor : bodyColor;

  return (
    <Box>
      <Text fontSize="xs" color={subColor} mb={3}>
        Stage transitions ranked by impact (conversion gap × prior-stage volume).
        Closed deals only; LawrieCo carved out.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={4}>
        <HeadlineCard item={data.top_winning} kicker="Protect this" accent="#2d6a4f" />
        <HeadlineCard item={data.top_lagging} kicker="Fix this first" accent="#8a3024" />
      </SimpleGrid>

      <Box border="1px solid" borderColor={cardBorder} rounded="md" overflowX="auto" mb={4}>
        <Table size="sm" variant="simple">
          <Thead bg={headBg}>
            <Tr>
              <Th>#</Th>
              <Th>Transition</Th>
              <Th>Conversion</Th>
              <Th>Gap vs control</Th>
              <Th>What to do</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.items_ranked.length === 0 ? (
              <Tr>
                <Td colSpan={5}>
                  <Text fontSize="sm" color={subColor} fontStyle="italic">
                    No transitions cross the volume threshold yet.
                  </Text>
                </Td>
              </Tr>
            ) : (
              data.items_ranked.map((item, i) => {
                const sbLoss = item.loss_reasons_at_stage.stormboy[0];
                const ctLoss = item.loss_reasons_at_stage.control[0];
                return (
                  <Tr key={item.stage_id}>
                    <Td fontWeight={700}>{i + 1}</Td>
                    <Td>
                      <Text fontSize="xs" fontWeight={600} color={bodyColor}>
                        {item.lost_at_prev_stage} → {item.stage_name}
                      </Text>
                      <Text fontSize="2xs" color={subColor}>
                        {item.stormboy_volume_in_prev} SB · {item.control_volume_in_prev} control at prev stage
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm" fontWeight={700}>
                        {fmtPct(item.stormboy_conversion_pct)}
                      </Text>
                      <Text fontSize="2xs" color={subColor}>
                        control {fmtPct(item.control_conversion_pct)}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm" fontWeight={700} color={toneColor(item.direction)}>
                        {dirIcon(item.direction)} {fmtPp(item.gap_pp_vs_control)}
                      </Text>
                      <Text fontSize="2xs" color={subColor}>
                        ~{item.estimated_impact_n.toFixed(1)} deals
                      </Text>
                    </Td>
                    <Td maxW="280px">
                      {item.recommended_fix ? (
                        <>
                          <Text fontSize="xs" color={bodyColor}>
                            {item.recommended_fix.hint}
                          </Text>
                          <Code fontSize="2xs" color={linkColor}>
                            patterns/{item.recommended_fix.pattern_file}
                          </Code>
                        </>
                      ) : (
                        <Text fontSize="xs" color={subColor}>—</Text>
                      )}
                      {(sbLoss || ctLoss) && (
                        <Text fontSize="2xs" color={subColor} mt={1}>
                          {sbLoss && `SB: ${sbLoss.reason} (${sbLoss.count})`}
                          {sbLoss && ctLoss && ' · '}
                          {ctLoss && `Ctrl: ${ctLoss.reason} (${ctLoss.count})`}
                        </Text>
                      )}
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
      </Box>

      <Heading size="xs" textTransform="uppercase" letterSpacing="0.5px" color={subColor} mb={2}>
        Loss-reason concentration by cohort
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mb={4}>
        {COHORT_META.map((c) => (
          <LossReasonCard
            key={c.key}
            label={c.label}
            accent={c.accent}
            reasons={data.loss_reasons_top[c.key] || []}
          />
        ))}
      </SimpleGrid>

      {data.data_hygiene.populated_pct != null && (
        <Box bg={hygieneBg} color={hygieneColor} rounded="md" px={3} py={2} mb={3} fontSize="xs">
          Stage-specific loss reasons available for only {fmtPct(data.data_hygiene.populated_pct)} of
          losses ({data.data_hygiene.losses_with_stage_before_close}/
          {data.data_hygiene.losses_with_stage_before_close + data.data_hygiene.losses_without_stage_before_close}).
        </Box>
      )}

      {data.caveats && data.caveats.length > 0 && (
        <Box>
          {data.caveats.map((c, i) => (
            <Text key={i} fontSize="2xs" color={subColor}>· {c}</Text>
          ))}
        </Box>
      )}
    </Box>
  );
}
