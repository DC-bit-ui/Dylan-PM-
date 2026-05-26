import {
  Box,
  Text,
  HStack,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import type { AskCatalog, AskQuestion } from '@/types/askPrompts';
import { fuzzyScore } from '@/utils/fuzzyScore';

interface AskAutocompleteProps {
  query: string;
  catalog: AskCatalog;
  onPick: (id: string) => void;
}

export function AskAutocomplete({ query, catalog, onPick }: AskAutocompleteProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('brand.50', 'brand.900');
  const labelColor = useColorModeValue('gray.800', 'gray.100');
  const hintColor = useColorModeValue('gray.500', 'gray.400');
  const catColor = useColorModeValue('gray.500', 'gray.400');

  const matches = catalog.questions
    .map((q) => ({ q, score: fuzzyScore(query, { label: q.label, hint: q.hint, body: q.question }) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  if (!matches.length) {
    return (
      <Box bg={useColorModeValue('gray.50', 'gray.900')} rounded="md" p={4} mb={4}>
        <Text fontSize="sm" color={hintColor} lineHeight={1.5}>
          No curated question matches "<strong>{query}</strong>".
        </Text>
        <Text fontSize="xs" color={hintColor} mt={1}>
          Press Enter to send your raw question to Claude Desktop anyway —
          it'll figure out which bus files to read.
        </Text>
      </Box>
    );
  }

  function categoryLabel(catId: string | undefined): string {
    if (!catId) return '';
    return catalog.categories.find((c) => c.id === catId)?.label || catId;
  }
  function categoryIcon(q: AskQuestion): string {
    return q.icon || catalog.categories.find((c) => c.id === q.category)?.icon || '·';
  }

  return (
    <Box
      bg={bg}
      border="1px solid"
      borderColor={border}
      rounded="lg"
      p={1}
      mb={4}
      boxShadow="sm"
    >
      <VStack spacing={0} align="stretch">
        {matches.map((m, i) => (
          <HStack
            key={m.q.id}
            as="button"
            onClick={() => onPick(m.q.id)}
            spacing={3}
            align="center"
            px={3}
            py={2}
            rounded="md"
            bg={i === 0 ? hoverBg : 'transparent'}
            _hover={{ bg: hoverBg }}
            textAlign="left"
            cursor="pointer"
          >
            <Text fontSize="md" w={5} textAlign="center">
              {categoryIcon(m.q)}
            </Text>
            <Box flex="1" minW={0}>
              <Text fontSize="sm" fontWeight={600} color={labelColor} noOfLines={1}>
                {m.q.label}
              </Text>
              {m.q.hint && (
                <Text fontSize="xs" color={hintColor} noOfLines={1}>
                  {m.q.hint}
                </Text>
              )}
            </Box>
            <Text
              fontSize="xs"
              color={catColor}
              fontWeight={600}
              textTransform="uppercase"
              letterSpacing="0.5px"
              flexShrink={0}
            >
              {categoryLabel(m.q.category)}
            </Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
