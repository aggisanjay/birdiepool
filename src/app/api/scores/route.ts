import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { scoreSchema } from '@/lib/utils/validators';
import { handleApiError, UnauthorizedError, ValidationError } from '@/lib/utils/errors';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: scores, error } = await supabase.from('scores').select('*').eq('user_id', user.id).order('position', { ascending: true });
    if (error) throw error;
    return Response.json({ scores: scores ?? [], count: scores?.length ?? 0, isComplete: (scores?.length ?? 0) === 5 });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();

    const { data: sub } = await supabase.from('subscriptions').select('status, current_period_end').eq('user_id', user.id).in('status', ['active', 'trialing']).single() as any;
    if (!sub || new Date(sub.current_period_end!) < new Date()) throw new ValidationError('Active subscription required to enter scores');

    const body = await request.json();
    const validated = scoreSchema.parse(body);
    const playedDate = new Date(validated.played_date);
    const today = new Date(); today.setHours(23, 59, 59, 999);
    if (playedDate > today) throw new ValidationError('Score date cannot be in the future');

    const adminSupabase = createAdminSupabaseClient();
    const { data: existingScore } = await adminSupabase.from('scores').select('id').eq('user_id', user.id).eq('played_date', validated.played_date).single() as any;
    if (existingScore) throw new ValidationError('A score already exists for this date');

    const { data: currentScores } = await adminSupabase.from('scores').select('id, position').eq('user_id', user.id).order('position', { ascending: true });
    const scoreCount = currentScores?.length ?? 0;

    if (scoreCount >= 5) {
      await adminSupabase.from('scores').delete().eq('user_id', user.id).eq('position', 5);
      for (let pos = 4; pos >= 1; pos--) await (adminSupabase.from('scores') as any).update({ position: pos + 1 }).eq('user_id', user.id).eq('position', pos);
    } else if (scoreCount > 0) {
      for (let pos = scoreCount; pos >= 1; pos--) await (adminSupabase.from('scores') as any).update({ position: pos + 1 }).eq('user_id', user.id).eq('position', pos);
    }

    const { data: newScore, error: insertError } = await (adminSupabase.from('scores') as any).insert({ user_id: user.id, score: validated.score, played_date: validated.played_date, position: 1 }).select().single() as any;
    if (insertError) throw insertError;

    const { data: allScores } = await adminSupabase.from('scores').select('*').eq('user_id', user.id).order('position', { ascending: true });
    return Response.json({ success: true, newScore, scores: allScores, count: allScores?.length ?? 0, isComplete: (allScores?.length ?? 0) === 5 }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
