# API Contract Standard & Type Boundary Specification

## 1. Non-Negotiable Contract Architecture

1. **Single Source of Truth**: All API interfaces, request payloads, response bodies, and error structures are declared as **Zod schemas**. TypeScript types are strictly inferred using `z.infer<typeof Schema>`. No handwritten interfaces are permitted.
2. **Centralized Typed API Client**: Direct `fetch()` calls inside React components or hooks are forbidden. All client communication goes through a strongly-typed `ApiClient` wrapper that parses every incoming backend response with Zod before returning data to the UI.
3. **No Direct Supabase Table Access**: Frontend components never issue direct queries (`supabase.from('table').select()`). Database access is strictly confined to server-side repositories inside Next.js Route Handlers.

## 2. Standard API Response Envelope

Every Next.js Route Handler must return HTTP responses matching the standardized `ApiResponse<T>` JSON envelope structure.

```typescript
// Shared Zod Contract Definition (src/contracts/common/api-envelope.contract.ts)
import { z } from 'zod';

export const ApiMetaSchema = z.object({
  timestamp: z.string().datetime(),
  requestId: z.string().uuid(),
  version: z.string().default('v1'),
});

export const ApiErrorDetailSchema = z.object({
  code: z.string(), // Stable machine-readable code (e.g. 'UNAUTHORIZED', 'VALIDATION_ERROR', 'LECTURE_NOT_FOUND')
  message: z.string(), // Safe human-readable message
  field: z.string().optional(), // For field-level validation errors
  details: z.record(z.unknown()).optional(),
});

export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    meta: ApiMetaSchema,
    data: dataSchema.nullable(),
    error: ApiErrorDetailSchema.nullable(),
  });
}
```

## 3. Stable Machine-Readable Error Codes Catalog

| Category | Error Code | HTTP Status | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `UNAUTHORIZED` | 401 | Missing or invalid JWT session token. |
| **Auth** | `FORBIDDEN` | 403 | User lacks permission to access resource. |
| **Validation** | `VALIDATION_ERROR` | 400 | Request body, query, or path params failed Zod schema check. |
| **Validation** | `INVALID_CSV_HEADER` | 422 | Importer detected invalid column headers. |
| **Resource** | `NOT_FOUND` | 404 | Target database entity does not exist. |
| **Conflict** | `DUPLICATE_RESOURCE` | 409 | Resource already exists (e.g. video ID already in syllabus). |
| **External** | `YOUTUBE_API_ERROR` | 502 | Upstream YouTube Data API request failed. |
| **External** | `AI_PROVIDER_ERROR` | 502 | Upstream AI provider request failed. |
| **Server** | `INTERNAL_SERVER_ERROR`| 500 | Unhandled server exception. |

## 4. Frontend Typed API Client Specification

```typescript
// src/lib/api/api-client.ts (Conceptual Pattern)
import { z } from 'zod';

export class ApiClient {
  private static async request<T>(
    path: string,
    options: RequestInit,
    responseSchema: z.ZodType<T>
  ): Promise<T> {
    const res = await fetch(`/api/v1${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const json = await res.json();
    
    // Runtime Response Validation (Prevents silent backend-frontend contract drift)
    const parsedEnvelope = createApiResponseSchema(responseSchema).safeParse(json);
    
    if (!parsedEnvelope.success) {
      throw new Error(`API Contract Violation at ${path}: ${parsedEnvelope.error.message}`);
    }

    if (!parsedEnvelope.data.success || parsedEnvelope.data.error) {
      throw new ApiClientError(parsedEnvelope.data.error!);
    }

    return parsedEnvelope.data.data as T;
  }
}
```
