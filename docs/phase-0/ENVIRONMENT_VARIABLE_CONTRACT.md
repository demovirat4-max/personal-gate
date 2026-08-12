# Environment Variable Contract Specification

## 1. Environment Variable Schema (Zod Source of Truth)

All environment variables are validated at server startup using Zod (`src/contracts/common/env.contract.ts`). If any variable is missing or malformed, the process immediately exits with a clear error report.

```typescript
import { z } from 'zod';

export const EnvSchema = z.object({
  // Node / Runtime Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('3000'),

  // Public Browser Variables (NEXT_PUBLIC_)
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // Private Server Variables (NEVER exposed to browser)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  // External APIs
  YOUTUBE_DATA_API_KEY: z.string().min(1),
  
  // Provider-Independent AI Configuration (ZZLM 5.2 via NVIDIA NIM Default)
  AI_PROVIDER: z.enum(['nvidia', 'openai', 'ollama']).default('nvidia'),
  AI_PROVIDER_API_KEY: z.string().min(1),
  AI_BASE_URL: z.string().url().default('https://integrate.api.nvidia.com/v1'),
  AI_MODEL_NAME: z.string().default('zzlm-5.2'),
  
  // AI Budget & Safeguard Controls (Configurable, Not Hardcoded)
  AI_MONTHLY_BUDGET_INR: z.string().transform(Number).default('1000.00'),
  AI_DAILY_REQUEST_CEILING: z.string().transform(Number).default('100'),
  AI_MAX_OUTPUT_TOKENS: z.string().transform(Number).default('1024'),
  AI_REQUEST_TIMEOUT_MS: z.string().transform(Number).default('10000'),
  AI_RETRY_LIMIT: z.string().transform(Number).default('1'),
  AI_CONCURRENCY_LIMIT: z.string().transform(Number).default('3'),

  // Test Environment Flags
  TEST_DATABASE_URL: z.string().url().optional(),
});
```

## 2. Strict Security Boundaries

* Variables prefixed with `NEXT_PUBLIC_` are safely bundled into client JS.
* `SUPABASE_SERVICE_ROLE_KEY`, `YOUTUBE_DATA_API_KEY`, and `AI_PROVIDER_API_KEY` are **strictly server-side**. If any component attempts to import these on the client, Next.js build step triggers a fatal compilation error.
