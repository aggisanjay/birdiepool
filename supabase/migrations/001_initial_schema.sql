-- supabase/migrations/001_initial_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'expired', 'trialing');
CREATE TYPE subscription_interval AS ENUM ('monthly', 'yearly');
CREATE TYPE draw_status AS ENUM ('draft', 'simulated', 'published', 'completed');
CREATE TYPE draw_mode AS ENUM ('random', 'algorithmic');
CREATE TYPE winner_match_type AS ENUM ('match_5', 'match_4', 'match_3');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed');

-- ============================================
-- USERS (extends Supabase auth.users)
-- ============================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'user',
    phone TEXT,
    selected_charity_id UUID,
    charity_contribution_pct NUMERIC(5,2) NOT NULL DEFAULT 10.00
        CHECK (charity_contribution_pct >= 10.00 AND charity_contribution_pct <= 100.00),
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_customer_id TEXT NOT NULL,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    status subscription_status NOT NULL DEFAULT 'active',
    interval subscription_interval NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'gbp',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    prize_pool_contribution_cents INTEGER NOT NULL DEFAULT 0,
    charity_contribution_cents INTEGER NOT NULL DEFAULT 0,
    platform_revenue_cents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_one_active_sub_per_user
    ON public.subscriptions (user_id)
    WHERE status IN ('active', 'trialing');

-- ============================================
-- SCORES
-- ============================================

CREATE TABLE public.scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
    played_date DATE NOT NULL,
    position INTEGER NOT NULL CHECK (position >= 1 AND position <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_date UNIQUE (user_id, played_date),
    CONSTRAINT unique_user_position UNIQUE (user_id, position)
);

CREATE INDEX idx_scores_user_position ON public.scores (user_id, position);
CREATE INDEX idx_scores_user_date ON public.scores (user_id, played_date DESC);

-- ============================================
-- CHARITIES
-- ============================================

CREATE TABLE public.charities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    long_description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    website_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    total_raised_cents BIGINT NOT NULL DEFAULT 0,
    supporter_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_charities_active ON public.charities (is_active, sort_order);
CREATE INDEX idx_charities_featured ON public.charities (is_featured) WHERE is_featured = true;
CREATE INDEX idx_charities_slug ON public.charities (slug);

-- ============================================
-- CHARITY EVENTS
-- ============================================

CREATE TABLE public.charity_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ,
    location TEXT,
    image_url TEXT,
    external_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- DRAWS
-- ============================================

CREATE TABLE public.draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_month DATE NOT NULL,
    mode draw_mode NOT NULL DEFAULT 'random',
    status draw_status NOT NULL DEFAULT 'draft',
    numbers INTEGER[] CHECK (array_length(numbers, 1) = 5),
    total_pool_cents BIGINT NOT NULL DEFAULT 0,
    match_5_pool_cents BIGINT NOT NULL DEFAULT 0,
    match_4_pool_cents BIGINT NOT NULL DEFAULT 0,
    match_3_pool_cents BIGINT NOT NULL DEFAULT 0,
    rollover_cents BIGINT NOT NULL DEFAULT 0,
    eligible_participants INTEGER NOT NULL DEFAULT 0,
    match_5_count INTEGER NOT NULL DEFAULT 0,
    match_4_count INTEGER NOT NULL DEFAULT 0,
    match_3_count INTEGER NOT NULL DEFAULT 0,
    simulation_results JSONB,
    executed_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_draw_month UNIQUE (draw_month)
);

CREATE INDEX idx_draws_month ON public.draws (draw_month DESC);
CREATE INDEX idx_draws_status ON public.draws (status);

-- ============================================
-- DRAW ENTRIES
-- ============================================

CREATE TABLE public.draw_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scores INTEGER[] NOT NULL CHECK (array_length(scores, 1) = 5),
    matched_numbers INTEGER[] DEFAULT '{}',
    match_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_draw_entry UNIQUE (draw_id, user_id)
);

CREATE INDEX idx_draw_entries_draw ON public.draw_entries (draw_id);
CREATE INDEX idx_draw_entries_user ON public.draw_entries (user_id);
CREATE INDEX idx_draw_entries_match ON public.draw_entries (draw_id, match_count DESC);

-- ============================================
-- WINNERS
-- ============================================

CREATE TABLE public.winners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    draw_entry_id UUID NOT NULL REFERENCES public.draw_entries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    match_type winner_match_type NOT NULL,
    matched_numbers INTEGER[] NOT NULL,
    prize_amount_cents BIGINT NOT NULL,
    verification_status verification_status NOT NULL DEFAULT 'pending',
    proof_image_url TEXT,
    proof_uploaded_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id),
    rejection_reason TEXT,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    payment_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_winners_draw ON public.winners (draw_id);
CREATE INDEX idx_winners_user ON public.winners (user_id);
CREATE INDEX idx_winners_verification ON public.winners (verification_status);
CREATE INDEX idx_winners_payment ON public.winners (payment_status);

-- ============================================
-- DONATIONS
-- ============================================

CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    currency TEXT NOT NULL DEFAULT 'gbp',
    stripe_payment_intent_id TEXT,
    status payment_status NOT NULL DEFAULT 'pending',
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PLATFORM CONFIGURATION
-- ============================================

CREATE TABLE public.platform_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id)
);

INSERT INTO public.platform_config (key, value, description) VALUES
    ('subscription_monthly_price_cents', '999', 'Monthly subscription price in pence'),
    ('subscription_yearly_price_cents', '8990', 'Yearly subscription price in pence (save ~25%)'),
    ('prize_pool_pct', '50', 'Percentage of subscription allocated to prize pool'),
    ('match_5_pool_pct', '40', 'Percentage of prize pool for 5-match'),
    ('match_4_pool_pct', '35', 'Percentage of prize pool for 4-match'),
    ('match_3_pool_pct', '25', 'Percentage of prize pool for 3-match'),
    ('min_charity_pct', '10', 'Minimum charity contribution percentage'),
    ('jackpot_rollover_enabled', 'true', 'Whether unclaimed 5-match jackpot rolls over'),
    ('draw_day_of_month', '28', 'Day of month draws are executed'),
    ('currency', '"gbp"', 'Platform currency');

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_actor ON public.audit_log (actor_id, created_at DESC);
CREATE INDEX idx_audit_log_entity ON public.audit_log (entity_type, entity_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_scores_updated_at BEFORE UPDATE ON public.scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_charities_updated_at BEFORE UPDATE ON public.charities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_draws_updated_at BEFORE UPDATE ON public.draws
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_winners_updated_at BEFORE UPDATE ON public.winners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- PROFILE CREATION TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
