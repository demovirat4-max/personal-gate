# Frontend / Backend Vertical Slice Proof

## 1. End-to-End Vertical Flow Architecture

```text
ApiHealthBadge (UI Component)
  │
  ├──> useSystemHealth() (TanStack React Query Hook)
  │      │
  │      └──> ApiClient.getSystemHealth() (Typed Client API Infrastructure)
  │             │
  │             └──> fetch('/api/v1/system/health')
  │                    │
  │                    └──> Next.js Route Handler (src/app/api/v1/system/health/route.ts)
  │                           │
  │                           └──> SystemService.getHealth() (Domain Service)
  │                                  │
  │                                  └──> SystemHealthDataSchema.parse() (Zod Validation)
  │                                         │
  │                                         └──> ApiResponseEnvelopeSchema.parse() (Envelope Validation)
```

## 2. Route Handler Integration Verification

The integration test `src/test/integration/health-route.integration.test.ts` invokes the exported Next.js `GET` Route Handler directly and proves:

1. **HTTP Status Code**: 200 OK.
2. **Content-Type**: `application/json; charset=utf-8`.
3. **Response Envelope Structure**: Contains `success: true`, `data`, `error: null`, `meta`.
4. **Contract / API Version**: `v1.0.0`.
5. **ISO Server Timestamp**: ISO 8601 string format (`timestamp`).
6. **Environment Label**: Safe public label (`development`/`test`).
7. **Capabilities Object**: Contains `multiDeviceSync`, `aiProviderConfigured`, `pyqSeedPipelineReady`, and `deterministicSchedulerReady`.
8. **Absence of Secrets**: `SUPABASE_SERVICE_ROLE_KEY`, `AI_PROVIDER_API_KEY`, and `YOUTUBE_DATA_API_KEY` are strictly excluded from response body.
9. **Absence of Infrastructure Leaks**: Zero stack traces or internal server paths exposed.
10. **Error Handing & Safe Recovery**: In case of service exception, returns 500 error envelope without crashing process.
