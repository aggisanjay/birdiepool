import { createServerSupabaseClient } from '@/lib/supabase/server';
import { handleApiError, UnauthorizedError } from '@/lib/utils/errors';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();

    const { data: subscription } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();
    if (!subscription) return Response.json({ status: 'none', isActive: false, subscription: null });

    const isActive = ['active', 'trialing'].includes(subscription.status) && new Date(subscription.current_period_end!) > new Date();
    return Response.json({
      status: subscription.status,
      isActive,
      subscription: {
        id: subscription.id, interval: subscription.interval, status: subscription.status,
        currentPeriodEnd: subscription.current_period_end, cancelAt: subscription.cancel_at,
        amountCents: subscription.amount_cents, currency: subscription.currency,
      },
    });
  } catch (error) { return handleApiError(error); }
}
