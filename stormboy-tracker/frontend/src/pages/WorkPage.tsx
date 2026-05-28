import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Skeleton,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useMemo, useState } from 'react';
import {
  useExemplars,
  useRecentWins,
  useOpenProbes,
  useStormboySummary,
  useContactDiagnoses,
} from '@/hooks/useWork';
import { ExemplarCard } from '@/components/work/ExemplarCard';
import { RecentWinRow } from '@/components/work/RecentWinRow';
import { ProbeCard } from '@/components/work/ProbeCard';
import { StormboyFunnel } from '@/components/work/StormboyFunnel';
import { SynthesisCard } from '@/components/work/SynthesisCard';
import { UpcomingVisitRow } from '@/components/work/UpcomingVisitRow';
import type { Exemplar } from '@/types/work';

const HEAT_RANK: Record<string, number> = { HOT: 0, WARM: 1, COLD: 2 };

function filterByOwner(list: Exemplar[], owner: string) {
  if (owner === 'all') return list;
  return list.filter((e) =>
    (e.assigned_to_name || '').toLowerCase().startsWith(owner.toLowerCase()),
  );
}

function uniqueOwners(list: Exemplar[]) {
  const set = new Set<string>();
  for (const e of list) if (e.assigned_to_name) set.add(e.assigned_to_name);
  return Array.from(set).sort();
}

export function WorkPage() {
  const exemplars = useExemplars();
  const wins = useRecentWins();
  const probes = useOpenProbes();
  const sb = useStormboySummary();
  const cd = useContactDiagnoses();
  const [owner, setOwner] = useState<string>('all');
  const [query, setQuery] = useState('');

  const subColor = useColorModeValue('gray.500', 'gray.400');
  const headColor = useColorModeValue('gray.600', 'gray.400');
  const sectionBorder = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');

  const allExemplars = exemplars.data?.exemplars || [];
  const owners = useMemo(() => uniqueOwners(allExemplars), [allExemplars]);
  const filtered = useMemo(() => {
    let list = filterByOwner(allExemplars, owner);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((e) =>
        [e.title, e.subtitle, e.next_step_short, e.next_step_qualifier]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      );
    }
    return list;
  }, [allExemplars, owner, query]);

  const stuck = filtered.filter((e) => e.kind === 'stuck_deal');
  const visits = filtered.filter((e) => e.kind === 'completed_visit');
  const stalls = filtered.filter((e) => e.kind === 'stalled_call');

  return (
    <Box>
      <Box mb={4}>
        <Heading size="lg" letterSpacing="-0.5px" mb={1}>
          Work
        </Heading>
        <Text fontSize="sm" color={subColor}>
          Today's exemplars · the deals, visits, and calls that move the needle
          this week. Expand a card to see the diagnosis, counterfactual, draft,
          and the right next action.
        </Text>
      </Box>

      {/* Filter bar */}
      <Flex gap={3} mb={4} flexWrap="wrap" align="center">
        <InputGroup size="sm" maxW={{ base: 'full', md: '360px' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color={subColor} boxSize={3} />
          </InputLeftElement>
          <Input
            placeholder="Filter by deal, contact, or next step…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            bg={cardBg}
            borderColor={cardBorder}
          />
        </InputGroup>
        <HStack flexWrap="wrap">
          <Tag
            size="md"
            colorScheme={owner === 'all' ? 'brand' : 'gray'}
            variant={owner === 'all' ? 'solid' : 'subtle'}
            cursor="pointer"
            onClick={() => setOwner('all')}
          >
            All
          </Tag>
          {owners.map((o) => (
            <Tag
              key={o}
              size="md"
              colorScheme={owner === o ? 'brand' : 'gray'}
              variant={owner === o ? 'solid' : 'subtle'}
              cursor="pointer"
              onClick={() => setOwner(o)}
            >
              {o}
            </Tag>
          ))}
        </HStack>
        <Text fontSize="xs" color={headColor} ml="auto">
          {filtered.length} of {allExemplars.length} cards
        </Text>
      </Flex>

      <Grid templateColumns={{ base: '1fr', xl: '1fr 320px' }} gap={6}>
        <GridItem minW={0}>
          {/* Exemplars */}
          {exemplars.error && (
            <Alert status="error" rounded="md" mb={3}>
              <AlertIcon />
              Exemplars failed: {exemplars.error.message}
            </Alert>
          )}
          {exemplars.loading && !exemplars.data ? (
            <Stack spacing={3}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} h="120px" rounded="md" />
              ))}
            </Stack>
          ) : (
            <Tabs colorScheme="brand" variant="line" size="sm">
              <TabList>
                <Tab>All ({filtered.length})</Tab>
                <Tab>Stuck deals ({stuck.length})</Tab>
                <Tab>Completed visits ({visits.length})</Tab>
                <Tab>Stalled calls ({stalls.length})</Tab>
              </TabList>
              <TabPanels>
                <TabPanel px={0}>
                  <Stack spacing={3}>
                    {filtered.map((ex) => (
                      <ExemplarCard key={ex.id} exemplar={ex} />
                    ))}
                    {filtered.length === 0 && (
                      <Text fontSize="sm" color={subColor} fontStyle="italic">
                        No cards match the filter.
                      </Text>
                    )}
                  </Stack>
                </TabPanel>
                <TabPanel px={0}>
                  <Stack spacing={3}>
                    {stuck.map((ex) => (
                      <ExemplarCard key={ex.id} exemplar={ex} />
                    ))}
                  </Stack>
                </TabPanel>
                <TabPanel px={0}>
                  <Stack spacing={3}>
                    {visits.map((ex) => (
                      <ExemplarCard key={ex.id} exemplar={ex} />
                    ))}
                  </Stack>
                </TabPanel>
                <TabPanel px={0}>
                  <Stack spacing={3}>
                    {stalls.map((ex) => (
                      <ExemplarCard key={ex.id} exemplar={ex} />
                    ))}
                  </Stack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}

          {/* Storm Boy funnel */}
          <Box mt={8} pt={6} borderTop="1px solid" borderColor={sectionBorder}>
            <HStack justify="space-between" align="baseline" mb={3} flexWrap="wrap">
              <Heading size="md" letterSpacing="-0.3px">Storm Boy funnel</Heading>
              <Text fontSize="xs" color={headColor}>
                Identified → Exited · contact-stage counts
              </Text>
            </HStack>
            {sb.error && (
              <Alert status="error" rounded="md" mb={3}>
                <AlertIcon />
                Funnel failed: {sb.error.message}
              </Alert>
            )}
            {sb.loading && !sb.data ? (
              <Skeleton h="240px" rounded="md" />
            ) : (
              <StormboyFunnel data={sb.data} />
            )}
          </Box>

          {/* Farm Visit completed · synthesis cards */}
          <Box mt={8}>
            <HStack justify="space-between" align="baseline" mb={3} flexWrap="wrap">
              <Heading size="md" letterSpacing="-0.3px">Farm visits completed · synthesis</Heading>
              <Text fontSize="xs" color={headColor}>
                Pursue vs disengage · diagnosis-backed
              </Text>
            </HStack>
            {cd.error && (
              <Alert status="error" rounded="md" mb={3}>
                <AlertIcon />
                Contact diagnoses failed: {cd.error.message}
              </Alert>
            )}
            {cd.loading && !cd.data ? (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} h="140px" rounded="md" />)}
              </SimpleGrid>
            ) : (() => {
              const all = Object.values(cd.data?.contacts || {});
              const completed = all
                .filter((c) => c.stage === 'Farm Visit completed')
                .sort((a, b) => (HEAT_RANK[a.heat] ?? 9) - (HEAT_RANK[b.heat] ?? 9));
              const urlMap = new Map<string, string>();
              (sb.data?.recent_visits || []).forEach((v) => urlMap.set(v.id, v.hubspot_url));
              if (completed.length === 0) {
                return (
                  <Text fontSize="sm" color={subColor} fontStyle="italic">
                    No farm-visit synthesis cards yet — diagnoses are produced by the
                    intelligence-bundle processor; check the Intelligence queue if this stays empty.
                  </Text>
                );
              }
              return (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  {completed.slice(0, 12).map((c) => (
                    <SynthesisCard
                      key={c.contact_id}
                      contact={c}
                      hubspotUrl={urlMap.get(c.contact_id)}
                    />
                  ))}
                </SimpleGrid>
              );
            })()}
          </Box>
        </GridItem>

        {/* Right rail */}
        <GridItem display={{ base: 'none', xl: 'block' }}>
          <Box position="sticky" top="76px" maxH="calc(100vh - 100px)" overflowY="auto" pr={1}>
            <Box mb={5}>
              <Heading size="sm" mb={2} color={headColor}>
                Upcoming farm visits
              </Heading>
              {sb.loading && !sb.data ? (
                <Skeleton h="64px" rounded="md" />
              ) : (sb.data?.upcoming || []).length > 0 ? (
                <Stack spacing={1.5}>
                  {sb.data!.upcoming.slice(0, 8).map((v) => (
                    <UpcomingVisitRow key={v.id} visit={v} />
                  ))}
                </Stack>
              ) : (
                <Text fontSize="xs" color={subColor} fontStyle="italic">None booked.</Text>
              )}
            </Box>
            <Box mb={5}>
              <Heading size="sm" mb={2} color={headColor}>
                Recent wins
              </Heading>
              {wins.error && (
                <Alert status="error" rounded="md" size="sm">
                  <AlertIcon />
                  Wins failed
                </Alert>
              )}
              {wins.loading && !wins.data ? (
                <Stack spacing={2}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} h="64px" rounded="md" />
                  ))}
                </Stack>
              ) : (
                <Stack spacing={2}>
                  {(wins.data?.wins || []).slice(0, 8).map((w) => (
                    <RecentWinRow key={w.deal_id} win={w} />
                  ))}
                  {(wins.data?.wins || []).length === 0 && (
                    <Text fontSize="xs" color={subColor} fontStyle="italic">
                      No recent wins.
                    </Text>
                  )}
                </Stack>
              )}
            </Box>
            <Box>
              <Heading size="sm" mb={2} color={headColor}>
                Open probes
              </Heading>
              {probes.error && (
                <Alert status="error" rounded="md" size="sm">
                  <AlertIcon />
                  Probes failed
                </Alert>
              )}
              {probes.loading && !probes.data ? (
                <Stack spacing={2}>
                  {[1, 2].map((i) => (
                    <Skeleton key={i} h="80px" rounded="md" />
                  ))}
                </Stack>
              ) : (
                <Stack spacing={2}>
                  {(probes.data?.probes || []).slice(0, 6).map((p) => (
                    <ProbeCard key={p.probe_id} probe={p} />
                  ))}
                  {(probes.data?.probes || []).length === 0 && (
                    <Text fontSize="xs" color={subColor} fontStyle="italic">
                      No open probes.
                    </Text>
                  )}
                </Stack>
              )}
            </Box>
          </Box>
        </GridItem>
      </Grid>

      {/* Mobile foot — recent wins + probes stacked below */}
      <Box display={{ base: 'block', xl: 'none' }} mt={8}>
        <Heading size="sm" mb={2} color={headColor}>
          Recent wins
        </Heading>
        {wins.loading && !wins.data ? (
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} h="64px" rounded="md" />
            ))}
          </Stack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
            {(wins.data?.wins || []).slice(0, 8).map((w) => (
              <RecentWinRow key={w.deal_id} win={w} />
            ))}
          </SimpleGrid>
        )}
        <Heading size="sm" mt={6} mb={2} color={headColor}>
          Open probes
        </Heading>
        {probes.loading && !probes.data ? (
          <Stack spacing={2}>
            {[1, 2].map((i) => (
              <Skeleton key={i} h="80px" rounded="md" />
            ))}
          </Stack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
            {(probes.data?.probes || []).slice(0, 6).map((p) => (
              <ProbeCard key={p.probe_id} probe={p} />
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
}
