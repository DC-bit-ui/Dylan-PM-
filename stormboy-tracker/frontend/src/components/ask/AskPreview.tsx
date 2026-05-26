import {
  Box,
  Button,
  Code,
  Flex,
  Heading,
  HStack,
  IconButton,
  List,
  ListItem,
  Spinner,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { useEffect, useRef, useState } from 'react';
import type { AskPromptResponse } from '@/types/askPrompts';
import { askPromptsClient } from '@/services/askPromptsClient';
import { copyToClipboard, openClaudeDesktop } from '@/utils/claudeDeepLink';
import { recordRecentPrompt } from '@/hooks/useRecentAsk';

interface AskPreviewProps {
  questionId: string;
  onClose: () => void;
}

export function AskPreview({ questionId, onClose }: AskPreviewProps) {
  const [prompt, setPrompt] = useState<AskPromptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [editedPrompt, setEditedPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();

  const bg = useColorModeValue('white', 'gray.800');
  const labelColor = 'brand.500';
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const taBg = useColorModeValue('gray.50', 'gray.900');
  const taBorder = useColorModeValue('gray.300', 'gray.600');
  const sourceItemBg = useColorModeValue('gray.50', 'gray.900');
  const sourceItemBorder = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    askPromptsClient
      .prompt(questionId)
      .then((d) => {
        if (cancelled) return;
        setPrompt(d);
        setEditedPrompt(d.prompt);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [questionId]);

  async function handleFire() {
    if (!prompt) return;
    try {
      await copyToClipboard(editedPrompt);
    } catch (_) {
      // ignore; deep link below is the primary path
    }
    const result = openClaudeDesktop(editedPrompt);
    if (result.opened) {
      recordRecentPrompt(prompt.id, prompt.label);
      toast({
        title: 'Opened Claude Desktop',
        description: prompt.label,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } else {
      toast({
        title: 'Prompt too long for direct launch',
        description: 'Copied to clipboard — paste in Claude Desktop manually.',
        status: 'warning',
        duration: 7000,
        isClosable: true,
      });
    }
  }

  async function handleCopy() {
    try {
      await copyToClipboard(editedPrompt);
      toast({ title: 'Copied', status: 'success', duration: 1500 });
    } catch (_) {
      toast({ title: 'Copy failed', status: 'error', duration: 3000 });
    }
  }

  if (error) {
    return (
      <Box bg={bg} border="1.5px solid" borderColor="red.300" rounded="lg" p={4} mb={4}>
        <Text color="red.500" fontSize="sm">
          Couldn't load prompt: {error.message}
        </Text>
        <Button mt={2} size="sm" variant="ghost" onClick={onClose}>
          Close
        </Button>
      </Box>
    );
  }

  return (
    <Box
      bg={bg}
      border="1.5px solid"
      borderColor="brand.500"
      rounded="lg"
      p={5}
      mb={4}
      boxShadow="0 4px 16px rgba(45, 106, 79, 0.10)"
    >
      <Flex justify="space-between" align="flex-start" mb={3}>
        <Box>
          <Text
            fontSize="xs"
            fontWeight={800}
            textTransform="uppercase"
            letterSpacing="0.6px"
            color={labelColor}
          >
            Preview
          </Text>
          <Heading size="sm" letterSpacing="-0.2px" mt={0.5}>
            {prompt?.label || (loading ? 'Loading…' : '')}
          </Heading>
        </Box>
        <IconButton
          aria-label="Close preview"
          icon={<CloseIcon boxSize={3} />}
          size="sm"
          variant="ghost"
          onClick={onClose}
        />
      </Flex>

      {loading ? (
        <HStack p={4}>
          <Spinner size="sm" color="brand.500" />
          <Text fontSize="sm" color={subColor}>
            Loading prompt…
          </Text>
        </HStack>
      ) : prompt ? (
        <>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={3}>
            <Box flex="1" minW={0}>
              <Text
                as="label"
                display="block"
                fontSize="xs"
                fontWeight={700}
                textTransform="uppercase"
                letterSpacing="0.5px"
                color={subColor}
                mb={1}
              >
                Prompt (editable — your edits ship to Claude)
              </Text>
              <Textarea
                ref={textareaRef}
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                fontFamily="ui-monospace, Consolas, monospace"
                fontSize="xs"
                lineHeight={1.55}
                bg={taBg}
                borderColor={taBorder}
                _focus={{ borderColor: 'brand.500' }}
                minH="240px"
                resize="vertical"
              />
            </Box>
            <Box w={{ base: 'full', md: '240px' }} flexShrink={0}>
              <Text
                as="label"
                display="block"
                fontSize="xs"
                fontWeight={700}
                textTransform="uppercase"
                letterSpacing="0.5px"
                color={subColor}
                mb={1}
              >
                Bus files Claude will read
              </Text>
              <List spacing={1}>
                {(prompt.brain_sources || []).length === 0 ? (
                  <ListItem
                    fontSize="xs"
                    color={subColor}
                    fontStyle="italic"
                    bg={sourceItemBg}
                    border="1px solid"
                    borderColor={sourceItemBorder}
                    rounded="sm"
                    px={2}
                    py={1}
                  >
                    no source files specified — Claude will use its own context
                  </ListItem>
                ) : (
                  prompt.brain_sources!.map((s) => (
                    <ListItem
                      key={s}
                      fontSize="xs"
                      bg={sourceItemBg}
                      border="1px solid"
                      borderColor={sourceItemBorder}
                      rounded="sm"
                      px={2}
                      py={1}
                    >
                      <Code fontSize="xs" bg="transparent" p={0}>
                        {s}
                      </Code>
                    </ListItem>
                  ))
                )}
              </List>
              <Text fontSize="xs" color={subColor} mt={2}>
                {(prompt.brain_sources || []).length} file
                {(prompt.brain_sources || []).length === 1 ? '' : 's'} · ~
                {Math.round(editedPrompt.length / 4)} tokens
              </Text>
            </Box>
          </Flex>
          <HStack spacing={2} flexWrap="wrap">
            <Button colorScheme="brand" size="sm" onClick={handleFire}>
              Open in Claude Desktop →
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              Copy prompt
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} color={subColor}>
              Cancel
            </Button>
          </HStack>
        </>
      ) : null}
    </Box>
  );
}
