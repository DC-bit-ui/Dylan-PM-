import {
  Badge,
  Box,
  HStack,
  Tag,
  Text,
  useColorModeValue,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import type { BrainObjectionCard } from '@/types/brain';

export function ObjectionCard({ card }: { card: BrainObjectionCard }) {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.200', 'gray.700');
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const objectionBg = useColorModeValue('red.50', 'red.900');
  const objectionColor = useColorModeValue('red.700', 'red.200');
  const reframeBg = useColorModeValue('brand.50', 'brand.900');
  const reframeColor = useColorModeValue('brand.700', 'brand.200');

  return (
    <Box bg={bg} border="1px solid" borderColor={border} rounded="md" p={4}>
      <HStack mb={2}>
        <Badge variant="subtle" colorScheme="gray" fontSize="2xs">
          #{card.number}
        </Badge>
        {(card.tags || []).map((t) => (
          <Tag key={t} size="sm" colorScheme="brand" variant="subtle" fontSize="2xs">
            {t}
          </Tag>
        ))}
      </HStack>
      <Box bg={objectionBg} rounded="sm" p={2.5} mb={2}>
        <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={objectionColor} mb={0.5}>
          Objection
        </Text>
        <Text fontSize="sm" color={objectionColor} lineHeight={1.5} fontWeight={600}>
          {card.objection}
        </Text>
        {card.subtext && (
          <Text fontSize="xs" color={subColor} mt={1}>
            {card.subtext}
          </Text>
        )}
      </Box>
      <Box bg={reframeBg} rounded="sm" p={2.5} mb={card.closing_line ? 2 : 0}>
        <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={reframeColor} mb={0.5}>
          Reframe
        </Text>
        <Text fontSize="sm" color={reframeColor} lineHeight={1.5}>
          {card.reframe}
        </Text>
      </Box>
      {card.closing_line && (
        <Text fontSize="xs" color={subColor} fontStyle="italic" mt={2}>
          {card.closing_line}
        </Text>
      )}
      {card.source && (
        <Wrap mt={2}>
          <WrapItem>
            <Text fontSize="2xs" color={subColor}>
              {card.source}
            </Text>
          </WrapItem>
        </Wrap>
      )}
    </Box>
  );
}
