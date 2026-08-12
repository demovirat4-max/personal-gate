import { NextResponse } from 'next/server';
import { RevisionService } from '@/server/services/revision.service';

export async function POST(req: Request, { params }: { params: Promise<{ revisionId: string }> }) {
  try {
    const { revisionId } = await params;
    const body = await req.json();
    const updated = await RevisionService.completeReview(revisionId, body);
    return NextResponse.json({ success: true, data: updated, error: null });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: null, error: { message: err.message } }, { status: 500 });
  }
}
