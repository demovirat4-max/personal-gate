'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  message = 'There is currently no information to display for this section.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="p-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center space-y-3">
      <h3 className="text-base font-semibold text-[var(--text-main)]">{title}</h3>
      <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-3 py-1.5 rounded bg-[var(--accent-cyan)] text-[#060913] text-xs font-medium hover:opacity-90 transition-opacity"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
