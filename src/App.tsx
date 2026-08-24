import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveTab,
  FilterState,
  PYQAttemptMap,
  PYQuestion,
  StudyStreakData,
  SubjectWeightConfig,
  UserStudyState,
  UserStudyStateMap,
  VideoResource,
  WeeklyPlan,
} from './types';
import {
  DEFAULT_RESOURCES,
  DEFAULT_SHEET_CSV_URL,
  DEFAULT_SUBJECT_WEIGHTS,
} from './data/defaultSyllabus';
import { mapCSVToResources } from './utils/csvParser';
import {
  loadPYQAttempts,
  loadSavedSheetUrl,
  loadStudyStreak,
  loadSubjectWeights,
  loadUserStudyStates,
  loadWeeklyPlan,
  recordPYQAttempt,
  recordStudyActivity,
  saveCustomSheetUrl,
  saveStudyStreak,
  saveSubjectWeights,
  saveUserStudyStates,
  saveWeeklyPlan,
  togglePYQBookmark,
} from './utils/storage';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { SubjectBrowser } from './components/SubjectBrowser';
import { RevisionQueueView } from './components/RevisionQueueView';
import { WeeklyPlanView } from './components/WeeklyPlanView';
import { NewsView } from './components/NewsView';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { AskAIPanel } from './components/AskAIPanel';
import { KeyPointsModal } from './components/KeyPointsModal';
import { QuizModal } from './components/QuizModal';
import { FeynmanExplainerModal } from './components/FeynmanExplainerModal';
import { FormulaSheetModal } from './components/FormulaSheetModal';
import { SettingsModal } from './components/SettingsModal';
import { ChapterMCQModal } from './components/ChapterMCQModal';
import {
  recordPYQAttemptToBackend,
  syncUserDataToBackend,
  fetchUserDataFromBackend,
} from './utils/apiClient';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    subject: 'all',
    channel: 'all',
    priority: 'all',
    status: 'all',
    searchQuery: '',
  });

  // Resources and Sync State
  const [resources, setResources] = useState<VideoResource[]>(DEFAULT_RESOURCES);
  const [customSheetUrl, setCustomSheetUrl] = useState<string>(() => loadSavedSheetUrl());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(new Date());
  const [syncError, setSyncError] = useState<string | null>(null);

  // User Study States & Subject Weights & Streak & PYQ Attempts (localStorage)
  const [userStates, setUserStates] = useState<UserStudyStateMap>(() => loadUserStudyStates());
  const [subjectWeights, setSubjectWeights] = useState<SubjectWeightConfig>(() => loadSubjectWeights());
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(() => loadWeeklyPlan());
  const [studyStreak, setStudyStreak] = useState<StudyStreakData>(() => loadStudyStreak());
  const [pyqAttempts, setPyqAttempts] = useState<PYQAttemptMap>(() => loadPYQAttempts());

  // Modals & Panels State
  const [activeVideo, setActiveVideo] = useState<VideoResource | null>(null);
  const [activeSummaryResource, setActiveSummaryResource] = useState<VideoResource | null>(null);
  const [activeQuizResource, setActiveQuizResource] = useState<VideoResource | null>(null);
  const [activeFeynmanResource, setActiveFeynmanResource] = useState<VideoResource | null>(null);
  const [activeFormulaResource, setActiveFormulaResource] = useState<VideoResource | null>(null);
  const [activeChapterMCQResource, setActiveChapterMCQResource] = useState<VideoResource | null>(null);
  const [chapterMCQQuestions, setChapterMCQQuestions] = useState<PYQuestion[] | undefined>(undefined);
  const [chapterCompletionToast, setChapterCompletionToast] = useState<{ topic: string; subject: string; resource: VideoResource } | null>(null);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [aiContextResource, setAiContextResource] = useState<VideoResource | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initial load from backend if available
  useEffect(() => {
    fetchUserDataFromBackend().then((backendData) => {
      if (backendData) {
        if (backendData.userStates && Object.keys(backendData.userStates).length > 0) {
          setUserStates((prev) => ({ ...backendData.userStates, ...prev }));
        }
        if (backendData.pyqAttempts && Object.keys(backendData.pyqAttempts).length > 0) {
          setPyqAttempts((prev) => ({ ...backendData.pyqAttempts, ...prev }));
        }
        if (backendData.studyStreak && backendData.studyStreak.currentStreak > 0) {
          setStudyStreak(backendData.studyStreak);
        }
        if (backendData.weeklyPlan) {
          setWeeklyPlan(backendData.weeklyPlan);
        }
      }
    });
  }, []);

  // Record active study action & refresh streak
  const handleRecordActivity = useCallback((activityCount: number = 1, minutesSpent: number = 0) => {
    const updated = recordStudyActivity(activityCount, minutesSpent);
    setStudyStreak(updated);
    syncUserDataToBackend({ studyStreak: updated });
  }, []);

  // PYQ Attempt and Bookmark Handlers
  const handleRecordPYQAttempt = useCallback(
    (questionId: string, selectedAnswer: string, isCorrect: boolean, timeSpentSeconds: number = 0) => {
      const nextMap = recordPYQAttempt(questionId, selectedAnswer, isCorrect, timeSpentSeconds);
      setPyqAttempts(nextMap);
      // Sync attempt directly with backend
      recordPYQAttemptToBackend(questionId, selectedAnswer, isCorrect, timeSpentSeconds);
      // Award study streak activity for practicing PYQs
      handleRecordActivity(1, Math.round(timeSpentSeconds / 60));
    },
    [handleRecordActivity]
  );

  const handleTogglePYQBookmark = useCallback((questionId: string) => {
    const nextMap = togglePYQBookmark(questionId);
    setPyqAttempts(nextMap);
    syncUserDataToBackend({ pyqAttempts: nextMap });
  }, []);

  const handleAskAiPYQ = useCallback((question: PYQuestion) => {
    const syntheticResource: VideoResource = {
      id: question.id,
      rowIndex: 0,
      subject: question.subject,
      topic: `${question.examTag}: ${question.topic}`,
      channel: 'GATE Official Archive',
      url: question.referenceUrl || 'https://gateoverflow.in',
      videoId: null,
      priority: question.marks === 2 ? 'High' : 'Medium',
      defaultStatus: 'in_progress',
      defaultNotes: `Exam: ${question.examTag}\nQuestion: ${question.questionText}\nConcept Tested: ${question.conceptTested}\nExplanation: ${question.explanation}`,
    };
    setAiContextResource(syntheticResource);
    setIsAiPanelOpen(true);
  }, []);

  const handleSaveWeeklyPlan = (plan: WeeklyPlan | null) => {
    setWeeklyPlan(plan);
    saveWeeklyPlan(plan);
    syncUserDataToBackend({ weeklyPlan: plan });
  };

  const handleStartChapterMCQ = useCallback((resource: VideoResource, questions?: PYQuestion[]) => {
    setActiveChapterMCQResource(resource);
    setChapterMCQQuestions(questions);
    setChapterCompletionToast(null);
  }, []);

  // Save states to localStorage whenever modified & record streak activity
  const handleUpdateState = useCallback(
    (resourceId: string, updates: Partial<UserStudyState>) => {
      setUserStates((prev) => {
        const existing = prev[resourceId] || {
          progress: 'not_started',
          revision: 'solid',
          notes: '',
          updatedAt: new Date().toISOString(),
        };
        const nextMap: UserStudyStateMap = {
          ...prev,
          [resourceId]: {
            ...existing,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        };
        saveUserStudyStates(nextMap);
        return nextMap;
      });

      // Record activity towards study streak
      handleRecordActivity(1);
    },
    [handleRecordActivity]
  );

  // Save Subject Weights
  const handleSaveSubjectWeights = (newWeights: SubjectWeightConfig) => {
    setSubjectWeights(newWeights);
    saveSubjectWeights(newWeights);
  };

  // Save Custom Sheet URL
  const handleSaveSheetUrl = (newUrl: string) => {
    setCustomSheetUrl(newUrl);
    saveCustomSheetUrl(newUrl);
    fetchSheetData(newUrl);
  };

  // Fetch sheet CSV data
  const fetchSheetData = useCallback(async (targetUrl?: string) => {
    let urlToFetch = (targetUrl !== undefined ? targetUrl : customSheetUrl) || '';
    urlToFetch = urlToFetch.trim();

    if (!urlToFetch) {
      setResources(DEFAULT_RESOURCES);
      setLastSynced(new Date());
      setSyncError(null);
      return;
    }

    // Auto convert edit / view Google Sheet URLs to export CSV format
    if (urlToFetch.includes('docs.google.com/spreadsheets/d/')) {
      const match = urlToFetch.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        const sheetId = match[1];
        let gid = '0';
        const gidMatch = urlToFetch.match(/gid=([0-9]+)/);
        if (gidMatch && gidMatch[1]) {
          gid = gidMatch[1];
        }
        if (!urlToFetch.includes('/export?format=csv')) {
          urlToFetch = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
        }
      }
    }

    setIsRefreshing(true);
    setSyncError(null);

    try {
      // First attempt: Server proxy to avoid browser CORS quirks
      let csvContent = '';
      try {
        const proxyRes = await fetch('/api/sheet/fetch-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlToFetch }),
        });
        if (proxyRes.ok) {
          csvContent = await proxyRes.text();
        }
      } catch (proxyErr) {
        console.warn('Proxy fetch failed, falling back to direct fetch', proxyErr);
      }

      // Fallback: Direct client-side fetch
      if (!csvContent) {
        const directRes = await fetch(urlToFetch);
        if (!directRes.ok) {
          throw new Error(`HTTP ${directRes.status}: ${directRes.statusText}`);
        }
        csvContent = await directRes.text();
      }

      if (!csvContent || csvContent.trim().length === 0) {
        throw new Error('Received empty CSV from Google Sheet URL.');
      }

      const parsedResources = mapCSVToResources(csvContent);
      if (parsedResources.length === 0) {
        throw new Error('No valid topic rows found in sheet. Please verify column headers.');
      }

      setResources(parsedResources);
      setLastSynced(new Date());
    } catch (err: any) {
      console.error('Failed to sync sheet:', err);
      setSyncError(err.message || 'Sheet unreachable — check publish to web CSV settings.');
      // Keep default or previous resources on failure
    } finally {
      setIsRefreshing(false);
    }
  }, [customSheetUrl]);

  // Initial fetch on mount
  useEffect(() => {
    if (customSheetUrl) {
      fetchSheetData(customSheetUrl);
    }
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveVideo(null);
        setActiveSummaryResource(null);
        setActiveQuizResource(null);
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Playlist Navigation in Video Modal
  const currentVideoIndex = activeVideo
    ? resources.findIndex((r) => r.id === activeVideo.id)
    : -1;
  const hasPrev = currentVideoIndex > 0;
  const hasNext = currentVideoIndex >= 0 && currentVideoIndex < resources.length - 1;

  const handleVideoNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && hasPrev) {
      setActiveVideo(resources[currentVideoIndex - 1]);
    } else if (direction === 'next' && hasNext) {
      setActiveVideo(resources[currentVideoIndex + 1]);
    }
  };

  // Helper actions
  const handleOpenAskAi = (resource?: VideoResource) => {
    if (resource) setAiContextResource(resource);
    setIsAiPanelOpen(true);
  };

  const handleSelectSubject = (subj: string) => {
    setFilters((prev) => ({ ...prev, subject: subj }));
    setActiveTab('subjects');
  };

  const needsRevisionCount = resources.filter(
    (r) => userStates[r.id]?.revision === 'needs_revision'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200 selection:text-slate-900">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filters={filters}
        setFilters={setFilters}
        onRefreshSheet={() => fetchSheetData()}
        isRefreshing={isRefreshing}
        lastSynced={lastSynced}
        sheetSourceType={customSheetUrl ? 'custom_sheet' : 'default_syllabus'}
        totalTopics={resources.length}
        needsRevisionCount={needsRevisionCount}
        studyStreak={studyStreak}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleAiPanel={() => setIsAiPanelOpen(!isAiPanelOpen)}
        isAiPanelOpen={isAiPanelOpen}
      />

      {/* Sync Error Banner if any */}
      {syncError && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3">
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-center justify-between shadow-xs">
            <span>⚠️ <strong>Sheet Sync Error:</strong> {syncError}</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-slate-900 underline hover:text-slate-700 font-semibold ml-2 shrink-0"
            >
              Check Sheet URL
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="pb-16">
        {activeTab === 'dashboard' && (
          <DashboardView
            resources={resources}
            userStates={userStates}
            subjectWeights={subjectWeights}
            streakData={studyStreak}
            onRecordActivity={handleRecordActivity}
            weeklyPlan={weeklyPlan}
            onNavigateToWeeklyPlan={() => setActiveTab('weekly_plan')}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSelectSubject={handleSelectSubject}
            onPlayVideo={(res) => setActiveVideo(res)}
            onUpdateState={handleUpdateState}
            onOpenSummary={(res) => setActiveSummaryResource(res)}
            onOpenQuiz={(res) => setActiveQuizResource(res)}
            onAskAi={handleOpenAskAi}
          />
        )}

        {activeTab === 'subjects' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <SubjectBrowser
              resources={resources}
              userStates={userStates}
              filters={filters}
              setFilters={setFilters}
              onUpdateState={handleUpdateState}
              onPlayVideo={(res) => setActiveVideo(res)}
              onOpenSummary={(res) => setActiveSummaryResource(res)}
              onOpenQuiz={(res) => setActiveQuizResource(res)}
              onAskAi={handleOpenAskAi}
            />
          </div>
        )}

        {activeTab === 'weekly_plan' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <WeeklyPlanView
              resources={resources}
              userStates={userStates}
              subjectWeights={subjectWeights}
              weeklyPlan={weeklyPlan}
              onSaveWeeklyPlan={handleSaveWeeklyPlan}
              onOpenVideo={(res) => setActiveVideo(res)}
              onNavigateToSubjects={() => setActiveTab('subjects')}
            />
          </div>
        )}

        {activeTab === 'revision' && (
          <RevisionQueueView
            resources={resources}
            userStates={userStates}
            pyqAttempts={pyqAttempts}
            onUpdateState={handleUpdateState}
            onPlayVideo={(res) => setActiveVideo(res)}
            onOpenSummary={(res) => setActiveSummaryResource(res)}
            onOpenQuiz={(res) => setActiveQuizResource(res)}
            onAskAi={handleOpenAskAi}
            onRecordPYQAttempt={handleRecordPYQAttempt}
            onTogglePYQBookmark={handleTogglePYQBookmark}
            onAskAiWithContext={handleAskAiPYQ}
            onNavigateToSyllabus={() => setActiveTab('subjects')}
            onStartChapterMCQ={handleStartChapterMCQ}
          />
        )}

        {activeTab === 'news' && (
          <NewsView onNavigateToPlan={() => setActiveTab('weekly_plan')} />
        )}
      </main>

      {/* Embedded Video Player Modal */}
      {activeVideo && (
        <VideoPlayerModal
          resource={activeVideo}
          state={userStates[activeVideo.id] || null}
          onClose={() => setActiveVideo(null)}
          onUpdateState={handleUpdateState}
          onNavigate={handleVideoNavigate}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onOpenSummary={(res) => setActiveSummaryResource(res)}
          onOpenQuiz={(res) => setActiveQuizResource(res)}
          onOpenFeynman={(res) => setActiveFeynmanResource(res)}
          onOpenFormulaSheet={(res) => setActiveFormulaResource(res)}
          onAskAi={handleOpenAskAi}
        />
      )}

      {/* Key Points & Summary Modal */}
      {activeSummaryResource && (
        <KeyPointsModal
          resource={activeSummaryResource}
          onClose={() => setActiveSummaryResource(null)}
        />
      )}

      {/* Quick Quiz Modal */}
      {activeQuizResource && (
        <QuizModal
          resource={activeQuizResource}
          onClose={() => setActiveQuizResource(null)}
        />
      )}

      {/* Feynman 3-Tier Concept Explainer Modal */}
      {activeFeynmanResource && (
        <FeynmanExplainerModal
          resource={activeFeynmanResource}
          onClose={() => setActiveFeynmanResource(null)}
          onOpenQuiz={(res) => setActiveQuizResource(res)}
        />
      )}

      {/* Formula & Complexity Matrix Cheat Sheet Modal */}
      {activeFormulaResource && (
        <FormulaSheetModal
          resource={activeFormulaResource}
          onClose={() => setActiveFormulaResource(null)}
        />
      )}

      {/* Persistent / Slide-over Ask AI Panel */}
      {isAiPanelOpen && (
        <AskAIPanel
          isOpen={isAiPanelOpen}
          onClose={() => setIsAiPanelOpen(false)}
          activeResource={aiContextResource || activeVideo}
        />
      )}

      {/* Chapter Completion Celebration & 10-MCQ Prompt Toast */}
      {chapterCompletionToast && (
        <div className="fixed bottom-6 right-6 z-40 max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-indigo-500/40 flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 shrink-0">
            <span className="text-base">🎉</span>
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="text-xs font-bold text-indigo-300">Chapter Completed!</div>
            <div className="text-xs text-slate-200 font-semibold truncate">
              {chapterCompletionToast.topic}
            </div>
            <p className="text-[11px] text-slate-400">
              Ready to verify your mastery with a 10-MCQ test?
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => {
                  const targetRes = chapterCompletionToast.resource;
                  setChapterCompletionToast(null);
                  handleStartChapterMCQ(targetRes);
                }}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Start 10 MCQs
              </button>
              <button
                onClick={() => setChapterCompletionToast(null)}
                className="px-2.5 py-1 text-slate-400 hover:text-white text-xs font-medium cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10-Question Chapter MCQ Mastery Drill Modal */}
      {activeChapterMCQResource && (
        <ChapterMCQModal
          resource={activeChapterMCQResource}
          initialQuestions={chapterMCQQuestions}
          onClose={() => {
            setActiveChapterMCQResource(null);
            setChapterMCQQuestions(undefined);
          }}
          onRecordAttempt={handleRecordPYQAttempt}
        />
      )}

      {/* Settings & Subject Weights Config Modal */}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          customSheetUrl={customSheetUrl}
          onSaveSheetUrl={handleSaveSheetUrl}
          subjectWeights={subjectWeights}
          onSaveSubjectWeights={handleSaveSubjectWeights}
          userStates={userStates}
          studyStreak={studyStreak}
          onImportStates={(imported) => {
            setUserStates(imported);
            saveUserStudyStates(imported);
          }}
          onImportStreak={(importedStreak) => {
            setStudyStreak(importedStreak);
            saveStudyStreak(importedStreak);
          }}
          onResetStates={() => {
            setUserStates({});
            saveUserStudyStates({});
            const emptyStreak = {
              currentStreak: 0,
              longestStreak: 0,
              lastActiveDate: '',
              activeDates: [],
              history: {},
            };
            setStudyStreak(emptyStreak);
            saveStudyStreak(emptyStreak);
          }}
        />
      )}
    </div>
  );
}
