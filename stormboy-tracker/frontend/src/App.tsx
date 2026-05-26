import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { theme } from '@/utils/theme';
import { ContextProvider } from '@/utils/ContextProvider';
import { AppShell } from '@/components/AppShell';
import { HomePage } from '@/pages/HomePage';
import { AskPage } from '@/pages/AskPage';
import { HealthPage } from '@/pages/HealthPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

// Root component. Per CPO guide: theme → ChakraProvider, global state
// → ContextProvider, routing → react-router-dom v6 BrowserRouter.

export function App() {
  return (
    <ChakraProvider theme={theme}>
      <ContextProvider>
        <BrowserRouter basename="/v3">
          <AppShell>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/ask" element={<AskPage />} />
              <Route path="/work" element={<PlaceholderPage name="Work" v2Anchor="work" />} />
              <Route path="/stats" element={<PlaceholderPage name="Stats" v2Anchor="stats" />} />
              <Route path="/messaging" element={<PlaceholderPage name="Messaging" v2Anchor="messaging" />} />
              <Route path="/brain" element={<PlaceholderPage name="Brain" v2Anchor="brain" />} />
              <Route path="/health" element={<HealthPage />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </ContextProvider>
    </ChakraProvider>
  );
}
