import { Box, Link, Text, useColorModeValue } from '@chakra-ui/react';
import type { UpcomingVisit } from '@/types/stormboy';

// Compact row for the right-rail "Upcoming farm visits" list.
export function UpcomingVisitRow({ visit }: { visit: UpcomingVisit }) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const linkColor = useColorModeValue('brand.600', 'brand.300');
  const snapshotOk = visit.horizon_snapshot_created === 'Yes';
  const snapshotColor = useColorModeValue('green.600', 'green.300');
  return (
    <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" px={2} py={1.5}>
      <Text fontSize="xs" fontWeight={600} noOfLines={1}>
        <Link href={visit.hubspot_url} isExternal color={linkColor}>{visit.name}</Link>
      </Text>
      <Text fontSize="2xs" color={subColor}>
        {visit.meeting_date}
        {snapshotOk && <Text as="span" color={snapshotColor}> · HORIZON sent</Text>}
      </Text>
    </Box>
  );
}
