import Navigation from '@/components/Navigation';
import BackendStatus from '@/components/BackendStatus';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navigation />
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <BackendStatus />
        <div className="border border-zinc-800 bg-zinc-900/50 rounded-xl p-8 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-2">Overview Dashboard</h2>
          <p className="text-sm text-zinc-400">
            Module 1 Scaffold — Placeholder Overview Route. Key metrics and comparison charts will be mounted here.
          </p>
        </div>
      </main>
    </div>
  );
}
