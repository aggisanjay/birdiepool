import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const relevantEvents = new Set([
  'checkout.session.completed', 'customer.subscription.created',
  'customer.subscription.updated', 'customer.subscription.deleted',
  'invoice.paid', 'invoice.payment_failed',
]);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  if (!signature) return Response.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    console.error('Webhook verification failed:', err instanceof Error ? err.message : err);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (!relevantEvents.has(event.type)) return Response.json({ received: true });

  const supabase = createAdminSupabaseClient();

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata.user_id;
        if (!userId) break;
        const priceItem = sub.items.data[0];
        const interval = priceItem?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly';
        const amountCents = priceItem?.price?.unit_amount ?? 0;
        const { data: profile } = await supabase.from('profiles').select('charity_contribution_pct').eq('id', userId).single();
        const charityPct = (profile as any)?.charity_contribution_pct ?? 10;
        const { data: configRow } = await supabase.from('platform_config').select('value').eq('key', 'prize_pool_pct').single();
        const prizePoolPct = configRow ? Number(configRow.value) : 50;
        const monthlyAmount = interval === 'yearly' ? Math.round(amountCents / 12) : amountCents;
        const charityContribution = Math.round(monthlyAmount * charityPct / 100);
        const prizePoolContribution = Math.round((monthlyAmount - charityContribution) * prizePoolPct / 100);
        const platformRevenue = monthlyAmount - charityContribution - prizePoolContribution;
        const statusMap: Record<string, string> = { active: 'active', trialing: 'trialing', past_due: 'past_due', canceled: 'cancelled', unpaid: 'expired' };
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: sub.customer as string,
          stripe_subscription_id: sub.id,
          stripe_price_id: priceItem?.price?.id,
          status: (statusMap[sub.status] ?? 'active') as never,
          interval: interval as never,
          amount_cents: amountCents,
          currency: priceItem?.price?.currency ?? 'inr',
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
          cancelled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
          trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          prize_pool_contribution_cents: prizePoolContribution,
          charity_contribution_cents: charityContribution,
          platform_revenue_cents: platformRevenue,
        }, { onConflict: 'stripe_subscription_id' });
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await supabase.from('subscriptions').update({ status: 'cancelled' as never, cancelled_at: new Date().toISOString() }).eq('stripe_subscription_id', sub.id);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) await supabase.from('subscriptions').update({ status: 'past_due' as never }).eq('stripe_subscription_id', invoice.subscription as string);
        break;
      }
    }
    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
