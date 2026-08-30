'use client';

import React from 'react';
import mockData from '@/data/mock.json';
import { MetricCard } from '@/components/MetricCard';
import { RecoveryChart } from '@/components/RecoveryChart';
import { DecisionCard } from '@/components/DecisionCard';
import { StatusBadge } from '@/components/StatusBadge';
import Link from 'next/link';
import { DollarSign, ShieldAlert, Zap, ArrowRight, Activity, Terminal } from 'lucide-react';

export default function OverviewPage() {
  const totalTransactions = mockData.length;
  const recoveredTransactions = mockData.filter((t) => t.status === 'recovered');
  const recoveringTransactions = mockData.filter((t) => t.status === 'recovering');
  
  const totalVolumeAtRisk = mockData.reduce((acc, t) => acc + t.amount, 0);
  const totalRecoveredVolume = recoveredTransactions.reduce((acc, t) => acc + t.amount, 0);
  const recoveryRate = Math.round((recoveredTransactions.length / totalTransactions) * 100);

  // Take latest decision for live highlight
  const latestDecision = mockData[0].decision;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" /> Executive Recovery Intelligence Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time autonomous payment failure recovery monitoring & decision engine performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/explorer"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md hover-lift active:scale-95 transition cursor-pointer"
          >
            <span>Explore Transactions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Revenue At Risk"
          value={`₹${totalVolumeAtRisk.toLocaleString('en-IN')}`}
          subtitle={`${totalTransactions} total failed payments`}
          icon={DollarSign}
        />
        <MetricCard
          title="Revenue Recovered"
          value={`₹${totalRecoveredVolume.toLocaleString('en-IN')}`}
          change="34.8% vs baseline retries"
          isPositive={true}
          icon={Zap}
          badge="AUTOMATED"
        />
        <MetricCard
          title="Autonomous Recovery Rate"
          value={`${recoveryRate}%`}
          subtitle={`${recoveredTransactions.length} of ${totalTransactions} resolved`}
          change="41% lift over baseline"
          isPositive={true}
          icon={Activity}
        />
        <MetricCard
          title="Interventions Avoided"
          value="98.2%"
          subtitle="Zero manual ops intervention"
          icon={ShieldAlert}
          badge="SAFEGUARD"
        />
      </div>

      {/* Main Grid: Chart + Live Decision Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Benchmark Chart */}
        <div className="lg:col-span-2 space-y-6">
          <RecoveryChart />

          {/* Quick Recent Activity Table */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm dark:shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold">Recent Payment Failures & Autonomous Decisions</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Real-time status of failure diagnostics and recovery responses</p>
              </div>
              <Link href="/explorer" className="text-xs text-accent font-semibold hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-muted border-b border-border text-muted-foreground font-mono uppercase tracking-wider">
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Failure Reason</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Chosen Action</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-sans">
                  {mockData.slice(0, 5).map((txn) => (
                    <tr key={txn.transaction_id} className="hover:bg-muted/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-accent">
                        <Link href={`/decision?id=${txn.transaction_id}`} className="hover:underline">
                          {txn.transaction_id}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge category={txn.failure_category as any} />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        ₹{txn.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge action={txn.decision.selected_action as any} />
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={txn.status as any} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Live AI Decision Spotlight */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Latest AI Decision Spotlight</h2>
            <span className="flex items-center space-x-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE AGENT</span>
            </span>
          </div>
          
          <DecisionCard decision={latestDecision as any} />

          {/* Quick Summary Widget */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-accent" /> Active Recovery Queue
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Recovering Transactions:</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{recoveringTransactions.length}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Average Confidence:</span>
                <span className="text-accent font-bold">91.4%</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Fallback Protection:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
