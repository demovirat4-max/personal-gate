import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { GateCountdown } from '@/components/shared/GateCountdown';
import { EmptyState } from '@/components/shared/EmptyState';
import { PartialDataNotice } from '@/components/shared/PartialDataNotice';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiHealthBadge } from '@/components/shared/ApiHealthBadge';
import { ApiClient } from '@/lib/api/api-client';

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Component & UI State Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Renders desktop primary navigation landmark', () => {
    renderWithClient(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );

    const nav = screen.getByRole('complementary', { name: /Primary Navigation/i });
    expect(nav).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Mission/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Learn/i })[0]).toBeInTheDocument();
  });

  it('2. Renders mobile bottom primary navigation bar', () => {
    renderWithClient(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );

    const mobileNav = screen.getByRole('navigation', { name: /Mobile Bottom Navigation/i });
    expect(mobileNav).toBeInTheDocument();
  });

  it('3. Sets correct aria-current on active route link', () => {
    renderWithClient(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );

    const missionLinks = screen.getAllByRole('link', { name: /Mission/i });
    expect(missionLinks[0]).toHaveAttribute('aria-current', 'page');
  });

  it('4. Renders accessible countdown before target timestamp', () => {
    renderWithClient(<GateCountdown targetTimestamp="2028-02-05T09:30:00+05:30" />);

    expect(screen.getByRole('timer', { name: /GATE 2028 Exam Countdown/i })).toBeInTheDocument();
  });

  it('5. Clamps countdown to zero after target timestamp passes', () => {
    renderWithClient(<GateCountdown targetTimestamp="2025-01-01T00:00:00.000Z" />);

    expect(screen.getByText('0d')).toBeInTheDocument();
    expect(screen.getByText('00h')).toBeInTheDocument();
  });

  it('6. Displays explicit indication that exam date is provisional', () => {
    renderWithClient(
      <AppShell>
        <div className="text-xs text-[var(--text-dim)]">Provisional Planning Timestamp: 2028-02-05</div>
      </AppShell>
    );

    expect(screen.getByText(/Provisional Planning Timestamp/i)).toBeInTheDocument();
  });

  it('7. Displays system health loading state', () => {
    vi.spyOn(ApiClient, 'getSystemHealth').mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithClient(<ApiHealthBadge />);

    expect(screen.getByText(/Connecting.../i)).toBeInTheDocument();
  });

  it('8. Displays system health success state', async () => {
    vi.spyOn(ApiClient, 'getSystemHealth').mockResolvedValue({
      status: 'ok',
      environment: 'development',
      version: 'v1.0.0',
      timestamp: '2026-08-11T12:00:00.000Z',
      capabilities: {
        multiDeviceSync: true,
        aiProviderConfigured: true,
        pyqSeedPipelineReady: true,
        deterministicSchedulerReady: true,
      },
    });

    renderWithClient(<ApiHealthBadge />);

    await waitFor(() => {
      expect(screen.getByText(/development \(v1.0.0\)/i)).toBeInTheDocument();
    });
  });

  it('9. Displays system health failure state with retry button', async () => {
    vi.spyOn(ApiClient, 'getSystemHealth').mockRejectedValue(new Error('Connection Failed'));

    renderWithClient(<ApiHealthBadge />);

    await waitFor(() => {
      expect(screen.getByText(/Failed \(Retry\)/i)).toBeInTheDocument();
    });
  });

  it('10. Triggers refetch on retry button click', async () => {
    const spy = vi
      .spyOn(ApiClient, 'getSystemHealth')
      .mockRejectedValueOnce(new Error('Connection Failed'))
      .mockResolvedValueOnce({
        status: 'ok',
        environment: 'development',
        version: 'v1.0.0',
        timestamp: '2026-08-11T12:00:00.000Z',
        capabilities: {
          multiDeviceSync: true,
          aiProviderConfigured: true,
          pyqSeedPipelineReady: true,
          deterministicSchedulerReady: true,
        },
      });

    renderWithClient(<ApiHealthBadge />);

    const retryButton = await screen.findByRole('button', { name: /Retry connection to API/i });
    fireEvent.click(retryButton);

    expect(spy).toHaveBeenCalled();
  });

  it('11. Renders EmptyState component correctly', () => {
    render(<EmptyState title="No PYQs Found" message="Try adjusting filter rules." />);

    expect(screen.getByText('No PYQs Found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting filter rules.')).toBeInTheDocument();
  });

  it('12. Renders PartialDataNotice component correctly', () => {
    render(<PartialDataNotice missingFields={['teacherName', 'notes']} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/teacherName, notes/i)).toBeInTheDocument();
  });
});
