import { cn } from '@/lib/utils/cn';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-600" />
        </div>
      )}
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>}
      {action && <Button variant="primary" size="md" onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
