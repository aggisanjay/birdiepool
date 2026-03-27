import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';
import { handleApiError, UnauthorizedError, ValidationError } from '@/lib/utils/errors';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const body = await request.json();
    const { charity_id, amount_cents, is_anonymous, message } = body;
    if (!charity_id || !amount_cents || amount_cents < 100) throw new ValidationError('Invalid donation amount (minimum ₹1)');
    const { data: charity } = await supabase.from('charities').select('name').eq('id', charity_id).single() as any;
    if (!charity) throw new ValidationError('Charity not found');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'inr', product_data: { name: `Donation to ${charity.name}` }, unit_amount: amount_cents }, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?donation=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/charities`,
      metadata: { user_id: user.id, charity_id, is_anonymous: String(is_anonymous), message: message ?? '' },
    });

    return Response.json({ url: session.url });
  } catch (error) { return handleApiError(error); }
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: donations } = await supabase.from('donations').select('*, charities(name, logo_url)')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    return Response.json({ donations });
  } catch (error) { return handleApiError(error); }
}
