'use client';

import React, { useState } from 'react';
import { useAiBudget, useExecuteAi } from '@/hooks/use-ai';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCapability?: string;
  sourceId?: string;
  title?: string;
}

export function AiAssistantModal({
  isOpen,
  onClose,
  initialCapability = 'LESSON_SUMMARY',
  sourceId,
  title = 'GATE AI Assistant',
}: AiAssistantModalProps) {
  const { data: budget } = useAiBudget();
  const executeMutation = useExecuteAi();

  const [capability, setCapability] = useState(initialCapability);
  const [userInput, setUserInput] = useState('');
  const [output, setOutput] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setOutput(null);
    try {
      const res = await executeMutation.mutateAsync({ capability, sourceId, userInput });
      setOutput(res.output);
    } catch (err: any) {
      setOutput(`Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <span className="text-cyan-400">✨</span>
              <span>{title}</span>
            </h3>
            <p className="text-[10px] text-slate-400">NVIDIA NIM ZZLM 5.2 • Server Grounded</p>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1">
            ✕ Close
          </button>
        </div>

        {/* Budget Alert Banner */}
        {budget && budget.warningLevel !== 'NONE' && (
          <div
            className={`px-4 py-2 text-xs font-semibold flex items-center justify-between border-b ${
              budget.isExhausted
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            <span>
              {budget.isExhausted
                ? '🚨 Monthly AI Budget Hard Limit Reached (₹1,000)'
                : `⚠️ Monthly AI Spend at ${budget.spendPercentage}% (₹${budget.currentSpendInr} / ₹${budget.monthlyLimitInr})`}
            </span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Select Capability</label>
            <select
              value={capability}
              onChange={(e) => setCapability(e.target.value)}
              className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
            >
              <option value="LESSON_SUMMARY">Lesson Summary</option>
              <option value="STUDY_NOTES">Structured Study Notes</option>
              <option value="CONCEPT_EXPLANATION">Concept Explanation</option>
              <option value="FLASHCARD_GENERATION">Flashcards</option>
              <option value="MISTAKE_ANALYSIS">Mistake Analysis</option>
              <option value="AI_COACH">GATE AI Coach</option>
            </select>
          </div>

          {(capability === 'CONCEPT_EXPLANATION' || capability === 'AI_COACH') && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Ask a Question or Concept</label>
              <input
                type="text"
                placeholder="e.g., Explain Time Complexity of QuickSort partition..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {output && (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Generated Output</div>
              <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">{output}</pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={executeMutation.isPending || (budget?.isExhausted ?? false)}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-cyan-600/20"
          >
            {executeMutation.isPending ? 'Generating...' : 'Generate with ZZLM 5.2'}
          </button>
        </div>
      </div>
    </div>
  );
}
