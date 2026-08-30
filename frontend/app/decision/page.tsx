'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import mockData from '@/data/mock.json';
import { DecisionCard } from '@/components/DecisionCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Brain, User, CreditCard, Clock, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

function DecisionDetailContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');

  const [selectedTxnId, setSelectedTxnId] = useState<string>(queryId || mockData[0].transaction_id);

  useEffect(() => {
    if (queryId) {
      setSelectedTxnId(queryId);
    }
  }, [queryId]);

  const activeTxn = mockData.find((t) => t.transaction_id === selectedTxnId) || mockData[0];
  const historyScore = activeTxn.customer.payment_history_score;

  return (
    <div className="space-y-6">
      {/* Top Header & Back Button */}
      <div className="space-y-3">
        <Link
          href="/explorer"
          className="inline-flex items-center space-x-1 text-xs font-mono font-semibold text-muted-foreground hover:text-accent transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Explorer</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Brain className="w-5 h-5 text-accent" /> Decision Deep Dive
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Full diagnostic, customer risk context, autonomous agent reasoning, and blocked action logic.
            </p>
          </div>

          {/* Transaction Selector Dropdown */}
          <div className="flex items-center space-x-2.5">
            <span className="text-xs text-muted-foreground font-mono font-semibold">Inspect ID:</span>
            <select
              value={selectedTxnId}
              onChange={(e) => setSelectedTxnId(e.target.value)}
              className="bg-input border border-border text-foreground text-xs rounded-xl px-3 py-2.5 font-mono focus:outline-none focus:border-accent transition cursor-pointer"
            >
              {mockData.map((t) => (
                <option key={t.transaction_id} value={t.transaction_id}>
                  {t.transaction_id} - {t.failure_category.replace('_', ' ')} (₹{t.amount})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Layout: Customer & Transaction Info + Decision Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Context Cards */}
        <div className="space-y-6">
          {/* Customer Context Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 border-b border-border pb-3.5">
              <div className="p-2.5 rounded-xl bg-muted text-muted-foreground border border-border">
                <User className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Customer Context</h3>
                <p className="text-sm font-mono font-bold">{activeTxn.customer.customer_id}</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Account Tenure:</span>
                <span className="font-bold">{activeTxn.customer.tenure_days} days</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Customer Segment:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeTxn.customer.is_new_customer ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'}`}>
                  {activeTxn.customer.is_new_customer ? 'New (<30d)' : 'Established'}
                </span>
              </div>
              
              {/* Score Bar Visual Gauge */}
              <div className="py-1 border-b border-border">
                <div className="flex justify-between mb-1.5">
                  <span className="text-muted-foreground">Payment History Score:</span>
                  <span className="text-accent font-bold">{Math.round(historyScore * 100)} / 100</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-accent h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${historyScore * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Preferred Channel:</span>
                <span className="uppercase font-bold">{activeTxn.customer.contact_channel_pref}</span>
              </div>
            </div>
          </div>

          {/* Transaction Diagnostic Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 border-b border-border pb-3.5">
              <div className="p-2.5 rounded-xl bg-muted text-muted-foreground border border-border">
                <CreditCard className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Transaction Diagnostic</h3>
                <p className="text-sm font-mono font-bold">₹{activeTxn.amount.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="uppercase font-bold">{activeTxn.payment_method}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Subscription Type:</span>
                <span className="uppercase font-bold">{activeTxn.subscription_type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Failure Category:</span>
                <StatusBadge category={activeTxn.failure_category as any} />
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Gateway Code:</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">{activeTxn.failure_code}</span>
              </div>
              <div className="py-1">
                <span className="text-muted-foreground block mb-1.5">Raw Failure Message:</span>
                <span className="text-foreground bg-input p-3 rounded-xl block border border-border">
                  {activeTxn.failure_message}
                </span>
              </div>
            </div>
          </div>

          {/* Prior Attempts Timeline */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5 border-b border-border pb-3">
              <Clock className="w-4.5 h-4.5 text-accent" /> Prior Recovery Attempts ({activeTxn.prior_attempts.length})
            </h3>
            {activeTxn.prior_attempts.length === 0 ? (
              <p className="text-xs text-muted-foreground font-mono py-2 text-center">No prior retries; first-touch autonomous intervention.</p>
            ) : (
              <div className="space-y-3">
                {activeTxn.prior_attempts.map((att) => (
                  <div key={att.attempt_id} className="bg-muted p-3.5 rounded-xl border border-border text-xs flex justify-between items-center">
                    <div>
                      <StatusBadge action={att.action_taken as any} />
                      <span suppressHydrationWarning className="text-[10px] text-muted-foreground font-mono block mt-1">
                        {new Date(att.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <StatusBadge outcome={att.outcome as any} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Full AI Decision Card */}
        <div className="lg:col-span-2 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Autonomous Reasoning Snapshot</h2>
            <StatusBadge status={activeTxn.status as any} />
          </div>

          <DecisionCard decision={activeTxn.decision as any} />

          {/* Audit Snapshot Details */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm dark:shadow-lg space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Audit Record Snapshot</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono pt-1">
              <div className="bg-muted p-4 rounded-xl border border-border">
                <span className="text-muted-foreground block text-[10px] font-bold mb-1">RECOVERY OUTCOME</span>
                <span className={`font-bold ${activeTxn.audit_entry.recovered ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {activeTxn.audit_entry.recovered ? 'SUCCESSFUL' : 'PENDING / FAILED'}
                </span>
              </div>
              <div className="bg-muted p-4 rounded-xl border border-border">
                <span className="text-muted-foreground block text-[10px] font-bold mb-1">AMOUNT RECOVERED</span>
                <span className="font-bold">₹{activeTxn.audit_entry.amount_recovered.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-muted p-4 rounded-xl border border-border">
                <span className="text-muted-foreground block text-[10px] font-bold mb-1">OUTCOME TIMESTAMP</span>
                <span suppressHydrationWarning className="font-semibold">{new Date(activeTxn.audit_entry.outcome_timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DecisionDetailPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 font-mono text-xs text-muted-foreground">Loading Diagnostic Detail...</div>}>
      <DecisionDetailContent />
    </Suspense>
  );
}
