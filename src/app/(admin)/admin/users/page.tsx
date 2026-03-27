import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminUsersPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as any;
  if ((profile as any)?.role !== 'admin') redirect('/dashboard');

  const adminSupabase = createAdminSupabaseClient();
  const { data: users } = await adminSupabase.from('profiles')
    .select('*, subscriptions(id, status, interval, amount_cents)')
    .order('created_at', { ascending: false }).limit(50);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="text-3xl font-black text-white">Manage Users</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
            <th className="text-left px-6 py-4">User</th>
            <th className="text-left px-6 py-4">Role</th>
            <th className="text-left px-6 py-4">Subscription</th>
            <th className="text-left px-6 py-4">Joined</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {(users ?? []).map(( u: any ) => {
              const activeSub = (u.subscriptions as Record<string, unknown>[])?.find((s) => s.status === 'active' || s.status === 'trialing');
              return (
                <tr key={u.id} className="hover:bg-slate-800/50">
                  <td className="px-6 py-4"><p className="font-medium text-white">{u.full_name}</p><p className="text-slate-400 text-xs">{u.email}</p></td>
                  <td className="px-6 py-4"><span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-300'}`}>{u.role}</span></td>
                  <td className="px-6 py-4">{activeSub ? <span className="text-emerald-400 text-xs font-semibold">{activeSub.interval as string}</span> : <span className="text-slate-500 text-xs">None</span>}</td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
