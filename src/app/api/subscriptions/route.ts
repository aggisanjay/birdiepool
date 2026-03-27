import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';
import { STRIPE_PRICES } from '@/lib/stripe/prices';
import { handleApiError, UnauthorizedError, ValidationError } from '@/lib/utils/errors';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();

    const body = await request.json();
    const { interval } = body;
    if (!['monthly', 'yearly'].includes(interval)) throw new ValidationError('Invalid subscription interval');

    const { data: profile } = await supabase.from('profiles').select('email, full_name').eq('id', user.id).single();

    const { data: existingSub } = await supabase.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).in('status', ['active', 'trialing']).single();
    const { data: prevSub } = await supabase.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();

    let stripeCustomerId: string;
    if (existingSub?.stripe_customer_id) {
      stripeCustomerId = existingSub.stripe_customer_id;
    } else if (prevSub?.stripe_customer_id) {
      stripeCustomerId = prevSub.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({ email: profile?.email ?? user.email, name: profile?.full_name, metadata: { user_id: user.id } });
      stripeCustomerId = customer.id;
    }

    const priceId = interval === 'yearly' ? STRIPE_PRICES.yearly : STRIPE_PRICES.monthly;
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?subscription=cancelled`,
      metadata: { user_id: user.id, interval },
      subscription_data: { metadata: { user_id: user.id, interval } },
    });

    return Response.json({ url: session.url });
  } catch (error) { return handleApiError(error); }
}
