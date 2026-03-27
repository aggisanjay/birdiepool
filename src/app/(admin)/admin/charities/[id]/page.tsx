import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { CharityForm } from '@/components/admin/CharityForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default async function EditCharityPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if ((profile as any)?.role !== 'admin') redirect('/dashboard');

  const adminSupabase = createAdminSupabaseClient();
  const { data: charity } = await adminSupabase.from('charities').select('*').eq('id', params.id).single();
  if (!charity) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-black text-white mb-8">Edit Charity</h1>
      <Card><CardHeader><CardTitle>{charity.name}</CardTitle></CardHeader><CardContent><CharityForm charity={charity as never} mode="edit" /></CardContent></Card>
    </div>
  );
}
