import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSystemHealth } from '@/hooks/use-system-health';
import { ApiClient, ApiClientError } from '@/lib/api/api-client';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = 'TestQueryWrapper';
  return Wrapper;
}

describe('useSystemHealth Hook Behavioral Proof', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('proves initial loading state and success resolution', async () => {
    vi.spyOn(ApiClient, 'getSystemHealth').mockResolvedValue({
      status: 'ok',
      environment: 'test',
      version: 'v1.0.0',
      timestamp: '2026-08-11T12:00:00.000Z',
      capabilities: {
        multiDeviceSync: true,
        aiProviderConfigured: true,
        pyqSeedPipelineReady: true,
        deterministicSchedulerReady: true,
      },
    });

    const { result } = renderHook(() => useSystemHealth(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.environment).toBe('test');
  });

  it('proves error state on recoverable failure without silent fixture fallback', async () => {
    vi.spyOn(ApiClient, 'getSystemHealth').mockRejectedValue(
      new ApiClientError('NETWORK_ERROR', 'Failed to reach API server')
    );

    const { result } = renderHook(() => useSystemHealth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });

    expect(result.current.error?.message).toBe('Failed to reach API server');
    expect(result.current.data).toBeUndefined();
  });
});
