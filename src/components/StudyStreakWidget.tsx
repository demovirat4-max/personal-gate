import React, { useState } from 'react';
import { StudyStreakData } from '../types';
import { getEffectiveStreakInfo } from '../utils/storage';
import {
  Flame,
  Trophy,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
  TrendingUp,
  Plus,
} from 'lucide-react';

interface StudyStreakWidgetProps {
  streakData: StudyStreakData;
  onRecordActivity: (activityCount?: number) => void;
}

export const StudyStreakWidget: React.FC<StudyStreakWidgetProps> = ({
  streakData,
  onRecordActivity,
}) => {
  const [justLogged, setJustLogged] = useState(false);
  const info = getEffectiveStreakInfo(streakData);

  const handleQuickLog = () => {
    onRecordActivity(1);
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2500);
  };

  // Next milestone calculation (e.g., 3, 7, 14, 30, 60, 100 days)
  const milestones = [3, 7, 14, 30, 60, 90, 120];
  const nextMilestone = milestones.find((m) => m > info.effectiveStreak) || (info.effectiveStreak + 10);
  const prevMilestone = [...milestones].reverse().find((m) => m <= info.effectiveStreak) || 0;
  const milestoneProgress = Math.min(
    100,
    Math.max(
      0,
      Math.round(((info.effectiveStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100)
    )
  );

  return (
    <section
      id="study-streak-card"
      className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs relative overflow-hidden"
    >
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Streak Icon, Count, and Status */}
        <div className="flex items-start space-x-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
              info.effectiveStreak > 0
                ? 'bg-amber-50 text-amber-600 border border-amber-200/80 shadow-xs'
                : 'bg-slate-100 text-slate-400 border border-slate-200'
            }`}
          >
            <Flame
              className={`w-6 h-6 ${
                info.effectiveStreak > 0 ? 'fill-amber-500 text-amber-500 animate-pulse' : 'text-slate-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center space-x-2.5 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Study Streak
              </span>
              {info.isActiveToday ? (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Logged Today ({info.activeTodayCount} {info.activeTodayCount === 1 ? 'activity' : 'activities'})</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-medium">
                  <Zap className="w-3 h-3 text-amber-600" />
                  <span>Study today to maintain streak</span>
                </span>
              )}
            </div>

            <div className="mt-1 flex items-baseline space-x-3">
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-mono">
                {info.effectiveStreak}
                <span className="text-lg sm:text-xl font-medium text-slate-500 ml-1.5">
                  {info.effectiveStreak === 1 ? 'day' : 'days'}
                </span>
              </h3>

              <span className="text-xs text-slate-500 flex items-center space-x-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500 inline" />
                <span>Best: <strong className="text-slate-700 font-mono">{info.longestStreak}d</strong></span>
                <span className="text-slate-300">•</span>
                <span>{info.totalActiveDays} days total</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Log Activity Action */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            id="btn-quick-log-streak"
            onClick={handleQuickLog}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
              justLogged
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
            }`}
          >
            {justLogged ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Activity Logged!</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Log Study Session</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 7-Day Activity Timeline & Milestone Progress Bar */}
      <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Past 7 Days Visual Tracker */}
        <div className="md:col-span-8">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-medium text-slate-700 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Past 7 days activity</span>
            </span>
            <span className="text-[11px] text-slate-400">
              {info.past7Days.filter((d) => d.hasActivity).length} of 7 days active
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {info.past7Days.map((day) => {
              return (
                <div
                  key={day.dateStr}
                  id={`streak-day-${day.dateStr}`}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all text-center ${
                    day.hasActivity
                      ? 'bg-amber-50/70 border-amber-200 text-slate-900'
                      : day.isToday
                      ? 'bg-slate-50 border-slate-300 border-dashed text-slate-700'
                      : 'bg-slate-50/50 border-slate-100 text-slate-400'
                  }`}
                  title={`${day.dateStr}: ${day.count} activities logged`}
                >
                  <span className="text-[10px] font-medium text-slate-500">
                    {day.dayLabel}
                  </span>

                  <div className="my-1 flex items-center justify-center">
                    {day.hasActivity ? (
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Flame className="w-3 h-3 fill-current" />
                      </div>
                    ) : day.isToday ? (
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center bg-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center bg-white/60">
                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                      </div>
                    )}
                  </div>

                  <span className={`text-[10px] font-mono ${day.isToday ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                    {day.dayNum}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone Card */}
        <div className="md:col-span-4 bg-slate-50 rounded-lg p-3.5 border border-slate-200/80 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>Next Goal: {nextMilestone} Days</span>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              {info.effectiveStreak}/{nextMilestone}d
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden my-1.5">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${milestoneProgress}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 mt-1">
            {nextMilestone - info.effectiveStreak > 0
              ? `${nextMilestone - info.effectiveStreak} more consecutive days to reach the ${nextMilestone}-day milestone.`
              : `Milestone achieved! Aim for your next consistency target.`}
          </p>
        </div>
      </div>
    </section>
  );
};
