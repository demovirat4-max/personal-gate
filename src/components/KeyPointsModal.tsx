import React, { useState } from 'react';
import { VideoResource } from '../types';
import Markdown from 'react-markdown';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface KeyPointsModalProps {
  resource: VideoResource;
  onClose: () => void;
}

export const KeyPointsModal: React.FC<KeyPointsModalProps> = ({
  resource,
  onClose,
}) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [showTranscriptInput, setShowTranscriptInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (customTranscript?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: resource.subject,
          topic: resource.topic,
          title: resource.topic,
          channel: resource.channel,
          transcript: customTranscript !== undefined ? customTranscript : transcript,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.summary || 'No summary returned.');
    } catch (err: any) {
      console.error('Summarize error:', err);
      setError(err.message || 'Failed to generate key points.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger on initial open if not generated yet
  React.useEffect(() => {
    if (!summary && !isLoading) {
      handleGenerate('');
    }
  }, [resource.id]);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="key-points-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="key-points-modal"
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-slate-100 text-slate-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Key points and formulas
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-md">
                {resource.subject} • {resource.topic}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Generated from GATE CSE syllabus requirements and core proofs.
          </span>
          <button
            onClick={() => setShowTranscriptInput(!showTranscriptInput)}
            className="text-slate-900 hover:underline font-medium ml-2 cursor-pointer"
          >
            {showTranscriptInput ? 'Hide transcript box' : '+ Paste transcript'}
          </button>
        </div>

        {/* Optional Transcript Input Box */}
        {showTranscriptInput && (
          <div className="p-3 bg-slate-50 border-b border-slate-100 space-y-2">
            <span className="text-xs text-slate-500 block">Paste lecture transcript or personal notes:</span>
            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste raw transcript lines here for a tighter lecture-specific summary..."
              className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading || !transcript.trim()}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs rounded cursor-pointer font-medium"
            >
              Re-summarize with transcript
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-500 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
              <span>Analyzing topic concepts and extracting formulas...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs space-y-2">
              <p>{error}</p>
              <button
                onClick={() => handleGenerate()}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : summary ? (
            <div className="prose prose-slate prose-xs max-w-none text-slate-800 text-xs leading-relaxed">
              <div className="markdown-body [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&>h2]:text-slate-900 [&>h2]:text-sm [&>h2]:font-semibold [&>h2]:mt-3 [&>h2]:mb-1.5 [&>h3]:text-slate-800 [&>h3]:text-xs [&>h3]:font-semibold [&>h3]:mt-2.5 [&>h3]:mb-1 [&>strong]:text-slate-900 [&>code]:bg-slate-100 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:font-mono">
                <Markdown>{summary}</Markdown>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>

          <button
            onClick={handleCopy}
            disabled={!summary}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs rounded bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors disabled:opacity-40 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy notes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
