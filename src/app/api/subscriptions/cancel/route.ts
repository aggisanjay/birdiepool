import { createServerSupabaseClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';
import { handleApiError, UnauthorizedError, NotFoundError } from '@/lib/utils/errors';

export async function POST() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();

    const { data: subscription } = await supabase.from('subscriptions').select('stripe_subscription_id').eq('user_id', user.id).in('status', ['active', 'trialing']).single() as any;
    if (!subscription?.stripe_subscription_id) throw new NotFoundError('No active subscription found');

    await stripe.subscriptions.update(subscription.stripe_subscription_id, { cancel_at_period_end: true });
    return Response.json({ success: true, message: 'Subscription will cancel at period end' });
  } catch (error) { return handleApiError(error); }
}
