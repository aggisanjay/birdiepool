'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { ArrowRight, Heart, Trophy, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-8">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-400 font-medium">Golf meets purpose — a new way to play</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6">
          <span className="text-white">Your Scores.</span><br />
          <span className="text-gradient gradient-primary">Real Prizes.</span><br />
          <span className="text-white">Real Impact.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-12 leading-relaxed">
          Enter your golf scores, get matched in monthly prize draws, and donate a portion of your subscription to a charity you love.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/signup"><Button size="xl" variant="primary" icon={<ArrowRight className="w-5 h-5" />}>Start Playing — ₹9.99/mo</Button></Link>
          <Link href="/how-it-works"><Button size="xl" variant="outline">How It Works</Button></Link>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { icon: <Trophy className="w-6 h-6 text-amber-400" />, value: 15000, prefix: '₹', label: 'Total Prizes Won' },
            { icon: <Heart className="w-6 h-6 text-rose-400" />, value: 8500, prefix: '₹', label: 'Raised for Charity' },
            { icon: <Sparkles className="w-6 h-6 text-emerald-400" />, value: 1200, suffix: '+', label: 'Active Players' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {stat.icon}
                <span className="text-3xl font-black text-white"><AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} /></span>
              </div>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
