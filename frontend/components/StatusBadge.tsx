import React from 'react';
import { TransactionStatus, ActionTaken, Outcome, FailureCategory } from '@/types';

interface StatusBadgeProps {
  status?: TransactionStatus;
  action?: ActionTaken;
  outcome?: Outcome;
  category?: FailureCategory;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  action,
  outcome,
  category,
  className = '',
}) => {
  if (status) {
    const statusStyles: Record<TransactionStatus, { bg: string; border: string; text: string; dot: string; label: string }> = {
      recovered: { 
        bg: 'bg-emerald-50 dark:bg-emerald-950/80', 
        border: 'border-emerald-200 dark:border-emerald-500/30', 
        text: 'text-emerald-700 dark:text-emerald-400', 
        dot: 'bg-emerald-500',
        label: 'Recovered' 
      },
      recovering: { 
        bg: 'bg-amber-50 dark:bg-amber-950/80', 
        border: 'border-amber-200 dark:border-amber-500/30', 
        text: 'text-amber-700 dark:text-amber-400', 
        dot: 'bg-amber-500',
        label: 'Recovering' 
      },
      failed: { 
        bg: 'bg-rose-50 dark:bg-rose-950/80', 
        border: 'border-rose-200 dark:border-rose-500/30', 
        text: 'text-rose-700 dark:text-rose-400', 
        dot: 'bg-rose-500',
        label: 'Failed' 
      },
      stopped: { 
        bg: 'bg-slate-100 dark:bg-slate-800/80', 
        border: 'border-slate-300 dark:border-slate-600/30', 
        text: 'text-slate-700 dark:text-slate-400', 
        dot: 'bg-slate-400',
        label: 'Stopped' 
      },
    };

    const style = statusStyles[status] || statusStyles.failed;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.border} ${style.text} ${className}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.dot}`} />
        {style.label}
      </span>
    );
  }

  if (action) {
    const actionLabels: Record<ActionTaken, string> = {
      retry_now: 'Retry Now',
      retry_later: 'Schedule Retry',
      alt_method: 'Alt Method',
      payment_link: 'Payment Link',
      reminder: 'Smart Reminder',
      stop: 'Halt Recovery',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 ${className}`}>
        {actionLabels[action] || action}
      </span>
    );
  }

  if (outcome) {
    const outcomeStyles: Record<Outcome, { bg: string; border: string; text: string; label: string }> = {
      recovered: { 
        bg: 'bg-emerald-50 dark:bg-emerald-950/80', 
        border: 'border-emerald-200 dark:border-emerald-500/30', 
        text: 'text-emerald-700 dark:text-emerald-400', 
        label: 'Recovered' 
      },
      pending: { 
        bg: 'bg-amber-50 dark:bg-amber-950/80', 
        border: 'border-amber-200 dark:border-amber-500/30', 
        text: 'text-amber-700 dark:text-amber-400', 
        label: 'Pending' 
      },
      failed: { 
        bg: 'bg-rose-50 dark:bg-rose-950/80', 
        border: 'border-rose-200 dark:border-rose-500/30', 
        text: 'text-rose-700 dark:text-rose-400', 
        label: 'Failed' 
      },
    };

    const style = outcomeStyles[outcome] || outcomeStyles.failed;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-semibold border ${style.bg} ${style.border} ${style.text} ${className}`}>
        {style.label}
      </span>
    );
  }

  if (category) {
    const formatted = category.replace('_', ' ').toUpperCase();
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}>
        {formatted}
      </span>
    );
  }

  return null;
};
