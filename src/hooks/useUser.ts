'use client';
import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          const { data } = await supabase.from('profiles').select('*, charities:selected_charity_id(id, name, logo_url)').eq('id', user.id).single() as any;
          setProfile(data);
        }
      } catch (err) { console.error('Error fetching user:', err); }
      finally { setLoading(false); }
    }
    fetchUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, loading, isAdmin: profile?.role === 'admin' };
}
