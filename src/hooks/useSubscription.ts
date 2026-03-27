'use client';
import { useEffect, useState, useCallback } from 'react';

interface SubscriptionData {
  status: string;
  isActive: boolean;
  subscription: {
    id: string; interval: string; status: string;
    currentPeriodEnd: string; cancelAt: string | null;
    amountCents: number; currency: string;
  } | null;
}

export function useSubscription() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/subscriptions/status');
      if (!res.ok) throw new Error('Failed to fetch subscription');
      const result = await res.json();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  return { ...data, loading, error, refresh: fetchStatus };
}
