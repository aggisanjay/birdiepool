import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { charitySchema } from '@/lib/utils/validators';
import { handleApiError, UnauthorizedError, ForbiddenError, NotFoundError } from '@/lib/utils/errors';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: charity, error } = await supabase.from('charities')
      .select('*, charity_events(*)').eq('id', params.id).eq('is_active', true).single();
    if (error || !charity) throw new NotFoundError('Charity not found');
    return Response.json({ charity });
  } catch (error) { return handleApiError(error); }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new ForbiddenError();
    const body = await request.json();
    const validated = charitySchema.partial().parse(body);
    const adminSupabase = createAdminSupabaseClient();
    const { data: charity, error } = await adminSupabase.from('charities').update(validated).eq('id', params.id).select().single();
    if (error) throw error;
    return Response.json({ charity });
  } catch (error) { return handleApiError(error); }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new ForbiddenError();
    const adminSupabase = createAdminSupabaseClient();
    await adminSupabase.from('charities').update({ is_active: false }).eq('id', params.id);
    return Response.json({ success: true });
  } catch (error) { return handleApiError(error); }
}
