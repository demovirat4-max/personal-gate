import React, { useState, useEffect } from 'react';
import { QuizQuestion, VideoResource } from '../types';
import Markdown from 'react-markdown';
import {
  X,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Eye,
} from 'lucide-react';

interface QuizModalProps {
  resource: VideoResource;
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ resource, onClose }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setSelectedAnswers({});
    setRevealedExplanations({});

    try {
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: resource.subject,
          topic: resource.topic,
          count: 3,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (err: any) {
      console.error('Quiz error:', err);
      setError(err.message || 'Failed to generate quiz.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [resource.id]);

  const handleSelectOption = (qIdx: number, optionLetter: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optionLetter,
    }));
    // Auto reveal explanation on selection
    setRevealedExplanations((prev) => ({
      ...prev,
      [qIdx]: true,
    }));
  };

  const handleToggleReveal = (qIdx: number) => {
    setRevealedExplanations((prev) => ({
      ...prev,
      [qIdx]: !prev[qIdx],
    }));
  };

  // Calculate quick score
  const totalAnswered = Object.keys(selectedAnswers).length;
  let correctCount = 0;
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const userAns = selectedAnswers[i];
    const correctLetter = q.correctAnswer.trim().toUpperCase().charAt(0);
    if (userAns && userAns.toUpperCase().charAt(0) === correctLetter) {
      correctCount++;
    }
  }

  return (
    <div
      id="quiz-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="quiz-modal"
        className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-slate-100 text-slate-700">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Practice quiz
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

        {/* Score & Controls Bar */}
        {questions.length > 0 && !isLoading && (
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <div className="text-slate-700 font-medium">
              Score: {correctCount} / {questions.length} ({totalAnswered} answered)
            </div>
            <button
              onClick={fetchQuiz}
              className="flex items-center space-x-1 text-xs text-slate-700 hover:text-slate-950 font-medium cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>New questions</span>
            </button>
          </div>
        )}

        {/* Questions Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-2 text-slate-500 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
              <span>Generating standard questions...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs space-y-2">
              <p>{error}</p>
              <button
                onClick={fetchQuiz}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-900 hover:bg-slate-100 cursor-pointer font-medium"
              >
                Try again
              </button>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No questions generated. Click below to try again.
            </div>
          ) : (
            questions.map((q, qIdx) => {
              const userSelected = selectedAnswers[qIdx];
              const isRevealed = revealedExplanations[qIdx];
              const correctLetter = q.correctAnswer.trim().toUpperCase().charAt(0);

              return (
                <div
                  key={q.id || qIdx}
                  className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-3"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-white text-slate-900 border border-slate-200">
                        Q{qIdx + 1}
                      </span>
                      <span className="text-xs text-slate-500">
                        {q.marks || 1} mark{q.marks === 2 ? 's' : ''}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleReveal(qIdx)}
                      className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{isRevealed ? 'Hide solution' : 'Reveal solution'}</span>
                    </button>
                  </div>

                  {/* Question Prompt */}
                  <div className="text-xs text-slate-900 leading-relaxed font-medium">
                    {q.question}
                  </div>

                  {/* Options List */}
                  <div className="space-y-1.5 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const optLetterMatch = opt.match(/^([A-D])[\)\.\:]/i);
                      const optLetter = optLetterMatch
                        ? optLetterMatch[1].toUpperCase()
                        : String.fromCharCode(65 + optIdx);

                      const isSelected = userSelected === optLetter;
                      const isCorrect = correctLetter === optLetter;

                      let btnStyle =
                        'bg-white hover:bg-slate-100 border-slate-200 text-slate-800';
                      if (isRevealed) {
                        if (isCorrect) {
                          btnStyle =
                            'bg-slate-900 border-slate-900 text-white font-medium';
                        } else if (isSelected && !isCorrect) {
                          btnStyle =
                            'bg-slate-200 border-slate-300 text-slate-700';
                        }
                      } else if (isSelected) {
                        btnStyle =
                          'bg-slate-900 border-slate-900 text-white font-medium';
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(qIdx, optLetter)}
                          className={`w-full text-left p-2.5 rounded border text-xs transition-colors flex items-start justify-between gap-2 cursor-pointer ${btnStyle}`}
                        >
                          <span className="leading-snug">{opt}</span>
                          {isRevealed && isCorrect && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          )}
                          {isRevealed && isSelected && !isCorrect && (
                            <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Step-by-step Solution */}
                  {isRevealed && (
                    <div className="mt-2.5 p-3 rounded bg-white border border-slate-200 space-y-1.5 text-xs">
                      <div className="font-semibold text-slate-900">
                        Answer: Option {q.correctAnswer}
                      </div>
                      <div className="text-slate-600 leading-relaxed text-xs">
                        <div className="markdown-body [&>p]:mb-1 [&>code]:bg-slate-100 [&>code]:px-1 [&>code]:rounded [&>code]:text-slate-900 font-mono">
                          <Markdown>{q.explanation}</Markdown>
                        </div>
                      </div>
                      {q.tip && (
                        <div className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-700 text-xs mt-1">
                          Tip: {q.tip}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Click any option to select and reveal reasoning
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded transition-colors cursor-pointer font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
