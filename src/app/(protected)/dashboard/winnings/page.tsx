import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WinningsOverview } from '@/components/dashboard/WinningsOverview';

export default async function WinningsPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: winners } = await supabase.from('winners').select('*, draws(draw_month, numbers)').eq('user_id', user.id).order('created_at', { ascending: false });

  const totalWon = winners?.filter(( w: any ) => w.payment_status === 'paid').reduce((s, w) => s + w.prize_amount_cents, 0) ?? 0;
  const pending = winners?.filter(( w: any ) => w.verification_status === 'approved' && w.payment_status === 'pending').reduce((s, w) => s + w.prize_amount_cents, 0) ?? 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Winnings</h1>
        <p className="text-slate-400 mt-1">Your prize history and payout status</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-emerald-400">₹{(totalWon / 100).toFixed(2)}</p>
          <p className="text-sm text-slate-400 mt-1">Total earned</p>
        </div>
        <div className="bg-amber-950/30 border border-amber-500/20 rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-amber-400">₹{(pending / 100).toFixed(2)}</p>
          <p className="text-sm text-slate-400 mt-1">Pending payout</p>
        </div>
      </div>
      <WinningsOverview winners={winners ?? []} />
    </div>
  );
}
