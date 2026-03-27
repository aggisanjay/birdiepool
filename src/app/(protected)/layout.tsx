import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar role={(profile?.role as 'user' | 'admin') ?? 'user'} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
