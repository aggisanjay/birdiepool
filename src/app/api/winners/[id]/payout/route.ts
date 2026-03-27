import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { handleApiError, UnauthorizedError, ForbiddenError, NotFoundError, ValidationError } from '@/lib/utils/errors';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as any;
    if ((profile as any)?.role !== 'admin') throw new ForbiddenError();

    const adminSupabase = createAdminSupabaseClient();
    const body = await request.json();
    const { data: winner } = await adminSupabase.from('winners').select('*').eq('id', params.id).single() as any;
    if (!winner) throw new NotFoundError('Winner not found');
    if (winner.verification_status !== 'approved') throw new ValidationError('Winner must be approved before payout');
    if (winner.payment_status === 'paid') throw new ValidationError('Winner has already been paid');

    const { data: updatedWinner, error } = await adminSupabase.from('winners')
      .update({ payment_status: 'paid' as never, paid_at: new Date().toISOString(), payment_reference: body.payment_reference ?? null })
      .eq('id', params.id).select().single() as any;
    if (error) throw error;

    const { data: remainingUnpaid } = await adminSupabase.from('winners').select('id').eq('draw_id', winner.draw_id).neq('payment_status', 'paid').limit(1);
    if (!remainingUnpaid || remainingUnpaid.length === 0) {
      await adminSupabase.from('draws').update({ status: 'completed' as never }).eq('id', winner.draw_id);
    }
    await adminSupabase.from('audit_log').insert({ actor_id: user.id, action: 'winner_paid', entity_type: 'winner', entity_id: params.id, metadata: { prize_amount_cents: winner.prize_amount_cents } });
    return Response.json({ winner: updatedWinner });
  } catch (error) { return handleApiError(error); }
}
