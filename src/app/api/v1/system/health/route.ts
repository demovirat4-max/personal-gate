import { NextResponse } from 'next/server';
import { SystemService } from '@/server/services/system.service';
import { SystemHealthResponseSchema } from '@/contracts/system/health.contract';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const healthData = await SystemService.getHealth();

    const responsePayload = {
      success: true as const,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: randomUUID(),
        version: 'v1',
      },
      data: healthData,
      error: null,
    };

    // Server-side Zod validation against declared contract envelope
    const validatedResponse = SystemHealthResponseSchema.parse(responsePayload);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: randomUUID(),
          version: 'v1',
        },
        data: null,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Unknown server error',
        },
      },
      { status: 500 }
    );
  }
}
