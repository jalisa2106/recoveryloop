import React from 'react';
import { Decision } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Brain, ShieldAlert, CheckCircle2, AlertOctagon } from 'lucide-react';

interface DecisionCardProps {
  decision: Decision;
  className?: string;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({ decision, className = '' }) => {
  const confidencePercent = Math.round(decision.confidence * 100);

  return (
    <div className={`glass-card rounded-2xl p-6 relative overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200">Autonomous AI Decision</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">TXN: {decision.transaction_id}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <StatusBadge action={decision.selected_action} />
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/90 border border-indigo-100 dark:border-indigo-500/40">
            <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold">Confidence:</span>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{confidencePercent}%</span>
          </div>
        </div>
      </div>

      {/* Reasoning narrative */}
      <div className="mt-5">
        <h4 className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-2">Diagnostic & Reasoning Narrative</h4>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 font-sans">
          {decision.reasoning}
        </p>
      </div>

      {/* Blocked Actions Section */}
      {decision.blocked_actions && decision.blocked_actions.length > 0 && (
        <div className="mt-5">
          <h4 className="text-[10px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold mb-2.5 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> Blocked Alternative Actions ({decision.blocked_actions.length})
          </h4>
          <div className="space-y-2">
            {decision.blocked_actions.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl p-3.5 text-xs">
                <div className="flex items-center space-x-2 shrink-0">
                  <AlertOctagon className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                  <StatusBadge action={item.action} className="opacity-90 scale-90 origin-left" />
                </div>
                <span className="text-slate-600 dark:text-slate-400 text-right ml-4 max-w-md font-medium">{item.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Timestamp */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
        <span suppressHydrationWarning>Evaluated: {new Date(decision.timestamp).toLocaleString()}</span>
        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Explainable Audit Snapshot
        </span>
      </div>
    </div>
  );
};
