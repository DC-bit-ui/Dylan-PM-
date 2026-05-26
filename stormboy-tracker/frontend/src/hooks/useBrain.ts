import { useEffect, useState } from 'react';
import { brainClient } from '@/services/brainClient';
import type {
  BrainPersonasResponse,
  BrainProfile,
  BrainDistillatesResponse,
  BrainObjectionCardsResponse,
} from '@/types/brain';

function makeFetchHook<T>(fetcher: () => Promise<T>) {
  return function useFetched(deps: unknown[] = []) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      fetcher()
        .then((d) => {
          if (!cancelled) {
            setData(d);
            setError(null);
          }
        })
        .catch((e: Error) => {
          if (!cancelled) setError(e);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    return { data, loading, error };
  };
}

export const useBrainPersonas = makeFetchHook<BrainPersonasResponse>(() =>
  brainClient.personas(),
);
export const useBrainDistillates = makeFetchHook<BrainDistillatesResponse>(() =>
  brainClient.distillates(),
);
export const useBrainObjectionCards = makeFetchHook<BrainObjectionCardsResponse>(() =>
  brainClient.objectionCards(),
);

// Profile is parameterised by slug — separate hook so deps work
export function useBrainProfile(slug: string) {
  const [data, setData] = useState<BrainProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);
    brainClient
      .profile(slug)
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return { data, loading, error };
}
