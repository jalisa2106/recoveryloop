'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BackendStatus } from './BackendStatus';
import { ThemeToggle } from './ThemeToggle';
import { Activity, Search, Brain, History, ShieldCheck } from 'lucide-react';

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/', icon: Activity },
    { name: 'Transaction Explorer', href: '/explorer', icon: Search },
    { name: 'Decision Detail', href: '/decision', icon: Brain },
    { name: 'Audit Trail', href: '/audit', icon: History },
  ];

  return (
    <header className="bg-card/85 text-card-foreground border-b border-border sticky top-0 z-50 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-base font-sans">
                Recovery<span className="text-indigo-600 dark:text-indigo-400">Loop</span>
              </span>
              <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                FINTECH COMMAND
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-muted text-indigo-650 dark:text-indigo-400 border border-border shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-605 dark:text-indigo-400' : 'text-muted-foreground'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Theme Toggle & Backend Status */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <BackendStatus />
          </div>
        </div>
      </div>
    </header>
  );
};
