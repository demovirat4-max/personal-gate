import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ProgressStatus,
  RevisionStatus,
  UserStudyState,
  VideoResource,
} from '../types';
import { SUBJECT_CODES, SUBJECT_EXTRA_INFO } from '../data/defaultSyllabus';
import { formatDuration, formatStopwatchTime } from '../utils/storage';
import { extractYouTubeVideoId, extractYouTubePlaylistId, getYouTubeEmbedUrl } from '../utils/csvParser';
import {
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Brain,
  Sigma,
  FileText,
  HelpCircle,
  Bot,
} from 'lucide-react';

interface VideoPlayerModalProps {
  resource: VideoResource;
  state: UserStudyState | null;
  onClose: () => void;
  onUpdateState: (resourceId: string, updates: Partial<UserStudyState>) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  hasPrev: boolean;
  hasNext: boolean;
  onOpenSummary: (resource: VideoResource) => void;
  onOpenQuiz: (resource: VideoResource) => void;
  onOpenFeynman: (resource: VideoResource) => void;
  onOpenFormulaSheet: (resource: VideoResource) => void;
  onAskAi: (resource: VideoResource) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  resource,
  state,
  onClose,
  onUpdateState,
  onNavigate,
  hasPrev,
  hasNext,
  onOpenSummary,
  onOpenQuiz,
  onOpenFeynman,
  onOpenFormulaSheet,
  onAskAi,
}) => {
  const [notes, setNotes] = useState(state?.notes || '');
  
  // Timer State
  const [isRunning, setIsRunning] = useState(true);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(state?.timeSpentSeconds || 0);

  const totalSecondsRef = useRef(totalSeconds);
  const resourceIdRef = useRef(resource.id);
  const onUpdateStateRef = useRef(onUpdateState);

  totalSecondsRef.current = totalSeconds;
  resourceIdRef.current = resource.id;
  onUpdateStateRef.current = onUpdateState;

  // Flush timer duration to persistent state
  const flushTimerSave = useCallback((overrideTotal?: number) => {
    const currentTotal = overrideTotal !== undefined ? overrideTotal : totalSecondsRef.current;
    if (resourceIdRef.current) {
      onUpdateStateRef.current(resourceIdRef.current, {
        timeSpentSeconds: currentTotal,
        updatedAt: new Date().toISOString(),
      });
    }
  }, []);

  // Synchronize when switching to a different video resource
  useEffect(() => {
    setNotes(state?.notes || '');
    const initialTime = state?.timeSpentSeconds || 0;
    setTotalSeconds(initialTime);
    totalSecondsRef.current = initialTime;
    setSessionSeconds(0);
    setIsRunning(true);
  }, [resource.id]);

  // Interval timer tick (every 1 second when active)
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSessionSeconds((s) => s + 1);
      setTotalSeconds((t) => {
        const nextTotal = t + 1;
        totalSecondsRef.current = nextTotal;
        return nextTotal;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Periodic autosave every 10 seconds while running
  useEffect(() => {
    if (!isRunning) return;
    const saveInterval = setInterval(() => {
      flushTimerSave();
    }, 10000);
    return () => clearInterval(saveInterval);
  }, [isRunning, flushTimerSave]);

  // Cleanup on unmount / close
  useEffect(() => {
    return () => {
      flushTimerSave();
    };
  }, [flushTimerSave]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    onUpdateState(resource.id, { notes: val, updatedAt: new Date().toISOString() });
  };

  const handleToggleTimer = () => {
    if (isRunning) {
      flushTimerSave();
      setIsRunning(false);
    } else {
      setIsRunning(true);
    }
  };

  const handleResetSession = () => {
    setSessionSeconds(0);
  };

  const handleQuickAdd = (minutes: number) => {
    const addedSecs = minutes * 60;
    const nextSession = sessionSeconds + addedSecs;
    const nextTotal = totalSeconds + addedSecs;
    setSessionSeconds(nextSession);
    setTotalSeconds(nextTotal);
    totalSecondsRef.current = nextTotal;
    flushTimerSave(nextTotal);
  };

  const handleResetTotalTime = () => {
    setSessionSeconds(0);
    setTotalSeconds(0);
    totalSecondsRef.current = 0;
    flushTimerSave(0);
  };

  const handleSafeNavigate = (direction: 'prev' | 'next') => {
    flushTimerSave();
    onNavigate(direction);
  };

  const handleSafeClose = () => {
    flushTimerSave();
    onClose();
  };

  const subjectCode = SUBJECT_CODES[resource.subject] || resource.subject.slice(0, 3).toUpperCase();
  const currentProgress = state?.progress || resource.defaultStatus || 'not_started';
  const currentRevision = state?.revision || 'solid';

  // Determine effective YouTube embed URL
  const [useNoCookie, setUseNoCookie] = useState(false);
  const isPlaylist = Boolean(resource.playlistId || extractYouTubePlaylistId(resource.url || ''));
  
  const embedUrl = useMemo(() => {
    const base = getYouTubeEmbedUrl(resource.url, resource.videoId, resource.playlistId);
    if (!base) return null;
    return useNoCookie
      ? base.replace('www.youtube.com', 'www.youtube-nocookie.com')
      : base.replace('www.youtube-nocookie.com', 'www.youtube.com');
  }, [resource.url, resource.videoId, resource.playlistId, useNoCookie]);

  return (
    <div
      id="video-player-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
      onClick={handleSafeClose}
    >
      <div
        id="video-player-modal"
        className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 text-slate-900">
          <div className="flex items-center space-x-2 min-w-0 pr-2">
            <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg font-bold shrink-0 border border-indigo-100">
              [{subjectCode}]
            </span>
            <h2 className="text-sm font-bold truncate text-slate-900">
              {resource.topic}
            </h2>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Prev / Next video in playlist */}
            <div className="flex items-center space-x-1 mr-2 border-r border-slate-100 pr-2">
              <button
                onClick={() => handleSafeNavigate('prev')}
                disabled={!hasPrev}
                title="Previous lecture"
                className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSafeNavigate('next')}
                disabled={!hasNext}
                title="Next lecture"
                className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                title="Watch directly on YouTube"
                className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={handleSafeClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Content: Video Player on Left / Notes, Timer & Actions on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-y-auto">
          {/* YouTube Embed Container */}
          <div className="lg:col-span-2 bg-slate-950 flex flex-col justify-between">
            {embedUrl ? (
              <>
                <div className="relative pb-[56.25%] h-0 w-full bg-slate-950">
                  <iframe
                    key={`${resource.id}-${useNoCookie}`}
                    src={embedUrl}
                    title={resource.topic}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full border-0"
                  />
                </div>
                <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-300">
                  <span className="truncate pr-2 flex items-center space-x-2">
                    {isPlaylist && (
                      <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px] font-semibold uppercase">
                        Playlist
                      </span>
                    )}
                    <span className="truncate">
                      {resource.topic} ({resource.channel || 'GATE CSE'})
                    </span>
                  </span>
                  
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setUseNoCookie(!useNoCookie)}
                      title="Switch embed player server if playback is blocked"
                      className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                    >
                      {useNoCookie ? 'Use Standard Server' : 'Switch Player Server'}
                    </button>
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
                      >
                        <span>Open App</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs space-y-3 m-auto">
                <p>Embedded video format unavailable for this URL:</p>
                <code className="text-xs text-slate-300 break-all bg-slate-900 p-2 rounded block font-mono">
                  {resource.url || 'No URL specified'}
                </code>
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                  >
                    <span>Watch Directly on YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Side Drawer: Timer, Status controls, Personal Notes & AI Helpers */}
          <div className="p-4 bg-white flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 gap-4 overflow-y-auto">
            <div className="space-y-4">
              
              {/* --- Video Study Timer Interface --- */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900">
                    Study timer
                  </span>
                  
                  <span className="text-[11px] text-slate-500">
                    {isRunning ? 'Tracking' : 'Paused'}
                  </span>
                </div>

                {/* Clock Display */}
                <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[11px] text-slate-500 block">
                      Session
                    </span>
                    <span className="text-base font-semibold font-mono text-slate-900">
                      {formatStopwatchTime(sessionSeconds)}
                    </span>
                  </div>
                  <div className="border-l border-slate-100 pl-2">
                    <span className="text-[11px] text-slate-500 block">
                      Total
                    </span>
                    <span className="text-base font-semibold font-mono text-slate-900">
                      {formatDuration(totalSeconds)}
                    </span>
                  </div>
                </div>

                {/* Timer Controls */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={handleToggleTimer}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded text-xs transition-colors cursor-pointer bg-slate-900 hover:bg-slate-800 text-white font-medium"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-white" />
                        <span>Pause timer</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-white" />
                        <span>Resume timer</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleResetSession}
                    title="Reset current session clock"
                    className="flex items-center space-x-1 py-1.5 px-2.5 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Quick Add Minutes Bar */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                  <span className="text-slate-400 text-[11px]">Quick log:</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleQuickAdd(5)}
                      className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] cursor-pointer"
                    >
                      +5m
                    </button>
                    <button
                      onClick={() => handleQuickAdd(15)}
                      className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] cursor-pointer"
                    >
                      +15m
                    </button>
                    <button
                      onClick={() => handleQuickAdd(30)}
                      className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] cursor-pointer"
                    >
                      +30m
                    </button>
                    <button
                      onClick={handleResetTotalTime}
                      title="Clear total time for this video"
                      className="text-[11px] text-slate-400 hover:text-slate-700 ml-1 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Status Toggles */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-medium">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() =>
                      onUpdateState(resource.id, {
                        progress: 'not_started',
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    className={`py-1.5 px-2 rounded text-xs border transition-colors cursor-pointer ${
                      currentProgress === 'not_started'
                        ? 'bg-slate-900 text-white border-slate-900 font-medium'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Not started
                  </button>

                  <button
                    onClick={() =>
                      onUpdateState(resource.id, {
                        progress: 'in_progress',
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    className={`py-1.5 px-2 rounded text-xs border transition-colors cursor-pointer ${
                      currentProgress === 'in_progress'
                        ? 'bg-slate-900 text-white border-slate-900 font-medium'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    In progress
                  </button>

                  <button
                    onClick={() =>
                      onUpdateState(resource.id, {
                        progress: 'done',
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    className={`py-1.5 px-2 rounded text-xs border transition-colors cursor-pointer ${
                      currentProgress === 'done'
                        ? 'bg-slate-900 text-white border-slate-900 font-medium'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Done
                  </button>
                </div>
              </div>

              {/* Revision Flag Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <div className="font-medium text-slate-900">
                    Revision mark
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Flag for practice and mock drills
                  </div>
                </div>

                <button
                  onClick={() =>
                    onUpdateState(resource.id, {
                      revision: currentRevision === 'needs_revision' ? 'solid' : 'needs_revision',
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    currentRevision === 'needs_revision'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {currentRevision === 'needs_revision' ? 'Needs revision' : 'Solid'}
                </button>
              </div>

              {/* Personal Takeaway Notes */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-slate-500 font-medium">
                    Notes
                  </label>
                  <span className="text-[11px] text-slate-400">Auto-saved</span>
                </div>
                <textarea
                  id="modal-notes-area"
                  rows={3}
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Formulas, complexities, or key traps to remember..."
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 resize-none"
                />
              </div>

              {/* Subject Standard Reference & Tests */}
              {SUBJECT_EXTRA_INFO[resource.subject] && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400">Textbook: </span>
                    <span className="font-medium text-slate-800">{SUBJECT_EXTRA_INFO[resource.subject].textbook}</span>
                  </div>
                  {SUBJECT_EXTRA_INFO[resource.subject].recommendedChapters && (
                    <div className="text-[11px] text-slate-500">
                      {SUBJECT_EXTRA_INFO[resource.subject].recommendedChapters}
                    </div>
                  )}
                  {SUBJECT_EXTRA_INFO[resource.subject].testLinks.length > 0 && (
                    <div className="pt-1 border-t border-slate-200/60 flex flex-wrap gap-1">
                      {SUBJECT_EXTRA_INFO[resource.subject].testLinks.slice(0, 3).map((test, idx) => (
                        <a
                          key={idx}
                          href={test.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 transition-colors"
                        >
                          <span>{test.name}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Action Helpers */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-700 font-semibold flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-slate-800" />
                  <span>AI study assistance</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Gemini 3.7</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                <button
                  onClick={() => onOpenSummary(resource)}
                  className="p-2 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs transition-colors cursor-pointer font-medium flex flex-col items-center justify-center text-center space-y-1"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span className="truncate w-full">Key points</span>
                </button>

                <button
                  onClick={() => onOpenQuiz(resource)}
                  className="p-2 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs transition-colors cursor-pointer font-medium flex flex-col items-center justify-center text-center space-y-1"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
                  <span className="truncate w-full">Practice quiz</span>
                </button>

                <button
                  onClick={() => onOpenFeynman(resource)}
                  className="p-2 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs transition-colors cursor-pointer font-medium flex flex-col items-center justify-center text-center space-y-1"
                >
                  <Brain className="w-3.5 h-3.5 text-slate-600" />
                  <span className="truncate w-full">Simplifier</span>
                </button>

                <button
                  onClick={() => onOpenFormulaSheet(resource)}
                  className="p-2 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs transition-colors cursor-pointer font-medium flex flex-col items-center justify-center text-center space-y-1"
                >
                  <Sigma className="w-3.5 h-3.5 text-slate-600" />
                  <span className="truncate w-full">Formulas</span>
                </button>

                <button
                  onClick={() => onAskAi(resource)}
                  className="p-2 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs transition-colors cursor-pointer font-medium flex flex-col items-center justify-center text-center space-y-1 col-span-2 sm:col-span-1"
                >
                  <Bot className="w-3.5 h-3.5 text-white" />
                  <span className="truncate w-full">Ask mentor</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
