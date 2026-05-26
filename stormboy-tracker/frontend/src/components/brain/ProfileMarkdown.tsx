import {
  Box,
  Code,
  Divider,
  Heading,
  Link,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
  useColorModeValue,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ReactNode } from 'react';

// Renders the profile markdown using react-markdown + remark-gfm,
// with Chakra primitives as the rendered components. Anchors (id=...)
// added to headings so the TOC sidebar can link to them.

function slugify(s: string): string {
  return String(s)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function headingText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(headingText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return headingText((node as { props: { children?: ReactNode } }).props.children);
  }
  return '';
}

export function ProfileMarkdown({ markdown }: { markdown: string }) {
  const blockquoteBg = useColorModeValue('gray.50', 'gray.900');
  const blockquoteBorder = useColorModeValue('gray.300', 'gray.600');
  const codeBg = useColorModeValue('gray.100', 'gray.700');
  const linkColor = useColorModeValue('brand.600', 'brand.300');
  const subColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box className="brain-profile-md" lineHeight={1.7} fontSize="sm" color={subColor}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <Heading as="h1" size="lg" mt={4} mb={3} id={slugify(headingText(children))} color={useColorModeValue('gray.800', 'gray.100')}>
              {children}
            </Heading>
          ),
          h2: ({ children }) => (
            <Heading as="h2" size="md" mt={6} mb={2} id={slugify(headingText(children))} color={useColorModeValue('gray.800', 'gray.100')}>
              {children}
            </Heading>
          ),
          h3: ({ children }) => (
            <Heading as="h3" size="sm" mt={5} mb={2} id={slugify(headingText(children))} color={useColorModeValue('gray.700', 'gray.200')}>
              {children}
            </Heading>
          ),
          h4: ({ children }) => (
            <Heading as="h4" size="xs" mt={4} mb={1.5} id={slugify(headingText(children))} textTransform="uppercase" letterSpacing="0.4px">
              {children}
            </Heading>
          ),
          p: ({ children }) => (
            <Text as="p" mb={3} color={useColorModeValue('gray.700', 'gray.300')}>
              {children}
            </Text>
          ),
          ul: ({ children }) => (
            <UnorderedList pl={4} mb={3} spacing={1}>
              {children}
            </UnorderedList>
          ),
          ol: ({ children }) => (
            <OrderedList pl={4} mb={3} spacing={1}>
              {children}
            </OrderedList>
          ),
          li: ({ children }) => <ListItem>{children}</ListItem>,
          strong: ({ children }) => (
            <Text as="strong" fontWeight={700} color={useColorModeValue('gray.800', 'gray.100')}>
              {children}
            </Text>
          ),
          em: ({ children }) => (
            <Text as="em" fontStyle="italic">
              {children}
            </Text>
          ),
          blockquote: ({ children }) => (
            <Box
              as="blockquote"
              borderLeft="3px solid"
              borderColor={blockquoteBorder}
              bg={blockquoteBg}
              pl={3}
              py={2}
              my={3}
              fontStyle="italic"
              rounded="sm"
            >
              {children}
            </Box>
          ),
          code: ({ children }) => (
            <Code fontSize="xs" bg={codeBg} px={1} py={0.5} rounded="sm">
              {children}
            </Code>
          ),
          a: ({ href, children }) => (
            <Link href={href} color={linkColor} isExternal={!href?.startsWith('#')}>
              {children}
            </Link>
          ),
          hr: () => <Divider my={4} />,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </Box>
  );
}
