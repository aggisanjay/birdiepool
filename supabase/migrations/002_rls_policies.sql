-- supabase/migrations/002_rls_policies.sql

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.has_active_subscription()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.subscriptions
        WHERE user_id = auth.uid()
        AND status IN ('active', 'trialing')
        AND current_period_end > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ===== PROFILES =====
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.is_admin());

-- ===== SUBSCRIPTIONS =====
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Service role manages subscriptions" ON public.subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- ===== SCORES =====
CREATE POLICY "Users can view own scores" ON public.scores
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users can insert own scores" ON public.scores
    FOR INSERT WITH CHECK (user_id = auth.uid() AND public.has_active_subscription());
CREATE POLICY "Users can update own scores" ON public.scores
    FOR UPDATE USING (user_id = auth.uid() AND public.has_active_subscription());
CREATE POLICY "Users can delete own scores" ON public.scores
    FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all scores" ON public.scores
    FOR ALL USING (public.is_admin());

-- ===== CHARITIES =====
CREATE POLICY "Anyone can view active charities" ON public.charities
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage charities" ON public.charities
    FOR ALL USING (public.is_admin());

-- ===== CHARITY EVENTS =====
CREATE POLICY "Anyone can view active events" ON public.charity_events
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage events" ON public.charity_events
    FOR ALL USING (public.is_admin());

-- ===== DRAWS =====
CREATE POLICY "Published draws visible to authenticated" ON public.draws
    FOR SELECT USING (status = 'published' OR status = 'completed' OR public.is_admin());
CREATE POLICY "Admins can manage draws" ON public.draws
    FOR ALL USING (public.is_admin());

-- ===== DRAW ENTRIES =====
CREATE POLICY "Users can view own entries" ON public.draw_entries
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Service role manages entries" ON public.draw_entries
    FOR ALL USING (auth.role() = 'service_role' OR public.is_admin());

-- ===== WINNERS =====
CREATE POLICY "Users can view own wins" ON public.winners
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users can upload proof" ON public.winners
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage winners" ON public.winners
    FOR ALL USING (public.is_admin());

-- ===== DONATIONS =====
CREATE POLICY "Users can view own donations" ON public.donations
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Authenticated users can donate" ON public.donations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ===== PLATFORM CONFIG =====
CREATE POLICY "Anyone can read config" ON public.platform_config
    FOR SELECT USING (true);
CREATE POLICY "Admins can update config" ON public.platform_config
    FOR ALL USING (public.is_admin());

-- ===== AUDIT LOG =====
CREATE POLICY "Admins can view audit log" ON public.audit_log
    FOR SELECT USING (public.is_admin());
CREATE POLICY "Service role can insert audit" ON public.audit_log
    FOR INSERT WITH CHECK (true);
