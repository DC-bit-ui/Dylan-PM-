import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Chakra theme for Stormboy Tracker.
//
// Light + dark mode safe from the start. Uses standard Chakra tokens
// (gray.700, green.500, etc.) per the CPO vibe-coding guide so the
// rewrite ports cleanly into the main AgriProve frontend later —
// where semantic tokens like `system.type/900`, `background.subtle`
// take over.
//
// Font: Lato self-hosted via @fontsource/lato (imported in main.tsx).
// Brand greens align with the existing dashboard palette (2d6a4f).

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

export const theme = extendTheme({
  config,
  fonts: {
    heading: '"Lato", -apple-system, BlinkMacSystemFont, sans-serif',
    body: '"Lato", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  colors: {
    // Brand greens roughly matching the existing #2d6a4f / #245a40 palette
    brand: {
      50: '#e6f3ec',
      100: '#c2e0cf',
      200: '#9bccaf',
      300: '#74b88f',
      400: '#4d9f6f',
      500: '#2d6a4f',
      600: '#245a40',
      700: '#1c4a33',
      800: '#143a26',
      900: '#0c2a1a',
    },
  },
  styles: {
    global: (props: { colorMode: 'light' | 'dark' }) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
        fontSize: '14px',
        letterSpacing: '-0.1px',
      },
    }),
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});
