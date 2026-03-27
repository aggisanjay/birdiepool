import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ScoreEntry } from '@/components/dashboard/ScoreEntry';
import { ScoreHistory } from '@/components/dashboard/ScoreHistory';

export default async function ScoresPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: subscription }, { data: scores }] = await Promise.all([
    supabase.from('subscriptions').select('status, current_period_end').eq('user_id', user.id).in('status', ['active','trialing']).single() as any,
    supabase.from('scores').select('*').eq('user_id', user.id).order('position', { ascending: true }),
  ]);
  const isActive = !!subscription && new Date(subscription.current_period_end!) > new Date();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div><h1 className="text-3xl font-black text-white">My Scores</h1><p className="text-slate-400 mt-1">Manage your 5 Stableford scores for the monthly draw</p></div>
      <ScoreEntry scores={scores ?? []} isActive={isActive} />
      <ScoreHistory scores={scores ?? []} />
    </div>
  );
}
