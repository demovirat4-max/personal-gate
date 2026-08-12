'use client';

import React, { useState } from 'react';
import { useMistakes, useUpdateMistake } from '@/hooks/use-learning';

export default function PracticePage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>('OPEN');
  const { data: mistakes, isLoading } = useMistakes(statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Mistake Vault</h1>
          <p className="text-sm text-slate-400 mt-1">Review and master questions you missed during quiz attempts.</p>
        </div>

        {/* Filter Controls */}
        <div className="flex space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          {['OPEN', 'REVIEWED', 'MASTERED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === st ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Loading Mistakes...</div>
      ) : !mistakes || mistakes.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
          <p className="text-slate-300 font-medium">No mistakes found in this filter.</p>
          <p className="text-xs text-slate-500">Keep solving quizzes in the Learn section to populate your vault.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mistakes.map((m) => (
            <MistakeCard key={m.id} mistake={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function MistakeCard({ mistake }: { mistake: any }) {
  const updateMutation = useUpdateMistake(mistake.id);
  const [reflection, setReflection] = useState(mistake.reflection || '');

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-cyan-400">Seen {mistake.occurrenceCount}x</span>
          <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] uppercase font-bold text-slate-300">
            {mistake.status}
          </span>
        </div>

        <p className="text-sm font-medium text-slate-100">{mistake.questionText || 'Question text not available'}</p>

        <div className="space-y-1 text-xs">
          <div className="text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
            Your Answer: <code>{JSON.stringify(mistake.userAnswerJson)}</code>
          </div>
          <div className="text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
            Correct Answer: <code>{JSON.stringify(mistake.correctAnswerJson)}</code>
          </div>
        </div>

        {mistake.explanation && (
          <p className="text-xs text-slate-400 italic bg-slate-950 p-2.5 rounded">{mistake.explanation}</p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <input
          type="text"
          placeholder="Add personal reflection or lesson learned..."
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          onBlur={() => updateMutation.mutate({ reflection })}
          className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500"
        />

        <div className="flex space-x-2">
          {mistake.status !== 'REVIEWED' && (
            <button
              onClick={() => updateMutation.mutate({ status: 'REVIEWED' })}
              className="flex-1 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 text-xs font-semibold rounded-lg border border-cyan-500/30 transition"
            >
              Mark Reviewed
            </button>
          )}
          {mistake.status !== 'MASTERED' && (
            <button
              onClick={() => updateMutation.mutate({ status: 'MASTERED' })}
              className="flex-1 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-500/30 transition"
            >
              Mark Mastered
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
