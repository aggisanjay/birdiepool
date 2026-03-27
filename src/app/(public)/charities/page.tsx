import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default async function CharitiesPage() {
  const supabase = createServerSupabaseClient();
  const { data: charities } = await supabase.from('charities').select('*').eq('is_active', true).order('sort_order', { ascending: true });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-white mb-4">Our Charities</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">Choose a cause you care about. Every month, a portion of your subscription goes directly to them.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(charities ?? []).map((charity) => (
            <div key={charity.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className="flex items-start gap-4 mb-4">
                {charity.logo_url ? (
                  <Image src={charity.logo_url} alt={charity.name} width={56} height={56} className="rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0"><Heart className="w-6 h-6 text-rose-400" /></div>
                )}
                <div>
                  <h3 className="font-bold text-white">{charity.name}</h3>
                  {charity.category && <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{charity.category}</span>}
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-4 line-clamp-3">{charity.description}</p>
              <div className="flex justify-between text-sm">
                <div><p className="text-emerald-400 font-bold">₹{(charity.total_raised_cents / 100).toFixed(0)}</p><p className="text-xs text-slate-500">Raised</p></div>
                <div><p className="text-blue-400 font-bold">{charity.supporter_count}</p><p className="text-xs text-slate-500">Supporters</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
