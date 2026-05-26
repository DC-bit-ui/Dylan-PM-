import {
  Box,
  Button,
  HStack,
  Text,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react';
import type { AskCatalog } from '@/types/askPrompts';

interface AskChipRowProps {
  label: string;
  questionIds: string[];
  catalog: AskCatalog;
  onPick: (id: string) => void;
  emptyMessage?: string;
}

export function AskChipRow({
  label,
  questionIds,
  catalog,
  onPick,
  emptyMessage,
}: AskChipRowProps) {
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const chipBg = useColorModeValue('white', 'gray.800');
  const chipBorder = useColorModeValue('gray.300', 'gray.600');
  const hoverColor = 'brand.500';

  const questions = questionIds
    .map((id) => catalog.questions.find((q) => q.id === id))
    .filter((q): q is NonNullable<typeof q> => !!q);

  return (
    <Box mb={4}>
      <Text
        fontSize="xs"
        fontWeight={700}
        textTransform="uppercase"
        letterSpacing="0.6px"
        color={labelColor}
        mb={2}
      >
        {label}
      </Text>
      {questions.length === 0 && emptyMessage ? (
        <Text fontSize="sm" color="gray.400" fontStyle="italic">
          {emptyMessage}
        </Text>
      ) : (
        <Wrap spacing={2}>
          {questions.map((q) => {
            const cat = catalog.categories.find((c) => c.id === q.category);
            const icon = q.icon || cat?.icon || '·';
            return (
              <WrapItem key={q.id}>
                <Button
                  size="sm"
                  variant="outline"
                  bg={chipBg}
                  borderColor={chipBorder}
                  borderRadius="full"
                  fontWeight={500}
                  fontSize="xs"
                  onClick={() => onPick(q.id)}
                  _hover={{ borderColor: hoverColor, color: hoverColor }}
                  title={q.hint || ''}
                  maxW="300px"
                >
                  <HStack spacing={2}>
                    <Text as="span">{icon}</Text>
                    <Text as="span" noOfLines={1}>
                      {q.label}
                    </Text>
                  </HStack>
                </Button>
              </WrapItem>
            );
          })}
        </Wrap>
      )}
    </Box>
  );
}
