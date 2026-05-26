import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Collapse,
  Flex,
  Heading,
  HStack,
  Stack,
  Tag,
  Text,
  Textarea,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import type { Exemplar, ExemplarAction } from '@/types/work';
import { classifyAction, heatIcon, heatTone } from '@/utils/workClassify';
import { workClient } from '@/services/workClient';

function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => {
    if (o && typeof o === 'object') return (o as Record<string, unknown>)[k];
    return undefined;
  }, obj);
}

interface ExemplarCardProps {
  exemplar: Exemplar;
}

export function ExemplarCard({ exemplar: ex }: ExemplarCardProps) {
  const { isOpen, onToggle } = useDisclosure();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const stepBg = useColorModeValue('gray.50', 'gray.900');
  const heroBg = useColorModeValue('brand.50', 'brand.900');
  const heroColor = useColorModeValue('brand.700', 'brand.200');
  const heroBorder = useColorModeValue('brand.200', 'brand.700');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const draftBg = useColorModeValue('yellow.50', 'yellow.900');
  const draftBorder = useColorModeValue('yellow.200', 'yellow.700');
  const cfGoodBg = useColorModeValue('green.50', 'green.900');
  const cfBadBg = useColorModeValue('red.50', 'red.900');

  const tone = heatTone(ex.heat);
  const icon = heatIcon(ex.heat);
  const cls = classifyAction(ex.next_step_short);

  async function runAction(action: ExemplarAction) {
    try {
      setBusy(true);
      if (action.type === 'copy') {
        const val = action.payload_field
          ? String(getByPath(ex, action.payload_field) ?? '')
          : String(action.payload ?? '');
        await navigator.clipboard.writeText(val);
        toast({ title: 'Copied to clipboard', status: 'success', duration: 1500 });
      } else if (action.type === 'mailto') {
        const p = (action.payload || {}) as Record<string, unknown>;
        const subject = p.subject_field
          ? String(getByPath(ex, p.subject_field as string) ?? '')
          : String(p.subject ?? '');
        const body = p.body_field
          ? String(getByPath(ex, p.body_field as string) ?? '')
          : String(p.body ?? '');
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      } else if (action.type === 'open_url') {
        window.open(String(action.payload || ''), '_blank', 'noopener');
      } else if (action.type === 'bus_write') {
        await workClient.recordAction({
          exemplar_id: ex.id,
          label: action.label,
          payload: action.payload,
        });
        toast({ title: `Recorded: ${action.label}`, status: 'success', duration: 1500 });
      } else if (action.type === 'expand') {
        onToggle();
      } else {
        toast({ title: `Unhandled action type: ${action.type}`, status: 'warning' });
      }
    } catch (e) {
      toast({ title: 'Action failed', description: (e as Error).message, status: 'error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      rounded="md"
      overflow="hidden"
      _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
      transition="border-color 0.15s"
    >
      {/* Collapsed header */}
      <Flex p={4} gap={3} align="flex-start" cursor="pointer" onClick={onToggle}>
        <Tooltip label={ex.heat}>
          <Box
            w={2}
            h={2}
            bg={`${tone}.400`}
            rounded="full"
            mt={1.5}
            flexShrink={0}
          />
        </Tooltip>
        <Box flex={1} minW={0}>
          <HStack mb={1} flexWrap="wrap" spacing={2}>
            <Heading size="sm" letterSpacing="-0.2px" noOfLines={1}>
              {ex.title}
            </Heading>
            {ex.kind && (
              <Badge fontSize="2xs" variant="subtle" colorScheme="gray">
                {String(ex.kind).replace(/_/g, ' ')}
              </Badge>
            )}
          </HStack>
          {ex.next_step_short ? (
            <Text fontSize="sm" color={subColor}>
              <Text as="span" color={`${tone}.500`} mr={2}>
                →
              </Text>
              {ex.next_step_short}
            </Text>
          ) : (
            <Text fontSize="sm" color={subColor} fontStyle="italic">
              … Diagnosis pending
            </Text>
          )}
          {ex.next_step_qualifier && (
            <Text fontSize="xs" color={subColor} mt={1}>
              {ex.next_step_qualifier}
            </Text>
          )}
        </Box>
        <HStack spacing={2} flexShrink={0}>
          {ex.assigned_to_name && (
            <Tag size="sm" colorScheme="brand" variant="subtle">
              {ex.assigned_to_name}
            </Tag>
          )}
          <Button
            size="xs"
            variant="ghost"
            rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isOpen ? 'Less' : 'More'}
          </Button>
        </HStack>
      </Flex>

      {/* Expanded body */}
      <Collapse in={isOpen} animateOpacity>
        <Box px={4} pb={4} borderTop="1px solid" borderColor={cardBorder}>
          {ex.subtitle && (
            <Box mt={3} fontSize="xs" color={labelColor}>
              <Text as="span" fontWeight={700} mr={1}>
                Context
              </Text>
              {ex.subtitle}
            </Box>
          )}

          {/* Hero do-this-next */}
          {ex.next_step_short && (
            <Flex
              mt={3}
              p={3}
              gap={3}
              bg={heroBg}
              color={heroColor}
              border="1px solid"
              borderColor={heroBorder}
              rounded="md"
              align="flex-start"
              data-action-type={cls.type}
            >
              <Text fontSize="lg" lineHeight={1}>
                {cls.icon}
              </Text>
              <Box flex={1}>
                <HStack mb={0.5}>
                  <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px">
                    Do this next
                  </Text>
                  <Tag size="sm" colorScheme="brand" variant="solid" fontSize="2xs">
                    {cls.label}
                  </Tag>
                </HStack>
                <Text fontSize="sm" fontWeight={600} lineHeight={1.4}>
                  {ex.next_step_short}
                </Text>
                {ex.next_step_qualifier && (
                  <Text fontSize="xs" mt={1} opacity={0.8}>
                    {ex.next_step_qualifier}
                  </Text>
                )}
              </Box>
              <Text fontSize="lg" lineHeight={1}>
                {icon}
              </Text>
            </Flex>
          )}

          {/* Diagnosis steps */}
          <Box mt={4}>
            <Text fontSize="xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor} mb={2}>
              Diagnosis · 3 steps down
            </Text>
            {ex.diagnosis && ex.diagnosis.length > 0 ? (
              <Stack spacing={2}>
                {ex.diagnosis.map((s) => (
                  <Flex key={String(s.step)} bg={stepBg} rounded="sm" p={3} gap={3}>
                    <Box
                      flexShrink={0}
                      w={6}
                      h={6}
                      rounded="full"
                      bg={`${tone}.500`}
                      color="white"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="xs"
                      fontWeight={800}
                    >
                      {s.step}
                    </Box>
                    <Box flex={1}>
                      <Text fontSize="xs" fontWeight={700} mb={0.5}>
                        {s.header}
                      </Text>
                      <Text fontSize="xs" color={labelColor}>
                        {s.body}
                      </Text>
                    </Box>
                  </Flex>
                ))}
              </Stack>
            ) : (
              <Text fontSize="xs" color={subColor} fontStyle="italic">
                {ex.diagnosis_pending
                  ? 'Diagnosis generating… check back in a few minutes.'
                  : 'No diagnosis on file. Use Re-derive to generate one from the live timeline.'}
              </Text>
            )}
          </Box>

          {/* Counterfactual */}
          {ex.counterfactual && (
            <Box mt={4}>
              <Text fontSize="xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor} mb={2}>
                Counterfactual · act vs don't
              </Text>
              <Flex gap={2} flexDir={{ base: 'column', md: 'row' }}>
                <Box bg={cfGoodBg} rounded="sm" p={3} flex={1}>
                  <Text fontSize="2xs" fontWeight={700} textTransform="uppercase" letterSpacing="0.4px" mb={1}>
                    If you act now
                  </Text>
                  <Text fontSize="xs">{ex.counterfactual.if_act_now}</Text>
                </Box>
                <Box bg={cfBadBg} rounded="sm" p={3} flex={1}>
                  <Text fontSize="2xs" fontWeight={700} textTransform="uppercase" letterSpacing="0.4px" mb={1}>
                    If you don't
                  </Text>
                  <Text fontSize="xs">{ex.counterfactual.if_dont_act}</Text>
                </Box>
              </Flex>
              {ex.counterfactual.data_quality && (
                <Text fontSize="2xs" color={subColor} mt={1.5}>
                  Data quality: {ex.counterfactual.data_quality}
                </Text>
              )}
            </Box>
          )}

          {/* One question */}
          {ex.one_question && (
            <Box mt={4} p={3} bg={stepBg} rounded="sm">
              <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor} mb={1}>
                One question to answer first
              </Text>
              <Text fontSize="sm">{ex.one_question}</Text>
            </Box>
          )}

          {/* Evidence */}
          {ex.evidence && ex.evidence.length > 0 && (
            <Box mt={4}>
              <Text fontSize="xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px" color={labelColor} mb={2}>
                Other signals
              </Text>
              <Stack spacing={2}>
                {ex.evidence.map((e, i) => (
                  <Box key={i} bg={stepBg} rounded="sm" p={3}>
                    <Text fontSize="2xs" fontWeight={700} textTransform="uppercase" letterSpacing="0.4px" color={subColor} mb={0.5}>
                      {e.source}
                    </Text>
                    <Text fontSize="xs">{e.content}</Text>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Draft */}
          {ex.draft && (
            <Box mt={4} bg={draftBg} border="1px solid" borderColor={draftBorder} rounded="md" p={3}>
              <HStack mb={2}>
                <Text fontSize="2xs" fontWeight={800} textTransform="uppercase" letterSpacing="0.5px">
                  {ex.draft.label || `Draft (${ex.draft.kind || 'email'})`}
                </Text>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(ex.draft?.body || '');
                    toast({ title: 'Draft copied', status: 'success', duration: 1500 });
                  }}
                >
                  Copy body
                </Button>
              </HStack>
              {ex.draft.to && (
                <Text fontSize="xs" mb={1}>
                  <Text as="span" fontWeight={700}>To:</Text> {ex.draft.to}
                  {ex.draft.to_placeholder && (
                    <Text as="span" fontStyle="italic" color="red.600" ml={1}>
                      (placeholder — replace with real address)
                    </Text>
                  )}
                </Text>
              )}
              {ex.draft.subject && (
                <Text fontSize="xs" mb={1}>
                  <Text as="span" fontWeight={700}>Subject:</Text> {ex.draft.subject}
                </Text>
              )}
              <Textarea
                value={ex.draft.body}
                fontSize="xs"
                fontFamily="mono"
                size="sm"
                rows={Math.min(12, ex.draft.body.split('\n').length + 1)}
                readOnly
                bg={cardBg}
              />
            </Box>
          )}

          {/* Actions */}
          {((ex.actions && ex.actions.length > 0) || ex.hubspot_url) && (
            <ButtonGroup mt={4} size="sm" spacing={2} flexWrap="wrap">
              {(ex.actions || []).map((a, i) => (
                <Button
                  key={`${a.label}-${i}`}
                  colorScheme={i === 0 ? 'brand' : 'gray'}
                  variant={i === 0 ? 'solid' : 'outline'}
                  isDisabled={busy}
                  onClick={() => runAction(a)}
                >
                  {a.label}
                </Button>
              ))}
              {ex.hubspot_url && !(ex.actions || []).some((a) => a.type === 'open_url') && (
                <Button
                  as="a"
                  href={ex.hubspot_url}
                  target="_blank"
                  rel="noreferrer"
                  variant="outline"
                  rightIcon={<ExternalLinkIcon />}
                >
                  HubSpot
                </Button>
              )}
            </ButtonGroup>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
