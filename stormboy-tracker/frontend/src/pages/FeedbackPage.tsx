import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFeedback } from '@/hooks/useFeedback';
import { feedbackClient } from '@/services/feedbackClient';
import type {
  FeedbackEntry,
  FeedbackSeverity,
  FeedbackStatus,
  FeedbackType,
} from '@/types/feedback';

const TYPES: { v: FeedbackType; label: string }[] = [
  { v: 'error', label: 'Error · system got this wrong' },
  { v: 'correction', label: 'Correction · fact needs updating' },
  { v: 'preference', label: 'Preference · how I want this to work' },
  { v: 'comment', label: 'Comment · just noting this' },
];
const TARGET_KINDS = [
  { v: 'system', label: 'System (general)' },
  { v: 'suggestion', label: 'Suggestion the system made' },
  { v: 'deal', label: 'Specific deal' },
  { v: 'contact', label: 'Specific contact' },
  { v: 'persona', label: 'Persona / rep profile' },
  { v: 'pattern', label: 'Pattern in the bus' },
] as const;
const SEVERITIES: { v: FeedbackSeverity; label: string }[] = [
  { v: 'low', label: 'Low — nice-to-have' },
  { v: 'medium', label: 'Medium — bug but not blocking' },
  { v: 'high', label: 'High — actively wrong / urgent' },
];
const STATUSES: FeedbackStatus[] = ['open', 'in_progress', 'resolved', 'wontfix'];
const FILTERS: { v: string; label: string }[] = [
  { v: '', label: 'All' },
  { v: 'open', label: 'Open' },
  { v: 'in_progress', label: 'In progress' },
  { v: 'resolved', label: 'Resolved' },
  { v: 'wontfix', label: "Won't fix" },
];

const TYPE_SCHEME: Record<string, string> = { error: 'red', correction: 'orange', preference: 'blue', comment: 'gray' };
const SEV_SCHEME: Record<string, string> = { high: 'red', medium: 'orange', low: 'gray' };
const STATUS_SCHEME: Record<string, string> = { open: 'yellow', in_progress: 'blue', resolved: 'green', wontfix: 'gray' };

const schema = z.object({
  type: z.enum(['error', 'correction', 'preference', 'comment']),
  target_kind: z.enum(['system', 'suggestion', 'deal', 'contact', 'persona', 'pattern']),
  target_id: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high']),
  title: z.string().min(1, 'A one-line summary is required').max(200, 'Keep it under 200 characters'),
  body: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function ageDays(iso: string): string {
  const d = (Date.now() - Date.parse(iso)) / 86400000;
  if (!Number.isFinite(d)) return '';
  if (d < 1) return 'today';
  return `${Math.floor(d)}d ago`;
}

export function FeedbackPage() {
  const [filter, setFilter] = useState('');
  const { data, loading, error, refetch } = useFeedback(filter || undefined);
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const toast = useToast();

  const {
    register, handleSubmit, reset, formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'error', target_kind: 'system', severity: 'medium', title: '', body: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await feedbackClient.create({
        ...values,
        target_id: values.target_id?.trim() || undefined,
        system_context: { source_view: '/v3/feedback', captured_at: new Date().toISOString() },
      });
      toast({ title: 'Feedback saved', status: 'success', duration: 3000 });
      reset();
      refetch();
    } catch (e) {
      toast({ title: 'Save failed', description: (e as Error).message, status: 'error', duration: 6000 });
    }
  };

  const stats = data?.stats;

  return (
    <Box>
      <Box mb={4}>
        <Heading size="lg" letterSpacing="-0.5px" mb={1}>Feedback</Heading>
        <Text fontSize="sm" color={subColor}>
          Report what the system got wrong, a fact that needs correcting, or how you want something
          to work — then triage the queue. Coaching engines check open <em>error</em> feedback for a
          target before generating fresh suggestions.
        </Text>
      </Box>

      {stats && (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={5}>
          {(['open', 'in_progress', 'resolved', 'wontfix'] as FeedbackStatus[]).map((s) => (
            <Box key={s} bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={3}>
              <Text fontSize="2xs" color={subColor} textTransform="uppercase" letterSpacing="0.5px">
                {s.replace('_', ' ')}
              </Text>
              <Text fontSize="2xl" fontWeight={800}>{stats[s]}</Text>
            </Box>
          ))}
        </SimpleGrid>
      )}

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Submit form */}
        <Box as="form" onSubmit={handleSubmit(onSubmit)} bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={4}>
          <Heading size="sm" mb={3}>Report or comment</Heading>
          <Stack spacing={3}>
            <SimpleGrid columns={2} spacing={3}>
              <FormControl>
                <FormLabel fontSize="xs" mb={1}>Type</FormLabel>
                <Select size="sm" {...register('type')}>
                  {TYPES.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" mb={1}>Severity</FormLabel>
                <Select size="sm" {...register('severity')}>
                  {SEVERITIES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
                </Select>
              </FormControl>
            </SimpleGrid>
            <SimpleGrid columns={2} spacing={3}>
              <FormControl>
                <FormLabel fontSize="xs" mb={1}>About</FormLabel>
                <Select size="sm" {...register('target_kind')}>
                  {TARGET_KINDS.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" mb={1}>Target ID <Text as="span" color={subColor}>(optional)</Text></FormLabel>
                <Input size="sm" placeholder="deal_id, slug…" {...register('target_id')} />
              </FormControl>
            </SimpleGrid>
            <FormControl isInvalid={!!errors.title} isRequired>
              <FormLabel fontSize="xs" mb={1}>Title</FormLabel>
              <Input size="sm" placeholder="One-line summary" {...register('title')} />
              <FormErrorMessage fontSize="xs">{errors.title?.message}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs" mb={1}>Detail <Text as="span" color={subColor}>(what's wrong / what you want / context)</Text></FormLabel>
              <Textarea size="sm" rows={4} {...register('body')} />
            </FormControl>
            <Button type="submit" colorScheme="brand" size="sm" isLoading={isSubmitting} alignSelf="flex-start">
              Save feedback
            </Button>
          </Stack>
        </Box>

        {/* Triage list */}
        <Box>
          <Flex align="center" justify="space-between" mb={3} wrap="wrap" gap={2}>
            <Heading size="sm">Triage queue</Heading>
            <HStack spacing={1}>
              {FILTERS.map((f) => (
                <Button
                  key={f.v}
                  size="xs"
                  variant={filter === f.v ? 'solid' : 'outline'}
                  colorScheme={filter === f.v ? 'brand' : 'gray'}
                  onClick={() => setFilter(f.v)}
                >
                  {f.label}
                </Button>
              ))}
            </HStack>
          </Flex>

          {error && <Text fontSize="sm" color="red.400">Couldn't load feedback: {error.message}</Text>}
          {loading && !data ? (
            <Stack spacing={2}>{[1, 2, 3].map((i) => <Skeleton key={i} h="90px" rounded="md" />)}</Stack>
          ) : data && data.items.length === 0 ? (
            <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="md" p={6} textAlign="center">
              <Text fontSize="sm" color={subColor}>No feedback{filter ? ` with status "${filter}"` : ''} yet.</Text>
            </Box>
          ) : (
            <Stack spacing={2}>
              {data?.items.map((entry) => (
                <TriageRow key={entry.id} entry={entry} onUpdated={refetch} />
              ))}
            </Stack>
          )}
        </Box>
      </SimpleGrid>
    </Box>
  );
}

function TriageRow({ entry, onUpdated }: { entry: FeedbackEntry; onUpdated: () => void }) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const bodyColor = useColorModeValue('gray.700', 'gray.200');
  const [status, setStatus] = useState<FeedbackStatus>(entry.status);
  const [note, setNote] = useState(entry.resolution?.resolution_note || '');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const dirty = status !== entry.status || note !== (entry.resolution?.resolution_note || '');

  const save = async () => {
    setSaving(true);
    try {
      await feedbackClient.update(entry.id, { status, resolution_note: note.trim() || undefined });
      toast({ title: 'Updated', status: 'success', duration: 2000 });
      onUpdated();
    } catch (e) {
      toast({ title: 'Update failed', description: (e as Error).message, status: 'error', duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderLeftWidth="3px" borderLeftColor={`${SEV_SCHEME[entry.severity]}.400`} rounded="md" p={3}>
      <Flex justify="space-between" align="flex-start" gap={2} mb={1}>
        <HStack spacing={2} flexWrap="wrap">
          <Badge colorScheme={TYPE_SCHEME[entry.type]} fontSize="2xs">{entry.type}</Badge>
          <Badge colorScheme={SEV_SCHEME[entry.severity]} fontSize="2xs" variant="outline">{entry.severity}</Badge>
          <Badge colorScheme={STATUS_SCHEME[entry.status]} fontSize="2xs" variant="subtle">{entry.status.replace('_', ' ')}</Badge>
        </HStack>
        <Text fontSize="2xs" color={subColor} whiteSpace="nowrap">{ageDays(entry.created_at)}</Text>
      </Flex>
      <Text fontSize="sm" fontWeight={600} color={bodyColor}>{entry.title}</Text>
      {entry.body && <Text fontSize="xs" color={subColor} mt={1} noOfLines={3}>{entry.body}</Text>}
      <Text fontSize="2xs" color={subColor} mt={1}>
        {entry.target_kind}{entry.target_id ? ` · ${entry.target_id}` : ''} · {entry.created_by}
      </Text>

      <Flex gap={2} mt={3} align="center" wrap="wrap">
        <Select size="xs" maxW="150px" value={status} onChange={(e) => setStatus(e.target.value as FeedbackStatus)}>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </Select>
        {(status === 'resolved' || status === 'wontfix') && (
          <Input size="xs" flex={1} minW="160px" placeholder="resolution note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        )}
        {dirty && (
          <Button size="xs" colorScheme="brand" onClick={save} isLoading={saving}>Save</Button>
        )}
      </Flex>
    </Box>
  );
}
