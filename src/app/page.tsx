'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Send,
  Flame,
  ArrowRight,
  RotateCcw,
  Play,
  Pause,
  CheckCircle,
  Sparkles,
  BookOpen,
  ClipboardList,
  FlaskConical,
  Target,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Clock,
  Brain,
} from 'lucide-react';
import { useLearningSummary, useDailyMission, useMistakes, useRevisions } from '@/hooks/use-learning';
import { useCurrentDailyPlan } from '@/hooks/use-adaptive';
import { usePreparationProfile } from '@/hooks/use-strategy';
import { useExecuteAi } from '@/hooks/use-ai';

// ─── Real countdown to GATE 2028 ──────────────────────────────────────────
const GATE_DATE = new Date('2028-02-05T09:00:00+05:30');

function useCountdown() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    function calc() {
      const diff = GATE_DATE.getTime() - Date.now();
      if (diff <= 0) return;
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// ─── Pomodoro Focus Timer (no fake numbers — pure real-time) ─────────────
const FOCUS_DURATIONS = { focus: 45 * 60, break: 5 * 60 };

function FocusTimer({ todayWatchedSeconds }: { todayWatchedSeconds: number }) {
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [seconds, setSeconds] = useState(45 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(FOCUS_DURATIONS[mode]);
  }, [mode]);

  useEffect(() => {
    setSeconds(FOCUS_DURATIONS[mode]);
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [mode]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) { clearInterval(intervalRef.current!); setRunning(false); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const total = FOCUS_DURATIONS[mode];
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - (total - seconds) / total);

  // Real today watched time in h/m
  const todayH = Math.floor(todayWatchedSeconds / 3600);
  const todayM = Math.floor((todayWatchedSeconds % 3600) / 60);
  const hasTodayData = todayWatchedSeconds > 0;

  return (
    <div className="bg-[#111827] rounded-2xl border border-white/[0.07] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-wide">FOCUS TIMER</h3>
      </div>

      <div className="flex gap-2 p-1 bg-slate-900 rounded-xl">
        {(['focus', 'break'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${mode === m ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
            {m === 'focus' ? '● Focus' : '● Break'}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center py-2">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle cx="64" cy="64" r={radius} fill="none"
              stroke={mode === 'focus' ? '#00f0ff' : '#10b981'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white font-mono tabular-nums">{mm}:{ss}</span>
            <span className="text-xs text-slate-400 mt-0.5">{mode === 'focus' ? 'Deep Work' : 'Rest'}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setRunning((r) => !r)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${running ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/20'}`}>
          {running ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4 fill-white" /> Start</>}
        </button>
        <button onClick={reset} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center text-xs text-slate-500">
        {hasTodayData ? (
          <>Today: <span className="text-slate-300 font-semibold">{todayH > 0 ? `${todayH}h ` : ''}{todayM}m watched</span></>
        ) : (
          <span className="text-slate-600">No watch time recorded today yet</span>
        )}
      </div>
    </div>
  );
}

// ─── Weekly Activity: only real total, no fake day-by-day breakdown ───────
function WeeklyActivityChart({ totalWatchedSeconds }: { totalWatchedSeconds: number }) {
  const totalH = Math.floor(totalWatchedSeconds / 3600);
  const totalM = Math.floor((totalWatchedSeconds % 3600) / 60);
  const hasData = totalWatchedSeconds > 0;

  return (
    <div className="bg-[#111827] rounded-2xl border border-white/[0.07] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">STUDY ACTIVITY</h3>
        </div>
      </div>

      {hasData ? (
        <>
          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 p-4 bg-slate-900/60 rounded-xl border border-white/5">
              <div className="text-3xl font-black text-white">{totalH}h {totalM}m</div>
              <div className="text-xs text-slate-500 mt-1">Total Watch Time (all-time)</div>
            </div>
            <div className="flex-1 p-4 bg-slate-900/60 rounded-xl border border-white/5">
              <div className="text-3xl font-black text-cyan-400">{Math.floor(totalWatchedSeconds / 60)}</div>
              <div className="text-xs text-slate-500 mt-1">Total Minutes Watched</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Day-by-day breakdown available after recording daily study sessions. Keep your watch sessions active!
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Clock className="w-8 h-8 text-slate-700" />
          <p className="text-xs text-slate-500 text-center">No study time recorded yet.<br />Start a lesson to track your progress.</p>
          <Link href="/learn" className="text-xs text-cyan-400 hover:underline">Go to Learn →</Link>
        </div>
      )}
    </div>
  );
}

// ─── AI Command Center ─────────────────────────────────────────────────────
const QUICK_COMMANDS = [
  'Plan next 7 days for Algorithms',
  'Find my weak topics in DSA',
  'Give me 20 DP questions',
  'Explain LRU Cache',
  'Best topics to score 10+ marks',
  'Create revision plan for OS',
];

function AiCommandCenter() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const executeAiMutation = useExecuteAi();

  const send = async (text: string) => {
    if (!text.trim() || executeAiMutation.isPending) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');

    try {
      const res = await executeAiMutation.mutateAsync({
        capability: 'AI_COACH',
        userInput: text,
      });
      setMessages((m) => [...m, { role: 'ai', text: res.output }]);
    } catch (err: any) {
      setMessages((m) => [...m, { role: 'ai', text: `⚠️ AI Coach Notice: ${err?.message || 'Could not generate answer.'}` }]);
    }
  };

  return (
    <div className="bg-[#111827] rounded-2xl border border-white/[0.07] p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">AI COMMAND CENTER</h3>
        </div>
        <button className="text-[11px] text-slate-400 hover:text-cyan-400 transition flex items-center gap-1">
          History <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <p className="text-xs text-slate-400">Ask anything. Get study guidance, plans, doubts solved.</p>

      {messages.length > 0 && (
        <div className="space-y-2 max-h-32 overflow-y-auto thin-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`text-xs p-2.5 rounded-xl ${msg.role === 'user' ? 'bg-slate-800 text-slate-200 ml-6' : 'bg-purple-500/10 text-purple-200 mr-6 border border-purple-500/20'}`}>
              {msg.text}
            </div>
          ))}
          {executeAiMutation.isPending && (
            <div className="bg-purple-500/10 text-purple-300 text-xs p-2.5 rounded-xl mr-6 border border-purple-500/20 animate-pulse">Thinking & Reasoning...</div>
          )}
        </div>
      )}

      <div className="flex gap-2 items-center bg-slate-900 border border-white/10 rounded-xl px-3 py-2 focus-within:border-cyan-500/50 transition">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(input); }}
          placeholder="What should I study today?"
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none" />
        <button onClick={() => send(input)} disabled={!input.trim() || executeAiMutation.isPending}
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white disabled:opacity-30 transition hover:shadow-md">
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_COMMANDS.map((cmd) => (
          <button key={cmd} onClick={() => send(cmd)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white border border-white/5 transition">
            {cmd}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
          <span className="text-[8px] font-bold text-white">AI</span>
        </div>
        <span className="text-[11px] text-slate-500">Powered by AI GATE OS</span>
      </div>
    </div>
  );
}

// ─── Readiness Score — computed from real API data only ───────────────────
function ReadinessPanel({
  lessonsCompleted, lessonsStarted, openMistakes, dueRevisions, quizAttempts,
}: {
  lessonsCompleted: number; lessonsStarted: number; openMistakes: number; dueRevisions: number; quizAttempts: number;
}) {
  // Compute a real readiness score from actual data
  const lessonScore = Math.min(lessonsCompleted * 5, 400);           // max 400 pts
  const quizScore = Math.min(quizAttempts * 15, 300);                // max 300 pts
  const mistakePenalty = Math.min(openMistakes * 8, 150);            // max -150
  const revisionBonus = Math.max(0, 100 - dueRevisions * 10);       // max 100
  const score = Math.max(0, Math.round(lessonScore + quizScore - mistakePenalty + revisionBonus));
  const scoreCap = Math.min(score, 1000);
  const pct = Math.round((scoreCap / 1000) * 100);

  const label = pct >= 70 ? 'Strong' : pct >= 40 ? 'Good' : pct >= 20 ? 'Building' : 'Starting';
  const labelColor = pct >= 70 ? 'text-emerald-400' : pct >= 40 ? 'text-cyan-400' : pct >= 20 ? 'text-amber-400' : 'text-slate-400';

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - scoreCap / 1000);

  const hasAnyData = lessonsCompleted > 0 || quizAttempts > 0;

  return (
    <div className="bg-[#111827] rounded-2xl border border-white/[0.07] p-5 flex flex-col gap-5">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
          READINESS SCORE
          <span className="w-4 h-4 rounded-full bg-slate-700 text-[9px] flex items-center justify-center text-slate-400 cursor-help" title="Computed from: lessons completed, quiz attempts, open mistakes, due revisions">?</span>
        </h3>

        {hasAnyData ? (
          <div className="flex items-center gap-5">
            <div className="relative w-28 h-28 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle cx="64" cy="64" r={radius} fill="none" stroke="url(#scoreGrad)" strokeWidth="10"
                  strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#00f0ff" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{scoreCap}</span>
                <span className="text-[10px] text-slate-400">/1000</span>
                <span className={`text-[10px] font-semibold ${labelColor}`}>{label}</span>
              </div>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <div><span className="text-white font-semibold">{lessonsCompleted}</span> lessons completed</div>
              <div><span className="text-white font-semibold">{quizAttempts}</span> quiz attempts</div>
              <div><span className={openMistakes > 0 ? 'text-red-400 font-semibold' : 'text-white font-semibold'}>{openMistakes}</span> open mistakes</div>
              <div><span className={dueRevisions > 0 ? 'text-amber-400 font-semibold' : 'text-white font-semibold'}>{dueRevisions}</span> due revisions</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <Brain className="w-8 h-8 text-slate-700" />
            <p className="text-xs text-slate-500 text-center">Score will build as you<br />complete lessons and quizzes.</p>
            <Link href="/learn" className="text-xs text-cyan-400 hover:underline">Start Learning →</Link>
          </div>
        )}
      </div>

      {/* Real metric summary */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white">LEARNING STATS</span>
          <Link href="/progress" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
        </div>
        {[
          { label: 'Lessons Completed', value: lessonsCompleted, total: lessonsStarted, color: '#00f0ff' },
          { label: 'Quiz Attempts', value: quizAttempts, total: null, color: '#8b5cf6' },
          { label: 'Open Mistakes', value: openMistakes, total: null, color: openMistakes > 5 ? '#ef4444' : '#f59e0b' },
          { label: 'Due Revisions', value: dueRevisions, total: null, color: dueRevisions > 3 ? '#ef4444' : '#10b981' },
        ].map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{item.label}</span>
              <span className="font-semibold" style={{ color: item.color }}>
                {item.value}{item.total != null ? ` / ${item.total}` : ''}
              </span>
            </div>
            {item.total != null && item.total > 0 && (
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.round((item.value / item.total) * 100)}%`, background: item.color }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────
export default function HomePage() {
  const countdown = useCountdown();
  const { data: summary, isLoading: isSummaryLoading } = useLearningSummary();
  const { data: mission, isLoading: isMissionLoading } = useDailyMission();
  const { data: mistakes, isLoading: isMistakesLoading } = useMistakes();
  const { data: revisions, isLoading: isRevisionsLoading } = useRevisions();
  useCurrentDailyPlan();
  usePreparationProfile();

  // ── All values derived strictly from real API ──────────────────────────
  const lessonsCompleted = summary?.lessonsCompleted ?? 0;
  const lessonsStarted = summary?.lessonsStarted ?? 0;
  const totalWatchedSeconds = summary?.totalWatchedSeconds ?? 0;
  const openMistakesCount = summary?.openMistakesCount ?? 0;
  const dueRevisionsCount = summary?.dueRevisionsCount ?? 0;
  const quizAttempts = summary?.quizAttemptsSubmitted ?? 0;
  const recentScore = summary?.recentQuizScore;

  // Completion % of started lessons — real
  const overallPct = lessonsStarted > 0 ? Math.round((lessonsCompleted / lessonsStarted) * 100) : 0;

  // Mission items from real API
  const missionItems = mission?.items?.slice(0, 3) ?? [];
  const completedTasks = mission?.completedTasks ?? 0;
  const totalTasks = mission?.totalTasks ?? 0;

  // Revisions & mistakes from real API
  const upcomingRevisions = (revisions ?? []).slice(0, 4);
  const recentMistakes = (mistakes ?? []).slice(0, 4);

  // AI coach logic based on real data only
  const coachText = openMistakesCount > 5
    ? `You have ${openMistakesCount} open mistakes in your vault. Reviewing and reflecting on mistakes is the fastest way to improve your score.`
    : dueRevisionsCount > 3
    ? `You have ${dueRevisionsCount} topics due for spaced revision. Completing them today will prevent knowledge decay.`
    : lessonsCompleted === 0
    ? 'Start your first lesson to activate the AI coaching engine. Your personalized plan will generate after initial data.'
    : `You have completed ${lessonsCompleted} lesson${lessonsCompleted !== 1 ? 's' : ''}. Keep the momentum going with daily practice sessions.`;

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  function fmtRevDate(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  function timeAgo(isoStr: string) {
    const diff = Date.now() - new Date(isoStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  }

  const taskIcons = [BookOpen, ClipboardList, FlaskConical];

  const overallCircumference = 2 * Math.PI * 26;
  const overallDashOffset = overallCircumference * (1 - overallPct / 100);

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">

      {/* ── Row 1: Greeting + Real Stats ─────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start gap-5">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black text-white">{greeting}, Yaksharth 👋</h1>
          <p className="text-sm text-slate-400 mt-0.5">Let&apos;s make today count.</p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          {/* GATE Countdown — 100% real */}
          <div className="bg-[#111827] border border-white/[0.07] rounded-2xl px-5 py-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">GATE 2028 • Exam in</div>
            <div className="flex items-end gap-3">
              {[{ v: countdown.days, l: 'Days' }, { v: countdown.hours, l: 'Hrs' }, { v: countdown.minutes, l: 'Mins' }, { v: countdown.seconds, l: 'Secs' }].map(({ v, l }) => (
                <div key={l} className="flex flex-col items-center">
                  <span className="text-2xl font-black text-white tabular-nums">{String(v).padStart(2, '0')}</span>
                  <span className="text-[10px] text-slate-500">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Open Mistakes — real */}
          <div className="bg-[#111827] border border-white/[0.07] rounded-2xl px-5 py-3 flex flex-col gap-1 min-w-[120px]">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mistakes Open</div>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${openMistakesCount > 0 ? 'text-red-400' : 'text-slate-600'}`} />
              <span className="text-2xl font-black text-white">
                {isSummaryLoading ? '—' : openMistakesCount}
              </span>
            </div>
            <div className={`text-[11px] font-medium ${openMistakesCount > 0 ? 'text-red-400' : 'text-slate-500'}`}>
              {openMistakesCount > 0 ? 'Review today!' : 'Vault clear ✓'}
            </div>
          </div>

          {/* Completion ring — real */}
          <div className="bg-[#111827] border border-white/[0.07] rounded-2xl px-4 py-3 flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <circle cx="32" cy="32" r="26" fill="none"
                  stroke={overallPct > 0 ? '#10b981' : 'rgba(255,255,255,0.05)'}
                  strokeWidth="6"
                  strokeDasharray={overallCircumference}
                  strokeDashoffset={overallDashOffset}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-black text-white">
                  {isSummaryLoading ? '—' : `${overallPct}%`}
                </span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lessons</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Completion</div>
              <div className="text-xs text-slate-300 mt-1">
                <span className="text-emerald-400 font-bold">{lessonsCompleted}</span>
                <span className="text-slate-500"> / {lessonsStarted} started</span>
              </div>
              <Link href="/progress" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 mt-1">
                View Details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Mission + AI Chat + Stats Panel ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* TODAY'S MISSION — real API data */}
        <div className="bg-[#111827] rounded-2xl border border-white/[0.07] p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">TODAY&apos;S MISSION</h3>
            </div>
            {!isMissionLoading && totalTasks > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-[11px] font-semibold border border-cyan-500/20">
                {completedTasks}/{totalTasks} done
              </span>
            )}
          </div>

          {isMissionLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map(i => <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />)}
            </div>
          ) : missionItems.length > 0 ? (
            <div className="space-y-3">
              {missionItems.map((item, i) => {
                const Icon = taskIcons[i % taskIcons.length];
                return (
                  <Link key={item.id} href={item.targetUrl}
                    className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-xl border border-white/5 hover:border-cyan-500/20 transition block">
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${item.completed ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-600'}`}>
                      {item.completed && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded bg-cyan-500/10 flex items-center justify-center">
                          <Icon className="w-3 h-3 text-cyan-400" />
                        </div>
                        <p className={`text-xs font-semibold truncate ${item.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                          {item.title}
                        </p>
                      </div>
                      {item.subtitle && <p className="text-[11px] text-slate-500">{item.subtitle}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-500/50" />
              <p className="text-xs text-slate-400 text-center font-medium">All caught up! 🎉</p>
              <p className="text-xs text-slate-500 text-center">No pending tasks for today.<br />Complete a lesson to generate tomorrow&apos;s plan.</p>
              <Link href="/learn" className="text-xs text-cyan-400 hover:underline">Go to Learn →</Link>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <Link href="/mission" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              View Full Plan <ArrowRight className="w-3 h-3" />
            </Link>
            <Link href="/learn"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg transition">
              <Play className="w-3 h-3 fill-white" />
              Start Session
            </Link>
          </div>
        </div>

        {/* AI COMMAND CENTER */}
        <AiCommandCenter />

        {/* READINESS — all real numbers */}
        <ReadinessPanel
          lessonsCompleted={lessonsCompleted}
          lessonsStarted={lessonsStarted}
          openMistakes={openMistakesCount}
          dueRevisions={dueRevisionsCount}
          quizAttempts={quizAttempts}
        />
      </div>

      {/* ── Row 3: Revisions + Mistakes + Activity + Timer ───────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* UPCOMING REVISIONS — real API */}
        <div className="bg-[#111827] rounded-2xl border border-white/[0.07] p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">UPCOMING REVISIONS</h3>
            </div>
            <Link href="/revision" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isRevisionsLoading ? (
            <div className="space-y-3">{[0, 1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-800/50 rounded-xl animate-pulse" />)}</div>
          ) : upcomingRevisions.length > 0 ? (
            <div className="space-y-3">
              {upcomingRevisions.map((rev) => (
                <div key={rev.id} className="flex items-center gap-3">
                  <div className="text-center min-w-[52px]">
                    <div className="text-[10px] font-bold text-cyan-400">{fmtRevDate(rev.dueDate)}</div>
                    <div className="text-[9px] text-slate-500 uppercase">{rev.status}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{rev.title || 'Revision Item'}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{rev.sourceType.toLowerCase()} review</p>
                  </div>
                  <div className="text-[10px] font-mono text-slate-600">#{rev.reviewCount + 1}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <RotateCcw className="w-7 h-7 text-slate-700" />
              <p className="text-xs text-slate-500 text-center">No revisions due.<br />Complete lessons to schedule them.</p>
            </div>
          )}
        </div>

        {/* RECENT MISTAKES — real API */}
        <div className="bg-[#111827] rounded-2xl border border-white/[0.07] p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">RECENT MISTAKES</h3>
            </div>
            <Link href="/practice" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isMistakesLoading ? (
            <div className="space-y-3">{[0, 1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-800/50 rounded-xl animate-pulse" />)}</div>
          ) : recentMistakes.length > 0 ? (
            <div className="space-y-3">
              {recentMistakes.map((m) => (
                <div key={m.id} className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${m.occurrenceCount >= 3 ? 'bg-red-500/10 text-red-400 border-red-500/30' : m.occurrenceCount === 2 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                      {m.occurrenceCount >= 3 ? 'Recurring' : m.occurrenceCount === 2 ? 'Repeated' : 'New'}
                    </span>
                    <p className="text-xs text-slate-200 font-semibold truncate">
                      {m.questionText ? m.questionText.slice(0, 35) + '...' : 'Practice Question'}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-500">{timeAgo(m.lastSeenAt)} • Seen {m.occurrenceCount}x</p>
                  <p className="text-[10px] text-slate-400 capitalize">Status: <span className={m.status === 'OPEN' ? 'text-red-400' : m.status === 'REVIEWED' ? 'text-amber-400' : 'text-emerald-400'}>{m.status.toLowerCase()}</span></p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <CheckCircle className="w-7 h-7 text-slate-700" />
              <p className="text-xs text-slate-500 text-center">No mistakes yet!<br />Take quizzes to start tracking.</p>
              <Link href="/exam" className="text-xs text-cyan-400 hover:underline">Take a Quiz →</Link>
            </div>
          )}
        </div>

        {/* WEEKLY ACTIVITY — only real totalWatchedSeconds */}
        <WeeklyActivityChart totalWatchedSeconds={totalWatchedSeconds} />

        {/* FOCUS TIMER — real today watched time */}
        <FocusTimer todayWatchedSeconds={totalWatchedSeconds} />
      </div>

      {/* ── Row 4: AI Coach Recommendation — driven by real data ─────── */}
      <div className="bg-[#111827] rounded-2xl border border-white/[0.07] p-5 flex flex-col md:flex-row gap-5 items-start md:items-center">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold text-white">AI COACH RECOMMENDATION</span>
              {(openMistakesCount > 0 || dueRevisionsCount > 0) && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">Live</span>
              )}
            </div>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed">{coachText}</p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 pl-0 md:pl-8 border-l-0 md:border-l border-white/5">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Evidence</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {openMistakesCount > 0
                ? `${openMistakesCount} unresolved mistakes in your vault`
                : `${lessonsCompleted} lessons completed, ${quizAttempts} quiz attempts`}
            </p>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reason</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {dueRevisionsCount > 0
                ? `${dueRevisionsCount} topics scheduled for spaced review`
                : 'Consistent daily practice builds long-term retention'}
            </p>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Action</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {openMistakesCount > 5
                ? 'Review and reflect on 3–5 mistakes today from your vault'
                : dueRevisionsCount > 0
                ? 'Complete your due revisions before starting new content'
                : 'Start or continue a lesson from the curriculum'}
            </p>
          </div>
        </div>

        <Link href={openMistakesCount > 3 ? '/practice' : dueRevisionsCount > 0 ? '/revision' : '/learn'}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-semibold flex items-center gap-2 whitespace-nowrap shadow-lg transition shrink-0">
          View Full Analysis <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Recent Quiz Score — only if available */}
      {recentScore !== null && recentScore !== undefined && (
        <div className="bg-[#111827] rounded-2xl border border-white/[0.07] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-sm font-bold text-white">Recent Quiz Score</p>
              <p className="text-xs text-slate-400">Your last submitted quiz result</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-white">{recentScore}%</div>
            <div className={`text-xs font-semibold ${recentScore >= 70 ? 'text-emerald-400' : recentScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {recentScore >= 70 ? 'Strong' : recentScore >= 50 ? 'Improving' : 'Needs Work'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
