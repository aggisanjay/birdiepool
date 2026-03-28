// import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
// import { redirect } from 'next/navigation';
// import { DrawConfigurator } from '@/components/admin/DrawConfigurator';
// import Link from 'next/link';

// export default async function AdminDrawsPage() {
//   const supabase = createServerSupabaseClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect('/login');
//   const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as any;
//   if ((profile as any)?.role !== 'admin') redirect('/dashboard');

//   const adminSupabase = createAdminSupabaseClient();
//   const { data: draws } = await adminSupabase.from('draws').select('*').order('draw_month', { ascending: false });

//   return (
//     <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-black text-white">Manage Draws</h1>
//         <Link href="/admin/draws/new"><button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold">+ New Draw</button></Link>
//       </div>
//       {draws && draws.length > 0 ? (
//         <div className="space-y-6">{draws.map(( draw: any ) => (<DrawConfigurator key={draw.id} draw={draw as Record<string, unknown>} onUpdate={() => window.location.reload()} />))}</div>
//       ) : (
//         <div className="text-center py-16 text-slate-400"><p className="text-lg">No draws yet.</p><p className="text-sm mt-2">Create the first monthly draw to get started.</p></div>
//       )}
//     </div>
//   );
// }

// src/app/(admin)/admin/draws/page.tsx
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DrawsClient } from '@/components/admin/DrawsClient';
import Link from 'next/link';

export default async function AdminDrawsPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const adminSupabase = createAdminSupabaseClient();
  const { data: draws } = await adminSupabase
    .from('draws')
    .select('*')
    .order('draw_month', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Manage Draws</h1>
          <p className="text-slate-400 mt-1">Create, simulate, execute and publish monthly draws</p>
        </div>
        <Link href="/admin/draws/new">
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors">
            + New Draw
          </button>
        </Link>
      </div>

      {draws && draws.length > 0 ? (
        <DrawsClient draws={draws} />
      ) : (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-slate-400 text-lg mb-2">No draws yet</p>
          <p className="text-slate-500 text-sm mb-6">Create the first monthly draw to get started</p>
          <Link href="/admin/draws/new">
            <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors">
              Create First Draw
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
