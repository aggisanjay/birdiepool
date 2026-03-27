'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; className?: string; hover?: boolean; glass?: boolean; padding?: 'none' | 'sm' | 'md' | 'lg'; }
const paddingStyles = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };

export function Card({ children, className, hover = false, glass = false, padding = 'md' }: CardProps) {
  const Component = hover ? motion.div : 'div';
  const motionProps = hover ? { whileHover: { y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }, transition: { type: 'spring', stiffness: 300, damping: 20 } } : {};
  return (
    <Component
      className={cn('rounded-2xl border', glass ? 'bg-white/5 backdrop-blur-xl border-white/10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800', 'shadow-sm', paddingStyles[padding], className)}
      {...motionProps}
    >{children}</Component>
  );
}
export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={cn('mb-4', className)}>{children}</div>; }
export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) { return <h3 className={cn('text-lg font-bold text-slate-900 dark:text-white', className)}>{children}</h3>; }
export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) { return <p className={cn('text-sm text-slate-500 dark:text-slate-400 mt-1', className)}>{children}</p>; }
export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={cn(className)}>{children}</div>; }
