import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers'; // ✅ FIX: ESM import, not require()
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';

export default async function AdminAnalyticsPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single() as any;
  if ((profile as any)?.role !== 'admin') redirect('/dashboard');

  // ✅ FIX: cookies() is async in Next.js 15 — must be awaited
  const cookieStore = await cookies();

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/analytics`, {
    headers: { Cookie: cookieStore.toString() },
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
