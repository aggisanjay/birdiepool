// src/app/(admin)/admin/winners/page.tsx
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WinnerVerification } from '@/components/admin/WinnerVerification';

export default async function AdminWinnersPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const adminSupabase = createAdminSupabaseClient();

  // Step 1: Get all winners
  const { data: winners, error: winnersError } = await adminSupabase
    .from('winners')
    .select('*')
    .order('created_at', { ascending: false });

  if (winnersError) {
    console.error('Winners fetch error:', winnersError);
  }

  // Step 2: Get all draw info
  const { data: draws } = await adminSupabase
    .from('draws')
    .select('id, draw_month, numbers');

  // Step 3: Get all user profiles
  const { data: profiles } = await adminSupabase
    .from('profiles')
    .select('id, full_name, email');

  // Step 4: Manually join the data
  const drawMap = new Map(draws?.map((d) => [d.id, d]) ?? []);
  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

  const enrichedWinners = (winners ?? []).map((w) => ({
    ...w,
    profiles: profileMap.get(w.user_id) ?? { full_name: 'Unknown', email: 'unknown@example.com' },
    draws: drawMap.get(w.draw_id) ?? { draw_month: '', numbers: [] },
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Winner Verification</h1>
        <p className="text-slate-400 mt-1">
          Review proof uploads, approve or reject winners, and mark payouts
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Pending Verification',
            count: enrichedWinners.filter((w) => w.verification_status === 'pending').length,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20',
          },
          {
            label: 'Approved',
            count: enrichedWinners.filter((w) => w.verification_status === 'approved').length,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
          },
          {
            label: 'Paid Out',
            count: enrichedWinners.filter((w) => w.payment_status === 'paid').length,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20',
          },
        ].map((stat) => (
          <div key={stat.label} className={`border rounded-xl p-4 text-center ${stat.bg}`}>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {enrichedWinners.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-slate-400 text-lg">No winners yet</p>
          <p className="text-slate-500 text-sm mt-2">
            Winners appear here after a draw is executed and published
          </p>
        </div>
      ) : (
        <WinnerVerification winners={enrichedWinners} />
      )}
    </div>
  );
}
