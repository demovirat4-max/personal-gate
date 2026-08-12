import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PlaceholderView } from '@/components/shared/PlaceholderView';
import { QueryProvider } from '@/components/shared/QueryProvider';

describe('PlaceholderView Component Tests', () => {
  it('renders section title, description, and phase tag label inside QueryProvider', () => {
    render(
      <QueryProvider>
        <PlaceholderView
          title="Spaced Revision Hub"
          description="SuperMemo-2 active recall queue and card reviewer."
          phaseLabel="Phase 7 Surface"
        />
      </QueryProvider>
    );

    expect(screen.getByRole('heading', { name: /Spaced Revision Hub/i })).toBeInTheDocument();
    expect(screen.getByText(/Phase 7 Surface/i)).toBeInTheDocument();
    expect(screen.getByText(/Phase 1 Shell Active/i)).toBeInTheDocument();
  });
});
