'use client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { Heart, ExternalLink, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Charity { id: string; name: string; slug: string; description: string | null; logo_url: string | null; total_raised_cents: number; supporter_count: number; }

export function CharitySpotlight({ charities }: { charities: Charity[] }) {
  if (charities.length === 0) return null;
  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-full px-4 py-2 mb-6"><Heart className="w-4 h-4 text-rose-400" /><span className="text-sm text-rose-400 font-medium">Making a difference</span></div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Charities We Support</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">Every subscriber chooses a charity. Every month, a portion of your subscription goes directly to them.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charities.map((charity, index) => (
            <motion.div key={charity.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
              <Link href={`/charities/${charity.slug}`}>
                <Card hover className="h-full cursor-pointer">
                  <div className="flex items-start gap-4">
                    {charity.logo_url ? (
                      <Image src={charity.logo_url} alt={charity.name} width={56} height={56} className="rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0"><Heart className="w-6 h-6 text-rose-400" /></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg truncate">{charity.name}</h3>
                      <p className="text-sm text-slate-400 line-clamp-2 mt-1">{charity.description}</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div><p className="text-emerald-400 font-bold text-sm"><AnimatedCounter value={charity.total_raised_cents / 100} prefix="₹" decimals={0} /></p><p className="text-xs text-slate-500">Raised</p></div>
                      <div><div className="flex items-center gap-1"><Users className="w-3 h-3 text-blue-400" /><p className="text-blue-400 font-bold text-sm">{charity.supporter_count}</p></div><p className="text-xs text-slate-500">Supporters</p></div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-600" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-12">
          <Link href="/charities" className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors">View all charities →</Link>
        </motion.div>
      </div>
    </section>
  );
}
