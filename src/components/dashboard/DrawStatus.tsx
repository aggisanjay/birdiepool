'use client';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { NumberBall } from '@/components/shared/NumberBall';
import { Calendar, Users, Coins, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface DrawStatusProps { draw: Record<string, unknown> | null; scores: Record<string, unknown>[]; }

export function DrawStatus({ draw, scores }: DrawStatusProps) {
  const isEligible = scores.length === 5;
  if (!draw) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400" />Monthly Draw</CardTitle><CardDescription>No upcoming draw scheduled</CardDescription></CardHeader>
        <CardContent><div className="text-center py-8"><Calendar className="w-12 h-12 text-slate-700 mx-auto mb-3" /><p className="text-slate-500 text-sm">The next draw will be announced soon. Make sure you have 5 scores entered!</p></div></CardContent>
      </Card>
    );
  }
  const drawMonth = new Date(draw.draw_month as string).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const isPublished = draw.status === 'published' || draw.status === 'completed';
  const userScoreValues = scores.map((s) => s.score as number);
  const drawNumbers = (draw.numbers as number[]) ?? [];
  const matchedNumbers = isPublished ? userScoreValues.filter((s) => drawNumbers.includes(s)) : [];
  const totalPoolFormatted = (((draw.total_pool_cents as number) + (draw.rollover_cents as number)) / 100).toFixed(2);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400" />{drawMonth} Draw</CardTitle><CardDescription>{isPublished ? 'Results are in!' : 'Draw pending'}</CardDescription></div>
          <Badge variant={draw.status === 'completed' ? 'success' : draw.status === 'published' ? 'info' : 'warning'}>{draw.status === 'completed' ? 'Complete' : draw.status === 'published' ? 'Results Live' : 'Upcoming'}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center"><Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" /><p className="text-xl font-black text-white">₹{totalPoolFormatted}</p><p className="text-xs text-slate-400">Total Pool</p></div>
          <div className="text-center"><Users className="w-5 h-5 text-blue-400 mx-auto mb-1" /><p className="text-xl font-black text-white">{draw.eligible_participants as number}</p><p className="text-xs text-slate-400">Participants</p></div>
          <div className="text-center"><Sparkles className="w-5 h-5 text-purple-400 mx-auto mb-1" /><p className="text-xl font-black text-white">{(draw.rollover_cents as number) > 0 ? `₹${((draw.rollover_cents as number) / 100).toFixed(0)}` : '—'}</p><p className="text-xs text-slate-400">Rollover</p></div>
        </div>
        {isPublished && drawNumbers.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Winning Numbers</h4>
            <div className="flex justify-center gap-3">{drawNumbers.map((num, i) => <NumberBall key={num} number={num} matched={userScoreValues.includes(num)} size="lg" delay={i * 0.15} />)}</div>
          </div>
        )}
        {isPublished && (
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Your Numbers</h4>
            <div className="flex justify-center gap-3 mb-3">{userScoreValues.map((score, i) => <NumberBall key={i} number={score} matched={drawNumbers.includes(score)} size="md" delay={i * 0.1} />)}</div>
            <div className="text-center">
              {matchedNumbers.length >= 3 ? <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lg font-black text-emerald-400">🎉 {matchedNumbers.length} Numbers Matched!</motion.p>
                : <p className="text-sm text-slate-400">{matchedNumbers.length} number{matchedNumbers.length !== 1 ? 's' : ''} matched — better luck next month!</p>}
            </div>
          </div>
        )}
        {!isPublished && (
          <div className={`rounded-xl p-4 text-center ${isEligible ? 'bg-emerald-950/30 border border-emerald-500/20' : 'bg-amber-950/30 border border-amber-500/20'}`}>
            {isEligible ? <p className="text-emerald-400 text-sm font-medium">✅ You&apos;re eligible for this draw!</p>
              : <p className="text-amber-400 text-sm font-medium">⚠️ Enter {5 - scores.length} more score{5 - scores.length !== 1 ? 's' : ''} to be eligible</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
