'use client';
import { useEffect, useState, useCallback } from 'react';

interface Draw {
  id: string; draw_month: string; mode: string; status: string;
  numbers: number[] | null; total_pool_cents: number; rollover_cents: number;
  match_5_pool_cents: number; match_4_pool_cents: number; match_3_pool_cents: number;
  match_5_count: number; match_4_count: number; match_3_count: number;
  eligible_participants: number; published_at: string | null;
}

export function useDraws() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDraws = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/draws');
      if (!res.ok) throw new Error('Failed to fetch draws');
      const data = await res.json();
      setDraws(data.draws);
    } catch (err) { console.error('Error fetching draws:', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDraws(); }, [fetchDraws]);

  const currentDraw = draws.find(( d: any ) => ['published', 'simulated', 'draft'].includes(d.status));
  const completedDraws = draws.filter(( d: any ) => ['completed', 'published'].includes(d.status));

  return { draws, currentDraw, completedDraws, loading, refresh: fetchDraws };
}
