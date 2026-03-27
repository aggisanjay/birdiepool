'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';

export default function NewDrawPage() {
  const [month, setMonth] = useState('');
  const [mode, setMode] = useState<'random' | 'algorithmic'>('random');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!month) return;
    setLoading(true);
    try {
      const draw_month = `${month}-01`;
      const res = await fetch('/api/draws', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draw_month, mode }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create draw');
      toast({ title: 'Draw created!', variant: 'success' });
      router.push('/admin/draws');
    } catch (err: unknown) { toast({ title: 'Error', description: err instanceof Error ? err.message : 'Unknown error', variant: 'error' }); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-black text-white mb-8">Create New Draw</h1>
      <Card>
        <CardHeader><CardTitle>Draw Configuration</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Draw Month</label>
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Draw Mode</label>
              <div className="grid grid-cols-2 gap-3">
                {(['random', 'algorithmic'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setMode(m)} className={`p-4 rounded-xl border text-sm font-semibold capitalize transition-all ${mode === m ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>{m}</button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">{mode === 'random' ? 'Generates 5 truly random numbers from 1-45.' : 'Weights numbers by frequency in user scores — popular scores more likely to be drawn.'}</p>
            </div>
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>Create Draw</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
