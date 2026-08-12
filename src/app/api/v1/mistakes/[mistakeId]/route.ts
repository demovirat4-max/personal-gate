import { NextResponse } from 'next/server';
import { MistakeService } from '@/server/services/mistake.service';

export async function PATCH(req: Request, { params }: { params: Promise<{ mistakeId: string }> }) {
  try {
    const { mistakeId } = await params;
    const body = await req.json();
    const updated = await MistakeService.updateMistake(mistakeId, body);
    return NextResponse.json({ success: true, data: updated, error: null });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: null, error: { message: err.message } }, { status: 500 });
  }
}
