import Link from 'next/link';

export default function Navigation() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            RL
          </div>
          <div>
            <h1 className="font-semibold text-zinc-100 tracking-tight text-sm">RecoveryLoop</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Autonomous Revenue Recovery</p>
          </div>
        </div>
        <nav className="flex items-center gap-1">
          <Link href="/" className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors">
            Overview
          </Link>
          <Link href="/explorer" className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors">
            Transaction Explorer
          </Link>
          <Link href="/decision" className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors">
            Decision Detail
          </Link>
          <Link href="/audit" className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors">
            Audit Trail
          </Link>
        </nav>
      </div>
    </header>
  );
}
