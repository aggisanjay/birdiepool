// 'use client';
// import { useState } from 'react';
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
// import { Button } from '@/components/ui/Button';
// import { Badge } from '@/components/ui/Badge';
// import { Trophy, Upload, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
// import { useToast } from '@/hooks/useToast';
// import { AnimatedCounter } from '@/components/shared/AnimatedCounter';

// interface Winner { id: string; match_type: string; prize_amount_cents: number; verification_status: string; payment_status: string; proof_image_url: string | null; created_at: string; draws: { draw_month: string; numbers: number[]; }; }

// const matchTypeLabels: Record<string, string> = { match_5: '5-Number Match 🏆', match_4: '4-Number Match 🎯', match_3: '3-Number Match ⭐' };
// const verificationBadge: Record<string, { variant: string; icon: typeof Clock; label: string }> = {
//   pending: { variant: 'warning', icon: Clock, label: 'Pending Verification' },
//   approved: { variant: 'success', icon: CheckCircle, label: 'Approved' },
//   rejected: { variant: 'error', icon: XCircle, label: 'Rejected' },
// };

// export function WinningsOverview({ winners }: { winners: Winner[] }) {
//   const [uploadingId, setUploadingId] = useState<string | null>(null);
//   const { toast } = useToast();
//   const totalWon = winners.filter(( w: any ) => w.payment_status === 'paid').reduce(( sum: any, w: any ) => sum + w.prize_amount_cents, 0);
//   const pendingAmount = winners.filter(( w: any ) => w.verification_status === 'approved' && w.payment_status === 'pending').reduce(( sum: any, w: any ) => sum + w.prize_amount_cents, 0);

//   async function handleProofUpload(winnerId: string, file: File) {
//     setUploadingId(winnerId);
//     try {
//       const formData = new FormData(); formData.append('proof', file);
//       const res = await fetch(`/api/winners/${winnerId}/route`, { method: 'POST', body: formData });
//       if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Upload failed'); }
//       toast({ title: 'Proof uploaded!', description: 'Our team will review shortly.', variant: 'success' });
//       window.location.reload();
//     } catch (err: unknown) { toast({ title: 'Upload failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'error' }); }
//     finally { setUploadingId(null); }
//   }

//   return (
//     <Card>
//       <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400" />Winnings</CardTitle><CardDescription>Your prize history and payouts</CardDescription></CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-2 gap-4 mb-6">
//           <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4 text-center"><DollarSign className="w-5 h-5 text-emerald-400 mx-auto mb-1" /><div className="text-2xl font-black text-emerald-400"><AnimatedCounter value={totalWon / 100} prefix="₹" decimals={2} /></div><p className="text-xs text-slate-400">Total Paid</p></div>
//           <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-4 text-center"><Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" /><div className="text-2xl font-black text-amber-400"><AnimatedCounter value={pendingAmount / 100} prefix="₹" decimals={2} /></div><p className="text-xs text-slate-400">Pending</p></div>
//         </div>
//         {winners.length === 0 ? (
//           <div className="text-center py-8"><Trophy className="w-12 h-12 text-slate-700 mx-auto mb-3" /><p className="text-slate-500 text-sm">No wins yet — keep playing!</p></div>
//         ) : (
//           <div className="space-y-3">
//             {winners.map(( winner: any ) => {
//               const vBadge = verificationBadge[winner.verification_status];
//               const drawMonth = new Date(winner.draws.draw_month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
//               return (
//                 <div key={winner.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
//                   <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold text-white">{matchTypeLabels[winner.match_type] ?? winner.match_type}</span><span className="text-lg font-black text-emerald-400">₹{(winner.prize_amount_cents / 100).toFixed(2)}</span></div>
//                   <p className="text-xs text-slate-400 mb-3">{drawMonth} Draw</p>
//                   <div className="flex items-center gap-2 flex-wrap">
//                     <Badge variant={vBadge.variant as never}><vBadge.icon className="w-3 h-3 mr-1" />{vBadge.label}</Badge>
//                     {winner.verification_status === 'approved' && <Badge variant={winner.payment_status === 'paid' ? 'success' : 'warning'}>{winner.payment_status === 'paid' ? 'Paid' : 'Payout Pending'}</Badge>}
//                   </div>
//                   {winner.verification_status === 'pending' && !winner.proof_image_url && (
//                     <div className="mt-3">
//                       <label className="cursor-pointer">
//                         <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleProofUpload(winner.id, f); }} />
//                         <Button variant="outline" size="sm" fullWidth loading={uploadingId === winner.id} icon={<Upload className="w-3.5 h-3.5" />} onClick={() => {}}>Upload Score Proof</Button>
//                       </label>
//                     </div>
//                   )}
//                   {winner.proof_image_url && winner.verification_status === 'pending' && <p className="text-xs text-emerald-400 mt-2">✓ Proof uploaded — awaiting review</p>}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// src/components/dashboard/WinningsOverview.tsx
'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Trophy, Upload, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';

interface Winner {
  id: string;
  match_type: string;
  prize_amount_cents: number;
  verification_status: string;
  payment_status: string;
  proof_image_url: string | null;
  created_at: string;
  draws: {
    draw_month: string;
    numbers: number[];
  };
}

const matchTypeLabels: Record<string, string> = {
  match_5: '5-Number Match 🏆',
  match_4: '4-Number Match 🎯',
  match_3: '3-Number Match ⭐',
};

export function WinningsOverview({ winners }: { winners: Winner[] }) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const { toast } = useToast();

  const totalWon = winners
    .filter((w) => w.payment_status === 'paid')
    .reduce((sum, w) => sum + w.prize_amount_cents, 0);

  const pendingAmount = winners
    .filter((w) => w.verification_status === 'approved' && w.payment_status === 'pending')
    .reduce((sum, w) => sum + w.prize_amount_cents, 0);

  async function handleProofUpload(winnerId: string, file: File) {
    setUploadingId(winnerId);
    try {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: 'Invalid file type', description: 'Please upload a JPEG, PNG, WebP or GIF', variant: 'error' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Image must be less than 10MB', variant: 'error' });
        return;
      }

      const formData = new FormData();
      formData.append('proof', file);

      const res = await fetch(`/api/winners/${winnerId}/proof`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      toast({
        title: 'Proof uploaded!',
        description: 'Our team will review your proof shortly.',
        variant: 'success',
      });
      window.location.reload();
    } catch (err: unknown) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'error',
      });
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Winnings
        </CardTitle>
        <CardDescription>Your prize history and payouts</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4 text-center">
            <DollarSign className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <div className="text-2xl font-black text-emerald-400">
              <AnimatedCounter value={totalWon / 100} prefix="£" decimals={2} />
            </div>
            <p className="text-xs text-slate-400">Total Paid</p>
          </div>
          <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-4 text-center">
            <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-2xl font-black text-amber-400">
              <AnimatedCounter value={pendingAmount / 100} prefix="£" decimals={2} />
            </div>
            <p className="text-xs text-slate-400">Pending</p>
          </div>
        </div>

        {/* Winners list */}
        {winners.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No wins yet — keep playing!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {winners.map((winner) => {
              const drawMonth = new Date(winner.draws.draw_month).toLocaleDateString('en-GB', {
                month: 'long', year: 'numeric',
              });

              return (
                <div key={winner.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">
                      {matchTypeLabels[winner.match_type] ?? winner.match_type}
                    </span>
                    <span className="text-lg font-black text-emerald-400">
                      ₹{(winner.prize_amount_cents / 100).toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-3">{drawMonth} Draw</p>

                  {/* Status badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {winner.verification_status === 'pending' && (
                      <Badge variant="warning">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending Verification
                      </Badge>
                    )}
                    {winner.verification_status === 'approved' && (
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved
                      </Badge>
                    )}
                    {winner.verification_status === 'rejected' && (
                      <Badge variant="error">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejected
                      </Badge>
                    )}
                    {winner.verification_status === 'approved' && (
                      <Badge variant={winner.payment_status === 'paid' ? 'success' : 'warning'}>
                        {winner.payment_status === 'paid' ? 'Paid ✓' : 'Payout Pending'}
                      </Badge>
                    )}
                  </div>

                  {/* Upload proof button */}
                  {winner.verification_status === 'pending' && !winner.proof_image_url && (
                    <div>
                      <label
                        htmlFor={`proof-upload-${winner.id}`}
                        className="block cursor-pointer"
                      >
                        <div className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border-2 border-dashed text-sm font-semibold transition-all ${
                          uploadingId === winner.id
                            ? 'border-slate-600 text-slate-500 cursor-not-allowed'
                            : 'border-slate-600 text-slate-300 hover:border-emerald-500 hover:text-emerald-400'
                        }`}>
                          {uploadingId === winner.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-slate-500 border-t-emerald-400 rounded-full animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              Upload Score Proof
                            </>
                          )}
                        </div>
                        <input
                          id={`proof-upload-${winner.id}`}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          disabled={uploadingId === winner.id}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleProofUpload(winner.id, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      <p className="text-xs text-slate-500 mt-1.5 text-center">
                        Screenshot from your golf app or club system
                      </p>
                    </div>
                  )}

                  {/* Proof uploaded confirmation */}
                  {winner.proof_image_url && winner.verification_status === 'pending' && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs text-emerald-400 font-semibold">Proof submitted</p>
                        <p className="text-xs text-slate-500">Awaiting admin review</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
