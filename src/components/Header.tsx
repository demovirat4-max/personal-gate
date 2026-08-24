import React, { useState, useRef, useEffect } from 'react';
import {
  ActiveTab,
  FilterState,
  StudyStreakData,
} from '../types';
import { getEffectiveStreakInfo } from '../utils/storage';
import {
  Search,
  Settings,
  Bot,
  RefreshCw,
  Sliders,
  Play,
  Flame,
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onRefreshSheet: () => void;
  isRefreshing: boolean;
  lastSynced: Date | null;
  sheetSourceType: 'custom_sheet' | 'default_syllabus';
  totalTopics: number;
  needsRevisionCount: number;
  studyStreak?: StudyStreakData;
  onOpenSettings: () => void;
  onToggleAiPanel: () => void;
  isAiPanelOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  filters,
  setFilters,
  onRefreshSheet,
  isRefreshing,
  lastSynced,
  sheetSourceType,
  totalTopics,
  needsRevisionCount,
  studyStreak,
  onOpenSettings,
  onToggleAiPanel,
  isAiPanelOpen,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const streakInfo = studyStreak ? getEffectiveStreakInfo(studyStreak) : null;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 text-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand & Context */}
          <div className="flex items-center space-x-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-900 text-sm tracking-tight">
                  GATE CSE Prep
                </span>
                <span className="text-xs text-slate-400 font-normal">
                  • {totalTopics} topics
                </span>
              </div>
            </div>

            {/* Primary Navigation - Clean, sentence case */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                id="tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Coverage
              </button>

              <button
                id="tab-subjects"
                onClick={() => setActiveTab('subjects')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  activeTab === 'subjects'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Syllabus
              </button>

              <button
                id="tab-weekly-plan"
                onClick={() => setActiveTab('weekly_plan')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  activeTab === 'weekly_plan'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Weekly Plan
              </button>

              <button
                id="tab-revision"
                onClick={() => setActiveTab('revision')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'revision'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>Revision</span>
                {needsRevisionCount > 0 && (
                  <span className="text-[11px] text-slate-500 font-normal">
                    ({needsRevisionCount})
                  </span>
                )}
              </button>

              <button
                id="tab-news"
                onClick={() => setActiveTab('news')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  activeTab === 'news'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                GATE news
              </button>
            </nav>
          </div>

          {/* Right Utilities: Streak Badge, Search, Ask AI, Settings Menu */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Streak Badge */}
            {streakInfo && (
              <button
                id="btn-header-streak"
                onClick={() => setActiveTab('dashboard')}
                title={`Study Streak: ${streakInfo.effectiveStreak} days (Best: ${streakInfo.longestStreak}d)`}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer border ${
                  streakInfo.isActiveToday
                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Flame
                  className={`w-3.5 h-3.5 ${
                    streakInfo.isActiveToday ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                  }`}
                />
                <span>{streakInfo.effectiveStreak}d</span>
              </button>
            )}

            {/* Quick Search */}
            <div className="relative w-32 sm:w-44 md:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                id="header-search-input"
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Search topics..."
                className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400 transition-colors"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ×
                </button>
              )}
            </div>

            {/* Ask AI Button */}
            <button
              id="btn-header-ask-ai"
              onClick={onToggleAiPanel}
              className={`flex items-center space-x-1.5 px-3 py-1 text-xs rounded transition-colors font-medium ${
                isAiPanelOpen
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Single Settings/Menu Icon Button */}
            <div className="relative" ref={menuRef}>
              <button
                id="btn-header-menu"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                title="Settings & Sheet Sync"
                className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-md border border-slate-200 shadow-md py-1 z-50 text-xs text-slate-700">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onRefreshSheet();
                    }}
                    disabled={isRefreshing}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between disabled:opacity-50"
                  >
                    <span>{isRefreshing ? 'Syncing...' : 'Sync sheet'}</span>
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Weights & config</span>
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <div className="px-3 py-1.5 text-[11px] text-slate-400">
                    Source: {sheetSourceType === 'custom_sheet' ? 'Google Sheet' : 'Built-in syllabus'}
                    {lastSynced && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Synced: {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-between border-t border-slate-100 mt-2.5 pt-2 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-1 px-2 rounded whitespace-nowrap ${activeTab === 'dashboard' ? 'font-semibold text-slate-900 bg-slate-100' : 'text-slate-600'}`}
          >
            Coverage
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`py-1 px-2 rounded whitespace-nowrap ${activeTab === 'subjects' ? 'font-semibold text-slate-900 bg-slate-100' : 'text-slate-600'}`}
          >
            Syllabus
          </button>
          <button
            onClick={() => setActiveTab('weekly_plan')}
            className={`py-1 px-2 rounded whitespace-nowrap ${activeTab === 'weekly_plan' ? 'font-semibold text-slate-900 bg-slate-100' : 'text-slate-600'}`}
          >
            Weekly Plan
          </button>
          <button
            onClick={() => setActiveTab('revision')}
            className={`py-1 px-2 rounded whitespace-nowrap ${activeTab === 'revision' ? 'font-semibold text-slate-900 bg-slate-100' : 'text-slate-600'}`}
          >
            Revision {needsRevisionCount > 0 ? `(${needsRevisionCount})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`py-1 px-2 rounded whitespace-nowrap ${activeTab === 'news' ? 'font-semibold text-slate-900 bg-slate-100' : 'text-slate-600'}`}
          >
            News
          </button>
        </div>
      </div>
    </header>
  );
};
