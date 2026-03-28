// import { createServerSupabaseClient } from '@/lib/supabase/server';
// import { redirect } from 'next/navigation';
// import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';
// import { ScoreEntry } from '@/components/dashboard/ScoreEntry';
// import { DrawStatus } from '@/components/dashboard/DrawStatus';
// import { CharitySelector } from '@/components/dashboard/CharitySelector';
// import { WinningsOverview } from '@/components/dashboard/WinningsOverview';
// import { StatsGrid } from '@/components/dashboard/StatsGrid';

// export default async function DashboardPage() {
//   const supabase = createServerSupabaseClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect('/login');

//   const [
//     { data: profile },
//     { data: subscription },
//     { data: scores },
//     { data: selectedCharity },
//     { data: winners },
//     { data: currentDraw },
//   ] = await Promise.all([
//     supabase.from('profiles').select('*, charities:selected_charity_id(*)').eq('id', user.id).single() as any,
//     supabase.from('subscriptions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single() as any,
//     supabase.from('scores').select('*').eq('user_id', user.id).order('position', { ascending: true }),
//     supabase.from('profiles').select('selected_charity_id, charity_contribution_pct, charities:selected_charity_id(id, name, logo_url, description)').eq('id', user.id).single() as any,
//     supabase.from('winners').select('*, draws(draw_month, numbers)').eq('user_id', user.id).order('created_at', { ascending: false }),
//     supabase.from('draws').select('*').in('status', ['draft', 'simulated', 'published']).order('draw_month', { ascending: false }).limit(1).single() as any,
//   ]);

//   const isActive = subscription &&
//     ['active', 'trialing'].includes(subscription.status) &&
//     new Date(subscription.current_period_end!) > new Date();

//   const totalWon = winners?.reduce(( sum: any, w: any ) => w.payment_status === 'paid' ? sum + w.prize_amount_cents : sum, 0) ?? 0;
//   const pendingWinnings = winners?.reduce(( sum: any, w: any ) => w.payment_status === 'pending' && w.verification_status === 'approved' ? sum + w.prize_amount_cents : sum, 0) ?? 0;

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
//       <div>
//         <h1 className="text-3xl font-black text-white">
//           Welcome back, {(profile as any)?.display_name ?? (profile as any)?.full_name ?? 'Player'} 👋
//         </h1>
//         <p className="text-slate-400 mt-1">Here&apos;s your dashboard overview</p>
//       </div>
//       <StatsGrid isActive={!!isActive} scoreCount={scores?.length ?? 0} totalWon={totalWon} pendingWinnings={pendingWinnings} drawsEntered={winners?.length ?? 0} />
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2 space-y-8">
//           <SubscriptionCard subscription={subscription} isActive={!!isActive} />
//           <ScoreEntry scores={scores ?? []} isActive={!!isActive} />
//           <DrawStatus draw={currentDraw} scores={scores ?? []} />
//         </div>
//         <div className="space-y-8">
//           <CharitySelector selectedCharity={(selectedCharity as any)?.charities} contributionPct={(selectedCharity as any)?.charity_contribution_pct ?? 10} />
//           <WinningsOverview winners={winners ?? []} />
//         </div>
//       </div>
//     </div>
//   );
// }

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';
import { ScoreEntry } from '@/components/dashboard/ScoreEntry';
import { DrawStatus } from '@/components/dashboard/DrawStatus';
import { CharitySelector } from '@/components/dashboard/CharitySelector';
import { WinningsOverview } from '@/components/dashboard/WinningsOverview';
import { StatsGrid } from '@/components/dashboard/StatsGrid';

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [
    { data: profile },
    { data: subscription },
    { data: scores },
    { data: selectedCharity },
    { data: winners },
    { data: currentDraw },
  ] = await Promise.all([
    supabase.from('profiles').select('*, charities:selected_charity_id(*)').eq('id', user.id).single() as any,
    supabase.from('subscriptions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single() as any,
    supabase.from('scores').select('*').eq('user_id', user.id).order('position', { ascending: true }),
    supabase.from('profiles').select('selected_charity_id, charity_contribution_pct, charities:selected_charity_id(id, name, logo_url, description)').eq('id', user.id).single() as any,
    supabase.from('winners').select('*, draws(draw_month, numbers)').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('draws').select('*').in('status', ['draft', 'simulated', 'published']).order('draw_month', { ascending: false }).limit(1).single() as any,
  ]);

  const isActive = subscription &&
    ['active', 'trialing'].includes(subscription.status) &&
    new Date(subscription.current_period_end!) > new Date();

  // ✅ FIX: totalWon only counts payment_status === 'paid', matching the Winnings page logic.
  // Previously this was correct but the variable was passed to StatsGrid as "totalWon" which
  // some UI labels showed as "Total Earned" — now consistent: only paid amounts count.
  const totalWon = winners?.reduce((sum: any, w: any) =>
    w.payment_status === 'paid' ? sum + w.prize_amount_cents : sum, 0) ?? 0;

  const pendingWinnings = winners?.reduce((sum: any, w: any) =>
    w.payment_status === 'pending' && w.verification_status === 'approved'
      ? sum + w.prize_amount_cents
      : sum, 0) ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">
          Welcome back, {(profile as any)?.display_name ?? (profile as any)?.full_name ?? 'Player'} 👋
        </h1>
        <p className="text-slate-400 mt-1">Here&apos;s your dashboard overview</p>
      </div>
      <StatsGrid
        isActive={!!isActive}
        scoreCount={scores?.length ?? 0}
        totalWon={totalWon}
        pendingWinnings={pendingWinnings}
        drawsEntered={winners?.length ?? 0}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <SubscriptionCard subscription={subscription} isActive={!!isActive} />
          <ScoreEntry scores={scores ?? []} isActive={!!isActive} />
          <DrawStatus draw={currentDraw} scores={scores ?? []} />
        </div>
        <div className="space-y-8">
          <CharitySelector selectedCharity={(selectedCharity as any)?.charities} contributionPct={(selectedCharity as any)?.charity_contribution_pct ?? 10} />
          <WinningsOverview winners={winners ?? []} />
        </div>
      </div>
    </div>
  );
}
