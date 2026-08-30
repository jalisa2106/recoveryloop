'use client';

import React, { useState, useMemo } from 'react';
import mockData from '@/data/mock.json';
import { StatusBadge } from '@/components/StatusBadge';
import { DecisionCard } from '@/components/DecisionCard';
import { History, ChevronDown, ChevronUp, Search, ShieldCheck, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function AuditTrailPage() {
  const [expandedTxnId, setExpandedTxnId] = useState<string | null>(mockData[0].transaction_id);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'recovered' | 'unrecovered'>('all');

  const filteredAuditEntries = useMemo(() => {
    return mockData.filter((txn) => {
      const matchesSearch =
        txn.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.customer.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.decision.reasoning.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'recovered' && txn.audit_entry.recovered) ||
        (statusFilter === 'unrecovered' && !txn.audit_entry.recovered);

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const toggleExpand = (txnId: string) => {
    setExpandedTxnId((prev) => (prev === txnId ? null : txnId));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back to Overview & Header */}
      <div className="space-y-3">
        <Link
          href="/"
          className="inline-flex items-center space-x-1 text-xs font-mono font-semibold text-muted-foreground hover:text-accent transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-accent" /> Explainable Audit Trail
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Complete immutable log of all autonomous recovery decisions, confidence scores, blocked actions, and financial outcomes.
          </p>
        </div>
      </div>

      {/* Search & Controls Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit trail by TXN, reasoning..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-input border border-border text-foreground text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-accent font-mono transition"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground font-mono font-bold mr-1">Outcome:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-200 ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/10'
                : 'bg-input text-foreground border border-border hover:bg-muted active:scale-95'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('recovered')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-200 ${
              statusFilter === 'recovered'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/10'
                : 'bg-input text-foreground border border-border hover:bg-muted active:scale-95'
            }`}
          >
            Recovered
          </button>
          <button
            onClick={() => setStatusFilter('unrecovered')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-200 ${
              statusFilter === 'unrecovered'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/10'
                : 'bg-input text-foreground border border-border hover:bg-muted active:scale-95'
            }`}
          >
            Unrecovered
          </button>
        </div>
      </div>

      {/* Audit List Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm dark:shadow-lg">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between text-xs text-muted-foreground font-mono font-semibold">
          <span>{filteredAuditEntries.length} Audit Entries Logged</span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" /> Immutable Log Verification: ACTIVE
          </span>
        </div>

        <div className="divide-y divide-border">
          {filteredAuditEntries.map((txn) => {
            const isExpanded = expandedTxnId === txn.transaction_id;
            const audit = txn.audit_entry;

            return (
              <div key={txn.transaction_id} className="transition-all duration-200">
                {/* Main Row */}
                <div
                  onClick={() => toggleExpand(txn.transaction_id)}
                  className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-colors duration-200 ${
                    isExpanded ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-accent transition duration-150">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-accent" /> : <ChevronDown className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 font-mono">
                        <span className="font-bold text-accent text-xs">{txn.transaction_id}</span>
                        <span className="text-muted-foreground">•</span>
                        <span suppressHydrationWarning className="text-muted-foreground text-xs font-semibold">{new Date(audit.outcome_timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-foreground mt-1 line-clamp-1 max-w-xl font-sans font-medium">
                        {audit.decision_snapshot.reasoning}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold block">
                        ₹{txn.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono font-bold">
                        Conf: {(audit.decision_snapshot.confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    <StatusBadge action={audit.decision_snapshot.selected_action as any} />
                    <StatusBadge status={txn.status as any} />
                  </div>
                </div>

                {/* Expanded Glassmorphic Decision Card */}
                {isExpanded && (
                  <div className="p-6 bg-muted/50 border-t border-b border-border transition-all duration-200">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono font-bold mb-3.5">
                      <span>EXPANDED AUDIT DECISION SNAPSHOT</span>
                      <span>Customer: {txn.customer.customer_id}</span>
                    </div>

                    {/* Glassmorphic Decision Card */}
                    <DecisionCard decision={audit.decision_snapshot as any} />
                  </div>
                )}
              </div>
            );
          })}

          {filteredAuditEntries.length === 0 && (
            <div className="py-12 text-center text-muted-foreground font-mono text-xs">
              No audit entries match the current filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
