import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Heart, Globe, Users, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function CharityDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: charity } = await supabase.from('charities').select('*, charity_events(*)').eq('slug', params.id).eq('is_active', true).single() as any;
  if (!charity) notFound();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="pt-24 max-w-4xl mx-auto px-6 pb-24">
        {/* Header */}
        <div className="flex items-start gap-6 py-12">
          {charity.logo_url ? (
            <Image src={charity.logo_url} alt={charity.name} width={80} height={80} className="rounded-2xl object-cover shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0"><Heart className="w-8 h-8 text-rose-400" /></div>
          )}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-white">{charity.name}</h1>
              {charity.is_featured && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full font-semibold">Featured</span>}
            </div>
            {charity.category && <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">{charity.category}</span>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[['₹' + (charity.total_raised_cents / 100).toFixed(0), 'Raised by BirdiePool', 'text-emerald-400', 'bg-emerald-500/10'],
            [charity.supporter_count.toString(), 'Active Supporters', 'text-blue-400', 'bg-blue-500/10'],
            [charity.tags?.length > 0 ? charity.tags[0] : 'Charity', 'Focus Area', 'text-purple-400', 'bg-purple-500/10']].map(([val, label, color, bg]) => (
            <div key={label} className={`${bg} border border-slate-800 rounded-2xl p-5 text-center`}>
              <p className={`text-2xl font-black ${color}`}>{val}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* About */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">About</h2>
          <p className="text-slate-300 leading-relaxed">{charity.long_description ?? charity.description}</p>
          <div className="mt-6 flex gap-4 flex-wrap">
            {charity.website_url && (
              <a href={charity.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300">
                <Globe className="w-4 h-4" /> Visit Website
              </a>
            )}
          </div>
        </div>

        {/* Events */}
        {charity.charity_events && charity.charity_events.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-400" />Events</h2>
            <div className="space-y-3">
              {charity.charity_events.filter((e: Record<string, unknown>) => e.is_active).map((event: Record<string, unknown>) => (
                <div key={event.id as string} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-bold text-white">{event.title as string}</h3>
                  {event.event_date && <p className="text-xs text-slate-400 mt-1">{new Date(event.event_date as string).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                  {event.location && <p className="text-xs text-slate-400">{event.location as string}</p>}
                  {event.description && <p className="text-sm text-slate-300 mt-2">{event.description as string}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-emerald-950/50 to-slate-900 border border-emerald-500/20 rounded-2xl p-8">
          <p className="text-lg font-bold text-white mb-2">Support {charity.name}</p>
          <p className="text-slate-400 text-sm mb-6">Subscribe to BirdiePool and choose this charity — a portion of every payment goes directly to them.</p>
          <Link href={`/signup`}><button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors">Get Started — ₹9.99/month</button></Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
