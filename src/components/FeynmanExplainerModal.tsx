import React, { useState, useEffect } from 'react';
import { ConceptFeynmanResponse, VideoResource } from '../types';
import {
  Brain,
  X,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Layers,
  Copy,
  Check,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface FeynmanExplainerModalProps {
  resource: VideoResource;
  onClose: () => void;
  onOpenQuiz?: (resource: VideoResource) => void;
}

export const FeynmanExplainerModal: React.FC<FeynmanExplainerModalProps> = ({
  resource,
  onClose,
  onOpenQuiz,
}) => {
  const [data, setData] = useState<ConceptFeynmanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchFeynman = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/concept-feynman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: resource.subject,
          topic: resource.topic,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error HTTP ${res.status}`);
      }

      const result: ConceptFeynmanResponse = await res.json();
      setData(result);
    } catch (err: any) {
      console.error('Feynman explainer error:', err);
      setError(err.message || 'Failed to generate Feynman explanation');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeynman();
  }, [resource.id]);

  const handleCopy = () => {
    if (!data) return;
    const text = `# Concept Simplifier (Feynman Technique): ${resource.topic}
Subject: ${resource.subject}

## 1. Intuitive Analogy
${data.analogy}

## 2. Technical Inner Mechanics (GATE Level)
${data.technicalMechanics}

## 3. Classic GATE Traps & Edge Cases
${data.gateTrapsAndEdgeCases.map((t) => `- ${t}`).join('\n')}

## 4. High-Yield Tips
${data.highYieldTips.map((tip) => `- ${tip}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="feynman-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="feynman-modal"
        className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-slate-100 text-slate-700">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Concept simplifier (Feynman technique)
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-md">
                {resource.subject} • {resource.topic}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={fetchFeynman}
              disabled={isLoading}
              title="Regenerate explanation"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors disabled:opacity-40 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-2 text-slate-500 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
              <span>Analyzing concept and synthesizing 3-tier explanation...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs space-y-2">
              <p>{error}</p>
              <button
                onClick={fetchFeynman}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-900 hover:bg-slate-100 cursor-pointer font-medium"
              >
                Try again
              </button>
            </div>
          ) : data ? (
            <div className="space-y-5">
              {/* Level 1: Intuitive Real-World Analogy */}
              <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100 space-y-2">
                <div className="flex items-center space-x-1.5 text-blue-900 font-semibold text-xs">
                  <Lightbulb className="w-3.5 h-3.5 text-blue-700" />
                  <span>Level 1: Intuitive Analogy</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {data.analogy}
                </p>
              </div>

              {/* Level 2: Technical Mechanics */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center space-x-1.5 text-slate-900 font-semibold text-xs">
                  <Layers className="w-3.5 h-3.5 text-slate-700" />
                  <span>Level 2: Mathematical Mechanics & Formulation</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {data.technicalMechanics}
                </p>
              </div>

              {/* Level 3: GATE Traps & Edge Cases */}
              <div className="p-4 rounded-lg bg-amber-50/40 border border-amber-200/80 space-y-2.5">
                <div className="flex items-center space-x-1.5 text-amber-900 font-semibold text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Level 3: Common GATE Traps & Edge Cases</span>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {data.gateTrapsAndEdgeCases.map((trap, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start space-x-2">
                      <span className="text-amber-600 font-bold shrink-0">•</span>
                      <span>{trap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* High-Yield Tips */}
              {data.highYieldTips.length > 0 && (
                <div className="p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-200/70 space-y-2">
                  <div className="text-xs font-semibold text-emerald-900 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>High-Yield GATE Tips & Shortcuts</span>
                  </div>
                  <ul className="space-y-1 pl-1">
                    {data.highYieldTips.map((tip, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start space-x-2">
                        <span className="text-emerald-600 font-semibold shrink-0">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={handleCopy}
            disabled={!data}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer disabled:opacity-40"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-medium">Copied notes</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy explanation</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2">
            {onOpenQuiz && (
              <button
                onClick={() => {
                  onClose();
                  onOpenQuiz(resource);
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs rounded transition-colors cursor-pointer font-medium"
              >
                Test concept with quiz
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded transition-colors cursor-pointer font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
