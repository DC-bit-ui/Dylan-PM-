import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  ButtonGroup,
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
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useMemo, useState } from 'react';
import {
  useBrainPersonas,
  useBrainProfile,
  useBrainDistillates,
  useBrainObjectionCards,
} from '@/hooks/useBrain';
import { ProfileMarkdown } from '@/components/brain/ProfileMarkdown';
import { ProfileToc } from '@/components/brain/ProfileToc';
import { ObjectionCard } from '@/components/brain/ObjectionCard';
import { DistillateCard } from '@/components/brain/DistillateCard';

const DEFAULT_PROFILE = 'hobbs';

export function BrainPage() {
  const [activeSlug, setActiveSlug] = useState(DEFAULT_PROFILE);
  const [filter, setFilter] = useState('');
  const personas = useBrainPersonas();
  const profile = useBrainProfile(activeSlug);
  const distillates = useBrainDistillates();
  const objectionCards = useBrainObjectionCards();
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const headColor = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const sectionBorder = useColorModeValue('gray.200', 'gray.700');

  const personaList = personas.data?.personas || [];

  // Filter objection cards + distillates by the active filter text
  const filteredObjections = useMemo(() => {
    const cards = objectionCards.data?.cards || [];
    const q = filter.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((c) => {
      const hay = [
        c.objection,
        c.reframe,
        c.subtext || '',
        c.closing_line || '',
        (c.tags || []).join(' '),
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [objectionCards.data, filter]);

  const filteredFarmVisits = useMemo(() => {
    const list = distillates.data?.farm_visits || [];
    const q = filter.trim().toLowerCase();
    if (!q) return list;
    return list.filter((d) =>
      JSON.stringify(d.topic_distillates || []).toLowerCase().includes(q),
    );
  }, [distillates.data, filter]);

  const filteredCalls = useMemo(() => {
    const list = distillates.data?.calls || [];
    const q = filter.trim().toLowerCase();
    if (!q) return list;
    return list.filter((d) =>
      JSON.stringify(d.topic_distillates || []).toLowerCase().includes(q),
    );
  }, [distillates.data, filter]);

  return (
    <Box>
      <Box mb={4}>
        <Heading size="lg" letterSpacing="-0.5px" mb={1}>
          Brain
        </Heading>
        <Text fontSize="sm" color={subColor}>
          Browse the captured intelligence. Profiles tell you what each rep does;
          objection plays + distillates show what's happened in the field; team
          workshopping (at the bottom) shows what's been recently decided.
        </Text>
      </Box>

      {/* Filter + persona chips */}
      <Flex gap={3} mb={4} flexWrap="wrap" align="center">
        <InputGroup size="sm" maxW={{ base: 'full', md: '360px' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color={subColor} boxSize={3} />
          </InputLeftElement>
          <Input
            placeholder="Filter sections + distillates by keyword (e.g. '25%', 'cold open', 'ratchet')"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            bg={cardBg}
            borderColor={cardBorder}
          />
        </InputGroup>
        <ButtonGroup size="sm" variant="outline" isAttached>
          {personaList.map((p) => (
            <Button
              key={p.slug}
              colorScheme={p.slug === activeSlug ? 'brand' : undefined}
              variant={p.slug === activeSlug ? 'solid' : 'outline'}
              onClick={() => setActiveSlug(p.slug)}
            >
              {p.name.split(' ')[0]}
              {p.status === 'historical' && (
                <Badge ml={1} variant="subtle" colorScheme="gray" fontSize="2xs">
                  hist
                </Badge>
              )}
            </Button>
          ))}
        </ButtonGroup>
      </Flex>

      {/* Profile layout — TOC + body */}
      <Box mb={6}>
        {profile.error && (
          <Alert status="error" rounded="md">
            <AlertIcon />
            Profile failed: {profile.error.message}
          </Alert>
        )}
        {profile.loading && !profile.data ? (
          <Skeleton h="400px" rounded="md" />
        ) : profile.data ? (
          <Grid templateColumns={{ base: '1fr', lg: '220px 1fr' }} gap={6}>
            <GridItem display={{ base: 'none', lg: 'block' }}>
              <Box
                position="sticky"
                top="76px"
                maxH="calc(100vh - 100px)"
                overflowY="auto"
                pr={2}
              >
                <ProfileToc toc={profile.data.toc} filter={filter} />
              </Box>
            </GridItem>
            <GridItem minW={0}>
              <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={6}>
                <ProfileMarkdown markdown={profile.data.markdown} />
              </Box>
            </GridItem>
          </Grid>
        ) : null}
      </Box>

      {/* Objection plays */}
      <Box mt={8} pt={6} borderTop="1px solid" borderColor={sectionBorder}>
        <HStack justify="space-between" align="baseline" mb={4} flexWrap="wrap">
          <Heading size="md" letterSpacing="-0.3px">
            Objection plays
          </Heading>
          <Text fontSize="xs" color={headColor}>
            {filteredObjections.length} of {objectionCards.data?.card_count || 0}{' '}
            cards · structured by Hobbs's handbook
          </Text>
        </HStack>
        {objectionCards.error && (
          <Alert status="error" rounded="md">
            <AlertIcon />
            Objection cards failed: {objectionCards.error.message}
          </Alert>
        )}
        {objectionCards.loading && !objectionCards.data ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} h="160px" rounded="md" />
            ))}
          </SimpleGrid>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
            {filteredObjections.map((c) => (
              <ObjectionCard key={c.id} card={c} />
            ))}
          </SimpleGrid>
        )}
        {filteredObjections.length === 0 && !objectionCards.loading && (
          <Text fontSize="sm" color={subColor} fontStyle="italic">
            No objection cards match the filter.
          </Text>
        )}
      </Box>

      {/* Distillates */}
      <Box mt={8} pt={6} borderTop="1px solid" borderColor={sectionBorder}>
        <HStack justify="space-between" align="baseline" mb={4} flexWrap="wrap">
          <Heading size="md" letterSpacing="-0.3px">
            Hobbs distillates · what happened on-farm and on the phone
          </Heading>
          <Text fontSize="xs" color={headColor}>
            {filteredFarmVisits.length + filteredCalls.length} matching
          </Text>
        </HStack>
        {distillates.error && (
          <Alert status="error" rounded="md">
            <AlertIcon />
            Distillates failed: {distillates.error.message}
          </Alert>
        )}
        {distillates.loading && !distillates.data ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} h="160px" rounded="md" />
            ))}
          </SimpleGrid>
        ) : (
          <Stack spacing={5}>
            {filteredFarmVisits.length > 0 && (
              <Box>
                <Text
                  fontSize="2xs"
                  fontWeight={800}
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                  color={headColor}
                  mb={2}
                >
                  Farm visits ({filteredFarmVisits.length})
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                  {filteredFarmVisits.map((d) => (
                    <DistillateCard key={d.transcript_id} distillate={d} kind="farm_visit" />
                  ))}
                </SimpleGrid>
              </Box>
            )}
            {filteredCalls.length > 0 && (
              <Box>
                <Text
                  fontSize="2xs"
                  fontWeight={800}
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                  color={headColor}
                  mb={2}
                >
                  Calls ({filteredCalls.length})
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                  {filteredCalls.map((d) => (
                    <DistillateCard key={d.transcript_id} distillate={d} kind="call" />
                  ))}
                </SimpleGrid>
              </Box>
            )}
            {filteredFarmVisits.length + filteredCalls.length === 0 && (
              <Text fontSize="sm" color={subColor} fontStyle="italic">
                No distillates match the filter.
              </Text>
            )}
          </Stack>
        )}
      </Box>

      {/* Team workshopping — moved to end per user request */}
      <Box mt={8} pt={6} borderTop="1px solid" borderColor={sectionBorder}>
        <HStack justify="space-between" align="baseline" mb={2}>
          <Heading size="md" letterSpacing="-0.3px">
            Team workshopping · standup decisions and new directions
          </Heading>
          <Text fontSize="xs" color={headColor}>
            Mon/Fri standups, parsed
          </Text>
        </HStack>
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={4}>
          <Text fontSize="sm" color={subColor} fontStyle="italic">
            Standup summaries port arrives once the data hook is added (see v2
            /v2/#brain bottom section for the current view).
          </Text>
          <Button as="a" href="/v2/#brain" target="_blank" size="xs" variant="link" colorScheme="brand" mt={2}>
            Open v2 brain view →
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
