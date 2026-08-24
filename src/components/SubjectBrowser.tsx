import React, { useState, useMemo } from 'react';
import {
  FilterState,
  ProgressStatus,
  RevisionStatus,
  UserStudyState,
  UserStudyStateMap,
  VideoResource,
} from '../types';
import {
  GATE_SUBJECTS,
  SUBJECT_CODES,
  DEFAULT_SUBJECT_WEIGHTS,
  SUBJECT_EXTRA_INFO,
} from '../data/defaultSyllabus';
import { TopicCard } from './TopicCard';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Search,
  Check,
  AlertCircle,
} from 'lucide-react';

interface SubjectBrowserProps {
  resources: VideoResource[];
  userStates: UserStudyStateMap;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onUpdateState: (resourceId: string, updates: Partial<UserStudyState>) => void;
  onPlayVideo: (resource: VideoResource) => void;
  onOpenSummary: (resource: VideoResource) => void;
  onOpenQuiz: (resource: VideoResource) => void;
  onAskAi: (resource: VideoResource) => void;
  onOpenChapterMCQ?: (resource: VideoResource) => void;
}

export const SubjectBrowser: React.FC<SubjectBrowserProps> = ({
  resources,
  userStates,
  filters,
  setFilters,
  onUpdateState,
  onPlayVideo,
  onOpenSummary,
  onOpenQuiz,
  onAskAi,
  onOpenChapterMCQ,
}) => {
  // Selected subject state for drill-down view
  const [selectedSubject, setSelectedSubject] = useState<string | null>(
    filters.subject && filters.subject !== 'all' ? filters.subject : null
  );

  // Filter inside the selected subject topics (all | in_progress | needs_revision | done | not_started)
  const [topicStatusFilter, setTopicStatusFilter] = useState<string>('all');
  const [topicSearch, setTopicSearch] = useState<string>('');

  // Group resources by subject
  const subjectResourcesMap = useMemo(() => {
    const map = new Map<string, VideoResource[]>();
    for (const subj of GATE_SUBJECTS) {
      map.set(subj, []);
    }
    for (const r of resources) {
      if (r.subject) {
        if (!map.has(r.subject)) {
          map.set(r.subject, []);
        }
        map.get(r.subject)!.push(r);
      }
    }
    return map;
  }, [resources]);

  // Compute progress statistics for every subject
  const subjectStats = useMemo(() => {
    const stats: Record<
      string,
      {
        total: number;
        done: number;
        inProgress: number;
        notStarted: number;
        needsRevision: number;
        percentage: number;
        weight: number;
        code: string;
      }
    > = {};

    for (const subj of GATE_SUBJECTS) {
      const items = subjectResourcesMap.get(subj) || [];
      const total = items.length;
      let done = 0;
      let inProgress = 0;
      let needsRevision = 0;

      for (const item of items) {
        const st = userStates[item.id];
        if (st?.progress === 'done') {
          done++;
        } else if (st?.progress === 'in_progress') {
          inProgress++;
        }
        if (st?.revision === 'needs_revision') {
          needsRevision++;
        }
      }

      const notStarted = Math.max(0, total - done - inProgress);
      const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
      const weight = DEFAULT_SUBJECT_WEIGHTS[subj] || 8;
      const code = SUBJECT_CODES[subj] || subj.slice(0, 3).toUpperCase();

      stats[subj] = {
        total,
        done,
        inProgress,
        notStarted,
        needsRevision,
        percentage,
        weight,
        code,
      };
    }

    return stats;
  }, [subjectResourcesMap, userStates]);

  // Overall syllabus stats
  const overallStats = useMemo(() => {
    let totalTopics = 0;
    let totalDone = 0;
    let totalInProgress = 0;
    let totalNeedsRevision = 0;

    for (const subj of GATE_SUBJECTS) {
      const st = subjectStats[subj];
      if (st) {
        totalTopics += st.total;
        totalDone += st.done;
        totalInProgress += st.inProgress;
        totalNeedsRevision += st.needsRevision;
      }
    }

    const overallPercentage =
      totalTopics > 0 ? Math.round((totalDone / totalTopics) * 100) : 0;

    return {
      totalTopics,
      totalDone,
      totalInProgress,
      totalNeedsRevision,
      overallPercentage,
    };
  }, [subjectStats]);

  // Topics for currently selected subject
  const currentSubjectTopics = useMemo(() => {
    if (!selectedSubject) return [];
    const items = subjectResourcesMap.get(selectedSubject) || [];

    return items.filter((item) => {
      const state = userStates[item.id] || {
        progress: 'not_started',
        revision: 'solid',
      };

      // Status filter
      if (topicStatusFilter === 'done' && state.progress !== 'done') return false;
      if (topicStatusFilter === 'in_progress' && state.progress !== 'in_progress') return false;
      if (topicStatusFilter === 'not_started' && state.progress !== 'not_started') return false;
      if (topicStatusFilter === 'needs_revision' && state.revision !== 'needs_revision')
        return false;

      // Search filter
      if (topicSearch.trim()) {
        const q = topicSearch.toLowerCase().trim();
        const matchesTopic = item.topic.toLowerCase().includes(q);
        const matchesChannel = (item.channel || '').toLowerCase().includes(q);
        if (!matchesTopic && !matchesChannel) return false;
      }

      return true;
    });
  }, [selectedSubject, subjectResourcesMap, userStates, topicStatusFilter, topicSearch]);

  // Handle clicking a subject card to drill-down
  const handleSelectSubject = (subj: string) => {
    setSelectedSubject(subj);
    setFilters((prev) => ({ ...prev, subject: subj }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle back to all 12 subjects
  const handleBackToAllSubjects = () => {
    setSelectedSubject(null);
    setFilters((prev) => ({ ...prev, subject: 'all' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Batch action: Mark all topics in current subject as done
  const handleMarkAllCurrentDone = () => {
    if (!selectedSubject) return;
    const items = subjectResourcesMap.get(selectedSubject) || [];
    for (const item of items) {
      onUpdateState(item.id, {
        progress: 'done',
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Batch action: Reset all topics in current subject
  const handleResetCurrentSubject = () => {
    if (!selectedSubject) return;
    const items = subjectResourcesMap.get(selectedSubject) || [];
    for (const item of items) {
      onUpdateState(item.id, {
        progress: 'not_started',
        revision: 'solid',
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: All 12 Subjects Overview Grid
  // -------------------------------------------------------------
  if (!selectedSubject) {
    return (
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-xs font-semibold">
                  GATE CSE
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  • 12 Core Subjects
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                GATE CSE Complete Syllabus
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select any subject to explore lecture topics, standard textbooks, notes, and practice tests.
              </p>
            </div>

            {/* Overall Progress Meter */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:min-w-[240px]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-800">Overall Progress</span>
                <span className="font-mono font-bold text-blue-600 text-sm">
                  {overallStats.overallPercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overallStats.overallPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                <span>{overallStats.totalDone} / {overallStats.totalTopics} done</span>
                <span>{overallStats.totalInProgress} in progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* 12 Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GATE_SUBJECTS.map((subjectName, idx) => {
            const stat = subjectStats[subjectName] || {
              total: 0,
              done: 0,
              inProgress: 0,
              notStarted: 0,
              needsRevision: 0,
              percentage: 0,
              weight: 8,
              code: 'SUB',
            };

            const extraInfo = SUBJECT_EXTRA_INFO[subjectName];

            return (
              <div
                key={subjectName}
                id={`subject-card-${stat.code.toLowerCase()}`}
                onClick={() => handleSelectSubject(subjectName)}
                className="group cursor-pointer bg-white border border-slate-200 hover:border-blue-500 hover:shadow-sm rounded-lg p-4 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top line: Code, Weight, Index */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-700 font-mono font-bold text-slate-700 rounded text-xs transition-colors">
                        [{stat.code}]
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        Subject #{idx + 1}
                      </span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-100">
                      {stat.weight} Marks ({stat.weight}%)
                    </span>
                  </div>

                  {/* Subject Name */}
                  <h3 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-1">
                    {subjectName}
                  </h3>

                  {/* Topics Count */}
                  <p className="text-xs text-slate-500 mb-3">
                    {stat.total} Video Resources
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 my-3 bg-slate-50 p-2.5 rounded border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Syllabus Completion</span>
                      <span
                        className={`font-mono font-bold ${
                          stat.percentage === 100
                            ? 'text-emerald-600'
                            : stat.percentage > 0
                            ? 'text-blue-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {stat.percentage}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-2 transition-all duration-300"
                        style={{
                          width: `${stat.total > 0 ? (stat.done / stat.total) * 100 : 0}%`,
                        }}
                        title={`Done: ${stat.done}`}
                      />
                      <div
                        className="bg-blue-400 h-2 transition-all duration-300"
                        style={{
                          width: `${stat.total > 0 ? (stat.inProgress / stat.total) * 100 : 0}%`,
                        }}
                        title={`In Progress: ${stat.inProgress}`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span className="text-emerald-700 font-medium">
                        {stat.done} Done
                      </span>
                      <span className="text-blue-700 font-medium">
                        {stat.inProgress} In Progress
                      </span>
                      <span className="text-slate-500">
                        {stat.notStarted} Remaining
                      </span>
                      {stat.needsRevision > 0 && (
                        <span className="text-rose-600 font-medium">
                          {stat.needsRevision} Rev
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 group-hover:text-blue-600 font-medium">
                  <span className="truncate text-[11px] text-slate-400">
                    {extraInfo ? extraInfo.textbook.split(' by ')[0] : 'Curated Lectures'}
                  </span>
                  <span className="flex items-center space-x-1 shrink-0">
                    <span>Open Subject ({stat.total})</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: Selected Subject Topics View
  // -------------------------------------------------------------
  const curStat = subjectStats[selectedSubject] || {
    total: 0,
    done: 0,
    inProgress: 0,
    notStarted: 0,
    needsRevision: 0,
    percentage: 0,
    weight: 8,
    code: 'SUB',
  };

  const extraInfo = SUBJECT_EXTRA_INFO[selectedSubject];
  const allSubjectItems = subjectResourcesMap.get(selectedSubject) || [];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Subject Switcher Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3">
        <button
          id="btn-back-to-all-subjects"
          onClick={handleBackToAllSubjects}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 px-2.5 py-1.5 rounded transition-colors w-fit border border-slate-200"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>← Back to All 12 Subjects</span>
        </button>

        {/* Quick Subject Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Switch Subject:
          </span>
          <select
            id="select-active-subject"
            value={selectedSubject}
            onChange={(e) => handleSelectSubject(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-slate-400"
          >
            {GATE_SUBJECTS.map((subj) => (
              <option key={subj} value={subj}>
                [{SUBJECT_CODES[subj] || 'SUB'}] {subj}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subject Header Banner with Interactive Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-xs font-bold">
                [{curStat.code}]
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                {curStat.weight} Marks ({curStat.weight}% GATE Weight)
              </span>
              <span className="text-xs text-slate-400">
                • {curStat.total} Topics
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 mt-1.5">
              {selectedSubject}
            </h1>

            {extraInfo && (
              <div className="text-xs text-slate-500 mt-1">
                <span className="font-medium text-slate-700">Standard Textbook:</span>{' '}
                {extraInfo.textbook}
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleMarkAllCurrentDone}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              title="Mark all topics in this subject as Done"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark All Done</span>
            </button>
            <button
              onClick={handleResetCurrentSubject}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              title="Reset progress for this subject"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
            <button
              onClick={() => {
                if (allSubjectItems.length > 0) onAskAi(allSubjectItems[0]);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Subject Mentor</span>
            </button>
          </div>
        </div>

        {/* Prominent Subject Progress Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800 text-sm">
                Subject Syllabus Completion:
              </span>
              <span className="font-mono font-bold text-blue-600 text-base">
                {curStat.percentage}%
              </span>
            </div>
            <div className="text-xs text-slate-600 font-medium">
              {curStat.done} of {curStat.total} Topics Done
            </div>
          </div>

          {/* Progress Bar Graphic */}
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-3 transition-all duration-300"
              style={{
                width: `${curStat.total > 0 ? (curStat.done / curStat.total) * 100 : 0}%`,
              }}
              title={`Done: ${curStat.done}`}
            />
            <div
              className="bg-blue-400 h-3 transition-all duration-300"
              style={{
                width: `${curStat.total > 0 ? (curStat.inProgress / curStat.total) * 100 : 0}%`,
              }}
              title={`In Progress: ${curStat.inProgress}`}
            />
          </div>

          {/* Stats Breakdown Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-100 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{curStat.done} Done</span>
            </span>
            <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 text-xs font-medium border border-blue-100 flex items-center space-x-1">
              <Clock className="w-3 h-3 text-blue-600" />
              <span>{curStat.inProgress} In Progress</span>
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium">
              {curStat.notStarted} Not Started
            </span>
            {curStat.needsRevision > 0 && (
              <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-800 text-xs font-medium border border-rose-100 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 text-rose-600" />
                <span>{curStat.needsRevision} Needs Revision</span>
              </span>
            )}
          </div>
        </div>

        {/* Recommended Chapters & Test Links (GATE Overflow) */}
        {extraInfo && (
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {extraInfo.recommendedChapters && (
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="font-semibold text-slate-800">
                  Recommended Book Chapters:
                </span>
                <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">
                  {extraInfo.recommendedChapters}
                </p>
              </div>
            )}
            {extraInfo.testLinks && extraInfo.testLinks.length > 0 && (
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="font-semibold text-slate-800">
                  GATE Overflow Practice Tests:
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {extraInfo.testLinks.map((t, i) => (
                    <a
                      key={i}
                      href={t.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1 text-[11px]"
                    >
                      <span>{t.name}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Topics Header, Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">
              {selectedSubject} Topics ({currentSubjectTopics.length})
            </h3>
          </div>

          {/* Quick Search within this subject */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              placeholder="Search topics in this subject..."
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
            />
            {topicSearch && (
              <button
                onClick={() => setTopicSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-slate-100">
          <span className="text-slate-400 mr-1 text-[11px]">Filter:</span>
          {[
            { id: 'all', label: `All Topics (${allSubjectItems.length})` },
            { id: 'in_progress', label: `In Progress (${curStat.inProgress})` },
            { id: 'needs_revision', label: `Needs Revision (${curStat.needsRevision})` },
            { id: 'done', label: `Done (${curStat.done})` },
            { id: 'not_started', label: `Not Started (${curStat.notStarted})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setTopicStatusFilter(f.id)}
              className={`px-2.5 py-1 rounded transition-colors text-xs font-medium ${
                topicStatusFilter === f.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topics Grid */}
      {currentSubjectTopics.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-xs text-slate-500">
            No topics match your current search or filter.
          </p>
          <button
            onClick={() => {
              setTopicStatusFilter('all');
              setTopicSearch('');
            }}
            className="mt-2 text-xs text-blue-600 hover:underline font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {currentSubjectTopics.map((res) => {
            const state: UserStudyState = userStates[res.id] || {
              progress: 'not_started',
              revision: 'solid',
              notes: '',
              updatedAt: new Date().toISOString(),
            };

            return (
              <TopicCard
                key={res.id}
                resource={res}
                state={state}
                onUpdateState={onUpdateState}
                onPlayVideo={onPlayVideo}
                onOpenSummary={onOpenSummary}
                onOpenQuiz={onOpenQuiz}
                onAskAi={onAskAi}
                onOpenChapterMCQ={onOpenChapterMCQ}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
