'use client';

import React, { useState } from 'react';
import { useUpdateProgress, useMarkComplete } from '@/hooks/use-learning';

interface YouTubePlayerProps {
  videoId: string;
  lessonId: string;
  initialSeconds?: number;
  onEnded?: () => void;
}

export function YouTubePlayer({ videoId, lessonId, initialSeconds = 0, onEnded }: YouTubePlayerProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const markCompleteMutation = useMarkComplete(lessonId);

  // Extract clean ID from full URLs or playlist parameters
  let cleanId = videoId;
  const listMatch = videoId.match(/list=([a-zA-Z0-9_-]+)/);
  if (listMatch) {
    cleanId = listMatch[1];
  } else {
    const vMatch = videoId.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    if (vMatch) cleanId = vMatch[1];
  }

  const isPlaylist = cleanId.startsWith('PL') || cleanId.length > 11;

  const embedUrl = isPlaylist
    ? `https://www.youtube.com/embed/videoseries?list=${cleanId}&autoplay=0`
    : `https://www.youtube.com/embed/${cleanId}?autoplay=0&rel=0`;

  const externalUrl = isPlaylist
    ? `https://www.youtube.com/playlist?list=${cleanId}`
    : `https://www.youtube.com/watch?v=${cleanId}`;

  const handleMarkComplete = () => {
    setIsCompleted(true);
    markCompleteMutation.mutate();
    if (onEnded) onEnded();
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl space-y-0">
      {/* Video / Playlist Embedded Player */}
      <div className="relative aspect-video w-full bg-slate-950">
        <iframe
          src={embedUrl}
          title="Embedded YouTube Video Player"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      <div className="p-4 bg-slate-900 flex items-center justify-between border-t border-slate-800/60 flex-wrap gap-3">
        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <span className="px-2.5 py-1 bg-slate-800 rounded-md font-mono text-cyan-400">
            {isPlaylist ? '▶ Playlist Mode' : '▶ Video Player'}
          </span>
          <span>•</span>
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-semibold underline flex items-center space-x-1"
          >
            <span>Open in YouTube</span>
            <span>↗</span>
          </a>
        </div>

        <button
          onClick={handleMarkComplete}
          disabled={markCompleteMutation.isPending || isCompleted}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition ${
            isCompleted
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border-cyan-500/30'
          }`}
        >
          {markCompleteMutation.isPending ? 'Saving...' : isCompleted ? '✓ Completed' : 'Mark Completed'}
        </button>
      </div>
    </div>
  );
}
