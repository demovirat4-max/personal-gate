import { NormalizedAiRequest, NormalizedAiResponse, NormalizedStreamChunk } from '@/contracts/ai/ai-provider.contract';

export interface AiProvider {
  id: string;
  generate(request: NormalizedAiRequest): Promise<NormalizedAiResponse>;
  stream(request: NormalizedAiRequest, signal?: AbortSignal): AsyncIterable<NormalizedStreamChunk>;
}
