'use client';

import React from 'react';

interface PartialDataNoticeProps {
  missingFields: string[];
}

export const PartialDataNotice: React.FC<PartialDataNoticeProps> = ({ missingFields }) => {
  return (
    <div
      className="p-3 rounded-lg bg-[var(--status-warning)]/10 border border-[var(--status-warning)]/30 text-xs space-y-1 text-[var(--status-warning)]"
      role="status"
    >
      <div className="font-semibold">Partial Data Notice</div>
      <div className="text-[11px] text-[var(--text-muted)]">
        The following attributes are currently missing or unconfigured: {missingFields.join(', ')}.
      </div>
    </div>
  );
};
