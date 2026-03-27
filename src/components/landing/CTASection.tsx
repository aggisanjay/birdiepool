'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/50 via-slate-950 to-purple-950/50" />
      <div className="absolute inset-0"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" /></div>
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-2 mb-8">
          <Sparkles className="w-5 h-5 text-emerald-400" /><span className="text-emerald-400 font-semibold">Ready to make a difference?</span>
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black text-white mb-6">
          Your Next Round Could<br /><span className="text-gradient gradient-primary">Change Everything</span>
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
          Join thousands of golfers turning their passion into prizes and purpose. Subscribe today and enter next month&apos;s draw.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
          <Link href="/signup"><Button size="xl" variant="primary" icon={<ArrowRight className="w-5 h-5" />}>Get Started for ₹9.99/month</Button></Link>
          <p className="text-sm text-slate-500 mt-4">Cancel anytime. No commitments. Just golf and good vibes.</p>
        </motion.div>
      </div>
    </section>
  );
}
