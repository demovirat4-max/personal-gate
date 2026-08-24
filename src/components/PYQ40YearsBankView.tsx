import React, { useState, useMemo } from 'react';
import {
  ChapterCategoryInfo,
  PYQAttemptMap,
  PYQAttemptState,
  PYQuestion,
  UserStudyStateMap,
  VideoResource,
  VolumeNumber,
} from '../types';
import {
  GATE_40_YEARS_PYQS,
  GATE_CHAPTER_CATEGORIES,
  GATE_PYQ_ERAS,
  GATE_VOLUMES,
} from '../data/pyqData';
import { GATE_SUBJECTS } from '../data/defaultSyllabus';
import { filterPYQs, getCompletedChapterRecommendations } from '../utils/pyqMatcher';
import { PYQCard } from './PYQCard';
import {
  Search,
  Filter,
  CheckCircle2,
  Bookmark,
  Sparkles,
  BookOpen,
  History,
  Award,
  ArrowRight,
  RotateCcw,
  Zap,
  TrendingUp,
  GraduationCap,
  Layers,
  FolderTree,
  ListOrdered,
  ChevronRight,
  ExternalLink,
  Tag,
} from 'lucide-react';

interface PYQ40YearsBankViewProps {
  resources: VideoResource[];
  userStates: UserStudyStateMap;
  pyqAttempts: PYQAttemptMap;
  onRecordPYQAttempt: (
    questionId: string,
    selectedAnswer: string,
    isCorrect: boolean,
    timeSpentSeconds?: number
  ) => void;
  onTogglePYQBookmark: (questionId: string) => void;
  onAskAiWithContext?: (question: PYQuestion) => void;
  onNavigateToSyllabus?: () => void;
  onStartChapterMCQ?: (resource: VideoResource, questions?: PYQuestion[]) => void;
}

export const PYQ40YearsBankView: React.FC<PYQ40YearsBankViewProps> = ({
  resources,
  userStates,
  pyqAttempts,
  onRecordPYQAttempt,
  onTogglePYQBookmark,
  onAskAiWithContext,
  onNavigateToSyllabus,
  onStartChapterMCQ,
}) => {
  // View mode: 'category_browser' vs 'questions_list'
  const [viewMode, setViewMode] = useState<'category_browser' | 'questions_list'>('category_browser');

  // Volume and Filter States
  const [selectedVolume, setSelectedVolume] = useState<VolumeNumber | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'unsolved' | 'correct' | 'incorrect' | 'bookmarked'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Auto-recommendations based on completed chapters
  const recommendations = useMemo(() => {
    return getCompletedChapterRecommendations(resources, userStates, pyqAttempts);
  }, [resources, userStates, pyqAttempts]);

  // Categories filtered by volume
  const filteredCategories = useMemo(() => {
    if (selectedVolume === 'all') return GATE_CHAPTER_CATEGORIES;
    return GATE_CHAPTER_CATEGORIES.filter((cat) => cat.volume === selectedVolume);
  }, [selectedVolume]);

  // Subjects filtered by selected volume
  const availableSubjects = useMemo(() => {
    if (selectedVolume === 'all') return GATE_SUBJECTS;
    const vol = GATE_VOLUMES.find((v) => v.volume === selectedVolume);
    return vol ? vol.subjects : GATE_SUBJECTS;
  }, [selectedVolume]);

  // Dynamic topic list based on selected subject and volume
  const availableTopics = useMemo(() => {
    let pool = GATE_40_YEARS_PYQS;
    if (selectedVolume !== 'all') {
      pool = pool.filter((q) => q.volume === selectedVolume);
    }
    if (selectedSubject !== 'all') {
      pool = pool.filter(
        (q) => q.subject.toLowerCase() === selectedSubject.toLowerCase()
      );
    }
    const set = new Set<string>();
    pool.forEach((q) => set.add(q.topic));
    return Array.from(set).sort();
  }, [selectedVolume, selectedSubject]);

  // Filtered PYQs
  const filteredQuestions = useMemo(() => {
    return filterPYQs(GATE_40_YEARS_PYQS, {
      volume: selectedVolume,
      eraId: selectedEra,
      subject: selectedSubject,
      chapter: selectedChapter,
      topic: selectedTopic,
      type: selectedType,
      status: selectedStatus,
      searchQuery,
      attempts: pyqAttempts,
    });
  }, [
    selectedVolume,
    selectedEra,
    selectedSubject,
    selectedChapter,
    selectedTopic,
    selectedType,
    selectedStatus,
    searchQuery,
    pyqAttempts,
  ]);

  // Overall Statistics (Type safe)
  const totalQuestionsInPDFs = 3838;
  const attemptedList = (Object.values(pyqAttempts) as PYQAttemptState[]).filter(
    (a) => a && a.attempted
  );
  const totalSolved = attemptedList.length;
  const totalCorrect = attemptedList.filter((a) => a.isCorrect).length;
  const accuracyPercent =
    totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;
  const totalBookmarked = (Object.values(pyqAttempts) as PYQAttemptState[]).filter(
    (a) => a && a.bookmarked
  ).length;

  const handleSelectChapterFilter = (subject: string, chapterOrTopic: string) => {
    setSelectedSubject(subject);
    setSelectedTopic(chapterOrTopic);
    setSelectedChapter(chapterOrTopic);
    setViewMode('questions_list');
    setSelectedStatus('all');
    setSelectedEra('all');
    setSearchQuery('');
  };

  const handleResetFilters = () => {
    setSelectedVolume('all');
    setSelectedCategory('all');
    setSelectedEra('all');
    setSelectedSubject('all');
    setSelectedChapter('all');
    setSelectedTopic('all');
    setSelectedType('all');
    setSelectedStatus('all');
    setSearchQuery('');
  };

  const handleTrigger10MCQTest = (subject: string, topic: string) => {
    const res = resources.find(
      (r) =>
        r.subject.toLowerCase() === subject.toLowerCase() &&
        r.topic.toLowerCase() === topic.toLowerCase()
    ) || {
      id: `synthetic-${subject}-${topic}`,
      rowIndex: 0,
      subject,
      topic,
      channel: 'GATE 40-Year Archive',
      url: '',
      videoId: null,
      priority: 'High',
      defaultStatus: 'done',
    };

    if (onStartChapterMCQ) {
      onStartChapterMCQ(res);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Volume Navigation & Archive Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <History className="w-3.5 h-3.5" />
                <span>40-Year Archive (1987 – 2026)</span>
              </span>
              <span className="text-xs text-slate-500 font-mono font-semibold">
                {totalQuestionsInPDFs} Questions across 3 Volumes
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              3-Volume GATE CSE Revision Bank (Category & Chapter-Wise)
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Organized systematically across Volume 1 (Mathematics & Aptitude: 1,125 Qs), Volume 2 (Core CS: 1,263 Qs), and Volume 3 (Systems: 1,450 Qs) with instant 10-MCQ chapter completion tests and step-by-step mathematical explanations.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div className="text-base font-bold text-slate-900">
                {totalSolved} / {totalQuestionsInPDFs}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Attempted</div>
            </div>
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 text-center">
              <div className="text-base font-bold text-emerald-700">{totalCorrect}</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Correct</div>
            </div>
            <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-200 text-center">
              <div className="text-base font-bold text-indigo-700">{accuracyPercent}%</div>
              <div className="text-[11px] text-indigo-600 font-medium mt-0.5">Accuracy</div>
            </div>
            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 text-center">
              <div className="text-base font-bold text-amber-700">{totalBookmarked}</div>
              <div className="text-[11px] text-amber-600 font-medium mt-0.5">Bookmarked</div>
            </div>
          </div>
        </div>

        {/* 3 Volume Selector Buttons */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-600 mb-2.5 flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Select Volume Category:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => {
                setSelectedVolume('all');
                setSelectedSubject('all');
                setSelectedCategory('all');
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedVolume === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">All 3 Volumes</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    selectedVolume === 'all' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  3,838 Qs
                </span>
              </div>
              <div
                className={`text-[11px] mt-1 ${
                  selectedVolume === 'all' ? 'text-indigo-100' : 'text-slate-500'
                }`}
              >
                12 Subjects • 50+ Chapters
              </div>
            </button>

            {GATE_VOLUMES.map((vol) => {
              const isSelected = selectedVolume === vol.volume;
              return (
                <button
                  key={vol.volume}
                  onClick={() => {
                    setSelectedVolume(vol.volume);
                    setSelectedSubject('all');
                    setSelectedCategory('all');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{vol.shortName}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {vol.totalQuestions} Qs
                    </span>
                  </div>
                  <div
                    className={`text-[11px] mt-1 line-clamp-1 ${
                      isSelected ? 'text-indigo-100' : 'text-slate-500'
                    }`}
                  >
                    {vol.subjects.join(', ')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* View Mode Toggle: Category Explorer vs Questions List */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('category_browser')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'category_browser'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Category & Chapter-Wise Modules</span>
            </button>

            <button
              onClick={() => setViewMode('questions_list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'questions_list'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>All 40-Year Questions Feed ({filteredQuestions.length})</span>
            </button>
          </div>

          {/* Era Navigation Pills */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center space-x-1">
              <Zap className="w-3 h-3 text-indigo-500" />
              <span>Era:</span>
            </span>
            {GATE_PYQ_ERAS.map((era) => {
              const isSelected = selectedEra === era.id;
              return (
                <button
                  key={era.id}
                  onClick={() => setSelectedEra(era.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {era.label.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Auto-Recommended 10-MCQ Drills for Completed Chapters */}
      <div className="bg-linear-to-r from-indigo-50/80 via-purple-50/50 to-white rounded-2xl border border-indigo-100 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-indigo-950">
                Completed Chapters: 10-Question MCQ Drills Ready
              </h3>
              <p className="text-xs text-indigo-800/80">
                Whenever you complete a chapter in the syllabus, a targeted 10-MCQ drill is generated automatically here!
              </p>
            </div>
          </div>

          {recommendations.length > 0 && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-white text-indigo-700 border border-indigo-200 shadow-2xs self-start sm:self-auto">
              <span>{recommendations.length} Chapters Completed</span>
            </span>
          )}
        </div>

        {recommendations.length === 0 ? (
          <div className="bg-white/90 rounded-xl p-5 border border-indigo-100 text-center space-y-2.5">
            <GraduationCap className="w-7 h-7 text-indigo-400 mx-auto" />
            <div className="text-xs sm:text-sm font-bold text-slate-800">
              No completed chapters yet to generate 10-MCQ drills
            </div>
            <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
              Mark any chapter as "Done" in the Subject Syllabus Browser or Revision Queue. The system will automatically build a 10-question MCQ test for that chapter so you can verify your mastery immediately!
            </p>
            {onNavigateToSyllabus && (
              <button
                onClick={onNavigateToSyllabus}
                className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>Open Syllabus Browser</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.map((rec) => {
              return (
                <div
                  key={rec.resourceId}
                  className="bg-white rounded-xl p-4 border border-indigo-100 hover:border-indigo-300 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        Vol {rec.volume || 1} • {rec.subject}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {rec.solvedCount}/{rec.pyqCount} Solved
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2 leading-snug">
                      {rec.topic}
                    </h4>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleSelectChapterFilter(rec.subject, rec.topic)}
                      className="text-xs text-slate-600 hover:text-indigo-600 font-medium cursor-pointer"
                    >
                      Browse {rec.pyqCount} PYQs
                    </button>

                    <button
                      onClick={() => handleTrigger10MCQTest(rec.subject, rec.topic)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      <Zap className="w-3 h-3 text-amber-300" />
                      <span>Take 10-MCQ Test</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Category & Chapter-Wise Modules View */}
      {viewMode === 'category_browser' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
              <FolderTree className="w-4 h-4 text-indigo-600" />
              <span>Chapter-Wise Revision Modules ({filteredCategories.length} Categories)</span>
            </h3>
            <span className="text-xs text-slate-500">
              Click "10-MCQ Drill" on any chapter to start an instant test
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-200 transition-all space-y-4"
              >
                {/* Category Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Vol {cat.volume}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{cat.subject}</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mt-1">
                      {cat.categoryName}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {cat.description}
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg shrink-0">
                    {cat.totalQuestions} PYQs
                  </span>
                </div>

                {/* Chapter Rows */}
                <div className="space-y-2.5">
                  {cat.chapters.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{ch.title}</span>
                          <span className="text-[10px] font-semibold text-slate-500 font-mono">
                            ({ch.questionCount} Qs)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {ch.keyConcepts.slice(0, 3).map((concept, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                        <button
                          onClick={() => handleSelectChapterFilter(cat.subject, ch.title)}
                          className="px-2.5 py-1 text-xs text-slate-600 hover:text-indigo-600 font-medium cursor-pointer"
                        >
                          View PYQs
                        </button>
                        <button
                          onClick={() => handleTrigger10MCQTest(cat.subject, ch.title)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <Zap className="w-3 h-3 text-amber-300" />
                          <span>10-MCQ Test</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Deep Filter & Questions List Feed */}
      {viewMode === 'questions_list' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-xs">
            {/* Search & Reset */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search PYQs by keyword (e.g. Belady, Dijkstra, Cache, Eigenvalues, Paging)..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                onClick={handleResetFilters}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>

            {/* Dropdowns Filter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
              {/* Subject Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setSelectedTopic('all');
                    setSelectedChapter('all');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">All Subjects ({availableSubjects.length})</option>
                  {availableSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic / Chapter Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Chapter / Topic
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => {
                    setSelectedTopic(e.target.value);
                    setSelectedChapter(e.target.value);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">All Chapters ({availableTopics.length})</option>
                  {availableTopics.map((top) => (
                    <option key={top} value={top}>
                      {top}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Type Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Question Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">All Types (MCQ, MSQ, NAT)</option>
                  <option value="MCQ">Multiple Choice (MCQ)</option>
                  <option value="MSQ">Multiple Select (MSQ)</option>
                  <option value="NAT">Numerical Answer (NAT)</option>
                </select>
              </div>

              {/* Practice Status Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Practice Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">All Questions</option>
                  <option value="unsolved">Unsolved Only</option>
                  <option value="correct">Solved Correctly</option>
                  <option value="incorrect">Incorrect Attempts</option>
                  <option value="bookmarked">Bookmarked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Question List Header */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold text-slate-700">
              Showing {filteredQuestions.length} Questions
              {selectedVolume !== 'all' ? ` in Volume ${selectedVolume}` : ''}
              {selectedSubject !== 'all' ? ` • ${selectedSubject}` : ''}
              {selectedTopic !== 'all' ? ` • ${selectedTopic}` : ''}
            </span>
            {selectedTopic !== 'all' && (
              <button
                onClick={() => handleTrigger10MCQTest(selectedSubject, selectedTopic)}
                className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Launch 10-MCQ Test for {selectedTopic}</span>
              </button>
            )}
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-800">
                No previous year questions match the active filters
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try choosing "All 3 Volumes" or resetting the era, status, or search keywords.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q) => {
                const attempt = pyqAttempts[q.id];
                return (
                  <PYQCard
                    key={q.id}
                    question={q}
                    attempt={attempt}
                    onRecordAttempt={onRecordPYQAttempt}
                    onToggleBookmark={onTogglePYQBookmark}
                    onAskAi={onAskAiWithContext}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
