'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface GateCountdownProps {
  targetTimestamp: string;
}

export const GateCountdown: React.FC<GateCountdownProps> = ({ targetTimestamp }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetTimestamp).getTime();
      const now = new Date().getTime();
      const difference = Math.max(0, target - now);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  return (
    <div
      className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]"
      role="timer"
      aria-label="GATE 2028 Exam Countdown"
    >
      <Clock className="w-4 h-4 text-[var(--accent-cyan)] shrink-0" aria-hidden="true" />
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-[var(--text-dim)] uppercase tracking-wider hidden sm:inline">GATE 2028:</span>
        <span className="text-[var(--text-main)] font-semibold">{timeLeft.days}d</span>
        <span className="text-[var(--text-muted)]">:</span>
        <span className="text-[var(--text-main)] font-semibold">{String(timeLeft.hours).padStart(2, '0')}h</span>
        <span className="text-[var(--text-muted)]">:</span>
        <span className="text-[var(--text-main)] font-semibold">{String(timeLeft.minutes).padStart(2, '0')}m</span>
        <span className="text-[var(--text-muted)]">:</span>
        <span className="text-[var(--text-main)] font-semibold text-[var(--accent-cyan)]">
          {String(timeLeft.seconds).padStart(2, '0')}s
        </span>
      </div>
    </div>
  );
};
