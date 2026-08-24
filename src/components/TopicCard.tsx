import React, { useState, useEffect, useRef } from 'react';
import {
  PriorityLevel,
  ProgressStatus,
  RevisionStatus,
  UserStudyState,
  VideoResource,
} from '../types';
import { SUBJECT_CODES } from '../data/defaultSyllabus';
import { formatDuration } from '../utils/storage';
import {
  Play,
  ExternalLink,
} from 'lucide-react';

interface TopicCardProps {
  resource: VideoResource;
  state: UserStudyState;
  onUpdateState: (resourceId: string, updates: Partial<UserStudyState>) => void;
  onPlayVideo: (resource: VideoResource) => void;
  onOpenSummary: (resource: VideoResource) => void;
  onOpenQuiz: (resource: VideoResource) => void;
  onAskAi: (resource: VideoResource) => void;
  onOpenChapterMCQ?: (resource: VideoResource) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  resource,
  state,
  onUpdateState,
  onPlayVideo,
  onOpenSummary,
  onOpenQuiz,
  onAskAi,
  onOpenChapterMCQ,
}) => {
  const [localNotes, setLocalNotes] = useState(state.notes || '');
  const isInitialMount = useRef(true);

  // Synchronize local notes when state changes externally
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setLocalNotes(state.notes || '');
  }, [state.notes]);

  // Debounced auto-save notes to avoid lag
  const handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalNotes(val);
    onUpdateState(resource.id, { notes: val, updatedAt: new Date().toISOString() });
  };

  // 1-Click Fast Progress Cycle: Not Started -> In Progress -> Done -> Not Started
  const handleCycleProgress = (e: React.MouseEvent) => {
    e.stopPropagation();
    let nextStatus: ProgressStatus = 'in_progress';
    if (state.progress === 'not_started') {
      nextStatus = 'in_progress';
    } else if (state.progress === 'in_progress') {
      nextStatus = 'done';
    } else {
      nextStatus = 'not_started';
    }

    onUpdateState(resource.id, {
      progress: nextStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  // 1-Click Fast Revision Toggle: Solid <-> Needs Revision
  const handleToggleRevision = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextRevision: RevisionStatus =
      state.revision === 'needs_revision' ? 'solid' : 'needs_revision';
    onUpdateState(resource.id, {
      revision: nextRevision,
      updatedAt: new Date().toISOString(),
    });
  };

  const subjectCode = SUBJECT_CODES[resource.subject] || resource.subject.slice(0, 3).toUpperCase();

  return (
    <div
      id={`card-${resource.id}`}
      className="group rounded-lg border border-slate-200 bg-white p-3.5 flex flex-col justify-between gap-3 hover:border-slate-300 transition-colors"
    >
      {/* Top Metadata Line */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="font-mono text-slate-600">[{subjectCode}]</span>
          <span>•</span>
          <span className="truncate">{resource.channel || resource.subject}</span>
          <span>•</span>
          <span>{resource.priority} priority</span>
          {state.timeSpentSeconds && state.timeSpentSeconds > 0 ? (
            <>
              <span>•</span>
              <span className="text-slate-600 font-mono">{formatDuration(state.timeSpentSeconds)}</span>
            </>
          ) : null}
        </div>

        {resource.url && (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open on YouTube"
            className="text-slate-400 hover:text-slate-700 transition-colors ml-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Main Title with Play Button */}
      <div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPlayVideo(resource);
          }}
          className="text-left w-full group/title focus:outline-none cursor-pointer flex items-start justify-between gap-2"
        >
          <h3 className="text-xs font-semibold text-slate-900 group-hover/title:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {resource.topic}
          </h3>
          <div className="shrink-0 p-1.5 rounded-full bg-blue-50 group-hover/title:bg-blue-600 text-blue-600 group-hover/title:text-white transition-colors mt-0.5 shadow-2xs">
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </div>
        </button>
      </div>

      {/* Status Controls */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <button
          id={`btn-progress-${resource.id}`}
          onClick={handleCycleProgress}
          className={`px-2.5 py-1 rounded text-xs transition-colors font-medium cursor-pointer ${
            state.progress === 'done'
              ? 'bg-slate-900 text-white'
              : state.progress === 'in_progress'
              ? 'bg-slate-100 text-slate-900'
              : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          {state.progress === 'done'
            ? 'Done ✓'
            : state.progress === 'in_progress'
            ? 'In progress'
            : 'Not started'}
        </button>

        <div className="flex items-center space-x-1.5">
          {onOpenChapterMCQ && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenChapterMCQ(resource);
              }}
              title="Take 10-Question Chapter MCQ Drill"
              className="px-2 py-1 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
            >
              10-MCQ Drill
            </button>
          )}

          <button
            id={`btn-revision-${resource.id}`}
            onClick={handleToggleRevision}
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              state.revision === 'needs_revision'
                ? 'bg-slate-100 text-slate-900 font-medium'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {state.revision === 'needs_revision' ? 'Needs revision' : 'Mark revision'}
          </button>
        </div>
      </div>

      {/* Inline Notes */}
      <div>
        <input
          id={`notes-input-${resource.id}`}
          type="text"
          value={localNotes}
          onChange={handleNotesChange}
          placeholder="Add quick notes or formula..."
          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-colors"
        />
      </div>

      {/* Quiet AI Helpers */}
      <div className="flex items-center justify-between text-[11px] pt-1.5 text-slate-400 border-t border-slate-100">
        <span>Row {resource.rowIndex}</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenSummary(resource)}
            className="hover:text-slate-800 transition-colors cursor-pointer"
          >
            Summary
          </button>
          <span>•</span>
          <button
            onClick={() => onOpenQuiz(resource)}
            className="hover:text-slate-800 transition-colors cursor-pointer"
          >
            Quiz
          </button>
          <span>•</span>
          <button
            onClick={() => onAskAi(resource)}
            className="hover:text-slate-800 transition-colors cursor-pointer"
          >
            Ask AI
          </button>
        </div>
      </div>
    </div>
  );
};
