import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { charityContributionSchema } from '@/lib/utils/validators';
import { handleApiError, UnauthorizedError, ValidationError } from '@/lib/utils/errors';

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();

    const body = await request.json();
    const validated = charityContributionSchema.parse(body);

    const { data: charity } = await supabase.from('charities').select('id').eq('id', validated.charity_id).eq('is_active', true).single() as any;
    if (!charity) throw new ValidationError('Selected charity not found or inactive');

    const { data: updatedProfile, error } = await supabase.from('profiles')
      .update({ selected_charity_id: validated.charity_id, charity_contribution_pct: validated.contribution_pct })
      .eq('id', user.id)
      .select('id, selected_charity_id, charity_contribution_pct, charities:selected_charity_id(id, name, logo_url)')
      .single() as any;
    if (error) throw error;
    return Response.json({ profile: updatedProfile });
  } catch (error) { return handleApiError(error); }
}
