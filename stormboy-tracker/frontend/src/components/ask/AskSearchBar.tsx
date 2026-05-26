import {
  Box,
  HStack,
  Icon,
  Input,
  Kbd,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { type KeyboardEvent, forwardRef } from 'react';

// Big focused search input — the primary interaction. Enter fires the
// top autocomplete match (or the raw query if no curated match);
// Escape clears.

interface AskSearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onEscape: () => void;
}

export const AskSearchBar = forwardRef<HTMLInputElement, AskSearchBarProps>(
  function AskSearchBar({ value, onChange, onSubmit, onEscape }, ref) {
    const bg = useColorModeValue('white', 'gray.800');
    const border = useColorModeValue('gray.300', 'gray.600');
    const focusBorder = 'brand.500';
    const iconColor = useColorModeValue('gray.500', 'gray.400');

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onEscape();
      }
    }

    return (
      <Box
        bg={bg}
        border="1.5px solid"
        borderColor={border}
        rounded="lg"
        px={4}
        py={1}
        _focusWithin={{
          borderColor: focusBorder,
          boxShadow: '0 0 0 3px rgba(45,106,79,0.12)',
        }}
        transition="all 0.15s"
      >
        <HStack spacing={3} align="center">
          <Icon as={SearchIcon} color={iconColor} boxSize={4} />
          <Input
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything…  e.g. 'why is South East LLS converting 9%?'"
            variant="unstyled"
            fontSize="md"
            py={3}
            color={useColorModeValue('gray.800', 'gray.100')}
            _placeholder={{ color: useColorModeValue('gray.400', 'gray.500') }}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          <Kbd fontSize="xs">↵</Kbd>
        </HStack>
      </Box>
    );
  },
);
