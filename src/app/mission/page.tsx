'use client';

import React from 'react';
import Link from 'next/link';
import { useDailyMission } from '@/hooks/use-learning';

export default function MissionPage() {
  const { data: mission, isLoading } = useDailyMission();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Daily Learning Mission</h1>
        <p className="text-sm text-slate-400 mt-1">
          Prioritized learning queue for Asia/Kolkata date: {mission?.date || 'Today'}
        </p>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Loading Today&apos;s Mission...</div>
      ) : !mission || mission.items.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
          <p className="text-slate-200 font-medium">All tasks completed for today!</p>
          <p className="text-xs text-slate-500">Check back tomorrow or explore the Learn section.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {mission.items.map((item, idx) => (
            <div
              key={item.id}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between transition group"
            >
              <div className="flex items-center space-x-4">
                <span className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-100 group-hover:text-cyan-400 transition">
                    {item.title}
                  </h3>
                  {item.subtitle && <p className="text-xs text-slate-400 mt-0.5">{item.subtitle}</p>}
                </div>
              </div>

              <Link
                href={item.targetUrl}
                className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white text-xs font-semibold rounded-xl border border-cyan-500/30 transition"
              >
                Action →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
