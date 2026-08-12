'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';

interface PlaceholderProps {
  title: string;
  description: string;
  phaseLabel: string;
}

export const PlaceholderView: React.FC<PlaceholderProps> = ({ title, description, phaseLabel }) => {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="p-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
          <div className="inline-block px-2.5 py-1 rounded text-xs font-mono bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30">
            {phaseLabel}
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-main)]">{title}</h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">{description}</p>
          <div className="pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-dim)] font-mono">
            Phase 1 Shell Active • Feature Backend & UI Scheduled for Future Phase
          </div>
        </div>
      </div>
    </AppShell>
  );
};
