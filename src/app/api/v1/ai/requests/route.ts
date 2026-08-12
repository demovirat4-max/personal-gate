import { NextResponse } from 'next/server';
import { AiOrchestratorService } from '@/server/services/ai-orchestrator.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await AiOrchestratorService.executeRequest(body);
    return NextResponse.json({ success: true, data: result, error: null });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: null, error: { message: err.message } }, { status: 500 });
  }
}
