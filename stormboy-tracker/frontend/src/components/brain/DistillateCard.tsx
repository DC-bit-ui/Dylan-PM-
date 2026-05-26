import {
  Box,
  Heading,
  HStack,
  Tag,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import type { BrainDistillate, BrainTopicDistillate } from '@/types/brain';

interface DistillateCardProps {
  distillate: BrainDistillate;
  kind: 'farm_visit' | 'call';
}

function topicLine(t: BrainTopicDistillate) {
  return [t.customer_position, t.hobbs_response || t.rep_response]
    .filter(Boolean)
    .join(' · ');
}

export function DistillateCard({ distillate, kind }: DistillateCardProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const subColor = useColorModeValue('gray.600', 'gray.300');
  const topicBg = useColorModeValue('gray.50', 'gray.900');

  const date = distillate.visit_date || distillate.call_date || 'unknown date';
  const topics = distillate.topic_distillates || [];

  return (
    <Box bg={bg} border="1px solid" borderColor={border} rounded="md" p={4}>
      <HStack justify="space-between" mb={1}>
        <Heading size="xs" textTransform="uppercase" letterSpacing="0.5px" color={labelColor}>
          {kind === 'farm_visit' ? 'Farm visit' : 'Call'}
        </Heading>
        <HStack spacing={1}>
          {distillate.region_nrm && (
            <Tag size="sm" colorScheme="green" variant="subtle" fontSize="2xs">
              {distillate.region_nrm}
            </Tag>
          )}
          {distillate.size_bucket && (
            <Tag size="sm" colorScheme="yellow" variant="subtle" fontSize="2xs">
              {distillate.size_bucket}
            </Tag>
          )}
        </HStack>
      </HStack>
      <Text fontSize="sm" fontWeight={600} mb={2}>
        {date}
      </Text>
      {topics.slice(0, 2).map((t, i) => (
        <Box key={i} bg={topicBg} rounded="sm" p={2} mb={1}>
          <Text fontSize="xs" fontWeight={600} mb={0.5}>
            {t.topic_label}
          </Text>
          <Text fontSize="xs" color={subColor} lineHeight={1.5}>
            {topicLine(t)}
          </Text>
        </Box>
      ))}
      {topics.length > 2 && (
        <Text fontSize="xs" color={labelColor} mt={1}>
          + {topics.length - 2} more topics
        </Text>
      )}
    </Box>
  );
}
