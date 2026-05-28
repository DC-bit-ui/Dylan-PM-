import {
  Badge,
  Box,
  HStack,
  Link,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import type { ContactDiagnosis } from '@/types/stormboy';

const HEAT_SCHEME: Record<string, string> = { HOT: 'red', WARM: 'orange', COLD: 'gray' };

// Farm-visit synthesis card — a contact's diagnosis distilled to: heat, the
// recommended next step, and the first-line read. Built off the bundle-backed
// /api/work/contact-diagnoses. Surfaces `refresh_in_flight` when a re-diagnose
// bundle is queued so the user knows the read may be stale.
export function SynthesisCard({ contact, hubspotUrl }: { contact: ContactDiagnosis; hubspotUrl?: string }) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const bodyColor = useColorModeValue('gray.700', 'gray.200');
  const linkColor = useColorModeValue('brand.600', 'brand.300');
  const refreshColor = useColorModeValue('orange.600', 'orange.300');

  const heat = HEAT_SCHEME[contact.heat] || 'gray';
  const first = contact.diagnosis?.[0];

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      borderLeftWidth="3px"
      borderLeftColor={`${heat}.400`}
      rounded="md"
      p={3}
    >
      <HStack justify="space-between" align="baseline" mb={1} flexWrap="wrap">
        <HStack spacing={2}>
          <Text fontSize="sm" fontWeight={700}>
            {hubspotUrl ? (
              <Link href={hubspotUrl} isExternal color={linkColor}>{contact.name}</Link>
            ) : (
              contact.name
            )}
          </Text>
          <Badge colorScheme={heat} fontSize="2xs">{contact.heat}</Badge>
        </HStack>
        <Text fontSize="2xs" color={subColor}>{contact.stage}</Text>
      </HStack>

      {contact.next_step_short && (
        <Text fontSize="xs" color={bodyColor} mb={1}>
          <Text as="span" fontWeight={700}>Next:</Text> {contact.next_step_short}
          {contact.next_step_qualifier ? ` — ${contact.next_step_qualifier}` : ''}
        </Text>
      )}
      {first && (
        <Text fontSize="xs" color={subColor} noOfLines={3}>{first.header}</Text>
      )}
      {contact.refresh_in_flight && (
        <Text fontSize="2xs" color={refreshColor} mt={1}>↻ refresh queued (subscription compute)</Text>
      )}
    </Box>
  );
}
