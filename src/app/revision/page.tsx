'use client';

import React from 'react';
import { useRevisions, useCompleteRevision } from '@/hooks/use-learning';

export default function RevisionPage() {
  const { data: revisions, isLoading } = useRevisions();

  const dueItems = revisions?.filter((r) => r.status === 'DUE') || [];
  const upcomingItems = revisions?.filter((r) => r.status === 'UPCOMING') || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Spaced Revision Queue</h1>
        <p className="text-sm text-slate-400 mt-1">
          Deterministic 1-3-7-14-30 day review schedule anchored to Asia/Kolkata timezone.
        </p>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Loading Revisions...</div>
      ) : (
        <div className="space-y-8">
          {/* Due Now Queue */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
              <span>🔥 Due Today ({dueItems.length})</span>
            </h2>

            {dueItems.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                No due revision tasks for today. You are caught up!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dueItems.map((item) => (
                  <RevisionCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Queue */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-300">Upcoming Reviews ({upcomingItems.length})</h2>

            {upcomingItems.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">No upcoming scheduled reviews.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingItems.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                    <div className="text-xs font-semibold text-slate-300">{item.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Due: {item.dueDate} • Interval: {item.intervalDays}d
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RevisionCard({ item }: { item: any }) {
  const completeMutation = useCompleteRevision(item.id);

  return (
    <div className="p-6 bg-slate-900 border border-amber-500/20 rounded-2xl space-y-4 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-md font-semibold text-[10px]">
            DUE NOW
          </span>
          <span className="font-mono text-slate-500">Reviews done: {item.reviewCount}</span>
        </div>
        <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
        <p className="text-xs text-slate-400">Interval step: +{item.intervalDays} days</p>
      </div>

      <div className="flex space-x-3 pt-2">
        <button
          onClick={() => completeMutation.mutate({ outcome: 'SUCCESS' })}
          disabled={completeMutation.isPending}
          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-emerald-600/20"
        >
          ✓ Remembered (+Interval)
        </button>

        <button
          onClick={() => completeMutation.mutate({ outcome: 'FAIL' })}
          disabled={completeMutation.isPending}
          className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-semibold rounded-xl border border-red-500/30 transition"
        >
          ✗ Forgot (Reset)
        </button>
      </div>
    </div>
  );
}
