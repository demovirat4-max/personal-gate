'use client';

import React, { useState } from 'react';
import {
  useContentSources,
  useCreateContentSource,
  useContentQualityIssues,
  useContentCoverage,
} from '@/hooks/use-content-quality';

export default function ContentQualityPage() {
  const { data: sources, isLoading: sLoading } = useContentSources();
  const { data: issues, isLoading: iLoading } = useContentQualityIssues();
  const { data: coverage, isLoading: cLoading } = useContentCoverage();

  const createSourceMutation = useCreateContentSource();
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'issues'>('overview');
  const [title, setTitle] = useState('');
  const [publisher, setPublisher] = useState('GATE Official');
  const [examYear, setExamYear] = useState(2026);

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    await createSourceMutation.mutateAsync({
      sourceType: 'OFFICIAL_EXAM',
      title,
      publisher,
      examYear: Number(examYear),
    });
    setTitle('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
            DATA QUALITY & PROVENANCE ENGINE
          </span>
          <h1 className="text-3xl font-bold text-slate-100 mt-1">Unified Content Quality UI</h1>
          <p className="text-sm text-slate-400">
            Audit content provenance, PYQ verification status, and curriculum data integrity
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'overview'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'sources'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Sources ({sources?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'issues'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Audit Issues ({issues?.length || 0})
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 uppercase font-mono">PYQ Verification Ratio</span>
            <div className="text-2xl font-bold text-slate-100">
              {cLoading ? '...' : `${((coverage?.pyqCoverageRatio || 0) * 100).toFixed(1)}%`}
            </div>
            <p className="text-xs text-slate-500">Verified official PYQs relative to total question bank.</p>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 uppercase font-mono">Question Health Index</span>
            <div className="text-2xl font-bold text-emerald-400">
              {cLoading ? '...' : `${((coverage?.questionHealthRatio || 1) * 100).toFixed(1)}%`}
            </div>
            <p className="text-xs text-slate-500">Questions with complete answers & verified options.</p>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 uppercase font-mono">Content Audit Code</span>
            <div className="text-sm font-mono text-cyan-400">{coverage?.inputFingerprint || 'cov_active'}</div>
            <p className="text-xs text-slate-500">Deterministic coverage calculation engine v1.0.0.</p>
          </div>
        </div>
      )}

      {activeTab === 'sources' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Content Source Form */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Register Content Source</h2>
            <form onSubmit={handleCreateSource} className="space-y-4">
              <input
                type="text"
                placeholder="Source Title (e.g. GATE 2026 CS Paper Set 1)..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
              <input
                type="text"
                placeholder="Publisher..."
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="number"
                placeholder="Exam Year..."
                value={examYear}
                onChange={(e) => setExamYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={createSourceMutation.isPending}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition"
              >
                {createSourceMutation.isPending ? 'Registering...' : 'Register Source'}
              </button>
            </form>
          </div>

          {/* Sources List */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Content Provenance Registry</h2>
            {sLoading ? (
              <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading sources...</div>
            ) : sources && sources.length > 0 ? (
              <div className="space-y-3">
                {sources.map((s) => (
                  <div key={s.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-mono rounded">
                        {s.sourceType}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono rounded">
                        {s.verificationStatus}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100">{s.title}</h3>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Publisher: {s.publisher} {s.examYear ? `(${s.examYear})` : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
                No official content sources registered yet.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Quality Audit Issues</h2>
          {iLoading ? (
            <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading quality issues...</div>
          ) : issues && issues.length > 0 ? (
            <div className="space-y-3">
              {issues.map((issue) => (
                <div key={issue.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[10px] font-mono rounded">
                      {issue.severity} · {issue.issueCode}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{issue.status}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{issue.title}</h3>
                  <p className="text-xs text-slate-400">{issue.description || 'Audit issue needing curator review.'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
              No open content quality issues detected.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
