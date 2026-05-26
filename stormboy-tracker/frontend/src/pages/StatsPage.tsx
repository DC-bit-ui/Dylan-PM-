import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Heading,
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEfficacy, useCohortFunnel, useTrajectory, useCallMonitoring } from '@/hooks/useStats';
import { StatsPills, type StatsPill } from '@/components/stats/StatsPills';
import { StatsSection } from '@/components/stats/StatsSection';
import { EfficacyHero } from '@/components/stats/EfficacyHero';
import { CohortFunnel } from '@/components/stats/CohortFunnel';
import { TrajectoryChart } from '@/components/stats/TrajectoryChart';
import { CallMonitoring } from '@/components/stats/CallMonitoring';

const PILLS: StatsPill[] = [
  { id: 'call-monitoring', label: 'Call monitoring' },
  { id: 'efficacy', label: 'Stormboy efficacy' },
  { id: 'cohort-funnel', label: 'Cohort funnel' },
  { id: 'trajectory', label: 'Trajectory' },
  { id: 'evidence-cards', label: 'Evidence cards', status: 'stub' },
  { id: 'friction-map', label: 'Friction map', status: 'stub' },
  { id: 'projection', label: '30K ha projection', status: 'stub' },
  { id: 'funnel-velocity', label: 'Funnel velocity', status: 'stub' },
  { id: 'forecast', label: 'Forecast', status: 'stub' },
  { id: 'snapshot-pipeline', label: 'Snapshot pipeline', status: 'stub' },
  { id: 'ticket-sla', label: 'Ticket SLA', status: 'stub' },
  { id: 'lead-response', label: 'Lead-response', status: 'stub' },
  { id: 'hobbs-calendar', label: 'Hobbs calendar', status: 'stub' },
  { id: 'property-size', label: 'Property size', status: 'stub' },
  { id: 'geographic', label: 'NRM geographic', status: 'stub' },
  { id: 'call-quality', label: 'Call quality', status: 'stub' },
];

function StubSection({ id, title, subtitle, v2Anchor }: { id: string; title: string; subtitle: string; v2Anchor: string }) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const subColor = useColorModeValue('gray.500', 'gray.400');
  return (
    <StatsSection id={id} title={title} subtitle={subtitle} defaultOpen={false}>
      <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={4}>
        <Text fontSize="sm" color={subColor} fontStyle="italic" mb={2}>
          Port pending. The v2 view holds the live data until this section ships in pass 2.
        </Text>
        <Button as="a" href={`/v2/#stats-${v2Anchor}`} target="_blank" size="xs" variant="link" colorScheme="brand">
          Open v2 stats →
        </Button>
      </Box>
    </StatsSection>
  );
}

export function StatsPage() {
  const eff = useEfficacy();
  const cf = useCohortFunnel();
  const traj = useTrajectory();
  const cm = useCallMonitoring();
  const subColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box>
      <Box mb={3}>
        <Heading size="lg" letterSpacing="-0.5px" mb={1}>
          Stats
        </Heading>
        <Text fontSize="sm" color={subColor}>
          Where we are, where we're heading, and where the friction is. Each
          section is collapsible — your choices persist across reloads.
        </Text>
      </Box>

      <StatsPills pills={PILLS} />

      <Stack spacing={4}>
        <StatsSection id="call-monitoring" title="Call monitoring" subtitle="Will's weekly dashboard · this-week target + tiles + daily engagement">
          {cm.error && (
            <Alert status="error" rounded="md">
              <AlertIcon />
              Call monitoring failed: {cm.error.message}
            </Alert>
          )}
          {cm.loading && !cm.data ? <Skeleton h="320px" rounded="md" /> : <CallMonitoring data={cm.data} />}
        </StatsSection>

        <StatsSection id="efficacy" title="Is Stormboy working?" subtitle="Cohort comparison · Stormboy vs direct control · headline KPIs">
          {eff.error && (
            <Alert status="error" rounded="md">
              <AlertIcon />
              Efficacy failed: {eff.error.message}
            </Alert>
          )}
          {eff.loading && !eff.data ? <Skeleton h="200px" rounded="md" /> : <EfficacyHero data={eff.data} />}
        </StatsSection>

        <StatsSection id="cohort-funnel" title="Where does Stormboy add value in the funnel?" subtitle="Stage-by-stage cohort comparison · normalised funnel shape">
          {cf.error && (
            <Alert status="error" rounded="md">
              <AlertIcon />
              Cohort funnel failed: {cf.error.message}
            </Alert>
          )}
          {cf.loading && !cf.data ? <Skeleton h="280px" rounded="md" /> : <CohortFunnel data={cf.data} />}
        </StatsSection>

        <StatsSection id="trajectory" title="Is the trajectory bending?" subtitle="Trailing 12-week win rate + weekly hectares · Stormboy launch annotated">
          {traj.error && (
            <Alert status="error" rounded="md">
              <AlertIcon />
              Trajectory failed: {traj.error.message}
            </Alert>
          )}
          {traj.loading && !traj.data ? <Skeleton h="320px" rounded="md" /> : <TrajectoryChart data={traj.data} />}
        </StatsSection>

        {/* Stubs — these port in pass 2 */}
        <StubSection id="evidence-cards" title="Evidence cards" subtitle="Pattern-level evidence behind each strategic claim" v2Anchor="evidence-cards" />
        <StubSection id="friction-map" title="Friction map" subtitle="Where deals get stuck — by stage, by friction class" v2Anchor="friction-map" />
        <StubSection id="projection" title="30K hectare projection" subtitle="Are we on track for the 30K-ha goal? Forward projection from current velocity" v2Anchor="projection" />
        <StubSection id="funnel-velocity" title="Stormboy funnel velocity" subtitle="Time-to-stage and stage-throughput for the Stormboy funnel" v2Anchor="funnel-velocity" />
        <StubSection id="forecast" title="Forward forecast" subtitle="6-week forecast · pipeline, conversion, hectares" v2Anchor="forecast" />
        <StubSection id="snapshot-pipeline" title="Snapshot-state pipeline" subtitle="HORIZON snapshot states across the cohort" v2Anchor="snapshot-pipeline" />
        <StubSection id="ticket-sla" title="Snapshot ticket SLA" subtitle="HORIZON ticket cycle-time vs SLA targets" v2Anchor="ticket-sla" />
        <StubSection id="lead-response" title="Lead-response time" subtitle="Distribution of time-to-first-contact across the inbound cohort" v2Anchor="lead-response" />
        <StubSection id="hobbs-calendar" title="Hobbs farm-visit calendar" subtitle="Upcoming and past farm visits, sourced from HubSpot meeting engagements" v2Anchor="hobbs-calendar" />
        <StubSection id="property-size" title="Property size × cycle × win-rate" subtitle="How property size correlates with cycle time and conversion" v2Anchor="property-size" />
        <StubSection id="geographic" title="NRM geographic insights" subtitle="Performance by NRM region · postcode-mapped" v2Anchor="geographic" />
        <StubSection id="call-quality" title="Call quality" subtitle="Connect rate, best calling windows, per-rep leaderboard, day×hour heatmap" v2Anchor="call-quality" />
      </Stack>
    </Box>
  );
}
