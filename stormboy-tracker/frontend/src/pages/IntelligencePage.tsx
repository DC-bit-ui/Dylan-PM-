import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Code,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  HStack,
  Skeleton,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useBundleQueueHealth } from '@/hooks/useBundleQueueHealth';
import { useBundles } from '@/hooks/useBundles';
import { intelligenceClient } from '@/services/intelligenceClient';
import { openClaudeDesktop, copyToClipboard } from '@/utils/claudeDeepLink';
import type { BundleMeta, BundleResult } from '@/types/intelligence';

const STATUS_SCHEME: Record<string, string> = {
  queued: 'yellow', claimed: 'blue', completed: 'green', failed: 'red',
};
const FILTERS: { v: string; label: string }[] = [
  { v: '', label: 'All' },
  { v: 'queued', label: 'Queued' },
  { v: 'claimed', label: 'Claimed' },
  { v: 'completed', label: 'Completed' },
  { v: 'failed', label: 'Failed' },
];

// Prompt that asks an interactive Claude (Desktop/Code) to drain the whole
// queue under subscription compute — the manual lever when the scheduled
// processor is behind.
const DRAIN_PROMPT = [
  'You are Apex. Process the intelligence-bundle queue now (manual trigger from the v3 dashboard).',
  '',
  'Scan `shared-growth-memory/intelligence-bundles/*.json` for status=queued and process up to 20 per run. For each: read the companion `.md` (prompt + inputs), produce the result matching `meta.output_schema`, write `shared-growth-memory/intelligence-results/<id>.json`, and update the bundle meta to status=completed. Atomic writes (tmp+rename) throughout.',
  '',
  'Append a run summary to `shared-growth-memory/apex-runs.log` with run-type `manual-process-intelligence` and counts: scanned/queued/claimed/completed/failed.',
].join('\n');

function age(iso?: string | null): string {
  if (!iso) return '—';
  const h = (Date.now() - Date.parse(iso)) / 3.6e6;
  if (!Number.isFinite(h)) return '—';
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 48) return `${Math.round(h)}h`;
  return `${Math.round(h / 24)}d`;
}

export function IntelligencePage() {
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<BundleMeta | null>(null);
  const { data: health, refetch: refetchHealth } = useBundleQueueHealth();
  const { data, loading, error, refetch } = useBundles(filter || undefined);
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const headBg = useColorModeValue('gray.50', 'gray.800');
  const toast = useToast();
  const [pruning, setPruning] = useState(false);

  const alert = health?.alert;
  const bannerBg = useColorModeValue(alert ? 'red.50' : 'green.50', alert ? 'red.900' : 'green.900');
  const bannerBorder = useColorModeValue(alert ? 'red.300' : 'green.300', alert ? 'red.700' : 'green.700');
  const bannerText = useColorModeValue(alert ? 'red.700' : 'green.700', alert ? 'red.200' : 'green.200');

  const processNow = () => {
    const r = openClaudeDesktop(DRAIN_PROMPT);
    if (r.opened) {
      toast({ title: 'Sent to Claude Desktop', description: 'Click Send there to drain the queue; refresh here in a minute.', status: 'success', duration: 6000 });
    } else {
      copyToClipboard(DRAIN_PROMPT);
      toast({ title: 'Couldn’t open Claude Desktop', description: 'Drain prompt copied — paste it into any Claude Code session pointed at the bus.', status: 'warning', duration: 7000 });
    }
  };

  const pruneNow = async () => {
    setPruning(true);
    try {
      const r = await intelligenceClient.prune();
      toast({ title: `Pruned ${r.pruned} bundle(s)`, description: `${r.kept} kept · retention ${r.max_age_days}d`, status: 'success', duration: 4000 });
      refetch();
      refetchHealth();
    } catch (e) {
      toast({ title: 'Prune failed', description: (e as Error).message, status: 'error', duration: 5000 });
    } finally {
      setPruning(false);
    }
  };

  const byStatus = data?.stats?.by_status || {};

  return (
    <Box>
      <Box mb={4}>
        <Heading size="lg" letterSpacing="-0.5px" mb={1}>Intelligence</Heading>
        <Text fontSize="sm" color={subColor}>
          The subscription-compute queue. Analytic work (clustering, diagnoses, brain-ask) is written
          here as bundles and processed by Cowork / Claude Code — no metered API. Drain it manually
          when the scheduled processor is behind.
        </Text>
      </Box>

      {/* Queue health banner */}
      <Box bg={bannerBg} border="1px solid" borderColor={bannerBorder} rounded="md" p={4} mb={5}>
        <Flex justify="space-between" align="center" gap={4} wrap="wrap">
          <Box>
            <Text fontSize="2xs" fontWeight={800} color={bannerText} textTransform="uppercase" letterSpacing="0.5px">
              Queue health
            </Text>
            <HStack align="baseline" spacing={3}>
              <Text fontSize="3xl" fontWeight={800} lineHeight={1}>{health?.queued ?? '—'}</Text>
              <Text fontSize="sm" color={subColor}>queued</Text>
              <Text fontSize="sm" color={subColor}>· oldest {health?.oldest_queued_age_human ?? '—'}</Text>
              <Text fontSize="sm" color={subColor}>· {health?.completed ?? 0} done · {health?.failed ?? 0} failed</Text>
            </HStack>
            <Text fontSize="xs" color={bannerText} mt={1}>
              {alert ? `⚠ ${health?.alert_reason}` : 'Processor keeping up — subscription compute healthy.'}
            </Text>
          </Box>
          <HStack spacing={2}>
            <Button colorScheme={alert ? 'red' : 'brand'} size="sm" onClick={processNow}>↗ Process queue now</Button>
            <Button variant="outline" size="sm" onClick={pruneNow} isLoading={pruning}>Prune completed</Button>
          </HStack>
        </Flex>
      </Box>

      {/* Status filter */}
      <HStack spacing={1} mb={3} overflowX="auto">
        {FILTERS.map((f) => (
          <Button
            key={f.v}
            size="xs"
            variant={filter === f.v ? 'solid' : 'outline'}
            colorScheme={filter === f.v ? 'brand' : 'gray'}
            onClick={() => setFilter(f.v)}
            flexShrink={0}
          >
            {f.label}{f.v && byStatus[f.v] != null ? ` (${byStatus[f.v]})` : ''}
          </Button>
        ))}
      </HStack>

      {error && <Text fontSize="sm" color="red.400" mb={2}>Couldn’t load bundles: {error.message}</Text>}

      {loading && !data ? (
        <Skeleton h="300px" rounded="md" />
      ) : data && data.items.length === 0 ? (
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={6} textAlign="center">
          <Text fontSize="sm" color={subColor}>No bundles{filter ? ` with status "${filter}"` : ''}.</Text>
        </Box>
      ) : (
        <Box border="1px solid" borderColor={cardBorder} rounded="md" overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead bg={headBg}>
              <Tr><Th>Purpose</Th><Th>Status</Th><Th>Created by</Th><Th isNumeric>Age</Th></Tr>
            </Thead>
            <Tbody>
              {data?.items.map((b) => (
                <Tr key={b.id} cursor="pointer" _hover={{ bg: headBg }} onClick={() => setSelected(b)}>
                  <Td>
                    <Text fontSize="xs" fontWeight={600}>{b.purpose}</Text>
                    <Text fontSize="2xs" color={subColor} noOfLines={1}>{b.input_summary || b.id}</Text>
                  </Td>
                  <Td><Badge colorScheme={STATUS_SCHEME[b.status]} fontSize="2xs">{b.status}</Badge></Td>
                  <Td fontSize="xs" color={subColor}>{b.created_by}</Td>
                  <Td isNumeric fontSize="xs">{age(b.completed_at || b.claimed_at || b.created_at)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <BundleDrawer bundle={selected} onClose={() => setSelected(null)} onChanged={() => { refetch(); refetchHealth(); }} />
    </Box>
  );
}

function BundleDrawer({ bundle, onClose, onChanged }: { bundle: BundleMeta | null; onClose: () => void; onChanged: () => void }) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const preBg = useColorModeValue('gray.50', 'gray.900');
  const preBorder = useColorModeValue('gray.200', 'gray.700');
  const toast = useToast();
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [result, setResult] = useState<BundleResult | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [pasteBack, setPasteBack] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!bundle) { setMarkdown(null); setResult(null); setPasteBack(''); return; }
    let cancelled = false;
    setLoadingDetail(true);
    setMarkdown(null); setResult(null); setPasteBack('');
    intelligenceClient.detail(bundle.id)
      .then((d) => { if (!cancelled) setMarkdown(d.markdown); })
      .catch(() => { if (!cancelled) setMarkdown(null); })
      .finally(() => { if (!cancelled) setLoadingDetail(false); });
    if (bundle.status === 'completed') {
      intelligenceClient.result(bundle.id).then((r) => { if (!cancelled) setResult(r); }).catch(() => {});
    }
    return () => { cancelled = true; };
  }, [bundle]);

  const launch = () => {
    if (!markdown) return;
    const r = openClaudeDesktop(markdown);
    if (r.opened) toast({ title: '✓ Launched in Claude Desktop', status: 'success', duration: 2500 });
    else { copyToClipboard(markdown); toast({ title: 'Too long to launch — prompt copied', status: 'warning', duration: 4000 }); }
  };

  const submit = async () => {
    if (!bundle || !pasteBack.trim()) return;
    setSubmitting(true);
    let parsed: unknown = pasteBack.trim();
    try { parsed = JSON.parse(pasteBack.trim()); } catch { /* keep as string */ }
    try {
      const out = await intelligenceClient.submitResult(bundle.id, { result: parsed, completed_by: 'manual_paste' });
      if (!out.ok) throw new Error(out.error || 'submit failed');
      toast({ title: 'Result saved', status: 'success', duration: 3000 });
      onChanged();
      onClose();
    } catch (e) {
      toast({ title: 'Submit failed', description: (e as Error).message, status: 'error', duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer isOpen={!!bundle} onClose={onClose} size="lg" placement="right">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          <Text fontSize="md">{bundle?.purpose}</Text>
          <HStack spacing={2} mt={1}>
            {bundle && <Badge colorScheme={STATUS_SCHEME[bundle.status]} fontSize="2xs">{bundle.status}</Badge>}
            <Code fontSize="2xs">{bundle?.id}</Code>
          </HStack>
        </DrawerHeader>
        <DrawerBody>
          {bundle && (
            <Stack spacing={4} pt={3}>
              <Box fontSize="xs" color={subColor}>
                <Text>model: {bundle.model_hint} · schema: {bundle.output_schema}</Text>
                <Text>created: {bundle.created_at} · by {bundle.created_by}</Text>
                {bundle.claimed_at && <Text>claimed: {bundle.claimed_at} · {bundle.claimed_by}</Text>}
                {bundle.completed_at && <Text>completed: {bundle.completed_at}</Text>}
                {bundle.error && <Text color="red.400">error: {bundle.error}</Text>}
              </Box>

              <HStack>
                <Button size="sm" colorScheme="brand" onClick={launch} isDisabled={!markdown}>↗ Open in Claude Desktop</Button>
                <Button size="sm" variant="outline" onClick={() => markdown && copyToClipboard(markdown)} isDisabled={!markdown}>Copy prompt</Button>
              </HStack>

              <Box>
                <Text fontSize="2xs" fontWeight={700} textTransform="uppercase" letterSpacing="0.5px" color={subColor} mb={1}>Prompt</Text>
                {loadingDetail ? <Spinner size="sm" /> : (
                  <Box as="pre" bg={preBg} border="1px solid" borderColor={preBorder} rounded="md" p={3} fontSize="2xs" whiteSpace="pre-wrap" maxH="320px" overflowY="auto">
                    {markdown || '(no prompt body)'}
                  </Box>
                )}
              </Box>

              {bundle.status === 'completed' && result ? (
                <Box>
                  <Text fontSize="2xs" fontWeight={700} textTransform="uppercase" letterSpacing="0.5px" color={subColor} mb={1}>Result</Text>
                  <Box as="pre" bg={preBg} border="1px solid" borderColor={preBorder} rounded="md" p={3} fontSize="2xs" whiteSpace="pre-wrap" maxH="320px" overflowY="auto">
                    {typeof result.result === 'string' ? result.result : JSON.stringify(result.result, null, 2)}
                  </Box>
                </Box>
              ) : bundle.status !== 'completed' ? (
                <Box>
                  <Text fontSize="2xs" fontWeight={700} textTransform="uppercase" letterSpacing="0.5px" color={subColor} mb={1}>
                    Paste result back (if processed elsewhere)
                  </Text>
                  <Textarea size="sm" rows={5} value={pasteBack} onChange={(e) => setPasteBack(e.target.value)} placeholder="Paste the JSON output, then Submit" />
                  <Button size="sm" colorScheme="brand" mt={2} onClick={submit} isLoading={submitting} isDisabled={!pasteBack.trim()}>Submit result</Button>
                </Box>
              ) : null}
            </Stack>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
