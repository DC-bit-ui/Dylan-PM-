import {
  Alert,
  AlertIcon,
  Box,
  Heading,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { useAskCatalog } from '@/hooks/useAskCatalog';
import {
  useRecentPrompts,
  useRecentViews,
} from '@/hooks/useRecentAsk';
import { AskSearchBar } from '@/components/ask/AskSearchBar';
import { AskAutocomplete } from '@/components/ask/AskAutocomplete';
import { AskChipRow } from '@/components/ask/AskChipRow';
import { AskBrowse } from '@/components/ask/AskBrowse';
import { AskPreview } from '@/components/ask/AskPreview';
import { fuzzyScore } from '@/utils/fuzzyScore';
import { copyToClipboard, openClaudeDesktop } from '@/utils/claudeDeepLink';

// Map dashboard tab → suggested question IDs. Grows as new questions
// land in curated-questions.json on the bus.
const TAB_TO_SUGGESTED_IDS: Record<string, string[]> = {
  work: ['cold-open-framings', 'i-just-graze-objection', '25-pct-too-high', 'horizon-snapshot-power'],
  stats: ['ben-curiosity-frame', 'team-patterns-25pp-gap', 'team-patterns-friction-stages'],
  brain: ['hobbs-handbook-overview', 'cold-open-framings', '25-yr-too-long'],
  messaging: ['team-patterns-25pp-gap', 'hobbs-handbook-overview'],
  health: ['operational-stuck-tickets', 'operational-snapshot-bottleneck'],
};

export function AskPage() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: catalog, loading, error } = useAskCatalog();
  const recentPrompts = useRecentPrompts();
  const recentViews = useRecentViews();
  const toast = useToast();
  const subColor = useColorModeValue('gray.500', 'gray.400');

  const contextualIds = useMemo<string[]>(() => {
    const ids: string[] = [];
    const seen = new Set<string>();
    recentViews.forEach((v) => {
      const list = TAB_TO_SUGGESTED_IDS[v.tab] || [];
      list.forEach((id) => {
        if (!seen.has(id)) { seen.add(id); ids.push(id); }
      });
    });
    if (!ids.length && catalog) {
      catalog.questions.slice(0, 3).forEach((q) => ids.push(q.id));
    }
    return ids.slice(0, 6);
  }, [recentViews, catalog]);

  const recentTabs = recentViews.map((v) => v.tab).join(' · ');

  if (loading) {
    return (
      <Box>
        <Heading size="lg" letterSpacing="-0.5px" mb={1}>
          Ask the team brain
        </Heading>
        <Text fontSize="sm" color={subColor} mb={6}>
          Loading curated questions…
        </Text>
      </Box>
    );
  }

  if (error || !catalog) {
    return (
      <Alert status="error" rounded="md">
        <AlertIcon />
        Curated questions unavailable: {error?.message || catalog?.error || 'unknown error'}
      </Alert>
    );
  }

  async function fireRawQuery() {
    if (!query.trim()) return;
    const prompt = `Read whatever you need from the shared-growth-memory bus on my OneDrive (Claude Code Projects/shared-growth-memory) and answer this question for me:\n\n> ${query.trim()}\n\nLead with the answer, then evidence. Cite the source files inline. If the bus doesn't ground a clear answer, say so.`;
    try {
      await copyToClipboard(prompt);
    } catch (_) {
      // ignore
    }
    const result = openClaudeDesktop(prompt);
    if (result.opened) {
      toast({ title: 'Opened Claude Desktop with your question', status: 'success', duration: 4500 });
      setQuery('');
    } else {
      toast({
        title: 'Prompt too long',
        description: 'Copied to clipboard — paste in Claude Desktop manually.',
        status: 'warning',
        duration: 6000,
      });
    }
  }

  function handleSubmit() {
    // Pick top autocomplete match if any, else fire raw query
    const matches = catalog!.questions
      .map((q) => ({ q, score: fuzzyScore(query, { label: q.label, hint: q.hint, body: q.question }) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);
    if (matches.length > 0) {
      setSelectedId(matches[0].q.id);
    } else if (query.trim()) {
      fireRawQuery();
    }
  }

  return (
    <Box maxW="3xl">
      <Heading size="lg" letterSpacing="-0.5px" mb={1}>
        Ask the team brain
      </Heading>
      <Text fontSize="sm" color={subColor} mb={5} lineHeight={1.55}>
        Type what you want to know, pick from suggestions, or browse the curated set below.
        Each question opens your Claude Desktop with the right bus files pointed at — multi-turn
        happens in your own session. No metered API.
      </Text>

      <AskSearchBar
        value={query}
        onChange={setQuery}
        onSubmit={handleSubmit}
        onEscape={() => setQuery('')}
      />

      {query && !selectedId && (
        <Box mt={3}>
          <AskAutocomplete query={query} catalog={catalog} onPick={(id) => setSelectedId(id)} />
        </Box>
      )}

      {selectedId && (
        <Box mt={3}>
          <AskPreview questionId={selectedId} onClose={() => setSelectedId(null)} />
        </Box>
      )}

      {!selectedId && (
        <Box mt={4}>
          <AskChipRow
            label="Recent"
            questionIds={recentPrompts.map((r) => r.id).slice(0, 5)}
            catalog={catalog}
            onPick={(id) => setSelectedId(id)}
            emptyMessage="Your last-asked questions will appear here."
          />
          <AskChipRow
            label={recentViews.length ? `Based on your recent views (${recentTabs})` : 'Suggested starting points'}
            questionIds={contextualIds}
            catalog={catalog}
            onPick={(id) => setSelectedId(id)}
          />
        </Box>
      )}

      {!selectedId && <AskBrowse catalog={catalog} onPick={(id) => setSelectedId(id)} />}
    </Box>
  );
}
