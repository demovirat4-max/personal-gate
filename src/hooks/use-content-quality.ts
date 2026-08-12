'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ContentSource, CreateContentSourceInput, ContentQualityIssue } from '@/contracts/content/content.contract';
import { ContentCoverageSnapshot } from '@/server/ai/pure-coverage.engine';

export function useContentSources() {
  return useQuery<ContentSource[]>({
    queryKey: ['content-sources'],
    queryFn: () => apiClient.get<ContentSource[]>('/api/v1/content/sources'),
  });
}

export function useCreateContentSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateContentSourceInput) => apiClient.post<ContentSource>('/api/v1/content/sources', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-sources'] });
    },
  });
}

export function useContentQualityIssues() {
  return useQuery<ContentQualityIssue[]>({
    queryKey: ['content-quality-issues'],
    queryFn: () => apiClient.get<ContentQualityIssue[]>('/api/v1/content/quality/issues'),
  });
}

export function useContentCoverage() {
  return useQuery<ContentCoverageSnapshot>({
    queryKey: ['content-coverage'],
    queryFn: () => apiClient.get<ContentCoverageSnapshot>('/api/v1/content/coverage'),
  });
}
