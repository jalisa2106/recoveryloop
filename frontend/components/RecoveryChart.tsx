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
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? resolvedTheme : 'dark';
  
  // Mapped strictly to globals.css Matte Charcoal hex values
  const gridColor = activeTheme === 'dark' ? '#27272a' : '#e4e4e7';
  const labelColor = activeTheme === 'dark' ? '#a1a1aa' : '#71717a';
  const tooltipBg = activeTheme === 'dark' ? '#18181b' : '#ffffff';
  const tooltipBorder = activeTheme === 'dark' ? '#27272a' : '#e4e4e7';
  const tooltipText = activeTheme === 'dark' ? '#fafafa' : '#09090b';

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-foreground">Recovery Rate Benchmark</h3>
          <p className="text-xs text-muted-foreground mt-0.5">RecoveryLoop Autonomous Agent vs Generic Fixed Retries (%)</p>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
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
            <Bar dataKey="baseline" name="Baseline Fixed Retries" fill={activeTheme === 'dark' ? '#3f3f46' : '#d4d4d8'} radius={[4, 4, 0, 0]} />
            <Bar dataKey="recoveryLoop" name="RecoveryLoop Agent" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};