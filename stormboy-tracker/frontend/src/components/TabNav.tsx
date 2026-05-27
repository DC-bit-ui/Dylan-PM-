import { HStack, Link, Box, useColorModeValue } from '@chakra-ui/react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';

// Top-of-page tab nav. Order mirrors v2 dashboard for muscle-memory
// parity during the migration window.

const TABS = [
  { to: '/',           label: 'Home' },
  { to: '/ask',        label: 'Ask' },
  { to: '/work',       label: 'Work' },
  { to: '/stats',      label: 'Stats' },
  { to: '/messaging',  label: 'Messaging' },
  { to: '/brain',      label: 'Brain' },
  { to: '/health',     label: 'Health' },
  { to: '/intelligence', label: 'Intelligence' },
  { to: '/feedback',   label: 'Feedback' },
];

export function TabNav() {
  const location = useLocation();
  const activeBg = useColorModeValue('brand.50', 'brand.900');
  const activeColor = useColorModeValue('brand.600', 'brand.200');
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');
  const hoverColor = useColorModeValue('gray.900', 'gray.100');

  return (
    <HStack spacing={1} py={1} overflowX="auto">
      {TABS.map((t) => {
        const isActive = location.pathname === t.to;
        return (
          <Link
            key={t.to}
            as={RouterNavLink}
            to={t.to}
            fontSize="sm"
            fontWeight={isActive ? 700 : 500}
            color={isActive ? activeColor : inactiveColor}
            bg={isActive ? activeBg : 'transparent'}
            _hover={{ textDecoration: 'none', color: hoverColor }}
            px={3}
            py={2}
            rounded="md"
            whiteSpace="nowrap"
            letterSpacing="-0.1px"
          >
            <Box as="span">{t.label}</Box>
          </Link>
        );
      })}
    </HStack>
  );
}
