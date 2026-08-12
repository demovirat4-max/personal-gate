import { NextResponse } from 'next/server';
import { MistakeService } from '@/server/services/mistake.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const mistakes = await MistakeService.getMistakes(status);
    return NextResponse.json({ success: true, data: mistakes, error: null });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: null, error: { message: err.message } }, { status: 500 });
  }
}
