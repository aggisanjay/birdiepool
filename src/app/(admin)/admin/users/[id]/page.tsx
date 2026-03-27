import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { NumberBall } from '@/components/shared/NumberBall';
import Link from 'next/link';

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) redirect('/login');
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', adminUser.id).single() as any;
  if (adminProfile?.role !== 'admin') redirect('/dashboard');

  const adminSupabase = createAdminSupabaseClient();
  const { data: profile } = await adminSupabase.from('profiles')
    .select('*, subscriptions(*), scores(*), charities:selected_charity_id(id, name), winners(*, draws(draw_month, numbers))')
    .eq('id', params.id).single() as any;
  if (!profile) notFound();

  const activeSub = (profile.subscriptions as Record<string, unknown>[])?.find((s) => ['active','trialing'].includes(s.status as string));
  const scores = ((profile.scores as Record<string, unknown>[]) ?? []).sort((a, b) => (a.position as number) - (b.position as number));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="text-slate-400 hover:text-white text-sm">← Back to Users</Link>
      </div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">{profile.full_name}</h1>
          <p className="text-slate-400">{profile.email}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={profile.role === 'admin' ? 'accent' : 'default'}>{profile.role}</Badge>
          {activeSub ? <Badge variant="success">Active Subscriber</Badge> : <Badge variant="error">No Subscription</Badge>}
        </div>
      </div>

      {/* Current Scores */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Current Scores ({scores.length}/5)</h2>
        {scores.length > 0 ? (
          <div className="flex gap-3 flex-wrap">
            {scores.map((s) => <NumberBall key={s.id as string} number={s.score as number} matched={true} size="lg" />)}
          </div>
        ) : <p className="text-slate-500 text-sm">No scores entered</p>}
      </div>

      {/* Subscription */}
      {activeSub && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Subscription</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[['Plan', activeSub.interval as string], ['Amount', `₹${((activeSub.amount_cents as number) / 100).toFixed(2)}`], ['Status', activeSub.status as string], ['Renews', new Date(activeSub.current_period_end as string).toLocaleDateString('en-GB')]].map(([l, v]) => (
              <div key={l}><p className="text-slate-400 text-xs">{l}</p><p className="font-semibold text-white capitalize">{v}</p></div>
            ))}
          </div>
        </div>
      )}

      {/* Win history */}
      {profile.winners && (profile.winners as Record<string, unknown>[]).length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Win History</h2>
          <div className="space-y-2">
            {(profile.winners as Record<string, unknown>[]).map((w) => {
              const draw = w.draws as Record<string, unknown>;
              return (
                <div key={w.id as string} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl text-sm">
                  <div><p className="font-medium text-white">{new Date(draw.draw_month as string).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
                    <p className="text-xs text-slate-400 capitalize">{(w.match_type as string).replace('_', ' ')}</p></div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold">₹{((w.prize_amount_cents as number) / 100).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${w.verification_status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{w.verification_status as string}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
