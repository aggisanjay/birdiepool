import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';

export default async function AdminAnalyticsPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if ((profile as any)?.role !== 'admin') redirect('/dashboard');

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/analytics`, {
    headers: { Cookie: require('next/headers').cookies().toString() },
    cache: 'no-store',
  }).catch(() => null);
  const data = res?.ok ? await res.json() : {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="text-3xl font-black text-white">Analytics</h1>
      <AnalyticsCharts
        signupsByMonth={data.signupsByMonth ?? {}}
        revenue={data.revenue ?? { prizePool: 0, charity: 0, platform: 0 }}
        drawHistory={data.drawHistory ?? []}
        scoreFrequency={data.scoreFrequency ?? {}}
        topCharities={data.topCharities ?? []}
        recentWinners={data.recentWinners ?? []}
      />
    </div>
  );
}
