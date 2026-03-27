'use client';
import { useEffect, useState, useCallback } from 'react';
import { useToast } from './useToast';

interface Score { id: string; score: number; played_date: string; position: number; created_at: string; }

export function useScores() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchScores = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/scores');
      if (!res.ok) throw new Error('Failed to fetch scores');
      const data = await res.json();
      setScores(data.scores);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Unknown error'); }
    finally { setLoading(false); }
  }, []);

  const addScore = useCallback(async (score: number, playedDate: string) => {
    const res = await fetch('/api/scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score, played_date: playedDate }) });
    const data = await res.json();
    if (!res.ok) { toast({ title: 'Error', description: data.error, variant: 'error' }); throw new Error(data.error); }
    setScores(data.scores);
    toast({ title: 'Score added!', variant: 'success' });
    return data;
  }, [toast]);

  const updateScore = useCallback(async (id: string, updates: Partial<{ score: number; played_date: string }>) => {
    const res = await fetch(`/api/scores/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    const data = await res.json();
    if (!res.ok) { toast({ title: 'Error', description: data.error, variant: 'error' }); throw new Error(data.error); }
    setScores((prev) => prev.map(( s: any ) => (s.id === id ? data.score : s)));
    toast({ title: 'Score updated!', variant: 'success' });
    return data;
  }, [toast]);

  const deleteScore = useCallback(async (id: string) => {
    const res = await fetch(`/api/scores/${id}`, { method: 'DELETE' });
    if (!res.ok) { const data = await res.json(); toast({ title: 'Error', description: data.error, variant: 'error' }); throw new Error(data.error); }
    await fetchScores();
    toast({ title: 'Score removed', variant: 'success' });
  }, [fetchScores, toast]);

  useEffect(() => { fetchScores(); }, [fetchScores]);

  return { scores, loading, error, isComplete: scores.length === 5, count: scores.length, addScore, updateScore, deleteScore, refresh: fetchScores };
}
