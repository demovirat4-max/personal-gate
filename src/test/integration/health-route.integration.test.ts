import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/v1/system/health/route';

describe('Real Route Handler Integration Test - /api/v1/system/health', () => {
  it('executes Route Handler through service and returns 200 JSON envelope', async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.meta).toBeDefined();
    expect(json.meta.requestId).toBeDefined();
    expect(json.meta.version).toBe('v1');
    expect(json.data.status).toBe('ok');
    expect(json.data.capabilities.multiDeviceSync).toBe(true);
    expect(json.data.capabilities.deterministicSchedulerReady).toBe(true);
    expect(json.error).toBeNull();
  });
});
