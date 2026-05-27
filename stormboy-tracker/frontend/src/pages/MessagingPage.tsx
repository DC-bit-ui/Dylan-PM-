import {
  Alert,
  AlertIcon,
  Box,
  Button,
  ButtonGroup,
  Code,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Skeleton,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  Tooltip,
  useColorModeValue,
  Wrap,
  WrapItem,
  Tag,
} from '@chakra-ui/react';
import { RepeatIcon, SearchIcon } from '@chakra-ui/icons';
import { useMemo, useState } from 'react';
import { useCustomerThemes } from '@/hooks/useCustomerThemes';
import { ThemeCard } from '@/components/messaging/ThemeCard';
import { QueuedNotice } from '@/components/QueuedNotice';
import type { CustomerTheme } from '@/types/customerThemes';

type ViewMode = 'all' | 'landed' | 'friction';

const SURFACE_SCHEME: Record<string, string> = {
  interview: 'green',
  standup: 'orange',
  'farm visit': 'yellow',
  call: 'blue',
  email: 'purple',
};

export function MessagingPage() {
  const { data, loading, error, refetch } = useCustomerThemes();
  const [view, setView] = useState<ViewMode>('all');
  const [query, setQuery] = useState('');
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');

  const filteredThemes = useMemo<CustomerTheme[]>(() => {
    const themes = data?.themes || [];
    let out = themes;
    if (view === 'landed') out = out.filter((t) => t.land_rate >= 75);
    else if (view === 'friction') out = out.filter((t) => t.friction_count > 0 || t.land_rate < 50);
    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter((t) => {
        const haystack = [
          t.theme,
          t.marketing_angle || '',
          t.headline_candidate || '',
          t.supporting_quote || '',
          (t.customer_positions || []).map((cp) => cp.text).join(' '),
          (t.member_labels || []).join(' '),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
    }
    return out;
  }, [data, view, query]);

  const totals = data?.summary;
  const sources = (data?.summary.sources_loaded || []).filter((s) => s.distillates > 0);

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Heading size="lg" letterSpacing="-0.5px" mb={1}>
            Messaging
          </Heading>
          <Text fontSize="sm" color={subColor}>
            Marketing-grade themes lifted from real sales conversations + reflective interviews.
            Each card has a campaign-ready headline + customer voice + evidence mix.
          </Text>
        </Box>
        <Tooltip label="Re-cluster from cached distillates (force Haiku pass)">
          <IconButton
            aria-label="Refresh themes"
            icon={<RepeatIcon />}
            size="sm"
            variant="outline"
            onClick={() => refetch(true)}
            isLoading={loading}
          />
        </Tooltip>
      </Flex>

      {error && (
        <Alert status="error" rounded="md" mb={4}>
          <AlertIcon />
          Customer themes unavailable: {error.message}
        </Alert>
      )}

      {data?.clustering && (
        <QueuedNotice
          status={data.clustering.status}
          asOf={data.clustering.clustered_at || data.generated_at}
          resource="Themes"
          bundleId={data.clustering.bundle_id}
        />
      )}

      {/* Summary row */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mb={4}>
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={4}>
          <Stat>
            <StatLabel
              fontSize="2xs"
              fontWeight={700}
              textTransform="uppercase"
              letterSpacing="0.5px"
              color={subColor}
            >
              Distillates
            </StatLabel>
            <Skeleton isLoaded={!loading} fitContent>
              <StatNumber fontSize="2xl" letterSpacing="-0.5px">
                {totals?.total_topic_distillates ?? '—'}
              </StatNumber>
            </Skeleton>
            <Text fontSize="xs" color={subColor}>
              across {sources.length} sources
            </Text>
          </Stat>
        </Box>
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={4}>
          <Stat>
            <StatLabel
              fontSize="2xs"
              fontWeight={700}
              textTransform="uppercase"
              letterSpacing="0.5px"
              color={subColor}
            >
              Themes
            </StatLabel>
            <Skeleton isLoaded={!loading} fitContent>
              <StatNumber fontSize="2xl" letterSpacing="-0.5px">
                {totals?.total_themes ?? '—'}
              </StatNumber>
            </Skeleton>
            <Text fontSize="xs" color={subColor}>
              clustered (or pending bundle pass)
            </Text>
          </Stat>
        </Box>
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={4}>
          <Stat>
            <StatLabel
              fontSize="2xs"
              fontWeight={700}
              textTransform="uppercase"
              letterSpacing="0.5px"
              color={subColor}
            >
              Overall land rate
            </StatLabel>
            <Skeleton isLoaded={!loading} fitContent>
              <StatNumber fontSize="2xl" letterSpacing="-0.5px" color="brand.500">
                {totals ? `${totals.overall_land_rate}%` : '—'}
              </StatNumber>
            </Skeleton>
            <Text fontSize="xs" color={subColor}>
              {totals?.total_landed ?? 0} landed · {totals?.total_friction ?? 0} friction
            </Text>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* Source mix */}
      {sources.length > 0 && (
        <Box mb={4}>
          <Text
            fontSize="2xs"
            fontWeight={800}
            textTransform="uppercase"
            letterSpacing="0.5px"
            color={subColor}
            mb={1}
          >
            Source mix
          </Text>
          <Wrap spacing={1}>
            {sources.map((s) => (
              <WrapItem key={s.file}>
                <Tooltip label={s.file} placement="top">
                  <Tag
                    size="sm"
                    variant="subtle"
                    colorScheme={SURFACE_SCHEME[s.surface || ''] || 'gray'}
                    fontSize="2xs"
                  >
                    {s.surface || s.label} · {s.distillates}
                  </Tag>
                </Tooltip>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      )}

      {/* Filter row */}
      <Flex gap={3} mb={4} flexWrap="wrap" align="center">
        <InputGroup size="sm" maxW={{ base: 'full', md: '360px' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color={subColor} boxSize={3} />
          </InputLeftElement>
          <Input
            placeholder="Filter themes by keyword (e.g. '25%', 'permanence', 'horizon')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            bg={cardBg}
            borderColor={cardBorder}
          />
        </InputGroup>
        <ButtonGroup size="sm" variant="outline" isAttached>
          <Button
            colorScheme={view === 'all' ? 'brand' : undefined}
            variant={view === 'all' ? 'solid' : 'outline'}
            onClick={() => setView('all')}
          >
            All ({data?.themes.length ?? 0})
          </Button>
          <Button
            colorScheme={view === 'landed' ? 'brand' : undefined}
            variant={view === 'landed' ? 'solid' : 'outline'}
            onClick={() => setView('landed')}
          >
            Landed ≥75% (
            {data?.themes.filter((t) => t.land_rate >= 75).length ?? 0})
          </Button>
          <Button
            colorScheme={view === 'friction' ? 'brand' : undefined}
            variant={view === 'friction' ? 'solid' : 'outline'}
            onClick={() => setView('friction')}
          >
            Friction (
            {data?.themes.filter((t) => t.friction_count > 0 || t.land_rate < 50).length ?? 0})
          </Button>
        </ButtonGroup>
      </Flex>

      {/* Theme cards */}
      {loading && !data ? (
        <Stack spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} h="180px" rounded="md" />
          ))}
        </Stack>
      ) : filteredThemes.length === 0 ? (
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={6} textAlign="center">
          <Text fontSize="sm" color={subColor}>
            No themes match the current filter.
          </Text>
        </Box>
      ) : (
        <Stack spacing={3}>
          {filteredThemes.slice(0, 60).map((t, i) => (
            <ThemeCard key={`${t.theme}-${i}`} theme={t} />
          ))}
          {filteredThemes.length > 60 && (
            <Text fontSize="xs" color={subColor} textAlign="center" py={2}>
              Showing 60 of {filteredThemes.length}. Use the filter to narrow further.
            </Text>
          )}
        </Stack>
      )}

      <Box mt={6} fontSize="xs" color={subColor}>
        Themes sourced from{' '}
        <Code fontSize="2xs">shared-growth-memory/persona-supplements/&lt;rep&gt;/</Code>{' '}
        (auto-discovered) and the cached distillate JSONs. Drop a new interview /
        standup file matching the patterns and it'll flow in on the next refresh.
      </Box>
    </Box>
  );
}
