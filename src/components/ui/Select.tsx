import React from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full appearance-none bg-slate-800/50 border rounded-xl px-4 py-3 text-white',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all',
            error ? 'border-red-500' : 'border-slate-700',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';
