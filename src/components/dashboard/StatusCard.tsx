import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  variant: 'default' | 'warning' | 'success' | 'info' | 'purple';
  isActive?: boolean;
  onClick?: () => void;
}

const variantStyles = {
  default: 'bg-slate-50 text-slate-600 border-slate-200',
  warning: 'bg-amber-50 text-amber-600 border-amber-200',
  success: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  info: 'bg-blue-50 text-blue-600 border-blue-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
};

const iconStyles = {
  default: 'bg-slate-100 text-slate-600',
  warning: 'bg-amber-100 text-amber-600',
  success: 'bg-emerald-100 text-emerald-600',
  info: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
};

export function StatusCard({ title, count, icon: Icon, variant, isActive, onClick }: StatusCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'card-stat border-2 transition-all',
        variantStyles[variant],
        isActive && 'ring-2 ring-primary ring-offset-2',
        onClick && 'cursor-pointer hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-1">{count}</p>
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
