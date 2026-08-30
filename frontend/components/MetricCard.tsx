import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive,
  icon: Icon,
  badge,
}) => {
  return (
    <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-sm dark:shadow-lg relative overflow-hidden transition-all duration-200 hover-lift hover:border-indigo-500/30">
      {/* Top subtle highlight border line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 to-violet-500 opacity-70" />
      
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
        <div className="p-2.5 rounded-xl bg-muted text-muted-foreground border border-border">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-3xl font-bold font-mono-numbers tracking-tight">{value}</div>
      </div>

      {(subtitle || change || badge) && (
        <div className="mt-3.5 flex items-center justify-between text-xs pt-3 border-t border-border">
          {change && (
            <span className={`font-mono font-semibold flex items-center gap-0.5 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {isPositive ? '↑' : '↓'} {change}
            </span>
          )}
          {subtitle && <span className="text-muted-foreground">{subtitle}</span>}
          {badge && (
            <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-mono font-bold border border-border">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
