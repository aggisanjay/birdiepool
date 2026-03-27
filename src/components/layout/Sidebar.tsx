'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { LayoutDashboard, Target, Heart, Sparkles, Trophy, Settings, Users, BarChart3, CheckCircle, LogOut } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

const userLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Scores', href: '/dashboard/scores', icon: Target },
  { label: 'My Charity', href: '/dashboard/charity', icon: Heart },
  { label: 'Draws', href: '/dashboard/draws', icon: Sparkles },
  { label: 'Winnings', href: '/dashboard/winnings', icon: Trophy },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];
const adminLinks = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Draws', href: '/admin/draws', icon: Sparkles },
  { label: 'Charities', href: '/admin/charities', icon: Heart },
  { label: 'Winners', href: '/admin/winners', icon: CheckCircle },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export function Sidebar({ role }: { role: 'user' | 'admin' }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const links = role === 'admin' ? adminLinks : userLinks;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-emerald-400" />
          <span className="text-lg font-black text-white">BirdiePool</span>
        </Link>
        {role === 'admin' && <span className="inline-block mt-2 text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-semibold">Admin</span>}
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {links.map(( link: any ) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link key={link.href} href={link.href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50')}>
              <link.icon className="w-5 h-5" />{link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-800">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 w-full transition-all">
          <LogOut className="w-5 h-5" />Sign Out
        </button>
      </div>
    </aside>
  );
}
