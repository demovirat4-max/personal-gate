'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  CheckSquare,
  FileText,
  Award,
  Calendar,
  CheckCircle2,
  Search,
  Bell,
  Settings,
  ChevronRight,
  Calculator,
} from 'lucide-react';
import { GateCalculatorModal } from '@/components/shared/GateCalculatorModal';

const NAV_ITEMS = [
  { name: 'Home', href: '/', icon: Home, exact: true },
  { name: 'Learn', href: '/learn', icon: BookOpen },
  { name: 'Practice', href: '/practice', icon: CheckSquare },
  { name: 'Knowledge', href: '/knowledge', icon: FileText },
  { name: 'Exams', href: '/exam', icon: Award },
  { name: 'Strategy', href: '/strategy', icon: Calendar },
  { name: 'Content Quality', href: '/content-quality', icon: CheckCircle2 },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentPathname = usePathname() || '/';
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--bg-page)] text-[var(--text-main)] overflow-hidden">
      {/* Accessible Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-[var(--bg-surface-elevated)] focus:text-[var(--accent-cyan)]"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar Navigation */}
      <aside
        className="hidden md:flex flex-col w-64 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] shrink-0"
        aria-label="Primary Navigation"
      >
        {/* Logo Area */}
        <div className="p-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-cyan-500/20">
            AI
          </div>
          <div>
            <h1 className="font-bold text-[15px] text-white tracking-wide">AI GATE OS</h1>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? currentPathname === item.href
              : currentPathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800/50 text-white border-l-2 border-[var(--accent-cyan)] pl-2.5 shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-white hover:bg-slate-800/30'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--accent-cyan)]' : 'opacity-70'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Area */}
        <div className="p-4 border-t border-[var(--border-subtle)]">
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-white">Pro Plan</span>
              <span className="text-[10px] text-slate-400">Valid till 12 Mar 2025</span>
            </div>
            <button className="w-full mt-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors border border-slate-600/50">
              Manage Plan
            </button>
          </div>

          <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/40 p-2 rounded-xl transition-colors">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-white border border-slate-600 shrink-0">
              Y
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">Yaksharth</div>
              <div className="text-[11px] text-slate-400 truncate">CS Aspirant</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--bg-page)]">
        {/* Top Application Bar */}
        <header className="h-16 px-6 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-[15px] font-semibold text-white truncate">
              {NAV_ITEMS.find((n) => currentPathname === n.href || (!n.exact && currentPathname.startsWith(n.href)))?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-slate-400">
            {/* GATE Scientific Calculator Button */}
            <button
              onClick={() => setIsCalcOpen(!isCalcOpen)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-semibold flex items-center space-x-1.5 transition shadow-sm"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>GATE Calc</span>
            </button>

            <button className="hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[var(--bg-surface)]"></span>
            </button>
            <Link href="/settings" className="hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar" tabIndex={-1}>
          {children}
        </main>

        {/* Mobile Navigation Bar */}
        <nav
          className="md:hidden flex items-center justify-around h-16 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] shrink-0 px-1"
          aria-label="Mobile Bottom Navigation"
        >
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentPathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[var(--accent-cyan)]' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="truncate w-full text-center px-1">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Floating GATE Calculator Modal */}
      <GateCalculatorModal isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />
    </div>
  );
};
