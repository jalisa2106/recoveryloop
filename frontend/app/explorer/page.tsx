'use client';

import React, { useState, useMemo } from 'react';
import mockData from '@/data/mock.json';
import { StatusBadge } from '@/components/StatusBadge';
import Link from 'next/link';
import { Search, Filter, ArrowUpRight, RefreshCw, ChevronLeft } from 'lucide-react';

export default function ExplorerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    return mockData.filter((txn) => {
      const matchesSearch =
        txn.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.customer.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.failure_code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || txn.failure_category === selectedCategory;

      const matchesStatus = selectedStatus === 'all' || txn.status === selectedStatus;

      const matchesMethod = selectedMethod === 'all' || txn.payment_method === selectedMethod;

      return matchesSearch && matchesCategory && matchesStatus && matchesMethod;
    });
  }, [searchTerm, selectedCategory, selectedStatus, selectedMethod]);

  const categories = [
    { label: 'All Categories', value: 'all' },
    { label: 'Technical Timeout', value: 'technical_timeout' },
    { label: 'Insufficient Funds', value: 'insufficient_funds' },
    { label: 'Card Expired', value: 'card_expired' },
    { label: 'Issuer Decline', value: 'issuer_decline' },
    { label: 'Wrong OTP', value: 'wrong_otp' },
    { label: 'Network Drop', value: 'network_drop' },
    { label: 'Suspected Fraud', value: 'suspected_fraud' },
  ];

  const statuses = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Recovered', value: 'recovered' },
    { label: 'Recovering', value: 'recovering' },
    { label: 'Failed', value: 'failed' },
    { label: 'Stopped', value: 'stopped' },
  ];

  const methods = [
    { label: 'All Methods', value: 'all' },
    { label: 'UPI', value: 'upi' },
    { label: 'Card', value: 'card' },
    { label: 'Netbanking', value: 'netbanking' },
    { label: 'Wallet', value: 'wallet' },
  ];

  return (
    <div className="space-y-6">
      {/* Back to Overview link & Header */}
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
            <Search className="w-5 h-5 text-accent" /> Transaction Recovery Explorer
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Search, filter, and inspect failed payments and their corresponding AI recovery decisions.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search TXN, Customer ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-input border border-border text-foreground text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-accent font-mono transition"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-muted-foreground font-mono font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-input border border-border text-foreground text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-accent transition cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-input border border-border text-foreground text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-accent transition cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="bg-input border border-border text-foreground text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-accent transition cursor-pointer"
          >
            {methods.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedMethod !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedMethod('all');
              }}
              className="text-xs text-accent hover:text-accent-hover font-mono font-semibold flex items-center gap-1 hover:underline transition"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm dark:shadow-lg">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>Showing {filteredTransactions.length} of {mockData.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-muted border-b border-border text-muted-foreground font-mono uppercase tracking-wider">
                <th className="py-3.5 px-5">Transaction ID</th>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Method</th>
                <th className="py-3.5 px-5">Failure Category</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5">Action Selected</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.map((txn) => (
                <tr key={txn.transaction_id} className="hover:bg-muted/50 transition">
                  <td className="py-4 px-5 font-mono font-bold text-accent">
                    {txn.transaction_id}
                  </td>
                  <td className="py-4 px-5 font-mono">
                    {txn.customer.customer_id}
                    <span className="block text-[10px] text-muted-foreground font-semibold mt-0.5">
                      Score: {txn.customer.payment_history_score}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-mono uppercase">
                    {txn.payment_method}
                  </td>
                  <td className="py-4 px-5">
                    <StatusBadge category={txn.failure_category as any} />
                  </td>
                  <td className="py-4 px-5 font-mono font-bold">
                    ₹{txn.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-5">
                    <StatusBadge action={txn.decision.selected_action as any} />
                  </td>
                  <td className="py-4 px-5">
                    <StatusBadge status={txn.status as any} />
                  </td>
                  <td className="py-4 px-5 text-right">
                    <Link
                      href={`/decision?id=${txn.transaction_id}`}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border font-mono text-[11px] font-bold hover-lift active:scale-95 transition"
                    >
                      <span>Detail</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground font-mono">
                    No transactions match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
