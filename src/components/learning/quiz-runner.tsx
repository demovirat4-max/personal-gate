'use client';

import React, { useState } from 'react';
import { useQuiz, useCreateAttempt, useSaveAnswer, useSubmitAttempt } from '@/hooks/use-learning';

interface QuizRunnerProps {
  quizId: string;
  onFinished?: () => void;
}

export function QuizRunner({ quizId, onFinished }: QuizRunnerProps) {
  const { data: quiz, isLoading, error } = useQuiz(quizId);
  const createAttemptMutation = useCreateAttempt(quizId);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});
  const [quizResult, setQuizResult] = useState<any | null>(null);

  const saveAnswerMutation = useSaveAnswer(attemptId || '');
  const submitAttemptMutation = useSubmitAttempt(attemptId || '');

  const startQuiz = async () => {
    const attempt = await createAttemptMutation.mutateAsync();
    setAttemptId(attempt.id);
  };

  const handleSelectOption = (questionId: string, value: any) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (attemptId) {
      saveAnswerMutation.mutate({ questionId, selectedAnswerJson: value });
    }
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    const idempotencyKey = `sub_${attemptId}_${Date.now()}`;
    const result = await submitAttemptMutation.mutateAsync(idempotencyKey);
    setQuizResult(result);
    if (onFinished) onFinished();
  };

  if (isLoading) return <div className="p-6 text-slate-400 text-sm animate-pulse">Loading Quiz...</div>;
  if (error || !quiz) return <div className="p-6 text-red-400 text-sm">Failed to load quiz content.</div>;

  if (!attemptId) {
    return (
      <div className="p-8 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-100">{quiz.title}</h3>
        {quiz.description && <p className="text-sm text-slate-400 max-w-md mx-auto">{quiz.description}</p>}
        <div className="text-xs text-slate-500 font-mono">
          Questions: {quiz.questions.length} • Pass Mark: {quiz.passPercentage}%
        </div>
        <button
          onClick={startQuiz}
          disabled={createAttemptMutation.isPending}
          className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-cyan-600/20"
        >
          {createAttemptMutation.isPending ? 'Starting...' : 'Start Quiz Now'}
        </button>
      </div>
    );
  }

  if (quizResult) {
    return (
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-100">Quiz Results</h3>
            <p className="text-xs text-slate-400 mt-1">
              Submitted at {new Date(quizResult.submittedAt).toLocaleTimeString()}
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-xl text-sm font-bold border ${
              quizResult.passed
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {quizResult.passed ? 'PASSED' : 'NEEDS REVISION'} ({quizResult.score} / {quizResult.maxScore})
          </div>
        </div>

        <div className="space-y-4">
          {quizResult.answers.map((ans: any, idx: number) => (
            <div key={ans.questionId} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-slate-400">Q{idx + 1}</span>
                <span className={`text-xs font-bold ${ans.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                  {ans.isCorrect ? '✓ Correct (+ marks)' : '✗ Incorrect (Added to Mistakes)'}
                </span>
              </div>
              <div className="text-xs text-slate-300">
                Your Answer: <code className="text-slate-100">{JSON.stringify(ans.selectedAnswerJson)}</code>
              </div>
              <div className="text-xs text-slate-300">
                Correct Answer: <code className="text-emerald-400">{JSON.stringify(ans.correctAnswerJson)}</code>
              </div>
              {ans.explanation && (
                <p className="text-xs text-slate-400 italic bg-slate-900 p-2 rounded">{ans.explanation}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-slate-100">{quiz.title}</h3>
        <span className="text-xs font-mono text-cyan-400">Attempt ID: {attemptId.slice(0, 8)}</span>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">
                Question {idx + 1} of {quiz.questions.length}
              </span>
              <span>[{q.marks} marks]</span>
            </div>
            <p className="text-sm font-medium text-slate-100">{q.questionText}</p>

            {q.questionType === 'SINGLE_CHOICE' && Array.isArray(q.optionsJson) && (
              <div className="space-y-2 pt-2">
                {q.optionsJson.map((opt: string, oIdx: number) => (
                  <label
                    key={oIdx}
                    className={`flex items-center space-x-3 p-3 rounded-lg border text-xs cursor-pointer transition ${
                      selectedAnswers[q.id] === opt
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      checked={selectedAnswers[q.id] === opt}
                      onChange={() => handleSelectOption(q.id, opt)}
                      className="accent-cyan-500"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSubmit}
          disabled={submitAttemptMutation.isPending}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-emerald-600/20"
        >
          {submitAttemptMutation.isPending ? 'Submitting...' : 'Submit Answers'}
        </button>
      </div>
    </div>
  );
}
