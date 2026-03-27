import React from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white placeholder-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all',
          error ? 'border-red-500' : 'border-slate-700',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';
