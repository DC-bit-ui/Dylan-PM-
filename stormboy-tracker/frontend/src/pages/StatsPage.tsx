import { useState } from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Heading,
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  useEfficacy,
  useCohortFunnel,
  useTrajectory,
  useLeadResponse,
  useSnapshotPipeline,
  useGeographic,
  useEvidenceCards,
  useFrictionMap,
  useProjection,
  useForecast,
  useFunnelVelocity,
  useTicketSla,
  usePropertySize,
  useCallAnalytics,
} from '@/hooks/useStats';
import { StatsPills, type StatsPill } from '@/components/stats/StatsPills';
import { StatsSection } from '@/components/stats/StatsSection';
import { EfficacyHero } from '@/components/stats/EfficacyHero';
import { CohortFunnel } from '@/components/stats/CohortFunnel';
import { TrajectoryChart } from '@/components/stats/TrajectoryChart';
import { LeadResponse } from '@/components/stats/LeadResponse';
import { SnapshotPipeline } from '@/components/stats/SnapshotPipeline';
import { Geographic } from '@/components/stats/Geographic';
import { EvidenceCards } from '@/components/stats/EvidenceCards';
import { FrictionMap } from '@/components/stats/FrictionMap';
import { Projection } from '@/components/stats/Projection';
import { Forecast } from '@/components/stats/Forecast';
import { FunnelVelocity } from '@/components/stats/FunnelVelocity';
import { TicketSla } from '@/components/stats/TicketSla';
import { PropertySize } from '@/components/stats/PropertySize';
import { CallQuality } from '@/components/stats/CallQuality';

const PILLS: StatsPill[] = [
  { id: 'efficacy', label: 'Stormboy efficacy' },
  { id: 'cohort-funnel', label: 'Cohort funnel' },
  { id: 'trajectory', label: 'Trajectory' },
  { id: 'evidence-cards', label: 'Evidence cards' },
  { id: 'friction-map', label: 'Friction map' },
  { id: 'projection', label: '30K ha projection' },
  { id: 'funnel-velocity', label: 'Funnel velocity' },
  { id: 'forecast', label: 'Forecast' },
  { id: 'snapshot-pipeline', label: 'Snapshot bottleneck' },
  { id: 'ticket-sla', label: 'Ticket SLA' },
  { id: 'lead-response', label: 'Lead-response loss' },
  { id: 'property-size', label: 'Property size' },
  { id: 'geographic', label: 'NRM geographic' },
  { id: 'call-quality', label: 'Call quality' },
];

// Read the persisted collapse state for a section (same key/semantics as
// StatsSection). `'true'` means collapsed. Sections default to open.
function readOpen(id: string, defaultOpen = true): boolean {
  try {
    const v = localStorage.getItem(`v3-stats-collapsed-${id}`);
    if (v === 'true') return false;
    if (v === 'false') return true;
  } catch {/* noop */}
  return defaultOpen;
}

export function StatsPage() {
  const subColor = useColorModeValue('gray.500', 'gray.400');

  // StatsPage owns the open-map so it can gate each section's fetch on
  // visibility — a collapsed section never hits the backend. Seeded from the
  // persisted collapse prefs so reloads respect what the user closed.
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    PILLS.forEach((p) => { m[p.id] = readOpen(p.id); });
    return m;
  });
  const toggle = (id: string) =>
    setOpenMap((prev) => {
      const next = !prev[id];
      try {
        localStorage.setItem(`v3-stats-collapsed-${id}`, (!next).toString());
      } catch {/* noop */}
      return { ...prev, [id]: next };
    });

  // Each hook fetches only when its section is open.
  const eff = useEfficacy(openMap['efficacy']);
  const cf = useCohortFunnel(openMap['cohort-funnel']);
  const traj = useTrajectory(openMap['trajectory']);
  const ev = useEvidenceCards(openMap['evidence-cards']);
  const fm = useFrictionMap(openMap['friction-map']);
  const proj = useProjection(openMap['projection']);
  const fv = useFunnelVelocity(openMap['funnel-velocity']);
  const fcst = useForecast(openMap['forecast']);
  const sp = useSnapshotPipeline(openMap['snapshot-pipeline']);
  const sla = useTicketSla(openMap['ticket-sla']);
  const lr = useLeadResponse(openMap['lead-response']);
  const ps = usePropertySize(openMap['property-size']);
  const geo = useGeographic(openMap['geographic']);
  const cq = useCallAnalytics(openMap['call-quality']);

  const sectionProps = (id: string) => ({
    id,
    isOpen: openMap[id],
    onToggle: () => toggle(id),
  });

  return (
    <Box>
      <Box mb={3}>
        <Heading size="lg" letterSpacing="-0.5px" mb={1}>
          Stats
        </Heading>
        <Text fontSize="sm" color={subColor}>
          Where the friction is and what to fix. Daily tracking lives on Home —
          this page is for diagnosing why we're not faster. Each section is
          collapsible; collapsed sections don't load until you open them.
        </Text>
      </Box>

      <StatsPills pills={PILLS} />

      <Stack spacing={4}>
        <StatsSection {...sectionProps('efficacy')} title="Is Stormboy working?" subtitle="Cohort comparison · Stormboy vs direct control · headline KPIs">
          {eff.error && (
            <Alert status="error" rounded="md">
              <AlertIcon />
              Efficacy failed: {eff.error.message}
            </Alert>
          )}
          {eff.loading && !eff.data ? <Skeleton h="200px" rounded="md" /> : <EfficacyHero data={eff.data} />}
        </StatsSection>

        <StatsSection {...sectionProps('cohort-funnel')} title="Where does Stormboy add value in the funnel?" subtitle="Stage-by-stage cohort comparison · normalised funnel shape">
          {cf.error && (
            <Alert status="error" rounded="md">
              <AlertIcon />
              Cohort funnel failed: {cf.error.message}
            </Alert>
          )}
          {cf.loading && !cf.data ? <Skeleton h="280px" rounded="md" /> : <CohortFunnel data={cf.data} />}
        </StatsSection>

        <StatsSection {...sectionProps('trajectory')} title="Is the trajectory bending?" subtitle="Trailing 12-week win rate + weekly hectares · Stormboy launch annotated">
          {traj.error && (
            <Alert status="error" rounded="md">
              <AlertIcon />
              Trajectory failed: {traj.error.message}
            </Alert>
          )}
          {traj.loading && !traj.data ? <Skeleton h="320px" rounded="md" /> : <TrajectoryChart data={traj.data} />}
        </StatsSection>

        <StatsSection {...sectionProps('evidence-cards')} title="What's working in conversation?" subtitle="Tactical plays distilled from transcripts, standups, and loss data">
          {ev.error && <Alert status="error" rounded="md"><AlertIcon />Evidence cards failed: {ev.error.message}</Alert>}
          {ev.loading && !ev.data ? <Skeleton h="240px" rounded="md" /> : <EvidenceCards data={ev.data} />}
        </StatsSection>

        <StatsSection {...sectionProps('friction-map')} title="Where should we push next?" subtitle="Stage transitions ranked by impact — biggest lever for Stormboy efficacy">
          {fm.error && <Alert status="error" rounded="md"><AlertIcon />Friction map failed: {fm.error.message}</Alert>}
          {fm.loading && !fm.data ? <Skeleton h="320px" rounded="md" /> : <FrictionMap data={fm.data} />}
        </StatsSection>

        <StatsSection {...sectionProps('projection')} title="Will we hit 30K hectares?" subtitle="Forward projection from current velocity vs the FY-end target">
          {proj.error && <Alert status="error" rounded="md"><AlertIcon />Projection failed: {proj.error.message}</Alert>}
          {proj.loading && !proj.data ? <Skeleton h="240px" rounded="md" /> : <Projection data={proj.data} />}
        </StatsSection>

        <StatsSection {...sectionProps('funnel-velocity')} title="Is the outreach motion working?" subtitle="Time-to-stage and throughput across the Stormboy contact funnel">
          {fv.error && <Alert status="error" rounded="md"><AlertIcon />Funnel velocity failed: {fv.error.message}</Alert>}
          {fv.loading && !fv.data ? <Skeleton h="320px" rounded="md" /> : <FunnelVelocity data={fv.data} />}
        </StatsSection>

        <StatsSection {...sectionProps('forecast')} title="What's in flight? — forward forecast" subtitle="Open pipeline × historical stage-win probability, per cohort">
          {fcst.error && <Alert status="error" rounded="md"><AlertIcon />Forecast failed: {fcst.error.message}</Alert>}
          {fcst.loading && !fcst.data ? <Skeleton h="320px" rounded="md" /> : <Forecast data={fcst.data} />}
        </StatsSection>

        <StatsSection {...sectionProps('snapshot-pipeline')} title="Where do deals stall in snapshot delivery?" subtitle="Post-visit HORIZON throughput · biggest stuck-state callout above the stacked bar">
          {sp.error && <Alert status="error" rounded="md"><AlertIcon />Snapshot pipeline failed: {sp.error.message}</Alert>}
          {sp.loading && !sp.data ? <Skeleton h="240px" rounded="md" /> : <SnapshotPipeline data={sp.data} />}
        </StatsSection>

        <StatsSection {...sectionProps('ticket-sla')} title="Snapshot ticket SLA" subtitle="HORIZON ticket dwell-time by stage vs SLA targets + completion cycle">
          {sla.error && <Alert status="error" rounded="md"><AlertIcon />Ticket SLA failed: {sla.error.message}</Alert>}
          {sla.loading && !sla.data ? <Skeleton h="280px" rounded="md" /> : <TicketSla data={sla.data} />}
        </StatsSection>

        <StatsSection {...sectionProps('lead-response')} title="Are we losing bookings to slow response?" subtitle="Time-to-first-touch distribution · booked vs not-booked split — the diagnostic angle on response speed">
          {lr.error && <Alert status="error" rounded="md"><AlertIcon />Lead-response failed: {lr.error.message}</Alert>}
          {lr.loading && !lr.data ? <Skeleton h="240px" rounded="md" /> : <LeadResponse data={lr.data} />}
        </StatsSection>

        <StatsSection {...sectionProps('property-size')} title="Does property size predict outcome?" subtitle="Property size × cycle time × win rate">
          {ps.error && <Alert status="error" rounded="md"><AlertIcon />Property size failed: {ps.error.message}</Alert>}
          {ps.loading && !ps.data ? <Skeleton h="240px" rounded="md" /> : <PropertySize data={ps.data} />}
        </StatsSection>

        <StatsSection {...sectionProps('geographic')} title="Geographic / NRM insights" subtitle="Performance by region · postcode-mapped to NRM regions where available">
          {geo.error && <Alert status="error" rounded="md"><AlertIcon />Geographic failed: {geo.error.message}</Alert>}
          {geo.loading && !geo.data ? <Skeleton h="280px" rounded="md" /> : <Geographic data={geo.data} />}
        </StatsSection>

        <StatsSection {...sectionProps('call-quality')} title="Call quality" subtitle="Connect rate, best calling windows, per-rep leaderboard, day×hour heatmap">
          {cq.error && <Alert status="error" rounded="md"><AlertIcon />Call quality failed: {cq.error.message}</Alert>}
          {cq.loading && !cq.data ? <Skeleton h="360px" rounded="md" /> : <CallQuality data={cq.data} />}
        </StatsSection>
      </Stack>
    </Box>
  );
}
