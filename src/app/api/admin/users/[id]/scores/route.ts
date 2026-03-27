import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { handleApiError, UnauthorizedError, ForbiddenError, ValidationError } from '@/lib/utils/errors';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin') throw new ForbiddenError();

    const body = await request.json();
    const { scores } = body;
    if (!Array.isArray(scores)) throw new ValidationError('scores must be an array');

    const adminSupabase = createAdminSupabaseClient();
    for (const s of scores) {
      if (s.score < 1 || s.score > 45) throw new ValidationError(`Score ${s.score} is out of range [1-45]`);
      await adminSupabase.from('scores').update({ score: s.score, played_date: s.played_date }).eq('id', s.id).eq('user_id', params.id);
    }
    const { data: updatedScores } = await adminSupabase.from('scores').select('*').eq('user_id', params.id).order('position', { ascending: true });
    await adminSupabase.from('audit_log').insert({ actor_id: user.id, action: 'admin_scores_edited', entity_type: 'scores', entity_id: params.id, metadata: { updated_scores: scores } });
    return Response.json({ scores: updatedScores });
  } catch (error) { return handleApiError(error); }
}
