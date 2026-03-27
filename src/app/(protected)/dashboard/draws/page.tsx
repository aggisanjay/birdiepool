import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DrawStatus } from '@/components/dashboard/DrawStatus';
import { NumberBall } from '@/components/shared/NumberBall';
import { Badge } from '@/components/ui/Badge';

export default async function DrawsPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: scores }, { data: draws }, { data: myEntries }] = await Promise.all([
    supabase.from('scores').select('*').eq('user_id', user.id).order('position', { ascending: true }),
    supabase.from('draws').select('*').in('status', ['draft','simulated','published','completed']).order('draw_month', { ascending: false }).limit(12),
    supabase.from('draw_entries').select('*, draws(draw_month)').eq('user_id', user.id).order('created_at', { ascending: false }),
  ]);

  const currentDraw = draws?.find(( d: any ) => ['draft','simulated','published'].includes(d.status)) ?? null;
  const pastDraws = draws?.filter(( d: any ) => d.status === 'completed' || d.status === 'published') ?? [];
  const myEntryMap = new Map(myEntries?.map(( e: any ) => [e.draw_id, e]));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div><h1 className="text-3xl font-black text-white">Draws</h1><p className="text-slate-400 mt-1">Current and past monthly draw results</p></div>
      {currentDraw && <DrawStatus draw={currentDraw} scores={scores ?? []} />}
      {pastDraws.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Past Draws</h2>
          <div className="space-y-3">
            {pastDraws.map(( draw: any ) => {
              const myEntry = myEntryMap.get(draw.id);
              return (
                <div key={draw.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-white">{new Date(draw.draw_month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
                      <p className="text-xs text-slate-400">{draw.eligible_participants} participants · Pool: ₹{(draw.total_pool_cents / 100).toFixed(0)}</p>
                    </div>
                    <Badge variant={draw.status === 'completed' ? 'success' : 'info'}>{draw.status}</Badge>
                  </div>
                  {draw.numbers && (
                    <div className="flex gap-2 mb-3">
                      {(draw.numbers as number[]).map(( n: any ) => (
                        <NumberBall key={n} number={n} matched={myEntry ? (myEntry.matched_numbers as number[]).includes(n) : false} size="sm" />
                      ))}
                    </div>
                  )}
                  {myEntry ? (
                    <p className="text-xs text-emerald-400">✓ You entered · {myEntry.match_count} number{myEntry.match_count !== 1 ? 's' : ''} matched</p>
                  ) : (
                    <p className="text-xs text-slate-500">You did not enter this draw</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
