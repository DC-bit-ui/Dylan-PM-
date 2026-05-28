import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Link,
  Progress,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useHeaderStats } from '@/hooks/useHeaderStats';
import {
  useCallMonitoring,
  useHobbsCalendar,
  useProjection,
  useForecast,
} from '@/hooks/useStats';
import { useRecentWins } from '@/hooks/useWork';
import { useBundleQueueHealth } from '@/hooks/useBundleQueueHealth';
import { useFeedback } from '@/hooks/useFeedback';
import { CalendarStrip } from '@/components/home/CalendarStrip';
import { RecentWinRow } from '@/components/work/RecentWinRow';
import type { HobbsVisit } from '@/types/stats';

// Daily-glance home: the vital signs the team checks first thing each morning.
// Hectare pace · visits this week · call volume · what's coming · what's flagged.

function fmtToday(): string {
  try {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'long', day: 'numeric', month: 'long',
    });
  } catch { return ''; }
}

function fmtEta(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return iso; }
}

function pickUpcomingVisits(weeks: { days: { date: string; is_past?: boolean; visits: HobbsVisit[] }[] }[] | undefined, limit = 6): HobbsVisit[] {
  if (!weeks) return [];
  const today = new Date().toISOString().slice(0, 10);
  const out: HobbsVisit[] = [];
  for (const w of weeks) {
    for (const d of w.days) {
      if (d.date < today) continue;
      const booked = (d.visits || []).filter((v) => v.state === 'booked' || (v.start_iso && v.start_iso.slice(0, 10) >= today));
      for (const v of booked) {
        out.push(v);
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const W = 200, H = 36;
  if (!values.length) return null;
  const max = Math.max(1, ...values);
  const barW = W / values.length;
  return (
    <Box as="svg" viewBox={`0 0 ${W} ${H}`} w="100%" h={`${H}px`} display="block">
      {values.map((v, i) => {
        const bh = max > 0 ? Math.max(1, (v / max) * (H - 2)) : 0;
        return <rect key={i} x={i * barW + 1} y={H - bh} width={Math.max(2, barW - 2)} height={bh} fill={color} rx={1} />;
      })}
    </Box>
  );
}

export function HomePage() {
  const header = useHeaderStats();
  const cm = useCallMonitoring(true);
  const hc = useHobbsCalendar(true);
  const proj = useProjection(true);
  const fcst = useForecast(true);
  const wins = useRecentWins();
  const queue = useBundleQueueHealth();
  const feedback = useFeedback('open');

  const subColor = useColorModeValue('gray.500', 'gray.400');
  const bodyColor = useColorModeValue('gray.700', 'gray.200');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const headColor = useColorModeValue('gray.600', 'gray.400');
  const sparkColor = useColorModeValue('#3a7a5a', '#86c8a0');
  const linkColor = useColorModeValue('brand.600', 'brand.300');

  const hs = header.data;
  const callsTotal = cm.data?.this_week.total_connected ?? 0;
  const callsTarget = cm.data?.this_week.target ?? 0;
  const callsStormboy = cm.data?.this_week.storm_boy_connected ?? 0;
  const callsPct = cm.data?.this_week.pct_of_target ?? 0;
  const visitsBooked = cm.data?.efficacy_tiles.visits_booked ?? null;
  const sparkDays = (cm.data?.days || []).slice(-7).map((d) => d.date_called_count || 0);

  const upcomingVisits = pickUpcomingVisits(hc.data?.weeks, 6);
  const atRiskCount = fcst.data?.at_risk?.count ?? 0;
  const atRiskHa = fcst.data?.at_risk?.hectares ?? 0;

  const queueAlert = queue.data?.alert;
  const feedbackOpen = feedback.data?.stats.open ?? 0;

  return (
    <Box>
      <Box mb={5}>
        <Heading size="lg" letterSpacing="-0.5px" mb={1}>Home</Heading>
        <Text fontSize="sm" color={subColor}>
          {fmtToday()} · the week's vital signs at a glance.
        </Text>
      </Box>

      {/* KPI row */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={3} mb={6}>
        {/* Hectare pace */}
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={4}>
          <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
            Hectares to 30K
          </Text>
          <Skeleton isLoaded={!proj.loading} fitContent>
            <HStack align="baseline" spacing={2}>
              <Heading size="lg" color="brand.500" letterSpacing="-1px">
                {proj.data ? `${proj.data.pct_of_target.toFixed(1)}%` : '—'}
              </Heading>
              <Text fontSize="sm" color={subColor}>
                {proj.data ? `${proj.data.registered_hectares.toLocaleString()} / ${proj.data.target_hectares.toLocaleString()} ha` : ''}
              </Text>
            </HStack>
          </Skeleton>
          <Progress value={proj.data?.pct_of_target ?? 0} size="xs" colorScheme="brand" rounded="sm" mt={2} mb={1} />
          <Text fontSize="2xs" color={subColor}>
            {proj.data ? `need ${Math.round(proj.data.pace.needed_weekly_ha_by_fy_end).toLocaleString()} ha/wk to 30 Jun · doing ${Math.round(proj.data.pace.short_window_weekly_ha).toLocaleString()}` : ' '}
          </Text>
        </Box>

        {/* Visits this week */}
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={4}>
          <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
            Visits this week
          </Text>
          <Skeleton isLoaded={!header.loading} fitContent>
            <HStack align="baseline" spacing={2}>
              <Heading size="lg" letterSpacing="-1px">{hs?.farm_visits.booked_this_week ?? '—'}</Heading>
              <Text fontSize="sm" color={subColor}>booked</Text>
            </HStack>
          </Skeleton>
          <Text fontSize="xs" color={bodyColor} mt={1}>
            {hs ? `${hs.farm_visits.completed_this_week} completed` : '—'}
          </Text>
          <Text fontSize="2xs" color={subColor}>
            {hs ? `w/c ${hs.farm_visits.week_start} · ${hs.farm_visits.lifetime_booked} lifetime` : ' '}
          </Text>
        </Box>

        {/* Calls this week */}
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={4}>
          <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
            Calls connected this week
          </Text>
          <Skeleton isLoaded={!cm.loading} fitContent>
            <HStack align="baseline" spacing={2}>
              <Heading size="lg" letterSpacing="-1px">{callsTotal}</Heading>
              <Text fontSize="sm" color={subColor}>{callsTarget > 0 ? `/ ${callsTarget}` : ''}</Text>
            </HStack>
          </Skeleton>
          <Progress value={Math.min(100, callsPct)} size="xs" colorScheme={callsPct >= 100 ? 'green' : callsPct >= 60 ? 'brand' : 'orange'} rounded="sm" mt={2} mb={1} />
          <Text fontSize="2xs" color={subColor}>
            {cm.data ? `${callsStormboy} Storm Boy · ${visitsBooked ?? '—'} visits booked from calls` : ' '}
          </Text>
        </Box>

        {/* At-risk pipeline */}
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderLeftWidth={atRiskCount > 0 ? '3px' : '1px'} borderLeftColor={atRiskCount > 0 ? 'red.400' : cardBorder} rounded="md" p={4}>
          <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
            At-risk pipeline
          </Text>
          <Skeleton isLoaded={!fcst.loading} fitContent>
            <HStack align="baseline" spacing={2}>
              <Heading size="lg" letterSpacing="-1px" color={atRiskCount > 0 ? 'red.400' : undefined}>{atRiskCount}</Heading>
              <Text fontSize="sm" color={subColor}>open deals</Text>
            </HStack>
          </Skeleton>
          <Text fontSize="xs" color={bodyColor} mt={1}>
            {atRiskHa > 0 ? `${Math.round(atRiskHa).toLocaleString()} ha exposed` : '—'}
          </Text>
          <Text fontSize="2xs" color={subColor}>
            {fcst.data ? `stuck > ${fcst.data.at_risk.threshold_days}d in current stage` : ' '}
          </Text>
        </Box>
      </SimpleGrid>

      {/* Outlook strip — where we're headed (compact forward signal) */}
      <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" px={4} py={3} mb={6}>
        <HStack spacing={{ base: 4, md: 8 }} flexWrap="wrap" align="flex-start">
          <Box>
            <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
              Projected hit-date · 30K
            </Text>
            <Skeleton isLoaded={!proj.loading} fitContent>
              <Text fontSize="sm" fontWeight={700}>
                {fmtEta(proj.data?.projection.at_short_pace.eta)}{' '}
                <Text as="span" color={subColor} fontWeight={400}>
                  at {proj.data?.pace.short_window_weeks ?? '—'}-wk pace
                </Text>
              </Text>
            </Skeleton>
          </Box>
          <Box>
            <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
              Expected from pipeline
            </Text>
            <Skeleton isLoaded={!fcst.loading} fitContent>
              <Text fontSize="sm" fontWeight={700}>
                {fcst.data ? `${Math.round(fcst.data.expected_to_register_hectares).toLocaleString()} ha` : '—'}{' '}
                <Text as="span" color={subColor} fontWeight={400}>
                  of {fcst.data ? `${Math.round(fcst.data.open_pipeline_hectares).toLocaleString()} open` : '—'}
                </Text>
              </Text>
            </Skeleton>
          </Box>
          <Box>
            <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
              Projected total vs 30K
            </Text>
            <Skeleton isLoaded={!fcst.loading} fitContent>
              <Text fontSize="sm" fontWeight={700}>
                {fcst.data ? `${Math.round(fcst.data.projected_total_hectares).toLocaleString()} ha` : '—'}{' '}
                {fcst.data && (
                  fcst.data.gap_direction === 'over' ? (
                    <Text as="span" color="green.500" fontWeight={400}>
                      · {Math.round(Math.abs(fcst.data.gap_to_30k_hectares)).toLocaleString()} ha buffer
                    </Text>
                  ) : (
                    <Text as="span" color="red.500" fontWeight={400}>
                      · {Math.round(fcst.data.gap_to_30k_hectares).toLocaleString()} ha gap
                    </Text>
                  )
                )}
              </Text>
            </Skeleton>
          </Box>
        </HStack>
      </Box>

      {/* Hobbs calendar + Call volume */}
      <Grid templateColumns={{ base: '1fr', lg: '1.4fr 1fr' }} gap={4} mb={6}>
        <GridItem>
          <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={4} h="100%">
            <HStack justify="space-between" align="baseline" mb={3} flexWrap="wrap">
              <Heading size="sm">Hobbs · next two weeks</Heading>
              <Text fontSize="xs" color={headColor}>
                {hc.data?.totals?.booked != null ? `${hc.data.totals.booked} booked in window` : 'farm-visit diary'}
              </Text>
            </HStack>
            {hc.error && <Alert status="error" size="sm" rounded="md" mb={2}><AlertIcon />Calendar failed.</Alert>}
            {hc.loading && !hc.data ? <Skeleton h="46px" rounded="md" /> : <CalendarStrip data={hc.data} days={14} />}

            <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px" mt={4} mb={2}>
              Next booked visits
            </Text>
            {hc.loading && !hc.data ? (
              <Skeleton h="60px" rounded="md" />
            ) : upcomingVisits.length === 0 ? (
              <Text fontSize="xs" color={subColor} fontStyle="italic">No booked visits in the rolling window.</Text>
            ) : (
              <Stack spacing={1.5}>
                {upcomingVisits.map((v, i) => (
                  <Flex key={`${v.name}-${i}`} justify="space-between" align="baseline" gap={2} fontSize="xs">
                    <Text noOfLines={1}>
                      {v.hubspot_url ? (
                        <Link href={v.hubspot_url} isExternal color={linkColor} fontWeight={600}>{v.name}</Link>
                      ) : (
                        <Text as="span" fontWeight={600}>{v.name}</Text>
                      )}
                      {v.city && <Text as="span" color={subColor}> · {v.city}{v.state_au ? `, ${v.state_au}` : ''}</Text>}
                    </Text>
                    <Text color={subColor} whiteSpace="nowrap">
                      {v.start_iso ? v.start_iso.slice(0, 10) : '—'}{v.start_local_time ? ` ${v.start_local_time}` : ''}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            )}
          </Box>
        </GridItem>

        <GridItem>
          <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={4} h="100%">
            <Heading size="sm" mb={1}>Call volume · this week</Heading>
            <Text fontSize="2xs" color={subColor} mb={3}>
              {cm.data ? `Storm Boy target ${callsTarget} · ${callsStormboy} connected (${callsPct.toFixed(0)}%)` : 'loading…'}
            </Text>
            {cm.error && <Alert status="error" size="sm" rounded="md" mb={2}><AlertIcon />Call monitoring failed.</Alert>}
            {cm.loading && !cm.data ? (
              <Skeleton h="36px" rounded="md" />
            ) : (
              <Box>
                <Sparkline values={sparkDays} color={sparkColor} />
                <Flex justify="space-between" mt={1}>
                  <Text fontSize="2xs" color={subColor}>last 7 days</Text>
                  <Text fontSize="2xs" color={subColor}>{sparkDays.reduce((s, v) => s + v, 0)} calls total</Text>
                </Flex>
              </Box>
            )}
            <Box mt={4}>
              <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px" mb={1}>
                Efficacy
              </Text>
              <Stack spacing={1} fontSize="xs">
                <Flex justify="space-between"><Text color={subColor}>Visits booked from calls</Text><Text fontWeight={700}>{visitsBooked ?? '—'}</Text></Flex>
                <Flex justify="space-between"><Text color={subColor}>Calls per visit booked</Text><Text fontWeight={700}>{cm.data?.efficacy_tiles.calls_per_visit_booked ?? '—'}</Text></Flex>
                <Flex justify="space-between"><Text color={subColor}>Unique contacts engaged</Text><Text fontWeight={700}>{cm.data?.volume_tiles.unique_contacts_engaged ?? '—'}</Text></Flex>
              </Stack>
            </Box>
          </Box>
        </GridItem>
      </Grid>

      {/* Recent wins */}
      <Box mb={6}>
        <HStack justify="space-between" align="baseline" mb={3} flexWrap="wrap">
          <Heading size="sm">Recent wins</Heading>
          <Text fontSize="xs" color={headColor}>
            {hs?.most_recent_win ? `Most recent: ${hs.most_recent_win.deal_name} · ${hs.most_recent_win.days_ago}d ago` : ''}
          </Text>
        </HStack>
        {wins.loading && !wins.data ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} h="64px" rounded="md" />)}
          </SimpleGrid>
        ) : (wins.data?.wins || []).length === 0 ? (
          <Text fontSize="sm" color={subColor} fontStyle="italic">No recent wins yet.</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
            {(wins.data?.wins || []).slice(0, 4).map((w) => (
              <RecentWinRow key={w.deal_id} win={w} />
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Alert strip */}
      {(queueAlert || feedbackOpen > 0) && (
        <Flex gap={3} wrap="wrap">
          {queueAlert && (
            <Alert status="warning" rounded="md" variant="left-accent" alignItems="flex-start" flex={1} minW="280px">
              <AlertIcon />
              <Box>
                <Text fontSize="sm" fontWeight={700}>Intelligence queue alerting</Text>
                <Text fontSize="xs" color={subColor}>
                  {queue.data?.alert_reason || 'Processor behind threshold.'}{' '}
                  <Link as={RouterLink} to="/intelligence" color={linkColor} fontWeight={600}>Open queue →</Link>
                </Text>
              </Box>
            </Alert>
          )}
          {feedbackOpen > 0 && (
            <Alert status="info" rounded="md" variant="left-accent" alignItems="flex-start" flex={1} minW="280px">
              <AlertIcon />
              <Box>
                <Text fontSize="sm" fontWeight={700}>
                  {feedbackOpen} open feedback {feedbackOpen === 1 ? 'item' : 'items'}
                </Text>
                <Text fontSize="xs" color={subColor}>
                  Triage what's been flagged.{' '}
                  <Link as={RouterLink} to="/feedback" color={linkColor} fontWeight={600}>Open feedback →</Link>
                </Text>
              </Box>
            </Alert>
          )}
        </Flex>
      )}
      {!queueAlert && feedbackOpen === 0 && !queue.loading && !feedback.loading && (
        <Flex gap={2} fontSize="xs" color={subColor}>
          <Badge colorScheme="green" variant="subtle">✓</Badge>
          <Text>No open alerts · queue healthy · feedback clear.</Text>
        </Flex>
      )}
    </Box>
  );
}
