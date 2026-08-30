'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const chartData = [
  { category: 'Timeout', baseline: 42, recoveryLoop: 88 },
  { category: 'Insufficient Funds', baseline: 18, recoveryLoop: 64 },
  { category: 'Card Expired', baseline: 0, recoveryLoop: 75 },
  { category: 'Wrong OTP', baseline: 25, recoveryLoop: 82 },
  { category: 'Issuer Decline', baseline: 12, recoveryLoop: 58 },
  { category: 'Network Drop', baseline: 50, recoveryLoop: 95 },
];

export const RecoveryChart: React.FC = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? theme : 'dark';
  const gridColor = activeTheme === 'dark' ? '#1e293b' : '#e2e8f0';
  const labelColor = activeTheme === 'dark' ? '#64748b' : '#475569';
  const tooltipBg = activeTheme === 'dark' ? '#0f172a' : '#ffffff';
  const tooltipBorder = activeTheme === 'dark' ? '#334155' : '#cbd5e1';
  const tooltipText = activeTheme === 'dark' ? '#f8fafc' : '#0f172a';

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-lg transition-colors duration-200">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200">Recovery Rate Benchmark</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">RecoveryLoop Autonomous Agent vs Generic Fixed Retries (%)</p>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/40">
          +41% Lift
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="category" stroke={labelColor} tick={{ fontSize: 11, fontWeight: 500 }} />
            <YAxis stroke={labelColor} tick={{ fontSize: 11 }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ 
                backgroundColor: tooltipBg, 
                borderColor: tooltipBorder, 
                borderRadius: '12px', 
                fontSize: '12px',
                color: tooltipText,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
              itemStyle={{ color: tooltipText }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
            <Bar dataKey="baseline" name="Baseline Fixed Retries" fill={theme === 'dark' ? '#475569' : '#94a3b8'} radius={[4, 4, 0, 0]} />
            <Bar dataKey="recoveryLoop" name="RecoveryLoop Agent" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
