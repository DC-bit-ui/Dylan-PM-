import { lazy, Suspense } from 'react';
import { ChakraProvider, Center, Spinner } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { theme } from '@/utils/theme';
import { ContextProvider } from '@/utils/ContextProvider';
import { AppShell } from '@/components/AppShell';

// Root component. Per CPO guide: theme → ChakraProvider, global state
// → ContextProvider, routing → react-router-dom v6 BrowserRouter.
//
// Pages are lazy-loaded so each route ships as its own chunk — heavy deps
// (Chart.js on STATS, react-markdown on BRAIN) no longer bloat the initial
// bundle. Named exports are adapted to the default export React.lazy expects.
const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const AskPage = lazy(() => import('@/pages/AskPage').then((m) => ({ default: m.AskPage })));
const HealthPage = lazy(() => import('@/pages/HealthPage').then((m) => ({ default: m.HealthPage })));
const MessagingPage = lazy(() => import('@/pages/MessagingPage').then((m) => ({ default: m.MessagingPage })));
const BrainPage = lazy(() => import('@/pages/BrainPage').then((m) => ({ default: m.BrainPage })));
const WorkPage = lazy(() => import('@/pages/WorkPage').then((m) => ({ default: m.WorkPage })));
const StatsPage = lazy(() => import('@/pages/StatsPage').then((m) => ({ default: m.StatsPage })));
const IntelligencePage = lazy(() => import('@/pages/IntelligencePage').then((m) => ({ default: m.IntelligencePage })));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage').then((m) => ({ default: m.FeedbackPage })));

function PageFallback() {
  return (
    <Center py={20}>
      <Spinner size="lg" color="brand.500" thickness="3px" />
    </Center>
  );
}

export function App() {
  return (
    <ChakraProvider theme={theme}>
      <ContextProvider>
        <BrowserRouter basename="/v3">
          <AppShell>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/ask" element={<AskPage />} />
                <Route path="/work" element={<WorkPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/messaging" element={<MessagingPage />} />
                <Route path="/brain" element={<BrainPage />} />
                <Route path="/health" element={<HealthPage />} />
                <Route path="/intelligence" element={<IntelligencePage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
              </Routes>
            </Suspense>
          </AppShell>
        </BrowserRouter>
      </ContextProvider>
    </ChakraProvider>
  );
}
