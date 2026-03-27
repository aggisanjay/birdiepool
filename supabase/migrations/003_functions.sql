-- supabase/migrations/003_functions.sql

CREATE OR REPLACE FUNCTION public.add_score(
    p_user_id UUID,
    p_score INTEGER,
    p_played_date DATE
)
RETURNS SETOF public.scores AS $$
DECLARE
    v_count INTEGER;
BEGIN
    IF p_score < 1 OR p_score > 45 THEN
        RAISE EXCEPTION 'Score must be between 1 and 45';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.scores
        WHERE user_id = p_user_id AND played_date = p_played_date
    ) THEN
        RAISE EXCEPTION 'A score already exists for this date';
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM public.scores WHERE user_id = p_user_id;

    IF v_count >= 5 THEN
        DELETE FROM public.scores WHERE user_id = p_user_id AND position = 5;
        UPDATE public.scores SET position = position + 1 WHERE user_id = p_user_id;
    ELSE
        UPDATE public.scores SET position = position + 1 WHERE user_id = p_user_id;
    END IF;

    RETURN QUERY
    INSERT INTO public.scores (user_id, score, played_date, position)
    VALUES (p_user_id, p_score, p_played_date, 1)
    RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_draw_eligible_users()
RETURNS TABLE (user_id UUID, scores INTEGER[]) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        ARRAY_AGG(s.score ORDER BY s.position) AS scores
    FROM public.profiles p
    INNER JOIN public.subscriptions sub
        ON sub.user_id = p.id
        AND sub.status IN ('active', 'trialing')
        AND sub.current_period_end > NOW()
    INNER JOIN public.scores s ON s.user_id = p.id
    GROUP BY p.id
    HAVING COUNT(s.id) = 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.calculate_prize_pool(p_draw_month DATE)
RETURNS TABLE (
    total_pool BIGINT,
    match_5_pool BIGINT,
    match_4_pool BIGINT,
    match_3_pool BIGINT,
    rollover BIGINT
) AS $$
DECLARE
    v_prize_pool_pct NUMERIC;
    v_match_5_pct NUMERIC;
    v_match_4_pct NUMERIC;
    v_match_3_pct NUMERIC;
    v_total_contributions BIGINT;
    v_previous_rollover BIGINT := 0;
BEGIN
    SELECT (value)::numeric INTO v_prize_pool_pct FROM public.platform_config WHERE key = 'prize_pool_pct';
    SELECT (value)::numeric INTO v_match_5_pct FROM public.platform_config WHERE key = 'match_5_pool_pct';
    SELECT (value)::numeric INTO v_match_4_pct FROM public.platform_config WHERE key = 'match_4_pool_pct';
    SELECT (value)::numeric INTO v_match_3_pct FROM public.platform_config WHERE key = 'match_3_pool_pct';

    SELECT COALESCE(SUM(prize_pool_contribution_cents), 0)
    INTO v_total_contributions
    FROM public.subscriptions
    WHERE status IN ('active', 'trialing')
    AND current_period_start <= (p_draw_month + INTERVAL '1 month' - INTERVAL '1 day')
    AND current_period_end >= p_draw_month;

    SELECT COALESCE(
        (SELECT d.match_5_pool_cents + d.rollover_cents
         FROM public.draws d
         WHERE d.draw_month < p_draw_month
         AND d.match_5_count = 0
         AND d.status IN ('published', 'completed')
         ORDER BY d.draw_month DESC
         LIMIT 1
        ), 0
    ) INTO v_previous_rollover;

    total_pool := v_total_contributions;
    match_5_pool := (v_total_contributions * v_match_5_pct / 100)::BIGINT;
    match_4_pool := (v_total_contributions * v_match_4_pct / 100)::BIGINT;
    match_3_pool := (v_total_contributions * v_match_3_pct / 100)::BIGINT;
    rollover := v_previous_rollover;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM public.profiles WHERE role = 'user'),
        'active_subscribers', (SELECT COUNT(*) FROM public.subscriptions WHERE status IN ('active', 'trialing')),
        'total_prize_pool_cents', (SELECT COALESCE(SUM(total_pool_cents + rollover_cents), 0) FROM public.draws WHERE status IN ('draft', 'simulated')),
        'total_charity_raised_cents', (SELECT COALESCE(SUM(total_raised_cents), 0) FROM public.charities),
        'total_draws_completed', (SELECT COUNT(*) FROM public.draws WHERE status = 'completed'),
        'total_winners', (SELECT COUNT(*) FROM public.winners WHERE verification_status = 'approved'),
        'total_paid_out_cents', (SELECT COALESCE(SUM(prize_amount_cents), 0) FROM public.winners WHERE payment_status = 'paid'),
        'pending_verifications', (SELECT COUNT(*) FROM public.winners WHERE verification_status = 'pending')
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_charity_raised(
    p_charity_id UUID,
    p_amount BIGINT
)
RETURNS void AS $$
BEGIN
    UPDATE public.charities
    SET
        total_raised_cents = total_raised_cents + p_amount,
        supporter_count = supporter_count + 1
    WHERE id = p_charity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
