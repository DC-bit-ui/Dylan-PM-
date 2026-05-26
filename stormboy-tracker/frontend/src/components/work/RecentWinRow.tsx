import {
  Badge,
  Box,
  Collapse,
  Flex,
  HStack,
  Link,
  ListItem,
  Text,
  UnorderedList,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import type { RecentWin } from '@/types/work';

function fmtDate(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  } catch {
    return '—';
  }
}

export function RecentWinRow({ win }: { win: RecentWin }) {
  const { isOpen, onToggle } = useDisclosure();
  const ha = win.estimated_project_ha || win.total_property_hectares;
  const haStr = ha ? `${Math.round(ha).toLocaleString()}ha` : '—';
  const closedDate = fmtDate(win.closedate);
  const a = win.analysis || {};
  const daySoon = win.days_to_close !== null && win.days_to_close !== undefined && win.days_to_close <= 60;

  const rowBg = useColorModeValue('white', 'gray.800');
  const rowBorder = useColorModeValue('gray.200', 'gray.700');
  const rowHover = useColorModeValue('gray.50', 'gray.700');
  const dayBg = useColorModeValue(daySoon ? 'brand.50' : 'gray.100', daySoon ? 'brand.900' : 'gray.700');
  const dayColor = useColorModeValue(daySoon ? 'brand.700' : 'gray.700', daySoon ? 'brand.200' : 'gray.200');
  const drawerBg = useColorModeValue('gray.50', 'gray.900');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const stormboyRing = win.channel?.stormboy ? '2px solid' : '1px solid';
  const stormboyColor = useColorModeValue('orange.300', 'orange.500');

  return (
    <Box
      bg={rowBg}
      border={stormboyRing}
      borderColor={win.channel?.stormboy ? stormboyColor : rowBorder}
      rounded="md"
      overflow="hidden"
    >
      <Flex
        p={3}
        gap={3}
        align="center"
        cursor="pointer"
        onClick={onToggle}
        _hover={{ bg: rowHover }}
      >
        <Box
          flexShrink={0}
          minW="44px"
          bg={dayBg}
          color={dayColor}
          fontSize="xs"
          fontWeight={700}
          textAlign="center"
          px={2}
          py={1.5}
          rounded="sm"
        >
          {win.days_to_close ?? '—'}d
        </Box>
        <Box flex={1} minW={0}>
          <Text fontSize="sm" fontWeight={600} noOfLines={1}>
            {win.deal_name || '(no name)'}
          </Text>
          <HStack mt={0.5} spacing={1} flexWrap="wrap">
            {win.channel?.stormboy && (
              <Badge fontSize="2xs" colorScheme="orange" variant="solid">
                Stormboy
              </Badge>
            )}
            {win.channel?.partner && (
              <Badge fontSize="2xs" colorScheme="purple" variant="subtle">
                {win.channel.partner}
              </Badge>
            )}
            {!win.channel?.stormboy && !win.channel?.partner && (
              <Badge fontSize="2xs" colorScheme="gray" variant="subtle">
                direct
              </Badge>
            )}
          </HStack>
          <Text fontSize="2xs" color={labelColor} mt={0.5}>
            {haStr} · closed {closedDate}
          </Text>
        </Box>
        {win.hubspot_url && (
          <Link href={win.hubspot_url} isExternal onClick={(e) => e.stopPropagation()} fontSize="sm">
            <ExternalLinkIcon />
          </Link>
        )}
      </Flex>
      <Collapse in={isOpen} animateOpacity>
        <Box bg={drawerBg} p={3} borderTop="1px solid" borderColor={rowBorder}>
          <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor} mb={1}>
            Why this won
          </Text>
          <Text fontSize="sm" mb={a.replicable_pattern?.length ? 3 : 0}>
            {a.one_line_why || '(no analysis on file)'}
          </Text>
          {a.replicable_pattern && a.replicable_pattern.length > 0 && (
            <Box>
              <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor} mb={1}>
                How to replicate
              </Text>
              <UnorderedList fontSize="xs" spacing={0.5} pl={4}>
                {a.replicable_pattern.map((p, i) => (
                  <ListItem key={i}>{p}</ListItem>
                ))}
              </UnorderedList>
            </Box>
          )}
          {a.key_moment && (
            <Box mt={3}>
              <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor} mb={1}>
                Key moment
              </Text>
              <Text fontSize="xs" fontStyle="italic">
                {a.key_moment}
              </Text>
            </Box>
          )}
          {a.confidence && (
            <Badge mt={3} fontSize="2xs" colorScheme={a.confidence === 'high' ? 'green' : a.confidence === 'low' ? 'red' : 'yellow'}>
              {a.confidence} confidence
            </Badge>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
