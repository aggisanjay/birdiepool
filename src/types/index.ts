export type UserRole = 'user' | 'admin';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'expired' | 'trialing';
export type SubscriptionInterval = 'monthly' | 'yearly';
export type DrawStatus = 'draft' | 'simulated' | 'published' | 'completed';
export type DrawMode = 'random' | 'algorithmic';
export type MatchType = 'match_5' | 'match_4' | 'match_3';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  selected_charity_id: string | null;
  charity_contribution_pct: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  interval: SubscriptionInterval;
  amount_cents: number;
  currency: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at: string | null;
  cancelled_at: string | null;
  trial_end: string | null;
  prize_pool_contribution_cents: number;
  charity_contribution_cents: number;
  platform_revenue_cents: number;
  created_at: string;
  updated_at: string;
}

export interface Score {
  id: string;
  user_id: string;
  score: number;
  played_date: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  website_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  category: string | null;
  tags: string[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  total_raised_cents: number;
  supporter_count: number;
  created_at: string;
  updated_at: string;
}

export interface Draw {
  id: string;
  draw_month: string;
  mode: DrawMode;
  status: DrawStatus;
  numbers: number[] | null;
  total_pool_cents: number;
  match_5_pool_cents: number;
  match_4_pool_cents: number;
  match_3_pool_cents: number;
  rollover_cents: number;
  eligible_participants: number;
  match_5_count: number;
  match_4_count: number;
  match_3_count: number;
  simulation_results: unknown;
  executed_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  scores: number[];
  matched_numbers: number[];
  match_count: number;
  created_at: string;
}

export interface Winner {
  id: string;
  draw_id: string;
  draw_entry_id: string;
  user_id: string;
  match_type: MatchType;
  matched_numbers: number[];
  prize_amount_cents: number;
  verification_status: VerificationStatus;
  proof_image_url: string | null;
  proof_uploaded_at: string | null;
  verified_at: string | null;
  verified_by: string | null;
  rejection_reason: string | null;
  payment_status: PaymentStatus;
  paid_at: string | null;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
