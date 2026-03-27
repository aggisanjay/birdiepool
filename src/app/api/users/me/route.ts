import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { handleApiError, UnauthorizedError } from '@/lib/utils/errors';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: profile } = await supabase.from('profiles')
      .select('*, charities:selected_charity_id(id, name, logo_url, description)').eq('id', user.id).single();
    return Response.json({ profile });
  } catch (error) { return handleApiError(error); }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const body = await request.json();
    const allowed = ['full_name', 'display_name', 'phone', 'onboarding_completed'];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) { if (body[key] !== undefined) updates[key] = body[key]; }
    const { data: profile, error } = await supabase.from('profiles').update(updates).eq('id', user.id).select().single();
    if (error) throw error;
    return Response.json({ profile });
  } catch (error) { return handleApiError(error); }
}
