import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default async function AdminCharitiesPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as any;
  if ((profile as any)?.role !== 'admin') redirect('/dashboard');
  const adminSupabase = createAdminSupabaseClient();
  const { data: charities } = await adminSupabase.from('charities').select('*').order('sort_order', { ascending: true });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-white">Manage Charities</h1>
        <Link href="/admin/charities/new"><button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold">+ Add Charity</button></Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(charities ?? []).map((charity) => (
          <div key={charity.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-start gap-4">
            {charity.logo_url ? <Image src={charity.logo_url} alt={charity.name} width={48} height={48} className="rounded-xl object-cover shrink-0" />
              : <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0"><Heart className="w-5 h-5 text-rose-400" /></div>}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-white truncate">{charity.name}</h3>
                {charity.is_featured && <Badge variant="accent">Featured</Badge>}
                <Badge variant={charity.is_active ? 'success' : 'error'}>{charity.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 mb-2">{charity.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>₹{(charity.total_raised_cents / 100).toFixed(0)} raised</span>
                <span>{charity.supporter_count} supporters</span>
              </div>
            </div>
            <Link href={`/admin/charities/${charity.id}`} className="text-xs text-emerald-400 hover:text-emerald-300 shrink-0">Edit →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
