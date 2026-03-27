'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { Settings, Play, Eye, Send, RefreshCw } from 'lucide-react';

interface DrawConfiguratorProps { draw: Record<string, unknown>; onUpdate: () => void; }

export function DrawConfigurator({ draw, onUpdate }: DrawConfiguratorProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [simulationResults, setSimulationResults] = useState<Record<string, unknown> | null>(null);
  const { toast } = useToast();

  async function callDrawApi(action: string) {
    setLoading(action);
    try {
      const res = await fetch(`/api/draws/${draw.id}/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: action === 'simulate' ? JSON.stringify({ iterations: 10 }) : undefined });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (action === 'simulate') { setSimulationResults(data.simulation); toast({ title: 'Simulation complete', variant: 'success' }); }
      else { toast({ title: action === 'execute' ? 'Draw executed successfully!' : 'Results published!', variant: 'success' }); onUpdate(); }
    } catch (err: unknown) { toast({ title: 'Error', description: err instanceof Error ? err.message : 'Unknown error', variant: 'error' }); }
    finally { setLoading(null); }
  }

  const drawMonth = new Date(draw.draw_month as string).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const statusVariant: Record<string, 'warning'|'info'|'success'|'default'> = { draft: 'warning', simulated: 'info', published: 'success', completed: 'default' };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-slate-400" />{drawMonth} Draw</CardTitle>
          <Badge variant={statusVariant[draw.status as string] ?? 'default'}>{draw.status as string}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[['Mode', draw.mode as string], ['Eligible', `${draw.eligible_participants} users`], ['Total Pool', `₹${((draw.total_pool_cents as number) / 100).toFixed(2)}`], ['Rollover', `₹${((draw.rollover_cents as number) / 100).toFixed(2)}`]].map(([label, value]) => (
            <div key={label} className="bg-slate-800/30 rounded-lg px-3 py-2"><p className="text-xs text-slate-400">{label}</p><p className="text-sm font-bold text-white">{value}</p></div>
          ))}
        </div>
        {draw.numbers && (
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Draw Numbers</h4>
            <div className="flex gap-3">{(draw.numbers as number[]).map((n, i) => (<div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white shadow-lg">{n}</div>))}</div>
            {draw.status === 'simulated' && (
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div><p className="text-2xl font-black text-emerald-400">{draw.match_5_count as number}</p><p className="text-xs text-slate-400">5-Match Winners</p></div>
                <div><p className="text-2xl font-black text-blue-400">{draw.match_4_count as number}</p><p className="text-xs text-slate-400">4-Match Winners</p></div>
                <div><p className="text-2xl font-black text-purple-400">{draw.match_3_count as number}</p><p className="text-xs text-slate-400">3-Match Winners</p></div>
              </div>
            )}
          </div>
        )}
        {simulationResults && (
          <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4 mb-6">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">Simulation Results ({(simulationResults.iterations as number)} iterations)</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              {(['match5Winners','match4Winners','match3Winners'] as const).map((key, i) => (
                <div key={key}><p className="text-lg font-bold text-white">{((simulationResults.averages as Record<string, number>)[key]).toFixed(2)}</p><p className="text-xs text-slate-400">Avg {['5','4','3'][i]}-Match</p></div>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {draw.status === 'draft' && (<>
            <Button onClick={() => callDrawApi('simulate')} loading={loading === 'simulate'} variant="outline" icon={<Eye className="w-4 h-4" />}>Simulate</Button>
            <Button onClick={() => { if (confirm('Execute draw? This action cannot be undone.')) callDrawApi('execute'); }} loading={loading === 'execute'} variant="primary" icon={<Play className="w-4 h-4" />}>Execute Draw</Button>
          </>)}
          {draw.status === 'simulated' && (<>
            <Button onClick={() => callDrawApi('simulate')} loading={loading === 'simulate'} variant="outline" icon={<RefreshCw className="w-4 h-4" />}>Re-simulate</Button>
            <Button onClick={() => { if (confirm('Publish results? Winners will be notified.')) callDrawApi('publish'); }} loading={loading === 'publish'} variant="accent" icon={<Send className="w-4 h-4" />}>Publish Results</Button>
          </>)}
          {draw.status === 'published' && <p className="text-emerald-400 text-sm font-medium">✅ Results published</p>}
        </div>
      </CardContent>
    </Card>
  );
}
