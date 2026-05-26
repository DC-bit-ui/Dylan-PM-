import { Box, Button, HStack, useColorModeValue } from '@chakra-ui/react';

export interface StatsPill {
  id: string;
  label: string;
  status?: 'live' | 'stub';
}

interface StatsPillsProps {
  pills: StatsPill[];
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function StatsPills({ pills }: StatsPillsProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.200', 'gray.700');
  const stubColor = useColorModeValue('gray.500', 'gray.500');

  return (
    <Box
      position="sticky"
      top="60px"
      zIndex={2}
      bg={bg}
      borderY="1px solid"
      borderColor={border}
      py={2}
      px={1}
      mx={-1}
      mb={4}
      overflowX="auto"
      sx={{
        '&::-webkit-scrollbar': { height: '4px' },
      }}
    >
      <HStack spacing={2} minW="max-content">
        {pills.map((p) => (
          <Button
            key={p.id}
            size="xs"
            variant="outline"
            rounded="full"
            colorScheme={p.status === 'stub' ? 'gray' : 'brand'}
            color={p.status === 'stub' ? stubColor : undefined}
            onClick={() => scrollToSection(p.id)}
            flexShrink={0}
          >
            {p.label}
            {p.status === 'stub' && (
              <Box as="span" ml={1} fontSize="2xs" opacity={0.6}>
                ·v2
              </Box>
            )}
          </Button>
        ))}
      </HStack>
    </Box>
  );
}
