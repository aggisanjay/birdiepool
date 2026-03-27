import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { handleApiError, UnauthorizedError, ForbiddenError, NotFoundError } from '@/lib/utils/errors';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin') throw new ForbiddenError();

    const adminSupabase = createAdminSupabaseClient();
    const { data: userProfile, error } = await adminSupabase.from('profiles')
      .select('*, subscriptions(*), scores(*), charities:selected_charity_id(*), winners(*, draws(draw_month, numbers)), draw_entries(*, draws(draw_month, status))')
      .eq('id', params.id).single();
    if (error || !userProfile) throw new NotFoundError('User not found');
    return Response.json({ user: userProfile });
  } catch (error) { return handleApiError(error); }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin') throw new ForbiddenError();

    const body = await request.json();
    const adminSupabase = createAdminSupabaseClient();
    const allowedFields = ['full_name', 'display_name', 'role', 'selected_charity_id', 'charity_contribution_pct'];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) { if (body[field] !== undefined) updateData[field] = body[field]; }

    const { data: updated, error } = await adminSupabase.from('profiles').update(updateData).eq('id', params.id).select().single();
    if (error) throw error;
    await adminSupabase.from('audit_log').insert({ actor_id: user.id, action: 'admin_user_updated', entity_type: 'profile', entity_id: params.id, metadata: { fields_updated: Object.keys(updateData) } });
    return Response.json({ user: updated });
  } catch (error) { return handleApiError(error); }
}
