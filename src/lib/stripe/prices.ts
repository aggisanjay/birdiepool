export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID!,
  yearly: process.env.STRIPE_YEARLY_PRICE_ID!,
} as const;

export const PLAN_DETAILS = {
  monthly: {
    name: 'Monthly',
    price: 9.99,
    priceId: STRIPE_PRICES.monthly,
    interval: 'monthly' as const,
    description: '₹9.99/month',
  },
  yearly: {
    name: 'Yearly',
    price: 89.9,
    priceId: STRIPE_PRICES.yearly,
    interval: 'yearly' as const,
    description: '₹89.90/year (save ₹30)',
    savings: '25%',
  },
};
