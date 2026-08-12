import { z } from 'zod';

export const CapabilityTypeSchema = z.enum([
  'LESSON_SUMMARY',
  'STUDY_NOTES',
  'CONCEPT_EXPLANATION',
  'FLASHCARD_GENERATION',
  'MISTAKE_ANALYSIS',
  'AI_COACH',
]);

export type CapabilityType = z.infer<typeof CapabilityTypeSchema>;

export interface CapabilityDefinition {
  id: CapabilityType;
  displayName: string;
  maxOutputTokens: number;
  temperature: number;
  systemInstruction: string;
}

export const CAPABILITY_REGISTRY: Record<CapabilityType, CapabilityDefinition> = {
  LESSON_SUMMARY: {
    id: 'LESSON_SUMMARY',
    displayName: 'Lesson Summary',
    maxOutputTokens: 1024,
    temperature: 0.2,
    systemInstruction:
      'You are a GATE CS 2028 Academic Coach. Provide concise, grounded summaries using only provided lesson context. Do not invent formulas or external facts.',
  },
  STUDY_NOTES: {
    id: 'STUDY_NOTES',
    displayName: 'Structured Study Notes',
    maxOutputTokens: 1536,
    temperature: 0.3,
    systemInstruction:
      'Format output as structured markdown study notes with Headings, Key Definitions, and Core Formulas. Ground strictly in provided material.',
  },
  CONCEPT_EXPLANATION: {
    id: 'CONCEPT_EXPLANATION',
    displayName: 'Concept Explanation',
    maxOutputTokens: 1024,
    temperature: 0.4,
    systemInstruction:
      'Explain the requested concept clearly for GATE CS aspirants. Use step-by-step logic and mathematical clarity.',
  },
  FLASHCARD_GENERATION: {
    id: 'FLASHCARD_GENERATION',
    displayName: 'Flashcard Generation',
    maxOutputTokens: 1024,
    temperature: 0.3,
    systemInstruction:
      'Generate JSON structured flashcards (front/back) covering key terms and definitions from the grounded context.',
  },
  MISTAKE_ANALYSIS: {
    id: 'MISTAKE_ANALYSIS',
    displayName: 'Mistake Analysis',
    maxOutputTokens: 1024,
    temperature: 0.2,
    systemInstruction:
      'Analyze why the user selected an incorrect answer. Provide the conceptual error, correct logic, and a 1-sentence prevention rule.',
  },
  AI_COACH: {
    id: 'AI_COACH',
    displayName: 'GATE AI Coach',
    maxOutputTokens: 1024,
    temperature: 0.5,
    systemInstruction:
      'You are the personal GATE CS 2028 Command Center AI Coach. Answer student questions using current learning progress and Daily Mission context.',
  },
};
