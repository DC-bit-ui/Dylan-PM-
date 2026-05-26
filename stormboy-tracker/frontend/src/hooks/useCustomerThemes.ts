import { useEffect, useState } from 'react';
import { customerThemesClient } from '@/services/customerThemesClient';
import type { CustomerThemesResponse } from '@/types/customerThemes';

interface UseCustomerThemesResult {
  data: CustomerThemesResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: (force?: boolean) => void;
}

export function useCustomerThemes(): UseCustomerThemesResult {
  const [data, setData] = useState<CustomerThemesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);
  const [force, setForce] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    customerThemesClient
      .fetch(force)
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
        setForce(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tick, force]);

  return {
    data,
    loading,
    error,
    refetch: (forceFlag = false) => {
      setForce(forceFlag);
      setTick((t) => t + 1);
    },
  };
}
