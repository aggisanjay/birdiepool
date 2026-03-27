'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Check, Zap } from 'lucide-react';
import Link from 'next/link';

const features = ['Enter 5 Stableford scores','Monthly prize draw entry','Choose your charity','Winner verification system','Full dashboard access','Score tracking history'];

export function PricingSection() {
  return (
    <section className="relative py-32 px-6" id="pricing">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Simple Pricing</h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">One plan. Everything included. Choose monthly or save with yearly.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-2">Monthly</h3>
            <div className="flex items-baseline gap-1 mb-6"><span className="text-5xl font-black text-white">₹9.99</span><span className="text-slate-400">/month</span></div>
            <ul className="space-y-3 mb-8">{features.map(( f: any ) => (<li key={f} className="flex items-center gap-3 text-slate-300"><Check className="w-5 h-5 text-emerald-400 shrink-0" />{f}</li>))}</ul>
            <Link href="/signup?plan=monthly"><Button variant="outline" size="lg" fullWidth>Get Started</Button></Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative bg-gradient-to-b from-emerald-950/50 to-slate-900/50 border border-emerald-500/30 rounded-3xl p-8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="inline-flex items-center gap-1 bg-emerald-500 text-white text-sm font-bold px-4 py-1.5 rounded-full"><Zap className="w-3.5 h-3.5" />Save 25%</div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Yearly</h3>
            <div className="flex items-baseline gap-1 mb-2"><span className="text-5xl font-black text-white">₹89.90</span><span className="text-slate-400">/year</span></div>
            <p className="text-sm text-emerald-400 mb-6">That&apos;s ₹7.49/month — save ₹30/year</p>
            <ul className="space-y-3 mb-8">{features.map(( f: any ) => (<li key={f} className="flex items-center gap-3 text-slate-300"><Check className="w-5 h-5 text-emerald-400 shrink-0" />{f}</li>))}</ul>
            <Link href="/signup?plan=yearly"><Button variant="primary" size="lg" fullWidth>Get Started — Best Value</Button></Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
