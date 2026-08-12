import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { GateCountdown } from '@/components/shared/GateCountdown';
import { QueryProvider } from '@/components/shared/QueryProvider';

describe('GateCountdown Component Tests', () => {
  it('renders timer role and target exam text', () => {
    render(
      <QueryProvider>
        <GateCountdown targetTimestamp="2028-02-05T09:30:00+05:30" />
      </QueryProvider>
    );

    const timerElement = screen.getByRole('timer', { name: /GATE 2028 Exam Countdown/i });
    expect(timerElement).toBeInTheDocument();
    expect(screen.getByText(/GATE 2028:/i)).toBeInTheDocument();
  });
});
