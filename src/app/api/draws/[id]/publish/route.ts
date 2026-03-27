import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { handleApiError, UnauthorizedError, ForbiddenError, NotFoundError, ValidationError } from '@/lib/utils/errors';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if ((profile as any)?.role !== 'admin') throw new ForbiddenError();

    const adminSupabase = createAdminSupabaseClient();
    const { data: draw } = await adminSupabase.from('draws').select('*').eq('id', params.id).single();
    if (!draw) throw new NotFoundError('Draw not found');
    if (draw.status !== 'simulated') throw new ValidationError('Draw must be in simulated status to publish. Execute the draw first.');

    const { data: updatedDraw, error } = await adminSupabase.from('draws')
      .update({ status: 'published' as never, published_at: new Date().toISOString() })
      .eq('id', params.id).select().single();
    if (error) throw error;

    const { data: winners } = await adminSupabase.from('winners')
      .select('id, user_id, match_type, prize_amount_cents').eq('draw_id', params.id);

    if (winners) {
      for (const winner of winners) {
        await adminSupabase.from('audit_log').insert({
          actor_id: user.id, action: 'winner_notified', entity_type: 'winner', entity_id: winner.id,
          metadata: { user_id: winner.user_id, match_type: winner.match_type, prize_amount_cents: winner.prize_amount_cents },
        });
      }
    }
    await adminSupabase.from('audit_log').insert({ actor_id: user.id, action: 'draw_published', entity_type: 'draw', entity_id: draw.id });
    return Response.json({ draw: updatedDraw, winnersNotified: winners?.length ?? 0 });
  } catch (error) { return handleApiError(error); }
}
