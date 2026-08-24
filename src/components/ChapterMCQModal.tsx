import React, { useState, useEffect, useMemo } from 'react';
import { PYQuestion, QuizQuestion, VideoResource } from '../types';
import { GATE_40_YEARS_PYQS, GATE_VOLUMES } from '../data/pyqData';
import { matchPYQsForTopic } from '../utils/pyqMatcher';
import { fetchChapterMCQTestFromBackend } from '../utils/apiClient';
import Markdown from 'react-markdown';
import {
  X,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Eye,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  Zap,
  Check,
  AlertCircle,
} from 'lucide-react';

interface ChapterMCQModalProps {
  resource: VideoResource;
  initialQuestions?: PYQuestion[];
  onClose: () => void;
  onRecordAttempt?: (
    questionId: string,
    selectedAnswer: string,
    isCorrect: boolean,
    timeSpentSeconds?: number
  ) => void;
}

export const ChapterMCQModal: React.FC<ChapterMCQModalProps> = ({
  resource,
  initialQuestions,
  onClose,
  onRecordAttempt,
}) => {
  const [questions, setQuestions] = useState<PYQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(15 * 60); // 15 mins
  const [timerActive, setTimerActive] = useState<boolean>(true);
  const [startTime] = useState<number>(Date.now());

  // Determine volume info
  const volumeInfo = useMemo(() => {
    return (
      GATE_VOLUMES.find((v) =>
        v.subjects.some((s) => s.toLowerCase() === resource.subject.toLowerCase())
      ) || GATE_VOLUMES[0]
    );
  }, [resource.subject]);

  // Load / Curate 10 Questions for this chapter from Backend & Matcher
  const loadChapterQuestions = async () => {
    setIsLoading(true);
    setIsSubmitted(false);
    setSelectedAnswers({});
    setRevealedSolutions({});
    setCurrentIndex(0);
    setTimeLeftSeconds(15 * 60);
    setTimerActive(true);

    try {
      if (initialQuestions && initialQuestions.length >= 10) {
        setQuestions(initialQuestions.slice(0, 10));
        setIsLoading(false);
        return;
      }

      // 1. Fetch directly from backend chapter test endpoint
      const backendQuestions = await fetchChapterMCQTestFromBackend(resource.subject, resource.topic, 10);
      if (backendQuestions && backendQuestions.length >= 10) {
        setQuestions(backendQuestions);
        setIsLoading(false);
        return;
      }

      // 2. Gather static PYQs matched for this topic
      let matched =
        initialQuestions && initialQuestions.length > 0
          ? [...initialQuestions]
          : matchPYQsForTopic(resource.subject, resource.topic);

      let pool = matched.slice(0, 10);

      // 3. If fewer than 10 questions, fetch extra AI-generated questions to reach 10
      if (pool.length < 10) {
        const needed = 10 - pool.length;
        try {
          const res = await fetch('/api/ai/quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subject: resource.subject,
              topic: resource.topic,
              count: needed,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.questions && Array.isArray(data.questions)) {
              const aiFormatted: PYQuestion[] = data.questions.map(
                (q: QuizQuestion, idx: number) => ({
                  id: `ai-quiz-${resource.id}-${idx + 1}-${Date.now()}`,
                  subject: resource.subject,
                  topic: resource.topic,
                  year: 2026,
                  examTag: `GATE Practice Drill (Q${pool.length + idx + 1})`,
                  marks: (q.marks === 2 ? 2 : 1) as 1 | 2,
                  type: 'MCQ',
                  questionText: q.question,
                  options: (q.options || []).map((optStr, optIdx) => {
                    const m = optStr.match(/^([A-D])[\)\.\:]\s*(.*)$/i);
                    const key = (m
                      ? m[1].toUpperCase()
                      : String.fromCharCode(65 + optIdx)) as 'A' | 'B' | 'C' | 'D';
                    const text = m ? m[2] : optStr;
                    return { key, text };
                  }),
                  correctAnswer: q.correctAnswer.trim().toUpperCase().charAt(0),
                  explanation:
                    q.explanation || 'Step-by-step mathematical reasoning verified.',
                  conceptTested: q.tip || `${resource.topic} Concept Mastery`,
                  difficulty: 'Medium',
                  relatedChapterKeywords: [resource.topic, resource.subject],
                })
              );
              pool = [...pool, ...aiFormatted];
            }
          }
        } catch (fetchErr) {
          console.warn('Could not fetch extra AI questions, using available pool', fetchErr);
        }
      }

      // If still fewer, pull additional subject questions from 40-year bank
      if (pool.length < 10) {
        const remainingSubjectQuestions = GATE_40_YEARS_PYQS.filter(
          (q) =>
            q.subject.toLowerCase() === resource.subject.toLowerCase() &&
            !pool.some((p) => p.id === q.id)
        );
        pool = [...pool, ...remainingSubjectQuestions.slice(0, 10 - pool.length)];
      }

      setQuestions(pool.slice(0, 10));
    } catch (err) {
      console.error('Error preparing chapter quiz:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChapterQuestions();
  }, [resource.id]);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || isSubmitted || timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, isSubmitted, timeLeftSeconds]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (questionId: string, optionKey: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleToggleReveal = (questionId: string) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleSubmitTest = () => {
    setIsSubmitted(true);
    setTimerActive(false);

    // Record attempts for each answered question
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    if (onRecordAttempt) {
      questions.forEach((q) => {
        const userAns = selectedAnswers[q.id];
        if (userAns) {
          const isCorrect =
            userAns.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase();
          onRecordAttempt(q.id, userAns, isCorrect, Math.round(timeSpent / questions.length));
        }
      });
    }
  };

  // Score calculation
  const { totalMarks, scoredMarks, correctCount } = useMemo(() => {
    let totMarks = 0;
    let scMarks = 0;
    let corr = 0;

    questions.forEach((q) => {
      const qMarks = q.marks || 1;
      totMarks += qMarks;
      const userAns = selectedAnswers[q.id];
      if (userAns && userAns.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()) {
        corr++;
        scMarks += qMarks;
      } else if (userAns) {
        // Standard GATE negative marking (1/3 deduction)
        scMarks -= qMarks === 2 ? 0.66 : 0.33;
      }
    });

    return {
      totalMarks: totMarks,
      scoredMarks: Math.max(0, Math.round(scMarks * 100) / 100),
      correctCount: corr,
    };
  }, [questions, selectedAnswers]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      id="chapter-mcq-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="chapter-mcq-modal"
        className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Vol {volumeInfo.volume} • 10-MCQ Chapter Test
                </span>
                <span className="text-xs text-slate-400 font-medium">{resource.subject}</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-0.5 line-clamp-1">
                {resource.topic}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Timer Badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-amber-300">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(timeLeftSeconds)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Question Selector Bar (1..10) */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1 shrink-0">Questions:</span>
            {questions.map((q, idx) => {
              const isSelected = currentIndex === idx;
              const hasAnswered = !!selectedAnswers[q.id];
              const isCorrect =
                isSubmitted &&
                hasAnswered &&
                selectedAnswers[q.id].toUpperCase() === q.correctAnswer.toUpperCase();
              const isIncorrect = isSubmitted && hasAnswered && !isCorrect;

              let btnBg = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100';
              if (isSubmitted) {
                if (isCorrect) btnBg = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                else if (isIncorrect) btnBg = 'bg-rose-600 text-white border-rose-600 font-bold';
                else btnBg = 'bg-slate-200 text-slate-500 border-slate-300';
              } else if (isSelected) {
                btnBg = 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs';
              } else if (hasAnswered) {
                btnBg = 'bg-slate-800 text-white border-slate-800 font-medium';
              }

              return (
                <button
                  key={q.id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded-lg border text-xs flex items-center justify-center shrink-0 transition-all cursor-pointer ${btnBg}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {!isSubmitted ? (
              <button
                onClick={handleSubmitTest}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Submit Drill</span>
              </button>
            ) : (
              <button
                onClick={loadChapterQuestions}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retake</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="font-medium">
                Curating 10 high-yield questions for {resource.topic}...
              </span>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                No questions found for this chapter.
              </p>
              <button
                onClick={loadChapterQuestions}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg"
              >
                Retry Generation
              </button>
            </div>
          ) : (
            <>
              {/* Submission Scorecard Banner (When Submitted) */}
              {isSubmitted && (
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl p-4 sm:p-5 border border-indigo-800 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <h3 className="text-sm sm:text-base font-bold">
                          Chapter Drill Performance Report
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300">
                        {correctCount >= 7
                          ? '🌟 Outstanding Chapter Mastery!'
                          : correctCount >= 4
                          ? '👍 Solid Effort - Review incorrect solutions below.'
                          : '⚠️ Needs Concept Revision - Recommended to re-check notes and formulas.'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-center">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Score</div>
                        <div className="text-sm sm:text-base font-black text-amber-300">
                          {scoredMarks} / {totalMarks}
                        </div>
                      </div>
                      <div className="h-6 w-px bg-slate-700" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">
                          Correct
                        </div>
                        <div className="text-sm sm:text-base font-black text-emerald-400">
                          {correctCount} / {questions.length}
                        </div>
                      </div>
                      <div className="h-6 w-px bg-slate-700" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">
                          Accuracy
                        </div>
                        <div className="text-sm sm:text-base font-black text-indigo-300">
                          {questions.length > 0
                            ? Math.round((correctCount / questions.length) * 100)
                            : 0}
                          %
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Question Container */}
              {currentQ && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
                  {/* Question Header Metadata */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-black text-xs">
                        Q{currentIndex + 1} of {questions.length}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-slate-200 text-slate-700">
                        {currentQ.examTag || 'GATE Official'}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {currentQ.marks || 1} Mark{(currentQ.marks || 1) === 2 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                        Concept: {currentQ.conceptTested}
                      </span>
                      <button
                        onClick={() => handleToggleReveal(currentQ.id)}
                        className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>
                          {revealedSolutions[currentQ.id] || isSubmitted
                            ? 'Solution'
                            : 'Hint / Reveal'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed whitespace-pre-line">
                    {currentQ.questionText}
                  </div>

                  {/* Code Snippet if present */}
                  {currentQ.codeSnippet && (
                    <pre className="p-3.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                      <code>{currentQ.codeSnippet}</code>
                    </pre>
                  )}

                  {/* 4 Options Grid */}
                  <div className="space-y-2 pt-2">
                    {(
                      currentQ.options || [
                        { key: 'A', text: 'Option A' },
                        { key: 'B', text: 'Option B' },
                        { key: 'C', text: 'Option C' },
                        { key: 'D', text: 'Option D' },
                      ]
                    ).map((opt) => {
                      const userChoice = selectedAnswers[currentQ.id];
                      const isSelected = userChoice === opt.key;
                      const correctKey = currentQ.correctAnswer.trim().toUpperCase();
                      const isCorrect = correctKey === opt.key;
                      const showSolution = isSubmitted || revealedSolutions[currentQ.id];

                      let btnClass =
                        'bg-white hover:bg-slate-100 border-slate-200 text-slate-800';
                      if (showSolution) {
                        if (isCorrect) {
                          btnClass =
                            'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500';
                        } else if (isSelected && !isCorrect) {
                          btnClass = 'bg-rose-50 border-rose-300 text-rose-900 line-through';
                        }
                      } else if (isSelected) {
                        btnClass =
                          'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold ring-1 ring-indigo-600';
                      }

                      return (
                        <button
                          key={opt.key}
                          onClick={() => handleSelectOption(currentQ.id, opt.key)}
                          className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start justify-between gap-3 cursor-pointer ${btnClass}`}
                        >
                          <div className="flex items-start space-x-2.5">
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {opt.key}
                            </span>
                            <span className="leading-snug pt-0.5">{opt.text}</span>
                          </div>

                          {showSolution && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          )}
                          {showSolution && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Step-by-Step Explanation Box */}
                  {(isSubmitted || revealedSolutions[currentQ.id]) && (
                    <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center space-x-2 font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                          Correct Answer: Option {currentQ.correctAnswer}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">
                          Mathematical & Conceptual Derivation
                        </span>
                      </div>

                      <div className="text-slate-700 leading-relaxed font-sans whitespace-pre-line pt-1">
                        <Markdown>{currentQ.explanation}</Markdown>
                      </div>

                      {currentQ.conceptTested && (
                        <div className="mt-2 p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-950 font-medium">
                          💡 <span className="font-bold">Key Formula / Exam Tip:</span>{' '}
                          {currentQ.conceptTested}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Question</span>
                </button>

                <div className="text-xs text-slate-500 font-medium">
                  {Object.keys(selectedAnswers).length} of {questions.length} answered
                </div>

                <button
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Source: <span className="font-semibold text-slate-700">{volumeInfo.name}</span>
          </div>

          <div className="flex items-center space-x-2">
            {!isSubmitted ? (
              <button
                onClick={handleSubmitTest}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Finish & Check Score
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Drill
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
