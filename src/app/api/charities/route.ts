import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { charitySchema } from '@/lib/utils/validators';
import { handleApiError, UnauthorizedError, ForbiddenError } from '@/lib/utils/errors';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const featured = url.searchParams.get('featured');
    const page = parseInt(url.searchParams.get('page') ?? '1');
    const limit = parseInt(url.searchParams.get('limit') ?? '20');
    const offset = (page - 1) * limit;

    let query = supabase.from('charities').select('*, charity_events(*)', { count: 'exact' }).eq('is_active', true).order('sort_order', { ascending: true }).range(offset, offset + limit - 1);
    if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    if (category) query = query.eq('category', category);
    if (featured === 'true') query = query.eq('is_featured', true);

    const { data: charities, count, error } = await query;
    if (error) throw error;
    return Response.json({ charities, pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) } });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new ForbiddenError();

    const body = await request.json();
    const validated = charitySchema.parse(body);
    const adminSupabase = createAdminSupabaseClient();
    const { data: charity, error } = await adminSupabase.from('charities').insert(validated).select().single();
    if (error) throw error;
    return Response.json({ charity }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
