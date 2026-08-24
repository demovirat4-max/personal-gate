import React, { useState } from 'react';
import {
  PYQAttemptMap,
  PYQAttemptState,
  PYQuestion,
  VideoResource,
} from '../types';
import {
  CheckCircle2,
  XCircle,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
} from 'lucide-react';

interface PYQCardProps {
  question: PYQuestion;
  attempt?: PYQAttemptState;
  attemptMap?: PYQAttemptMap;
  onRecordAttempt: (
    questionId: string,
    selectedAnswer: string,
    isCorrect: boolean,
    timeSpentSeconds?: number
  ) => void;
  onToggleBookmark: (questionId: string) => void;
  onAskAi?: (question: PYQuestion) => void;
  onAskAiWithContext?: (question: PYQuestion) => void;
}

export const PYQCard: React.FC<PYQCardProps> = ({
  question,
  attempt: attemptProp,
  attemptMap,
  onRecordAttempt,
  onToggleBookmark,
  onAskAi,
  onAskAiWithContext,
}) => {
  const attempt = attemptProp || (attemptMap ? attemptMap[question.id] : undefined);
  const isAttempted = !!attempt?.attempted;
  const isCorrect = !!attempt?.isCorrect;
  const isBookmarked = !!attempt?.bookmarked;
  const handleAsk = onAskAiWithContext || onAskAi;

  const [selectedOption, setSelectedOption] = useState<string>(attempt?.selectedAnswer || '');
  const [natInput, setNatInput] = useState<string>(attempt?.selectedAnswer || '');
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(isAttempted);

  // Check MCQ / MSQ / NAT correctness
  const handleSubmitAnswer = (answerToSubmit?: string) => {
    const ans = (answerToSubmit !== undefined ? answerToSubmit : (question.type === 'NAT' ? natInput : selectedOption)).trim();
    if (!ans) return;

    let correct = false;
    if (question.type === 'NAT') {
      const numericVal = parseFloat(ans);
      if (!isNaN(numericVal)) {
        if (question.numericalRange) {
          correct = numericVal >= question.numericalRange.min && numericVal <= question.numericalRange.max;
        } else {
          correct = Math.abs(numericVal - parseFloat(question.correctAnswer)) < 0.05;
        }
      }
    } else {
      // Normal string comparison (or trimmed uppercase)
      correct = ans.toUpperCase() === question.correctAnswer.trim().toUpperCase();
    }

    onRecordAttempt(question.id, ans, correct, 30);
    setShowFeedback(true);
    if (!correct) {
      setShowSolution(true);
    }
  };

  const handleReset = () => {
    setSelectedOption('');
    setNatInput('');
    setShowFeedback(false);
    setShowSolution(false);
    onRecordAttempt(question.id, '', false, 0);
  };

  const difficultyColors = {
    Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Hard: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div
      id={`pyq-card-${question.id}`}
      className={`bg-white rounded-xl border transition-all duration-200 shadow-xs overflow-hidden ${
        isAttempted
          ? isCorrect
            ? 'border-emerald-200 ring-1 ring-emerald-100'
            : 'border-rose-200 ring-1 ring-rose-100'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Header Info Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Exam Tag */}
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {question.examTag}
          </span>

          {/* Marks */}
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
          </span>

          {/* Type Badge */}
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            {question.type}
          </span>

          {/* Difficulty */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
              difficultyColors[question.difficulty] || difficultyColors.Medium
            }`}
          >
            {question.difficulty}
          </span>
        </div>

        {/* Action icons (Bookmark, AI) */}
        <div className="flex items-center space-x-1.5 ml-auto">
          <button
            onClick={() => onToggleBookmark(question.id)}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this PYQ'}
            className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              isBookmarked
                ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                : 'text-slate-400 hover:text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
          </button>

          {handleAsk && (
            <button
              onClick={() => handleAsk(question)}
              title="Ask AI Mentor to explain this question"
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          )}
        </div>
      </div>

      {/* Subject & Topic Subheader */}
      <div className="px-4 sm:px-5 pt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">{question.subject}</span>
        <span>•</span>
        <span className="text-slate-600">{question.topic}</span>
        {question.subtopic && (
          <>
            <span>›</span>
            <span className="text-indigo-600 font-medium">{question.subtopic}</span>
          </>
        )}
      </div>

      {/* Question Content */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Question Text */}
        <div className="text-sm font-medium text-slate-900 leading-relaxed whitespace-pre-line">
          {question.questionText}
        </div>

        {/* Code Snippet if present */}
        {question.codeSnippet && (
          <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
            <pre>{question.codeSnippet}</pre>
          </div>
        )}

        {/* Option Selection: MCQ / MSQ */}
        {question.options && question.options.length > 0 && (
          <div className="space-y-2 pt-1">
            {question.options.map((opt) => {
              const isSelected = selectedOption === opt.key;
              const isCorrectOpt = opt.key === question.correctAnswer;
              
              let optStyle = 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-800';
              if (showFeedback) {
                if (isCorrectOpt) {
                  optStyle = 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-200';
                } else if (isSelected && !isCorrectOpt) {
                  optStyle = 'border-rose-300 bg-rose-50 text-rose-900 line-through';
                }
              } else if (isSelected) {
                optStyle = 'border-indigo-500 bg-indigo-50/70 text-indigo-950 font-semibold ring-1 ring-indigo-300';
              }

              return (
                <button
                  key={opt.key}
                  onClick={() => {
                    if (!showFeedback) {
                      setSelectedOption(opt.key);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm flex items-start space-x-3 transition-all cursor-pointer ${optStyle}`}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white border border-slate-200 text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                    {opt.key}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{opt.text}</span>
                  {showFeedback && isCorrectOpt && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0 mt-1" />
                  )}
                  {showFeedback && isSelected && !isCorrectOpt && (
                    <XCircle className="w-4 h-4 text-rose-500 ml-auto shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Option Selection: NAT (Numerical Answer Type) */}
        {question.type === 'NAT' && (
          <div className="pt-1 space-y-2">
            <label className="block text-xs font-medium text-slate-700">
              Enter your numerical answer (NAT):
            </label>
            <div className="flex items-center space-x-2 max-w-sm">
              <input
                type="text"
                value={natInput}
                disabled={showFeedback}
                onChange={(e) => setNatInput(e.target.value)}
                placeholder="e.g. 9 or 4.8"
                className={`w-full px-3.5 py-2 text-sm font-mono rounded-lg border ${
                  showFeedback
                    ? isCorrect
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-rose-400 bg-rose-50 text-rose-900 font-bold'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
            </div>
          </div>
        )}

        {/* Interactive Action Row */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            {!showFeedback ? (
              <button
                onClick={() => handleSubmitAnswer()}
                disabled={question.type === 'NAT' ? !natInput.trim() : !selectedOption}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Try Again</span>
              </button>
            )}

            <button
              onClick={() => setShowSolution(!showSolution)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>{showSolution ? 'Hide Solution' : 'View Detailed Solution'}</span>
              {showSolution ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Feedback badge */}
          {showFeedback && (
            <div className="flex items-center space-x-1.5 text-xs font-semibold">
              {isCorrect ? (
                <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Correct Answer! (+{question.marks} Marks)</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>
                    Incorrect (Correct: {question.correctAnswer}
                    {question.numericalRange ? ` [${question.numericalRange.min} to ${question.numericalRange.max}]` : ''})
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Collapsible Step-by-Step Solution & Concept Trap */}
        {showSolution && (
          <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-200">
            {/* Concept Tested Box */}
            <div className="flex items-start space-x-2 bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100 text-xs text-indigo-900">
              <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-indigo-950">Core Concept Tested: </strong>
                <span>{question.conceptTested}</span>
              </div>
            </div>

            {/* Explanation Body */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Step-by-Step Mathematical & Conceptual Derivation:
              </h4>
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-mono bg-white p-3 rounded-lg border border-slate-200">
                {question.explanation}
              </div>
            </div>

            {/* Reference Citation */}
            {question.referenceUrl && (
              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>Verified against official GATE CSE answer keys</span>
                <a
                  href={question.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <span>GateOverflow Discussion</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
