import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3000').transform(Number),

  // Public Browser Variables
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default('https://example.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().default('placeholder-anon-key'),

  // Private Server Variables (Server side only)
  SUPABASE_SERVICE_ROLE_KEY: z.string().default('placeholder-service-key'),
  YOUTUBE_DATA_API_KEY: z.string().default('placeholder-yt-key'),
  AI_PROVIDER: z.enum(['nvidia', 'openai', 'ollama']).default('nvidia'),
  AI_PROVIDER_API_KEY: z.string().default('placeholder-ai-key'),
  AI_BASE_URL: z.string().url().default('https://integrate.api.nvidia.com/v1'),
  AI_MODEL_NAME: z.string().default('zzlm-5.2'),

  // AI Budget & Safeguards
  AI_MONTHLY_BUDGET_INR: z.string().default('1000.00').transform(Number),
  AI_DAILY_REQUEST_CEILING: z.string().default('100').transform(Number),
  AI_MAX_OUTPUT_TOKENS: z.string().default('1024').transform(Number),
  AI_REQUEST_TIMEOUT_MS: z.string().default('10000').transform(Number),
  AI_RETRY_LIMIT: z.string().default('1').transform(Number),
  AI_CONCURRENCY_LIMIT: z.string().default('3').transform(Number),
});

export type EnvConfig = z.infer<typeof EnvSchema>;
