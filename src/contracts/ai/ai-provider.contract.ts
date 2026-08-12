import { z } from 'zod';

export interface NormalizedAiRequest {
  requestId: string;
  capability: string;
  systemInstruction: string;
  groundedContext: string;
  userInput?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface NormalizedAiResponse {
  provider: string;
  model: string;
  requestId: string;
  output: string;
  finishReason: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostInr: number;
}

export interface NormalizedStreamChunk {
  type: 'ACCEPTED' | 'DELTA' | 'COMPLETED' | 'FAILED';
  deltaText?: string;
  finishReason?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostInr: number;
  };
  error?: string;
}
