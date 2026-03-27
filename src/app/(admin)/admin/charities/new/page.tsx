import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CharityForm } from '@/components/admin/CharityForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default async function NewCharityPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as any;
  if ((profile as any)?.role !== 'admin') redirect('/dashboard');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-black text-white mb-8">Add New Charity</h1>
      <Card><CardHeader><CardTitle>Charity Details</CardTitle></CardHeader><CardContent><CharityForm mode="create" /></CardContent></Card>
    </div>
  );
}
