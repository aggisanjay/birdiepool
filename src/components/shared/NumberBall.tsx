'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ─── NumberBall ───────────────────────────────────────────────────────────────
interface NumberBallProps { number: number; matched?: boolean; size?: 'sm' | 'md' | 'lg'; delay?: number; }
const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-xl' };

export function NumberBall({ number, matched = false, size = 'md', delay = 0 }: NumberBallProps) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay }}
      className={cn('rounded-full flex items-center justify-center font-bold shadow-lg', sizeMap[size],
        matched ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30'
          : 'bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 text-slate-800 dark:text-white'
      )}
    >{number}</motion.div>
  );
}
