import {
  Badge,
  Box,
  Code,
  Collapse,
  Divider,
  Heading,
  HStack,
  List,
  ListItem,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  Button,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import type { CustomerTheme } from '@/types/customerThemes';
import { renderInlineMarkdown } from '@/utils/renderInlineMarkdown';
import { EvidencePills } from './EvidencePills';

// Marketing-grade theme card. Leads with the campaign-ready assets
// (headline, marketing angle, supporting quote). Source evidence
// collapses into a drawer so the actionable view isn't crowded by
// raw customer positions.

interface ThemeCardProps {
  theme: CustomerTheme;
}

function landBadge(theme: CustomerTheme): { label: string; scheme: string } {
  if (theme.land_rate >= 90) return { label: `${theme.land_rate}% lands`, scheme: 'green' };
  if (theme.land_rate >= 60) return { label: `${theme.land_rate}% lands`, scheme: 'yellow' };
  if (theme.friction_count > 0) {
    return { label: `${theme.friction_count} friction · ${theme.land_rate}% lands`, scheme: 'red' };
  }
  return { label: `${theme.land_rate}% lands`, scheme: 'gray' };
}

function MarkdownText({ children }: { children: string }) {
  const segments = renderInlineMarkdown(children);
  return (
    <>
      {segments.map((s, i) =>
        s.bold ? (
          <Text as="strong" key={i} fontWeight={700}>
            {s.text}
          </Text>
        ) : (
          <Text as="span" key={i}>
            {s.text}
          </Text>
        ),
      )}
    </>
  );
}

export function ThemeCard({ theme }: ThemeCardProps) {
  const { isOpen, onToggle } = useDisclosure();
  const cardBg = useColorModeValue('white', 'gray.800');
  const headlineBg = useColorModeValue('gray.50', 'gray.900');
  const headlineBorderLight =
    theme.friction_count > 0 ? 'red.500' : theme.land_rate >= 75 ? 'brand.500' : 'orange.400';
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const supportBg = useColorModeValue(
    theme.friction_count > 0 ? 'red.50' : 'brand.50',
    theme.friction_count > 0 ? 'red.900' : 'brand.900',
  );
  const labelColor =
    theme.friction_count > 0
      ? 'red.500'
      : theme.land_rate >= 75
        ? 'brand.500'
        : 'orange.500';
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const badge = landBadge(theme);
  const hasMarketing =
    !!theme.marketing_angle ||
    !!theme.headline_candidate ||
    !!theme.supporting_quote;

  return (
    <Box bg={cardBg} border="1px solid" borderColor={borderColor} rounded="md" p={4}>
      <HStack justify="space-between" align="flex-start" spacing={3} mb={2}>
        <Box flex="1" minW={0}>
          <Heading size="sm" letterSpacing="-0.2px" mb={0.5}>
            {theme.theme}
          </Heading>
          <Text fontSize="xs" color={subColor}>
            {theme.occurrences} occurrence{theme.occurrences === 1 ? '' : 's'} ·{' '}
            {(theme.reps || ['mixed']).join(', ')}
          </Text>
          <EvidencePills theme={theme} />
        </Box>
        <Badge colorScheme={badge.scheme} fontSize="2xs" px={2} py={1} rounded="full" whiteSpace="nowrap">
          {badge.label}
        </Badge>
      </HStack>

      {theme.headline_candidate && (
        <Box
          bg={headlineBg}
          borderLeft="3px solid"
          borderColor={headlineBorderLight}
          rounded="sm"
          p={3}
          my={3}
        >
          <Text fontSize="md" fontWeight={700} fontStyle="italic" letterSpacing="-0.3px" lineHeight={1.35}>
            "{theme.headline_candidate}"
          </Text>
        </Box>
      )}

      {theme.marketing_angle && (
        <HStack align="baseline" spacing={2} my={2}>
          <Text
            fontSize="2xs"
            fontWeight={800}
            textTransform="uppercase"
            letterSpacing="0.5px"
            color={labelColor}
            flexShrink={0}
          >
            Campaign hook
          </Text>
          <Text fontSize="sm" lineHeight={1.5}>
            {theme.marketing_angle}
          </Text>
        </HStack>
      )}

      {theme.supporting_quote && (
        <Box bg={supportBg} rounded="sm" p={3} my={2}>
          <Text
            fontSize="2xs"
            fontWeight={800}
            textTransform="uppercase"
            letterSpacing="0.5px"
            color={labelColor}
            mb={1}
          >
            Customer voice
          </Text>
          <Text fontSize="sm" lineHeight={1.5}>
            "{theme.supporting_quote}"
          </Text>
        </Box>
      )}

      <Button
        variant="ghost"
        size="xs"
        onClick={onToggle}
        rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        mt={2}
        color={subColor}
      >
        Source evidence ({(theme.customer_positions || []).length} customer position
        {theme.customer_positions.length === 1 ? '' : 's'}
        {theme.member_labels.length > 1 ? ` · ${theme.member_labels.length} topic variants` : ''})
      </Button>

      <Collapse in={isOpen} animateOpacity>
        <Stack spacing={3} mt={3}>
          {!hasMarketing && (
            <Text fontSize="xs" color={subColor} fontStyle="italic">
              No marketing-grade fields yet — the clustering bundle is pending. The customer
              positions below are what'll be clustered.
            </Text>
          )}
          {theme.customer_positions.length > 0 && (
            <Box>
              <Text
                fontSize="2xs"
                fontWeight={800}
                textTransform="uppercase"
                letterSpacing="0.5px"
                color={subColor}
                mb={1}
              >
                Customer positions ({theme.customer_positions.length})
              </Text>
              <List spacing={1}>
                {theme.customer_positions.slice(0, 8).map((cp, i) => (
                  <ListItem key={i} fontSize="xs" lineHeight={1.5}>
                    <Text as="span" color={subColor}>
                      "
                    </Text>
                    <MarkdownText>{cp.text}</MarkdownText>
                    <Text as="span" color={subColor}>
                      " — {cp.rep || 'mixed'} · {cp.surface || 'unknown'}
                      {cp.landed && cp.landed !== 'unknown' ? ` · ${cp.landed}` : ''}
                    </Text>
                  </ListItem>
                ))}
                {theme.customer_positions.length > 8 && (
                  <ListItem fontSize="xs" color={subColor} fontStyle="italic">
                    +{theme.customer_positions.length - 8} more
                  </ListItem>
                )}
              </List>
            </Box>
          )}
          {theme.member_labels.length > 1 && (
            <>
              <Divider />
              <Box>
                <Text
                  fontSize="2xs"
                  fontWeight={800}
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                  color={subColor}
                  mb={1}
                >
                  Topic-label variants the clustering merged ({theme.member_labels.length})
                </Text>
                <List spacing={1}>
                  {theme.member_labels.slice(0, 6).map((l, i) => (
                    <ListItem key={i} fontSize="xs">
                      <Code fontSize="2xs" bg="transparent" p={0}>
                        {l}
                      </Code>
                    </ListItem>
                  ))}
                  {theme.member_labels.length > 6 && (
                    <ListItem fontSize="xs" color={subColor} fontStyle="italic">
                      +{theme.member_labels.length - 6} more
                    </ListItem>
                  )}
                </List>
              </Box>
            </>
          )}
        </Stack>
      </Collapse>
    </Box>
  );
}
