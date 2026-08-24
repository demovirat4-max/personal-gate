import React, { useState } from 'react';
import {
  SubjectWeightConfig,
  UserStudyStateMap,
  VideoResource,
  WeeklyPlan,
  WeeklyPlanDay,
  WeeklyPlanTask,
} from '../types';
import {
  getCurrentWeekInfo,
  getTopicState,
  saveWeeklyPlan,
} from '../utils/storage';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  Play,
  RotateCcw,
  Check,
  ChevronRight,
  Sun,
  Coffee,
  BookOpen,
  HelpCircle,
  Zap,
  Target,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface WeeklyPlanViewProps {
  resources: VideoResource[];
  userStates: UserStudyStateMap;
  subjectWeights: SubjectWeightConfig;
  weeklyPlan: WeeklyPlan | null;
  onSaveWeeklyPlan: (plan: WeeklyPlan | null) => void;
  onOpenVideo: (resource: VideoResource) => void;
  onNavigateToSubjects: () => void;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({
  resources,
  userStates,
  subjectWeights,
  weeklyPlan,
  onSaveWeeklyPlan,
  onOpenVideo,
  onNavigateToSubjects,
}) => {
  const currentWeekInfo = getCurrentWeekInfo();

  // Wizard Setup Form State
  const [dailyHours, setDailyHours] = useState<number>(3);
  const [holidayDays, setHolidayDays] = useState<string[]>(['Sunday']);
  const [strategy, setStrategy] = useState<string>('balanced');
  const [selectedFocusSubjects, setSelectedFocusSubjects] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(!weeklyPlan);

  // Active selected day filter in planner (default: today's day index or 0)
  const todayName = DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const [activeDayIndex, setActiveDayIndex] = useState<number>(() => {
    const foundIdx = DAYS_OF_WEEK.indexOf(todayName);
    return foundIdx >= 0 ? foundIdx : 0;
  });

  const allSubjects: string[] = Array.from(new Set(resources.map((r) => r.subject))).filter(Boolean) as string[];

  const toggleHolidayDay = (day: string) => {
    setHolidayDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleSubjectFocus = (subj: string) => {
    setSelectedFocusSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setError(null);

    // Extract pending and revision topics to ground the AI
    const pendingList: { topic: string; subject: string }[] = [];
    const revisionList: { topic: string; subject: string }[] = [];

    resources.forEach((res) => {
      const state = getTopicState(userStates, res);
      if (state.progress !== 'done') {
        pendingList.push({ topic: res.topic, subject: res.subject });
      }
      if (state.revision === 'needs_revision') {
        revisionList.push({ topic: res.topic, subject: res.subject });
      }
    });

    try {
      const response = await fetch('/api/ai/weekly-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dailyHours,
          holidayDays,
          focusSubjects: selectedFocusSubjects,
          strategy,
          weekKey: currentWeekInfo.weekKey,
          weekStartDate: currentWeekInfo.startStr,
          weekEndDate: currentWeekInfo.endStr,
          dayDates: currentWeekInfo.dayDates,
          pendingTopicsList: pendingList,
          revisionTopicsList: revisionList,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error HTTP ${response.status}`);
      }

      const newPlan: WeeklyPlan = await response.json();
      onSaveWeeklyPlan(newPlan);
      setIsConfiguring(false);
    } catch (err: any) {
      console.error('Failed to generate weekly plan:', err);
      setError(err.message || 'Unable to generate schedule. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleTaskCompleted = (dayIndex: number, taskId: string) => {
    if (!weeklyPlan) return;
    const updatedDays = weeklyPlan.days.map((day) => {
      if (day.dayIndex !== dayIndex) return day;
      return {
        ...day,
        tasks: day.tasks.map((task) => {
          if (task.id !== taskId) return task;
          return { ...task, completed: !task.completed };
        }),
      };
    });

    const updatedPlan: WeeklyPlan = {
      ...weeklyPlan,
      days: updatedDays,
      updatedAt: new Date().toISOString(),
    };

    onSaveWeeklyPlan(updatedPlan);
  };

  const handleFindAndOpenTopic = (topicName: string, subjectName: string) => {
    const cleanT = topicName.toLowerCase().trim();
    const found =
      resources.find(
        (r) =>
          r.topic.toLowerCase().includes(cleanT) ||
          cleanT.includes(r.topic.toLowerCase())
      ) ||
      resources.find((r) => r.subject.toLowerCase() === subjectName.toLowerCase());

    if (found) {
      onOpenVideo(found);
    } else {
      onNavigateToSubjects();
    }
  };

  // Calculate plan completion statistics
  const totalTasksCount = weeklyPlan
    ? weeklyPlan.days.reduce((sum, d) => sum + d.tasks.length, 0)
    : 0;
  const completedTasksCount = weeklyPlan
    ? weeklyPlan.days.reduce(
        (sum, d) => sum + d.tasks.filter((t) => t.completed).length,
        0
      )
    : 0;
  const progressPercent =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
              {currentWeekInfo.weekKey}
            </span>
            <span className="text-xs text-slate-500">
              {currentWeekInfo.startStr} – {currentWeekInfo.endStr}
            </span>
          </div>
          <h1 className="text-lg font-semibold text-slate-900 mt-1">
            Weekly Study Planner
          </h1>
          <p className="text-xs text-slate-500 max-w-xl">
            Custom schedule built around your daily study hours, rest days, and pending syllabus backlog.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {weeklyPlan && !isConfiguring && (
            <button
              onClick={() => setIsConfiguring(true)}
              className="px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              Adjust schedule & holidays
            </button>
          )}
          <button
            onClick={() => {
              setIsConfiguring(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{weeklyPlan ? 'Regenerate plan' : 'Plan this week'}</span>
          </button>
        </div>
      </div>

      {/* Week Configuration / Check-in Wizard Modal or Inline Card */}
      {isConfiguring && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Weekly Study Check-in ({currentWeekInfo.startStr} – {currentWeekInfo.endStr})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tell us your target daily hours and holiday days so AI can balance your syllabus workload.
              </p>
            </div>
            {weeklyPlan && (
              <button
                onClick={() => setIsConfiguring(false)}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1: Daily Study Capacity */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-900 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-slate-700" />
                <span>1. How much time can you study daily?</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setDailyHours(hours)}
                    className={`py-2 px-3 rounded text-center border text-xs font-medium transition-colors cursor-pointer ${
                      dailyHours === hours
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>{hours} hr{hours > 1 ? 's' : ''}</div>
                    <div className="text-[10px] opacity-70">{hours * 60}m/day</div>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Total weekly capacity:{' '}
                <span className="font-semibold text-slate-900">
                  {(7 - holidayDays.length) * dailyHours} hours
                </span>{' '}
                across {7 - holidayDays.length} active study day{7 - holidayDays.length !== 1 ? 's' : ''}.
              </p>
            </div>

            {/* Step 2: Holidays / Rest Days */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-900 flex items-center space-x-1.5">
                <Coffee className="w-4 h-4 text-slate-700" />
                <span>2. Are you taking any holidays/rest days this week?</span>
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {DAYS_OF_WEEK.map((day) => {
                  const isOff = holidayDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleHolidayDay(day)}
                      className={`p-2 rounded text-center border text-xs transition-colors cursor-pointer ${
                        isOff
                          ? 'bg-amber-50 text-amber-900 border-amber-300 font-medium'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-medium">{day.slice(0, 3)}</div>
                      <div className="text-[10px] text-slate-400">
                        {isOff ? '🌴 Off' : 'Study'}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                <button
                  type="button"
                  onClick={() => setHolidayDays(['Sunday'])}
                  className="text-slate-700 hover:underline cursor-pointer font-medium"
                >
                  Sunday only
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setHolidayDays(['Saturday', 'Sunday'])}
                  className="text-slate-700 hover:underline cursor-pointer font-medium"
                >
                  Weekends off
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setHolidayDays([])}
                  className="text-slate-700 hover:underline cursor-pointer font-medium"
                >
                  No holiday (Grind 7 days)
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Focus Strategy & Subjects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-900 flex items-center space-x-1.5">
                <Target className="w-4 h-4 text-slate-700" />
                <span>3. Study Strategy</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'balanced', title: 'Balanced', desc: 'Theory + PYQs + Revision' },
                  { id: 'problem_solving', title: 'PYQ Focus', desc: 'Heavy numerical practice' },
                  { id: 'theory_mastery', title: 'Concept Sprint', desc: 'Fast syllabus coverage' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStrategy(st.id)}
                    className={`p-2.5 rounded text-left border transition-colors cursor-pointer ${
                      strategy === st.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-medium">{st.title}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        strategy === st.id ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {st.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Filters */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-900 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-slate-700" />
                <span>4. Focus Subjects (Optional)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded border border-slate-200">
                {allSubjects.map((subj) => {
                  const isSelected = selectedFocusSubjects.includes(subj);
                  return (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => toggleSubjectFocus(subj)}
                      className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white font-medium'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {subj}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400">
                Leave empty to automatically prioritize highest-weighted pending topics.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded bg-slate-50 border border-slate-200 text-slate-700 text-xs">
              {error}
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            {weeklyPlan && (
              <button
                type="button"
                onClick={() => setIsConfiguring(false)}
                className="px-4 py-2 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Back to current schedule
              </button>
            )}
            <button
              type="button"
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-5 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating AI schedule...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Weekly Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Weekly Plan View */}
      {weeklyPlan && (
        <div className="space-y-5">
          {/* Plan Summary Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-slate-500">Theme:</span>
                <span className="text-xs font-semibold text-slate-900">
                  {weeklyPlan.weekTheme}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {weeklyPlan.weeklyGoalSummary}
              </p>
            </div>

            {/* Progress metric */}
            <div className="flex items-center space-x-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shrink-0">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-900">
                  {completedTasksCount} / {totalTasksCount} tasks done
                </div>
                <div className="text-[11px] text-slate-500">
                  {weeklyPlan.totalPlannedHours}h total target
                </div>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-slate-200 flex items-center justify-center font-mono text-xs font-bold text-slate-900 bg-white">
                {progressPercent}%
              </div>
            </div>
          </div>

          {/* Day-by-Day Selector Tabs */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {weeklyPlan.days.map((day) => {
              const isSelected = activeDayIndex === day.dayIndex;
              const isToday = day.dayName === todayName;
              const dayTasksCount = day.tasks.length;
              const dayDoneCount = day.tasks.filter((t) => t.completed).length;

              return (
                <button
                  key={day.dayIndex}
                  onClick={() => setActiveDayIndex(day.dayIndex)}
                  className={`p-2 sm:p-2.5 rounded-lg text-center border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : day.isHoliday
                      ? 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {isToday && (
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-1 text-[9px] font-semibold uppercase rounded bg-blue-600 text-white leading-tight">
                      Today
                    </span>
                  )}
                  <div className="text-xs font-semibold">{day.dayName.slice(0, 3)}</div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      isSelected ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {day.dateStr}
                  </div>

                  <div className="mt-1.5 text-[10px] font-medium">
                    {day.isHoliday ? (
                      <span className={isSelected ? 'text-amber-300' : 'text-slate-400'}>
                        🌴 Off
                      </span>
                    ) : (
                      <span
                        className={
                          dayDoneCount === dayTasksCount && dayTasksCount > 0
                            ? 'text-emerald-500 font-semibold'
                            : isSelected
                            ? 'text-slate-200'
                            : 'text-slate-500'
                        }
                      >
                        {dayDoneCount}/{dayTasksCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Day Detail Card */}
          {weeklyPlan.days[activeDayIndex] && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-sm font-semibold text-slate-900">
                      {weeklyPlan.days[activeDayIndex].dayName} ({weeklyPlan.days[activeDayIndex].dateStr})
                    </h2>
                    {weeklyPlan.days[activeDayIndex].isHoliday ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                        Holiday / Rest Day
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800">
                        {weeklyPlan.days[activeDayIndex].allocatedMinutes} minutes allocated
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {weeklyPlan.days[activeDayIndex].dailyObjective ||
                      weeklyPlan.days[activeDayIndex].holidayNote}
                  </p>
                </div>

                <div className="text-xs text-slate-500">
                  Focus: <span className="font-medium text-slate-800">{weeklyPlan.days[activeDayIndex].focusSubject || 'General'}</span>
                </div>
              </div>

              {/* Tasks List */}
              {weeklyPlan.days[activeDayIndex].isHoliday && weeklyPlan.days[activeDayIndex].tasks.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <Coffee className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="text-xs font-semibold text-slate-800">
                    Rest & Recharge Day
                  </div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {weeklyPlan.days[activeDayIndex].holidayNote ||
                      'No heavy study planned today. Take time to relax, or review quick flashcards if you feel like it.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {weeklyPlan.days[activeDayIndex].tasks.map((task, tIdx) => {
                    const isCompleted = task.completed;
                    const typeLabels: Record<string, { label: string; bg: string }> = {
                      lecture: { label: 'Lecture', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
                      pyq: { label: 'PYQ Practice', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                      revision: { label: 'Revision', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
                      quiz: { label: 'Quiz / Test', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
                      rest: { label: 'Light Break', bg: 'bg-slate-50 text-slate-600 border-slate-200' },
                    };
                    const typeBadge = typeLabels[task.type] || typeLabels.lecture;

                    return (
                      <div
                        key={task.id || tIdx}
                        className={`p-3.5 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                          isCompleted
                            ? 'bg-slate-50/70 border-slate-200 opacity-80'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start space-x-3 min-w-0 flex-1">
                          <button
                            onClick={() =>
                              handleToggleTaskCompleted(
                                activeDayIndex,
                                task.id
                              )
                            }
                            className="mt-0.5 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${typeBadge.bg}`}
                              >
                                {typeBadge.label}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {task.subjectName}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">
                                • {task.durationMinutes} mins
                              </span>
                            </div>

                            <div
                              className={`text-xs font-semibold ${
                                isCompleted
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </div>

                            {task.actionTip && (
                              <p className="text-[11px] text-slate-500 leading-relaxed">
                                {task.actionTip}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action: Open Topic in Syllabus */}
                        <button
                          onClick={() =>
                            handleFindAndOpenTopic(
                              task.topicName || task.title,
                              task.subjectName
                            )
                          }
                          title="Open lecture video and study notes"
                          className="shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 text-slate-700" />
                          <span className="hidden sm:inline">Study topic</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
