import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { handleApiError, UnauthorizedError, ForbiddenError } from '@/lib/utils/errors';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as any;
    if ((profile as any)?.role !== 'admin') throw new ForbiddenError();

    const adminSupabase = createAdminSupabaseClient();
    const { data: stats } = await adminSupabase.rpc('get_admin_stats');
    const { data: drawHistory } = await adminSupabase.from('draws').select('id, draw_month, status, total_pool_cents, rollover_cents, match_5_count, match_4_count, match_3_count, eligible_participants, numbers').in('status', ['published', 'completed']).order('draw_month', { ascending: false }).limit(12);
    const { data: topCharities } = await adminSupabase.from('charities').select('id, name, total_raised_cents, supporter_count').eq('is_active', true).order('total_raised_cents', { ascending: false }).limit(10);
    const { data: recentWinners } = await adminSupabase.from('winners').select('id, match_type, prize_amount_cents, verification_status, payment_status, created_at').order('created_at', { ascending: false }).limit(20);
    const { data: monthlyCount } = await adminSupabase.from('subscriptions').select('id', { count: 'exact' }).eq('interval', 'monthly').in('status', ['active', 'trialing']);
    const { data: yearlyCount } = await adminSupabase.from('subscriptions').select('id', { count: 'exact' }).eq('interval', 'yearly').in('status', ['active', 'trialing']);
    const { data: revenueData } = await adminSupabase.from('subscriptions').select('prize_pool_contribution_cents, charity_contribution_cents, platform_revenue_cents').in('status', ['active', 'trialing']);

    const revenue = revenueData?.reduce(( acc: any, sub: any ) => ({
      prizePool: acc.prizePool + (sub.prize_pool_contribution_cents ?? 0),
      charity: acc.charity + (sub.charity_contribution_cents ?? 0),
      platform: acc.platform + (sub.platform_revenue_cents ?? 0),
    }), { prizePool: 0, charity: 0, platform: 0 }) ?? { prizePool: 0, charity: 0, platform: 0 };

    const { data: allScores } = await adminSupabase.from('scores').select('score');
    const scoreFrequency: Record<number, number> = {};
    if (allScores) for (const s of allScores) scoreFrequency[s.score] = (scoreFrequency[s.score] ?? 0) + 1;

    return Response.json({ stats, subscriptionBreakdown: { monthly: monthlyCount?.length ?? 0, yearly: yearlyCount?.length ?? 0 }, revenue, drawHistory, topCharities, recentWinners, scoreFrequency });
  } catch (error) { return handleApiError(error); }
}
