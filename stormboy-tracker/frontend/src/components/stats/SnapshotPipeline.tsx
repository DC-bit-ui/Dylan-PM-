import {
  Box,
  Flex,
  Heading,
  Link,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import type { SnapshotPipelineResponse, SnapshotState } from '@/types/stats';

const STATE_COLOR: Record<string, string> = {
  NOT_REQUESTED:       '#a4524a',
  REQUESTED:           '#c98a40',
  IN_PRODUCTION:       '#d8a040',
  SENT_VIA_TICKET:     '#7a9a3a',
  SENT_AWAITING_REPLY: '#5a8a6e',
  SENT_NO_REPLY_STALE: '#a16207',
  SENT_REPLIED:        '#3a7a5a',
  WILLING_TO_PROGRESS: '#2d6a4f',
};

const STATE_LABEL: Record<string, string> = {
  NOT_REQUESTED:       'Not requested',
  REQUESTED:           'Requested',
  IN_PRODUCTION:       'In production',
  SENT_VIA_TICKET:     'Sent (via Ben)',
  SENT_AWAITING_REPLY: 'Sent · awaiting',
  SENT_NO_REPLY_STALE: 'Sent · stale',
  SENT_REPLIED:        'Customer replied',
  WILLING_TO_PROGRESS: 'Ready · KCT',
  TICKET_EXISTS_STAGE_UNKNOWN: 'Ticket exists, stage unknown',
  REQUESTED_NO_EMAIL:          'Flag set, no email evidence',
  DISCUSSED_NOT_SENT:          'Teams mention, no email/ticket',
  COLD:                        'Cold',
};

export function SnapshotPipeline({ data }: { data: SnapshotPipelineResponse | null }) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const cardBg = useColorModeValue('white', 'gray.900');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const rowEmptyOpacity = 0.45;
  const linkColor = useColorModeValue('brand.600', 'brand.300');

  if (!data?.counts) {
    return <Text fontSize="sm" color={subColor} fontStyle="italic">No snapshot pipeline data.</Text>;
  }

  const total = data.total_on_pipeline || 1;
  const onStates = data.pipeline_order;
  const offStates = data.off_pipeline_states.filter((s) => (data.counts[s] || 0) > 0);

  const calloutBg = useColorModeValue(
    (data.stuck_in_production_pct ?? 0) > 30 ? 'red.50' : (data.ready_for_kct_count ?? 0) > 0 ? 'green.50' : 'gray.50',
    (data.stuck_in_production_pct ?? 0) > 30 ? 'red.900' : (data.ready_for_kct_count ?? 0) > 0 ? 'green.900' : 'gray.900',
  );
  const calloutColor = useColorModeValue(
    (data.stuck_in_production_pct ?? 0) > 30 ? 'red.700' : (data.ready_for_kct_count ?? 0) > 0 ? 'green.700' : 'gray.700',
    (data.stuck_in_production_pct ?? 0) > 30 ? 'red.200' : (data.ready_for_kct_count ?? 0) > 0 ? 'green.200' : 'gray.200',
  );

  return (
    <Box>
      <Text fontSize="xs" color={subColor} mb={3}>
        {data.total_completed_visits} Farm Visit completed contacts, distributed across the snapshot workflow. Post-visit throughput specifically.
      </Text>
      <Box bg={calloutBg} color={calloutColor} rounded="md" px={3} py={2} mb={3} fontSize="xs">
        <Text as="span" fontWeight={700} mr={2}>Headline:</Text>
        {data.headline}
      </Box>

      {/* Stacked bar */}
      <Flex h="32px" w="100%" rounded="md" overflow="hidden" mb={3}>
        {onStates.map((state) => {
          const count = data.counts[state] || 0;
          if (count === 0) return null;
          const pct = (count / total) * 100;
          return (
            <Flex
              key={state}
              flex={pct}
              bg={STATE_COLOR[state]}
              align="center"
              justify="center"
              color="white"
              fontSize="2xs"
              fontWeight={700}
              px={1}
              minW={0}
              title={`${STATE_LABEL[state]}: ${count}`}
              overflow="hidden"
            >
              <Text fontSize="2xs" fontWeight={800} noOfLines={1}>
                {count}
              </Text>
            </Flex>
          );
        })}
      </Flex>

      {/* On-pipeline table */}
      <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" overflow="hidden">
        {onStates.map((state) => {
          const count = data.counts[state] || 0;
          const examples = data.examples[state] || [];
          return (
            <PipelineRow
              key={state}
              state={state}
              count={count}
              examples={examples}
              labelColor={labelColor}
              subColor={subColor}
              linkColor={linkColor}
              opacity={count === 0 ? rowEmptyOpacity : 1}
            />
          );
        })}
      </Box>

      {/* Off-pipeline section */}
      {offStates.length > 0 && (
        <Box mt={4}>
          <Heading size="xs" textTransform="uppercase" letterSpacing="0.5px" color={labelColor} mb={2}>
            Off-pipeline (need attention)
          </Heading>
          <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" overflow="hidden">
            {offStates.map((state) => (
              <PipelineRow
                key={state}
                state={state}
                count={data.counts[state] || 0}
                examples={data.examples[state] || []}
                labelColor={labelColor}
                subColor={subColor}
                linkColor={linkColor}
                opacity={1}
              />
            ))}
          </Box>
        </Box>
      )}

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

interface PipelineRowProps {
  state: SnapshotState;
  count: number;
  examples: { name: string; hubspot_url: string }[];
  labelColor: string;
  subColor: string;
  linkColor: string;
  opacity: number;
}
function PipelineRow({ state, count, examples, labelColor, subColor, linkColor, opacity }: PipelineRowProps) {
  const divider = useColorModeValue('gray.100', 'gray.700');
  return (
    <Flex
      px={3}
      py={2}
      gap={3}
      align="center"
      opacity={opacity}
      borderBottom="1px solid"
      borderColor={divider}
      _last={{ borderBottom: 'none' }}
    >
      <Box w="3px" h="20px" bg={STATE_COLOR[state] || '#8a8a7a'} rounded="full" flexShrink={0} />
      <Text fontSize="xs" fontWeight={600} color={labelColor} minW="180px" flexShrink={0}>
        {STATE_LABEL[state] || state}
      </Text>
      <Text fontSize="sm" fontWeight={700} minW="36px" flexShrink={0}>{count}</Text>
      <Text fontSize="xs" color={subColor} noOfLines={1} flex={1}>
        {examples.length > 0
          ? examples.slice(0, 4).map((e, i) => (
              <Link key={i} href={e.hubspot_url} isExternal mr={2} color={linkColor}>
                {e.name}
              </Link>
            ))
          : '—'}
      </Text>
    </Flex>
  );
}
