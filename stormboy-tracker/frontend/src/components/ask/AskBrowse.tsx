import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Code,
  Heading,
  HStack,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import type { AskCatalog } from '@/types/askPrompts';

interface AskBrowseProps {
  catalog: AskCatalog;
  onPick: (id: string) => void;
}

export function AskBrowse({ catalog, onPick }: AskBrowseProps) {
  const headColor = useColorModeValue('gray.600', 'gray.400');
  const subheadColor = useColorModeValue('gray.500', 'gray.500');
  const itemBg = useColorModeValue('white', 'gray.800');
  const itemBorder = useColorModeValue('gray.200', 'gray.700');
  const itemHover = useColorModeValue('brand.50', 'brand.900');
  const labelColor = useColorModeValue('gray.800', 'gray.100');

  return (
    <Box mt={8} borderTop="1px solid" borderColor={itemBorder} pt={4}>
      <HStack justify="space-between" align="baseline" mb={2} flexWrap="wrap">
        <Heading
          size="sm"
          textTransform="uppercase"
          letterSpacing="0.5px"
          color={headColor}
        >
          Browse curated questions
        </Heading>
        <Text fontSize="xs" color={subheadColor}>
          {catalog.questions.length} questions · authored in{' '}
          <Code fontSize="xs">shared-growth-memory/ask-prompts/curated-questions.json</Code>
        </Text>
      </HStack>
      <Accordion allowMultiple>
        {catalog.categories.map((cat) => {
          const qs = catalog.questions.filter((q) => q.category === cat.id);
          if (!qs.length) return null;
          return (
            <AccordionItem key={cat.id} border="1px solid" borderColor={itemBorder} rounded="md" mb={1} bg={itemBg}>
              <AccordionButton _hover={{ bg: itemHover }} py={2} px={3} rounded="md">
                <HStack spacing={2} flex="1" textAlign="left">
                  <Text fontSize="sm">{cat.icon}</Text>
                  <Text fontSize="sm" fontWeight={600} color={labelColor}>
                    {cat.label}
                  </Text>
                </HStack>
                <Badge variant="subtle" colorScheme="gray" mr={2} fontSize="xs">
                  {qs.length}
                </Badge>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel px={2} pt={1} pb={2}>
                <VStack align="stretch" spacing={0}>
                  {qs.map((q) => (
                    <Box
                      as="button"
                      key={q.id}
                      onClick={() => onPick(q.id)}
                      textAlign="left"
                      px={3}
                      py={2}
                      rounded="md"
                      _hover={{ bg: itemHover }}
                      cursor="pointer"
                    >
                      <Text fontSize="sm" color={labelColor} fontWeight={500}>
                        {q.label}
                      </Text>
                      {q.hint && (
                        <Text fontSize="xs" color={subheadColor}>
                          {q.hint}
                        </Text>
                      )}
                    </Box>
                  ))}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Box>
  );
}
