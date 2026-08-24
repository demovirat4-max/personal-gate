import React from 'react';
import {
  StudyStreakData,
  SubjectStat,
  SubjectWeightConfig,
  UserStudyState,
  UserStudyStateMap,
  VideoResource,
  WeeklyPlan,
} from '../types';
import {
  calculateSubjectStats,
  computeWhatsNextRecommendations,
  formatDuration,
} from '../utils/storage';
import { StudyStreakWidget } from './StudyStreakWidget';
import { StudyHoursTrendChart } from './StudyHoursTrendChart';
import {
  Play,
  ArrowRight,
  Sliders,
  Calendar,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface DashboardViewProps {
  resources: VideoResource[];
  userStates: UserStudyStateMap;
  subjectWeights: SubjectWeightConfig;
  streakData: StudyStreakData;
  onRecordActivity: (activityCount?: number) => void;
  weeklyPlan?: WeeklyPlan | null;
  onNavigateToWeeklyPlan?: () => void;
  onOpenSettings: () => void;
  onSelectSubject: (subject: string) => void;
  onPlayVideo: (resource: VideoResource) => void;
  onUpdateState: (resourceId: string, updates: Partial<UserStudyState>) => void;
  onOpenSummary: (resource: VideoResource) => void;
  onOpenQuiz: (resource: VideoResource) => void;
  onAskAi: (resource: VideoResource) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  resources,
  userStates,
  subjectWeights,
  streakData,
  onRecordActivity,
  weeklyPlan,
  onNavigateToWeeklyPlan,
  onOpenSettings,
  onSelectSubject,
  onPlayVideo,
  onUpdateState,
  onOpenSummary,
  onOpenQuiz,
  onAskAi,
}) => {
  const {
    subjectStats,
    overallWeightedScore,
    totalTopics,
    totalDone,
    totalInProgress,
    totalNeedsRevision,
    totalWeight,
    totalStudyTimeSeconds,
  } = calculateSubjectStats(resources, userStates, subjectWeights);

  const whatsNext = computeWhatsNextRecommendations(
    resources,
    userStates,
    subjectWeights
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 py-6 text-slate-900">
      
      {/* 1. Study Streak Tracker Widget */}
      <StudyStreakWidget
        streakData={streakData}
        onRecordActivity={onRecordActivity}
      />

      {/* 2. Recharts 7-Day Study Hours Trend Line Chart */}
      <StudyHoursTrendChart
        streakData={streakData}
        onRecordActivity={onRecordActivity}
      />

      {/* 3. Hero Metric: Single Large Readiness Number with quiet inline context */}
      <section className="rounded-xl bg-white border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 font-medium">
              Weighted GATE CSE readiness
            </span>
            <div className="mt-1 flex items-baseline space-x-3">
              <span className="text-5xl font-bold tracking-tight text-blue-600 font-mono">
                {overallWeightedScore.toFixed(1)}%
              </span>
              <span className="text-sm text-slate-500">
                of {totalWeight} marks syllabus weight
              </span>
            </div>

            {/* Quiet inline metadata counts */}
            <div className="mt-3 text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{totalDone} of {totalTopics} completed ({totalTopics > 0 ? ((totalDone / totalTopics) * 100).toFixed(0) : 0}%)</span>
              <span>•</span>
              <span>{totalInProgress} in progress</span>
              <span>•</span>
              <span>{totalNeedsRevision} marked for revision</span>
              {totalStudyTimeSeconds > 0 && (
                <>
                  <span>•</span>
                  <span>{formatDuration(totalStudyTimeSeconds)} logged</span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="self-start md:self-auto px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
          >
            Tune weights
          </button>
        </div>

        {/* Slim Progress Bar */}
        <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, overallWeightedScore))}%` }}
          />
        </div>
      </section>

      {/* Weekly Plan Quick Status Banner */}
      {onNavigateToWeeklyPlan && (
        <section
          onClick={onNavigateToWeeklyPlan}
          className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start space-x-3.5">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-800 shrink-0 mt-0.5">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-900">
                  AI Weekly Study Planner
                </span>
                {weeklyPlan ? (
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    Active Plan
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                    Check-in ready
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                {weeklyPlan
                  ? `${weeklyPlan.weekTheme} • ${weeklyPlan.dailyTargetHours}h/day • ${weeklyPlan.holidayDays.length} holiday/rest day${weeklyPlan.holidayDays.length !== 1 ? 's' : ''}`
                  : 'Start of the week check-in: Set your daily study hours and holiday days to generate a custom AI study plan.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-medium text-slate-900 shrink-0">
            <span>{weeklyPlan ? 'View weekly schedule' : 'Plan my week'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          </div>
        </section>
      )}

      {/* 2. What to Study Next - De-cluttered: Title, small subject label, one action */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            What to study next
          </h2>
          <p className="text-xs text-slate-500">
            Ranked by priority score, weight, and current progress
          </p>
        </div>

        {whatsNext.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
            All topics are currently completed. Check the revision tab for practice.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {whatsNext.slice(0, 4).map((item) => {
              const res = item.resource;
              return (
                <div
                  key={res.id}
                  className="rounded-lg bg-white border border-slate-200 p-3.5 flex flex-col justify-between gap-3 hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 block truncate">
                      {res.subject} • {res.priority} priority
                    </span>
                    <h3 className="text-xs font-medium text-slate-900 line-clamp-2 leading-snug">
                      {res.topic}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onPlayVideo(res);
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Study Lecture</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Subject Coverage & Marks Distribution - Hairline rows with 1px dividers */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Subject coverage & marks distribution
            </h2>
            <p className="text-xs text-slate-500">
              Click any subject to open its lectures
            </p>
          </div>
        </div>

        {/* Clean list with hairline dividers */}
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          {subjectStats.map((stat) => (
            <div
              key={stat.subject}
              id={`stat-subject-${stat.code}`}
              onClick={() => onSelectSubject(stat.subject)}
              className="p-3.5 sm:p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Left: Code, Name, Weight */}
              <div className="sm:w-1/3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-medium text-slate-500">
                    [{stat.code}]
                  </span>
                  <span className="text-xs font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                    {stat.subject}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  {stat.weight}% weight • {stat.totalTopics} lectures
                </span>
              </div>

              {/* Middle: Progress bar and count */}
              <div className="sm:w-1/3 flex items-center space-x-3">
                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-slate-900 h-full rounded-full transition-all"
                    style={{ width: `${stat.rawProgressPercent}%` }}
                  />
                </div>
                <span className="text-xs text-slate-700 font-mono text-right w-12 shrink-0">
                  {stat.rawProgressPercent.toFixed(0)}%
                </span>
              </div>

              {/* Right: Detailed status & arrow */}
              <div className="sm:w-1/4 flex items-center justify-between sm:justify-end sm:space-x-4 text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <span>{stat.done}/{stat.totalTopics} done</span>
                  {stat.inProgress > 0 && (
                    <span className="text-slate-600">({stat.inProgress} active)</span>
                  )}
                  {stat.needsRevision > 0 && (
                    <span className="text-slate-600">({stat.needsRevision} rev)</span>
                  )}
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
