import React, { useState, useEffect } from 'react';
import { FormulaSheetResponse, VideoResource } from '../types';
import {
  Zap,
  X,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Table,
  Sigma,
  BookOpen,
} from 'lucide-react';

interface FormulaSheetModalProps {
  resource: VideoResource;
  onClose: () => void;
}

export const FormulaSheetModal: React.FC<FormulaSheetModalProps> = ({
  resource,
  onClose,
}) => {
  const [data, setData] = useState<FormulaSheetResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchFormulaSheet = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/formula-sheet', {
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

      const result: FormulaSheetResponse = await res.json();
      setData(result);
    } catch (err: any) {
      console.error('Formula sheet error:', err);
      setError(err.message || 'Failed to generate formula sheet');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFormulaSheet();
  }, [resource.id]);

  const handleCopy = () => {
    if (!data) return;
    let text = `# GATE Formula & Cheat Sheet: ${resource.topic} (${resource.subject})\n\n`;
    text += `## Core Formulas:\n`;
    data.formulas.forEach((f) => {
      text += `### ${f.title}\nFormula: ${f.equation}\nContext: ${f.context}\n\n`;
    });
    if (data.complexities.length > 0) {
      text += `## Complexity Matrix:\n`;
      data.complexities.forEach((c) => {
        text += `- ${c.operation}: Best: ${c.best} | Avg: ${c.average} | Worst: ${c.worst} | Space: ${c.space}\n`;
      });
      text += '\n';
    }
    if (data.keyTheorems.length > 0) {
      text += `## Key Theorems & Properties:\n`;
      data.keyTheorems.forEach((t) => {
        text += `- ${t}\n`;
      });
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="formula-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="formula-modal"
        className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-slate-100 text-slate-700">
              <Sigma className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Formula & Complexity Cheat Sheet
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-md">
                {resource.subject} • {resource.topic}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={fetchFormulaSheet}
              disabled={isLoading}
              title="Regenerate cheat sheet"
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-2 text-slate-500 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
              <span>Compiling high-yield equations and complexity metrics...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs space-y-2">
              <p>{error}</p>
              <button
                onClick={fetchFormulaSheet}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-900 hover:bg-slate-100 cursor-pointer font-medium"
              >
                Try again
              </button>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Formulas Cards */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-900 flex items-center space-x-1.5">
                  <Sigma className="w-3.5 h-3.5 text-slate-700" />
                  <span>Standard Equations & Relations</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.formulas.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5"
                    >
                      <div className="text-xs font-medium text-slate-800">
                        {item.title}
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200 font-mono text-xs text-slate-900 select-all overflow-x-auto">
                        {item.equation}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        {item.context}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complexities Table */}
              {data.complexities && data.complexities.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-900 flex items-center space-x-1.5">
                    <Table className="w-3.5 h-3.5 text-slate-700" />
                    <span>Time & Space Complexity Reference</span>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                        <tr>
                          <th className="py-2 px-3">Operation / Case</th>
                          <th className="py-2 px-3">Best</th>
                          <th className="py-2 px-3">Average</th>
                          <th className="py-2 px-3">Worst</th>
                          <th className="py-2 px-3">Space</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {data.complexities.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-sans font-medium text-slate-900">
                              {row.operation}
                            </td>
                            <td className="py-2 px-3 text-slate-700">{row.best}</td>
                            <td className="py-2 px-3 text-slate-700">{row.average}</td>
                            <td className="py-2 px-3 text-slate-900 font-semibold">{row.worst}</td>
                            <td className="py-2 px-3 text-slate-700">{row.space}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Theorems */}
              {data.keyTheorems && data.keyTheorems.length > 0 && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-semibold text-slate-900 flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-700" />
                    <span>Core Theorems & Invariants</span>
                  </div>
                  <ul className="space-y-1 pl-1">
                    {data.keyTheorems.map((thm, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start space-x-2">
                        <span className="text-slate-400 font-bold shrink-0">•</span>
                        <span>{thm}</span>
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
                <span className="text-emerald-600 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy cheat sheet</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded transition-colors cursor-pointer font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
