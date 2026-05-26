import { Box, Heading, Link, useColorModeValue } from '@chakra-ui/react';
import type { BrainTocEntry } from '@/types/brain';

interface ProfileTocProps {
  toc: BrainTocEntry[];
  filter: string;
}

export function ProfileToc({ toc, filter }: ProfileTocProps) {
  const headColor = useColorModeValue('gray.600', 'gray.400');
  const linkColor = useColorModeValue('gray.700', 'gray.300');
  const linkHover = useColorModeValue('brand.600', 'brand.300');

  const q = filter.trim().toLowerCase();
  const filtered = q
    ? toc.filter((t) => t.text.toLowerCase().includes(q))
    : toc;

  if (!filtered.length) {
    return (
      <Box fontSize="xs" color={headColor} fontStyle="italic">
        No sections match.
      </Box>
    );
  }
  return (
    <Box>
      <Heading
        size="xs"
        textTransform="uppercase"
        letterSpacing="0.5px"
        color={headColor}
        mb={2}
      >
        Contents
      </Heading>
      <Box as="nav" fontSize="xs">
        {filtered.map((t) => (
          <Link
            key={t.slug}
            href={`#${t.slug}`}
            display="block"
            color={linkColor}
            _hover={{ color: linkHover, textDecoration: 'none' }}
            pl={`${(t.level - 1) * 8}px`}
            py={1}
            lineHeight={1.4}
            fontWeight={t.level === 1 ? 700 : t.level === 2 ? 600 : 400}
          >
            {t.text}
          </Link>
        ))}
      </Box>
    </Box>
  );
}
