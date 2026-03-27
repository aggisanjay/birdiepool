import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { drawConfigSchema } from '@/lib/utils/validators';
import { handleApiError, UnauthorizedError, ForbiddenError, ValidationError } from '@/lib/utils/errors';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as any;
      isAdmin = profile?.role === 'admin';
    }
    let query = supabase.from('draws').select('*').order('draw_month', { ascending: false });
    if (!isAdmin) query = query.in('status', ['published', 'completed']);
    const { data: draws, error } = await query;
    if (error) throw error;
    return Response.json({ draws });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as any;
    if ((profile as any)?.role !== 'admin') throw new ForbiddenError();

    const body = await request.json();
    const validated = drawConfigSchema.parse(body);
    const adminSupabase = createAdminSupabaseClient();

    const { data: existingDraw } = await adminSupabase.from('draws').select('id').eq('draw_month', validated.draw_month).single() as any;
    if (existingDraw) throw new ValidationError('A draw already exists for this month');

    const { data: eligible } = await adminSupabase.rpc('get_draw_eligible_users');
    const { data: activeContributions } = await adminSupabase.from('subscriptions').select('prize_pool_contribution_cents').in('status', ['active', 'trialing']);
    const totalPool = activeContributions?.reduce(( sum: any, s: any ) => sum + (s.prize_pool_contribution_cents ?? 0), 0) ?? 0;

    const { data: configs } = await adminSupabase.from('platform_config').select('key, value').in('key', ['match_5_pool_pct', 'match_4_pool_pct', 'match_3_pool_pct']);
    const configMap = new Map(configs?.map(( c: any ) => [c.key, Number(c.value)]) ?? []);
    const match5Pct = configMap.get('match_5_pool_pct') ?? 40;
    const match4Pct = configMap.get('match_4_pool_pct') ?? 35;
    const match3Pct = configMap.get('match_3_pool_pct') ?? 25;

    const { data: previousDraw } = await adminSupabase.from('draws').select('match_5_pool_cents, rollover_cents, match_5_count').lt('draw_month', validated.draw_month).in('status', ['published', 'completed']).order('draw_month', { ascending: false }).limit(1).single() as any;
    const rollover = previousDraw && previousDraw.match_5_count === 0 ? previousDraw.match_5_pool_cents + previousDraw.rollover_cents : 0;

    const { data: draw, error } = await adminSupabase.from('draws').insert({
      draw_month: validated.draw_month, mode: validated.mode as never, status: 'draft' as never,
      total_pool_cents: totalPool, match_5_pool_cents: Math.round(totalPool * match5Pct / 100),
      match_4_pool_cents: Math.round(totalPool * match4Pct / 100), match_3_pool_cents: Math.round(totalPool * match3Pct / 100),
      rollover_cents: rollover, eligible_participants: eligible?.length ?? 0,
    }).select().single() as any;
    if (error) throw error;

    await adminSupabase.from('audit_log').insert({ actor_id: user.id, action: 'draw_created', entity_type: 'draw', entity_id: draw.id, metadata: { draw_month: validated.draw_month, mode: validated.mode } });
    return Response.json({ draw }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
