import { Tag, Wrap, WrapItem, Tooltip } from '@chakra-ui/react';
import type { CustomerTheme } from '@/types/customerThemes';

// Per-theme evidence-mix pills. Interview / standup signal carries
// a green "team-reflected" badge — those themes have been
// independently validated through reflection, not just observed in
// a transcript chunk.

const SURFACE_SCHEME: Record<string, string> = {
  interview: 'green',
  standup: 'orange',
  'farm visit': 'yellow',
  call: 'blue',
  email: 'purple',
  'manual-note': 'green',
};

export function EvidencePills({ theme }: { theme: CustomerTheme }) {
  const counts: Record<string, number> = {};
  (theme.customer_positions || []).forEach((cp) => {
    const s = cp.surface || 'unknown';
    counts[s] = (counts[s] || 0) + 1;
  });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return null;
  const surfaces = theme.surfaces || [];
  const isReflected = surfaces.includes('interview') || surfaces.includes('standup');
  return (
    <Wrap spacing={1} mt={1}>
      {entries.map(([surface, count]) => (
        <WrapItem key={surface}>
          <Tooltip label={`${count} ${surface} occurrence${count === 1 ? '' : 's'}`} placement="top">
            <Tag
              size="sm"
              variant="subtle"
              colorScheme={SURFACE_SCHEME[surface] || 'gray'}
              fontSize="2xs"
              fontWeight={600}
              textTransform="uppercase"
              letterSpacing="0.4px"
            >
              {surface} · {count}
            </Tag>
          </Tooltip>
        </WrapItem>
      ))}
      {isReflected && (
        <WrapItem>
          <Tooltip
            label="Validated through team reflection — interview or standup mention, not just transcript chunk"
            placement="top"
          >
            <Tag size="sm" colorScheme="green" fontSize="2xs" fontWeight={700} letterSpacing="0.4px">
              ✓ team-reflected
            </Tag>
          </Tooltip>
        </WrapItem>
      )}
    </Wrap>
  );
}
