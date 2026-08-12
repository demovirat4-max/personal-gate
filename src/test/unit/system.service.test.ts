import { describe, it, expect } from 'vitest';
import { SystemService } from '@/server/services/system.service';

describe('SystemService Unit Tests', () => {
  it('returns valid health data matching domain contract', async () => {
    const health = await SystemService.getHealth();
    expect(health.status).toBe('ok');
    expect(health.capabilities.multiDeviceSync).toBe(true);
    expect(health.capabilities.deterministicSchedulerReady).toBe(true);
  });
});
