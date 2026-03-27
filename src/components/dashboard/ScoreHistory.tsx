'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Target } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

interface Score { id: string; score: number; played_date: string; position: number; }

export function ScoreHistory({ scores }: { scores: Score[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-emerald-400" />Score History</CardTitle></CardHeader>
      <CardContent>
        {scores.length === 0 ? (
          <EmptyState icon={Target} title="No scores yet" description="Add your first Stableford score to get started" />
        ) : (
          <div className="space-y-2">
            {scores.map((score, i) => (
              <div key={score.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>#{score.position}</div>
                  <div>
                    <p className="font-bold text-white text-lg">{score.score}</p>
                    <p className="text-xs text-slate-400">{new Date(score.played_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                {i === 0 && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-semibold">Latest</span>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
