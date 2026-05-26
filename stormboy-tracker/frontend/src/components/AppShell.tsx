import { type ReactNode } from 'react';
import {
  Box,
  Flex,
  HStack,
  Heading,
  Text,
  IconButton,
  useColorMode,
  useColorModeValue,
  Container,
  Tag,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useCurrentUser } from '@/utils/ContextProvider';
import { useRouteTracker } from '@/hooks/useRouteTracker';
import { TabNav } from './TabNav';

// Top-level app shell — header bar with brand + color-mode toggle,
// tab nav below, then the page content.
//
// All colors via useColorModeValue or Chakra tokens — no literal hex.

export function AppShell({ children }: { children: ReactNode }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const headerBg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const user = useCurrentUser();
  useRouteTracker();

  return (
    <Flex direction="column" minH="100vh">
      <Box as="header" bg={headerBg} borderBottom="1px solid" borderColor={borderColor} py={3}>
        <Container maxW="container.xl">
          <Flex align="center" justify="space-between">
            <HStack spacing={3} align="baseline">
              <Heading size="md" letterSpacing="-0.3px" color="brand.500">
                Stormboy
              </Heading>
              <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.5px">
                Tracker · v3
              </Text>
              <Tag size="sm" colorScheme="brand" variant="subtle">
                React rewrite in flight
              </Tag>
            </HStack>
            <HStack spacing={2}>
              <Text fontSize="xs" color="gray.500">{user.name}</Text>
              <IconButton
                size="sm"
                aria-label="Toggle color mode"
                icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
                onClick={toggleColorMode}
                variant="ghost"
              />
            </HStack>
          </Flex>
        </Container>
      </Box>
      <Box as="nav" borderBottom="1px solid" borderColor={borderColor} bg={headerBg}>
        <Container maxW="container.xl">
          <TabNav />
        </Container>
      </Box>
      <Box as="main" flex="1">
        <Container maxW="container.xl" py={6}>
          {children}
        </Container>
      </Box>
    </Flex>
  );
}
