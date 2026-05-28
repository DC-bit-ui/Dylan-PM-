import {
  Badge,
  Box,
  Heading,
  HStack,
  List,
  ListItem,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import type { StandupEntry } from '@/types/standup';

const PRIORITY_SCHEME: Record<string, string> = { high: 'red', medium: 'orange', low: 'gray' };

export function StandupCard({ standup, isLatest }: { standup: StandupEntry; isLatest?: boolean }) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const bodyColor = useColorModeValue('gray.700', 'gray.200');
  const diffBg = useColorModeValue('green.50', 'green.900');
  const diffColor = useColorModeValue('green.700', 'green.200');

  const participants = (standup.participants || [])
    .map((p) => (typeof p === 'string' ? p : p.name || ''))
    .filter(Boolean);

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      borderLeftWidth={isLatest ? '3px' : '1px'}
      borderLeftColor={isLatest ? 'brand.400' : cardBorder}
      rounded="md"
      p={4}
    >
      <HStack justify="space-between" align="baseline" mb={1} flexWrap="wrap">
        <Heading size="sm">{standup.title}</Heading>
        <Text fontSize="2xs" color={subColor} whiteSpace="nowrap">
          {standup.weekday ? `${standup.weekday} · ` : ''}{standup.meeting_date}{isLatest ? ' · latest' : ''}
        </Text>
      </HStack>
      {participants.length > 0 && (
        <Text fontSize="2xs" color={subColor} mb={2}>{participants.join(', ')}</Text>
      )}

      <Stack spacing={2}>
        {(standup.sections || []).map((sec, i) => (
          <Box key={i}>
            <HStack mb={1} spacing={2}>
              <Text fontSize="xs" fontWeight={700} color={bodyColor}>{sec.section}</Text>
              {sec.priority != null && sec.priority !== '' && (
                <Badge fontSize="2xs" colorScheme={PRIORITY_SCHEME[String(sec.priority).toLowerCase()] || 'gray'}>
                  {sec.priority}
                </Badge>
              )}
            </HStack>
            <List spacing={0.5} pl={1}>
              {(sec.bullets || []).map((b, j) => (
                <ListItem key={j} fontSize="xs" color={subColor}>· {b}</ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Stack>

      {(standup.diff_vs_previous || []).length > 0 && (
        <Box bg={diffBg} color={diffColor} rounded="md" p={2} mt={3}>
          <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" mb={1}>
            New since previous ({standup.diff_vs_previous.length})
          </Text>
          <List spacing={0.5}>
            {standup.diff_vs_previous.slice(0, 8).map((d, i) => (
              <ListItem key={i} fontSize="xs">
                · <Text as="span" fontWeight={600}>{d.section}:</Text> {d.bullet}
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}
