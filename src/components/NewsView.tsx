import React, { useState, useEffect } from 'react';
import { GroundingSource, NewsResponse } from '../types';
import { loadNewsCache, saveNewsCache } from '../utils/storage';
import { Gate2028Timer } from './Gate2028Timer';
import Markdown from 'react-markdown';
import {
  RefreshCw,
  ExternalLink,
  Loader2,
  Globe,
  Search,
} from 'lucide-react';

interface NewsViewProps {
  onNavigateToPlan?: () => void;
}

export const NewsView: React.FC<NewsViewProps> = ({ onNavigateToPlan }) => {
  const [newsData, setNewsData] = useState<NewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from cache on mount or auto-fetch
  useEffect(() => {
    const cached = loadNewsCache();
    if (cached) {
      setNewsData(cached);
    } else {
      fetchLatestNews();
    }
  }, []);

  const fetchLatestNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: NewsResponse = await response.json();
      setNewsData(data);
      saveNewsCache(data);
    } catch (err: any) {
      console.error('Fetch news error:', err);
      setError(err.message || 'Failed to fetch latest GATE news.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-900">
      {/* Running Countdown Timer till GATE 2028 Exam */}
      <Gate2028Timer onNavigateToPlan={onNavigateToPlan} />

      {/* News View Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Official GATE CSE updates
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Globe className="w-3 h-3 text-emerald-600" />
              Google Search Grounded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Real-time updates powered by Gemini 3.5 Flash and Google Search grounding for exam registration windows, admit cards, answer keys, scorecards, and COAP / CCMT admissions.
          </p>
        </div>

        <button
          id="btn-fetch-news"
          onClick={fetchLatestNews}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Searching web...' : 'Check for updates'}</span>
        </button>
      </div>

      {/* Sync Status Banner */}
      {newsData && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Last verified: {new Date(newsData.timestamp).toLocaleDateString()} at{' '}
              {new Date(newsData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {newsData.searchQueries && newsData.searchQueries.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-400">
              <Search className="w-3 h-3 text-slate-400 shrink-0" />
              <span>Grounded queries:</span>
              <div className="flex items-center gap-1">
                {newsData.searchQueries.slice(0, 3).map((query, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono text-[10px]">
                    {query}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center space-y-2 text-slate-500 text-xs shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin text-slate-700" />
          <span>Searching Google and official exam portals for recent GATE announcements...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs space-y-2">
          <span className="font-medium">Failed to load news updates</span>
          <p className="text-slate-500">{error}</p>
          <button
            onClick={fetchLatestNews}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 text-xs"
          >
            Retry
          </button>
        </div>
      ) : !newsData ? (
        <div className="text-center py-16 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <h3 className="text-xs font-medium text-slate-800">
            No cached news
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click "Check for updates" to search for the latest official GATE examination notifications in real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Digest Articles */}
          <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-semibold text-slate-900 pb-2 border-b border-slate-100">
              Exam notifications summary
            </h3>

            <div className="prose prose-slate prose-xs max-w-none text-slate-800 text-xs leading-relaxed">
              <div className="markdown-body [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&>h2]:text-slate-900 [&>h2]:text-xs [&>h2]:font-semibold [&>h2]:mt-4 [&>h2]:mb-2 [&>h3]:text-slate-800 [&>h3]:text-xs [&>h3]:font-medium [&>h3]:mt-3 [&>h3]:mb-1 [&>strong]:text-slate-900 [&>strong]:font-semibold [&>code]:bg-slate-100 [&>code]:px-1 [&>code]:rounded">
                <Markdown>{newsData.rawText}</Markdown>
              </div>
            </div>
          </div>

          {/* Grounding Citations & Official Portals */}
          <div className="space-y-4">
            {/* Grounding Source Links */}
            <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
              <h4 className="text-xs font-semibold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Verified Sources ({newsData.groundingSources.length})</span>
                <span className="text-[10px] text-slate-400 font-normal">via Google Search</span>
              </h4>

              {newsData.groundingSources.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Synthesized from official examination authority bulletins.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {newsData.groundingSources.map((src, i) => (
                    <a
                      key={i}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 rounded bg-slate-50 hover:bg-slate-100 text-xs transition-colors"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-slate-800 font-medium line-clamp-1">
                          {src.title || 'Official Announcement'}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      </div>
                      <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                        {src.uri.replace(/^https?:\/\//, '').split('/')[0]}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Quick GATE Portal References */}
            <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-2 shadow-xs">
              <h4 className="text-xs font-semibold text-slate-900 pb-2 border-b border-slate-100">
                Official portals
              </h4>
              <ul className="space-y-1 text-xs">
                <li>
                  <a
                    href="https://gate.iitr.ac.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-slate-700 hover:text-slate-900 p-1.5 rounded hover:bg-slate-50 transition-colors"
                  >
                    <span>GATE official portal</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://coap.iitd.ac.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-slate-700 hover:text-slate-900 p-1.5 rounded hover:bg-slate-50 transition-colors"
                  >
                    <span>COAP (IIT counselling)</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://ccmt.admissions.nic.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-slate-700 hover:text-slate-900 p-1.5 rounded hover:bg-slate-50 transition-colors"
                  >
                    <span>CCMT (NIT/IIIT admissions)</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
