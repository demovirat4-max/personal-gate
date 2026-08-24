import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Sparkles,
  Target,
  Flame,
  CheckCircle2,
  Hourglass,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface GateTimerProps {
  onNavigateToPlan?: () => void;
}

interface TimeRemaining {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  weeks: number;
  months: number;
  isPast: boolean;
}

export const Gate2028Timer: React.FC<GateTimerProps> = ({ onNavigateToPlan }) => {
  // Target: GATE 2028 Exam (Expected: Saturday, February 5, 2028, 09:30:00 IST)
  // 2028-02-05T09:30:00+05:30 -> in UTC timestamp
  const targetDate = new Date('2028-02-05T09:30:00+05:30');

  // Baseline start for progress estimation (e.g. 2025-01-01)
  const baselineStartDate = new Date('2025-01-01T00:00:00+05:30');

  const calculateTimeRemaining = (): TimeRemaining => {
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return {
        totalSeconds: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        weeks: 0,
        months: 0,
        isPast: true,
      };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.4375);

    return {
      totalSeconds,
      days,
      hours,
      minutes,
      seconds,
      weeks,
      months,
      isPast: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(calculateTimeRemaining);

  // Live running timer effect with 1s interval
  useEffect(() => {
    // Initial run
    setTimeLeft(calculateTimeRemaining());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate elapsed percentage from baseline to target
  const now = new Date();
  const totalDurationMs = targetDate.getTime() - baselineStartDate.getTime();
  const elapsedMs = Math.max(0, now.getTime() - baselineStartDate.getTime());
  const elapsedPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));

  // Target study estimation (assuming 900 hours total preparation goal for top rank)
  const targetTotalHours = 900;
  const remainingDays = Math.max(1, timeLeft.days);
  const recommendedMinutesPerDay = Math.round((targetTotalHours * 60) / remainingDays);
  const recommendedHoursPerWeek = (Math.round(((targetTotalHours * 7) / remainingDays) * 10) / 10).toFixed(1);

  return (
    <div
      id="gate-2028-running-timer"
      className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs relative overflow-hidden"
    >
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center shrink-0">
            <Hourglass className="w-5 h-5 text-blue-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Official Countdown
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                <span>Live Running Timer</span>
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              GATE 2028 Examination Countdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Target date: <strong className="text-slate-700">Saturday, February 5, 2028</strong> (09:30 AM IST)
            </p>
          </div>
        </div>

        {/* Right Info Box */}
        <div className="flex items-center space-x-2 sm:space-x-3 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[10px] uppercase font-medium">Approx. Weeks</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{timeLeft.weeks} weeks</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[10px] uppercase font-medium">Approx. Months</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{timeLeft.months} months</span>
          </div>
        </div>
      </div>

      {/* Main Running Digital Countdown Blocks */}
      <div className="py-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Days Block */}
        <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs border border-slate-800 relative group">
          <span className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono tracking-tight text-white">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-slate-400 mt-1">
            Days
          </span>
          <div className="absolute top-2 right-2.5 opacity-40 group-hover:opacity-100 transition-opacity">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Hours Block */}
        <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs border border-slate-800 relative group">
          <span className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono tracking-tight text-white">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-slate-400 mt-1">
            Hours
          </span>
          <div className="absolute top-2 right-2.5 opacity-40 group-hover:opacity-100 transition-opacity">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Minutes Block */}
        <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs border border-slate-800 relative group">
          <span className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono tracking-tight text-white">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-slate-400 mt-1">
            Minutes
          </span>
          <div className="absolute top-2 right-2.5 opacity-40 group-hover:opacity-100 transition-opacity">
            <Hourglass className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Running Seconds Block */}
        <div className="bg-blue-600 text-white rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-sm border border-blue-500 relative group overflow-hidden">
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-white/10 rounded-full blur-xs pointer-events-none"></div>
          <span className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono tracking-tight text-white">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-blue-100 mt-1 flex items-center space-x-1">
            <span>Seconds</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          </span>
          <div className="absolute top-2 right-2.5 opacity-70">
            <Flame className="w-3.5 h-3.5 text-blue-200 fill-blue-200" />
          </div>
        </div>
      </div>

      {/* Strategic Preparation Timeline & Pace Guidance */}
      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Recommended Daily Pace */}
        <div className="md:col-span-8 bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-800 flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>Recommended Study Pace for Top 100 Rank</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              ~{targetTotalHours}h preparation roadmap
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            To comfortably complete all 12 core subjects, 15 years of PYQs, and 40+ full mock tests before February 2028:
          </p>

          <div className="mt-2.5 flex flex-wrap gap-2.5 text-xs">
            <div className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700">
              Daily Target: <strong className="text-slate-900 font-mono">{recommendedMinutesPerDay} mins/day</strong> ({Math.round(recommendedMinutesPerDay / 60 * 10) / 10} hrs)
            </div>
            <div className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700">
              Weekly Target: <strong className="text-slate-900 font-mono">~{recommendedHoursPerWeek} hrs/week</strong>
            </div>
          </div>
        </div>

        {/* Quick Shortcut to Weekly Plan */}
        <div className="md:col-span-4 flex flex-col justify-center h-full">
          {onNavigateToPlan && (
            <button
              id="btn-goto-study-plan-from-timer"
              onClick={onNavigateToPlan}
              className="w-full py-2.5 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <span>Build Weekly Study Routine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Also export alias for backward compatibility
export const Gate2029Timer = Gate2028Timer;
