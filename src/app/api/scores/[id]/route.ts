import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { handleApiError, UnauthorizedError, NotFoundError, ValidationError } from '@/lib/utils/errors';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const body = await request.json();
    const { score, played_date } = body;

    if (score !== undefined && (score < 1 || score > 45 || !Number.isInteger(score))) throw new ValidationError('Score must be an integer between 1 and 45');
    if (played_date && new Date(played_date) > new Date()) throw new ValidationError('Score date cannot be in the future');

    const { data: existingScore } = await supabase.from('scores').select('*').eq('id', params.id).eq('user_id', user.id).single();
    if (!existingScore) throw new NotFoundError('Score not found');

    if (played_date && played_date !== existingScore.played_date) {
      const { data: collision } = await supabase.from('scores').select('id').eq('user_id', user.id).eq('played_date', played_date).neq('id', params.id).single();
      if (collision) throw new ValidationError('A score already exists for this date');
    }

    const updateData: Record<string, unknown> = {};
    if (score !== undefined) updateData.score = score;
    if (played_date) updateData.played_date = played_date;

    const { data: updated, error } = await supabase.from('scores').update(updateData).eq('id', params.id).eq('user_id', user.id).select().single();
    if (error) throw error;
    return Response.json({ score: updated });
  } catch (error) { return handleApiError(error); }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const adminSupabase = createAdminSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();

    const { data: score } = await supabase.from('scores').select('position').eq('id', params.id).eq('user_id', user.id).single();
    if (!score) throw new NotFoundError('Score not found');

    await adminSupabase.from('scores').delete().eq('id', params.id);

    const { data: remainingScores } = await adminSupabase.from('scores').select('id, position').eq('user_id', user.id).gt('position', score.position).order('position', { ascending: true });
    if (remainingScores) {
      for (const s of remainingScores) {
        await adminSupabase.from('scores').update({ position: s.position - 1 }).eq('id', s.id);
      }
    }
    return Response.json({ success: true });
  } catch (error) { return handleApiError(error); }
}
