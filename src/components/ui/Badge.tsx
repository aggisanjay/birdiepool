import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent';
interface BadgeProps { children: React.ReactNode; variant?: BadgeVariant; className?: string; }
const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-800 text-slate-300',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  accent: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};
export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', variantStyles[variant], className)}>{children}</span>;
}
