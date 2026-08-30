'use client';

import { useEffect, useState } from 'react';

export function BackendStatus() {
  const [status, setStatus] = useState<string>('Connecting...');
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setStatus('API ONLINE');
          setConnected(true);
        } else {
          setStatus('API RESPONSE ERR');
          setConnected(false);
        }
      })
      .catch(() => {
        setStatus('API OFFLINE');
        setConnected(false);
      });
  }, []);

  return (
    <div
      className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-[10px] font-mono border font-bold ${
        connected === true
          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
          : connected === false
          ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'
          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          connected === true ? 'bg-emerald-500 animate-pulse' : connected === false ? 'bg-rose-500' : 'bg-slate-400'
        }`}
      />
      {status}
    </div>
  );
}

export default BackendStatus;
