'use client';

import React from 'react';
import { useSystemHealth } from '@/hooks/use-system-health';
import { Server, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const ApiHealthBadge: React.FC = () => {
  const { data: health, isLoading, error, refetch, isFetching } = useSystemHealth();

  return (
    <div
      className="flex items-center gap-2 px-2.5 py-1 rounded-md text-xs border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
      data-testid="api-health-badge"
      aria-live="polite"
    >
      <Server className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
      <span className="text-[var(--text-dim)] hidden md:inline">BFF API:</span>

      {(isLoading || isFetching) && (
        <span className="flex items-center gap-1 text-[var(--text-muted)]">
          <RefreshCw className="w-3 h-3 animate-spin" aria-hidden="true" />
          <span>Connecting...</span>
        </span>
      )}

      {error && !isLoading && !isFetching && (
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1 text-[var(--status-danger)] hover:underline focus:outline-none focus:ring-1 focus:ring-[var(--status-danger)] rounded"
          title={`Retry API connection (${error.message})`}
          aria-label="Retry connection to API"
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Failed (Retry)</span>
        </button>
      )}

      {health && !isLoading && !isFetching && !error && (
        <span className="flex items-center gap-1.5 text-[var(--status-success)] font-medium">
          <CheckCircle2 className="w-3 h-3" />
          <span>
            {health.environment} ({health.version})
          </span>
        </span>
      )}
    </div>
  );
};
