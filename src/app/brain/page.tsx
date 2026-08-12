'use client';

import React, { useState } from 'react';
import { useBrainContext, useBrainDecisions, useFocusSessions, useCreateFocusSession } from '@/hooks/use-global-brain';

export default function AICommandCenterPage() {
  const { data: contextData, isLoading: cLoading } = useBrainContext();
  const { data: decisions, isLoading: dLoading } = useBrainDecisions();
  const { data: sessions, isLoading: sLoading } = useFocusSessions();
  const createFocusMutation = useCreateFocusSession();

  const [commandText, setCommandText] = useState('');
  const [activeTab, setActiveTab] = useState<'command' | 'decisions' | 'focus'>('command');
  const [focusObjective, setFocusObjective] = useState('');
  const [focusDuration, setFocusDuration] = useState(45);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandText) return;
    setCommandText('');
  };

  const handleCreateFocus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusObjective) return;
    await createFocusMutation.mutateAsync({
      objective: focusObjective,
      plannedDurationMinutes: Number(focusDuration),
    });
    setFocusObjective('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">PHASE 10 GLOBAL BRAIN</span>
          <h1 className="text-3xl font-bold text-slate-100 mt-1">AI Command Center</h1>
          <p className="text-sm text-slate-400">
            Explainable AI Orchestrator • Deterministic Context • Bounded Decisions
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('command')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'command'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Command Console
          </button>
          <button
            onClick={() => setActiveTab('decisions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'decisions'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Decision Proposals ({decisions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('focus')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'focus'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Focus Sessions ({sessions?.length || 0})
          </button>
        </div>
      </div>

      {activeTab === 'command' && (
        <div className="space-y-6">
          {/* Command Prompt Box */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Ask AI Command Center</h2>
            <form onSubmit={handleCommandSubmit} className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. What should I study next? Why is revision a priority today?..."
                value={commandText}
                onChange={(e) => setCommandText(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition"
              >
                Send Command
              </button>
            </form>
          </div>

          {/* Current Brain Snapshot State */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Live System Evidence Snapshot
              </h2>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
                {cLoading ? '...' : contextData?.snapshot?.input_fingerprint || 'snap_active'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl">
                <div className="text-[10px] text-slate-500">Lessons Completed</div>
                <div className="text-xl font-bold text-slate-100">
                  {contextData?.snapshot?.context_payload?.learning?.lessonsCompleted || 0}
                </div>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl">
                <div className="text-[10px] text-slate-500">Open Mistakes</div>
                <div className="text-xl font-bold text-rose-400">
                  {contextData?.snapshot?.context_payload?.practice?.openMistakesCount || 0}
                </div>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl">
                <div className="text-[10px] text-slate-500">Due Revisions</div>
                <div className="text-xl font-bold text-amber-400">
                  {contextData?.snapshot?.context_payload?.revision?.dueRevisionsCount || 0}
                </div>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl">
                <div className="text-[10px] text-slate-500">Verified PYQs</div>
                <div className="text-xl font-bold text-cyan-400">
                  {contextData?.snapshot?.context_payload?.exam?.verifiedPyqCount || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'decisions' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Brain Decision Proposals</h2>
          {dLoading ? (
            <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading decisions...</div>
          ) : decisions && decisions.length > 0 ? (
            <div className="space-y-3">
              {decisions.map((d) => (
                <div key={d.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold rounded-md uppercase">
                      {d.decisionType} · Priority {d.priority}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {d.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{d.title}</h3>
                  <p className="text-xs text-slate-400">{d.summary}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-mono text-slate-500">Reason Codes:</span>
                    {d.reasonCodes.map((rc) => (
                      <span key={rc} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono rounded">
                        {rc}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
              No active decision proposals.
            </div>
          )}
        </div>
      )}

      {activeTab === 'focus' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Focus Session Form */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Start Focus Session</h2>
            <form onSubmit={handleCreateFocus} className="space-y-4">
              <input
                type="text"
                placeholder="Objective (e.g. Master CPU Scheduling Algorithms)..."
                value={focusObjective}
                onChange={(e) => setFocusObjective(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
              <input
                type="number"
                placeholder="Duration (Minutes)..."
                value={focusDuration}
                onChange={(e) => setFocusDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={createFocusMutation.isPending}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition"
              >
                {createFocusMutation.isPending ? 'Starting...' : 'Start Session'}
              </button>
            </form>
          </div>

          {/* Focus Sessions List */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Focus Sessions History</h2>
            {sLoading ? (
              <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading focus sessions...</div>
            ) : sessions && sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div key={s.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-mono rounded">
                        {s.sessionType} · {s.plannedDurationMinutes}m
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono rounded">
                        {s.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100">{s.objective}</h3>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
                No focus sessions created yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
