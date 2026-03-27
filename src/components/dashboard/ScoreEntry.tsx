'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NumberBall } from '@/components/shared/NumberBall';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface Score { id: string; score: number; played_date: string; position: number; }
interface ScoreEntryProps { scores: Score[]; isActive: boolean; }

export function ScoreEntry({ scores: initialScores, isActive }: ScoreEntryProps) {
  const [scores, setScores] = useState<Score[]>(initialScores);
  const [isAdding, setIsAdding] = useState(false);
  const [newScore, setNewScore] = useState('');
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isComplete = scores.length === 5;

  async function handleAddScore() {
    if (!newScore || !newDate) return;
    const scoreNum = parseInt(newScore);
    if (scoreNum < 1 || scoreNum > 45) { toast({ title: 'Invalid score', description: 'Score must be between 1 and 45', variant: 'error' }); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score: scoreNum, played_date: newDate }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add score');
      setScores(data.scores); setNewScore(''); setNewDate(''); setIsAdding(false);
      toast({ title: 'Score added!', variant: 'success' });
    } catch (err: unknown) { toast({ title: 'Error', description: err instanceof Error ? err.message : 'Unknown error', variant: 'error' }); }
    finally { setLoading(false); }
  }

  async function handleDeleteScore(id: string) {
    try {
      const res = await fetch(`/api/scores/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setScores((prev) => prev.filter((s) => s.id !== id));
      toast({ title: 'Score removed', variant: 'success' });
    } catch (err: unknown) { toast({ title: 'Error', description: err instanceof Error ? err.message : 'Unknown error', variant: 'error' }); }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Scores</CardTitle>
            <CardDescription>{isComplete ? "All 5 scores entered — you're eligible for the next draw!" : `${scores.length}/5 scores entered — add ${5 - scores.length} more to enter the draw`}</CardDescription>
          </div>
          {isComplete ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <AlertCircle className="w-6 h-6 text-amber-500" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {Array.from({ length: 5 }).map(( _: any, i: number ) => {
            const score = scores[i];
            return score ? (
              <div key={score.id} className="text-center">
                <NumberBall number={score.score} matched={true} size="lg" delay={i * 0.1} />
                <p className="text-xs text-slate-400 mt-2">{new Date(score.played_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
              </div>
            ) : (
              <div key={`empty-${i}`} className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center"><span className="text-slate-600 text-sm">?</span></div>
            );
          })}
        </div>
        <div className="space-y-2 mb-4">
          <AnimatePresence>
            {scores.map(( score: any, index: number ) => (
              <motion.div key={score.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: index * 0.05 }} className="flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 w-4">#{score.position}</span>
                  <span className="font-bold text-white text-lg">{score.score}</span>
                  <span className="text-sm text-slate-400">{new Date(score.played_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDeleteScore(score.id)} className="p-1.5 rounded-lg hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {isActive && (
          <AnimatePresence>
            {isAdding ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border border-slate-700 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Stableford Score</label>
                    <input type="number" min={1} max={45} value={newScore} onChange={(e) => setNewScore(e.target.value)} placeholder="1-45" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Date Played</label>
                    <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} max={new Date().toISOString().split('T')[0]} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleAddScore} loading={loading} size="sm">Add Score</Button>
                  <Button onClick={() => setIsAdding(false)} variant="ghost" size="sm">Cancel</Button>
                </div>
                {scores.length >= 5 && <p className="text-xs text-amber-400">⚠️ Adding a new score will replace your oldest score (#{scores[scores.length - 1]?.score})</p>}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button onClick={() => setIsAdding(true)} variant="outline" size="md" icon={<Plus className="w-4 h-4" />} fullWidth>Add New Score</Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        {!isActive && <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-4 text-center"><p className="text-amber-400 text-sm">Subscribe to start entering your scores and participate in draws</p></div>}
      </CardContent>
    </Card>
  );
}
