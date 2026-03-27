import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { handleApiError, UnauthorizedError, ForbiddenError } from '@/lib/utils/errors';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if ((profile as any)?.role !== 'admin') throw new ForbiddenError();
    const { data: config } = await supabase.from('platform_config').select('*');
    return Response.json({ config });
  } catch (error) { return handleApiError(error); }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if ((profile as any)?.role !== 'admin') throw new ForbiddenError();

    const body = await request.json();
    const adminSupabase = createAdminSupabaseClient();
    const updates = [];
    for (const [key, value] of Object.entries(body)) {
      updates.push(adminSupabase.from('platform_config').upsert({ key, value: value as never, updated_at: new Date().toISOString(), updated_by: user.id }));
    }
    await Promise.all(updates);
    return Response.json({ success: true });
  } catch (error) { return handleApiError(error); }
}
