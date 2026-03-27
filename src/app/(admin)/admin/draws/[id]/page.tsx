import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { DrawConfigurator } from '@/components/admin/DrawConfigurator';
import { NumberBall } from '@/components/shared/NumberBall';
import Link from 'next/link';

export default async function DrawDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const adminSupabase = createAdminSupabaseClient();
  const { data: draw } = await adminSupabase.from('draws').select('*').eq('id', params.id).single();
  if (!draw) notFound();

  const { data: entries } = await adminSupabase.from('draw_entries')
    .select('*, profiles!inner(full_name, email)').eq('draw_id', params.id).order('match_count', { ascending: false }).limit(50);

  const { data: winners } = await adminSupabase.from('winners')
    .select('*, profiles!inner(full_name)').eq('draw_id', params.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/draws" className="text-slate-400 hover:text-white text-sm">← Back to Draws</Link>
      </div>
      <DrawConfigurator draw={draw as Record<string, unknown>} onUpdate={() => {}} />

      {/* Winners */}
      {winners && winners.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Winners ({winners.length})</h2>
          <div className="space-y-2">
            {winners.map((w) => {
              const p = w.profiles as Record<string, string>;
              return (
                <div key={w.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl text-sm">
                  <div><p className="font-medium text-white">{p.full_name}</p><p className="text-xs text-slate-400 capitalize">{w.match_type.replace('_', ' ')}</p></div>
                  <p className="text-emerald-400 font-bold">₹{(w.prize_amount_cents / 100).toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Entries */}
      {entries && entries.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Entries ({entries.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {entries.map((entry) => {
              const p = entry.profiles as Record<string, string>;
              return (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl text-sm">
                  <div><p className="font-medium text-white">{p.full_name}</p>
                    <div className="flex gap-1 mt-1">{(entry.scores as number[]).map((n) => <NumberBall key={n} number={n} matched={(entry.matched_numbers as number[]).includes(n)} size="sm" />)}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${entry.match_count >= 3 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>{entry.match_count} matched</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
