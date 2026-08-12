'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  PersonalNote,
  CreatePersonalNoteInput,
  FormulaEntry,
  CreateFormulaEntryInput,
  Bookmark,
  CreateBookmarkInput,
  FlashcardDeck,
  CreateFlashcardDeckInput,
} from '@/contracts/knowledge/knowledge.contract';

export function usePersonalNotes() {
  return useQuery<PersonalNote[]>({
    queryKey: ['notes'],
    queryFn: () => apiClient.get<PersonalNote[]>('/api/v1/notes'),
  });
}

export function useCreatePersonalNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePersonalNoteInput) => apiClient.post<PersonalNote>('/api/v1/notes', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useFormulas() {
  return useQuery<FormulaEntry[]>({
    queryKey: ['formulas'],
    queryFn: () => apiClient.get<FormulaEntry[]>('/api/v1/formulas'),
  });
}

export function useCreateFormula() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFormulaEntryInput) => apiClient.post<FormulaEntry>('/api/v1/formulas', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulas'] });
    },
  });
}

export function useBookmarks() {
  return useQuery<Bookmark[]>({
    queryKey: ['bookmarks'],
    queryFn: () => apiClient.get<Bookmark[]>('/api/v1/bookmarks'),
  });
}

export function useCreateBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookmarkInput) => apiClient.post<Bookmark>('/api/v1/bookmarks', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}

export function useFlashcardDecks() {
  return useQuery<FlashcardDeck[]>({
    queryKey: ['flashcard-decks'],
    queryFn: () => apiClient.get<FlashcardDeck[]>('/api/v1/flashcard-decks'),
  });
}

export function useCreateFlashcardDeck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFlashcardDeckInput) => apiClient.post<FlashcardDeck>('/api/v1/flashcard-decks', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
    },
  });
}
