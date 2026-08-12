'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api/api-client';
import { CurriculumTreeResponse } from '@/contracts/curriculum/curriculum.contract';
import {
  ImportDryRunRequest,
  ImportDryRunResponse,
  ImportCommitRequest,
  ImportCommitResponse,
  ImportBatchSummary,
} from '@/contracts/curriculum/import.contract';

export function useCurriculumTree() {
  return useQuery<CurriculumTreeResponse, Error>({
    queryKey: ['curriculum-tree'],
    queryFn: () => ApiClient.getCurriculumTree(),
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useImportHistory() {
  return useQuery<ImportBatchSummary[], Error>({
    queryKey: ['import-history'],
    queryFn: () => ApiClient.getImportHistory(),
    staleTime: 30 * 1000,
    retry: false,
  });
}

export function useImportDryRunMutation() {
  return useMutation<ImportDryRunResponse, Error, ImportDryRunRequest>({
    mutationFn: (payload: ImportDryRunRequest) => ApiClient.importDryRun(payload),
  });
}

export function useImportCommitMutation() {
  const queryClient = useQueryClient();
  return useMutation<ImportCommitResponse, Error, ImportCommitRequest>({
    mutationFn: (payload: ImportCommitRequest) => ApiClient.importCommit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum-tree'] });
      queryClient.invalidateQueries({ queryKey: ['import-history'] });
    },
  });
}
