import { SystemHealthData, SystemHealthDataSchema } from '@/contracts/system/health.contract';

export class SystemService {
  public static async getHealth(): Promise<SystemHealthData> {
    const healthData: SystemHealthData = {
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      version: 'v1.0.0',
      timestamp: new Date().toISOString(),
      capabilities: {
        multiDeviceSync: true,
        aiProviderConfigured: true,
        pyqSeedPipelineReady: true,
        deterministicSchedulerReady: true,
      },
    };

    // Server-side validation before returning to Route Handler
    return SystemHealthDataSchema.parse(healthData);
  }
}
