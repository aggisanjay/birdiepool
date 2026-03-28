import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { handleApiError, UnauthorizedError, ForbiddenError } from '@/lib/utils/errors';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single() as any;
    if ((profile as any)?.role !== 'admin') throw new ForbiddenError();

    const adminSupabase = createAdminSupabaseClient();

    const [
      { data: stats },
      { data: drawHistory },
      { data: topCharities },
      { data: recentWinners },
      { data: revenueData },
      { data: allScores },
      { data: signupRows },
    ] = await Promise.all([
      adminSupabase.rpc('get_admin_stats') as any,

      adminSupabase
        .from('draws')
        .select('id, draw_month, status, total_pool_cents, rollover_cents, match_5_count, match_4_count, match_3_count, eligible_participants, numbers')
        .in('status', ['published', 'completed'])
        .order('draw_month', { ascending: false })
        .limit(12) as any,

      adminSupabase
        .from('charities')
        .select('id, name, total_raised_cents, supporter_count')
        .eq('is_active', true)
        .order('total_raised_cents', { ascending: false })
        .limit(10) as any,

      // ✅ FIX: was missing profiles and draws joins — AnalyticsCharts accesses
      // w.profiles.full_name and w.draws.draw_month, causing a client-side crash
      // "Cannot read properties of undefined" when they were absent
      adminSupabase
        .from('winners')
        .select('id, match_type, prize_amount_cents, verification_status, payment_status, created_at, profiles!inner(full_name), draws!inner(draw_month)')
        .order('created_at', { ascending: false })
        .limit(20) as any,

      adminSupabase
        .from('subscriptions')
        .select('prize_pool_contribution_cents, charity_contribution_cents, platform_revenue_cents')
        .in('status', ['active', 'trialing']) as any,

      adminSupabase.from('scores').select('score') as any,

      // ✅ FIX: signupsByMonth was never computed — page was always getting {}
      adminSupabase
        .from('subscriptions')
        .select('created_at')
        .order('created_at', { ascending: true }) as any,
    ]);

    // Revenue totals
    const revenue = revenueData?.reduce((acc: any, sub: any) => ({
      prizePool: acc.prizePool + (sub.prize_pool_contribution_cents ?? 0),
      charity: acc.charity + (sub.charity_contribution_cents ?? 0),
      platform: acc.platform + (sub.platform_revenue_cents ?? 0),
    }), { prizePool: 0, charity: 0, platform: 0 }) ?? { prizePool: 0, charity: 0, platform: 0 };

    // Score frequency map
    const scoreFrequency: Record<number, number> = {};
    if (allScores) {
      for (const s of allScores as any[]) {
        scoreFrequency[s.score] = (scoreFrequency[s.score] ?? 0) + 1;
      }
    }

    // Signups grouped by "YYYY-MM"
    const signupsByMonth: Record<string, number> = {};
    if (signupRows) {
      for (const row of signupRows as any[]) {
        const month = (row.created_at as string).slice(0, 7);
        signupsByMonth[month] = (signupsByMonth[month] ?? 0) + 1;
      }
    }

    return Response.json({
      stats,
      revenue,
      drawHistory,
      topCharities,
      recentWinners,
      scoreFrequency,
      signupsByMonth,
    });
  } catch (error) { return handleApiError(error); }
}
