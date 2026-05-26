import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ColorModeScript } from '@chakra-ui/react';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@fontsource/lato/900.css';
import { App } from './App';
import { theme } from './utils/theme';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found in index.html');

createRoot(rootEl).render(
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <App />
  </StrictMode>
);
