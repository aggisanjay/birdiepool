import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { handleApiError, UnauthorizedError, ForbiddenError } from '@/lib/utils/errors';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as any;

    if (profile?.role === 'admin') {
      const adminSupabase = createAdminSupabaseClient();
      const { data: winners } = await adminSupabase.from('winners')
        .select('*, profiles!inner(full_name, email), draws!inner(draw_month, numbers)')
        .order('created_at', { ascending: false });
      return Response.json({ winners });
    }

    const { data: winners } = await supabase.from('winners')
      .select('*, draws(draw_month, numbers)').eq('user_id', user.id).order('created_at', { ascending: false });
    return Response.json({ winners });
  } catch (error) { return handleApiError(error); }
}
