import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { handleApiError, UnauthorizedError, ForbiddenError } from '@/lib/utils/errors';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if ((profile as any)?.role !== 'admin') throw new ForbiddenError();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1');
    const limit = parseInt(url.searchParams.get('limit') ?? '25');
    const search = url.searchParams.get('search');
    const offset = (page - 1) * limit;

    const adminSupabase = createAdminSupabaseClient();
    let query = adminSupabase.from('profiles')
      .select('*, subscriptions(id, status, interval, amount_cents, current_period_end), scores(id, score, played_date, position), charities:selected_charity_id(id, name, logo_url)', { count: 'exact' })
      .order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

    const { data: users, count, error } = await query;
    if (error) throw error;
    return Response.json({ users, pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) } });
  } catch (error) { return handleApiError(error); }
}
