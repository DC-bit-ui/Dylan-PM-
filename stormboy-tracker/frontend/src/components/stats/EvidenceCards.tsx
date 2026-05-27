import {
  Box,
  Code,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import type { EvidenceCardsResponse } from '@/types/stats';

const CATEGORY_LABELS: Record<string, string> = {
  tactical_framing: 'Tactical framing',
  strategic_finding: 'Strategic finding',
  tactical_play: 'Tactical play',
};

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category.replace(/_/g, ' ');
}

export function EvidenceCards({ data }: { data: EvidenceCardsResponse | null }) {
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.900');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const bodyColor = useColorModeValue('gray.700', 'gray.200');

  if (!data || !data.cards || data.cards.length === 0) {
    return (
      <Text fontSize="sm" color={subColor} fontStyle="italic">
        {data?.reason || 'No patterns in shared-growth-memory/patterns/ yet.'}
      </Text>
    );
  }

  return (
    <Box>
      <Text fontSize="xs" color={subColor} mb={3}>
        Patterns distilled from call transcripts, standups, and loss data — each
        card is a tactical play with the evidence behind it.
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
        {data.cards.map((card) => (
          <Box
            key={card.source_file}
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            borderLeftWidth="3px"
            borderLeftColor={card.accent}
            rounded="md"
            p={3}
          >
            <Flex justify="space-between" align="flex-start" gap={2} mb={1}>
              <Heading size="xs" letterSpacing="-0.2px">
                {card.title}
              </Heading>
              <Text
                fontSize="2xs"
                fontWeight={700}
                color={card.accent}
                textTransform="uppercase"
                whiteSpace="nowrap"
                flexShrink={0}
              >
                {categoryLabel(card.category)}
              </Text>
            </Flex>
            <Text fontSize="xs" color={bodyColor} mb={2}>
              {card.headline_evidence || card.body_preview}
            </Text>
            <Text fontSize="2xs" color={subColor}>
              confidence {card.confidence} · {card.applicability_count}{' '}
              applicability case{card.applicability_count === 1 ? '' : 's'} ·{' '}
              <Code fontSize="2xs">patterns/{card.source_file}</Code>
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
