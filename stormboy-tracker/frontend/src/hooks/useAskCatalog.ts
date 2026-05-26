import { useEffect, useState } from 'react';
import { askPromptsClient } from '@/services/askPromptsClient';
import type { AskCatalog } from '@/types/askPrompts';

// Apollo-shape hook for the curated questions catalog.

interface UseAskCatalogResult {
  data: AskCatalog | null;
  loading: boolean;
  error: Error | null;
}

export function useAskCatalog(): UseAskCatalogResult {
  const [data, setData] = useState<AskCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    askPromptsClient
      .catalog()
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setError(null);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
