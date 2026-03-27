import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { verifyWinnerSchema } from '@/lib/utils/validators';
import { handleApiError, UnauthorizedError, ForbiddenError, NotFoundError, ValidationError } from '@/lib/utils/errors';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if ((profile as any)?.role !== 'admin') throw new ForbiddenError();

    const body = await request.json();
    const validated = verifyWinnerSchema.parse(body);
    const adminSupabase = createAdminSupabaseClient();

    const { data: winner } = await adminSupabase.from('winners').select('*').eq('id', params.id).single();
    if (!winner) throw new NotFoundError('Winner not found');
    if (winner.verification_status !== 'pending') throw new ValidationError('This winner has already been verified');
    if (validated.status === 'approved' && !winner.proof_image_url) throw new ValidationError('Cannot approve without proof upload');

    const updateData: Record<string, unknown> = { verification_status: validated.status, verified_at: new Date().toISOString(), verified_by: user.id };
    if (validated.status === 'rejected') updateData.rejection_reason = validated.rejection_reason ?? 'No reason provided';

    const { data: updatedWinner, error } = await adminSupabase.from('winners').update(updateData).eq('id', params.id).select().single();
    if (error) throw error;

    await adminSupabase.from('audit_log').insert({ actor_id: user.id, action: `winner_${validated.status}`, entity_type: 'winner', entity_id: params.id, metadata: { winner_user_id: winner.user_id, match_type: winner.match_type, prize_amount_cents: winner.prize_amount_cents } });
    return Response.json({ winner: updatedWinner });
  } catch (error) { return handleApiError(error); }
}
