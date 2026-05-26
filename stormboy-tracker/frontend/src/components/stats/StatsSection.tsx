import {
  Box,
  Button,
  Collapse,
  Flex,
  Heading,
  HStack,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useEffect, type ReactNode } from 'react';

interface StatsSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  collapsedStorageKey?: string;
  children: ReactNode;
}

// Section wrapper. Persists open/closed state to localStorage so the user's
// preferred view holds across reloads. The id is used as the scroll anchor
// target for the pill nav.
export function StatsSection({
  id,
  title,
  subtitle,
  defaultOpen = true,
  collapsedStorageKey,
  children,
}: StatsSectionProps) {
  const storageKey = collapsedStorageKey || `v3-stats-collapsed-${id}`;
  const initialOpen = (() => {
    try {
      const v = localStorage.getItem(storageKey);
      if (v === 'true') return false;
      if (v === 'false') return true;
    } catch {/* noop */}
    return defaultOpen;
  })();
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: initialOpen });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, (!isOpen).toString());
    } catch {/* noop */}
  }, [isOpen, storageKey]);

  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.200', 'gray.700');
  const subColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box
      id={id}
      bg={bg}
      border="1px solid"
      borderColor={border}
      rounded="md"
      overflow="hidden"
      scrollMarginTop="76px"
    >
      <Flex
        as="header"
        align="flex-start"
        justify="space-between"
        gap={3}
        p={4}
        cursor="pointer"
        onClick={onToggle}
        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
      >
        <Box flex={1} minW={0}>
          <Heading size="md" letterSpacing="-0.3px" mb={subtitle ? 1 : 0}>
            {title}
          </Heading>
          {subtitle && (
            <Text fontSize="xs" color={subColor}>
              {subtitle}
            </Text>
          )}
        </Box>
        <HStack flexShrink={0}>
          <Button
            size="xs"
            variant="ghost"
            rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isOpen ? 'Collapse' : 'Expand'}
          </Button>
        </HStack>
      </Flex>
      <Collapse in={isOpen} animateOpacity>
        <Box px={4} pb={4} borderTop="1px solid" borderColor={border}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}
