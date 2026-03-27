'use client';
import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-white',
  outline: 'border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white',
  ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white',
  destructive: 'bg-red-600 hover:bg-red-700 text-white',
  accent: 'bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3 text-base rounded-xl',
  xl: 'px-9 py-4 text-lg rounded-2xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, fullWidth, className, disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant], sizeStyles[size],
        fullWidth && 'w-full', className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : icon ? <span className="mr-2">{icon}</span> : null}
      {children}
    </motion.button>
  )
);
Button.displayName = 'Button';
