import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Code,
  Flex,
  Heading,
  HStack,
  IconButton,
  List,
  ListItem,
  Skeleton,
  SimpleGrid,
  Text,
  Tooltip,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { HealthCard, type HealthStatus } from '@/components/health/HealthCard';
import { HealthPill } from '@/components/health/HealthPill';
import type {
  ApexHeartbeat,
  SystemHealth,
} from '@/types/systemHealth';

// HEALTH page — at-a-glance answer to "is this thing learning?".
// Single fetch to /api/system/health drives all widgets.

function apexStatus(apex: ApexHeartbeat): HealthStatus {
  if (!apex?.ok) return 'bad';
  const hours = apex.age_seconds != null ? apex.age_seconds / 3600 : null;
  return hours != null && hours < 36 ? 'ok' : 'warn';
}

export function HealthPage() {
  const { data, loading, error, refetch } = useSystemHealth();
  const subColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          <Heading size="lg" letterSpacing="-0.5px" mb={1}>
            Health
          </Heading>
          <Text fontSize="sm" color={subColor}>
            At-a-glance answer to "is this thing learning?". If any number stops moving,
            there's a specific named thing to fix.
          </Text>
        </Box>
        <Tooltip label="Refresh">
          <IconButton
            aria-label="Refresh health stats"
            icon={<RepeatIcon />}
            size="sm"
            variant="outline"
            onClick={refetch}
            isLoading={loading}
          />
        </Tooltip>
      </Flex>

      {error && (
        <Alert status="error" rounded="md" mb={4}>
          <AlertIcon />
          Failed to load system health: {error.message}
        </Alert>
      )}

      {loading && !data && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} h="140px" rounded="md" />
          ))}
        </SimpleGrid>
      )}

      {data && <HealthWidgets data={data} />}
    </Box>
  );
}

function HealthWidgets({ data }: { data: SystemHealth }) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
      <BusWidget data={data} />
      <ApexWidget data={data} />
      <SupplementsWidget data={data} />
      <PatternsWidget data={data} />
      <ProbesWidget data={data} />
      <HeuristicErrorsWidget data={data} />
      <FeedbackWidget data={data} />
    </SimpleGrid>
  );
}

function BusWidget({ data }: { data: SystemHealth }) {
  const bus = data.bus;
  const status: HealthStatus = bus?.reachable ? 'ok' : 'bad';
  return (
    <HealthCard
      title="Bus reachable"
      status={status}
      big={bus?.reachable ? 'Yes' : 'No'}
      sub={
        <Code fontSize="2xs" wordBreak="break-all" bg="transparent" p={0}>
          {bus?.canonical_path || '—'}
        </Code>
      }
    />
  );
}

function ApexWidget({ data }: { data: SystemHealth }) {
  const apex = data.apex;
  const status = apexStatus(apex);
  const ageHours = apex.age_seconds != null ? apex.age_seconds / 3600 : null;
  const ageLabel =
    ageHours == null
      ? '—'
      : ageHours < 1
        ? `${Math.round((apex.age_seconds || 0) / 60)}m ago`
        : `${Math.round(ageHours)}h ago`;
  const counts = apex.counts || {};
  const countSummary = Object.keys(counts)
    .slice(0, 6)
    .map((k) => `${k}=${counts[k]}`)
    .join(' · ') || '(no counts)';

  if (!apex.ok) {
    return (
      <HealthCard
        title="Apex heartbeat"
        status="bad"
        big="Not yet logged"
        sub={apex.reason || 'apex-runs.log absent'}
      />
    );
  }
  return (
    <HealthCard
      title="Apex heartbeat"
      status={status}
      big={`${apex.run_type || 'unknown'} · ${ageLabel}`}
      sub={`last: ${apex.last_run || '—'} · total runs: ${apex.total_runs_logged || 0}`}
      meta={countSummary}
    />
  );
}

function SupplementsWidget({ data }: { data: SystemHealth }) {
  const s = data.supplements;
  const status: HealthStatus = s.today > 0 ? 'ok' : s.week > 0 ? 'warn' : 'bad';
  const sources = Object.entries(s.by_source || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <HealthCard
      title="Supplements written"
      status={status}
      big={`${s.today} today`}
      sub={`${s.week} this week · ${s.month} last 30d · contact=${s.contact} deal=${s.deal} persona=${s.persona}`}
    >
      {sources.length > 0 && (
        <Wrap spacing={1} mt={3}>
          {sources.map(([k, v]) => (
            <WrapItem key={k}>
              <HealthPill>
                {k}: {v}
              </HealthPill>
            </WrapItem>
          ))}
        </Wrap>
      )}
    </HealthCard>
  );
}

function PatternsWidget({ data }: { data: SystemHealth }) {
  const p = data.patterns;
  const conf = p.by_confidence || { low: 0, moderate: 0, high: 0, unknown: 0 };
  const status: HealthStatus =
    p.cross_confirmed > 0 ? 'ok' : p.total > 0 ? 'warn' : 'bad';
  const subColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <HealthCard
      title="Patterns"
      status={status}
      big={
        <HStack align="baseline" spacing={2}>
          <Text fontSize="2xl" fontWeight={700} letterSpacing="-0.5px">
            {p.total}
          </Text>
          <Text fontSize="sm" color={subColor}>
            {p.cross_confirmed} cross-confirmed
          </Text>
        </HStack>
      }
      sub={`low: ${conf.low || 0} · moderate: ${conf.moderate || 0} · high: ${conf.high || 0} · archived: ${p.archived || 0}`}
    >
      {p.recent && p.recent.length > 0 && (
        <List spacing={1} mt={3}>
          {p.recent.slice(0, 5).map((r) => (
            <ListItem key={r.filename} fontSize="xs">
              <HStack spacing={2} align="baseline">
                <HealthPill
                  tone={
                    r.confidence === 'high'
                      ? 'high'
                      : r.confidence === 'moderate'
                        ? 'moderate'
                        : r.confidence === 'low'
                          ? 'low'
                          : 'neutral'
                  }
                >
                  {r.confidence}
                </HealthPill>
                <Text noOfLines={1}>
                  {r.title || r.filename} · {r.age_days}d ago · in:{' '}
                  {(r.systems || []).join(', ') || 'one system'}
                </Text>
              </HStack>
            </ListItem>
          ))}
        </List>
      )}
    </HealthCard>
  );
}

function ProbesWidget({ data }: { data: SystemHealth }) {
  const p = data.probes;
  const populatedPct =
    p.populated_rate != null ? Math.round(p.populated_rate * 100) : null;
  const status: HealthStatus =
    p.total === 0
      ? 'neutral'
      : populatedPct != null && populatedPct >= 60
        ? 'ok'
        : 'warn';
  return (
    <HealthCard
      title="Probes"
      status={status}
      big={`${p.total}`}
      sub={`${p.open} open · ${p.closed} closed${populatedPct != null ? ` · ${populatedPct}% populated` : ''}`}
      meta="customer-positions / probe-outcomes on the bus"
    />
  );
}

function HeuristicErrorsWidget({ data }: { data: SystemHealth }) {
  const e = data.heuristic_errors;
  const pct = e.total > 0 ? Math.round(e.rate * 100) : 0;
  const status: HealthStatus =
    e.total === 0 ? 'neutral' : pct <= 15 ? 'ok' : pct <= 30 ? 'warn' : 'bad';
  return (
    <HealthCard
      title="Heuristic drift"
      status={status}
      big={`${pct}%`}
      sub={`${e.wrong} of ${e.total} next-step recommendations marked wrong`}
      meta="Lower = the dashboard's heuristic stays calibrated against reality"
    />
  );
}

function FeedbackWidget({ data }: { data: SystemHealth }) {
  const f = data.feedback;
  const status: HealthStatus =
    f.total === 0 ? 'neutral' : f.open === 0 ? 'ok' : f.open > 3 ? 'warn' : 'ok';
  return (
    <HealthCard
      title="Feedback queue"
      status={status}
      big={`${f.open} open`}
      sub={`${f.total} total · ${f.in_progress} in-progress · ${f.resolved} resolved · ${f.wontfix} wontfix`}
    >
      {f.recent && f.recent.length > 0 && (
        <Wrap spacing={1} mt={3}>
          {f.recent.slice(0, 5).map((r) => (
            <WrapItem key={r.id}>
              <HealthPill
                tone={r.severity === 'high' ? 'low' : r.severity === 'medium' ? 'moderate' : 'neutral'}
              >
                {r.type || 'item'} · {r.target_kind || '—'}
                {r.age_days != null ? ` · ${r.age_days}d` : ''}
              </HealthPill>
            </WrapItem>
          ))}
        </Wrap>
      )}
      <Button
        as="a"
        href="/v2/#health"
        target="_blank"
        size="xs"
        variant="link"
        colorScheme="brand"
        mt={3}
      >
        Open v2 health view →
      </Button>
    </HealthCard>
  );
}
