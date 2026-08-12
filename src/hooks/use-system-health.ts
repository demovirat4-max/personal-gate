'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api/api-client';
import { SystemHealthData } from '@/contracts/system/health.contract';

export function useSystemHealth(options?: Partial<UseQueryOptions<SystemHealthData, Error>>) {
  return useQuery<SystemHealthData, Error>({
    queryKey: ['system-health'],
    queryFn: () => ApiClient.getSystemHealth(),
    staleTime: 60 * 1000,
    retry: false,
    ...options,
  });
}
