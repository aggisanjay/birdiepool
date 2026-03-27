import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { Users, CreditCard, Trophy, Heart, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as any;
  if ((profile as any)?.role !== 'admin') redirect('/dashboard');

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/analytics`, {
    headers: { Cookie: require('next/headers').cookies().toString() },
    cache: 'no-store',
  }).catch(() => null);

  const analytics = res?.ok ? await res.json() : { stats: {} };
  const stats = analytics.stats ?? {};

  const statCards = [
    { label: 'Total Users', value: stats.total_users ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Active Subscribers', value: stats.active_subscribers ?? 0, icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Total Winners', value: stats.total_winners ?? 0, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Charity Raised', value: stats.total_charity_raised_cents ?? 0, icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10', isCurrency: true },
    { label: 'Total Paid Out', value: stats.total_paid_out_cents ?? 0, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10', isCurrency: true },
    { label: 'Pending Verifications', value: stats.pending_verifications ?? 0, icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Platform overview and management</p>
        </div>
        <Link href="/admin/draws/new">
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors">New Draw</button>
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(( stat: any ) => (
          <Card key={stat.label} padding="sm">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>
              {stat.isCurrency
                ? <AnimatedCounter value={stat.value / 100} prefix="₹" decimals={0} />
                : <AnimatedCounter value={stat.value} />}
            </p>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Manage Users', href: '/admin/users', icon: Users },
          { label: 'Manage Draws', href: '/admin/draws', icon: Trophy },
          { label: 'Manage Charities', href: '/admin/charities', icon: Heart },
          { label: 'Verify Winners', href: '/admin/winners', icon: AlertCircle, highlight: stats.pending_verifications > 0 },
        ].map(( link: any ) => (
          <Link key={link.label} href={link.href}>
            <Card hover className={link.highlight ? 'border-amber-500/30' : ''}>
              <div className="flex items-center gap-3">
                <link.icon className="w-5 h-5 text-slate-400" />
                <span className="font-semibold text-white">{link.label}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
