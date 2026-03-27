'use client';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { Activity, Target, Trophy, Clock } from 'lucide-react';

interface StatsGridProps { isActive: boolean; scoreCount: number; totalWon: number; pendingWinnings: number; drawsEntered: number; }

export function StatsGrid({ isActive, scoreCount, totalWon, pendingWinnings }: StatsGridProps) {
  const stats = [
    { label: 'Status', value: isActive ? 'Active' : 'Inactive', icon: Activity, color: isActive ? 'text-emerald-400' : 'text-red-400', bgColor: isActive ? 'bg-emerald-500/10' : 'bg-red-500/10', isCurrency: false },
    { label: 'Scores Entered', value: `${scoreCount}/5`, icon: Target, color: scoreCount === 5 ? 'text-emerald-400' : 'text-amber-400', bgColor: scoreCount === 5 ? 'bg-emerald-500/10' : 'bg-amber-500/10', isCurrency: false },
    { label: 'Total Won', value: totalWon, icon: Trophy, color: 'text-amber-400', bgColor: 'bg-amber-500/10', isCurrency: true },
    { label: 'Pending', value: pendingWinnings, icon: Clock, color: 'text-blue-400', bgColor: 'bg-blue-500/10', isCurrency: true },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">{stat.label}</span>
            <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}><stat.icon className={`w-4 h-4 ${stat.color}`} /></div>
          </div>
          <div className={`text-2xl font-black ${stat.color}`}>
            {stat.isCurrency ? <AnimatedCounter value={(stat.value as number) / 100} prefix="₹" decimals={2} /> : stat.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
