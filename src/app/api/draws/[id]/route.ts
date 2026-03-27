import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { handleApiError, NotFoundError } from '@/lib/utils/errors';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: draw, error } = await supabase.from('draws').select('*').eq('id', params.id).single() as any;
    if (error || !draw) throw new NotFoundError('Draw not found');
    return Response.json({ draw });
  } catch (error) { return handleApiError(error); }
}
