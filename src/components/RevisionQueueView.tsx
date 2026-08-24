import React, { useState } from 'react';
import {
  PYQAttemptMap,
  PYQuestion,
  UserStudyState,
  UserStudyStateMap,
  VideoResource,
} from '../types';
import { TopicCard } from './TopicCard';
import { PYQ40YearsBankView } from './PYQ40YearsBankView';
import {
  BookOpen,
  History,
  CheckCircle2,
  Bookmark,
  Sparkles,
  ListOrdered,
  Layers,
} from 'lucide-react';

interface RevisionQueueViewProps {
  resources: VideoResource[];
  userStates: UserStudyStateMap;
  pyqAttempts: PYQAttemptMap;
  onUpdateState: (resourceId: string, updates: Partial<UserStudyState>) => void;
  onPlayVideo: (resource: VideoResource) => void;
  onOpenSummary: (resource: VideoResource) => void;
  onOpenQuiz: (resource: VideoResource) => void;
  onAskAi: (resource: VideoResource) => void;
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

export const RevisionQueueView: React.FC<RevisionQueueViewProps> = ({
  resources,
  userStates,
  pyqAttempts,
  onUpdateState,
  onPlayVideo,
  onOpenSummary,
  onOpenQuiz,
  onAskAi,
  onRecordPYQAttempt,
  onTogglePYQBookmark,
  onAskAiWithContext,
  onNavigateToSyllabus,
  onStartChapterMCQ,
}) => {
  // Mode: 'pyq_bank' (40-year PYQ & Auto-recommendations) vs 'flagged_topics' (Flagged revision queue)
  const [activeSubTab, setActiveSubTab] = useState<'pyq_bank' | 'flagged_topics'>('pyq_bank');

  // Pull all resources where revision === 'needs_revision'
  const revisionItems = resources.filter((res) => {
    const state = userStates[res.id];
    return state && state.revision === 'needs_revision';
  });

  const handleMarkAllSolid = () => {
    for (const item of revisionItems) {
      onUpdateState(item.id, {
        revision: 'solid',
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-900">
      {/* Top Mode Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto p-1">
          <button
            onClick={() => setActiveSubTab('pyq_bank')}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'pyq_bank'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>40-Year PYQ Bank & Auto-Drills</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeSubTab === 'pyq_bank'
                  ? 'bg-indigo-700/80 text-white'
                  : 'bg-indigo-50 text-indigo-700'
              }`}
            >
              1987 – 2026
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('flagged_topics')}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'flagged_topics'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Flagged Topics Queue</span>
            {revisionItems.length > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeSubTab === 'flagged_topics'
                    ? 'bg-indigo-700/80 text-white'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {revisionItems.length}
              </span>
            )}
          </button>
        </div>

        {activeSubTab === 'flagged_topics' && revisionItems.length > 0 && (
          <button
            onClick={handleMarkAllSolid}
            className="px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shrink-0 font-medium cursor-pointer self-end sm:self-auto mr-1"
          >
            Mark all as solid
          </button>
        )}
      </div>

      {/* SubTab 1: 40-Year PYQ Bank & Auto Recommendations */}
      {activeSubTab === 'pyq_bank' && (
        <PYQ40YearsBankView
          resources={resources}
          userStates={userStates}
          pyqAttempts={pyqAttempts}
          onRecordPYQAttempt={onRecordPYQAttempt}
          onTogglePYQBookmark={onTogglePYQBookmark}
          onAskAiWithContext={onAskAiWithContext}
          onNavigateToSyllabus={onNavigateToSyllabus}
          onStartChapterMCQ={onStartChapterMCQ}
        />
      )}

      {/* SubTab 2: Flagged Topics Queue */}
      {activeSubTab === 'flagged_topics' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-semibold text-slate-900">
                  Flagged Revision Topics
                </h2>
                <span className="text-xs text-slate-400">
                  ({revisionItems.length} topics currently flagged)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Topics manually flagged for concept recall, formula review, or video re-watching.
              </p>
            </div>
          </div>

          {revisionItems.length === 0 ? (
            <div className="text-center py-16 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-xs font-medium text-slate-800">
                No topics in flagged revision queue
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You have no topics marked for revision. Toggle "Mark revision" on any topic in the syllabus browser when you want to revisit it.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {revisionItems.map((resource) => {
                const state = userStates[resource.id] || {
                  progress: resource.defaultStatus || 'not_started',
                  revision: 'needs_revision',
                  notes: resource.defaultNotes || '',
                  updatedAt: new Date().toISOString(),
                };

                return (
                  <TopicCard
                    key={resource.id}
                    resource={resource}
                    state={state}
                    onUpdateState={onUpdateState}
                    onPlayVideo={onPlayVideo}
                    onOpenSummary={onOpenSummary}
                    onOpenQuiz={onOpenQuiz}
                    onAskAi={onAskAi}
                    onOpenChapterMCQ={onStartChapterMCQ}
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
