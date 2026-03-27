'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { CheckCircle, XCircle, Eye, DollarSign } from 'lucide-react';
import Image from 'next/image';

interface Winner { id: string; match_type: string; matched_numbers: number[]; prize_amount_cents: number; verification_status: string; payment_status: string; proof_image_url: string | null; profiles: { full_name: string; email: string }; draws: { draw_month: string; numbers: number[] }; }
const matchLabels: Record<string, string> = { match_5: '5-Match 🏆', match_4: '4-Match 🎯', match_3: '3-Match ⭐' };

export function WinnerVerification({ winners: initialWinners }: { winners: Winner[] }) {
  const [winners, setWinners] = useState(initialWinners);
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  async function handleVerify(winnerId: string, status: 'approved' | 'rejected', reason?: string) {
    setLoading((prev) => ({ ...prev, [winnerId]: true }));
    try {
      const res = await fetch(`/api/winners/${winnerId}/verify`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, rejection_reason: reason }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error); }
      setWinners((prev) => prev.map((w) => w.id === winnerId ? { ...w, verification_status: status } : w));
      toast({ title: `Winner ${status}`, variant: 'success' });
    } catch (err: unknown) { toast({ title: 'Error', description: err instanceof Error ? err.message : 'Unknown error', variant: 'error' }); }
    finally { setLoading((prev) => ({ ...prev, [winnerId]: false })); }
  }

  async function handlePayout(winnerId: string) {
    const reference = prompt('Enter payment reference (optional):') ?? '';
    setLoading((prev) => ({ ...prev, [`pay-${winnerId}`]: true }));
    try {
      const res = await fetch(`/api/winners/${winnerId}/payout`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payment_reference: reference }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error); }
      setWinners((prev) => prev.map((w) => w.id === winnerId ? { ...w, payment_status: 'paid' } : w));
      toast({ title: 'Payout recorded', variant: 'success' });
    } catch (err: unknown) { toast({ title: 'Error', description: err instanceof Error ? err.message : 'Unknown error', variant: 'error' }); }
    finally { setLoading((prev) => ({ ...prev, [`pay-${winnerId}`]: false })); }
  }

  return (
    <div className="space-y-4">
      {winners.length === 0 && <Card><CardContent><p className="text-center text-slate-400 py-8">No winners to display</p></CardContent></Card>}
      {winners.map((winner) => (
        <Card key={winner.id}>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2"><h4 className="font-bold text-white">{winner.profiles.full_name}</h4><Badge variant={winner.match_type === 'match_5' ? 'accent' : winner.match_type === 'match_4' ? 'success' : 'info'}>{matchLabels[winner.match_type]}</Badge></div>
                <p className="text-sm text-slate-400">{winner.profiles.email}</p>
                <p className="text-xs text-slate-500 mt-1">Draw: {new Date(winner.draws.draw_month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
                <p className="text-xs text-slate-500">Matched: [{winner.matched_numbers.join(', ')}] from [{winner.draws.numbers.join(', ')}]</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-emerald-400">₹{(winner.prize_amount_cents / 100).toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-1 justify-end">
                  <Badge variant={winner.verification_status === 'approved' ? 'success' : winner.verification_status === 'rejected' ? 'error' : 'warning'}>{winner.verification_status}</Badge>
                  {winner.verification_status === 'approved' && <Badge variant={winner.payment_status === 'paid' ? 'success' : 'warning'}>{winner.payment_status}</Badge>}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 items-center border-t border-slate-800 pt-4">
              {winner.proof_image_url && <Button variant="outline" size="sm" icon={<Eye className="w-3.5 h-3.5" />} onClick={() => setViewingProof(winner.proof_image_url)}>View Proof</Button>}
              {!winner.proof_image_url && winner.verification_status === 'pending' && <span className="text-xs text-amber-400">⚠️ No proof uploaded yet</span>}
              {winner.verification_status === 'pending' && (<>
                <Button variant="primary" size="sm" icon={<CheckCircle className="w-3.5 h-3.5" />} loading={loading[winner.id]} onClick={() => handleVerify(winner.id, 'approved')}>Approve</Button>
                <Button variant="destructive" size="sm" icon={<XCircle className="w-3.5 h-3.5" />} loading={loading[winner.id]} onClick={() => { const r = prompt('Rejection reason:'); if (r !== null) handleVerify(winner.id, 'rejected', r); }}>Reject</Button>
              </>)}
              {winner.verification_status === 'approved' && winner.payment_status === 'pending' && <Button variant="accent" size="sm" icon={<DollarSign className="w-3.5 h-3.5" />} loading={loading[`pay-${winner.id}`]} onClick={() => handlePayout(winner.id)}>Mark as Paid</Button>}
            </div>
          </CardContent>
        </Card>
      ))}
      {viewingProof && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewingProof(null)}>
          <div className="relative max-w-3xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image src={viewingProof} alt="Winner proof" width={800} height={600} className="rounded-xl object-contain max-h-[80vh]" />
            <Button variant="ghost" size="sm" className="absolute top-2 right-2 bg-black/50" onClick={() => setViewingProof(null)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
