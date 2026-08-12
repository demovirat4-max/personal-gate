'use client';

import React, { useState } from 'react';
import {
  usePreparationProfile,
  useSavePreparationProfile,
  useLongTermGoals,
  useCreateGoal,
  useGenerateSchedule,
} from '@/hooks/use-strategy';

export default function StrategyPage() {
  const { data: profile } = usePreparationProfile();
  const { data: goals } = useLongTermGoals();

  const saveProfileMutation = useSavePreparationProfile();
  const createGoalMutation = useCreateGoal();
  const generateScheduleMutation = useGenerateSchedule();

  const [weeklyMinutes, setWeeklyMinutes] = useState(1200);
  const [strategyMode, setStrategyMode] = useState<
    'BALANCED' | 'FOUNDATION_FIRST' | 'REVISION_HEAVY' | 'PYQ_HEAVY' | 'MOCK_FOCUSED'
  >('BALANCED');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDate, setGoalDate] = useState('2026-12-31');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfileMutation.mutateAsync({
      targetExam: 'GATE CS/IT',
      targetYear: 2028,
      weeklyStudyMinutes: Number(weeklyMinutes),
      strategyMode,
    });
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle) return;
    await createGoalMutation.mutateAsync({
      goalType: 'CURRICULUM_COVERAGE',
      title: goalTitle,
      targetDate: goalDate,
      priority: 1,
    });
    setGoalTitle('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
            DETERMINISTIC STRATEGY & SCHEDULER
          </span>
          <h1 className="text-3xl font-bold text-slate-100 mt-1">Final-Rank Strategy Optimizer</h1>
          <p className="text-sm text-slate-400">
            Plan long-term GATE CS study horizons & optimize weekly schedules deterministically
          </p>
        </div>

        <button
          onClick={() => generateScheduleMutation.mutateAsync()}
          disabled={generateScheduleMutation.isPending}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition"
        >
          {generateScheduleMutation.isPending ? 'Optimizing Schedule...' : 'Generate 7-Day Schedule'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preparation Profile Form */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Preparation Profile</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Weekly Study Budget (Minutes)</label>
              <input
                type="number"
                value={weeklyMinutes}
                onChange={(e) => setWeeklyMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Strategy Mode</label>
              <select
                value={strategyMode}
                onChange={(e: any) => setStrategyMode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="BALANCED">Balanced Foundation & PYQs</option>
                <option value="FOUNDATION_FIRST">Foundation Concept First</option>
                <option value="REVISION_HEAVY">Revision Heavy Spaced Repetition</option>
                <option value="PYQ_HEAVY">PYQ Practice Focus</option>
                <option value="MOCK_FOCUSED">Mock Test Intensive</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={saveProfileMutation.isPending}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
            >
              {saveProfileMutation.isPending ? 'Updating...' : 'Save Profile'}
            </button>
          </form>

          {profile && (
            <div className="pt-4 border-t border-slate-800 text-xs space-y-1 text-slate-400 font-mono">
              <div>
                Target: {profile.targetExam} ({profile.targetYear})
              </div>
              <div>Budget: {profile.weeklyStudyMinutes} mins/week</div>
              <div>Active Mode: {profile.strategyMode}</div>
            </div>
          )}
        </div>

        {/* Long Term Goals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Set Long-Term Preparation Goal
            </h2>
            <form onSubmit={handleCreateGoal} className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Goal Title (e.g. Finish Algorithms Curriculum)..."
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
              <input
                type="date"
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
              <button
                type="submit"
                disabled={createGoalMutation.isPending}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition"
              >
                Add Goal
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Your Long-Term Goals</h2>
            {goals && goals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((g) => (
                  <div key={g.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-mono rounded">
                        {g.goalType}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Target: {g.targetDate}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100">{g.title}</h3>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
                No long-term goals set yet. Add a goal to guide your deterministic strategy.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
