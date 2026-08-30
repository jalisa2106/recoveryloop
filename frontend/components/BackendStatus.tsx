'use client';

import { useEffect, useState } from 'react';

export default function BackendStatus() {
  const [status, setStatus] = useState<string>('Checking backend connection...');
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setStatus('Backend connected: FastAPI /api/health OK');
          setConnected(true);
        } else {
          setStatus('Backend returned invalid response');
          setConnected(false);
        }
      })
      .catch((err) => {
        setStatus(`Backend disconnected (${err.message}). Ensure FastAPI server is running on http://localhost:8000`);
        setConnected(false);
      });
  }, []);

  return (
    <div className={`p-4 rounded-lg border font-mono text-xs mb-6 ${
      connected === true 
        ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400' 
        : connected === false 
        ? 'bg-amber-950/30 border-amber-800/50 text-amber-400'
        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
    }`}>
      <span className="inline-block w-2 h-2 rounded-full mr-2 animate-pulse bg-current" />
      {status}
    </div>
  );
}
