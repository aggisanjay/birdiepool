import { createServerSupabaseClient } from '@/lib/supabase/server';
import { handleApiError } from '@/lib/utils/errors';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: draw } = await supabase.from('draws').select('*')
      .in('status', ['draft', 'simulated', 'published'])
      .order('draw_month', { ascending: false }).limit(1).single();
    return Response.json({ draw: draw ?? null });
  } catch (error) { return handleApiError(error); }
}
