import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WinnerVerification } from '@/components/admin/WinnerVerification';

export default async function AdminWinnersPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as any;
  if ((profile as any)?.role !== 'admin') redirect('/dashboard');

  const adminSupabase = createAdminSupabaseClient();
  const { data: winners } = await adminSupabase.from('winners')
    .select('*, profiles!inner(full_name, email), draws!inner(draw_month, numbers)')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="text-3xl font-black text-white">Winner Verification</h1>
      <WinnerVerification winners={(winners ?? []) as Parameters<typeof WinnerVerification>[0]['winners']} />
    </div>
  );
}
