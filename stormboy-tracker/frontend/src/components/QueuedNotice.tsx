import { Alert, AlertIcon, Box, Text, useColorModeValue } from '@chakra-ui/react';

// Transparency banner for bundle-backed surfaces. Analytic synthesis now runs
// on subscription compute (intelligence bundles), so a refresh can be "queued"
// (in flight) rather than instant. This makes the wait visible instead of
// silently showing stale/ungrouped data as if it were final.
interface QueuedNoticeProps {
  status?: 'queued' | 'completed';
  // When the displayed data was last produced (ISO). Shown as an "as of" line.
  asOf?: string | null;
  // What's being computed, e.g. "Themes", "Diagnoses". Used in the copy.
  resource?: string;
  // Optional bundle id for traceability.
  bundleId?: string | null;
}

function fmtAsOf(iso?: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return null;
  }
}

export function QueuedNotice({ status, asOf, resource = 'This view', bundleId }: QueuedNoticeProps) {
  const subColor = useColorModeValue('gray.600', 'gray.400');
  const asOfStr = fmtAsOf(asOf);

  if (status === 'queued') {
    return (
      <Alert status="info" rounded="md" mb={4} alignItems="flex-start">
        <AlertIcon />
        <Box>
          <Text fontSize="sm" fontWeight={600}>
            {resource} is refreshing in the background.
          </Text>
          <Text fontSize="xs" color={subColor}>
            A re-compute is queued on subscription compute (intelligence bundle
            {bundleId ? ` ${bundleId}` : ''}). Showing the last result
            {asOfStr ? ` from ${asOfStr}` : ''} meanwhile — it'll update on the next refresh once processed.
          </Text>
        </Box>
      </Alert>
    );
  }

  if (asOfStr) {
    return (
      <Text fontSize="xs" color={subColor} mb={3}>
        Data as of {asOfStr}.
      </Text>
    );
  }

  return null;
}
