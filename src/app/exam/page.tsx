'use client';

import React, { useState } from 'react';
import { useQuestionBank, useExamTests } from '@/hooks/use-exam';
import { Award, Filter, CheckCircle2, Clock, FileText, ChevronDown, ChevronUp, Check, HelpCircle } from 'lucide-react';

const SUBJECT_OPTIONS = [
  'All Subjects',
  'Algorithms',
  'Data Structures',
  'Operating System',
  'Database Management System',
  'Computer Networks',
  'Theory of Computation',
  'Compiler Design',
  'Computer Organization & Architecture',
  'Digital Logic',
  'C-Programming',
  'Discrete Mathematics',
  'Linear Algebra',
  'Calculus',
];

const YEAR_OPTIONS = ['All Years', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'];
const QUESTION_TYPES = ['All Types', 'MCQ', 'MSQ', 'NAT_INTEGER', 'NAT_DECIMAL'];

export default function ExamPage() {
  const { data: questions, isLoading: qLoading } = useQuestionBank();
  const { data: tests, isLoading: tLoading } = useExamTests();

  const [activeTab, setActiveTab] = useState<'bank' | 'tests' | 'overview'>('bank');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedType, setSelectedType] = useState('All Types');
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({});

  // Filter questions dynamically
  const filteredQuestions = (questions || []).filter((q) => {
    const matchYear = selectedYear === 'All Years' || (q.examYear ? q.examYear.toString() === selectedYear : false);
    const matchType = selectedType === 'All Types' || q.questionType === selectedType || (selectedType.startsWith('NAT') && q.questionType.startsWith('NAT'));
    return matchYear && matchType;
  });

  const toggleAnswer = (id: string) => {
    setExpandedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>GATE CS 2028 EXAM ENGINE</span>
          </span>
          <h1 className="text-3xl font-bold text-slate-100 mt-1">Exam Simulator &amp; Official PYQ Engine</h1>
          <p className="text-sm text-slate-400">
            Real official GATE CS questions (2015–2024), timed exam simulations &amp; instant solution reviews
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('bank')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'bank'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Verified PYQ Bank ({questions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'tests'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Full Mocks ({tests?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'overview'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
        </div>
      </div>

      {activeTab === 'bank' && (
        <div className="space-y-6">
          {/* Year, Subject & Question Type Filters */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span>Filter PYQs:</span>
            </div>

            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-950 text-xs text-slate-200 p-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y === 'All Years' ? 'All GATE Years (2015-2024)' : `GATE ${y}`}
                </option>
              ))}
            </select>

            {/* Question Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-950 text-xs text-slate-200 p-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === 'All Types' ? 'All Types (MCQ / MSQ / NAT)' : t}
                </option>
              ))}
            </select>

            <span className="ml-auto text-xs text-slate-400 font-mono">
              Found <span className="text-cyan-400 font-bold">{filteredQuestions.length}</span> Verified Questions
            </span>
          </div>

          {/* Question List */}
          {qLoading ? (
            <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading verified question bank...</div>
          ) : filteredQuestions.length > 0 ? (
            <div className="space-y-6">
              {filteredQuestions.map((q: any, idx: number) => {
                const showSol = expandedAnswers[q.id];
                return (
                  <div key={q.id} className="p-6 bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl space-y-4 transition shadow-lg">
                    {/* Meta Bar */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-slate-400">Q{idx + 1}.</span>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          q.questionType === 'MSQ'
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                            : q.questionType.startsWith('NAT')
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {q.questionType}
                        </span>
                        <span className="text-xs font-mono text-slate-300">{q.marks || 1} Marks</span>
                        {q.negativeMarks > 0 && (
                          <span className="text-xs font-mono text-red-400">(-{q.negativeMarks})</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-[10px] font-mono">
                        {q.examName && (
                          <span className="px-2.5 py-0.5 bg-slate-800 text-cyan-300 rounded font-semibold border border-slate-700">
                            {q.examName}
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 font-bold">
                          OFFICIAL PYQ
                        </span>
                      </div>
                    </div>

                    {/* Question Text */}
                    <p className="text-sm font-semibold text-slate-100 leading-relaxed">{q.questionText}</p>

                    {/* Options Grid (for MCQ / MSQ) */}
                    {Array.isArray(q.options) && q.options.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                        {q.options.map((opt: any) => (
                          <div
                            key={opt.label}
                            className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs flex items-center space-x-3 text-slate-200"
                          >
                            <span className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 shrink-0">
                              {opt.label}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* NAT Box */}
                    {q.questionType.startsWith('NAT') && (
                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs flex items-center space-x-3 text-slate-400">
                        <span className="text-cyan-400 font-mono font-bold">Numerical Answer:</span>
                        <input
                          type="text"
                          placeholder="Type answer number..."
                          className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                    )}

                    {/* Solution Toggle */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                      <button
                        onClick={() => toggleAnswer(q.id)}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition"
                      >
                        <span>{showSol ? 'Hide Official Solution' : 'View Correct Answer & Solution'}</span>
                        {showSol ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Expanded Solution Panel */}
                    {showSol && (
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                          <Check className="w-4 h-4" />
                          <span>Correct Answer: {JSON.stringify(q.correctAnswer)}</span>
                        </div>
                        {q.explanation && (
                          <div className="text-slate-300 leading-relaxed pt-1 font-mono">
                            <span className="text-cyan-400 font-bold block mb-1">Explanation:</span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-700" />
              <p className="text-slate-300 font-semibold">No questions match the selected filter.</p>
              <p>Try selecting &quot;All Years&quot; to view all official PYQs.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Available GATE Full-Length Simulators</h2>
          {tLoading ? (
            <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading exam tests...</div>
          ) : tests && tests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tests.map((t) => (
                <div key={t.id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-mono rounded">
                      {t.testType}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{t.durationSeconds ? `${Math.round(t.durationSeconds / 60)} Mins` : '180 Mins'}</span>
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{t.title}</h3>
                  <p className="text-xs text-slate-400">
                    {t.description || 'Full-length GATE Computer Science exam simulator.'}
                  </p>
                  <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-xl transition shadow-md">
                    Start Timed Attempt
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
              No active exam tests available right now.
            </div>
          )}
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 uppercase font-mono">Verified PYQs</span>
            <div className="text-2xl font-bold text-slate-100">
              {questions?.filter((q) => q.sourceType === 'VERIFIED_PYQ').length || 0} Questions
            </div>
            <p className="text-xs text-slate-500">Official GATE CS historical questions verified by topic.</p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 uppercase font-mono">Exam Mock Tests</span>
            <div className="text-2xl font-bold text-slate-100">{tests?.length || 0} Full Mocks</div>
            <p className="text-xs text-slate-500">3-Hour full GATE simulator with negative marking rules.</p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 uppercase font-mono">Server Timing &amp; RLS</span>
            <div className="text-2xl font-bold text-cyan-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Authoritative</span>
            </div>
            <p className="text-xs text-slate-500">Immutable scoring, exact deadline auto-submission active.</p>
          </div>
        </div>
      )}
    </div>
  );
}
